from rest_framework import serializers
from .models import Team, Member, TeamFile, MemberFile, OtherInfo
from . import competition_data as compdata


class TeamFileSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='file_url', read_only=True)

    class Meta:
        model = TeamFile
        fields = ['id', 'file_type', 'url', 'uploaded_at']


class MemberFileSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='file_url', read_only=True)

    class Meta:
        model = MemberFile
        fields = ['id', 'file_type', 'url', 'uploaded_at']


class OtherInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherInfo
        fields = ['id', 'key', 'value']


class MemberSerializer(serializers.ModelSerializer):
    """
    Validates a member against the base model constraints AND the per-sport
    rules in competition_data.py. Requires `context['team']` to be set by the
    view (validation is meaningless without knowing which competition/jenjang
    this member belongs to).
    """
    files = MemberFileSerializer(many=True, read_only=True)
    dynamicFields = serializers.JSONField(source='dynamic_data', required=False, default=dict)
    is_representative = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            'id', 'nama', 'email', 'nomor_telepon', 'tanggal_lahir',
            'gender', 'kelas', 'nisn', 'tempat_lahir', 'berat_badan',
            'tinggi_badan', 'role', 'subkategori',
            'dynamicFields', 'is_representative', 'files', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_representative(self, obj):
        return obj.user_id is not None

    def validate_gender(self, value):
        team = self.context.get('team')
        if team and value and not compdata.is_gender_allowed(team.competition, team.jenjang, value):
            allowed = compdata.allowed_genders(team.competition, team.jenjang)
            raise serializers.ValidationError(
                f"Cabang ini hanya menerima gender: {', '.join(allowed)}."
            )
        return value

    def validate_subkategori(self, value):
        team = self.context.get('team')
        if not team or not value:
            return value
        allowed = compdata.allowed_subkategori(team.competition, team.jenjang)
        if allowed and value not in allowed:
            raise serializers.ValidationError(
                f"Subkategori tidak valid untuk cabang ini. Pilihan: {', '.join(allowed)}."
            )
        return value

    def validate(self, attrs):
        team = self.context.get('team')
        if not team:
            return attrs

        rules = compdata.get_rules(team.competition, team.jenjang)
        if rules is None:
            # Competition/jenjang combo isn't in the metadata at all — let it
            # through rather than hard-blocking (kuota/closed handling is
            # intentionally soft per product decision), but this usually means
            # `team.competition` or `team.jenjang` is stale/misspelled.
            return attrs

        extra_fields = compdata.extra_member_fields(team.competition, team.jenjang)
        dynamic_data = attrs.get('dynamic_data') or {}

        errors = {}
        for field_name, type_hint in extra_fields.items():
            if type_hint == 'File':
                # Files are validated separately (multipart, checked in the view)
                continue
            value = dynamic_data.get(field_name)
            if value in (None, ''):
                errors[field_name] = f"Wajib diisi untuk cabang ini ({type_hint})."
                continue
            if type_hint == 'Number':
                try:
                    float(value)
                except (TypeError, ValueError):
                    errors[field_name] = "Harus berupa angka."

        if errors:
            raise serializers.ValidationError({'dynamicFields': errors})

        return attrs


class TeamSerializer(serializers.ModelSerializer):
    members = MemberSerializer(many=True, read_only=True)
    files = TeamFileSerializer(many=True, read_only=True)
    other_info = OtherInfoSerializer(many=True, read_only=True)

    captain_email = serializers.EmailField(source='captain.email', read_only=True)
    player_range = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id', 'nama_tim', 'school', 'phone', 'competition', 'jenjang',
            'regis_status', 'bank_name', 'account_number', 'account_holder',
            'captain_email', 'members', 'files', 'other_info',
            'player_range', 'member_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'regis_status', 'created_at', 'updated_at']

    def get_player_range(self, obj):
        rng = compdata.player_range(obj.competition, obj.jenjang)
        return {'min': rng[0], 'max': rng[1]} if rng else None

    def get_member_count(self, obj):
        return obj.members.count()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    # Step 1: Account
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(max_length=20)
    # Step 2: Team
    jenjang = serializers.ChoiceField(choices=[('SMP', 'SMP'), ('SMA', 'SMA')])
    school = serializers.CharField(max_length=200)
    nama_tim = serializers.CharField(max_length=150)
    competition = serializers.CharField(max_length=100)

    def validate(self, attrs):
        competition = attrs.get('competition')
        jenjang = attrs.get('jenjang')

        if not compdata.is_valid_competition_jenjang(competition, jenjang):
            raise serializers.ValidationError({
                'competition': f"'{competition}' tidak tersedia untuk jenjang {jenjang}."
            })

        # Quota/closed status are intentionally NOT enforced here (admins
        # handle this manually) — see TeamAdmin.quota_status for the
        # admin-facing flag instead.

        return attrs


class RekeningSerializer(serializers.Serializer):
    bank_name = serializers.CharField(max_length=100)
    account_number = serializers.CharField(max_length=50)
    account_holder = serializers.CharField(max_length=150)