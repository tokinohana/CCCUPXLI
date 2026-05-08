import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@/types';
import { formatCurrency } from '@/utils/format';
import PaymentOptionCard from '@/components/PaymentOptionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const paymentMethods: { method: PaymentMethod; disabled?: boolean }[] = [
  { method: 'qris_manual' },
  { method: 'cash_booth' },
  { method: 'cash_event_day' },
  { method: 'midtrans', disabled: true },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, placeOrder } = useOrders();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  const total = cart.reduce((s, i) => s + i.ticketTier.price * i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button variant="link" onClick={() => navigate('/tickets')}>Go back to tickets</Button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!name || !email || !phone || !selectedPayment) return;
    const order = placeOrder({ name, email, phone, id: idNumber || undefined }, selectedPayment);
    navigate(`/order/${order.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order details</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {cart.map(item => (
            <div key={item.ticketTier.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.ticketTier.name}</span>
              <span className="font-medium">{formatCurrency(item.ticketTier.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Your Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNum">ID Number (optional)</Label>
            <Input id="idNum" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Student/National ID" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Payment Method</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.map(pm => (
            <PaymentOptionCard
              key={pm.method}
              method={pm.method}
              selected={selectedPayment === pm.method}
              disabled={pm.disabled}
              onSelect={() => setSelectedPayment(pm.method)}
            />
          ))}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={!name || !email || !phone || !selectedPayment}
        onClick={handleSubmit}
      >
        Place Order
      </Button>
    </div>
  );
}
