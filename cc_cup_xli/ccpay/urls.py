from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.UserBalanceView.as_view(), name='user-balance'),
    path('transactions/', views.UserTransactionListView.as_view(), name='user-transactions'),
    path('payment/', views.ProcessPaymentView.as_view(), name='process-payment'),
    path('merchant/status/', views.MerchantStatusView.as_view(), name='merchant-status'),
    path('merchant/dashboard/', views.MerchantDashboardView.as_view(), name='merchant-dashboard-api'),
]
