import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketTiers } from '@/mockData/tickets';
import { useOrders } from '@/context/OrderContext';
import { formatCurrency } from '@/utils/format';
import TicketCard from '@/components/TicketCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TicketSelectionPage() {
  const navigate = useNavigate();
  const { setCart } = useOrders();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const items = ticketTiers.map(t => ({
    tier: t,
    qty: quantities[t.id] || 0,
  })).filter(i => i.qty > 0);

  const total = items.reduce((s, i) => s + i.tier.price * i.qty, 0);

  const handleContinue = () => {
    setCart(items.map(i => ({ ticketTier: i.tier, quantity: i.qty })));
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Select Your Tickets</h1>
      <p className="text-muted-foreground mb-8">Choose your experience for Campus Music Festival 2026</p>

      <div className="space-y-4">
        {ticketTiers.map(tier => (
          <TicketCard
            key={tier.id}
            tier={tier}
            quantity={quantities[tier.id] || 0}
            onQuantityChange={qty => setQuantities(prev => ({ ...prev, [tier.id]: qty }))}
          />
        ))}
      </div>

      {items.length > 0 && (
        <Card className="mt-8 sticky bottom-4">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {items.map(i => `${i.qty}x ${i.tier.name}`).join(', ')}
              </p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(total)}</p>
            </div>
            <Button size="lg" onClick={handleContinue}>Continue to Checkout</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
