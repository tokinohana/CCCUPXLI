import { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Order } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, ScanLine, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

type ScanResult = 
  | { type: 'valid'; order: Order }
  | { type: 'used'; order: Order }
  | { type: 'unpaid'; order: Order }
  | { type: 'not_found' }
  | null;

export default function TicketScannerPage() {
  const { orders, updateOrderStatus } = useOrders();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ScanResult>(null);

  const lookup = (searchCode: string) => {
    const order = orders.find(o => o.orderCode === searchCode || o.id === searchCode);
    if (!order) {
      setResult({ type: 'not_found' });
    } else if (order.status === 'used') {
      setResult({ type: 'used', order });
    } else if (order.status !== 'paid') {
      setResult({ type: 'unpaid', order });
    } else {
      setResult({ type: 'valid', order });
    }
  };

  const simulateScan = () => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    if (paidOrders.length > 0) {
      const random = paidOrders[Math.floor(Math.random() * paidOrders.length)];
      setCode(random.orderCode);
      lookup(random.orderCode);
    } else {
      setResult({ type: 'not_found' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Ticket Scanner</h1>

      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border mb-4">
            <Camera className="h-16 w-16 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Camera viewport placeholder</p>
          </div>
          <Button className="w-full" onClick={simulateScan}>
            <ScanLine className="h-4 w-4 mr-2" />
            Simulate QR Scan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Manual Entry</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter order code (e.g. TIX-A1B2C3)"
          />
          <Button onClick={() => lookup(code)} disabled={!code}>Search</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-6">
            {result.type === 'valid' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-8 w-8" />
                  <span className="text-xl font-bold">VALID TICKET</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Name</p><p className="font-medium">{result.order.customerName}</p></div>
                  <div><p className="text-muted-foreground">Ticket</p><p className="font-medium">{result.order.items.map(i => `${i.quantity}x ${i.ticketTier.name}`).join(', ')}</p></div>
                  <div><p className="text-muted-foreground">Order</p><p className="font-mono font-medium">{result.order.orderCode}</p></div>
                  <div><p className="text-muted-foreground">Status</p><StatusBadge status={result.order.status} /></div>
                </div>
                <Button onClick={() => { updateOrderStatus(result.order.id, 'used'); setResult({ type: 'used', order: { ...result.order, status: 'used' } }); }}>
                  Mark as Used
                </Button>
              </div>
            )}
            {result.type === 'used' && (
              <div className="flex items-center gap-3 text-yellow-700">
                <AlertTriangle className="h-8 w-8" />
                <div>
                  <p className="text-xl font-bold">ALREADY USED</p>
                  <p className="text-sm text-muted-foreground">{result.order.customerName} — {result.order.orderCode}</p>
                </div>
              </div>
            )}
            {result.type === 'unpaid' && (
              <div className="flex items-center gap-3 text-red-700">
                <XCircle className="h-8 w-8" />
                <div>
                  <p className="text-xl font-bold">PAYMENT NOT COMPLETED</p>
                  <p className="text-sm text-muted-foreground">{result.order.customerName} — <StatusBadge status={result.order.status} /></p>
                </div>
              </div>
            )}
            {result.type === 'not_found' && (
              <div className="flex items-center gap-3 text-red-700">
                <XCircle className="h-8 w-8" />
                <p className="text-xl font-bold">TICKET NOT FOUND</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
