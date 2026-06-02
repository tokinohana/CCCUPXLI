import React, { useEffect, useRef, useState } from 'react';
import { Store, Image, Keyboard, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const Scanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Core callback when a QR Code is decoded successfully
  const handleScanSuccess = (decodedText) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(200);
    }
    
    // Stop the camera engine cleanly before navigating
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        // Pass the scanned QR data directly to your payment inputs view state
        navigate('/input', { state: { qrData: decodedText } });
      }).catch((err) => console.error("Failed to stop scanner smoothly", err));
    } else {
      navigate('/input', { state: { qrData: decodedText } });
    }
  };

  // Mount/Unmount lifecycle orchestration for the camera hardware
  useEffect(() => {
    // Create an instance targeting our camera canvas id wrapper
    const html5Qrcode = new Html5Qrcode("camera-canvas-engine");
    scannerRef.current = html5Qrcode;

    const startScanner = async () => {
      try {
        await html5Qrcode.start(
          { facingMode: "environment" }, // Prioritize back-facing physical camera lenses
          {
            fps: 24,                  // High frame-rate sampling for fast lock-ons
            qrbox: { width: 240, height: 240 }, // Match exact bounding layout bounds
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Optional continuous scan frame failure callback.
          }
        );
        setIsCameraReady(true);
      } catch (error) {
        console.error("Camera access failed or denied: ", error);
      }
    };

    startScanner();

    // Clean teardown component removal phase
    return () => {
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch((err) => console.error("Teardown crash prevented: ", err));
      }
    };
  }, []);

  // Handler for uploading an image instead of direct camera framing
  // const handleLocalFileChoose = async (event) => {
  //   const file = event.target.files?.[0];
  //   if (!file || !scannerRef.current) return;

  //   try {
  //     // Decode QR code directly from local file blob array mapping memory
  //     const decodedText = await scannerRef.current.scanFile(file, true);
  //     handleScanSuccess(decodedText);
  //   } catch (err) {
  //     alert("No valid merchant QR found in this picture. Try aligning again.");
  //   }
  // };

  return (
    <div className="relative min-h-screen bg-[#090a0b] text-[#f4f5f6] font-sans antialiased overflow-hidden select-none">
      
      {/* Native Camera Feed Pipeline Layer Container */}
      <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
        {/* Added nested overrides to explicitly strip internal html5-qrcode container boxes */}
        <div 
          id="camera-canvas-engine" 
          className="w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_div]:!border-none [&_div]:!bg-transparent"
        />
        
        {/* Soft aesthetic fallback background while the camera system is mounting */}
        {!isCameraReady && (
          <div className="absolute inset-0 bg-[#090a0b] animate-pulse flex items-center justify-center">
            <span className="text-xs text-[#8a939e] tracking-widest uppercase font-bold">Initializing Camera Lens...</span>
          </div>
        )}
      </div>

      {/* Styled Scanning Linear Sweep CSS Core Injection */}
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

      {/* Matte Global Top Action Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-[#090a0b]/90 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#131619]/80 border border-[#1e2226] text-[#8a939e] hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-bold tracking-widest text-[#8a939e] uppercase bg-[#131619]/90 px-3 py-1.5 rounded-lg border border-[#1e2226]">
          QR Scanner
        </span>
        <div className="w-10 h-10 pointer-events-none opacity-0" />
      </header>

      {/* Primary HUD Viewfinder Frame Overlay System */}
      <main className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-24 pointer-events-none">
        
        <div className="text-center mb-8 max-w-xs space-y-1">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase shadow-sm">Align QR Code</h2>
          <p className="text-xs text-white">Position the transaction code inside the target indicators</p>
        </div>

        {/* Framing Viewport Box Structure */}
        <div className="relative w-[240px] h-[240px] rounded-2xl bg-transparent border border-white/5 shadow-[0_0_0_9999px_rgba(9,10,11,0.65)]">
          
          {/* Neon Corner Targeting Bounds Reticles */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#69ff87] rounded-tl-2xl -mt-[1px] -ml-[1px]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#69ff87] rounded-tr-2xl -mt-[1px] -mr-[1px]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#69ff87] rounded-bl-2xl -mb-[1px] -ml-[1px]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#69ff87] rounded-br-2xl -mb-[1px] -mr-[1px]" />
          
          {/* Micro Precision Pass Laser Sweep Line */}
          <div className="absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-[#69ff87] to-transparent shadow-[0_0_8px_#69ff87] scanner-sweep" />
        </div>

      </main>

      {/* Fixed Streamlined Utility Controller Base Dock */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-gradient-to-t from-[#090a0b] via-[#090a0b]/95 to-transparent pb-safe">
        <div className="max-w-md mx-auto space-y-3">
          
          {/* Manual Alternative Selector Routing Entry Button */}
          <Button 
            onClick={() => navigate('/select-merchant')}
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

          {/* Hidden Image input bridge layer channel hook */}
          {/* <input 
            type="file"
            ref={fileInputRef}
            onChange={handleLocalFileChoose}
            accept="image/*"
            className="hidden"
          /> */}

          {/* Core System Gallery Auxiliary Trigger Callout */}
          {/* <div className="flex items-center justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-[#8a939e] hover:text-white text-xs font-semibold transition-colors rounded-lg hover:bg-[#131619]/50"
            >
              <Image className="h-3.5 w-3.5 text-[#69ff87]" />
              <span>Upload from Gallery</span>
            </button>
          </div> */}

        </div>
      </div>

    </div>
  );
};

export default Scanner;