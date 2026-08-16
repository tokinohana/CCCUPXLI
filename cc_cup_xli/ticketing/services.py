import io
import logging
import threading

import qrcode
from django.conf import settings
from django.core.mail import EmailMessage
from django.db import transaction

logger = logging.getLogger(__name__)

def send_ticket_qr_email(ticket):
    """Generate a QR code for the ticket and email it via Resend SMTP."""
    try:
        qr = qrcode.make(str(ticket.ticket_id))
        buffer = io.BytesIO()
        qr.save(buffer, format='PNG')
        buffer.seek(0)

        email = EmailMessage(
            subject='E-Ticket Closing Event CCCUP XLI',
            body=(
                f'Yth. {ticket.buyer.full_name},\n\n'
                f'Terima kasih atas pembelian tiket Closing Event CCCUP XLI. '
                f'Bersama email ini, kami melampirkan QR Code sebagai e-ticket Anda.\n\n'
                f'Mohon persiapkan dan tunjukkan QR Code ini kepada petugas kami saat proses registrasi di pintu masuk venue.\n\n'
                f'Sampai jumpa di acara!\n\n'
                f'Hormat kami,\n'
                f'Panitia CCCUP XLI'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
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