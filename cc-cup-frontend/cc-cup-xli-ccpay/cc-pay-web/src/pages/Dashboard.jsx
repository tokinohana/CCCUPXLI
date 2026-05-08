import React from 'react';
import { 
  Home, 
  CalendarDays, 
  History, 
  User, 
  Bell, 
  Eye, 
  QrCode, 
  CalendarCheck, 
  Users, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  Timer, 
  ChevronRight 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  const navigate = useNavigate();
  const transactions = [
    { id: 'TXN-49201', type: 'in', title: 'Coupon Distribution', amount: 35000, date: 'Today, 08:30 AM' },
    { id: 'TXN-49188', type: 'out', title: 'Green Canteen', amount: 15000, date: 'Yesterday, 13:15 PM' },
    { id: 'TXN-49175', type: 'out', title: 'Student Book Store', amount: 22500, date: 'Yesterday, 10:00 AM' },
    { id: 'TXN-49021', type: 'in', title: 'Incentive Reward', amount: 50000, date: '22 Oct, 16:45 PM' },
  ];

  return (
    <div className="bg-surface text-on-surface flex min-h-screen font-sans">
      {/* SideNavBar (Desktop) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full py-8 w-64 bg-slate-50 border-r border-slate-200 z-50">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-black text-[#191c1e]">CC PAY</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Student Portal</p>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <a className="flex items-center space-x-3 text-[#191c1e] bg-white border-l-4 border-[#191c1e] px-4 py-3 active:scale-[0.98] transition-all" href="#">
            <Home className="h-5 w-5" />
            <span className="text-sm font-medium">Home</span>
          </a>
          <a className="flex items-center space-x-3 text-slate-500 px-4 py-3 hover:text-[#191c1e] hover:bg-slate-100 transition-all" href="#">
            <CalendarDays className="h-5 w-5" />
            <span className="text-sm font-medium">Schedule</span>
          </a>
          <a className="flex items-center space-x-3 text-slate-500 px-4 py-3 hover:text-[#191c1e] hover:bg-slate-100 transition-all" href="#">
            <History className="h-5 w-5" />
            <span className="text-sm font-medium">History</span>
          </a>
          <a className="flex items-center space-x-3 text-slate-500 px-4 py-3 hover:text-[#191c1e] hover:bg-slate-100 transition-all" href="#">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">Profile</span>
          </a>
        </nav>
        <div className="px-6 mt-auto">
          <Button className="w-full py-6 bg-[#1a1c1e] text-white hover:bg-[#1a1c1e]/90 rounded-lg font-semibold text-sm border-none">
            View Earnings
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center w-full px-6 py-3">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tighter text-[#191c1e]">CC PAY</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
              <Bell className="h-5 w-5" />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuANDusR5ut9HNecEuaDpNg2LXepuy91GLHYsz0T_5gI8eDAlJCDODE2HlwesEa8n6HBhP-uAjGTtIC3sIZ1dSwzG-h-E326tMWg5bV5fzHIGJLf-K8CqEWG6gmAVOHm3efH2U8BEyHjmc9gnxPv77pyRv2pWDQCSlyTa4uCO87z0paXU-VuDpF8a_YkOgu6AN9GhL1ddpxamPu7NdgPXgBLgw2qlswPNtYSLHNrDVyMTcRKWakZ1xI5L6S8rXtS13X1z_H0O2Iruvs" alt="Student Profile" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full pb-28">
          {/* Header Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Wallet Section */}
            <section className="lg:col-span-7 bg-[#1a1c1e] text-white p-8 rounded-xl flex flex-col justify-between shadow-lg min-h-[220px] animate-in fade-in slide-in-from-left-4 duration-700 delay-100 fill-mode-both">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#e0e3e6] font-medium tracking-wide text-sm">Main Balance</h2>
                  <Badge className="bg-[#006e2a] px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-tighter hover:bg-[#006e2a] border-none">
                    Aktif hingga 17:00
                  </Badge>
                </div>
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter text-white">Rp 35.000</span>
                  <Eye className="h-6 w-6 text-[#838486] cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/scanner')}
                  className="bg-[#69ff87] text-[#002108] hover:bg-[#69ff87]/90 px-8 py-4 rounded-lg flex items-center space-x-3 font-bold active:scale-95 transition-transform h-auto border-none"
                >
                  <QrCode className="h-5 w-5" />
                  <span>Pay Now</span>
                </Button>
                <Button variant="ghost" className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg flex items-center justify-center font-semibold transition-colors h-auto border-none">
                  Top Up
                </Button>
              </div>
            </section>

            {/* Shift Info Section */}
            <section className="lg:col-span-5 bg-[#E3F2FD] border border-[#BBDEFB] p-8 rounded-xl flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-700 delay-200 fill-mode-both">
              <div className="flex items-center space-x-2 text-blue-700 mb-6">
                <CalendarCheck className="h-5 w-5" />
                <h3 className="font-bold tracking-tight text-sm uppercase">Your Shift Schedule</h3>
              </div>
              <div className="mb-6">
                <p className="text-4xl font-black text-[#191c1e] tracking-tighter">12:00 - 15:00</p>
                <p className="text-slate-600 font-medium mt-1">Divisi: <span className="text-[#191c1e]">Food Service</span></p>
              </div>
              <div className="flex items-center p-4 bg-white/50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold leading-none">Penanggung Jawab</p>
                  <p className="text-sm font-bold text-[#191c1e]">Capt. Sarah</p>
                </div>
              </div>
            </section>
          </div>

          {/* Bento Layout Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction History */}
            <Card className="lg:col-span-2 stitch-card rounded-xl overflow-hidden border-none p-0 bg-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-lg font-bold tracking-tight text-[#000101]">Transaction History</h3>
                <a className="text-sm font-semibold text-slate-500 hover:text-[#000101] transition-colors" href="#">View All</a>
              </div>
              <div className="divide-y divide-slate-50">
                {transactions.map((txn, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${txn.type === 'in' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        {txn.type === 'in' ? (
                          <ArrowUp className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1e]">{txn.title}</p>
                        <p className="text-xs text-slate-500">{txn.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${txn.type === 'in' ? 'text-[#006e2a]' : 'text-[#ba1a1a]'}`}>
                        {txn.type === 'in' ? '+' : '-'}Rp {txn.amount.toLocaleString('id-ID')}
                      </p>
                      <p className="data-mono text-[10px] text-slate-400">{txn.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats Sidebar */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#e6e8eb] p-6 rounded-xl border border-[#c5c6ca] flex items-center justify-between mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both hover:bg-[#d8dadd] transition-colors cursor-pointer group">
                <div>
                  <p className="font-bold text-[#191c1e]">Need Help?</p>
                  <p className="text-xs text-slate-600">Contact coordinator</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <BottomNavbar />
      </main>
    </div>
  );
};

export default Dashboard;
