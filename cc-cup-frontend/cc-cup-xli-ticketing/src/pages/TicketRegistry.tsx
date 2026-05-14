import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Verified, 
  MoreVertical 
} from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { apiService } from "@/services/api";
import type { Ticket } from "@/types";
import { cn } from "@/lib/utils";

const TicketRegistry = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const data = await apiService.getTickets();
    setTickets(data);
    setLoading(false);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.nik.includes(searchTerm) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "ALL" || 
      (statusFilter === "REDEEMED" && ticket.isRedeemed) ||
      (statusFilter === "UNUSED" && !ticket.isRedeemed && ticket.status === "paid") ||
      (statusFilter === "CANCELLED" && ticket.status === "pending");

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tickets.length,
    redeemed: tickets.filter(t => t.isRedeemed).length,
    unused: tickets.filter(t => !t.isRedeemed && t.status === "paid").length,
    alerts: 32, // Mocked as in the HTML
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 animate-in fade-in duration-500 max-w-screen-2xl mx-auto w-full">
      {/* Header & Stats Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="font-display-xl text-3xl md:text-5xl text-[#e5e2e3] uppercase tracking-tight font-bold">
            TICKET REGISTRY
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-[#00e475] px-2 py-0.5 text-black font-mono text-[10px] font-bold">LIVE MONITORING</span>
            <span className="font-mono text-xs text-[#c2c6d7] opacity-70">{stats.total.toLocaleString()} TOTAL ENTRIES</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 bg-[#201f20] p-2 border border-[#424655] w-full lg:w-auto">
          <StatBox label="Redeemed" value={stats.redeemed} color="text-[#00e475]" />
          <StatBox label="Unused" value={stats.unused} color="text-[#b0c6ff]" />
          <StatBox label="Alerts" value={stats.alerts} color="text-[#ffb4ab]" last />
        </div>
      </section>

      {/* Utility Bar */}
      <section className="bg-[#1c1b1c] border border-[#424655] p-3 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-grow group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c2c6d7] w-4 h-4" />
          <input 
            className="w-full bg-[#0e0e0f] border border-[#424655] pl-10 pr-4 py-3 font-mono text-sm text-[#e5e2e3] placeholder:text-[#c2c6d7]/30 focus:border-[#b0c6ff] transition-all outline-none rounded-none" 
            placeholder="Filter by Name, NIK, or Email..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            className="bg-[#0e0e0f] border border-[#424655] text-[#e5e2e3] font-mono text-xs px-4 py-3 lg:py-2 focus:border-[#b0c6ff] outline-none cursor-pointer appearance-none rounded-none min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">STATUS: ALL</option>
            <option value="REDEEMED">STATUS: REDEEMED</option>
            <option value="UNUSED">STATUS: UNUSED</option>
            <option value="CANCELLED">STATUS: CANCELLED</option>
          </select>
          <Button className="bg-[#b0c6ff] text-[#002d6e] px-8 py-6 lg:py-2 font-bold uppercase rounded-none hover:bg-[#b0c6ff]/90 h-full">
            Filter Results
          </Button>
        </div>
      </section>

      {/* Data Table */}
      <section className="bg-[#1c1b1c] border border-[#424655] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#424655] scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
            <thead>
              <tr className="border-b border-[#424655] bg-[#2a2a2b]">
                <th className="p-4 font-mono text-[10px] text-[#c2c6d7] uppercase tracking-wider font-bold">Name</th>
                <th className="p-4 font-mono text-[10px] text-[#c2c6d7] uppercase tracking-wider font-bold">NIK / ID</th>
                <th className="p-4 font-mono text-[10px] text-[#c2c6d7] uppercase tracking-wider font-bold">Email</th>
                <th className="p-4 font-mono text-[10px] text-[#c2c6d7] uppercase tracking-wider font-bold">Status</th>
                <th className="p-4 font-mono text-[10px] text-[#c2c6d7] uppercase tracking-wider font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#424655]/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#c2c6d7] font-mono text-xs animate-pulse">
                    LOADING SECURE REGISTRY...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#c2c6d7] font-mono text-xs">
                    NO RECORDS MATCHING CRITERIA
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#353436]/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#353436] border border-[#424655] flex items-center justify-center font-bold text-[#b0c6ff] text-xs shrink-0">
                          {ticket.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#e5e2e3] whitespace-nowrap">{ticket.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-[#c2c6d7] whitespace-nowrap">{ticket.nik}</td>
                    <td className="p-4 font-mono text-xs text-[#c2c6d7] opacity-70 whitespace-nowrap">{ticket.email}</td>
                    <td className="p-4">
                      {ticket.isRedeemed ? (
                        <span className="bg-[#00e475] px-2 py-0.5 text-black font-mono text-[10px] font-bold uppercase whitespace-nowrap">REDEEMED</span>
                      ) : ticket.status === "paid" ? (
                        <span className="bg-[#b0c6ff] px-2 py-0.5 text-[#002d6e] font-mono text-[10px] font-bold uppercase whitespace-nowrap">UNUSED</span>
                      ) : (
                        <span className="bg-[#ffb4ab] px-2 py-0.5 text-[#690005] font-mono text-[10px] font-bold uppercase whitespace-nowrap">PENDING</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[#c2c6d7] hover:text-[#b0c6ff] hover:bg-[#353436] transition-colors" title="Resend Ticket">
                          <Send size={16} />
                        </button>
                        {!ticket.isRedeemed && (
                          <button className="p-2 text-[#c2c6d7] hover:text-[#00e475] hover:bg-[#353436] transition-colors" title="Manually Redeem">
                            <Verified size={16} />
                          </button>
                        )}
                        <button className="p-2 text-[#c2c6d7] hover:text-[#b0c6ff] hover:bg-[#353436] transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-[#2a2a2b] p-4 flex flex-col md:flex-row items-center justify-between border-t border-[#424655] gap-4">
          <span className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold">
            SHOWING 1-{filteredTickets.length} OF {stats.total} RECORDS
          </span>
          <div className="flex gap-1">
            <button className="w-8 h-8 border border-[#424655] flex items-center justify-center hover:bg-[#353436] text-[#c2c6d7] rounded-none">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 border border-[#b0c6ff] bg-[#b0c6ff]/10 flex items-center justify-center text-[#b0c6ff] font-bold text-xs rounded-none">1</button>
            <button className="w-8 h-8 border border-[#424655] flex items-center justify-center hover:bg-[#353436] text-[#c2c6d7] text-xs rounded-none">2</button>
            <button className="w-8 h-8 border border-[#424655] flex items-center justify-center hover:bg-[#353436] text-[#c2c6d7] text-xs rounded-none">3</button>
            <button className="w-8 h-8 border border-[#424655] flex items-center justify-center hover:bg-[#353436] text-[#c2c6d7] rounded-none">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-auto mb-6 lg:mb-0">
        <div className="bg-[#1c1b1c] border border-[#424655] p-4">
          <p className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold mb-3">SYSTEM UPTIME</p>
          <div className="flex items-end gap-2">
            <span className="font-mono text-3xl font-bold text-[#e5e2e3]">99.98%</span>
            <div className="h-8 flex-grow bg-[#201f20] flex items-end gap-[1px] p-[2px]">
              {[40, 60, 45, 80, 70, 90, 85, 95, 80, 100].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-grow bg-[#00e475]"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#1c1b1c] border border-[#424655] p-4 flex flex-col justify-center">
          <p className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold mb-1">LAST SCAN EVENT</p>
          <p className="font-mono text-sm text-[#e5e2e3] font-bold">ID: #SCAN-9902-X</p>
          <p className="font-mono text-[10px] text-[#c2c6d7] opacity-60 uppercase">2.4 SECONDS AGO - TERMINAL 4-B</p>
        </div>
        <div className="bg-[#1c1b1c] border border-[#424655] p-4 flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <p className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold mb-2">ACTIVE OPERATORS</p>
          <div className="flex -space-x-2">
            <OperatorAvatar initials="OP1" color="bg-[#b0c6ff]" />
            <OperatorAvatar initials="OP2" color="bg-[#ffbc7c]" />
            <OperatorAvatar initials="OP3" color="bg-[#00e475]" />
            <div className="w-8 h-8 rounded-none bg-[#353436] border border-[#424655] flex items-center justify-center text-[10px] font-bold text-[#c2c6d7]">+4</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatBox = ({ label, value, color, last }: { label: string; value: number; color: string; last?: boolean }) => (
  <div className={cn("flex flex-col px-4 py-2 sm:py-0", !last && "sm:border-r border-[#424655]")}>
    <span className="text-[10px] font-mono text-[#c2c6d7] uppercase font-bold">{label}</span>
    <span className={cn("font-mono text-xl font-bold", color)}>{value.toLocaleString()}</span>
  </div>
);

const OperatorAvatar = ({ initials, color }: { initials: string; color: string }) => (
  <div className={cn("w-8 h-8 rounded-none border border-[#131314] flex items-center justify-center text-[10px] font-bold text-black", color)}>
    {initials}
  </div>
);

export default TicketRegistry;
