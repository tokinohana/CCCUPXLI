from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.RegisterView.as_view(), name='regis-register'),
    path('login/', views.LoginView.as_view(), name='regis-login'),
    path('logout/', views.LogoutView.as_view(), name='regis-logout'),

    # Dashboard
    path('dashboard/', views.DashboardView.as_view(), name='regis-dashboard'),

    # Members
    path('add_member/', views.AddMemberView.as_view(), name='regis-add-member'),
    path('edit_member/<int:member_id>/', views.EditMemberView.as_view(), name='regis-edit-member'),
    path('delete_member/<int:member_id>/', views.DeleteMemberView.as_view(), name='regis-delete-member'),

    # Team Files
    path('upload/<str:file_type>/', views.UploadTeamFileView.as_view(), name='regis-upload-file'),
    path('delete_file/<str:file_type>/', views.DeleteTeamFileView.as_view(), name='regis-delete-file'),

    # Team Info
    path('add_info/', views.SaveTeamInfoView.as_view(), name='regis-add-info'),

    # Submit / Unsubmit
    path('submit/', views.SubmitRegistrationView.as_view(), name='regis-submit'),
    path('unsubmit/', views.UnsubmitRegistrationView.as_view(), name='regis-unsubmit'),

    # Rekening
    path('update-rekening/', views.UpdateRekeningView.as_view(), name='regis-update-rekening'),

    # Subkategori
    path('save-subkategori/', views.SaveSubkategoriView.as_view(), name='regis-save-subkategori'),
]
