import { useParams, Link } from 'react-router-dom';
import { useOrders } from '@/context/OrderContext';
import { formatCurrency } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

export default function ManualQRISPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrder, updateOrderStatus } = useOrders();
  const order = getOrder(id || '');

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="link" asChild><Link to="/">Go Home</Link></Button>
      </div>
    );
  }

  const handlePaid = () => {
    updateOrderStatus(order.id, 'waiting_manual_verification');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground text-center">QRIS Payment</h1>

      <Card>
        <CardContent className="p-6 flex flex-col items-center space-y-4">
          <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <QrCode className="h-20 w-20 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">Scan the QR code above using your banking app</p>

          <div className="w-full bg-muted/50 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">Transfer Amount</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(order.totalAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Order: {order.orderCode}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Instructions</CardTitle></CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open your mobile banking or e-wallet app</li>
            <li>Select "Scan QR" or "QRIS Payment"</li>
            <li>Scan the QR code displayed above</li>
            <li>Verify the amount matches: <strong className="text-foreground">{formatCurrency(order.totalAmount)}</strong></li>
            <li>Complete the payment</li>
            <li>Click "I Have Paid" button below</li>
          </ol>
        </CardContent>
      </Card>

      {order.status === 'waiting_manual_verification' ? (
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">Payment submitted! Waiting for admin verification.</p>
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={handlePaid}>
          I Have Paid
        </Button>
      )}
    </div>
  );
}
