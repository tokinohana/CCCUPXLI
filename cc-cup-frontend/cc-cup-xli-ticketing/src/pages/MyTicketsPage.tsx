import { Link } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { formatCurrency } from '@/utils/format';
import { PAYMENT_METHOD_LABELS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Ticket } from 'lucide-react';

export default function MyTicketsPage() {
  const { orders, updateOrderStatus } = useOrders();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">My Tickets</h1>
      <p className="text-muted-foreground mb-8">View and manage your event orders</p>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Button variant="link" asChild><Link to="/tickets">Browse Tickets</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">Order #{order.id}</CardTitle>
                  <StatusBadge status={order.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Code</p>
                    <p className="font-mono font-bold">{order.orderCode}</p>
                  </div>
                </div>

                {order.items.map(item => (
                  <div key={item.ticketTier.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.ticketTier.name}</span>
                    <span className="font-medium">{formatCurrency(item.ticketTier.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="flex justify-between font-bold text-sm border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>

                {order.status === 'paid' && (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-20 h-20 bg-background rounded border flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Your E-Ticket QR</p>
                      <p className="text-xs text-muted-foreground">Show this at the entrance</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {(order.status === 'pending_payment' && order.paymentMethod === 'qris_manual') && (
                    <Button size="sm" asChild><Link to={`/payment/manual/${order.id}`}>Continue Payment</Link></Button>
                  )}
                  {(order.status === 'waiting_offline_payment') && (
                    <Button size="sm" asChild><Link to={`/payment/offline/${order.id}`}>View Instructions</Link></Button>
                  )}
                  {['pending_payment', 'waiting_offline_payment'].includes(order.status) && (
                    <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
