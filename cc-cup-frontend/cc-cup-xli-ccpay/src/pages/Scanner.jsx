import React, { useEffect, useRef, useState } from 'react';
import { Store, Keyboard, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const Scanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasScannedRef = useRef(false); // ✅ ONE ref, at component level
  const [isCameraReady, setIsCameraReady] = useState(false);

  const stopScannerSafely = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };
  useEffect(() => {
    isMountedRef.current = true;
    hasScannedRef.current = false; // ✅ Reset on mount, not redeclared

    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }

    let html5Qrcode = null;

    // ✅ Only ONE handleScanSuccess, defined inside effect so it closes over
    //    the html5Qrcode local var directly, but uses the component-level refs
    const handleScanSuccess = async (decodedText) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      const cleanedText = decodedText.replace(/[\r\n]+/g, " ").trim();
      if ("vibrate" in navigator) navigator.vibrate(200);

      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(
          `/api/ccpay/merchants/lookup/?name=${encodeURIComponent(cleanedText)}`,
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` } }
        );

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          await stopScannerSafely();
          navigate('/login');
          return;
        }

        let selectedMerchant = { name: cleanedText, token: "unknown" };
        if (response.ok) {
          const matched = await response.json();
          selectedMerchant = {
            id: matched.id,
            name: matched.name,
            token: matched.token,
            image: `https://lh3.googleusercontent.com/aida-public/AB6AXuB2UrTe5Q8I3XSMDwRq4ckiK5PWvzJb85WkpS2CeEviLtAB7uDqeFDdGlrnOZEpVVplfxsyDjugwW0DjCvt4TDfNtCdTfLAtI28kkeNw22Vna0ZfHxc2KD7UJL0VWlIdGptIl0vH_lw_TqWG-IasGRcwwqoA97sYOejI6WTOivA_OE14-Gsa6qFX85jX6hA7qRncDYA4R77vu8McQOmr6EM0sta7oyMecGuVKqMuT0Jmj8Sz9nPEeQzwJQiCTMToSy-c6zT_o85VzY`
          };
          localStorage.setItem('merchant_token', matched.token);
        }

        await stopScannerSafely();
        navigate('/input', { state: { merchant: selectedMerchant, qrData: cleanedText } });
      } catch (err) {
        console.error("Failed to lookup merchant:", err);
        await stopScannerSafely();
        navigate('/input', { state: { merchant: { name: cleanedText, token: "unknown" }, qrData: cleanedText } });
      }
    };

    const startScanner = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!isMountedRef.current) return;

        html5Qrcode = new Html5Qrcode("camera-canvas-engine");
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 24,
            qrbox: (w, h) => {
              const size = Math.floor(Math.min(w, h) * 0.65);
              return { width: size, height: size };
            }
          },
          handleScanSuccess,
          () => { }
        );

        if (isMountedRef.current) setIsCameraReady(true);
      } catch (error) {
        console.error("Camera access failed:", error);
      }
    };

    startScanner();

    return () => {
      isMountedRef.current = false;
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(console.error);
      }
    };
  }, [navigate]);


  return (
    <div className="relative min-h-screen bg-[#090a0b] text-[#f4f5f6] font-sans antialiased overflow-hidden select-none">

      {/* Background Camera Canvas Viewport */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        <div
          id="camera-canvas-engine"
          className="w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_div]:!border-none [&_div]:!bg-transparent"
        />

        {!isCameraReady && (
          <div className="absolute inset-0 bg-[#090a0b] flex flex-col items-center justify-center gap-3">
            <span className="text-xs text-[#8a939e] tracking-widest uppercase font-bold animate-pulse">Initializing Camera Lens...</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); opacity: 0.1; }
          50% { opacity: 0.7; }
          100% { transform: translateY(240px); opacity: 0.1; }
        }
        .scanner-sweep {
          animation: scanline 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Floating Headers Viewport Control */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-[#090a0b]/90 to-transparent">
        <button
          onClick={async () => {
            await stopScannerSafely();
            navigate(-1);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#131619]/80 border border-[#1e2226] text-[#8a939e] hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-bold tracking-widest text-[#8a939e] uppercase bg-[#131619]/90 px-3 py-1.5 rounded-lg border border-[#1e2226]">
          QR Scanner
        </span>
        <div className="w-10 h-10 pointer-events-none opacity-0" />
      </header>

      {/* 🌟 FIXED: Removed pointer-events-none so it doesn't block processing events */}
      <main className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-24">

        <div className="text-center mb-8 max-w-xs space-y-1 pointer-events-none">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase shadow-sm">Align QR Code</h2>
          <p className="text-xs text-[#8a939e]">Position the transaction code inside the target indicators</p>
        </div>

        {/* Framing Bounds Overlay */}
        <div className="relative w-[240px] h-[240px] rounded-2xl bg-transparent border border-white/5 shadow-[0_0_0_9999px_rgba(9,10,11,0.65)] pointer-events-none">

          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#69ff87] rounded-tl-2xl -mt-[1px] -ml-[1px]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#69ff87] rounded-tr-2xl -mt-[1px] -mr-[1px]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#69ff87] rounded-bl-2xl -mb-[1px] -ml-[1px]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#69ff87] rounded-br-2xl -mb-[1px] -mr-[1px]" />

          <div className="absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-[#69ff87] to-transparent shadow-[0_0_8px_#69ff87] scanner-sweep" />
        </div>

      </main>

      {/* Bottom Option Bar Actions Layout */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-gradient-to-t from-[#090a0b] via-[#090a0b]/95 to-transparent pb-safe">
        <div className="max-w-md mx-auto space-y-3">

          <Button
            onClick={async () => {
              await stopScannerSafely();
              navigate('/select-merchant');
            }}
            className="w-full bg-[#131619] border border-[#1e2226] hover:bg-[#1a1d21] text-white py-6 rounded-xl flex items-center justify-between px-4 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1a1d21] border border-[#2a2f35] flex items-center justify-center group-hover:text-[#69ff87] transition-colors">
                <Store className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold tracking-tight">Pilih Merchant Manual</p>
                <p className="text-[10px] text-[#535c66]">If the terminal QR code is unreadable</p>
              </div>
            </div>
            <Keyboard className="h-4 w-4 text-[#535c66] group-hover:text-white transition-colors" />
          </Button>

        </div>
      </div>

    </div>
  );
};

export default Scanner;