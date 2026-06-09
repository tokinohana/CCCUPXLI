import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  HelpCircle,
  QrCode,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const MerchantDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // 🌟 Active dynamic state wrappers populated via the backend View data payload
  const [merchantName, setMerchantName] = useState('Loading...');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [dailyHistory, setDailyHistory] = useState([]);

  // Fetch data directly from the authenticated endpoint
  const fetchDashboardData = async () => {
    try {
      // Safely fetch the terminal token stored inside the client browser instance context
      const token = localStorage.getItem('merchant_token') || 'YOUR_DEFAULT_MERCHANT_TOKEN';
      
      const response = await fetch(`/api/ccpay/merchant/dashboard/?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Optional: If token verification is strictly passed via standard JWT authorization headers:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Map DRF API keys directly to the functional UI dashboard targets
        setMerchantName(data.merchant_name);
        setTotalRevenue(data.total_revenue);
        setTodayRevenue(data.today_revenue);
        setTodayCount(data.today_count);
        setLiveTransactions(data.live_transactions || []);
        setDailyHistory(data.daily_history || []);
      }
    } catch (error) {
      console.error("Failed to fetch operational merchant data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run an immediate fetch check on mount instantiation sequence
    fetchDashboardData();

    // Establish a live 5-second polling loop to capture immediate user terminal checks
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Compute the absolute most recent lunas/payment record for the "Boomer Verification" display box
  const latestTxn = liveTransactions.length > 0 ? liveTransactions[0] : null;

  return (
    <div className="bg-[#090a0b] font-sans text-[#8a939e] min-h-screen pb-32 selection:bg-[#69ff87]/30 select-none antialiased w-full max-w-md mx-auto border-x border-[#16191d]/40 relative">
      
      {/* 1. Premium Glassmorphic Navigation Header Bar */}
      <header className="bg-[#090a0b]/80 backdrop-blur-md border-b border-[#16191d] sticky top-0 left-0 right-0 z-50 px-4 py-3.5">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-b from-[#1e2226] to-[#131619] border border-[#2a2f35] p-0.5 shadow-md">
              <img
                alt="Merchant Profile"
                className="w-full h-full object-cover rounded-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkOr3CMerm5SU43GNCY6B6iULuT5BFVOKJn9Yw-rl75vXuAO5y_ejxMnHPzNboMJGTL7lwcA4H69EsgH3Qh23b-98ky7as3rbt-3-0d0Dj44QvKhIBb-F04stbHXa0JOEer9PwPnEw9wRGDtOtq0dZ9-huDJcr09Tui7V1U0LWROFih5kV-FhUhZb8L0wAgTLdziHUvmXRZKGBGn0LpnsXk2Q5zxPhs78rG-1zagYQWAs3mqIHraXu8EqdnP0dRVvb3jCsmr8cRsU"
              />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-none">
                {isLoading ? <Skeleton className="h-4 w-20 bg-[#1e2226]" /> : merchantName}
              </h1>
              <p className="text-[10px] font-bold text-[#69ff87] uppercase tracking-widest mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#69ff87] animate-pulse" /> Live Terminal
              </p>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#131619] border border-[#1e2226] text-[#8a939e] active:scale-95 transition-all relative hover:text-white">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#69ff87] rounded-full" />
          </button>
        </div>
      </header>

      {/* Main Structural Layout Content Sheet */}
      <main className="px-4 pt-6 space-y-6">
        
        {/* 2. Today's Revenue Master Board */}
        <section className="bg-gradient-to-b from-[#131619] to-[#0d0f11] border border-[#1e2226] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-[0.02] pointer-events-none">
            <TrendingUp className="w-32 h-32 text-white" />
          </div>
          <p className="text-[9px] font-black text-[#535c66] uppercase tracking-widest mb-1">TOTAL PENDAPATAN HARI INI</p>
          <div className="flex flex-col">
            {isLoading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-10 w-56 bg-[#1e2226]" />
                <Skeleton className="h-4 w-32 bg-[#1e2226]" />
              </div>
            ) : (
              <>
                <span className="text-[40px] font-black tracking-tight text-[#69ff87] tabular-nums leading-none my-1">
                  Rp {todayRevenue.toLocaleString('id-ID')}
                </span>
                <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-[#1e2226]/50">
                  <span className="text-white text-xs font-bold bg-[#1a1d21] border border-[#2a2f35]/60 px-2.5 py-1 rounded-lg">
                    {todayCount} Transaksi Sukses
                  </span>
                  <span className="text-[10px] text-[#535c66] font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} /> Updated
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 3. High-Priority "Boomer Verification" Hero Card */}
        <section className="space-y-2.5">
          <p className="text-[9px] font-black text-[#535c66] uppercase tracking-widest px-0.5">DANA TERAKHIR MASUK</p>
          {isLoading ? (
            <Skeleton className="h-28 w-full rounded-2xl bg-[#131619]" />
          ) : latestTxn ? (
            <div className="bg-gradient-to-b from-[#131619] to-[#131619]/90 rounded-2xl p-5 border border-[#1e2226] shadow-xl relative overflow-hidden">
              {/* Left Accent Bar to give instant spatial verification feedback */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#69ff87]" />
              
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[10px] font-black text-[#090a0b] uppercase tracking-wider bg-[#69ff87] px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm shadow-[#69ff87]/10">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />LUNAS
                </span>
                <span className="text-[#8a939e] text-[11px] font-bold font-mono">
                  Pukul {latestTxn.time} WIB
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-[#535c66] uppercase tracking-wider mb-0.5">Pelanggan/Siswa</p>
                  <h3 className="text-lg font-black text-white tracking-tight truncate">{latestTxn.name}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-black text-[#69ff87] tracking-tight tabular-nums">
                    +Rp {latestTxn.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#131619]/20 rounded-2xl p-6 border border-[#1e2226] text-center text-xs text-[#535c66] font-medium">
              Belum ada transaksi masuk hari ini.
            </div>
          )}
        </section>

        {/* 4. Streamlined Real-time Transaction Log */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-0.5">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#535c66]">Aliran Transaksi Live</h2>
            <span className="w-2 h-2 rounded-full bg-[#69ff87] animate-ping mb-4" />
          </div>
          <div className="space-y-2">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl bg-[#131619]" />)
            ) : liveTransactions.length > 0 ? (
              liveTransactions.map((txn) => (
                <div key={txn.id} className="bg-[#131619]/40 border border-[#1e2226] p-3.5 rounded-xl flex justify-between items-center hover:border-[#2a2f35] transition-all cursor-pointer group">
                  <div className="min-w-0 text-left">
                    <span className="text-xs font-bold text-white tracking-tight block truncate group-hover:text-[#69ff87] transition-colors">{txn.name}</span>
                    <span className="text-[10px] text-[#535c66] font-mono mt-0.5 block">{txn.time} • ID: {txn.id}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className="text-sm font-bold text-white font-mono">
                      Rp {txn.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-xs text-[#535c66]">Tidak ada data transaksi.</div>
            )}
          </div>
        </section>

        {/* 5. Historical Daily Settlements splits */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-[#535c66] px-0.5">Buku Riwayat Harian</h2>
          <div className="grid grid-cols-1 gap-2">
            {isLoading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl bg-[#131619]" />)
            ) : dailyHistory.length > 0 ? (
              dailyHistory.map((item, idx) => (
                <div key={idx} className="bg-[#131619]/20 border border-[#1e2226]/60 p-3.5 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#131619] border border-[#1e2226] rounded-lg flex items-center justify-center flex-shrink-0 text-[#535c66]">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">{item.day}</span>
                      <span className="text-[10px] text-[#535c66] block font-medium mt-0.5">{item.count} Pembayaran</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#8a939e] font-mono">
                    Rp {item.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-xs text-[#535c66]">Belum ada riwayat harian.</div>
            )}
          </div>
        </section>

        {/* Support Help Action Row */}
        <footer className="pt-4 pb-24">
          <button className="w-full py-3 bg-[#131619]/40 border border-[#1e2226] text-[#535c66] hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            <HelpCircle className="h-3.5 w-3.5" />
            Bantuan & Pengaduan Stand
          </button>
        </footer>
      </main>

      {/* 6. Static Floating Overlay Bottom Block Mask */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-[#090a0b] via-[#090a0b]/95 to-transparent z-40 pointer-events-none flex justify-end">
        <button className="pointer-events-auto w-14 h-14 bg-[#69ff87] hover:bg-[#5ade78] text-[#090a0b] rounded-2xl shadow-xl shadow-[#69ff87]/10 flex items-center justify-center active:scale-95 transition-all border-none outline-none">
          <QrCode className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};

export default MerchantDashboard;