import { useParams, Link } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, CheckSquare } from 'lucide-react';

export default function OfflinePaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const order = getOrder(id || '');

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="link" asChild><Link to="/">Go Home</Link></Button>
      </div>
    );
  }

  const isBooth = order.paymentMethod === 'cash_booth';

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground text-center">
        {isBooth ? 'Pay at Booth' : 'Pay on Event Day'}
      </h1>

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Your Order Code</p>
          <p className="text-3xl font-mono font-bold text-foreground mt-1">{order.orderCode}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isBooth
              ? 'Campus Ticketing Booth — Building B, Ground Floor, Room B-01'
              : 'Event Entrance Gate — Grand Auditorium, Campus A'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Hours & Deadline</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          {isBooth ? (
            <>
              <p>Monday – Friday: 09:00 – 16:00</p>
              <p>Saturday: 09:00 – 12:00</p>
              <p className="font-medium text-foreground mt-2">Deadline: February 26, 2026</p>
            </>
          ) : (
            <>
              <p>Event Day: February 27, 2026</p>
              <p>Gate opens: 17:00</p>
              <p className="font-medium text-foreground mt-2">Pay before entering the venue</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckSquare className="h-4 w-4" /> What to Bring</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Order code: <strong className="text-foreground">{order.orderCode}</strong></li>
            <li>Valid student/national ID</li>
            <li>Exact cash payment</li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="link" asChild><Link to="/my-tickets">Back to My Tickets</Link></Button>
      </div>
    </div>
  );
}
