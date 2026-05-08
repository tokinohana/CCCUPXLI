import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, QrCode, History as HistoryIcon, User } from 'lucide-react';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Beranda', icon: Home, path: '/', activePaths: ['/'] },
    { label: 'Scan', icon: QrCode, path: '/scanner', activePaths: ['/scanner'] },
    { label: 'Riwayat', icon: HistoryIcon, path: '/history', activePaths: ['/history'] },
    { label: 'Akun', icon: User, path: '/profile', activePaths: ['/profile'] },
  ];

  const isActive = (paths) => paths.includes(location.pathname);

  return (
    <nav className="fixed bottom-0 w-full z-50 border-t border-zinc-100 bg-white flex justify-around items-center h-20 pb-safe shadow-[0_-4px_6px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const active = isActive(item.activePaths);
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center transition-all duration-150 outline-none p-2 ${
              active 
                ? 'text-zinc-950 font-bold active:scale-[0.95]' 
                : 'text-zinc-400 hover:text-zinc-700 active:scale-[0.95]'
            }`}
          >
            <item.icon className={`h-6 w-6 ${active ? 'fill-zinc-950' : ''}`} />
            <div className={`text-[11px] mt-1 ${active ? '' : 'font-medium'}`}>{item.label}</div>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;
