from django.urls import path
from . import views

urlpatterns = [
    path('auth/google/config/', views.GoogleConfigView.as_view(), name='google-config'),
    path('auth/google/', views.GoogleOAuthLoginView.as_view(), name='google-auth-login'),

    path('balance/', views.UserBalanceView.as_view(), name='user-balance'),
    path('transactions/', views.UserTransactionListView.as_view(), name='user-transactions'),
    path('student/dashboard/', views.StudentDashboardAPIView.as_view(), name='student-dashboard'),
    
    path('payment/', views.ProcessPaymentView.as_view(), name='process-payment'),
    
    path('merchant/status/', views.MerchantStatusView.as_view(), name='merchant-status'),
    path('merchant/dashboard/', views.MerchantDashboardView.as_view(), name='merchant-dashboard'),
    path('merchants/list/', views.MerchantListView.as_view(), name='merchant-list'),
    path('merchants/lookup/', views.MerchantLookupView.as_view(), name='merchant-lookup'),
]