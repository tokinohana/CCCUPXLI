import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ScanLine, TicketPlus, Bell, Settings, User, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Scanner", href: "/scanner", icon: ScanLine },
    { name: "Registry", href: "/registry", icon: Terminal },
    { name: "Create Ticket", href: "/create-ticket", icon: TicketPlus },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-[#e5e2e3]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#131314] border-r-2 border-[#8c90a0] fixed h-screen z-40">
        <div className="p-6 flex flex-col gap-4">
          <div className="text-2xl font-bold text-[#b0c6ff] tracking-tight">RELAY</div>
          <div className="flex items-center gap-3 py-4 border-b border-[#424655]">
            <div className="w-10 h-10 bg-[#353436] border border-[#8c90a0] flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="font-mono text-sm font-semibold">Admin 01</p>
              <p className="font-mono text-[10px] text-[#c2c6d7]">Terminal 4</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all duration-100 ease-in-out",
                location.pathname === item.href
                  ? "bg-[#b0c6ff] text-[#002d6e] border-l-4 border-[#00e475]"
                  : "text-[#c2c6d7] hover:bg-[#2a2a2b]"
              )}
            >
              <item.icon size={20} />
              <span className="font-mono text-sm font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <Button className="w-full bg-[#00e475] text-[#003918] font-bold rounded-none hover:bg-[#62ff96]">
            SYSTEM CHECK
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 min-h-screen pb-20 md:pb-0">
        {/* Top Header */}
        <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 bg-[#131314] border-b border-[#424655] sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <div className="text-xl font-bold tracking-tighter text-[#b0c6ff] uppercase">RELAY v1.0</div>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#2a2a2b] border border-[#424655]">
              <div className="w-2 h-2 rounded-full bg-[#00e475] dot-pulse"></div>
              <span className="font-mono text-[10px] text-[#00e475] font-bold uppercase">Scanner Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-4">
              <Button asChild variant="outline" size="sm" className="bg-[#b0c6ff] text-[#002d6e] border-none rounded-none font-bold text-[10px] uppercase tracking-wider">
                <Link to="/create-ticket">+ Create Ticket</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-[#b0c6ff] text-[#b0c6ff] bg-transparent rounded-none font-bold text-[10px] uppercase tracking-wider">
                <Link to="/scanner">Open Scanner</Link>
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="text-[#b0c6ff]">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#b0c6ff]">
              <Settings size={20} />
            </Button>
            <div className="w-8 h-8 bg-[#353436] border border-[#8c90a0] ml-2 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-[#131314] border-t-2 border-[#8c90a0] md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 flex-1 h-full active:scale-95 duration-75",
              location.pathname === item.href
                ? "bg-[#b0c6ff] text-[#002d6e]"
                : "text-[#c2c6d7]"
            )}
          >
            <item.icon size={20} />
            <span className="font-mono text-[10px] mt-1 font-bold">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
