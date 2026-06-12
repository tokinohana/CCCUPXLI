import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from user.models import User
from ticketing.models import Ticket


# ── Mock data pools ───────────────────────────────────────────────────────────

FIRST_NAMES = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi',
    'Indra', 'Joko', 'Kartika', 'Lestari', 'Muhammad', 'Nadia', 'Omar',
    'Putri', 'Qori', 'Rizky', 'Siti', 'Taufik', 'Umar', 'Vina',
    'Wahyu', 'Xena', 'Yusuf', 'Zahra', 'Andi', 'Bella', 'Cahyo',
    'Dian', 'Elsa', 'Farhan', 'Gina', 'Hendra', 'Ika', 'Julian',
]

LAST_NAMES = [
    'Pratama', 'Saputra', 'Wijaya', 'Hidayat', 'Nugraha', 'Susanto',
    'Wibowo', 'Kurniawan', 'Santoso', 'Permana', 'Utami', 'Lestari',
    'Ramadhan', 'Setiawan', 'Firmansyah', 'Anggraini', 'Maulana',
    'Putri', 'Handayani', 'Sari', 'Putra', 'Dewi', 'Rahman', 'Hakim',
]

DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'mail.com']

GATES = ['GATE-A', 'GATE-B', 'GATE-C']


def generate_nik():
    """Generate a fake 16-digit Indonesian NIK."""
    # Province(2) + City(2) + District(2) + DOB(6) + Sequence(4)
    province = f"{random.randint(11, 91):02d}"
    city = f"{random.randint(1, 99):02d}"
    district = f"{random.randint(1, 99):02d}"
    day = random.randint(1, 28)
    month = random.randint(1, 12)
    year = random.randint(1990, 2006)
    dob = f"{day:02d}{month:02d}{year % 100:02d}"
    seq = f"{random.randint(1, 9999):04d}"
    return f"{province}{city}{district}{dob}{seq}"


def generate_phone():
    """Generate a fake Indonesian phone number."""
    prefix = random.choice(['0812', '0813', '0817', '0818', '0819', '0821', '0822', '0856', '0857', '0878'])
    return f"{prefix}{random.randint(10000000, 99999999)}"


class Command(BaseCommand):
    help = "Seed the database with mock ticketing data"

    def add_arguments(self, parser):
        parser.add_argument(
            '--count', type=int, default=40,
            help='Number of tickets to create (default: 40)'
        )
        parser.add_argument(
            '--clear', action='store_true',
            help='Delete all existing tickets before seeding'
        )

    def handle(self, *args, **options):
        count = options['count']
        clear = options['clear']

        if clear:
            deleted, _ = Ticket.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {deleted} existing tickets.'))

        # Get committee users to assign as scanners
        scanners = list(User.objects.filter(is_committee=True))
        if not scanners:
            self.stdout.write(self.style.WARNING(
                'No committee users found. Creating one...'
            ))
            scanner = User.objects.create_user(
                email='scanner@cccupxli.com',
                username='scanner',
                password='scanner123',
                is_committee=True,
            )
            scanners = [scanner]

        # Distribution: ~50% paid, ~30% pending, ~10% voided, ~10% redeemed
        statuses = (
            ['paid'] * 50 +
            ['pending'] * 30 +
            ['voided'] * 10 +
            ['paid'] * 10  # these will be redeemed
        )

        existing_tickets = Ticket.objects.count()
        created = 0
        skipped = 0

        for i in range(count):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            full_name = f"{first} {last}"
            email = f"{first.lower()}.{last.lower()}{random.randint(1, 99)}@{random.choice(DOMAINS)}"
            nik = generate_nik()

            # Ensure unique NIK
            while Ticket.objects.filter(identification_number=nik).exists():
                nik = generate_nik()

            ticket_status = random.choice(statuses)
            is_redeemed = False
            redeemed_at = None
            terminal = None
            scanned_by = None

            # ~15% of paid tickets are redeemed (gate entry)
            if ticket_status == 'paid' and random.random() < 0.30:
                is_redeemed = True
                terminal = random.choice(GATES)
                scanned_by = random.choice(scanners)
                # Redeemed sometime in the last 3 days
                redeemed_at = timezone.now() - timedelta(
                    hours=random.randint(1, 72),
                    minutes=random.randint(0, 59),
                )

            ticket = Ticket.objects.create(
                full_name=full_name,
                email=email,
                identification_number=nik,
                status=ticket_status,
                is_redeemed=is_redeemed,
                redeemed_at=redeemed_at,
                terminal=terminal,
                scanned_by=scanned_by,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {created} tickets. Total in DB: {Ticket.objects.count()}'
        ))

        # Print summary
        pending = Ticket.objects.filter(status='pending').count()
        paid = Ticket.objects.filter(status='paid').count()
        voided = Ticket.objects.filter(status='voided').count()
        redeemed = Ticket.objects.filter(is_redeemed=True).count()

        self.stdout.write(f'\n  Summary:')
        self.stdout.write(f'    Pending  : {pending}')
        self.stdout.write(f'    Paid     : {paid}')
        self.stdout.write(f'    Voided   : {voided}')
        self.stdout.write(f'    Redeemed : {redeemed}')

        if scanners:
            self.stdout.write(f'\n  Scanner accounts:')
            for s in scanners:
                self.stdout.write(f'    {s.email}')
