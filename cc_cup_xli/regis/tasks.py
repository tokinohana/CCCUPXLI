"""Celery tasks for the regis app — PDF text extraction runs in background."""
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def extract_chat_document_text(self, document_id: int):
    """
    Fetch a ChatDocument's PDF from its public URL and extract text.
    Saves the result to the extracted_text field.
    Runs asynchronously so the admin UI doesn't block.
    """
    from .models import ChatDocument
    from .chat_services import extract_pdf_text
    import requests

    try:
        doc = ChatDocument.objects.get(pk=document_id)
    except ChatDocument.DoesNotExist:
        logger.error(f"ChatDocument {document_id} not found")
        return

    if not doc.pdf_url:
        logger.warning(f"ChatDocument {document_id} has no pdf_url")
        return

    logger.info(f"Extracting text from '{doc.name}' (id={document_id}) ...")

    try:
        resp = requests.get(doc.pdf_url, timeout=30)
        resp.raise_for_status()
        doc.extracted_text = extract_pdf_text(resp.content)
        doc.save(update_fields=['extracted_text'])
        logger.info(f"\u2713 Extracted {len(doc.extracted_text)} chars from '{doc.name}'")
    except Exception as exc:
        logger.error(f"Failed to extract text from '{doc.name}': {exc}")
        doc.extracted_text = f"[Extraction error: {exc}]"
        doc.save(update_fields=['extracted_text'])
        raise self.retry(exc=exc)
