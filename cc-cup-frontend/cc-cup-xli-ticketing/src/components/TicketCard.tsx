import { TicketTier } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Check } from 'lucide-react';

interface TicketCardProps {
  tier: TicketTier;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export default function TicketCard({ tier, quantity, onQuantityChange }: TicketCardProps) {
  return (
    <Card className={quantity > 0 ? 'ring-2 ring-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tier.name}</CardTitle>
          <span className="text-xl font-bold text-primary">{formatCurrency(tier.price)}</span>
        </div>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1">
          {tier.benefits.map(b => (
            <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-green-600" />
              {b}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{tier.available} available</span>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onQuantityChange(Math.max(0, quantity - 1))}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onQuantityChange(Math.min(tier.available, quantity + 1))}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
