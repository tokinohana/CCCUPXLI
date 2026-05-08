import { useState, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { PaymentMethod, OrderStatus, PAYMENT_METHOD_LABELS, STATUS_LABELS } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function OrdersManagementPage() {
  const { orders } = useOrders();
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTicket, setFilterTicket] = useState<string>('all');

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (filterPayment !== 'all' && o.paymentMethod !== filterPayment) return false;
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (filterTicket !== 'all' && !o.items.some(i => i.ticketTier.type === filterTicket)) return false;
      return true;
    });
  }, [orders, filterPayment, filterStatus, filterTicket]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Orders Management</h1>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Payment Method</Label>
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(m => (
                <SelectItem key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ticket Type</Label>
          <Select value={filterTicket} onValueChange={setFilterTicket}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="vvip">VVIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Tickets</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No orders match filters</TableCell></TableRow>
          ) : filtered.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell className="text-sm">{order.items.map(i => `${i.quantity}x ${i.ticketTier.name}`).join(', ')}</TableCell>
              <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
              <TableCell className="text-sm">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</TableCell>
              <TableCell><StatusBadge status={order.status} /></TableCell>
              <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
