import { useParams, Link } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { formatCurrency, formatDate } from '@/utils/format';
import { PAYMENT_METHOD_LABELS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const order = getOrder(id || '');

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-4">We couldn't find order {id}</p>
        <Button asChild variant="link"><Link to="/">Go Home</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Your order has been placed successfully</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <StatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Order Code</p>
              <p className="font-mono font-bold">{order.orderCode}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            {order.items.map(item => (
              <div key={item.ticketTier.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.ticketTier.name}</span>
                <span className="font-medium">{formatCurrency(item.ticketTier.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            {order.paymentMethod === 'qris_manual' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Please complete your payment via QRIS:</p>
                <div className="flex gap-3">
                  <Button asChild><Link to={`/payment/manual/${order.id}`}>Go to QRIS Payment</Link></Button>
                </div>
              </div>
            )}
            {(order.paymentMethod === 'cash_booth' || order.paymentMethod === 'cash_event_day') && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Please complete your payment offline:</p>
                <Button asChild><Link to={`/payment/offline/${order.id}`}>View Payment Instructions</Link></Button>
              </div>
            )}
            {order.paymentMethod === 'midtrans' && (
              <p className="text-sm text-muted-foreground">Payment gateway coming soon. You will be notified when online payment is available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="link" asChild><Link to="/my-tickets">View My Tickets</Link></Button>
      </div>
    </div>
  );
}
