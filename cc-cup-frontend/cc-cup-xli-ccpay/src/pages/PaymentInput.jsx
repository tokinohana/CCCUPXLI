import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Delete } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentInput = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rawInput, setRawInput] = useState('50000');

  const merchant = location.state?.merchant || {
    name: "Kantin Sehat - Stand 04",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2UrTe5Q8I3XSMDwRq4ckiK5PWvzJb85WkpS2CeEviLtAB7uDqeFDdGlrnOZEpVVplfxsyDjugwW0DjCvt4TDfNtCdTfLAtI28kkeNw22Vna0ZfHxc2KD7UJL0VWlIdGptIl0vH_lw_TqWG-IasGRcwwqoA97sYOejI6WTOivA_OE14-Gsa6qFX85jX6hA7qRncDYA4R77vu8McQOmr6EM0sta7oyMecGuVKqMuT0Jmj8Sz9nPEeQzwJQiCTMToSy-c6zT_o85VzY"
  };

  useEffect(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(100);
    }
  }, []);

  const formatDisplayAmount = (value) => {
    if (!value || value === '0') return '0';
    return parseInt(value, 10).toLocaleString('id-ID');
  };

  const handleKeypadPress = (val) => {
    if ("vibrate" in navigator) navigator.vibrate(30);

    if (val === 'backspace') {
      setRawInput(prev => prev.length <= 1 ? '0' : prev.slice(0, -1));
    } else if (val === 'clear') {
      setRawInput('0');
    } else {
      if (rawInput.length >= 9) return; 
      setRawInput(prev => prev === '0' ? val.toString() : prev + val.toString());
    }
  };

  const addShortcutAmount = (bonus) => {
    if ("vibrate" in navigator) navigator.vibrate(40);
    setRawInput(prev => {
      const current = prev === '0' ? 0 : parseInt(prev, 10);
      return Math.min(current + bonus, 99999999).toString();
    });
  };

  const handleConfirmSubmission = () => {
    const finalAmount = parseInt(rawInput, 10);
    if (finalAmount <= 0) return;
    navigate('/confirm-payment', { state: { merchant, amount: finalAmount } });
  };

  return (
    <div className="bg-[#090a0b] font-sans text-[#8a939e] min-h-screen flex flex-col antialiased selection:bg-[#69ff87]/30 select-none w-full max-w-md mx-auto relative justify-between overflow-hidden">
      
      {/* 1. Structural Native Header */}
      <div className="w-full px-4 pt-6">
        <header className="w-full flex items-center justify-between pb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#131619] border border-[#1e2226] text-[#8a939e] hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#535c66]">Payment Terminal</span>
          <div className="w-10 h-10 opacity-0 pointer-events-none" />
        </header>

        {/* Integrated Merchant Stack (Matching image profile layout) */}
        <div className="flex items-center space-x-3 bg-[#131619]/30 border border-[#1e2226]/40 rounded-xl p-3 mt-2">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#1a1d21] border border-[#2a2f35] flex-shrink-0">
            <img alt={merchant.name} className="w-full h-full object-cover" src={merchant.image} />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[9px] font-bold text-[#535c66] uppercase tracking-wider block">Membayar Kepada</span>
            <span className="text-xs font-bold text-white tracking-tight block truncate">{merchant.name}</span>
          </div>
        </div>
      </div>

      {/* 2. Expansive Mid-Viewport Amount Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 my-auto">
        <div className="flex items-baseline justify-center space-x-2">
          <span className="text-2xl font-black text-[#535c66] tracking-tight">Rp</span>
          <span className="text-6xl font-black tracking-tighter text-white tabular-nums transition-all duration-150">
            {formatDisplayAmount(rawInput)}
          </span>
        </div>
      </div>

      {/* 3. The Solid Grounded Interaction Sheet Block */}
      <div className="w-full bg-[#131619] border-t border-[#1e2226] p-4 space-y-4 rounded-t-2xl shadow-2xl">
        
        {/* Dynamic Shortcut Token Utilities Row */}
        <div className="grid grid-cols-3 gap-2">
          {[10000, 20000, 35000].map((value) => (
            <button
              key={value}
              onClick={() => addShortcutAmount(value)}
              className="py-2.5 rounded-xl text-[11px] font-bold bg-[#1a1d21] border border-[#2a2f35] text-[#8a939e] hover:text-white active:scale-[0.97] transition-all"
            >
              +{value / 1000}K
            </button>
          ))}
        </div>

        {/* Integrated Embedded Balance Ledger Strip */}
        <div className="flex justify-between items-center bg-[#1a1d21] border border-[#2a2f35]/60 rounded-xl px-4 py-2.5 text-xs">
          <span className="text-[#535c66] font-semibold text-[10px] uppercase tracking-wider">Sisa Saldo Anda</span>
          <span className="font-bold text-white tracking-tight">Rp 1.250.000</span>
        </div>

        {/* Clean Balanced Tactile Keypad Engine */}
        <div className="grid grid-cols-3 gap-y-1.5 gap-x-4 pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num}
              onClick={() => handleKeypadPress(num)}
              className="h-12 flex items-center justify-center text-2xl font-black text-white rounded-xl hover:bg-[#1a1d21] transition-all active:scale-90"
            >
              {num}
            </button>
          ))}
          
          <button 
            onClick={() => handleKeypadPress('clear')}
            className="h-12 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[#535c66] hover:text-white rounded-xl active:scale-90 transition-all"
          >
            Clear
          </button>
          
          <button 
            onClick={() => handleKeypadPress(0)}
            className="h-12 flex items-center justify-center text-2xl font-black text-white rounded-xl hover:bg-[#1a1d21] transition-all active:scale-90"
          >
            0
          </button>
          
          <button 
            onClick={() => handleKeypadPress('backspace')}
            className="h-12 flex items-center justify-center text-[#535c66] hover:text-white rounded-xl active:scale-90 transition-all"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Full Anchor Continuous Main CTA Link */}
        <div className="pt-2">
          <Button 
            disabled={parseInt(rawInput, 10) === 0}
            onClick={handleConfirmSubmission}
            className="w-full h-12 bg-[#69ff87] hover:bg-[#5ade78] disabled:opacity-20 disabled:pointer-events-none text-[#090a0b] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 border-none"
          >
            <span>Bayar Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>

    </div>
  );
};

export default PaymentInput;