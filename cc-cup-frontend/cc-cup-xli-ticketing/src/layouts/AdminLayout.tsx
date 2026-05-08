import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, ScanLine, ListOrdered, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Payments', path: '/admin/payments', icon: CreditCard },
  { title: 'Scanner', path: '/admin/scan', icon: ScanLine },
  { title: 'Orders', path: '/admin/orders', icon: ListOrdered },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 border-r bg-card flex flex-col shrink-0">
        <div className="h-16 border-b flex items-center px-4 gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Public Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
