import { useOrders } from '@/context/OrderContext';
import StatCard from '@/components/StatCard';
import { Ticket, CheckCircle, Clock, Store, QrCode } from 'lucide-react';

export default function AdminDashboard() {
  const { orders } = useOrders();

  const totalSold = orders.reduce((s, o) => s + o.items.reduce((t, i) => t + i.quantity, 0), 0);
  const paid = orders.filter(o => o.status === 'paid' || o.status === 'used').length;
  const pending = orders.filter(o => ['pending_payment', 'waiting_offline_payment'].includes(o.status)).length;
  const offlineUnpaid = orders.filter(o => o.status === 'waiting_offline_payment').length;
  const manualQueue = orders.filter(o => o.status === 'waiting_manual_verification').length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Tickets Sold" value={totalSold} icon={Ticket} />
        <StatCard title="Paid Orders" value={paid} icon={CheckCircle} />
        <StatCard title="Pending Payments" value={pending} icon={Clock} />
        <StatCard title="Offline Unpaid" value={offlineUnpaid} icon={Store} />
        <StatCard title="Manual Verification Queue" value={manualQueue} icon={QrCode} />
      </div>
    </div>
  );
}
