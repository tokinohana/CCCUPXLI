import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Clock 
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import BottomNavbar from '../components/BottomNavbar';

const History = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const transactions = {
    today: [
      { id: 'TXN-49201', type: 'in', title: 'Coupon Distribution', amount: 35000, time: '08:30 AM' },
      { id: 'TXN-49202', type: 'out', title: 'Kantin Sehat', amount: 15000, time: '12:15 PM' },
      { id: 'TXN-48912', type: 'expired', title: 'Expired Coupon', amount: 0, time: '05:01 PM' },
    ],
    yesterday: [
      { id: 'TXN-48855', type: 'out', title: 'Kantin Sehat', amount: 12000, time: '12:45 PM' },
    ]
  };

  return (
    <div className="bg-[#f7f9fc] text-[#191c1e] min-h-screen font-['Inter',_sans-serif] selection:bg-[#006e2a]/10 antialiased pb-20">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 h-16 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="active:scale-[0.95] transition-transform duration-150 p-1 outline-none"
          >
            <ArrowLeft className="h-6 w-6 text-zinc-950" />
          </button>
          <div className="font-bold tracking-tight text-zinc-950 text-xl">Riwayat Transaksi</div>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#006e2a]/10 rounded-full border border-[#006e2a]/20 animate-in fade-in zoom-in-95 duration-500">
            <span className="w-2 h-2 rounded-full bg-[#006e2a] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#006e2a] uppercase tracking-wider">Sesi Aktif</span>
          </div>
        )}
      </header>

      <main className="pt-20 pb-2 px-4 max-w-md mx-auto">
        {/* Summary Card */}
        <section className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <div className="bg-[#1a1c1e] p-6 rounded-xl shadow-[0px_4px_6px_rgba(0,0,0,0.05)] border border-white/5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#006e2a] opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-end">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-white/10" />
                    <Skeleton className="h-8 w-32 bg-white/20" />
                  </div>
                ) : (
                  <div>
                    <div className="text-[11px] font-medium text-[#838486] uppercase tracking-widest mb-1">Total Pengeluaran</div>
                    <div className="text-2xl font-bold tracking-tight">Rp 15.000</div>
                  </div>
                )}
                <div className="text-right">
                  {isLoading ? (
                    <div className="space-y-2 flex flex-col items-end">
                      <Skeleton className="h-3 w-20 bg-white/10" />
                      <Skeleton className="h-8 w-32 bg-white/20" />
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] font-medium text-[#838486] uppercase tracking-widest mb-1">Total Kupon</div>
                      <div className="text-2xl font-bold tracking-tight text-[#3ce36a]">Rp 35.000</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="mb-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777a] h-4 w-4" />
            <input
              className="w-full bg-white border border-[#c5c6ca] rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#1a1c1e] focus:border-[#1a1c1e] outline-none transition-all shadow-sm"
              placeholder="Cari merchant atau tanggal..."
              type="text"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['Semua', 'Masuk', 'Keluar', 'Expired'].map((filter, i) => (
              <button
                key={filter}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  i === 0 ? 'bg-[#1a1c1e] text-white shadow-md' : 'bg-[#e0e3e6] text-[#44474a] hover:bg-[#e6e8eb]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Ledger */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          {isLoading ? (
            [1, 2].map((group) => (
              <div key={group} className="space-y-3">
                <Skeleton className="h-3 w-16 mb-2" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ))
          ) : (
            <>
              <div>
                <div className="text-xs font-bold text-[#75777a] uppercase tracking-widest mb-3 px-1">Hari ini</div>
                <div className="space-y-3">
                  {transactions.today.map((txn) => (
                    <TransactionRow key={txn.id} txn={txn} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-[#75777a] uppercase tracking-widest mb-3 px-1">Kemarin</div>
                <div className="space-y-3">
                  {transactions.yesterday.map((txn) => (
                    <TransactionRow key={txn.id} txn={txn} />
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <BottomNavbar />

      {/* Hide Scrollbar Style */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const TransactionRow = ({ txn }) => {
  const getIcon = () => {
    if (txn.type === 'in') return <ArrowUp className="h-6 w-6" />;
    if (txn.type === 'out') return <ArrowDown className="h-6 w-6" />;
    return <Clock className="h-6 w-6" />;
  };

  const getColors = () => {
    if (txn.type === 'in') return 'bg-[#006e2a]/10 text-[#006e2a]';
    if (txn.type === 'out') return 'bg-[#ba1a1a]/10 text-[#ba1a1a]';
    return 'bg-[#e0e3e6] text-[#75777a]';
  };

  return (
    <div className={`bg-white border border-[#c5c6ca]/30 rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all duration-150 hover:shadow-sm cursor-pointer ${txn.type === 'expired' ? 'grayscale opacity-70' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColors()}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="font-bold text-sm truncate">{txn.title}</div>
          <div className={`font-bold text-sm ${txn.type === 'in' ? 'text-[#006e2a]' : txn.type === 'out' ? 'text-[#ba1a1a]' : 'text-[#191c1e]'}`}>
            {txn.type === 'in' ? '+' : txn.type === 'out' ? '-' : ''}Rp {txn.amount.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="font-mono text-[10px] text-[#75777a]">ID {txn.id}</div>
          <div className="text-[10px] text-[#75777a]">{txn.time}</div>
        </div>
      </div>
    </div>
  );
};

export default History;
