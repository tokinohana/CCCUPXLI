from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction, IntegrityError
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Transaction, MerchantStand
from .serializers import (
    UserBalanceSerializer, 
    TransactionSerializer, 
    PaymentRequestSerializer,
    StudentDashboardSerializer
)
import os
import re

User = get_user_model()

class GoogleConfigView(views.APIView):
    """
    Exposes the Google Client ID dynamically to the frontend client initialization layers.
    """
    def get(self, request):
        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        if not client_id:
            return Response({"error": "Google Client ID configuration missing on server"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"client_id": client_id}, status=status.HTTP_200_OK)

class GoogleOAuthLoginView(views.APIView):
    """
    Handles Google ID Token verification natively from GIS,
    strictly filtering by domain, automatically extracting the student's NIS from their email,
    and auto-creating the global User if they don't exist yet.
    """
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_id = os.environ.get('GOOGLE_CLIENT_ID')
            id_info = id_token.verify_oauth2_token(token, requests.Request(), client_id)

            email = id_info.get('email', '')
            if not email or not email.endswith("@kanisius.sch.id"):
                return Response(
                    {"error": "Akses ditolak. Anda harus login menggunakan akun email resmi @kanisius.sch.id"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # 🌟 MAGIC LOCKPOINT: Extract NIS prefix from email before creating user
            # Example: "2415517benedict@kanisius.sch.id" -> "2415517"
            match = re.match(r'^(\d+)', email)
            extracted_nis = match.group(1) if match else None

            # If the email format doesn't contain a leading number sequence, reject it early
            if not extracted_nis:
                return Response(
                    {"error": "Format email tidak valid. Prefiks nomor NIS tidak ditemukan."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')

            # 🌟 FIXED: Include 'nis' in the defaults block for seamless onboarding
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'nis': extracted_nis,  # ✨ Saved permanently to DB here
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_active': True,
                    'current_saldo': 50000  # Give new test users some starter pocket cash if needed!
                }
            )

            # Backwards compatibility guard: if user existed before this update but has an empty NIS field, backfill it now!
            if not user.nis:
                user.nis = extracted_nis
                user.save()

            if not created and not user.first_name:
                user.first_name = first_name
                user.save()

            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "Login berhasil" if not created else "Registrasi akun baru berhasil",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "role": getattr(user, 'role', 'MEMBER')
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"error": "Token Google tidak valid atau kadaluwarsa"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Terjadi kesalahan sistem: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    

class StudentDashboardAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # 🌟 FIXED: Use user.email string matching and select_related only on merchant_stand
        transactions = (
            Transaction.objects.filter(Q(sender=user.email) | Q(receiver=user.email))
            .select_related('merchant_stand')
            .order_by('-timestamp')[:10]
        )
        
        supervisor_mapping = {
            "Logistik": "Capt. Sarah",
            "Acara": "Capt. Baskara",
            "Konsumsi": "Capt. Amanda"
        }
        division_name = user.division_name if user.division_name else "Food Service"

        serializer = StudentDashboardSerializer({
            "user": user,
            "shift_start": "12:00",
            "shift_end": "15:00",
            "supervisor_name": supervisor_mapping.get(division_name, "Center Coordinator"),
            "transactions": transactions
        })
        return Response(serializer.data)


class UserBalanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(UserBalanceSerializer(request.user).data)


class UserTransactionListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # 🌟 FIXED: Filter using request.user.email string representation instead of the object
        transactions = (
            Transaction.objects.filter(Q(sender=request.user.email) | Q(receiver=request.user.email))
            .select_related('merchant_stand')
            .order_by('-timestamp')
        )
        return Response(TransactionSerializer(transactions, many=True).data)


class ProcessPaymentView(views.APIView):
    """
    Handles student balance deductions by securely extracting the student's NIS 
    from their authenticated Google email token context with descriptive error tracking.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        amount = serializer.validated_data['amount']
        token = serializer.validated_data['merchant_token']
        reference_id = serializer.validated_data['reference_id']
        
        # 1. Secure Access Control: Pull user from request context
        user_email = request.user.email 
        
        # 2. Extract the NIS prefix from email string
        match = re.match(r'^(\d+)', user_email)
        if not match:
            return Response(
                {"error": f"Format email '{user_email}' tidak valid. NIS gagal diekstrak."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        extracted_nis = match.group(1)
        
        # 3. Defensive Database Queries (Goodbye blind 404s!)
        merchant = MerchantStand.objects.filter(token=token, is_active=True).first()
        if not merchant:
            return Response(
                {"error": f"Merchant tidak ditemukan! Token yang dikirim: '{token}' salah atau tidak aktif."},
                status=status.HTTP_400_BAD_REQUEST # Changed to 400 so we read it easily
            )
            
        user = User.objects.filter(nis=extracted_nis).first()
        if not user:
            return Response(
                {"error": f"User dengan NIS '{extracted_nis}' belum terdaftar di database."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 4. Atomic Execution Pipeline Block
        try:
            with transaction.atomic():
                locked_user = User.objects.select_for_update().get(pk=user.pk)
                
                existing_txn = Transaction.objects.filter(reference_id=reference_id).first()
                if existing_txn:
                    return Response({
                        "status": "success",
                        "new_balance": locked_user.current_saldo,
                        "merchant": merchant.name,
                        "duplicate": True
                    })
                
                if locked_user.current_saldo < amount:
                    return Response({"error": "Sisa saldo Anda tidak mencukupi."}, status=status.HTTP_400_BAD_REQUEST)
                
                locked_user.current_saldo -= amount
                locked_user.save()
                
                Transaction.objects.create(
                    sender=locked_user.email,
                    receiver=None,
                    merchant_stand=merchant,
                    reference_id=reference_id,
                    amount=amount,
                    type='PAYMENT',
                    description=f"Pembayaran di {merchant.name}"
                )
        except IntegrityError:
            user.refresh_from_db()
            return Response({
                "status": "success",
                "new_balance": user.current_saldo,
                "merchant": merchant.name,
                "duplicate": True
            })
            
        return Response({
            "status": "success",
            "new_balance": locked_user.current_saldo,
            "merchant": merchant.name
        })

class MerchantDashboardView(views.APIView):
    def get(self, request):
        token = request.query_params.get('token')
        merchant = get_object_or_404(MerchantStand, token=token, is_active=True)
        
        today = timezone.localdate()
        merchant_txns = Transaction.objects.filter(merchant_stand=merchant, type='PAYMENT')
        today_txns = merchant_txns.filter(timestamp__date=today)
        
        total_revenue = merchant_txns.aggregate(total=Sum('amount'))['total'] or 0
        today_revenue = today_txns.aggregate(total=Sum('amount'))['total'] or 0
        today_count = today_txns.count()
        
        # 🌟 OPTIMIZATION: Slice the query first before processing to keep memory low
        recent_today_txns = today_txns.order_by('-timestamp')[:50]
        
        # 🌟 OPTIMIZATION: Bulk look up student names in ONE query to avoid N+1 issues
        sender_emails = [t.sender for t in recent_today_txns if t.sender]
        user_map = {
            u.email: u.first_name for u in User.objects.filter(email__in=sender_emails)
        }
        
        live_feed = []
        for t in recent_today_txns:
            # Look up the clean first name from our map. 
            # If not found, use the email. If email is missing, default to "Anonymous"
            friendly_name = user_map.get(t.sender, t.sender if t.sender else "Anonymous")
            
            # Capitalize it nicely for the merchant dashboard UI
            if friendly_name and "@" in friendly_name:
                # Fallback if it's a raw email: strip the domain and capitalize
                friendly_name = friendly_name.split('@')[0].capitalize()
            elif friendly_name:
                friendly_name = friendly_name.title()

            live_feed.append({
                "id": f"{t.id}-ID",
                "name": friendly_name,  # ✨ Displays "Benedict" instead of "2415517benedict@kanisius.sch.id"
                "time": timezone.localtime(t.timestamp).strftime("%H:%M"),
                "amount": t.amount
            })
            
        daily_history = []
        history_query = (
            merchant_txns.annotate(date=TruncDate('timestamp'))
            .values('date')
            .annotate(count=Count('id'), amount=Sum('amount'))
            .order_by('-date')
        )
        for h in history_query:
            date_val = h['date']
            daily_history.append({
                "day": date_val.strftime("%A, %d %b") if date_val else "Unknown",
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

class MerchantStatusView(views.APIView):
    def get(self, request):
        merchant = get_object_or_404(MerchantStand, token=request.query_params.get('token'), is_active=True)
        return Response({"name": merchant.name, "is_active": merchant.is_active})


class MerchantListView(views.APIView):
    """
    Returns a list of all active merchant stands.
    """
    def get(self, request):
        merchants = MerchantStand.objects.filter(is_active=True).order_by('name')
        
        data = []
        for m in merchants:
            data.append({
                "id": m.id,
                "name": m.name,
                "token": m.token
            })
            
        return Response(data, status=status.HTTP_200_OK)


class MerchantLookupView(views.APIView):
    """
    Securely looks up a single merchant stand by its exact name.
    """
    def get(self, request):
        name = request.query_params.get('name', '').strip()
        
        if not name:
            return Response({"error": "Name parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        merchant = MerchantStand.objects.filter(name__iexact=name, is_active=True).first()
        
        if not merchant:
            return Response({"error": "Merchant not found"}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({
            "id": merchant.id,
            "name": merchant.name,
            "token": merchant.token
        }, status=status.HTTP_200_OK)

