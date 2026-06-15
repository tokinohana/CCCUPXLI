from django.contrib import admin
from admin_utils import AppGroupPermissionMixin
from .models import Team, Member, TeamFile, MemberFile, OtherInfo, ChatDocument, ChatSession

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


@admin.register(ChatDocument)
class ChatDocumentAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = REGIS_GROUP
    list_display = ['name', 'is_active', 'uploaded_at']
    list_filter = ['is_active', 'uploaded_at']
    actions = ['extract_text_action']

    def save_model(self, request, obj, form, change):
        """Auto-extract PDF text on save."""
        super().save_model(request, obj, form, change)
        if obj.file and (not obj.extracted_text or 'file' in form.changed_data):
            try:
                from . import chat_services
                import requests
                # Works with both local and Cloudinary storage via URL
                url = obj.file.url
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
                obj.extracted_text = chat_services.extract_pdf_text(resp.content)
                obj.save(update_fields=['extracted_text'])
            except Exception as e:
                obj.extracted_text = f"[Extraction error: {e}]"
                obj.save(update_fields=['extracted_text'])

    def extract_text_action(self, request, queryset):
        """Re-extract text from selected PDFs."""
        from . import chat_services
        import requests
        count = 0
        for doc in queryset:
            try:
                url = doc.file.url
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
                doc.extracted_text = chat_services.extract_pdf_text(resp.content)
                doc.save(update_fields=['extracted_text'])
                count += 1
            except Exception:
                pass
        self.message_user(request, f"Extracted text from {count} document(s).")
    extract_text_action.short_description = "Re-extract PDF text"


@admin.register(ChatSession)
class ChatSessionAdmin(AppGroupPermissionMixin, admin.ModelAdmin):
    allowed_group = REGIS_GROUP
    list_display = ['team', 'token_usage', 'token_cap', 'last_active_at']
    list_filter = ['last_active_at']
    search_fields = ['team__nama_tim']
    readonly_fields = ['chat_history', 'token_usage', 'last_active_at', 'created_at']
