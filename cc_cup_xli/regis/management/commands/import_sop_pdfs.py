"""
Import SOP PDFs from the homepage's /public/sop/ folder into ChatDocument.

Just saves the public URL — no download/upload to Cloudinary.
Celery then fetches the PDF directly from the homepage URL for text extraction.

Usage:
    python manage.py import_sop_pdfs --base-url https://cccup.id
    python manage.py import_sop_pdfs --base-url http://localhost:5173  # dev
"""
from django.core.management.base import BaseCommand

from regis.models import ChatDocument
from regis.tasks import extract_chat_document_text

SOP_FILES = [
    "band.pdf", "basket.pdf", "bultang.pdf", "catur.pdf", "cerdascermat.pdf",
    "cubing.pdf", "debat.pdf", "digitalpainting.pdf", "engdeb.pdf",
    "fotgraf.pdf", "karate.pdf", "mdance.pdf", "mekanisme.pdf", "minsoc.pdf",
    "padus.pdf", "pencaksil.pdf", "shortmov.pdf", "taekwondo.pdf",
    "tenmeja.pdf", "voli.pdf", "wallclimb.pdf",
]

COMPETITION_NAMES = {
    "band": "Band",
    "basket": "Basket",
    "bultang": "Bulu Tangkis",
    "catur": "Catur",
    "cerdascermat": "Cerdas Cermat",
    "cubing": "Cubing",
    "debat": "Debat Bahasa Indonesia",
    "digitalpainting": "Digital Painting",
    "engdeb": "English Debate",
    "fotgraf": "Fotografi",
    "karate": "Karate",
    "mdance": "Modern Dance",
    "mekanisme": "Mekanisme Umum",
    "minsoc": "Mobile Legends / MinSOC",
    "padus": "Paduan Suara",
    "pencaksil": "Pencak Silat",
    "shortmov": "Short Movie",
    "taekwondo": "Taekwondo",
    "tenmeja": "Tenis Meja",
    "voli": "Voli",
    "wallclimb": "Wall Climbing",
}


class Command(BaseCommand):
    help = "Import SOP PDFs from the homepage into ChatDocument + extract text via Celery."

    def add_arguments(self, parser):
        parser.add_argument(
            "--base-url",
            default="https://cccup.id",
            help="Base URL of the deployed homepage (default: https://cccup.id)",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-download and re-extract even if the document already exists.",
        )

    def handle(self, *args, **options):
        base_url = options["base_url"].rstrip("/")
        force = options["force"]
        created = 0
        skipped = 0
    
        for filename in SOP_FILES:
            url = f"{base_url}/sop/{filename}"
            slug = filename.replace(".pdf", "")
            display_name = COMPETITION_NAMES.get(slug, slug.replace("-", " ").title())
    
            existing = ChatDocument.objects.filter(name=display_name).first()
            if existing and not force:
                self.stdout.write(self.style.WARNING(f"  \u23ed  {display_name} — already exists, skipping"))
                skipped += 1
                continue
    
            if existing:
                doc = existing
                doc.pdf_url = url
                doc.filename = filename
                doc.extracted_text = ""
                doc.save()
            else:
                doc = ChatDocument.objects.create(
                    name=display_name,
                    pdf_url=url,
                    filename=filename,
                )
    
            extract_chat_document_text.delay(doc.pk)
            self.stdout.write(self.style.SUCCESS(f"  \u2713  {display_name} \u2192 {url} (extraction queued)"))
            created += 1
    
        self.stdout.write(self.style.SUCCESS(
            f"\nDone: {created} imported, {skipped} skipped."
        ))
