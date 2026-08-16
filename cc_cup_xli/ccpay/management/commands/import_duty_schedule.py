"""
Usage:
    python manage.py import_duty_schedule schedule.csv

Expects a CSV with headers: Email, Name, Senin, Selasa, Rabu, Kamis, Jumat,
Sabtu, Minggu — matching the spreadsheet format described for CC Pay's
per-weekday distribution eligibility. Boolean columns accept
True/False/1/0/Yes/No/Ya/Tidak (case-insensitive).

Matches existing committee members by Email. Rows whose email doesn't match
any existing User are reported as unmatched rather than silently dropped —
run import_committee_roster.py first if you see a lot of these.
"""
import csv

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from ccpay.models import WeeklyDutySchedule

User = get_user_model()

FIELD_MAP = {
    'Senin': 'senin', 'Selasa': 'selasa', 'Rabu': 'rabu', 'Kamis': 'kamis',
    'Jumat': 'jumat', 'Sabtu': 'sabtu', 'Minggu': 'minggu',
}

TRUE_VALUES = {'true', '1', 'yes', 'ya'}


def parse_bool(value):
    return str(value or '').strip().lower() in TRUE_VALUES


class Command(BaseCommand):
    help = "Import per-weekday duty schedule from CSV (Email, Name, Senin..Minggu), matched by email."

    def add_arguments(self, parser):
        parser.add_argument('csv_path', type=str)

    def handle(self, *args, **options):
        path = options['csv_path']

        try:
            f = open(path, newline='', encoding='utf-8-sig')
        except OSError as e:
            raise CommandError(f"Could not open {path}: {e}")

        matched = 0
        unmatched = []

        with f:
            reader = csv.DictReader(f)
            for row in reader:
                email = (row.get('Email') or '').strip().lower()
                if not email:
                    continue

                user_exists = User.objects.filter(email=email).exists()
                if not user_exists:
                    unmatched.append(email)
                    continue

                schedule, _ = WeeklyDutySchedule.objects.get_or_create(user_email=email)
                for column, field in FIELD_MAP.items():
                    setattr(schedule, field, parse_bool(row.get(column)))
                schedule.save()
                matched += 1

        self.stdout.write(self.style.SUCCESS(f"Matched and updated {matched} schedule(s)."))
        for email in unmatched:
            self.stdout.write(self.style.WARNING(
                f"No existing User found for {email} — run import_committee_roster.py first if this is unexpected"
            ))