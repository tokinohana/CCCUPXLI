import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  Verified,
  MoreVertical,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { apiService } from "@/services/api";
import type { Ticket, TicketListParams } from "@/types";
import { cn } from "@/lib/utils";

const TicketRegistry = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: TicketListParams = {};
      if (statusFilter !== "ALL") {
        if (statusFilter === "REDEEMED") {
          params.is_redeemed = "true";
        } else if (statusFilter === "UNUSED") {
          params.status = "paid";
          params.is_redeemed = "false";
        } else if (statusFilter === "PENDING") {
          params.status = "pending";
        } else if (statusFilter === "VOIDED") {
          params.status = "voided";
        }
      }
      const data = await apiService.getTickets(params);
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please try again.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: TicketListParams = {};
      if (statusFilter !== "ALL") {
        if (statusFilter === "REDEEMED") params.is_redeemed = "true";
        else if (statusFilter === "UNUSED") { params.status = "paid"; params.is_redeemed = "false"; }
        else if (statusFilter === "PENDING") params.status = "pending";
        else if (statusFilter === "VOIDED") params.status = "voided";
      }
      await apiService.exportTickets(params);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // Client-side search filter on top of server-side status filter
  const filteredTickets = tickets.filter((ticket) => {
    const q = searchTerm.toLowerCase();
    return (
      ticket.full_name.toLowerCase().includes(q) ||
      ticket.identification_number.includes(searchTerm) ||
      ticket.email.toLowerCase().includes(q) ||
      ticket.ticket_id.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: tickets.length,
    redeemed: tickets.filter((t) => t.is_redeemed).length,
    unused: tickets.filter((t) => !t.is_redeemed && t.status === "paid").length,
    pending: tickets.filter((t) => t.status === "pending").length,
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
          <StatBox label="Pending" value={stats.pending} color="text-[#fe9400]" />
          <StatBox label="Total" value={stats.total} color="text-[#e5e2e3]" last />
        </div>
      </section>

      {/* Utility Bar */}
      <section className="bg-[#1c1b1c] border border-[#424655] p-3 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-grow group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c2c6d7] w-4 h-4" />
          <input
            className="w-full bg-[#0e0e0f] border border-[#424655] pl-10 pr-4 py-3 font-mono text-sm text-[#e5e2e3] placeholder:text-[#c2c6d7]/30 focus:border-[#b0c6ff] transition-all outline-none rounded-none"
            placeholder="Filter by Name, NIK, Email, or Ticket ID..."
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
            <option value="PENDING">STATUS: PENDING</option>
            <option value="VOIDED">STATUS: VOIDED</option>
          </select>
          <div className="flex gap-2">
            <Button
              onClick={fetchTickets}
              className="bg-[#424655] text-[#e5e2e3] px-4 py-2 font-bold uppercase rounded-none hover:bg-[#555] h-full flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              className="bg-[#b0c6ff] text-[#002d6e] px-6 py-2 font-bold uppercase rounded-none hover:bg-[#b0c6ff]/90 h-full flex items-center gap-2"
            >
              <Download size={14} />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#93000a]/20 border border-[#ffb4ab] p-3 font-mono text-xs text-[#ffb4ab]">
          {error}
        </div>
      )}

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
                    {error ? "ERROR LOADING RECORDS" : "NO RECORDS MATCHING CRITERIA"}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-[#353436]/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#353436] border border-[#424655] flex items-center justify-center font-bold text-[#b0c6ff] text-xs shrink-0">
                          {ticket.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#e5e2e3] whitespace-nowrap">{ticket.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-[#c2c6d7] whitespace-nowrap">{ticket.identification_number}</td>
                    <td className="p-4 font-mono text-xs text-[#c2c6d7] opacity-70 whitespace-nowrap">{ticket.email}</td>
                    <td className="p-4">
                      <TicketStatusBadge ticket={ticket} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[#c2c6d7] hover:text-[#b0c6ff] hover:bg-[#353436] transition-colors" title="Resend Ticket">
                          <Send size={16} />
                        </button>
                        {!ticket.is_redeemed && ticket.status === "paid" && (
                          <button
                            className="p-2 text-[#c2c6d7] hover:text-[#00e475] hover:bg-[#353436] transition-colors"
                            title="Manually Redeem"
                            onClick={async () => {
                              try {
                                await apiService.redeemTicket(ticket.ticket_id, "MANUAL");
                                fetchTickets();
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
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
            SHOWING {filteredTickets.length} OF {stats.total} RECORDS
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
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto mb-6 lg:mb-0">
        <div className="bg-[#1c1b1c] border border-[#424655] p-4">
          <p className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold mb-2">Total Tickets</p>
          <span className="font-mono text-3xl font-bold text-[#e5e2e3]">{stats.total}</span>
        </div>
        <div className="bg-[#1c1b1c] border border-[#424655] p-4">
          <p className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold mb-2">Redeemed Today</p>
          <span className="font-mono text-3xl font-bold text-[#00e475]">{stats.redeemed}</span>
        </div>
        <div className="bg-[#1c1b1c] border border-[#424655] p-4">
          <p className="font-mono text-[10px] text-[#c2c6d7] uppercase font-bold mb-2">Pending Payment</p>
          <span className="font-mono text-3xl font-bold text-[#fe9400]">{stats.pending}</span>
        </div>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TicketStatusBadge = ({ ticket }: { ticket: Ticket }) => {
  if (ticket.is_redeemed) {
    return (
      <Badge className="bg-[#00e475] px-2 py-0.5 text-black font-mono text-[10px] font-bold uppercase whitespace-nowrap rounded-none">
        REDEEMED
      </Badge>
    );
  }
  if (ticket.status === "paid") {
    return (
      <Badge className="bg-[#b0c6ff] px-2 py-0.5 text-[#002d6e] font-mono text-[10px] font-bold uppercase whitespace-nowrap rounded-none">
        UNUSED
      </Badge>
    );
  }
  if (ticket.status === "voided") {
    return (
      <Badge className="bg-[#8c90a0] px-2 py-0.5 text-black font-mono text-[10px] font-bold uppercase whitespace-nowrap rounded-none">
        VOIDED
      </Badge>
    );
  }
  return (
    <Badge className="bg-[#ffb4ab] px-2 py-0.5 text-[#690005] font-mono text-[10px] font-bold uppercase whitespace-nowrap rounded-none">
      PENDING
    </Badge>
  );
};

const StatBox = ({ label, value, color, last }: { label: string; value: number; color: string; last?: boolean }) => (
  <div className={cn("flex flex-col px-4 py-2 sm:py-0", !last && "sm:border-r border-[#424655]")}>
    <span className="text-[10px] font-mono text-[#c2c6d7] uppercase font-bold">{label}</span>
    <span className={cn("font-mono text-xl font-bold", color)}>{value.toLocaleString()}</span>
  </div>
);

export default TicketRegistry;
