import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, AlertTriangle, CheckCircle2, Edit3, ArrowRight, User, Terminal, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Progress } from "@/components/progress";
import { Badge } from "@/components/badge";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";

const TicketForm = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "ADITYA PRASETYA",
    nik: "3275012304910003",
    email: "",
    paymentStatus: "paid"
  });

  const [nikError, setNikError] = useState<string | null>(null);
  const [isCheckingNik, setIsCheckingNik] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCapturing(false);
      startOcrSimulation();
    }
  }, [webcamRef]);

  const startOcrSimulation = () => {
    setIsProcessing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleNikChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, nik: value });
    
    if (value.length >= 10) {
      setIsCheckingNik(true);
      const { exists } = await apiService.verifyNIK(value);
      setIsCheckingNik(false);
      if (exists) {
        setNikError("Ticket already exists for this NIK");
      } else {
        setNikError(null);
      }
    }
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#b0c6ff] uppercase tracking-tight">Ticket Creation Console</h1>
          <p className="font-mono text-[#c2c6d7] mt-1 text-sm">SECURE PROTOCOL V2.4 // SESSION_ID: 8849-002</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-[#00e475] text-[#003918] rounded-none font-bold uppercase">System Online</Badge>
          <Badge className="bg-[#558dff] text-white rounded-none font-bold uppercase">OCR Active</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: KTP Capture */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#201f20] border border-[#424655] relative group overflow-hidden">
            <div className="absolute inset-0 border-2 border-[#b0c6ff]/20 pointer-events-none z-10"></div>
            
            {/* Camera Area */}
            <div className="aspect-[1.58/1] bg-[#0e0e0f] flex flex-col items-center justify-center relative">
              {isCapturing ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : capturedImage ? (
                <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" alt="Captured KTP" />
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8">
                  <Camera size={48} className="text-[#b0c6ff]" />
                  <div className="font-mono text-xs text-[#e5e2e3] uppercase tracking-widest">Awaiting Identity Card</div>
                </div>
              )}

              {isCapturing && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                  <Button onClick={capture} className="bg-[#b0c6ff] text-[#002d6e] font-bold rounded-none">
                    CAPTURE FRAME
                  </Button>
                </div>
              )}

              {!isCapturing && !isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button onClick={() => setIsCapturing(true)} className="bg-[#b0c6ff] text-[#002d6e] font-bold rounded-none">
                    {capturedImage ? "RE-TAKE PHOTO" : "INITIATE CAPTURE"}
                  </Button>
                </div>
              )}
              
              {/* Scanning Overlay Animation */}
              {isProcessing && (
                <div className="absolute inset-x-8 top-1/4 h-0.5 bg-[#b0c6ff] shadow-[0_0_15px_rgba(176,198,255,0.8)] animate-[scan_2s_linear_infinite] z-20"></div>
              )}
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="p-6 bg-[#2a2a2b] border-t border-[#424655]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00e475] rounded-full animate-ping"></div>
                    <span className="font-mono text-xs text-[#00e475] uppercase font-bold">Extracting KTP...</span>
                  </div>
                  <span className="font-mono text-xs text-[#c2c6d7]">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-[#0e0e0f] rounded-none" />
              </div>
            )}
          </div>

          {/* OCR Confidence Warning */}
          <div className="bg-[#93000a]/20 border-2 border-[#ffb4ab] p-4 flex items-start gap-4">
            <AlertTriangle className="text-[#ffb4ab] flex-shrink-0" size={24} />
            <div>
              <div className="font-mono text-xs text-[#ffb4ab] uppercase font-bold">OCR Confidence Warning</div>
              <div className="text-sm text-[#e5e2e3] mt-1">⚠ Please verify extracted NIK. Visual noise detected on source document. Manual validation required for Field [002].</div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#1c1b1c] border border-[#424655] p-8 h-full">
            <div className="flex items-center gap-3 mb-8 border-b border-[#424655] pb-6">
              <Edit3 className="text-[#b0c6ff]" size={24} />
              <h2 className="text-xl font-bold text-[#e5e2e3] uppercase">Subject Metadata</h2>
            </div>
            
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* Full Name */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-[#c2c6d7] uppercase flex justify-between font-bold">
                  Full Name
                  <span className="text-[#b0c6ff]">Required [A-Z]</span>
                </label>
                <Input 
                  className="bg-[#0e0e0f] border-[#424655] focus:border-[#b0c6ff] text-[#e5e2e3] h-12 rounded-none font-mono uppercase"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              {/* NIK */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold">NIK (Identity Number)</label>
                <div className="relative">
                  <Input 
                    className={cn(
                      "bg-[#0e0e0f] h-12 rounded-none font-mono",
                      nikError ? "border-2 border-[#ffb4ab]" : "border-[#424655] focus:border-[#b0c6ff]"
                    )}
                    value={formData.nik}
                    onChange={handleNikChange}
                  />
                  {isCheckingNik && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <RefreshCw className="animate-spin text-[#b0c6ff]" size={16} />
                    </div>
                  )}
                  {nikError && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <XCircle className="text-[#ffb4ab]" size={16} />
                    </div>
                  )}
                </div>
                {nikError && (
                  <p className="text-[10px] text-[#ffb4ab] font-mono font-bold flex items-center gap-1 mt-1 uppercase">
                    ❌ {nikError}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold">Email Address</label>
                <Input 
                  type="email"
                  placeholder="OPERATOR@SYSTEM.INTERNAL"
                  className="bg-[#0e0e0f] border-[#424655] focus:border-[#b0c6ff] text-[#e5e2e3] h-12 rounded-none font-mono"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Payment Status */}
              <div className="space-y-4">
                <label className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold">Payment Status</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({...formData, paymentStatus: 'paid'})}
                    className={cn(
                      "p-4 border-2 transition-all flex items-center justify-between cursor-pointer",
                      formData.paymentStatus === 'paid' ? "border-[#00e475] bg-[#00e475]/10" : "border-[#424655]"
                    )}
                  >
                    <span className="font-mono text-xs font-bold uppercase">Paid</span>
                    <CheckCircle2 className={cn("text-[#00e475]", formData.paymentStatus === 'paid' ? "opacity-100" : "opacity-0")} size={20} />
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, paymentStatus: 'pending'})}
                    className={cn(
                      "p-4 border-2 transition-all flex items-center justify-between cursor-pointer",
                      formData.paymentStatus === 'pending' ? "border-[#fe9400] bg-[#fe9400]/10" : "border-[#424655]"
                    )}
                  >
                    <span className="font-mono text-xs font-bold uppercase">Pending</span>
                    <Clock className={cn("text-[#fe9400]", formData.paymentStatus === 'pending' ? "opacity-100" : "opacity-0")} size={20} />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Button className="w-full h-16 bg-[#b0c6ff] hover:bg-[#b0c6ff]/90 text-[#002d6e] font-bold text-lg rounded-none uppercase tracking-widest group">
                  Create & Send Ticket
                  <ArrowRight className="ml-4 transition-transform group-hover:translate-x-2" />
                </Button>
                <p className="text-center font-mono text-[10px] text-[#c2c6d7] mt-4 uppercase">System will log operator IP [192.168.1.104] for this transaction.</p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default TicketForm;
