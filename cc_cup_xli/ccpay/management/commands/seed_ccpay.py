import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from ccpay.models import MerchantStand, Transaction

User = get_user_model()

class Command(BaseCommand):
    help = "Wipes out previous records and populates Neon database with realistic mock data for CCPAY."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Wiping out old CCPAY data..."))
        
        Transaction.objects.all().delete()
        MerchantStand.objects.all().delete()
        
        User.objects.filter(is_superuser=False, email__contains="@kanisius.sch.id").delete()

        self.stdout.write(self.style.SUCCESS("Database cleaned successfully. Starting data generation..."))

        merchant_presets = [
            {"name": "Kantin Pusat 01", "token": "token_01"},
            {"name": "Steak & Grill", "token": "token_02"},
            {"name": "Kantin 03 (Warteg)", "token": "token_03"},
            {"name": "Gorengan Pak No", "token": "token_04"},
            {"name": "Es Campur Segar", "token": "token_05"},
            {"name": "Kantin Sehat - Stand 04", "token": "token_04_alt"},
        ]
        
        merchants = []
        for preset in merchant_presets:
            m = MerchantStand.objects.create(
                name=preset["name"],
                token=preset["token"],
                is_active=True
            )
            merchants.append(m)
            self.stdout.write(f"Created Merchant Stand: {m.name}")

        student_presets = [
            {"name": "Ahmad Fauzi", "email": "ahmad@kanisius.sch.id", "nis": "10021", "saldo": 75000},
            {"name": "Siti Aminah", "email": "siti@kanisius.sch.id", "nis": "10022", "saldo": 120000},
            {"name": "Kevin Pratama", "email": "kevin@kanisius.sch.id", "nis": "10023", "saldo": 45000},
            {"name": "Budi Santoso", "email": "budi@kanisius.sch.id", "nis": "10024", "saldo": 150000},
            {"name": "Rian Hidayat", "email": "rian@kanisius.sch.id", "nis": "10025", "saldo": 35000},
        ]

        students = []
        for p in student_presets:
            first_name = p["name"].split()[0]
            
            u = User.objects.create(
                username=p["email"],
                email=p["email"],
                first_name=first_name,
                current_saldo=p["saldo"],
                is_active=True
            )
            u.set_password("password123")
            u.save()
            students.append(u)
            self.stdout.write(f"Created Student User: {p['name']} (Saldo: Rp {p['saldo']})")

        now = timezone.now()
        amounts_pool = [10000, 15000, 18500, 22000, 35000, 45000, 50000]
        descriptions_pool = ["Makan Siang", "Minuman Dingin", "Camilan Istirahat", "Pembelian Kupon", "Jajanan Sore"]

        self.stdout.write(self.style.HTTP_INFO("Simulating today's live business activity..."))
        for i in range(15):
            student = random.choice(students)
            merchant = random.choice(merchants)
            amount = random.choice(amounts_pool)
            
            minutes_ago = random.randint(2, 240)
            txn_timestamp = now - timezone.timedelta(minutes=minutes_ago)
            
            txn = Transaction.objects.create(
                sender=student.email,
                receiver=None,
                merchant_stand=merchant,
                amount=amount,
                type="PAYMENT",
                reference_id=f"REF-{random.randint(100000, 999999)}",
                description=random.choice(descriptions_pool)
            )
            Transaction.objects.filter(id=txn.id).update(timestamp=txn_timestamp)

        self.stdout.write(self.style.HTTP_INFO("Compiling historical settlement ledgers..."))
        for days_back in [1, 2, 3]:
            for i in range(random.randint(5, 10)):
                student = random.choice(students)
                merchant = random.choice(merchants)
                amount = random.choice(amounts_pool)
                
                historical_timestamp = now - timezone.timedelta(days=days_back, hours=random.randint(1, 8))
                
                txn = Transaction.objects.create(
                    sender=student.email,
                    receiver=None,
                    merchant_stand=merchant,
                    amount=amount,
                    type="PAYMENT",
                    reference_id=f"REF-HIST-{days_back}-{random.randint(100000, 999999)}",
                    description="Historical Ledger Record"
                )
                Transaction.objects.filter(id=txn.id).update(timestamp=historical_timestamp)

        self.stdout.write(self.style.SUCCESS("🎉 Successfully seeded your Neon Database with mock assets!"))