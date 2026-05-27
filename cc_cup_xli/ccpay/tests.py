import uuid
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from .models import Transaction, MerchantStand

User = get_user_model()

PAYMENT_URL = '/api/ccpay/payment/'
DASHBOARD_URL = '/api/ccpay/merchant/dashboard/'


def make_user(email, nis, saldo=10_000):
    """Helper: create a test user with a given saldo."""
    user = User.objects.create_user(
        email=email,
        username=email.split('@')[0],
        password='testpass123',
        nis=nis,
        first_name='Test',
    )
    user.current_saldo = saldo
    user.save()
    return user


def make_merchant(name='Food Stand A', token='test-token-abc'):
    """Helper: create an active merchant stand."""
    return MerchantStand.objects.create(name=name, token=token, is_active=True)


class ProcessPaymentIdempotencyTests(TestCase):
    """
    Tests for the idempotency guarantee on POST /api/ccpay/payment/.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = make_user('student@test.com', nis='12345', saldo=10_000)
        self.merchant = make_merchant()
        self.ref_id = str(uuid.uuid4())
        self.payload = {
            'nis': '12345',
            'amount': 2_000,
            'merchant_token': 'test-token-abc',
            'reference_id': self.ref_id,
        }

    # ------------------------------------------------------------------ #
    #  Happy path                                                          #
    # ------------------------------------------------------------------ #

    def test_first_payment_succeeds_and_deducts_balance(self):
        """A fresh reference_id processes the payment and returns new balance."""
        response = self.client.post(PAYMENT_URL, self.payload, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['new_balance'], 8_000)
        self.assertFalse(response.data.get('duplicate', False))

        # Balance persisted
        self.user.refresh_from_db()
        self.assertEqual(self.user.current_saldo, 8_000)

        # One transaction record created
        self.assertEqual(Transaction.objects.filter(reference_id=self.ref_id).count(), 1)

    # ------------------------------------------------------------------ #
    #  Idempotency — sequential retry                                     #
    # ------------------------------------------------------------------ #

    def test_duplicate_request_returns_success_without_double_deduction(self):
        """
        Sending the same reference_id twice must:
        - Return HTTP 200 with status=success on the second call.
        - NOT deduct the balance again.
        - NOT create a second Transaction record.
        """
        # First call
        first = self.client.post(PAYMENT_URL, self.payload, format='json')
        self.assertEqual(first.status_code, 200)

        # Second call — identical payload (network retry simulation)
        second = self.client.post(PAYMENT_URL, self.payload, format='json')
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.data['status'], 'success')
        self.assertTrue(second.data.get('duplicate'), "Second response must carry duplicate=True")

        # Balance only deducted once
        self.user.refresh_from_db()
        self.assertEqual(self.user.current_saldo, 8_000)

        # Still exactly one transaction record
        self.assertEqual(Transaction.objects.filter(reference_id=self.ref_id).count(), 1)

    def test_idempotent_response_contains_correct_balance(self):
        """The duplicate response returns the balance as it stands after the original deduction."""
        self.client.post(PAYMENT_URL, self.payload, format='json')

        # Manually give user extra money between calls (simulates another top-up).
        # The duplicate response should still reflect the balance AT retry time.
        self.user.current_saldo += 5_000
        self.user.save()

        second = self.client.post(PAYMENT_URL, self.payload, format='json')
        # Balance should be whatever the user has NOW (13 000), not 8 000.
        self.assertEqual(second.data['new_balance'], 13_000)

    def test_different_reference_ids_each_deduct(self):
        """Two distinct reference_ids must each deduct independently."""
        ref2 = str(uuid.uuid4())

        self.client.post(PAYMENT_URL, self.payload, format='json')  # deducts 2 000
        payload2 = {**self.payload, 'reference_id': ref2}
        self.client.post(PAYMENT_URL, payload2, format='json')       # deducts another 2 000

        self.user.refresh_from_db()
        self.assertEqual(self.user.current_saldo, 6_000)
        self.assertEqual(Transaction.objects.count(), 2)

    # ------------------------------------------------------------------ #
    #  Validation errors                                                   #
    # ------------------------------------------------------------------ #

    def test_missing_reference_id_returns_400(self):
        """Omitting reference_id must fail validation."""
        payload = {k: v for k, v in self.payload.items() if k != 'reference_id'}
        response = self.client.post(PAYMENT_URL, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('reference_id', response.data)

    def test_invalid_reference_id_returns_400(self):
        """A non-UUID reference_id must fail validation."""
        payload = {**self.payload, 'reference_id': 'not-a-uuid'}
        response = self.client.post(PAYMENT_URL, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('reference_id', response.data)

    def test_invalid_merchant_token_returns_404(self):
        """An unknown merchant token must return 404."""
        payload = {**self.payload, 'merchant_token': 'wrong-token'}
        response = self.client.post(PAYMENT_URL, payload, format='json')
        self.assertEqual(response.status_code, 404)

    def test_inactive_merchant_returns_404(self):
        """A deactivated merchant must return 404."""
        self.merchant.is_active = False
        self.merchant.save()
        response = self.client.post(PAYMENT_URL, self.payload, format='json')
        self.assertEqual(response.status_code, 404)

    def test_insufficient_balance_returns_400(self):
        """Attempting to deduct more than the user's balance must return 400."""
        payload = {**self.payload, 'amount': 99_999}
        response = self.client.post(PAYMENT_URL, payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

        # Balance must be untouched
        self.user.refresh_from_db()
        self.assertEqual(self.user.current_saldo, 10_000)

    def test_unknown_nis_returns_404(self):
        """An unknown NIS must return 404."""
        payload = {**self.payload, 'nis': '99999'}
        response = self.client.post(PAYMENT_URL, payload, format='json')
        self.assertEqual(response.status_code, 404)

    # ------------------------------------------------------------------ #
    #  Transaction record integrity                                        #
    # ------------------------------------------------------------------ #

    def test_transaction_linked_to_merchant_stand(self):
        """Created transaction must reference the correct merchant stand."""
        self.client.post(PAYMENT_URL, self.payload, format='json')
        txn = Transaction.objects.get(reference_id=self.ref_id)
        self.assertEqual(txn.merchant_stand, self.merchant)

    def test_transaction_reference_id_stored(self):
        """reference_id on the saved transaction must match what was sent."""
        self.client.post(PAYMENT_URL, self.payload, format='json')
        txn = Transaction.objects.get(reference_id=self.ref_id)
        self.assertEqual(str(txn.reference_id), self.ref_id)

    def test_transaction_type_is_payment(self):
        """Payment transactions must have type='PAYMENT'."""
        self.client.post(PAYMENT_URL, self.payload, format='json')
        txn = Transaction.objects.get(reference_id=self.ref_id)
        self.assertEqual(txn.type, 'PAYMENT')


class MerchantDashboardTests(TestCase):
    """
    Tests for GET /api/ccpay/merchant/dashboard/.
    """

    def setUp(self):
        self.client = APIClient()
        self.merchant = make_merchant('Canteen A', 'dash-token-xyz')
        self.user = make_user('buyer@test.com', nis='55555', saldo=50_000)
        self._make_payment(3_000)
        self._make_payment(4_000)

    def _make_payment(self, amount):
        """Helper: process a payment directly through the API."""
        payload = {
            'nis': '55555',
            'amount': amount,
            'merchant_token': 'dash-token-xyz',
            'reference_id': str(uuid.uuid4()),
        }
        resp = self.client.post(PAYMENT_URL, payload, format='json')
        self.assertEqual(resp.status_code, 200)

    def _get_dashboard(self, token='dash-token-xyz'):
        return self.client.get(DASHBOARD_URL, {'token': token})

    # ------------------------------------------------------------------ #

    def test_dashboard_returns_200_for_valid_token(self):
        response = self._get_dashboard()
        self.assertEqual(response.status_code, 200)

    def test_dashboard_returns_404_for_invalid_token(self):
        response = self._get_dashboard(token='nonexistent')
        self.assertEqual(response.status_code, 404)

    def test_dashboard_merchant_name(self):
        response = self._get_dashboard()
        self.assertEqual(response.data['merchant_name'], 'Canteen A')

    def test_today_revenue_matches_payments(self):
        """today_revenue must equal the sum of all test payments (3 000 + 4 000)."""
        response = self._get_dashboard()
        self.assertEqual(response.data['today_revenue'], 7_000)

    def test_today_count_matches_payments(self):
        response = self._get_dashboard()
        self.assertEqual(response.data['today_count'], 2)

    def test_total_revenue_equals_today_revenue_when_all_txns_are_today(self):
        response = self._get_dashboard()
        self.assertEqual(response.data['total_revenue'], response.data['today_revenue'])

    def test_live_transactions_ordered_newest_first(self):
        """live_transactions must be ordered descending by time."""
        response = self._get_dashboard()
        live = response.data['live_transactions']
        self.assertEqual(len(live), 2)
        # Amounts should be 4 000 first (newer), then 3 000
        self.assertEqual(live[0]['amount'], 4_000)
        self.assertEqual(live[1]['amount'], 3_000)

    def test_daily_history_has_one_entry_for_today(self):
        """All test payments happened today, so daily_history should have one bucket."""
        response = self._get_dashboard()
        self.assertEqual(len(response.data['daily_history']), 1)

    def test_daily_history_amount_correct(self):
        response = self._get_dashboard()
        self.assertEqual(response.data['daily_history'][0]['amount'], 7_000)

    def test_daily_history_count_correct(self):
        response = self._get_dashboard()
        self.assertEqual(response.data['daily_history'][0]['count'], 2)

    def test_inactive_merchant_dashboard_returns_404(self):
        self.merchant.is_active = False
        self.merchant.save()
        response = self._get_dashboard()
        self.assertEqual(response.status_code, 404)

    def test_merchant_with_no_transactions_returns_zero_revenue(self):
        """A fresh merchant with zero transactions must still return valid zeroes."""
        make_merchant('Empty Stand', 'empty-token')
        response = self._get_dashboard(token='empty-token')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['today_revenue'], 0)
        self.assertEqual(response.data['total_revenue'], 0)
        self.assertEqual(response.data['today_count'], 0)
        self.assertEqual(response.data['live_transactions'], [])
        self.assertEqual(response.data['daily_history'], [])
