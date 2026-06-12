import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Webcam from "react-webcam";
import {
  Camera,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ArrowRight,
  Terminal,
  XCircle,
  TicketPlus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Progress } from "@/components/progress";
import { Badge } from "@/components/badge";
import { apiService } from "@/services/api";
import { ocrService } from "@/services/ocr";
import { cn } from "@/lib/utils";
import type { AxiosError } from "axios";

const TicketForm = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formStatus, setFormStatus] = useState<"FORM" | "SUCCESS" | "ERROR">("FORM");
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    identification_number: "",
    email: "",
    paymentStatus: "paid",
  });

  const [nikError, setNikError] = useState<string | null>(null);
  const [isCheckingNik, setIsCheckingNik] = useState(false);

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCapturing(false);
      performOcr(imageSrc);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamRef]);

  const performOcr = async (imageBase64: string) => {
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 100);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY || "";
      const result = await ocrService.performOcr(imageBase64, apiKey);

      if (result.fullName || result.nik) {
        setFormData((prev) => ({
          ...prev,
          full_name: result.fullName || prev.full_name,
          identification_number: result.nik || prev.identification_number,
        }));

        if (result.nik) {
          handleNikVerification(result.nik);
        }
      }

      setProgress(100);
      setTimeout(() => setIsProcessing(false), 500);
    } catch (error) {
      console.error("OCR Failed:", error);
      setIsProcessing(false);
    } finally {
      clearInterval(interval);
    }
  };

  const handleNikVerification = async (nik: string) => {
    setIsCheckingNik(true);
    setNikError(null);
    try {
      const { exists } = await apiService.verifyNIK(nik);
      if (exists) {
        setNikError("Ticket already exists for this NIK");
      }
    } catch (err) {
      console.error("NIK verification failed:", err);
    } finally {
      setIsCheckingNik(false);
    }
  };

  const handleNikChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, identification_number: value });

    if (value.length >= 10) {
      handleNikVerification(value);
    } else {
      setNikError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nikError) return;
    setServerError(null);
    setIsProcessing(true);

    try {
      // 1. Create ticket (backend defaults to 'pending')
      const ticket = await apiService.createTicket({
        full_name: formData.full_name,
        email: formData.email,
        identification_number: formData.identification_number,
      });

      // 2. If user selected "paid", immediately update status
      //    (this also triggers the QR email on the backend)
      if (formData.paymentStatus === "paid") {
        await apiService.updateTicketStatus(ticket.ticket_id, "paid");
      }

      setCreatedTicketId(ticket.ticket_id);
      setFormStatus("SUCCESS");
    } catch (error) {
      const axiosErr = error as AxiosError<{
        identification_number?: string[];
        email?: string[];
        full_name?: string[];
        detail?: string;
      }>;
      const data = axiosErr.response?.data;

      if (data) {
        if (data.identification_number?.[0]) {
          setNikError(data.identification_number[0]);
        } else if (data.detail) {
          setServerError(data.detail);
        } else if (data.email?.[0]) {
          setServerError(`Email: ${data.email[0]}`);
        } else if (data.full_name?.[0]) {
          setServerError(`Name: ${data.full_name[0]}`);
        } else {
          setServerError("Server rejected the request. Please check all fields.");
        }
      } else {
        setServerError("Could not reach server. Please try again.");
      }
      setFormStatus("ERROR");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormStatus("FORM");
    setCapturedImage(null);
    setServerError(null);
    setNikError(null);
    setCreatedTicketId(null);
    setFormData({
      full_name: "",
      identification_number: "",
      email: "",
      paymentStatus: "paid",
    });
  };

  if (formStatus === "SUCCESS") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 animate-in zoom-in-95 duration-300">
        <div className="max-w-xl w-full border-2 border-[#00e475] bg-[#201f20] p-8 md:p-12 relative shadow-[0_0_40px_rgba(0,228,117,0.1)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00e475] -mt-1 -ml-1"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00e475] -mb-1 -mr-1"></div>

          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-[#00e475] flex items-center justify-center mb-6">
                <CheckCircle2 size={64} className="text-[#003918]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#00e475] uppercase tracking-tight">
                Ticket Created Successfully
              </h1>
            </div>

            <div className="w-full bg-[#2a2a2b] border border-[#424655] p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#c2c6d7] uppercase tracking-widest font-bold">Confirmation Status</span>
                <div className="flex items-center justify-center gap-3 text-[#e5e2e3]">
                  <Terminal size={18} className="text-[#00e475]" />
                  <span className="font-mono text-sm">
                    QR email sent to:{" "}
                    <span className="text-[#b0c6ff] underline">{formData.email || "recipient@example.com"}</span>
                  </span>
                </div>
              </div>
              <div className="h-px bg-[#424655] w-full"></div>
              <div className="flex justify-between items-center px-2">
                <div className="flex flex-col items-start">
                  <span className="font-mono text-[10px] text-[#c2c6d7] uppercase">Ticket ID</span>
                  <span className="font-mono text-sm font-bold text-[#b0c6ff]">
                    {createdTicketId ? createdTicketId.slice(0, 8).toUpperCase() : "—"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[10px] text-[#c2c6d7] uppercase">NIK</span>
                  <span className="font-mono text-sm font-bold text-[#b0c6ff]">{formData.identification_number}</span>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <Button
                onClick={resetForm}
                className="w-full py-8 bg-[#b0c6ff] text-[#002d6e] font-bold text-lg rounded-none uppercase tracking-tighter flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <TicketPlus size={24} />
                Create Another Ticket
              </Button>
              <div className="flex gap-4 w-full">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 py-6 border-2 border-[#424655] text-[#e5e2e3] font-bold uppercase rounded-none hover:bg-[#353436]"
                >
                  <Link to="/dashboard">Return to Dashboard</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 py-6 border-2 border-[#424655] text-[#e5e2e3] font-bold uppercase rounded-none hover:bg-[#353436]"
                >
                  <Link to="/registry">View Registry</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (formStatus === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 animate-in zoom-in-95 duration-300">
        <div className="max-w-xl w-full border-2 border-[#ffb4ab] bg-[#201f20] p-8 md:p-12 relative shadow-[0_0_40px_rgba(255,180,171,0.1)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#ffb4ab] -mt-1 -ml-1"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#ffb4ab] -mb-1 -mr-1"></div>

          <div className="flex flex-col items-center text-center space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-[#ffb4ab] flex items-center justify-center mb-6">
                <XCircle size={64} className="text-[#690005]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#ffb4ab] uppercase tracking-tight">
                Ticket Generation Failed
              </h1>
            </div>

            <div className="w-full bg-[#2a2a2b] border border-[#424655] p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#c2c6d7] uppercase tracking-widest font-bold">System Status</span>
                <div className="flex items-center justify-center gap-3 text-[#e5e2e3]">
                  <AlertTriangle size={18} className="text-[#ffb4ab] flex-shrink-0" />
                  <span className="font-mono text-sm uppercase text-left">
                    {serverError || "Error: System was unable to process this request."}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <Button
                onClick={() => { setFormStatus("FORM"); setServerError(null); }}
                className="w-full py-8 bg-[#ffb4ab] text-[#690005] font-bold text-lg rounded-none uppercase tracking-tighter flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <RefreshCw size={24} />
                Retry Ticket Creation
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full py-6 border-2 border-[#424655] text-[#e5e2e3] font-bold uppercase rounded-none hover:bg-[#353436]"
              >
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#b0c6ff] uppercase tracking-tight">Ticket Creation Console</h1>
          <p className="font-mono text-[#c2c6d7] mt-1 text-sm">QR CODE Ticket Akan Segera Dikirim Ke EMAIL Peserta</p>
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
                  <div className="font-mono text-xs text-[#e5e2e3] uppercase tracking-widest">Auto Input Nama + NIK dari KTP</div>
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
              <div className="font-mono text-xs text-[#ffb4ab] uppercase font-bold">AI Scanner Confidence Warning</div>
              <div className="text-sm text-[#e5e2e3] mt-1">Please verify extracted NIK & Nama. Scanner may include mistakes.</div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#1c1b1c] border border-[#424655] p-8 h-full">
            <div className="flex items-center gap-3 mb-8 border-b border-[#424655] pb-6">
              <Edit3 className="text-[#b0c6ff]" size={24} />
              <h2 className="text-xl font-bold text-[#e5e2e3] uppercase">Data Penerima Tiket</h2>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-[#c2c6d7] uppercase flex justify-between font-bold">
                  Full Name
                  <span className="text-[#b0c6ff]">Required [A-Z]</span>
                </label>
                <Input
                  className="bg-[#0e0e0f] border-[#424655] focus:border-[#b0c6ff] text-[#e5e2e3] h-12 rounded-none font-mono uppercase"
                  placeholder="John Doe"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              {/* NIK */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold">NIK (Nomor Induk Kependudukan)</label>
                <div className="relative">
                  <Input
                    className={cn(
                      "bg-[#0e0e0f] h-12 rounded-none font-mono",
                      nikError ? "border-2 border-[#ffb4ab]" : "border-[#424655] focus:border-[#b0c6ff]"
                    )}
                    required
                    value={formData.identification_number}
                    onChange={handleNikChange}
                  />
                  {isCheckingNik && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <RefreshCw className="animate-spin text-[#b0c6ff]" size={16} />
                    </div>
                  )}
                  {nikError && !isCheckingNik && (
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
                  placeholder="john.doe@gmail.com"
                  required
                  className="bg-[#0e0e0f] border-[#424655] focus:border-[#b0c6ff] text-[#e5e2e3] h-12 rounded-none font-mono"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Payment Status */}
              <div className="space-y-4">
                <label className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold">Payment Status</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData({ ...formData, paymentStatus: "paid" })}
                    className={cn(
                      "p-4 border-2 transition-all flex items-center justify-between cursor-pointer",
                      formData.paymentStatus === "paid" ? "border-[#00e475] bg-[#00e475]/10" : "border-[#424655]"
                    )}
                  >
                    <span className="font-mono text-xs font-bold uppercase">Paid</span>
                    <CheckCircle2
                      className={cn("text-[#00e475]", formData.paymentStatus === "paid" ? "opacity-100" : "opacity-0")}
                      size={20}
                    />
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, paymentStatus: "pending" })}
                    className={cn(
                      "p-4 border-2 transition-all flex items-center justify-between cursor-pointer",
                      formData.paymentStatus === "pending" ? "border-[#fe9400] bg-[#fe9400]/10" : "border-[#424655]"
                    )}
                  >
                    <span className="font-mono text-xs font-bold uppercase">Pending</span>
                    <Clock
                      className={cn("text-[#fe9400]", formData.paymentStatus === "pending" ? "opacity-100" : "opacity-0")}
                      size={20}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isProcessing || !!nikError}
                  className="w-full h-16 bg-[#b0c6ff] hover:bg-[#b0c6ff]/90 text-[#002d6e] font-bold text-lg rounded-none uppercase tracking-widest group"
                >
                  {isProcessing ? "Processing Submission..." : "Create & Send Ticket"}
                  {!isProcessing && <ArrowRight className="ml-4 transition-transform group-hover:translate-x-2" />}
                </Button>
                <p className="text-center font-mono text-[10px] text-[#c2c6d7] mt-4 uppercase">
                  Ticket will be created as {formData.paymentStatus === "paid" ? "PAID (QR email sent immediately)" : "PENDING"}
                </p>
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
