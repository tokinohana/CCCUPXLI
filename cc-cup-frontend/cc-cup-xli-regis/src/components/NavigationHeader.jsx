// src/components/NavigationHeader.jsx
import React from 'react';

export default function NavigationHeader({ onLogout }) {
  return (
    <header className="hidden md:flex items-center justify-between px-12 py-5 border-b-4 border-black sticky top-0 bg-white z-40">
      {/* Brand Title Logo */}
      <div className="font-berserker text-xl tracking-wider font-bold">CC CUP XLI</div>
      
      {/* Desktop Link Navigation */}
      <nav className="flex items-center space-x-8 text-sm font-bold uppercase tracking-wide">
        <a 
          href="/dashboard" 
          className="text-black underline decoration-2 underline-offset-4"
        >
          Dashboard
        </a>
        <a 
          href="#peraturan" 
          className="text-gray-400 hover:text-black transition-colors"
        >
          Peraturan
        </a>
        <a 
          href="#panduan" 
          className="text-gray-400 hover:text-black transition-colors"
        >
          Panduan
        </a>
        
        {/* Sign Out Trigger Action Button */}
        <button 
          type="button" 
          onClick={onLogout} 
          className="text-red-600 hover:text-red-700 font-bold uppercase tracking-wide transition-colors cursor-pointer bg-transparent border-none outline-none"
        >
          Keluar →
        </button>
      </nav>
    </header>
  );
}