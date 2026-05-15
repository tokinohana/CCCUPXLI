from django.db import transaction
from django.utils import timezone
from .models import Shift, Transaction
from django.contrib.auth import get_user_model

User = get_user_model()

def distribute_daily_funds():
    """
    Finds all shifts for today that haven't been distributed yet,
    adds 35,000 to their saldo, and records the transaction.
    """
    today = timezone.localdate()
    amount = 35000
    
    with transaction.atomic():
        shifts_to_pay = Shift.objects.select_for_update().filter(
            date=today,
            is_distributed=False
        )
        
        count = 0
        for shift in shifts_to_pay:
            user = shift.user
            # Update user saldo
            user.current_saldo += amount
            user.save()
            
            # Record transaction
            Transaction.objects.create(
                receiver=user,
                amount=amount,
                type='DISTRIBUTION',
                description=f"Daily Shift Fund - {today}"
            )
            
            # Mark shift as paid
            shift.is_distributed = True
            shift.save()
            count += 1
            
    return count

def expire_daily_funds():
    """
    Resets all users' saldo to 0 and records the expiration transaction.
    Usually run at 17:00.
    """
    with transaction.atomic():
        users_with_saldo = User.objects.select_for_update().filter(current_saldo__gt=0)
        
        count = 0
        for user in users_with_saldo:
            amount = user.current_saldo
            
            # Record transaction
            Transaction.objects.create(
                sender=user,
                amount=amount,
                type='EXPIRATION',
                description=f"End of Day Fund Expiration"
            )
            
            # Reset saldo
            user.current_saldo = 0
            user.save()
            count += 1
            
    return count
