import zoneinfo
from django.db import transaction
from django.utils import timezone
from .models import Transaction, WeeklyDutySchedule
from django.contrib.auth import get_user_model

User = get_user_model()

WIB_TZ = zoneinfo.ZoneInfo("Asia/Jakarta")
DAILY_AMOUNT = 35000


def _today_wib():
    return timezone.now().astimezone(WIB_TZ).date()


def distribute_daily_funds():
    """
    Finds all active committee users eligible for CC PAY, adds DAILY_AMOUNT to
    their saldo, and records a system DISTRIBUTION ledger entry each.
    Targeted to execute at 12:00 WIB.

    If a user has a WeeklyDutySchedule row and today's weekday is explicitly
    False, they're skipped. If a user has NO schedule row yet (data hasn't
    been imported), they're included by default — this preserves the current
    blanket-distribution behavior until the real weekly schedule is imported.
    """
    today_wib = _today_wib()

    with transaction.atomic():
        eligible_users = list(User.objects.select_for_update().filter(
            is_committee=True,
            is_active=True
        ))

        schedules = {
            s.user_email: s for s in
            WeeklyDutySchedule.objects.filter(user_email__in=[u.email for u in eligible_users])
        }

        count = 0
        for user in eligible_users:
            schedule = schedules.get(user.email)
            if schedule is not None and not schedule.is_scheduled_on(today_wib):
                continue  # explicitly scheduled off today

            user.current_saldo += DAILY_AMOUNT
            user.save()

            Transaction.objects.create(
                sender=None,
                receiver=user.email,
                amount=DAILY_AMOUNT,
                type='DISTRIBUTION',
                description=f"Daily Committee Allowance - {today_wib} WIB"
            )
            count += 1

    return count


def expire_daily_funds():
    """
    Resets all users' current_saldo to 0 and records an EXPIRATION ledger.
    Targeted to execute at 17:00 WIB.
    """
    with transaction.atomic():
        # Only target active records that possess an unspent balance allocation
        users_with_saldo = User.objects.select_for_update().filter(
            is_committee=True,
            current_saldo__gt=0
        )

        count = 0
        for user in users_with_saldo:
            expired_amount = user.current_saldo

            Transaction.objects.create(
                sender=user.email,
                receiver=None,
                amount=expired_amount,
                type='EXPIRATION',
                description="End of Day Allowance Expiration (17:00 WIB)"
            )

            user.current_saldo = 0
            user.save()
            count += 1

    return count


def grant_todays_allowance_if_owed(user):
    """
    Safety net for late signups. Call this on every login (new or returning
    user). If today's distribution already ran but this committee member
    hasn't been credited yet — e.g. they created their account after the
    batch job fired — catch them up immediately instead of making them wait
    until tomorrow's run.

    Respects WeeklyDutySchedule the same way distribute_daily_funds() does:
    if they're explicitly scheduled off today, no catch-up is granted. If
    they have no schedule row yet, they're treated as eligible (matching the
    blanket-distribution fallback).

    Returns True if a catch-up credit was granted, False otherwise.
    """
    if not user.is_committee or not user.is_active:
        return False

    today_wib = _today_wib()

    schedule = WeeklyDutySchedule.objects.filter(user_email=user.email).first()
    if schedule is not None and not schedule.is_scheduled_on(today_wib):
        return False

    already_credited_today = Transaction.objects.filter(
        receiver=user.email, type='DISTRIBUTION', timestamp__date=today_wib
    ).exists()
    if already_credited_today:
        return False

    distribution_ran_today = Transaction.objects.filter(
        type='DISTRIBUTION', timestamp__date=today_wib
    ).exists()
    if not distribution_ran_today:
        return False  # today's batch hasn't fired yet — they'll get it in the normal run

    with transaction.atomic():
        user.current_saldo += DAILY_AMOUNT
        user.save()
        Transaction.objects.create(
            sender=None,
            receiver=user.email,
            amount=DAILY_AMOUNT,
            type='DISTRIBUTION',
            description=f"Late catch-up allowance - {today_wib} WIB"
        )

    return True