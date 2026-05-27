from django.core.management.base import BaseCommand
from ccpay.services import distribute_daily_funds

class Command(BaseCommand):
    help = 'Distribute daily shift funds (Rp 35,000) to students scheduled for a shift today'

    def handle(self, *args, **options):
        self.stdout.write('Starting daily shift funds distribution...')
        try:
            count = distribute_daily_funds()
            self.stdout.write(self.style.SUCCESS(f'Successfully distributed funds to {count} users.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Failed to distribute funds: {e}'))
