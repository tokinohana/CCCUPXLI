import io
import qrcode
from celery import shared_task
from django.core.mail import EmailMessage
from .models import Ticket


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_ticket_qr_email(self, ticket_pk):
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
        # Don't retry if the ticket has been deleted
        pass
    except Exception as exc:
        raise self.retry(exc=exc)
