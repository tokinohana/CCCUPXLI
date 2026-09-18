"""
Management command: bulk-import/upsert CCPay committee accounts from a CSV
produced by convert_spreadsheet.py or convert_shift_roster.py
(columns: nis, nama_lengkap, email, and optionally division_name).

Place at: <app>/management/commands/import_ccpay_users.py
(needs an empty __init__.py in both `management/` and `management/commands/`
if they don't already exist)

Usage:
    python manage.py import_ccpay_users path/to/clean.csv

Rules implemented (per team decisions):
  - Match existing rows by email only.
  - New rows: nis, first_name (full name, no split), division_name (from CSV
    if present, else model default UNREGISTERED), is_committee=True,
    current_saldo=0, set_unusable_password(). role stays at model default
    (MEMBER) -- no source data for it yet.
  - Existing rows: fill nis/first_name/division_name ONLY if currently
    blank/null (division_name also counts the model's own "UNREGISTERED"
    placeholder as blank) -- never overwrite already-present data.
  - Existing rows: is_committee forced True ONLY if currently False AND
    email ends in @kanisius.sch.id.
  - Existing rows: current_saldo set to 0 ONLY if it is currently exactly 0
    (never touched otherwise).
  - Existing rows: password is never touched.
  - is_external is never read or written by this command -- it's unrelated
    to CCPay eligibility.
"""
import csv

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = "Bulk-import/upsert CCPay committee accounts from a cleaned CSV."

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str)

    def handle(self, *args, **options):
        csv_path = options["csv_path"]

        try:
            with open(csv_path, newline="", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        except FileNotFoundError:
            raise CommandError(f"File not found: {csv_path}")

        required_cols = {"nis", "nama_lengkap", "email"}
        if rows and not required_cols <= set(rows[0].keys()):
            raise CommandError(f"CSV missing required columns. Found: {list(rows[0].keys())}")
        has_division_col = bool(rows) and "division_name" in rows[0].keys()

        created_emails = []
        updated_emails = []
        untouched_emails = []
        failed_rows = []

        # Deliberately NOT one big transaction.atomic() around the whole loop:
        # with 1000+ rows, a single bad row (e.g. a duplicate nis that slipped
        # through) would otherwise roll back the entire batch. Each row gets
        # its own transaction so one failure is isolated and reported, not
        # fatal to the run.
        for row in rows:
            nis = row["nis"].strip()
            nama = row["nama_lengkap"].strip()
            email = row["email"].strip().lower()
            division = (row.get("division_name") or "").strip() if has_division_col else ""

            if not (nis and nama and email):
                self.stderr.write(self.style.WARNING(f"Skipping incomplete row: {row}"))
                failed_rows.append((row, "incomplete row"))
                continue

            try:
                with transaction.atomic():
                    user = User.objects.filter(email=email).first()

                    if user is None:
                        user = User(
                            email=email,
                            username=email,
                            nis=nis,
                            first_name=nama,
                            is_committee=True,
                            current_saldo=0,
                            is_active=True,
                        )
                        if division:
                            user.division_name = division
                        user.set_unusable_password()
                        user.save()
                        created_emails.append(email)
                        continue

                    changed = False

                    if not user.nis:
                        user.nis = nis
                        changed = True
                    if not user.first_name:
                        user.first_name = nama
                        changed = True
                    if division and (not user.division_name or user.division_name == "UNREGISTERED"):
                        user.division_name = division
                        changed = True
                    # role: no source data for it yet -- left untouched.
                    if not user.is_committee and email.endswith("@kanisius.sch.id"):
                        user.is_committee = True
                        changed = True
                    # current_saldo: "set to 0 only if currently exactly 0" is
                    # a no-op by definition (0 -> 0) -- nothing to write.
                    # password intentionally never touched here.

                    if changed:
                        user.save()
                        updated_emails.append(email)
                    else:
                        untouched_emails.append(email)

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"FAILED row {email}: {e}"))
                failed_rows.append((row, str(e)))

        self.stdout.write(self.style.SUCCESS(f"Created: {len(created_emails)}"))
        self.stdout.write(self.style.SUCCESS(f"Updated (blank fields filled / is_committee flipped): {len(updated_emails)}"))
        self.stdout.write(f"Already up to date, no changes: {len(untouched_emails)}")
        if failed_rows:
            self.stdout.write(self.style.ERROR(f"Failed: {len(failed_rows)} -- see stderr above, these rows were NOT imported"))

        if updated_emails:
            self.stdout.write("\n--- Updated emails ---")
            for e in updated_emails:
                self.stdout.write(e)