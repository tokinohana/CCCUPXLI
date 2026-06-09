import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ConfirmPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userBalance, setUserBalance] = useState(0);

  // Extract contextual data sent from PaymentInput safely
  const { merchant, amount } = location.state || {};

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!merchant || !amount) {
      navigate(-1);
      return;
    }

    const fetchFreshBalance = async () => {
      try {
        setIsPageLoading(true);
        const response = await fetch('/api/ccpay/balance/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUserBalance(data.current_saldo || 0);
        }
      } catch (err) {
        console.error("Failed fetching context metrics for confirmation screen:", err);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchFreshBalance();
  }, [merchant, amount, navigate]);

  const remainingBalance = userBalance - (amount || 0);
  const isBalanceInsufficient = remainingBalance < 0;

  const handleExecutePayment = async () => {
    if (isSubmitting || isBalanceInsufficient) return;
    
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      
      if ("vibrate" in navigator) {
        navigator.vibrate([40, 40, 40]);
      }

      const token = localStorage.getItem('access_token');
      const uniqueReferenceId = `CC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const response = await fetch('/api/ccpay/payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nis: "", 
          amount: amount,
          merchant_token: merchant.token,
          reference_id: uniqueReferenceId
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Transaksi gagal dikonfirmasi sistem.");
      }

      if ("vibrate" in navigator) {
        navigator.vibrate(300);
      }
      
      // Navigate immediately away instead of freezing the thread with standard window alerts
      navigate('/', { replace: true, state: { paymentSuccess: true, merchantName: merchant.name } });
      
    } catch (err) {
      console.error("Transaction pipeline failure:", err);
      setErrorMessage(err.message || "Terjadi kesalahan network. Sila coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#090a0b] font-sans text-[#8a939e] min-h-screen flex flex-col antialiased select-none w-full max-w-md mx-auto justify-between p-4 pb-safe overflow-hidden">
      
      {/* 1. Header Area Block */}
      <div className="w-full">
        <header className="w-full flex items-center justify-between pt-2 pb-4">
          <button 
            disabled={isSubmitting}
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#131619] border border-[#1e2226] text-[#8a939e] hover:text-white transition-all active:scale-95 disabled:opacity-20"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#535c66]">Konfirmasi Transaksi</span>
          <div className="w-10 h-10 opacity-0 pointer-events-none" />
        </header>
      </div>

      {/* 2. Primary Invoice Presentation Core View */}
      <main className="flex-1 flex flex-col justify-center items-center px-2 space-y-8">
        
        {/* Dynamic Verification Icon Wrapper */}
        <div className="w-16 h-16 rounded-2xl bg-[#131619] border border-[#2a2f35] flex items-center justify-center text-[#69ff87] shadow-xl relative">
          <ShieldCheck className="w-8 h-8" />
          <div className="absolute inset-0 rounded-2xl border border-[#69ff87]/20 animate-pulse" />
        </div>

        {/* Amount Display Blocks */}
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-[#535c66] uppercase tracking-widest block">Total Pembayaran</span>
          <div className="flex items-baseline justify-center space-x-1.5">
            <span className="text-xl font-bold text-[#535c66]">Rp</span>
            <span className="text-5xl font-black text-white tracking-tighter tabular-nums">
              {amount?.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Detailed Receipt Breakdown Layout */}
        <div className="w-full bg-[#131619] border border-[#1e2226] rounded-2xl p-4 space-y-3.5">
          
          <div className="flex justify-between items-start border-b border-[#1e2226]/60 pb-3">
            <span className="text-[11px] font-bold text-[#535c66] uppercase tracking-wider mt-0.5">Penerima</span>
            <div className="text-right max-w-[65%] min-w-0">
              <span className="text-xs font-bold text-white block truncate">{merchant?.name}</span>
              <span className="text-[10px] font-mono font-bold text-[#535c66] block truncate uppercase mt-0.5">
                ID: {merchant?.token ? `${merchant.token.substring(0, 12)}...` : 'TOKEN_UNKNOWN'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[11px] font-bold text-[#535c66] uppercase tracking-wider">Saldo Saat Ini</span>
            {isPageLoading ? (
              <Skeleton className="h-4 w-20 bg-[#1e2226]" />
            ) : (
              <span className="font-bold text-white tabular-nums">
                Rp {userBalance.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-[11px] font-bold text-[#535c66] uppercase tracking-wider">Sisa Saldo Setelahnya</span>
            {isPageLoading ? (
              <Skeleton className="h-4 w-20 bg-[#1e2226]" />
            ) : (
              <span className={`font-black tabular-nums ${isBalanceInsufficient ? 'text-[#ff6b6b]' : 'text-[#69ff87]'}`}>
                Rp {remainingBalance.toLocaleString('id-ID')}
              </span>
            )}
          </div>

        </div>

        {/* Server Rejection/Network Failure Alerts Container */}
        {errorMessage && (
          <div className="w-full p-3.5 bg-[#ff6b6b]/5 border border-[#ff6b6b]/20 rounded-xl flex items-start space-x-3 text-left">
            <AlertTriangle className="w-4 h-4 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
            <span className="text-xs font-bold text-[#ff6b6b] leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Structural Insufficient Alert Box */}
        {!isPageLoading && isBalanceInsufficient && !errorMessage && (
          <div className="w-full p-3.5 bg-[#ffb86c]/5 border border-[#ffb86c]/20 rounded-xl flex items-start space-x-3 text-left">
            <AlertTriangle className="w-4 h-4 text-[#ffb86c] flex-shrink-0 mt-0.5" />
            <span className="text-xs font-bold text-[#ffb86c] leading-tight">
              Saldo Anda tidak mencukupi untuk menyelesaikan transaksi makan ini.
            </span>
          </div>
        )}

      </main>

      {/* 3. Bottom Button Controls Wrapper */}
      <div className="w-full pt-4 space-y-2">
        <Button
          disabled={isPageLoading || isSubmitting || isBalanceInsufficient}
          onClick={handleExecutePayment}
          className="w-full h-12 bg-[#69ff87] hover:bg-[#5ade78] disabled:opacity-10 disabled:pointer-events-none text-[#090a0b] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 border-none shadow-lg shadow-[#69ff87]/5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#090a0b]" />
              <span>Memproses Pembayaran...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-[#090a0b]" />
              <span>Konfirmasi & Bayar</span>
            </>
          )}
        </Button>
        
        <p className="text-center text-[10px] font-bold tracking-tight text-[#535c66] px-4">
          Pastikan nominal merchant stand sudah sesuai sebelum menekan tombol konfirmasi.
        </p>
      </div>

    </div>
  );
};

export default ConfirmPayment;