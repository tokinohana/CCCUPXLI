"""
Read-only simulation of distribute_daily_funds()'s eligibility logic for a
given date. Prints who WOULD receive funds -- writes nothing to the DB.

Place at: ccpay/management/commands/check_schedule_dry_run.py

Usage:
    python manage.py check_schedule_dry_run --date 2026-09-19
    python manage.py check_schedule_dry_run --date 2026-09-26 --email 2516131.rafael@kanisius.sch.id
    python manage.py check_schedule_dry_run --date 2026-09-19 --verbose
"""
from datetime import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from ccpay.models import WeeklyDutySchedule

User = get_user_model()


class Command(BaseCommand):
    help = "Dry-run: shows who would receive daily funds on a given date, without writing anything."

    def add_arguments(self, parser):
        parser.add_argument("--date", required=True, help="YYYY-MM-DD")
        parser.add_argument("--email", help="Check a single user instead of everyone")
        parser.add_argument("--verbose", action="store_true", help="List every included/excluded email")

    def handle(self, *args, **options):
        try:
            target_date = datetime.strptime(options["date"], "%Y-%m-%d").date()
        except ValueError:
            raise CommandError("--date must be YYYY-MM-DD")

        users = User.objects.filter(is_committee=True, is_active=True)
        if options.get("email"):
            users = users.filter(email=options["email"])
            if not users.exists():
                raise CommandError(f"No committee user found with email {options['email']}")

        schedules = {
            s.user_email: s
            for s in WeeklyDutySchedule.objects.filter(user_email__in=[u.email for u in users])
        }

        included = []
        excluded_by_schedule = []
        no_schedule_row = []

        for user in users:
            schedule = schedules.get(user.email)
            if schedule is None:
                # matches distribute_daily_funds()'s blanket-fallback behavior
                no_schedule_row.append(user.email)
                included.append(user.email)
                continue

            if schedule.is_scheduled_on(target_date):
                included.append(user.email)
            else:
                excluded_by_schedule.append(user.email)

        self.stdout.write(self.style.SUCCESS(f"Date: {target_date}"))
        self.stdout.write(f"Would receive funds: {len(included)}")
        self.stdout.write(f"Excluded (scheduled off today): {len(excluded_by_schedule)}")
        self.stdout.write(self.style.WARNING(
            f"No schedule row at all (blanket-included via fallback): {len(no_schedule_row)}"
        ))

        if options.get("verbose") or options.get("email"):
            self.stdout.write("\n--- Included ---")
            for e in included:
                self.stdout.write(e)
            self.stdout.write("\n--- Excluded (scheduled off) ---")
            for e in excluded_by_schedule:
                self.stdout.write(e)
            self.stdout.write("\n--- No schedule row (fallback) ---")
            for e in no_schedule_row:
                self.stdout.write(e)