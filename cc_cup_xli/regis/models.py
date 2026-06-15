from django.db import models
from django.conf import settings


class Team(models.Model):
    """
    Represents a registered team. The captain is the authenticated User
    who created the registration.
    """
    JENJANG_CHOICES = (
        ('SMP', 'SMP'),
        ('SMA', 'SMA'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUBMITTED', 'Submitted'),
        ('REVIEWED', 'Reviewed'),
        ('ACCEPTED', 'Accepted'),
        ('PENDINGTF', 'Pending Transfer'),
        ('REJECTED', 'Rejected'),
    )

    captain = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='team',
        verbose_name='Kapten Tim (User)'
    )
    nama_tim = models.CharField(max_length=150, verbose_name='Nama Tim')
    school = models.CharField(max_length=200, verbose_name='Asal Sekolah')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Nomor Telepon')
    competition = models.CharField(max_length=100, verbose_name='Cabang Olahraga (Slug)')
    jenjang = models.CharField(max_length=3, choices=JENJANG_CHOICES, verbose_name='Jenjang')
    regis_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name='Status Pendaftaran'
    )

    # Bank account info for WO Money refund (used during PENDINGTF)
    bank_name = models.CharField(max_length=100, blank=True, verbose_name='Nama Bank')
    account_number = models.CharField(max_length=50, blank=True, verbose_name='Nomor Rekening')
    account_holder = models.CharField(max_length=150, blank=True, verbose_name='Nama Pemilik Rekening')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Tim'
        verbose_name_plural = 'Daftar Tim'

    def __str__(self):
        return f"{self.nama_tim} ({self.competition})"


class Member(models.Model):
    """
    A roster member belonging to a Team.
    """
    GENDER_CHOICES = (
        ('Laki-laki', 'Laki-laki'),
        ('Perempuan', 'Perempuan'),
    )

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members', verbose_name='Tim')
    nama = models.CharField(max_length=200, verbose_name='Nama Lengkap')
    email = models.EmailField(blank=True, verbose_name='Email')
    nomor_telepon = models.CharField(max_length=20, blank=True, verbose_name='Nomor Telepon')
    tanggal_lahir = models.DateField(null=True, blank=True, verbose_name='Tanggal Lahir')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, verbose_name='Jenis Kelamin')
    kelas = models.CharField(max_length=5, blank=True, verbose_name='Kelas')
    nisn = models.CharField(max_length=20, blank=True, verbose_name='NISN')

    # Sport-specific optional fields (stored explicitly for query convenience)
    tempat_lahir = models.CharField(max_length=100, blank=True, verbose_name='Tempat Lahir')
    berat_badan = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Berat Badan (kg)')
    tinggi_badan = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name='Tinggi Badan (cm)')
    role = models.CharField(max_length=100, blank=True, verbose_name='Role / Peran')
    subkategori = models.CharField(max_length=255, blank=True, verbose_name='Subkategori')

    is_kapten = models.BooleanField(default=False, verbose_name='Apakah Kapten?')

    # Catch-all for any additional dynamic fields not covered above
    dynamic_data = models.JSONField(default=dict, blank=True, verbose_name='Data Dinamis Tambahan')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_kapten', 'created_at']
        verbose_name = 'Anggota'
        verbose_name_plural = 'Daftar Anggota'

    def __str__(self):
        return f"{self.nama} - {self.team.nama_tim}"


class TeamFile(models.Model):
    """
    Team-level uploaded documents (pembayaran, kartu pelajar, selfie, etc.).
    """
    FILE_TYPE_CHOICES = (
        ('pembayaran', 'Bukti Pembayaran'),
        ('kartuPelajar', 'Kartu Pelajar Kapten'),
        ('selfie', 'Selfie Dengan Kartu Pelajar'),
        ('suratPernyataan', 'Surat Pernyataan Tim'),
        ('suratIzin', 'Surat Izin Sekolah'),
    )

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='files', verbose_name='Tim')
    file_type = models.CharField(max_length=30, choices=FILE_TYPE_CHOICES, verbose_name='Jenis Berkas')
    file = models.FileField(upload_to='regis/team_files/', verbose_name='Berkas')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Waktu Unggah')

    class Meta:
        unique_together = ('team', 'file_type')
        ordering = ['file_type']
        verbose_name = 'Berkas Tim'
        verbose_name_plural = 'Berkas Tim'

    def __str__(self):
        return f"{self.team.nama_tim} - {self.file_type}"


class MemberFile(models.Model):
    """
    Member-level uploaded documents (akte, rapor, sertifikat sabuk, etc.).
    """
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='files', verbose_name='Anggota')
    file_type = models.CharField(max_length=50, verbose_name='Jenis Berkas')  # e.g. "akte", "rapor", "sabuk"
    file = models.FileField(upload_to='regis/member_files/', verbose_name='Berkas')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Waktu Unggah')

    class Meta:
        unique_together = ('member', 'file_type')
        ordering = ['file_type']
        verbose_name = 'Berkas Anggota'
        verbose_name_plural = 'Berkas Anggota'

    def __str__(self):
        return f"{self.member.nama} - {self.file_type}"


class OtherInfo(models.Model):
    """
    Key-value store for team-level dynamic metadata (coach info, cube categories, etc.).
    """
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='other_info', verbose_name='Tim')
    key = models.CharField(max_length=100, verbose_name='Kunci')
    value = models.TextField(blank=True, verbose_name='Nilai')

    class Meta:
        unique_together = ('team', 'key')
        ordering = ['key']
        verbose_name = 'Info Tambahan Tim'
        verbose_name_plural = 'Info Tambahan Tim'

    def __str__(self):
        return f"{self.team.nama_tim} - {self.key}"


# ─────────────────────────────────────────────────────────────────────────────
# CHAT / AI CONSULTANT
# ─────────────────────────────────────────────────────────────────────────────
class ChatDocument(models.Model):
    """
    Admin-uploaded SOP / reference PDF that the AI consultant uses as
    its knowledge base. Shared across all teams.
    """
    name = models.CharField(max_length=255, verbose_name='Nama Dokumen')
    file = models.FileField(upload_to='regis/chat_documents/', verbose_name='Berkas PDF')
    extracted_text = models.TextField(blank=True, verbose_name='Teks Hasil Ekstraksi')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Waktu Unggah')
    is_active = models.BooleanField(default=True, verbose_name='Aktif')

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Dokumen Chat AI'
        verbose_name_plural = 'Dokumen Chat AI'

    def __str__(self):
        return self.name


class ChatSession(models.Model):
    """
    Per-team chat state: conversation history, token usage, and cap.
    Created on first chat interaction.
    """
    team = models.OneToOneField(
        Team, on_delete=models.CASCADE, related_name='chat_session',
        verbose_name='Tim'
    )
    chat_history = models.JSONField(default=list, blank=True, verbose_name='Riwayat Chat')
    token_usage = models.PositiveIntegerField(default=0, verbose_name='Penggunaan Token')
    token_cap = models.PositiveIntegerField(default=10000, verbose_name='Batas Token')
    last_active_at = models.DateTimeField(auto_now=True, verbose_name='Terakhir Aktif')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Dibuat Pada')

    class Meta:
        verbose_name = 'Sesi Chat'
        verbose_name_plural = 'Sesi Chat'

    def __str__(self):
        return f"Chat: {self.team.nama_tim} ({self.token_usage}/{self.token_cap} tokens)"
