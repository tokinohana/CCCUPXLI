from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction, IntegrityError
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Transaction, MerchantStand, Shift
from .serializers import UserBalanceSerializer, TransactionSerializer, PaymentRequestSerializer

User = get_user_model()

class UserBalanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserBalanceSerializer(request.user)
        return Response(serializer.data)

class UserTransactionListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Transactions where the user is either sender or receiver
        transactions = Transaction.objects.filter(
            receiver=request.user
        ).order_by('-timestamp') | Transaction.objects.filter(
            sender=request.user
        ).order_by('-timestamp')
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

class ProcessPaymentView(views.APIView):
    """
    Endpoint for merchants to process a payment.
    Expects NIS, amount, merchant_token, and reference_id.
    """
    def post(self, request):
        serializer = PaymentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        nis = serializer.validated_data['nis']
        amount = serializer.validated_data['amount']
        token = serializer.validated_data['merchant_token']
        reference_id = serializer.validated_data['reference_id']
        
        # 1. Validate Merchant
        merchant = get_object_or_404(MerchantStand, token=token, is_active=True)
        
        # 2. Check Idempotency (already processed)
        existing_txn = Transaction.objects.filter(reference_id=reference_id).first()
        if existing_txn:
            return Response({
                "status": "success",
                "new_balance": existing_txn.sender.current_saldo,
                "merchant": merchant.name,
                "duplicate": True
            })
        
        # 3. Find User
        user = get_object_or_404(User, nis=nis)
        
        # 4. Process Transaction
        try:
            with transaction.atomic():
                # Lock the user record to prevent race conditions
                user = User.objects.select_for_update().get(pk=user.pk)
                
                if user.current_saldo < amount:
                    return Response(
                        {"error": "Insufficient balance"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Deduct saldo
                user.current_saldo -= amount
                user.save()
                
                # Record transaction
                Transaction.objects.create(
                    sender=user,
                    receiver=None,
                    merchant_stand=merchant,
                    reference_id=reference_id,
                    amount=amount,
                    type='PAYMENT',
                    description=f"Payment at {merchant.name}"
                )
        except IntegrityError:
            # Concurrent duplicate: the unique constraint on reference_id fired.
            # The atomic block rolled back (no double-deduction). Fetch the
            # committed transaction from the winning request and return it.
            existing_txn = Transaction.objects.filter(reference_id=reference_id).first()
            return Response({
                "status": "success",
                "new_balance": existing_txn.sender.current_saldo if existing_txn and existing_txn.sender else 0,
                "merchant": merchant.name,
                "duplicate": True
            })
            
        return Response({
            "status": "success",
            "new_balance": user.current_saldo,
            "merchant": merchant.name
        })

class MerchantStatusView(views.APIView):
    """
    Returns merchant info based on token.
    """
    def get(self, request):
        token = request.query_params.get('token')
        merchant = get_object_or_404(MerchantStand, token=token, is_active=True)
        return Response({
            "name": merchant.name,
            "is_active": merchant.is_active
        })

class MerchantDashboardView(views.APIView):
    """
    Returns dashboard statistics, live transaction feeds, and daily historical earnings
    for a merchant stand based on its token.
    """
    def get(self, request):
        token = request.query_params.get('token')
        merchant = get_object_or_404(MerchantStand, token=token, is_active=True)
        
        today = timezone.localdate()
        
        # All successful payment transactions for this merchant
        merchant_txns = Transaction.objects.filter(merchant_stand=merchant, type='PAYMENT')
        
        # Today's transactions
        today_txns = merchant_txns.filter(timestamp__date=today)
        
        # Revenue sums
        total_revenue = merchant_txns.aggregate(total=Sum('amount'))['total'] or 0
        today_revenue = today_txns.aggregate(total=Sum('amount'))['total'] or 0
        today_count = today_txns.count()
        
        # Live feed (today's transactions ordered by time descending)
        live_feed = []
        for t in today_txns.order_by('-timestamp')[:50]:
            live_feed.append({
                "id": f"{t.id}-ID",
                "name": t.sender.first_name if t.sender else "Anonymous",
                "time": timezone.localtime(t.timestamp).strftime("%H:%M"),
                "amount": t.amount
            })
            
        # Daily history (grouped by date)
        daily_history = []
        history_query = (
            merchant_txns.annotate(date=TruncDate('timestamp'))
            .values('date')
            .annotate(count=Count('id'), amount=Sum('amount'))
            .order_by('-date')
        )
        
        for h in history_query:
            date_val = h['date']
            # Format to Day, Date Month (e.g. Monday, 18 Apr)
            date_str = date_val.strftime("%A, %d %b") if date_val else "Unknown"
            
            daily_history.append({
                "day": date_str,
                "count": h['count'],
                "amount": h['amount']
            })
            
        return Response({
            "merchant_name": merchant.name,
            "is_active": merchant.is_active,
            "total_revenue": total_revenue,
            "today_revenue": today_revenue,
            "today_count": today_count,
            "live_transactions": live_feed,
            "daily_history": daily_history
        })
