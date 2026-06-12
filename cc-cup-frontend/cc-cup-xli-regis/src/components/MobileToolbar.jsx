// src/components/MobileToolbar.jsx
import React from 'react';

export default function MobileToolbar({ onLogout }) {
  return (
    <nav className="md:hidden sticky bottom-0 bg-white border-t-2 border-black w-full py-3 px-6 flex justify-around items-center z-40 shadow-md">
      
      {/* Mobile Home Portal Route Link */}
      <a href="/dashboard" className="flex flex-col items-center space-y-1 text-black">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001.1 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className="text-[10px] font-black uppercase tracking-wider">Beranda</span>
      </a>

      {/* Mobile Log Out Action Callback Controller */}
      <button 
        type="button" 
        onClick={onLogout} 
        className="flex flex-col items-center space-y-1 text-red-500 bg-transparent border-none outline-none cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
        <span className="text-[10px] font-black uppercase tracking-wider">Keluar</span>
      </button>

    </nav>
  );
}