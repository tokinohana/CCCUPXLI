import { useOrders } from '@/context/OrderContext';
import { PAYMENT_METHOD_LABELS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function PaymentVerificationPage() {
  const { orders, updateOrderStatus } = useOrders();

  const autoConfirmed = orders.filter(o => o.status === 'paid' || o.status === 'used');
  const manualWaiting = orders.filter(o => o.status === 'waiting_manual_verification');
  const offlineWaiting = orders.filter(o => o.status === 'waiting_offline_payment');

  const renderTable = (data: typeof orders, showActions: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No orders</TableCell></TableRow>
        ) : data.map(order => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-sm">{order.id}</TableCell>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</TableCell>
            <TableCell><StatusBadge status={order.status} /></TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, 'paid')}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>Cancel</Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payment Verification</h1>
      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="auto">Online ({autoConfirmed.length})</TabsTrigger>
          <TabsTrigger value="manual">Manual QRIS ({manualWaiting.length})</TabsTrigger>
          <TabsTrigger value="offline">Offline ({offlineWaiting.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="auto">{renderTable(autoConfirmed, false)}</TabsContent>
        <TabsContent value="manual">{renderTable(manualWaiting, true)}</TabsContent>
        <TabsContent value="offline">{renderTable(offlineWaiting, true)}</TabsContent>
      </Tabs>
    </div>
  );
}
