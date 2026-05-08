import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function OnlinePaymentPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-lg">
      <Card>
        <CardContent className="p-12 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Online Payment</h1>
          <p className="text-muted-foreground text-sm">
            Midtrans integration will be implemented later. Please choose an alternative payment method.
          </p>
          <Button variant="link" asChild><Link to="/my-tickets">Back to My Tickets</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
