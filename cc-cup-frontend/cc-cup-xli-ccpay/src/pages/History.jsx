import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ArrowUpRight, ArrowDownLeft, Ban } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import BottomNavbar from '../components/BottomNavbar';

const History = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalOut: 0, totalIn: 0 });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTransactionHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ccpay/transactions/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // 🌟 2. EXPIRED/INVALID TOKEN REJECTION: Clean database access rejections
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data);

        let incomingSum = 0;
        let outgoingSum = 0;
        data.forEach(txn => {
          if (txn.type === 'DISTRIBUTION') {
            incomingSum += txn.amount;
          } else if (txn.type === 'PAYMENT') {
            outgoingSum += txn.amount;
          }
        });
        setStats({ totalIn: incomingSum, totalOut: outgoingSum });
      } catch (err) {
        console.error("Failed loading backend historical transactions ledger:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [navigate]); // Added navigate cleanup safely to listener arrays

  // Standardizes dynamic mapping inputs back to template expectations safely
  const getMappedType = (backendType) => {
    if (backendType === 'DISTRIBUTION') return 'in';
    if (backendType === 'PAYMENT') return 'out';
    return 'expired';
  };

  // Normalizes rendering parameters safely for internal processing engines
  const processedTransactions = transactions.map(txn => {
    const isIncoming = txn.type === 'DISTRIBUTION';
    const txnTitle = isIncoming
      ? (txn.description || 'Coupon Distribution')
      : (txn.merchant_stand_name || txn.description || 'Kantin Stand');

    return {
      id: txn.reference_id ? txn.reference_id.substring(0, 9).toUpperCase() : `TXN-${txn.id}`,
      type: getMappedType(txn.type),
      title: txnTitle,
      amount: txn.amount,
      time: txn.formatted_time || '00:00 AM',
      dateBucket: txn.formatted_date || 'Older'
    };
  });

  // Processing function applying global type and text filters cleanly
  const filterRecords = (records) => {
    return records.filter(txn => {
      const matchesSearch = txn.title.toLowerCase().includes(searchQuery.toLowerCase()) || txn.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === 'All') return true;
      return txn.type === activeFilter.toLowerCase();
    });
  };

  const filteredToday = filterRecords(processedTransactions.filter(t => t.dateBucket === 'Today'));
  const filteredYesterday = filterRecords(processedTransactions.filter(t => t.dateBucket === 'Yesterday'));
  const filteredOlder = filterRecords(processedTransactions.filter(t => t.dateBucket !== 'Today' && t.dateBucket !== 'Yesterday'));

  const hasResults = filteredToday.length > 0 || filteredYesterday.length > 0 || filteredOlder.length > 0;

  return (
    <div className="bg-[#090a0b] text-[#8a939e] min-h-screen pb-28 font-sans antialiased selection:bg-[#69ff87]/30 w-full overflow-x-hidden">

      {/* Matte Sticky Top Header Block */}
      <header className="sticky top-0 z-40 bg-[#090a0b]/80 backdrop-blur-md border-b border-[#16191d] px-4 py-4">
        <div className="max-w-xl mx-auto flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#131619] border border-[#1e2226] text-[#8a939e] hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">Riwayat Transaksi</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-5">

        {/* High-End Clean Stats Row */}
        <section className="grid grid-cols-2 gap-2.5 mb-6">
          <div className="bg-[#131619] border border-[#1e2226] p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#535c66] block">Total Pengeluaran</span>
            {isLoading ? (
              <Skeleton className="h-6 w-24 bg-[#1e2226] mt-2" />
            ) : (
              <span className="text-lg font-black text-white tracking-tight block mt-1">
                Rp {stats.totalOut.toLocaleString('id-ID')}
              </span>
            )}
          </div>
          <div className="bg-[#131619] border border-[#1e2226] p-4 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#535c66] block">Total Kupon Masuk</span>
            {isLoading ? (
              <Skeleton className="h-6 w-24 bg-[#1e2226] mt-2" />
            ) : (
              <span className="text-lg font-black text-[#69ff87] tracking-tight block mt-1">
                Rp {stats.totalIn.toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </section>

        {/* Filter Operations Desk */}
        <section className="space-y-3 mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#535c66] group-focus-within:text-[#69ff87] transition-colors" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-[#131619] border border-[#1e2226] rounded-xl text-xs placeholder-[#535c66] text-white outline-none focus:border-[#69ff87]/50 transition-all font-medium"
              placeholder="Cari transaksi berdasarkan nama atau ID..."
              type="text"
            />
          </div>

          {/* Type Sorting Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'In', 'Out', 'Expired'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all border ${activeFilter === filter
                    ? 'bg-[#1a1d21] text-white border-[#2a2f35]'
                    : 'bg-transparent text-[#535c66] border-transparent hover:text-white'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Ledger Render Grid Stack */}
        <section className="space-y-6">
          {isLoading ? (
            [1, 2].map((group) => (
              <div key={group} className="space-y-3">
                <Skeleton className="h-3 w-14 bg-[#131619]" />
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl bg-[#131619]" />
                  ))}
                </div>
              </div>
            ))
          ) : hasResults ? (
            <>
              {filteredToday.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold tracking-widest text-[#535c66] uppercase px-1">Hari Ini</div>
                  <div className="space-y-2">
                    {filteredToday.map((txn) => (
                      <TransactionRow key={txn.id} txn={txn} />
                    ))}
                  </div>
                </div>
              )}

              {filteredYesterday.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold tracking-widest text-[#535c66] uppercase px-1 mt-2">Kemarin</div>
                  <div className="space-y-2">
                    {filteredYesterday.map((txn) => (
                      <TransactionRow key={txn.id} txn={txn} />
                    ))}
                  </div>
                </div>
              )}

              {filteredOlder.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold tracking-widest text-[#535c66] uppercase px-1 mt-2">Sebelumnya</div>
                  <div className="space-y-2">
                    {filteredOlder.map((txn) => (
                      <TransactionRow key={txn.id} txn={txn} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-xs font-medium text-[#535c66]">
              No transactional matching entries found
            </div>
          )}
        </section>

      </main>

      <BottomNavbar />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const TransactionRow = ({ txn }) => {
  const getMeta = () => {
    switch (txn.type) {
      case 'in':
        return {
          icon: <ArrowDownLeft className="w-4 h-4 text-[#69ff87]" />,
          prefix: '+',
          valueStyle: 'text-[#69ff87]'
        };
      case 'out':
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-[#ff6b6b]" />,
          prefix: '-',
          valueStyle: 'text-white'
        };
      default:
        return {
          icon: <Ban className="w-3.5 h-3.5 text-[#535c66]" />,
          prefix: '',
          valueStyle: 'text-[#535c66] line-through'
        };
    }
  };

  const meta = getMeta();

  return (
    <div className={`group flex items-center justify-between p-3.5 rounded-xl border bg-[#131619] border-[#1e2226] hover:border-[#2a2f35] transition-all duration-150 ${txn.type === 'expired' ? 'opacity-50' : ''}`}>
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[#1a1d21] border border-[#2a2f35] flex items-center justify-center flex-shrink-0">
          {meta.icon}
        </div>
        <div className="min-w-0 flex flex-col">
          <span className="text-xs font-bold tracking-tight text-white truncate block">
            {txn.title}
          </span>
          <span className="font-mono text-[9px] font-bold text-[#535c66] uppercase mt-0.5 tracking-tighter">
            {txn.id} • {txn.time}
          </span>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <span className={`text-xs font-bold tracking-tight ${meta.valueStyle} block`}>
          {meta.prefix}Rp {txn.amount.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );
};

export default History;