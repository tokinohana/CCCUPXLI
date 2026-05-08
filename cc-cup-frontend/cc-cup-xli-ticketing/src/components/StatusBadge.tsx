import { OrderStatus, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const statusStyles: Record<OrderStatus, string> = {
  paid: 'bg-green-100 text-green-800 border-green-200',
  pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  waiting_manual_verification: 'bg-blue-100 text-blue-800 border-blue-200',
  waiting_offline_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  used: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', statusStyles[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
