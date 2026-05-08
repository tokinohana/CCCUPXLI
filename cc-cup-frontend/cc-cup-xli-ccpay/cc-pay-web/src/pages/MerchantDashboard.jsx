import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  ReceiptText,
  Settings,
  QrCode
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const MerchantDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const liveTransactions = [
    { id: '00921-ID', name: 'Ahmad Fauzi', time: '10:42', amount: 22000 },
    { id: '00920-ID', name: 'Siti Aminah', time: '10:39', amount: 18500 },
    { id: '00919-ID', name: 'Kevin Pratama', time: '10:35', amount: 45000 },
  ];

  const dailyHistory = [
    { day: 'Senin, 18 Apr', count: 210, amount: 2100000 },
    { day: 'Minggu, 17 Apr', count: 145, amount: 1450000 },
  ];

  return (
    <div className="bg-[#f7f9fc] font-['Inter',_sans-serif] text-[#191c1e] min-h-screen pb-24 selection:bg-[#006e2a]/10 antialiased">
      {/* TopAppBar */}
      <header className="bg-[#1A1C1E] text-white font-bold tracking-tight fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e6e8eb] rounded-lg overflow-hidden flex-shrink-0">
            <img
              alt="Merchant Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkOr3CMerm5SU43GNCY6B6iULuT5BFVOKJn9Yw-rl75vXuAO5y_ejxMnHPzNboMJGTL7lwcA4H69EsgH3Qh23b-98ky7as3rbt-3-0d0Dj44QvKhIBb-F04stbHXa0JOEer9PwPnEw9wRGDtOtq0dZ9-huDJcr09Tui7V1U0LWROFih5kV-FhUhZb8L0wAgTLdziHUvmXRZKGBGn0LpnsXk2Q5zxPhs78rG-1zagYQWAs3mqIHraXu8EqdnP0dRVvb3jCsmr8cRsU"
            />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">[Merchant Name]</span>
        </div>
        <button className="hover:opacity-90 active:scale-95 transition-all outline-none">
          <Bell className="h-6 w-6 text-white" />
        </button>
      </header>

      <main className="pt-24 px-4 space-y-6 max-w-md mx-auto">
        {/* Revenue Summary */}
        <section className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <h1 className="text-[#44474a] text-sm font-semibold uppercase tracking-wider">Pendapatan Hari Ini</h1>
          <div className="flex flex-col">
            {isLoading ? (
              <div className="space-y-2 mt-1">
                <Skeleton className="h-10 w-48 bg-[#e0e3e6]" />
                <Skeleton className="h-4 w-32 bg-[#e0e3e6]" />
              </div>
            ) : (
              <>
                <span className="text-4xl font-extrabold tracking-tight text-[#006e2a] leading-none">Rp 1.450.000</span>
                <span className="text-[#44474a] text-sm mt-1">Total: 42 Pembayaran</span>
              </>
            )}
          </div>
        </section>

        {/* Verification Card (Latest Transaction) */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          {isLoading ? (
            <Skeleton className="h-[120px] w-full rounded-xl" />
          ) : (
            <div className="bg-white rounded-xl p-4 border border-[#e0e3e6] border-l-4 border-l-[#006e2a] shadow-[0px_4px_6px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-[#006e2a] uppercase tracking-widest bg-[#5cfd80] px-2 py-1 rounded">Terverifikasi</span>
                <span className="text-[#44474a] text-xs font-mono">2 menit lalu</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#191c1e]">Budi Santoso</span>
                <span className="text-2xl font-black text-[#1a1c1e] tracking-tight mt-1">Rp 15.000</span>
              </div>
            </div>
          )}
        </section>

        {/* Live Feed Section */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold tracking-tight text-[#000101]">Live Transaksi</h2>
            <span className="text-xs text-[#006e2a] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 bg-[#006e2a] rounded-full animate-pulse"></span> Live
            </span>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : (
              liveTransactions.map((txn) => (
                <div key={txn.id} className="bg-white p-4 rounded-lg flex justify-between items-center border border-[#e0e3e6] active:scale-[0.98] transition-transform cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#000101]">{txn.name}</span>
                    <span className="text-xs text-[#44474a] font-mono">{txn.time} • {txn.id}</span>
                  </div>
                  <span className="text-md font-bold text-[#006e2a] font-mono">Rp {txn.amount.toLocaleString('id-ID')}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Daily Analytics */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both">
          <h2 className="text-xl font-bold tracking-tight text-[#000101]">Riwayat Harian</h2>
          <div className="grid grid-cols-1 gap-3">
            {isLoading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : (
              dailyHistory.map((item, idx) => (
                <div key={idx} className="bg-[#f2f4f7] p-4 rounded-lg flex justify-between items-center active:scale-[0.98] transition-transform cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e0e3e6] rounded flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-[#000101]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#000101]">{item.day}</span>
                      <span className="text-xs text-[#44474a]">{item.count} Transaksi</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#191c1e] font-mono">Rp {item.amount.toLocaleString('id-ID')}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer Action */}
        <footer className="py-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
          <button className="group w-full py-4 border-2 border-[#1a1c1e] text-[#1a1c1e] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a1c1e] hover:text-white transition-all active:scale-95 outline-none">
            <HelpCircle className="h-5 w-5" />
            Butuh Bantuan?
          </button>
        </footer>
      </main>

      {/* Floating Action Button */}
      <button className="fixed right-6 bottom-24 w-14 h-14 bg-[#000101] text-white rounded-xl shadow-xl flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-150 z-40 outline-none">
        <QrCode className="h-8 w-8" />
      </button>
    </div>
  );
};

export default MerchantDashboard;
