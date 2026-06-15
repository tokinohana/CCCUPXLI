import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Lock, Mail, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { authService } from "@/services/api";
import { cn } from "@/lib/utils";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const msg =
        axiosErr.response?.data?.detail ||
        "Authentication failed. Check your credentials.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#b0c6ff]/10 border border-[#b0c6ff] mb-4">
            <Terminal className="text-[#b0c6ff]" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#b0c6ff] uppercase tracking-tight">
            RELAY
          </h1>
          <p className="font-mono text-xs text-[#c2c6d7] mt-1 uppercase tracking-widest">
            Ticketing Operations Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#131314] border border-[#424655] p-8 relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#b0c6ff] -mt-px -ml-px"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#b0c6ff] -mt-px -mr-px"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#b0c6ff] -mb-px -ml-px"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#b0c6ff] -mb-px -mr-px"></div>

          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#424655]">
            <Lock className="text-[#b0c6ff]" size={20} />
            <h2 className="font-mono text-sm font-bold text-[#e5e2e3] uppercase tracking-wider">
              Committee Authentication
            </h2>
          </div>

          {error && (
            <div className="mb-6 bg-[#93000a]/20 border border-[#ffb4ab] p-3 flex items-start gap-3">
              <AlertTriangle className="text-[#ffb4ab] flex-shrink-0 mt-0.5" size={16} />
              <p className="font-mono text-xs text-[#ffb4ab]">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold flex items-center gap-2">
                <Mail size={12} />
                Email Address
              </label>
              <Input
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="operator@cccup.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0e0e0f] border-[#424655] focus:border-[#b0c6ff] text-[#e5e2e3] h-12 rounded-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold flex items-center gap-2">
                <Lock size={12} />
                Password
              </label>
              <Input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0e0e0f] border-[#424655] focus:border-[#b0c6ff] text-[#e5e2e3] h-12 rounded-none font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-14 font-bold text-sm rounded-none uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                isLoading
                  ? "bg-[#424655] text-[#c2c6d7] cursor-not-allowed"
                  : "bg-[#b0c6ff] text-[#002d6e] hover:bg-[#b0c6ff]/90 active:scale-95"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Access Terminal
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center font-mono text-[10px] text-[#8c90a0] mt-6 uppercase tracking-widest">
          Authorized committee members only
        </p>
      </div>
    </div>
  );
};

export default Login;
