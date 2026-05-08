import React, { useState, useEffect } from 'react';
import { ArrowLeft, HelpCircle, Delete, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const PaymentInput = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('50.000');
  
  // Haptic feedback on mount (simulating landing after successful scan)
  useEffect(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(200);
    }
  }, []);

  const handleKeypad = (val) => {
    // Mock logic for keypad
    if (val === 'backspace') {
      setAmount(amount.slice(0, -1) || '0');
    } else if (val === 'check') {
      // confirm logic
    } else {
      setAmount(amount === '0' ? val : amount + val);
    }
  };

  return (
    <div className="bg-[#121417] font-sans text-white min-h-screen flex flex-col overflow-hidden selection:bg-[#00C853]/30">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#121417]/80 backdrop-blur-md text-white font-semibold tracking-wide uppercase text-[11px] flex items-center justify-between px-4 h-14">
        <button 
          onClick={() => navigate(-1)}
          className="hover:bg-white/10 transition-colors p-2 rounded-full active:scale-95"
        >
          <ArrowLeft className="h-[22px] w-[22px]" />
        </button>
        <span className="opacity-80 tracking-[0.1em]">Transfer Funds</span>
        <button className="hover:bg-white/10 transition-colors p-2 rounded-full active:scale-95">
          <HelpCircle className="h-[22px] w-[22px]" />
        </button>
      </header>

      {/* Content Canvas */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-40 px-6 max-w-lg mx-auto w-full">
        {/* Merchant Identity Section */}
        <div className="flex flex-col items-center mb-10 w-full">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 p-0.5 overflow-hidden ring-1 ring-white/10 shadow-xl">
              <img 
                alt="Merchant Logo" 
                className="w-full h-full object-cover rounded-[14px]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2UrTe5Q8I3XSMDwRq4ckiK5PWvzJb85WkpS2CeEviLtAB7uDqeFDdGlrnOZEpVVplfxsyDjugwW0DjCvt4TDfNtCdTfLAtI28kkeNw22Vna0ZfHxc2KD7UJL0VWlIdGptIl0vH_lw_TqWG-IasGRcwwqoA97sYOejI6WTOivA_OE14-Gsa6qFX85jX6hA7qRncDYA4R77vu8McQOmr6EM0sta7oyMecGuVKqMuT0Jmj8Sz9nPEeQzwJQiCTMToSy-c6zT_o85VzY" 
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Membayar ke</p>
            <h1 className="text-lg font-bold tracking-tight text-white/90">Kantin Sehat - Stand 04</h1>
          </div>
        </div>

        {/* Amount Display Section */}
        <div className="w-full flex flex-col items-center justify-center flex-grow py-4">
          <div className="flex items-center justify-center w-full space-x-2">
            <span className="text-2xl font-bold text-zinc-600 mb-2">Rp</span>
            <div className="relative inline-block">
              <span className="text-6xl md:text-7xl font-bold tracking-tight text-white">{amount}</span>
              {/* Glowing Green Pulsing Underline */}
              <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#00C853] rounded-full shadow-[0_4px_20px_-2px_rgba(0,200,83,0.6)]" />
            </div>
          </div>
          <div className="mt-8 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <p className="text-zinc-400 text-xs font-medium">
              Saldo anda: <span className="text-white/90 font-semibold ml-1">Rp 1.250.000</span>
            </p>
          </div>
        </div>

        {/* Custom Number Pad */}
        <div className="w-full mt-auto select-none">
          <div className="grid grid-cols-3 gap-y-1 gap-x-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button 
                key={num}
                className="h-16 flex items-center justify-center text-3xl font-medium text-white active:scale-95 transition-all duration-75 rounded-2xl hover:bg-white/5"
              >
                {num}
              </button>
            ))}
            <button className="h-16 flex items-center justify-center text-white active:scale-95 transition-all duration-75 rounded-2xl hover:bg-white/5 group">
              <Delete className="h-6 w-6 group-active:scale-90 transition-transform" />
            </button>
            <button className="h-16 flex items-center justify-center text-3xl font-medium text-white active:scale-95 transition-all duration-75 rounded-2xl hover:bg-white/5">
              0
            </button>
            <button className="h-16 flex items-center justify-center text-[#00C853] active:scale-95 transition-all duration-75 rounded-2xl hover:bg-white/5 group">
              <CheckCircle2 className="h-8 w-8" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#121417] via-[#121417] to-transparent">
        <Button 
          className="w-full h-14 bg-[#00C853] text-[#121417] font-bold text-base rounded-lg active:scale-95 transition-all duration-150 shadow-lg shadow-[#00C853]/20 flex items-center justify-center space-x-2 border-none"
        >
          <span>Konfirmasi Pembayaran</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentInput;
