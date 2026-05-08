import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative">
      <section className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          Limited Seats Available
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-tight">
          Campus Music Festival 2026
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          An unforgettable night of live music, performances, and community. Join us for the biggest campus event of the year.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            February 27, 2026
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Grand Auditorium, Campus A
          </div>
        </div>
        <Button asChild size="lg" className="mt-10 text-base px-8">
          <Link to="/tickets">Buy Tickets</Link>
        </Button>
      </section>
    </div>
  );
}
