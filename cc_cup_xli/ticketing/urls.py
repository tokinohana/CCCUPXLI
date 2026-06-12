from django.urls import path
from . import views

urlpatterns = [
    # Auth (JWT)
    path('auth/login/', views.CommitteeLoginView.as_view(), name='ticketing-login'),
    path('auth/refresh/', views.CommitteeRefreshView.as_view(), name='ticketing-refresh'),

    # Ticket CRUD
    path('tickets/', views.TicketListCreateView.as_view(), name='ticketing-list-create'),
    path('tickets/verify-nik/', views.VerifyNIKView.as_view(), name='ticketing-verify-nik'),
    path('tickets/export/', views.TicketExportView.as_view(), name='ticketing-export'),
    path('tickets/<uuid:ticket_id>/', views.TicketDetailView.as_view(), name='ticketing-detail'),
    path('tickets/<uuid:ticket_id>/redeem/', views.RedeemTicketView.as_view(), name='ticketing-redeem'),
]
