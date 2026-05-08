import { Outlet, Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground font-bold text-lg">
            <Ticket className="h-5 w-5 text-primary" />
            EventTix
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/tickets" className="text-muted-foreground hover:text-foreground transition-colors">Tickets</Link>
            <Link to="/my-tickets" className="text-muted-foreground hover:text-foreground transition-colors">My Tickets</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 EventTix. All rights reserved.
      </footer>
    </div>
  );
}
