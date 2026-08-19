from .competition_data import COMPETITIONS
import os
import json
from .cloudinary_utils import destroy_asset
from django.db import transaction
from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Team, Member, TeamFile, MemberFile, OtherInfo, ChatDocument, ChatSession
from .serializers import (
    TeamSerializer, MemberSerializer, TeamFileSerializer,
    MemberFileSerializer, OtherInfoSerializer, LoginSerializer,
    RegisterSerializer, RekeningSerializer
)
from . import chat_services
from . import competition_data as compdata

User = get_user_model()

VALID_TEAM_FILE_TYPES = [c[0] for c in TeamFile.FILE_TYPE_CHOICES]


# ─────────────────────────────────────────────────────────────────────────────
# Helper: get the authenticated user's team or return 404 Response
# ─────────────────────────────────────────────────────────────────────────────
def _get_team_or_error(request):
    try:
        team = Team.objects.select_related('captain').get(captain=request.user)
        return team, None
    except Team.DoesNotExist:
        return None, Response(
            {"error": "Tim tidak ditemukan untuk akun ini."},
            status=status.HTTP_404_NOT_FOUND
        )


def _freeze_check(team):
    """Return an error response if the team is frozen (SUBMITTED / ACCEPTED), else None."""
    if team.regis_status in ('SUBMITTED', 'ACCEPTED'):
        return Response(
            {"error": "Data sedang terkunci. Batalkan pengiriman terlebih dahulu."},
            status=status.HTTP_403_FORBIDDEN
        )
    return None


_SPORT_SPECIFIC_FIELDS = ('tempat_lahir', 'berat_badan', 'tinggi_badan', 'role', 'subkategori')


def _extract_member_payload(data, existing=None):
    """
    Normalize a member submission (add or edit) into the shape
    MemberSerializer expects: sport-specific fields promoted out of
    dynamic_data into their own keys, everything else left in dynamicFields.
    `existing` is the current Member (for edit — fills in fields not resent).
    Accepts a plain JSON dict; 'files' (if present) is handled separately
    by `_save_member_files`, not passed through to the serializer.
    """
    data = dict(data)
    data.pop('files', None)

    dynamic_data = dict((existing.dynamic_data or {}) if existing else {})
    if 'dynamic_data' in data:
        raw = data.pop('dynamic_data')
        if isinstance(raw, str):
            try:
                dynamic_data = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                pass
        elif isinstance(raw, dict):
            dynamic_data = raw

    def field(name, default=''):
        if name in data:
            return data.get(name)
        if name in dynamic_data:
            return dynamic_data.pop(name)
        if existing is not None:
            return getattr(existing, name)
        return default

    payload = {
        'nama': field('nama'),
        'email': field('email'),
        'nomor_telepon': field('nomor_telepon'),
        'tanggal_lahir': data.get('tanggal_lahir') or (existing.tanggal_lahir if existing else None),
        'gender': field('gender'),
        'kelas': field('kelas'),
        'nisn': field('nisn'),
    }
    for name in _SPORT_SPECIFIC_FIELDS:
        payload[name] = field(name, default='')

    for name in ('berat_badan', 'tinggi_badan'):
        payload[name] = payload[name] or None

    payload['dynamicFields'] = dynamic_data
    return payload

def _save_member_files(member, files_payload):
    """
    Record member-level files that were already uploaded client-side to
    Cloudinary via the unsigned upload widget. `files_payload` is expected
    to be a dict like:
        { "akte": {"url": "...", "public_id": "...", "format": "pdf"}, ... }
    """
    if not isinstance(files_payload, dict):
        return

    for file_type, info in files_payload.items():
        if not isinstance(info, dict):
            continue
        url = info.get('url')
        if not url:
            continue

        # Replacing an existing file: clean up the old asset on Cloudinary
        # first so it doesn't linger as an orphaned upload.
        existing = MemberFile.objects.filter(member=member, file_type=file_type).first()
        if existing and existing.public_id and existing.public_id != info.get('public_id'):
            destroy_asset(existing.public_id)

        MemberFile.objects.update_or_create(
            member=member,
            file_type=file_type,
            defaults={
                'file_url': url,
                'public_id': info.get('public_id', ''),
                'file_format': (info.get('format') or '').lower(),
            }
        )

