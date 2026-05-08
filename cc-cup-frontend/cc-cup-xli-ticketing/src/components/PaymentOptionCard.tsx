import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QrCode, Store, CalendarClock, CreditCard } from 'lucide-react';

const icons: Record<PaymentMethod, React.ElementType> = {
  qris_manual: QrCode,
  cash_booth: Store,
  cash_event_day: CalendarClock,
  midtrans: CreditCard,
};

interface PaymentOptionCardProps {
  method: PaymentMethod;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export default function PaymentOptionCard({ method, selected, disabled, onSelect }: PaymentOptionCardProps) {
  const Icon = icons[method];
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        selected && 'ring-2 ring-primary',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => !disabled && onSelect()}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium text-sm flex-1">{PAYMENT_METHOD_LABELS[method]}</span>
        {disabled && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
      </CardContent>
    </Card>
  );
}
