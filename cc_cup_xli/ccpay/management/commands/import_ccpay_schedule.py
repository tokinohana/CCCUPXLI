"""
Management command: bulk-import/upsert WeeklyDutySchedule rows from a CSV
produced by convert_schedule.py (columns: user_email, h1..h8 as True/False).

Place at: ccpay/management/commands/import_ccpay_schedule.py

Usage:
    python manage.py import_ccpay_schedule path/to/ccpay_schedule_import_clean.csv

Rules:
  - Match existing rows by user_email (unique=True on the model).
  - Existing row found -> h1..h8 are OVERWRITTEN with the CSV's values.
    Unlike the user-account import, there's no "existing data to protect"
    concept here: a schedule row's only content IS h1..h8, so re-running
    this command with corrected data is the intended way to fix a row
    (e.g. once Rafael/Nathanael's conflicts are manually resolved).
  - No existing row -> created.
  - Every row's user_email is checked against the User table; if no
    matching User exists, the schedule row is still created (the model
    doesn't enforce a FK) but the email is reported at the end as a
    warning, since a schedule with no matching account is presumably a
    data problem worth a second look.
  - Runs per-row-transactional so one bad row can't abort the whole batch.
"""
import csv

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from ccpay.models import WeeklyDutySchedule

User = get_user_model()

DAY_FIELDS = ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"]


class Command(BaseCommand):
    help = "Bulk-import/upsert WeeklyDutySchedule rows from a cleaned CSV."

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str)

    def handle(self, *args, **options):
        csv_path = options["csv_path"]

        try:
            with open(csv_path, newline="", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
        except FileNotFoundError:
            raise CommandError(f"File not found: {csv_path}")

        required_cols = {"user_email"} | set(DAY_FIELDS)
        if rows and not required_cols <= set(rows[0].keys()):
            raise CommandError(f"CSV missing required columns. Found: {list(rows[0].keys())}")

        created_emails = []
        updated_emails = []
        failed_rows = []
        no_matching_user = []

        for row in rows:
            email = row["user_email"].strip().lower()
            if not email:
                failed_rows.append((row, "missing user_email"))
                continue

            try:
                day_values = {f: row[f].strip().lower() == "true" for f in DAY_FIELDS}
            except KeyError as e:
                failed_rows.append((row, f"missing column {e}"))
                continue

            if not User.objects.filter(email=email).exists():
                no_matching_user.append(email)

            try:
                with transaction.atomic():
                    schedule, created = WeeklyDutySchedule.objects.get_or_create(
                        user_email=email,
                        defaults=day_values,
                    )
                    if created:
                        created_emails.append(email)
                    else:
                        for field, value in day_values.items():
                            setattr(schedule, field, value)
                        schedule.save()
                        updated_emails.append(email)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"FAILED row {email}: {e}"))
                failed_rows.append((row, str(e)))

        self.stdout.write(self.style.SUCCESS(f"Created: {len(created_emails)}"))
        self.stdout.write(self.style.SUCCESS(f"Updated (overwritten with CSV values): {len(updated_emails)}"))
        if failed_rows:
            self.stdout.write(self.style.ERROR(f"Failed: {len(failed_rows)} -- see stderr above"))
        if no_matching_user:
            self.stdout.write(self.style.WARNING(
                f"\n{len(no_matching_user)} schedule row(s) created/updated with no matching User account:"
            ))
            for e in no_matching_user:
                self.stdout.write(e)
