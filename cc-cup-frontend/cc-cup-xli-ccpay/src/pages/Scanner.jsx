import React from 'react';
import { Store, ChevronRight, Image, Keyboard, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Scanner = () => {
  const navigate = useNavigate();

  const handleScanSuccess = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(200);
    }
    navigate('/input');
  };
  return (
    <div className="relative min-h-screen bg-[#000101] overflow-hidden font-sans text-[#191c1e]">
      {/* Live Camera Simulation Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center grayscale opacity-40 blur-[2px]"
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQcmHwaUa6xKLHQ2sPJjS-wx-srpSPqTzWX5OPzL0oeq20QF-AABz0V3IsEZh29DCwRCY3aLN6CxYosj4NrGpKTQ82K6zxLI6laEcoIkl1QaUOpPlyUuJVGk9qOOqUj5PzgmIbKEEi0g2-ghiIEjZfapr4HVGlSXSMjm49jq-jqRXgm0T4Kki3RlhjZ2vHr5nnsSR32aZ1WJCK49iMXy5S5SHKyEBcTaupnFcnaAQDUxJkcJw_UyWW_K109sSUiuyGhwvekvuUoyA')" 
        }}
      />

      {/* Styled Animations via CSS-in-JS or Tailwind layer (Inline here for simplicity) */}
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-animation {
          animation: scan 3s linear infinite;
        }
      `}</style>

      {/* Scanner Overlay Content */}
      <main className="relative z-10 flex flex-col items-center justify-center h-screen pb-40 animate-in fade-in duration-1000">
        <header className="absolute top-0 left-0 w-full p-6 flex items-center animate-in fade-in slide-in-from-left-4 duration-500 delay-200 fill-mode-both">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white active:scale-95 transition-all outline-none"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>

        <div className="text-center mb-8 px-8 animate-in zoom-in-95 duration-700">
          <p className="text-white/70 text-sm font-medium tracking-wide uppercase mb-2">Align QR Code</p>
          <p className="text-white/40 text-xs">Position the code within the frame for automatic detection</p>
        </div>

        {/* Scanning Frame */}
        <div className="relative w-[280px] h-[280px] rounded-lg bg-black/20 border-2 border-white/10 animate-in zoom-in-90 duration-700 delay-100 fill-mode-both shadow-[0_0_50px_rgba(0,200,83,0.1)]">
          {/* Corners */}
          <div className="absolute top-[-4px] left-[-4px] w-8 h-8 border-t-4 border-l-4 border-[#00C853] rounded-tl-lg" />
          <div className="absolute top-[-4px] right-[-4px] w-8 h-8 border-t-4 border-r-4 border-[#00C853] rounded-tr-lg" />
          <div className="absolute bottom-[-4px] left-[-4px] w-8 h-8 border-b-4 border-l-4 border-[#00C853] rounded-bl-lg" />
          <div className="absolute bottom-[-4px] right-[-4px] w-8 h-8 border-b-4 border-r-4 border-[#00C853] rounded-br-lg" />
          
          {/* Scan Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00C853] to-transparent shadow-[0_0_15px_#00C853] scan-animation" />

          {/* Technical Data Pulse */}
          <div className="absolute -bottom-12 left-0 w-full flex justify-center animate-in fade-in slide-in-from-top-2 duration-500 delay-500 fill-mode-both">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
              <span className="font-mono text-[10px] text-white/60 tracking-tighter uppercase">AF_MODE: AUTO_DETECT</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Sheet / Drawer */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-[#1A1C1E] border-t border-white/10 rounded-t-[2rem] shadow-2xl p-8 pb-12 transition-transform animate-in slide-in-from-bottom-full duration-700 ease-out fill-mode-both">
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />
        
        <div className="flex flex-col gap-4 mt-2">
          {/* Primary Action */}
          <Button 
            onClick={() => navigate('/select-merchant')}
            className="w-full bg-[#00C853] hover:bg-[#00C853]/90 active:scale-[0.98] transition-all py-8 px-6 rounded-xl flex items-center justify-between text-black border-none"
          >
            <div className="flex items-center gap-3">
              <Store className="h-6 w-6" />
              <span className="font-bold text-lg tracking-tight">Pilih Merchant Manual</span>
            </div>
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all py-5 px-4 rounded-xl flex flex-col items-center gap-2 text-slate-300 border border-white/5">
              <Image className="h-6 w-6 text-[#00C853]" />
              <span className="text-[12px] uppercase tracking-wider font-bold">Gallery</span>
            </button>
            <button 
              onClick={() => navigate('/select-merchant')}
              className="bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all py-5 px-4 rounded-xl flex flex-col items-center gap-2 text-slate-300 border border-white/5"
            >
              <Keyboard className="h-6 w-6 text-[#00C853]" />
              <span className="text-[12px] uppercase tracking-wider font-bold">Manual</span>
            </button>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <p className="text-center text-[10px] text-slate-500 mt-8 font-medium tracking-wide uppercase">
          Institutional Grade Encryption Active
        </p>
      </div>
    </div>
  );
};

export default Scanner;
