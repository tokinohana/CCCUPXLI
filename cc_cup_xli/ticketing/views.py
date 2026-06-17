import csv
import io
import logging
import qrcode

from django.core.mail import EmailMessage
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Ticket
from .permissions import IsCommittee
from .serializers import (
    TicketSerializer,
    CreateTicketSerializer,
    UpdateTicketSerializer,
    RedeemTicketSerializer,
)

logger = logging.getLogger(__name__)


def _send_ticket_qr_email(ticket):
    """Generate a QR code for the ticket and email it via Zoho SMTP (~5-10s)."""
    try:
        qr = qrcode.make(str(ticket.ticket_id))
        buffer = io.BytesIO()
        qr.save(buffer, format='PNG')
        buffer.seek(0)

        email = EmailMessage(
            subject='Tiket Closing Event CCCUP XLI',
            body=(
                f'Halo {ticket.full_name}!\n\n'
                f'Ini QR Code tiket kamu untuk Closing Event CCCUP XLI.\n'
                f'Tunjukkan QR Code ini saat masuk ke venue.\n\n'
                f'Terima kasih!'
            ),
            from_email='noreply@cccupxli.com',
            to=[ticket.email],
        )
        email.attach(f'ticket_{ticket.ticket_id}.png', buffer.read(), 'image/png')
        email.send()
    except Exception as exc:
        logger.error(f"Failed to send QR email for ticket {ticket.ticket_id}: {exc}")


# ─────────────────────────────────────────────────────────────────────────────
# Auth Views (JWT)
# ─────────────────────────────────────────────────────────────────────────────

class CommitteeLoginView(TokenObtainPairView):
    """Committee login — returns JWT access + refresh tokens."""
    permission_classes = [AllowAny]


class CommitteeRefreshView(TokenRefreshView):
    """Refresh expired access token."""
    permission_classes = [AllowAny]


# ─────────────────────────────────────────────────────────────────────────────
# Ticket CRUD Views
# ─────────────────────────────────────────────────────────────────────────────

class TicketListCreateView(generics.ListCreateAPIView):
    """
    GET  /tickets/  — List all tickets (with optional filters)
    POST /tickets/  — Create a new ticket
    """
    permission_classes = [IsCommittee]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTicketSerializer
        return TicketSerializer

    def get_queryset(self):
        qs = Ticket.objects.all().order_by('-created_at')
        # Optional query filters
        status_filter = self.request.query_params.get('status')
        is_redeemed = self.request.query_params.get('is_redeemed')
        terminal = self.request.query_params.get('terminal')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if is_redeemed is not None:
            qs = qs.filter(is_redeemed=is_redeemed.lower() == 'true')
        if terminal:
            qs = qs.filter(terminal__iexact=terminal)
        return qs


class TicketDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /tickets/<uuid>/  — Get ticket detail
    PATCH /tickets/<uuid>/  — Update ticket status (mark paid / void)
    """
    permission_classes = [IsCommittee]
    lookup_field = 'ticket_id'
    lookup_url_kwarg = 'ticket_id'

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return UpdateTicketSerializer
        return TicketSerializer

    def get_queryset(self):
        return Ticket.objects.all()

    def perform_update(self, serializer):
        old_status = self.get_object().status
        ticket = serializer.save()
        # Send QR email synchronously when status changes to 'paid' (~5-10s Zoho SMTP)
        if old_status != 'paid' and ticket.status == 'paid':
            _send_ticket_qr_email(ticket)


class VerifyNIKView(APIView):
    """
    GET /tickets/verify-nik/?nik=<value>
    Check if an identification number (NIK) already exists.
    """
    permission_classes = [IsCommittee]

    def get(self, request):
        nik = request.query_params.get('nik', '').strip()
        if not nik:
            return Response(
                {'error': 'nik query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        exists = Ticket.objects.filter(identification_number=nik).exists()
        return Response({'exists': exists})


# ─────────────────────────────────────────────────────────────────────────────
# Redeem View (Gate Scanner)
# ─────────────────────────────────────────────────────────────────────────────

class RedeemTicketView(APIView):
    """
    POST /tickets/<uuid>/redeem/
    Redeem a ticket at a gate. Uses select_for_update() for concurrency safety.
    """
    permission_classes = [IsCommittee]

    def post(self, request, ticket_id):
        serializer = RedeemTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        terminal = serializer.validated_data['terminal']

        try:
            with transaction.atomic():
                ticket = Ticket.objects.select_for_update().get(ticket_id=ticket_id)

                # Validate payment status
                if ticket.status != 'paid':
                    return Response(
                        {'success': False, 'error': 'UNPAID_TICKET',
                         'message': 'Ticket has not been paid yet.'},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                # Validate not already redeemed
                if ticket.is_redeemed:
                    return Response(
                        {'success': False, 'error': 'ALREADY_REDEEMED',
                         'message': 'Ticket was already redeemed.',
                         'ticket': TicketSerializer(ticket).data},
                        status=status.HTTP_409_CONFLICT,
                    )

                # Redeem
                ticket.is_redeemed = True
                ticket.redeemed_at = timezone.now()
                ticket.scanned_by = request.user
                ticket.terminal = terminal
                ticket.save()

            return Response(
                {'success': True, 'ticket': TicketSerializer(ticket).data},
                status=status.HTTP_200_OK,
            )

        except Ticket.DoesNotExist:
            return Response(
                {'success': False, 'error': 'INVALID_TICKET',
                 'message': 'Ticket not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


# ─────────────────────────────────────────────────────────────────────────────
# CSV Export
# ─────────────────────────────────────────────────────────────────────────────

class TicketExportView(APIView):
    """
    GET /tickets/export/
    Export all tickets as a CSV file.
    """
    permission_classes = [IsCommittee]

    def get(self, request):
        tickets = Ticket.objects.all().order_by('-created_at')

        # Apply same filters as list view
        status_filter = request.query_params.get('status')
        is_redeemed = request.query_params.get('is_redeemed')
        terminal = request.query_params.get('terminal')
        if status_filter:
            tickets = tickets.filter(status=status_filter)
        if is_redeemed is not None:
            tickets = tickets.filter(is_redeemed=is_redeemed.lower() == 'true')
        if terminal:
            tickets = tickets.filter(terminal__iexact=terminal)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="tickets_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Ticket ID', 'Full Name', 'Email', 'Identification Number',
            'Status', 'Is Redeemed', 'Redeemed At', 'Terminal',
            'Scanned By', 'Created At', 'Updated At',
        ])

        for t in tickets:
            writer.writerow([
                t.ticket_id,
                t.full_name,
                t.email,
                t.identification_number,
                t.status,
                t.is_redeemed,
                t.redeemed_at.isoformat() if t.redeemed_at else '',
                t.terminal or '',
                t.scanned_by.email if t.scanned_by else '',
                t.created_at.isoformat() if t.created_at else '',
                t.updated_at.isoformat() if t.updated_at else '',
            ])

        return response
