from django.core.management.base import BaseCommand
from ccpay.services import expire_daily_funds

class Command(BaseCommand):
    help = 'Expire daily shift funds (reset current_saldo to 0 and record EXPIRATION transactions)'

    def handle(self, *args, **options):
        self.stdout.write('Starting daily shift funds expiration...')
        try:
            count = expire_daily_funds()
            self.stdout.write(self.style.SUCCESS(f'Successfully expired funds for {count} users.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Failed to expire funds: {e}'))
