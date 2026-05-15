import csv
import datetime
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_date
from django.contrib.auth import get_user_model
from ccpay.models import Division, Shift

User = get_user_model()

class Command(BaseCommand):
    help = 'Import committee schedule from CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')
        parser.add_argument('--start-date', type=str, help='Start date for Day 1 (YYYY-MM-DD)', required=True)

    def handle(self, *args, **options):
        csv_path = options['csv_file']
        start_date_str = options['start_date']
        start_date = parse_date(start_date_str)

        if not start_date:
            self.stderr.write(self.style.ERROR('Invalid start date format. Use YYYY-MM-DD.'))
            return

        try:
            with open(csv_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                
                # Identify day columns (e.g., columns that start with 'Day' or match specific names)
                # For this implementation, we'll look for 'Day 1', 'Day 2', etc.
                day_cols = [col for col in reader.fieldnames if 'Day' in col]
                
                count_users = 0
                count_shifts = 0
                
                for row in reader:
                    nis = row.get('NIS')
                    name = row.get('Name')
                    email = row.get('Email')
                    committee_name = row.get('Committee')
                    
                    if not email:
                        continue
                        
                    # 1. Get or Create Division
                    division, _ = Division.objects.get_or_create(name=committee_name)
                    
                    # 2. Get or Create User
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'nis': nis,
                            'first_name': name,
                            'division': division,
                            'is_committee': True,
                            'role': 'MEMBER' # Default to Member, can be updated manually
                        }
                    )
                    if created:
                        count_users += 1
                    else:
                        # Update metadata if user exists
                        user.nis = nis
                        user.division = division
                        user.is_committee = True
                        user.save()

                    # 3. Process Shifts
                    for i, col in enumerate(day_cols):
                        val = row.get(col, '').strip().upper()
                        if val == 'X':
                            shift_date = start_date + datetime.timedelta(days=i)
                            shift, s_created = Shift.objects.get_or_create(
                                user=user,
                                date=shift_date
                            )
                            if s_created:
                                count_shifts += 1
                                
                self.stdout.write(self.style.SUCCESS(f'Successfully imported {count_users} new users and {count_shifts} shifts.'))
                
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'File {csv_path} not found.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'An error occurred: {e}'))
