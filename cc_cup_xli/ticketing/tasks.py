import io
import logging
import qrcode
from django.core.mail import EmailMessage
from .models import Ticket

logger = logging.getLogger(__name__)


def send_ticket_qr_email(ticket_pk):
    """Generate a QR code for the ticket and email it to the customer."""
    try:
        ticket = Ticket.objects.get(pk=ticket_pk)

        # Generate QR code in memory (payload = UUID string)
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

    except Ticket.DoesNotExist:
        logger.warning(f"Ticket {ticket_pk} not found — skipping QR email.")
    except Exception as exc:
        logger.error(f"Failed to send QR email for ticket {ticket_pk}: {exc}")
