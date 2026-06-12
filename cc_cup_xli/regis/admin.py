from django.contrib import admin
from admin_utils import AppGroupPermissionMixin
from .models import Team, Member, TeamFile, MemberFile, OtherInfo

REGIS_GROUP = 'Registration Committee'


class MemberInline(admin.TabularInline):
    model = Member
    extra = 0
    fields = ['nama', 'email', 'nisn', 'kelas', 'gender', 'is_kapten', 'subkategori']
    readonly_fields = ['created_at']


class TeamFileInline(admin.TabularInline):
    model = TeamFile
    extra = 0


class OtherInfoInline(admin.TabularInline):
    model = OtherInfo
    extra = 0


@admin.register(Team)
class TeamAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = REGIS_GROUP
    list_display = ['nama_tim', 'competition', 'jenjang', 'school', 'regis_status', 'created_at']
    list_filter = ['competition', 'regis_status', 'jenjang', 'created_at']
    search_fields = ['nama_tim', 'school', 'captain__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [MemberInline, TeamFileInline, OtherInfoInline]
    fieldsets = (
        ('Informasi Tim', {
            'fields': ('captain', 'nama_tim', 'school', 'phone', 'competition', 'jenjang', 'regis_status')
        }),
        ('Informasi Rekening (WO Money)', {
            'fields': ('bank_name', 'account_number', 'account_holder'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Member)
class MemberAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = REGIS_GROUP
    list_display = ['nama', 'team', 'nisn', 'kelas', 'gender', 'is_kapten']
    list_filter = ['team__competition', 'gender', 'is_kapten']
    search_fields = ['nama', 'nisn', 'email', 'team__nama_tim']


@admin.register(TeamFile)
class TeamFileAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = REGIS_GROUP
    list_display = ['team', 'file_type', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']


@admin.register(MemberFile)
class MemberFileAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = REGIS_GROUP
    list_display = ['member', 'file_type', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']


@admin.register(OtherInfo)
class OtherInfoAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = REGIS_GROUP
    list_display = ['team', 'key', 'value']
    list_filter = ['key']
