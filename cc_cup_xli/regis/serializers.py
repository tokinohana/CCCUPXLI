from rest_framework import serializers
from .models import Team, Member, TeamFile, MemberFile, OtherInfo


class TeamFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = TeamFile
        fields = ['id', 'file_type', 'url', 'uploaded_at']

    def get_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class MemberFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MemberFile
        fields = ['id', 'file_type', 'url', 'uploaded_at']

    def get_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class OtherInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherInfo
        fields = ['id', 'key', 'value']


class MemberSerializer(serializers.ModelSerializer):
    files = MemberFileSerializer(many=True, read_only=True)
    dynamicFields = serializers.JSONField(source='dynamic_data', required=False, default=dict)

    class Meta:
        model = Member
        fields = [
            'id', 'nama', 'email', 'nomor_telepon', 'tanggal_lahir',
            'gender', 'kelas', 'nisn', 'tempat_lahir', 'berat_badan',
            'tinggi_badan', 'role', 'subkategori', 'is_kapten',
            'dynamicFields', 'files', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_kapten', 'created_at', 'updated_at']


class TeamSerializer(serializers.ModelSerializer):
    members = MemberSerializer(many=True, read_only=True)
    files = TeamFileSerializer(many=True, read_only=True)
    other_info = OtherInfoSerializer(many=True, read_only=True)

    # Read-only captain email
    captain_email = serializers.EmailField(source='captain.email', read_only=True)

    class Meta:
        model = Team
        fields = [
            'id', 'nama_tim', 'school', 'phone', 'competition', 'jenjang',
            'regis_status', 'bank_name', 'account_number', 'account_holder',
            'captain_email', 'members', 'files', 'other_info',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'regis_status', 'created_at', 'updated_at']


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


class RekeningSerializer(serializers.Serializer):
    bank_name = serializers.CharField(max_length=100)
    account_number = serializers.CharField(max_length=50)
    account_holder = serializers.CharField(max_length=150)
