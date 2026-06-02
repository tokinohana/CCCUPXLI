import React, { useState } from 'react';
import { 
  Home, 
  CalendarDays, 
  History, 
  User, 
  Bell, 
  Eye, 
  EyeOff,
  QrCode, 
  CalendarCheck, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Clock
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const transactions = [
    { id: 'TXN-49201', type: 'in', title: 'Coupon Distribution', amount: 35000, date: 'Today, 08:30 AM' },
    { id: 'TXN-49188', type: 'out', title: 'Green Canteen', amount: 15000, date: 'Yesterday, 13:15 PM' },
    { id: 'TXN-49175', type: 'out', title: 'Student Book Store', amount: 22500, date: 'Yesterday, 10:00 AM' },
    { id: 'TXN-49021', type: 'in', title: 'Incentive Reward', amount: 50000, date: '22 Oct, 16:45 PM' },
  ];

  return (
    <div className="bg-[#090a0b] text-[#f4f5f6] flex min-h-screen font-sans antialiased selection:bg-[#69ff87]/30 w-full overflow-x-hidden">
      
      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-screen w-full relative">
        
        {/* TopAppBar Container */}
        <header className="sticky top-0 z-40 bg-[#090a0b]/80 backdrop-blur-md border-b border-[#16191d] flex justify-between items-center w-full px-4 py-3.5 max-w-5xl mx-auto">
          <div className="flex items-center">
            <span className="text-lg font-black tracking-tight text-white">CC<span className="text-[#69ff87]">.</span>PAY</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-[#8a939e] hover:text-white bg-[#131619] rounded-full border border-[#1e2226] transition-all relative">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#69ff87] rounded-full ring-2 ring-[#090a0b]" />
              <Bell className="h-4 w-4" />
            </button>
            <Avatar className="h-8 w-8 ring-2 ring-[#1e2226]">
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuANDusR5ut9HNecEuaDpNg2LXepuy91GLHYsz0T_5gI8eDAlJCDODE2HlwesEa8n6HBhP-uAjGTtIC3sIZ1dSwzG-h-E326tMWg5bV5fzHIGJLf-K8CqEWG6gmAVOHm3efH2U8BEyHjmc9gnxPv77pyRv2pWDQCSlyTa4uCO87z0paXU-VuDpF8a_YkOgu6AN9GhL1ddpxamPu7NdgPXgBLgw2qlswPNtYSLHNrDVyMTcRKWakZ1xI5L6S8rXtS13X1z_H0O2Iruvs" alt="Student Profile" />
              <AvatarFallback className="bg-[#1a1d21] text-white font-bold text-xs">ST</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dynamic Spacing Blueprint content field */}
        <div className="px-4 py-5 flex flex-col space-y-5 max-w-5xl w-full mx-auto pb-32">
          
          {/* Main Financial / Schedule Hero Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Wallet Section */}
            <section className="lg:col-span-7 bg-[#131619] border border-[#1e2226] p-5 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group min-h-[200px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#69ff87]/5 rounded-full blur-3xl" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {/* Fixed Dot Layout Spacing */}
                  <div className="flex items-center gap-2 relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#69ff87] animate-pulse flex-shrink-0 mb-2" />
                    <h2 className="text-[#8a939e] font-bold tracking-wider text-[11px] uppercase leading-none">Balance</h2>
                  </div>
                  <Badge className="bg-[#122b1c] border border-[#1b4d2e] px-2 py-0.5 rounded text-[10px] font-bold text-[#69ff87] uppercase tracking-wider whitespace-nowrap">
                    Active until 17:00
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2.5">
                  <span className="text-3xl font-black tracking-tight text-white tabular-nums">
                    {showBalance ? "Rp 35.000" : "••••••"}
                  </span>
                  <button 
                    onClick={() => setShowBalance(!showBalance)} 
                    className="p-1.5 text-[#535c66] hover:text-[#8a939e] transition-colors rounded-md"
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/scanner')}
                  className="bg-[#69ff87] text-[#002108] hover:bg-[#52e070] px-5 py-4 h-auto rounded-xl flex items-center space-x-2 font-bold text-xs uppercase tracking-wide active:scale-[0.97] transition-all flex-1 justify-center"
                >
                  <QrCode className="h-4 w-4 stroke-[2.5]" />
                  <span>Pay Now</span>
                </Button>
                {/* <Button 
                  variant="ghost" 
                  className="bg-[#1a1d21] hover:bg-[#23272d] text-white border border-[#262b32] px-5 py-4 h-auto rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wide transition-all flex-1"
                >
                  Top Up
                </Button> */}
              </div>
            </section>

            {/* Shift Info Section */}
            <section className="lg:col-span-5 bg-[#131619] border border-[#1e2226] p-5 rounded-2xl flex flex-col justify-between shadow-xl gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-[#8a939e]">
                  <CalendarCheck className="h-4 w-4 text-[#69ff87]" />
                  <h3 className="font-bold tracking-wider text-[11px] uppercase">Duty Schedule</h3>
                </div>
                <div>
                  <p className="text-3xl font-black text-white tracking-tight tabular-nums">12:00 - 15:00</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="text-[11px] text-[#8a939e]">Division:</span>
                    <span className="text-[11px] font-bold text-white bg-[#1a1d21] px-2 py-0.5 rounded border border-[#22272d]">Food Service</span>
                  </div>
                </div>
              </div>

              {/* Fixed Supervisor Block Typography Spacing */}
              <div className="flex items-center p-3 bg-[#090a0b] border border-[#1e2226] rounded-xl">
                <div className="h-8 w-8 rounded-lg bg-[#1a1d21] border border-[#2a2f35] flex items-center justify-center mr-3 flex-shrink-0">
                  <Users className="h-4 w-4 text-[#69ff87]" />
                </div>
                <div className="min-w-0 flex flex-col space-y-0.5">
                  <p className="text-[9px] uppercase tracking-wider text-[#535c66] font-bold leading-normal">Supervisor In Charge</p>
                  <p className="text-xs font-bold text-white truncate leading-normal">Capt. Sarah</p>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Bento Stack */}
          <div className="flex flex-col gap-4">
            
            {/* Transaction Ledger Container */}
            <Card className="rounded-2xl border border-[#1e2226] overflow-hidden p-0 bg-[#131619] shadow-xl">
              <div className="px-4 py-3.5 border-b border-[#1e2226] flex justify-between items-center bg-[#131619]">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-[#69ff87]" />
                  <h3 className="text-xs font-bold tracking-wider text-[#f4f5f6] uppercase">Transaction History</h3>
                </div>
                <a className="text-[11px] font-bold text-[#69ff87] bg-[#122b1c] border border-[#1b4d2e] px-2 py-1 rounded transition-colors hover:bg-[#1b4d2e]" href="#">
                  View All
                </a>
              </div>
              
              <div className="divide-y divide-[#16191d]">
                {transactions.map((txn, index) => (
                  <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-[#171b20] transition-colors group">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                        txn.type === 'in' 
                          ? 'bg-[#122b1c] border-[#1b4d2e]' 
                          : 'bg-[#2c1414] border-[#4a1d1d]'
                      }`}>
                        {txn.type === 'in' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-[#69ff87]" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-[#ff6b6b]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white tracking-tight truncate">{txn.title}</p>
                        <div className="flex items-center space-x-1 mt-0.5 text-[#535c66]">
                          <Clock className="h-3 w-3" />
                          <p className="text-[10px] font-medium">{txn.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className={`font-bold text-xs tracking-tight ${txn.type === 'in' ? 'text-[#69ff87]' : 'text-[#ff6b6b]'}`}>
                        {txn.type === 'in' ? '+' : '-'}Rp {txn.amount.toLocaleString('id-ID')}
                      </p>
                      <p className="font-mono text-[9px] text-[#535c66] uppercase mt-0.5 tracking-wider">{txn.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions/Support Card */}
            <div className="bg-[#131619] border border-[#1e2226] p-4 rounded-2xl flex items-center justify-between shadow-md hover:bg-[#171b20] transition-all cursor-pointer group">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-[#1a1d21] border border-[#2a2f35] flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-[#8a939e] group-hover:text-[#69ff87] transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-white">Need Support?</p>
                  <p className="text-[11px] text-[#8a939e] mt-0.5 truncate">Contact center coordinator</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#535c66] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>

          </div>
        </div>

        {/* Sticky Fixed Bottom Navigation Elements */}
        <BottomNavbar />
      </main>
    </div>
  );
};

export default Dashboard;