# ─────────────────────────────────────────────────────────────────────────────
# COMPETITION METADATA PAYLOAD
# ─────────────────────────────────────────────────────────────────────────────
class CompetitionMetadataView(views.APIView):
    """
    GET /api/regis/competitions/
    Return registration metadata for every competition.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(COMPETITIONS)

# ─────────────────────────────────────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────────────────────────────────────
class LoginView(views.APIView):
    """
    POST /api/regis/login
    Authenticate with email + password. Returns JWT tokens and team profile.
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response(
                {"error": "Email atau password salah."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_external:
            return Response(
                {"error": "Akun ini bukan akun pendaftaran tim."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        # Fetch team profile
        try:
            team = Team.objects.select_related('captain').get(captain=user)
            team_data = TeamSerializer(team).data
        except Team.DoesNotExist:
            team_data = None

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "team": team_data
        })


class RegisterView(views.APIView):
    """
    POST /api/regis/register
    Two-step registration combined into one endpoint.
    Creates the User account (is_external=True) and the Team record.
    Returns JWT tokens so the user is auto-logged-in.
    """
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        d = serializer.validated_data
        email = d['email'].lower().strip()

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain."},
                status=status.HTTP_409_CONFLICT
            )

        # User + Team + the representative's own roster row are created
        # together — if any step fails, none of it should be left behind.
        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=d['password'],
                phone_number=d['phone'],
                is_external=True,
                username=email.split('@')[0],
            )

            team = Team.objects.create(
                captain=user,
                nama_tim=d['nama_tim'],
                school=d['school'],
                phone=d['phone'],
                competition=d['competition'],
                jenjang=d['jenjang'],
            )

            # The person who signed up is automatically part of the roster.
            # `user` links this row back to their account so it can't be
            # deleted by its own owner (see DeleteMemberView) and can't be
            # duplicated (OneToOneField enforces one representative row).
            Member.objects.create(
                team=team,
                user=user,
                email=email,
                nomor_telepon=d['phone'],
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "team": TeamSerializer(team).data,
        }, status=status.HTTP_201_CREATED)


class LogoutView(views.APIView):
    """
    POST /api/regis/logout
    Blacklist the refresh token to log out.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response({"message": "Berhasil logout."})


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────
class DashboardView(views.APIView):
    """
    GET /api/regis/dashboard
    Return full team profile including members, files, and other_info.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err
        return Response(TeamSerializer(team).data)


