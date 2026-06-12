import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/button";
import { apiService } from "@/services/api";
import type { Ticket } from "@/types";
import { cn } from "@/lib/utils";

type ScannerState = "SCANNING" | "SUCCESS" | "CLAIMED" | "INVALID" | "UNPAID" | "NETWORK_ERROR";

const Scanner = () => {
  const [state, setState] = useState<ScannerState>("SCANNING");
  const [result, setResult] = useState<Ticket | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isScannerStarted, setIsScannerStarted] = useState(false);
  const [terminal] = useState("GATE-1");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onScanSuccess = async (decodedText: string) => {
    await stopScanner();

    const scanResult = await apiService.scanTicket(decodedText, terminal);

    if (scanResult.success) {
      setResult(scanResult.ticket!);
      setState("SUCCESS");
    } else if (scanResult.error === "ALREADY_REDEEMED") {
      setResult(scanResult.ticket ?? null);
      setState("CLAIMED");
    } else if (scanResult.error === "UNPAID_TICKET") {
      setResult(scanResult.ticket ?? null);
      setErrorMsg(scanResult.message ?? "Ticket has not been paid yet.");
      setState("UNPAID");
    } else if (scanResult.error === "NETWORK_ERROR") {
      setErrorMsg("Could not reach server. Check your connection.");
      setState("NETWORK_ERROR");
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
    setErrorMsg("");
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

      {/* Scanning Frame UI */}
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
              { label: "Redeemed At", value: result.redeemed_at ? new Date(result.redeemed_at).toLocaleString() : "N/A" },
              { label: "Scanned By", value: result.scanned_by || "N/A" },
              { label: "Terminal", value: result.terminal || "N/A" },
              { label: "Ticket ID", value: result.ticket_id.slice(0, 8).toUpperCase() },
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
              { label: "Subject", value: result.full_name },
              { label: "NIK", value: result.identification_number },
              { label: "Status", value: result.status.toUpperCase() },
              { label: "Ticket ID", value: result.ticket_id.slice(0, 8).toUpperCase() },
            ]}
          />
        )}

        {state === "UNPAID" && (
          <StatusPanel
            type="warning"
            title="Unpaid Ticket"
            icon={DollarSign}
            color="bg-[#fe9400]"
            onReset={resetScanner}
            data={[
              { label: "Subject", value: result?.full_name || "N/A" },
              { label: "NIK", value: result?.identification_number || "N/A" },
              { label: "Status", value: "PENDING PAYMENT" },
              { label: "Info", value: errorMsg },
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

        {state === "NETWORK_ERROR" && (
          <StatusPanel
            type="error"
            title="Network Error"
            icon={Wifi}
            color="bg-[#ffb4ab]"
            onReset={resetScanner}
            data={[
              { label: "Error", value: errorMsg || "Could not reach server" },
              { label: "Action", value: "Check connection and retry" },
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
        <div className="bg-[#353436] border border-[#8c90a0] px-3 py-1 flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#c2c6d7] uppercase">{terminal}</span>
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

interface StatusPanelProps {
  type: "success" | "warning" | "error";
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  data: Array<{ label: string; value: string }>;
  onReset: () => void;
}

const StatusPanel = ({ type, title, icon: Icon, color, data, onReset }: StatusPanelProps) => (
  <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-300", color, "text-black p-6 border-t-4 border-black/20 shadow-2xl")}>
    <div className="flex items-center gap-3">
      <Icon size={40} className="fill-current" />
      <h2 className="text-2xl font-bold uppercase tracking-tight">{title}</h2>
    </div>

    <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-y border-black/10">
      {data.map((item, i) => (
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
