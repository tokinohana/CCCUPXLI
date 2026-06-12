import os
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Team, Member, TeamFile, MemberFile, OtherInfo
from .serializers import (
    TeamSerializer, MemberSerializer, TeamFileSerializer,
    MemberFileSerializer, OtherInfoSerializer, LoginSerializer,
    RegisterSerializer, RekeningSerializer
)

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

        # Create User
        user = User.objects.create_user(
            email=email,
            password=d['password'],
            phone_number=d['phone'],
            is_external=True,
            username=email.split('@')[0],
        )

        # Create Team
        team = Team.objects.create(
            captain=user,
            nama_tim=d['nama_tim'],
            school=d['school'],
            phone=d['phone'],
            competition=d['competition'],
            jenjang=d['jenjang'],
        )

        # Generate tokens
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
    Create a new member with dynamic fields and optional file uploads.
    Expects multipart/form-data.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        data = request.data.copy()

        # Parse dynamic_data JSON from string if sent as FormData
        dynamic_data = {}
        if 'dynamic_data' in data:
            import json
            try:
                dynamic_data = json.loads(data['dynamic_data'])
            except (json.JSONDecodeError, TypeError):
                dynamic_data = {}
            del data['dynamic_data']

        # Extract known sport-specific fields from dynamic_data into model fields
        tempat_lahir = dynamic_data.pop('tempat_lahir', data.get('tempat_lahir', ''))
        berat_badan = dynamic_data.pop('berat_badan', data.get('berat_badan'))
        tinggi_badan = dynamic_data.pop('tinggi_badan', data.get('tinggi_badan'))
        role = dynamic_data.pop('role', data.get('role', ''))
        subkategori = dynamic_data.pop('subkategori', data.get('subkategori', ''))

        member = Member.objects.create(
            team=team,
            nama=data.get('nama', ''),
            email=data.get('email', ''),
            nomor_telepon=data.get('nomor_telepon', ''),
            tanggal_lahir=data.get('tanggal_lahir') or None,
            gender=data.get('gender', ''),
            kelas=data.get('kelas', ''),
            nisn=data.get('nisn', ''),
            tempat_lahir=tempat_lahir,
            berat_badan=berat_badan or None,
            tinggi_badan=tinggi_badan or None,
            role=role,
            subkategori=subkategori,
            dynamic_data=dynamic_data
        )

        # Handle member file uploads (keys like file_akte, file_rapor, file_sabuk, etc.)
        for key, uploaded_file in request.FILES.items():
            if key.startswith('file_'):
                file_type = key[len('file_'):]
                MemberFile.objects.create(
                    member=member,
                    file_type=file_type,
                    file=uploaded_file
                )

        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)


class EditMemberView(views.APIView):
    """
    PUT /api/regis/edit_member/<int:member_id>
    Update an existing member's data and optionally re-upload files.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, member_id):
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

        data = request.data.copy()

        # Parse dynamic_data
        dynamic_data = member.dynamic_data or {}
        if 'dynamic_data' in data:
            import json
            try:
                dynamic_data = json.loads(data['dynamic_data'])
            except (json.JSONDecodeError, TypeError):
                pass
            del data['dynamic_data']

        # Update known fields
        member.nama = data.get('nama', member.nama)
        member.email = data.get('email', member.email)
        member.nomor_telepon = data.get('nomor_telepon', member.nomor_telepon)
        member.tanggal_lahir = data.get('tanggal_lahir') or member.tanggal_lahir
        member.gender = data.get('gender', member.gender)
        member.kelas = data.get('kelas', member.kelas)
        member.nisn = data.get('nisn', member.nisn)

        # Sport-specific
        if 'tempat_lahir' in data or 'tempat_lahir' in dynamic_data:
            member.tempat_lahir = dynamic_data.pop('tempat_lahir', data.get('tempat_lahir', member.tempat_lahir))
        if 'berat_badan' in data or 'berat_badan' in dynamic_data:
            member.berat_badan = dynamic_data.pop('berat_badan', data.get('berat_badan')) or member.berat_badan
        if 'tinggi_badan' in data or 'tinggi_badan' in dynamic_data:
            member.tinggi_badan = dynamic_data.pop('tinggi_badan', data.get('tinggi_badan')) or member.tinggi_badan
        if 'role' in data or 'role' in dynamic_data:
            member.role = dynamic_data.pop('role', data.get('role', member.role))
        if 'subkategori' in data or 'subkategori' in dynamic_data:
            member.subkategori = dynamic_data.pop('subkategori', data.get('subkategori', member.subkategori))

        member.dynamic_data = dynamic_data
        member.save()

        # Re-upload files (replace existing)
        for key, uploaded_file in request.FILES.items():
            if key.startswith('file_'):
                file_type = key[len('file_'):]
                obj, created = MemberFile.objects.update_or_create(
                    member=member,
                    file_type=file_type,
                    defaults={'file': uploaded_file}
                )

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

        if member.is_kapten:
            return Response({"error": "Tidak dapat menghapus kapten tim."}, status=status.HTTP_403_FORBIDDEN)

        member.delete()
        return Response({"message": "Anggota berhasil dihapus."})


# ─────────────────────────────────────────────────────────────────────────────
# TEAM FILES
# ─────────────────────────────────────────────────────────────────────────────
class UploadTeamFileView(views.APIView):
    """
    POST /api/regis/upload/<file_type>
    Upload a team-level file. Accepts PDF for most types; 'pembayaran' also accepts PNG/JPG.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, file_type):
        team, err = _get_team_or_error(request)
        if err:
            return err
        freeze = _freeze_check(team)
        if freeze:
            return freeze

        if file_type not in VALID_TEAM_FILE_TYPES:
            return Response({"error": f"Tipe file '{file_type}' tidak valid."}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"error": "File wajib disertakan."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        name = uploaded_file.name.lower()
        if file_type == 'pembayaran':
            if not any(name.endswith(ext) for ext in ('.pdf', '.png', '.jpg', '.jpeg')):
                return Response({"error": "Bukti pembayaran harus berupa PDF, PNG, atau JPG."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if not name.endswith('.pdf'):
                return Response({"error": "File harus berupa PDF."}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = TeamFile.objects.update_or_create(
            team=team,
            file_type=file_type,
            defaults={'file': uploaded_file}
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

        # Delete from storage
        if team_file.file:
            team_file.file.delete(save=False)
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

        # Validate: minimum member count (use a basic default of 1 if competition not known)
        member_count = team.members.count()
        if member_count < 1:
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
