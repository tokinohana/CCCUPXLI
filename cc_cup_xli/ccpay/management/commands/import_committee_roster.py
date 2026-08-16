"""
Usage:
    python manage.py import_committee_roster roster.csv

Expects a CSV with headers: Email, Name  (a NIS column is optional — if
present it's used directly, otherwise NIS is auto-derived from the email
prefix, same as the login flow does).

Uses User.objects.get_or_create()/.save() (not bulk_create) so that
User.save()'s username auto-fill override actually runs.

If a row's email already exists (e.g. someone self-registered before the
roster import ran), this backfills is_committee/nis rather than skipping —
so it's safe to run this before OR after people have started logging in.
"""
import csv
import re

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Bulk-create/update CCPay committee User rows from a CSV of Email, Name (and optional NIS)."

    def add_arguments(self, parser):
        parser.add_argument('csv_path', type=str)

    def handle(self, *args, **options):
        path = options['csv_path']

        try:
            f = open(path, newline='', encoding='utf-8-sig')
        except OSError as e:
            raise CommandError(f"Could not open {path}: {e}")

        created_count = 0
        updated_count = 0
        skipped = []

        with f:
            reader = csv.DictReader(f)
            for row in reader:
                email = (row.get('Email') or '').strip().lower()
                name = (row.get('Name') or '').strip()

                if not email or not email.endswith('@kanisius.sch.id'):
                    skipped.append((email or '(blank)', 'invalid or non-kanisius email'))
                    continue

                nis = (row.get('NIS') or '').strip()
                if not nis:
                    match = re.match(r'^(\d+)', email)
                    nis = match.group(1) if match else None
                if not nis:
                    skipped.append((email, 'no NIS column and no NIS prefix in email'))
                    continue

                name_parts = name.split(' ', 1)
                first_name = name_parts[0] if name_parts else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''

                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email,
                        'nis': nis,
                        'first_name': first_name,
                        'last_name': last_name,
                        'is_active': True,
                        'is_committee': True,
                        'current_saldo': 0,
                    }
                )

                if created:
                    created_count += 1
                else:
                    changed = False
                    if not user.is_committee:
                        user.is_committee = True
                        changed = True
                    if not user.nis:
                        user.nis = nis
                        changed = True
                    if changed:
                        user.save()
                        updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. Created {created_count}, updated {updated_count}, skipped {len(skipped)}."
        ))
        for email, reason in skipped:
            self.stdout.write(self.style.WARNING(f"Skipped {email}: {reason}"))