# ─────────────────────────────────────────────────────────────────────────────
# MEMBERS
# ─────────────────────────────────────────────────────────────────────────────
class AddMemberView(views.APIView):
    """
    POST /api/regis/add_member
    Create a new member with dynamic fields and optional file references.
    Expects JSON — file fields are Cloudinary widget results, e.g.:
        { "nama": "...", ..., "files": { "akte": {"url": "...", ...} } }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        file_errors = _validate_member_files_payload(request.data.get('files'))
        if file_errors:
           return Response({'files': file_errors}, status=status.HTTP_400_BAD_REQUEST)

        payload = _extract_member_payload(request.data)

        serializer = MemberSerializer(data=payload, context={'team': team})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        member = Member.objects.create(team=team, **serializer.validated_data)

        _save_member_files(member, request.data.get('files'))

        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)


class EditMemberView(views.APIView):
    """
    PUT /api/regis/edit_member/<int:member_id>
    Update an existing member's data and optionally replace their files.
    Expects JSON, same shape as AddMemberView.
    """
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, member_id):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        file_errors = _validate_member_files_payload(request.data.get('files'))
        if file_errors:
           return Response({'files': file_errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = Member.objects.get(id=member_id, team=team)
        except Member.DoesNotExist:
            return Response({"error": "Anggota tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)

        payload = _extract_member_payload(request.data, existing=member)

        serializer = MemberSerializer(member, data=payload, context={'team': team})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()

        _save_member_files(member, request.data.get('files'))

        return Response(MemberSerializer(member).data)


class DeleteMemberView(views.APIView):
    """
    DELETE /api/regis/delete_member/<int:member_id>
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, member_id):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        try:
            member = Member.objects.get(id=member_id, team=team)
        except Member.DoesNotExist:
            return Response({"error": "Anggota tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)

        if member.user_id == request.user.id:
            return Response(
                {"error": "Tidak dapat menghapus data diri sendiri sebagai perwakilan tim."},
                status=status.HTTP_403_FORBIDDEN
            )

        member.delete()
        return Response({"message": "Anggota berhasil dihapus."})


# ─────────────────────────────────────────────────────────────────────────────
# TEAM FILES
# ─────────────────────────────────────────────────────────────────────────────
ALLOWED_FORMATS_BY_TYPE = {
    'pembayaran': ('pdf', 'png', 'jpg', 'jpeg'),
}
DEFAULT_ALLOWED_FORMATS = ('pdf',)


class UploadTeamFileView(views.APIView):
    """
    POST /api/regis/upload/<file_type>
    Record a team-level file that was already uploaded client-side to
    Cloudinary via the unsigned upload widget. Expects JSON:
        { "url": "...", "public_id": "...", "format": "pdf" }
    Accepts PDF for most types; 'pembayaran' also accepts PNG/JPG.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, file_type):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        if file_type not in VALID_TEAM_FILE_TYPES:
            return Response({"error": f"Tipe file '{file_type}' tidak valid."}, status=status.HTTP_400_BAD_REQUEST)

        file_url = request.data.get('url')
        public_id = request.data.get('public_id', '')
        file_format = (request.data.get('format') or '').lower()

        if not file_url:
            return Response({"error": "URL file wajib disertakan."}, status=status.HTTP_400_BAD_REQUEST)

        allowed_formats = ALLOWED_FORMATS_BY_TYPE.get(file_type, DEFAULT_ALLOWED_FORMATS)
        if file_format and file_format not in allowed_formats:
            return Response(
                {"error": f"Format '{file_format}' tidak didukung untuk tipe berkas ini."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Replacing an existing file: clean up the old asset on Cloudinary
        # first so it doesn't linger as an orphaned upload.
        existing = TeamFile.objects.filter(team=team, file_type=file_type).first()
        if existing and existing.public_id:
            destroy_asset(existing.public_id)

        obj, created = TeamFile.objects.update_or_create(
            team=team,
            file_type=file_type,
            defaults={'file_url': file_url, 'public_id': public_id, 'file_format': file_format}
        )

        return Response(TeamFileSerializer(obj).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class DeleteTeamFileView(views.APIView):
    """
    DELETE /api/regis/delete_file/<file_type>
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, file_type):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        try:
            team_file = TeamFile.objects.get(team=team, file_type=file_type)
        except TeamFile.DoesNotExist:
            return Response({"error": "File tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the asset on Cloudinary (requires a signed API call, which
        # is fine — the API secret lives server-side only).
        if team_file.public_id:
            try:
                cloudinary.uploader.destroy(team_file.public_id, resource_type='auto')
            except Exception:
                pass  # don't block the DB delete if Cloudinary cleanup fails

        team_file.delete()
        return Response({"message": f"File '{file_type}' berhasil dihapus."})


# ─────────────────────────────────────────────────────────────────────────────
# TEAM INFO (OtherInfo)
# ─────────────────────────────────────────────────────────────────────────────
class SaveTeamInfoView(views.APIView):
    """
    POST /api/regis/add_info
    Save or update team-level dynamic metadata (e.g. coach name, coach email).
    Expects JSON: { "key1": "value1", "key2": "value2", ... }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        data = request.data
        if not isinstance(data, dict):
            return Response({"error": "Data harus berupa objek JSON."}, status=status.HTTP_400_BAD_REQUEST)

        for key, value in data.items():
            OtherInfo.objects.update_or_create(
                team=team,
                key=key,
                defaults={'value': str(value)}
            )

        infos = OtherInfo.objects.filter(team=team)
        return Response(OtherInfoSerializer(infos, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# SUBMIT / UNSUBMIT
# ─────────────────────────────────────────────────────────────────────────────
class SubmitRegistrationView(views.APIView):
    """
    POST /api/regis/submit
    Validate and submit the registration (changes status to SUBMITTED).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err

        if team.regis_status not in ('PENDING', 'REVIEWED'):
            return Response(
                {"error": f"Status '{team.regis_status}' tidak mengizinkan pengiriman."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate: all 5 team files must be uploaded
        required_file_types = {c[0] for c in TeamFile.FILE_TYPE_CHOICES}
        uploaded_types = set(TeamFile.objects.filter(team=team).values_list('file_type', flat=True))
        missing_files = required_file_types - uploaded_types
        if missing_files:
            return Response(
                {"error": f"File tim wajib belum lengkap. Yang belum diunggah: {', '.join(missing_files)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate: roster size against the real per-sport min/max
        member_count = team.members.count()
        rng = compdata.player_range(team.competition, team.jenjang)
        if rng:
            min_players, max_players = rng
            if member_count < min_players or member_count > max_players:
                return Response(
                    {"error": f"Jumlah anggota tim harus antara {min_players}-{max_players} orang untuk cabang ini. Saat ini: {member_count}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif member_count < 1:
            # Competition/jenjang not found in metadata — fall back to the
            # bare minimum rather than blocking submission entirely.
            return Response(
                {"error": "Tambahkan minimal 1 anggota tim terlebih dahulu."},
                status=status.HTTP_400_BAD_REQUEST
            )

        team.regis_status = 'SUBMITTED'
        team.save()

        return Response(TeamSerializer(team).data)


class UnsubmitRegistrationView(views.APIView):
    """
    POST /api/regis/unsubmit
    Revert registration status from SUBMITTED/REVIEWED back to PENDING.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err

        if team.regis_status not in ('SUBMITTED', 'REVIEWED'):
            return Response(
                {"error": f"Status '{team.regis_status}' tidak dapat ditarik kembali."},
                status=status.HTTP_403_FORBIDDEN
            )

        team.regis_status = 'PENDING'
        team.save()

        return Response(TeamSerializer(team).data)


# ─────────────────────────────────────────────────────────────────────────────
# REKENING
# ─────────────────────────────────────────────────────────────────────────────
class UpdateRekeningView(views.APIView):
    """
    POST /api/regis/update-rekening
    Update bank account info for WO Money refund. Only allowed during PENDINGTF.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err

        if team.regis_status != 'PENDINGTF':
            return Response(
                {"error": "Data rekening hanya dapat diisi saat status PENDINGTF."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = RekeningSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        team.bank_name = serializer.validated_data['bank_name']
        team.account_number = serializer.validated_data['account_number']
        team.account_holder = serializer.validated_data['account_holder']
        team.save()

        return Response(TeamSerializer(team).data)


# ─────────────────────────────────────────────────────────────────────────────
# SUBKATEGORI
# ─────────────────────────────────────────────────────────────────────────────
class SaveSubkategoriView(views.APIView):
    """
    POST /api/regis/save-subkategori
    Update the subkategori field for a specific member.
    Expects JSON: { "member_id": <int>, "subkategori": "<value>" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err

        member_id = request.data.get('member_id')
        subkategori = request.data.get('subkategori', '')

        if not member_id:
            return Response({"error": "member_id wajib disertakan."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            member = Member.objects.get(id=member_id, team=team)
        except Member.DoesNotExist:
            return Response({"error": "Anggota tidak ditemukan."}, status=status.HTTP_404_NOT_FOUND)

        member.subkategori = subkategori
        member.save()

        return Response(MemberSerializer(member).data)


# ─────────────────────────────────────────────────────────────────────────────
# AI CHAT CONSULTANT
# ─────────────────────────────────────────────────────────────────────────────
def _get_active_documents():
    """Return list of {name, filename, text} for all active ChatDocuments."""
    docs = ChatDocument.objects.filter(is_active=True).exclude(extracted_text='')
    return [{'name': d.name, 'filename': d.filename, 'text': d.extracted_text} for d in docs]


def _get_or_create_chat_session(team):
    """Return (ChatSession, created) for the given team."""
    session, created = ChatSession.objects.get_or_create(
        team=team,
        defaults={
            'chat_history': [],
            'token_usage': 0,
            'token_cap': chat_services.DEFAULT_TOKEN_CAP,
        }
    )
    return session, created


class ChatStatusView(views.APIView):
    """
    GET /api/regis/chat/status/
    Return chat session status: token usage, cap, and document count.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err

        session, _ = _get_or_create_chat_session(team)
        doc_count = ChatDocument.objects.filter(is_active=True).count()

        return Response({
            'token_usage': session.token_usage,
            'token_cap': session.token_cap,
            'document_count': doc_count,
            'has_documents': doc_count > 0,
        })


class ChatView(views.APIView):
    """
    POST /api/regis/chat/
    Send a message and receive an AI reply.
    Body: { "message": "..." }
    Response: { "reply": "...", "usage": N, "cap": N, "sources": [...] }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err

        message = (request.data.get('message') or '').strip()
        if not message:
            return Response(
                {'reply': 'Silakan kirim pesan yang valid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session, _ = _get_or_create_chat_session(team)

        # Token cap check
        if session.token_usage >= session.token_cap:
            return Response({
                'reply': (
                    f"Batas token Anda ({session.token_cap}) telah tercapai. "
                    "Silakan hubungi admin untuk bantuan lebih lanjut atau tunggu reset harian."
                ),
                'usage': session.token_usage,
                'cap': session.token_cap,
                'sources': [],
            })

        # Count user message tokens
        session.token_usage += chat_services.estimate_tokens(message)

        # Append user message to history
        history = session.chat_history or []
        history.append({'role': 'user', 'content': message})

        # Build document context
        documents = _get_active_documents()

        # Generate reply
        try:
            reply, sources = chat_services.generate_reply(documents, history, message)
            session.token_usage += chat_services.estimate_tokens(reply)
        except Exception as e:
            reply = (
                f"Terjadi kesalahan pada backend chat: {e}. "
                "Silakan coba lagi atau muat ulang halaman."
            )
            sources = []

        # Append assistant reply to history (keep last 20)
        history.append({'role': 'assistant', 'content': reply})
        session.chat_history = history[-20:]
        session.save()

        return Response({
            'reply': reply,
            'usage': session.token_usage,
            'cap': session.token_cap,
            'sources': sources,
        })


class ChatClearView(views.APIView):
    """
    POST /api/regis/chat/clear/
    Clear the team's chat history (does NOT reset token usage).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err

        ChatSession.objects.filter(team=team).update(chat_history=[])
        return Response({'ok': True})

def _validate_member_files_payload(files_payload):
    """
    Member-level files are PDF-only — unlike team files, no member file
    type has an image-format exception (that's only 'pembayaran', which
    is team-level). Returns {file_type: error_message} or None if all valid.
    """
    if not isinstance(files_payload, dict):
        return None
    errors = {}
    for file_type, info in files_payload.items():
        if not isinstance(info, dict):
            continue
        file_format = (info.get('format') or '').lower()
        if file_format and file_format != 'pdf':
            errors[file_type] = f"Format '{file_format}' tidak didukung. Hanya PDF yang diperbolehkan."
    return errors or None