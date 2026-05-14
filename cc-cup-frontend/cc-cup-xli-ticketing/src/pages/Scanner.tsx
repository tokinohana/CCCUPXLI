import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { RefreshCcw, Bell, Settings, AlertTriangle, CheckCircle2, XCircle, LayoutDashboard, ScanLine, Ticket } from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { apiService } from "@/services/api";
import type { Ticket as TicketType } from "@/types";
import { cn } from "@/lib/utils";

type ScannerState = "SCANNING" | "SUCCESS" | "CLAIMED" | "INVALID";

const Scanner = () => {
  const [state, setState] = useState<ScannerState>("SCANNING");
  const [result, setResult] = useState<TicketType | null>(null);
  const [isScannerStarted, setIsScannerStarted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const isStartingRef = useRef(false);

  const startScanner = async () => {
    if (isStartingRef.current || (scannerRef.current && scannerRef.current.isScanning)) return;
    
    isStartingRef.current = true;
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }

    try {
      const qrboxSize = Math.min(window.innerWidth * 0.7, 250);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );
      setIsScannerStarted(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScannerStarted(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  useEffect(() => {
    if (state === "SCANNING") {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [state]);

  const onScanSuccess = async (decodedText: string) => {
    await stopScanner();
    
    const scanResult = await apiService.scanTicket(decodedText);
    
    if (scanResult.success) {
      setResult(scanResult.ticket!);
      setState("SUCCESS");
    } else if (scanResult.error === "ALREADY_REDEEMED") {
      setResult(scanResult.ticket!);
      setState("CLAIMED");
    } else {
      setState("INVALID");
    }
  };

  const onScanFailure = () => {
    // Silent fail for continuous scanning
  };

  const resetScanner = () => {
    setState("SCANNING");
    setResult(null);
  };

  return (
    <div className="relative flex-grow flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-hidden bg-black">
      {/* Camera Preview Area */}
      <div className="absolute inset-0 z-0 bg-[#131314]">
        <div 
          id="reader" 
          className={cn("w-full h-full border-none", state !== "SCANNING" && "hidden")}
        ></div>
        
        {state !== "SCANNING" && (
          <div className="w-full h-full relative">
            <img 
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale brightness-50 blur-sm" 
              alt="Frozen View"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
          </div>
        )}
      </div>

      {/* Scanning Frame UI (Only visible when scanning) */}
      {state === "SCANNING" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-64 h-64 border-2 border-[#fe9400]/30 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#fe9400]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#fe9400]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#fe9400]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#fe9400]"></div>
            <div className="scan-line absolute w-full top-0 animate-[scan_2s_linear_infinite]"></div>
          </div>
        </div>
      )}

      {/* Status Overlays */}
      <div className="mt-auto z-20 w-full">
        {state === "CLAIMED" && result && (
          <StatusPanel 
            type="warning" 
            title="Ticket Already Used" 
            icon={AlertTriangle}
            color="bg-[#fe9400]"
            onReset={resetScanner}
            data={[
              { label: "Redeemed At", value: result.redeemedAt || "N/A" },
              { label: "Scanned By", value: result.scannedBy || "N/A" },
              { label: "Terminal", value: result.terminal || "N/A" },
              { label: "Ticket ID", value: result.id },
            ]}
          />
        )}

        {state === "SUCCESS" && result && (
          <StatusPanel 
            type="success" 
            title="Ticket Validated" 
            icon={CheckCircle2}
            color="bg-[#00e475]"
            onReset={resetScanner}
            data={[
              { label: "Subject", value: result.fullName },
              { label: "NIK", value: result.nik },
              { label: "Status", value: result.status.toUpperCase() },
              { label: "Ticket ID", value: result.id },
            ]}
          />
        )}

        {state === "INVALID" && (
          <StatusPanel 
            type="error" 
            title="Invalid Ticket" 
            icon={XCircle}
            color="bg-[#ffb4ab]"
            onReset={resetScanner}
            data={[
              { label: "Error Code", value: "ERR_NOT_FOUND" },
              { label: "Trace ID", value: "TR-" + Math.random().toString(36).substr(2, 9).toUpperCase() },
            ]}
          />
        )}
      </div>

      {/* Floating Info */}
      <div className="fixed top-20 right-4 z-20 flex flex-col gap-2">
        <div className="bg-[#353436] border border-[#8c90a0] px-3 py-1 flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", state === "SCANNING" ? "bg-[#00e475] dot-pulse" : "bg-[#ffb4ab]")}></div>
          <span className="font-mono text-[10px] text-[#e5e2e3] uppercase">
            {state === "SCANNING" ? "Scanner Online" : "Scanner Paused"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #reader { border: none !important; }
      `}</style>
    </div>
  );
};

const StatusPanel = ({ type, title, icon: Icon, color, data, onReset }: any) => (
  <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-300", color, "text-black p-6 border-t-4 border-black/20 shadow-2xl")}>
    <div className="flex items-center gap-3">
      <Icon size={40} className="fill-current" />
      <h2 className="text-2xl font-bold uppercase tracking-tight">{title}</h2>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-y border-black/10">
      {data.map((item: any, i: number) => (
        <div key={i} className="flex flex-col">
          <span className="font-mono text-[10px] uppercase opacity-70 font-bold">{item.label}</span>
          <span className="font-mono text-sm font-bold">{item.value}</span>
        </div>
      ))}
    </div>

    <div className="flex flex-col gap-3 mt-6">
      <Button 
        onClick={onReset}
        className="w-full bg-black text-white font-bold py-6 rounded-none uppercase flex items-center justify-center gap-2 hover:bg-black/80 transition-transform active:scale-95"
      >
        <RefreshCcw size={18} />
        Resume Scan
      </Button>
      <Button 
        variant="outline"
        onClick={onReset}
        className="w-full border-2 border-black bg-transparent text-black font-bold py-6 rounded-none uppercase hover:bg-black/5 active:scale-95 transition-transform"
      >
        Dismiss
      </Button>
    </div>
  </div>
);

export default Scanner;
