import zoneinfo
from django.db import transaction
from django.utils import timezone
from .models import Transaction
from django.contrib.auth import get_user_model

User = get_user_model()

def distribute_daily_funds():
    """
    Finds all active committee users eligible for CC PAY,
    adds 35,000 to their saldo, and records a system DISTRIBUTION ledger.
    Targeted to execute at 12:00 WIB.
    """
    wib_tz = zoneinfo.ZoneInfo("Asia/Jakarta")
    today_wib = timezone.now().astimezone(wib_tz).date()
    amount = 35000
    
    with transaction.atomic():
        # Fetching core committee users from the global shared monolith table
        eligible_users = User.objects.select_for_update().filter(
            is_committee=True,
            is_active=True
        )
        
        count = 0
        for user in eligible_users:
            user.current_saldo += amount
            user.save()
            
            Transaction.objects.create(
                sender=None,        
                receiver=user,      
                amount=amount,
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
            
            # FIXED: sender=user (Relational Object relinquishing funds), receiver=None
            Transaction.objects.create(
                sender=user,        
                receiver=None,      
                amount=expired_amount,
                type='EXPIRATION',
                description="End of Day Allowance Expiration (17:00 WIB)"
            )
            
            user.current_saldo = 0
            user.save()
            count += 1
            
    return count