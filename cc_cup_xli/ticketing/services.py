import io
import logging
import threading

import qrcode
from django.core.mail import EmailMessage
from django.db import transaction

logger = logging.getLogger(__name__)


def send_ticket_qr_email(ticket):
    """Generate a QR code for the ticket and email it via Zoho SMTP (~5-10s)."""
    try:
        qr = qrcode.make(str(ticket.ticket_id))
        buffer = io.BytesIO()
        qr.save(buffer, format='PNG')
        buffer.seek(0)

        email = EmailMessage(
            subject='Tiket Closing Event CCCUP XLI',
            body=(
                f'Halo {ticket.buyer.full_name}!\n\n'
                f'Ini QR Code tiket kamu untuk Closing Event CCCUP XLI.\n'
                f'Tunjukkan QR Code ini saat masuk ke venue.\n\n'
                f'Terima kasih!'
            ),
            from_email='noreply@cccupxli.com',
            to=[ticket.buyer.email],
        )
        email.attach(f'ticket_{ticket.ticket_id}.png', buffer.read(), 'image/png')
        email.send()
    except Exception as exc:
        logger.error(f"Failed to send QR email for ticket {ticket.ticket_id}: {exc}")


def queue_ticket_email(ticket):
    """
    Send the QR email off the request thread, after the DB transaction
    commits. Used by both the DRF create endpoint and Django Admin, so a
    ticket gets exactly one email regardless of which surface created it.
    """
    transaction.on_commit(
        lambda: threading.Thread(target=send_ticket_qr_email, args=(ticket,)).start()
    )