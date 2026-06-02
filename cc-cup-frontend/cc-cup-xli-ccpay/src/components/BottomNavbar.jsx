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
    // { label: 'Akun', icon: User, path: '/profile', activePaths: ['/profile'] },
  ];

  const isActive = (paths) => paths.includes(location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1e2226] bg-[#090a0b]/80 backdrop-blur-md flex justify-around items-center h-20 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const active = isActive(item.activePaths);
        const IconComponent = item.icon;
        
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center relative w-16 h-full transition-all duration-200 outline-none group cursor-pointer"
          >
            {/* Subtle Active Indicator Pill Behind/Above the Icon */}
            {active && (
              <span className="absolute top-0 w-8 h-1 bg-[#69ff87] rounded-b-full shadow-[0_2px_10px_rgba(105,255,135,0.4)] animate-in fade-in zoom-in-95 duration-200" />
            )}

            <div 
              className={`p-1.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                active 
                  ? 'text-[#69ff87] scale-105' 
                  : 'text-[#535c66] group-hover:text-[#8a939e] group-active:scale-95'
              }`}
            >
              <IconComponent 
                className={`h-5 w-5 transition-transform duration-200 ${
                  active ? 'stroke-[2.5]' : 'stroke-[2]'
                }`} 
              />
            </div>
            
            <span 
              className={`text-[10px] tracking-wide mt-0.5 transition-all duration-200 ${
                active 
                  ? 'text-white font-bold' 
                  : 'text-[#535c66] font-semibold group-hover:text-[#8a939e]'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;