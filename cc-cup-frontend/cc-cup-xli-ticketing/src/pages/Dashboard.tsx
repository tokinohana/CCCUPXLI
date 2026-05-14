import { Link } from "react-router-dom";
import { Search, Ticket, CheckCircle, Clock, Copy, Filter, Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Progress } from "@/components/progress";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const metrics = [
    { name: "Tickets Sold", value: "742", icon: Ticket, color: "border-[#b0c6ff]", textColor: "text-[#b0c6ff]" },
    { name: "Redeemed", value: "381", icon: CheckCircle, color: "border-[#00e475]", textColor: "text-[#00e475]" },
    { name: "Remaining", value: "361", icon: Clock, color: "border-[#558dff]", textColor: "text-[#558dff]" },
    { name: "Duplicates", value: "12", icon: Copy, color: "border-[#fe9400]", textColor: "text-[#fe9400]" },
  ];

  const recentActivity = [
    { time: "19:04:00", event: "Benedict scanned by Kevin", status: "OK", statusColor: "bg-[#00e475]" },
    { time: "19:03:00", event: "Invalid ticket attempt", status: "FAIL", statusColor: "bg-[#ffb4ab]" },
    { time: "19:01:00", event: "Duplicate redemption attempt", status: "FAIL", statusColor: "bg-[#ffb4ab]" },
    { time: "18:58:12", event: "Sarah J. scanned by Sarah", status: "OK", statusColor: "bg-[#00e475]" },
    { time: "18:55:04", event: "Gate 4 scanner calibration", status: "INFO", statusColor: "bg-[#b0c6ff]" },
    { time: "18:52:19", event: "Mark T. scanned by Kevin", status: "OK", statusColor: "bg-[#00e475]" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-screen-2xl mx-auto w-full space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#8c90a0] top-1/2 -translate-y-1/2" size={32} />
        <Input 
          className="w-full bg-[#201f20] border-2 border-[#424655] focus:border-[#b0c6ff] text-[#e5e2e3] h-14 pl-12 rounded-none placeholder:text-[#c2c6d7]/50"
          placeholder="Search users by Name, NIK, or Email..."
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#c2c6d7] border border-[#424655] px-2 py-0.5 uppercase">Cmd + K</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.name} className={cn("bg-[#201f20] border-l-4 p-6 flex justify-between items-end", m.color)}>
            <div>
              <p className="font-mono text-xs text-[#c2c6d7] uppercase tracking-widest">{m.name}</p>
              <h2 className={cn("text-5xl font-bold mt-2", m.textColor)}>{m.value}</h2>
            </div>
            <div className={cn("opacity-50 pb-2", m.textColor)}>
              <m.icon size={40} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Graph and Health */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Redemption Graph */}
          <div className="bg-[#2a2a2b] border border-[#8c90a0] p-6 relative overflow-hidden h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <p className="font-mono text-xs text-[#c2c6d7] uppercase font-bold">Redemption Velocity (24H)</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#b0c6ff]"></div>
                  <span className="text-[10px] font-mono uppercase">Sold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00e475]"></div>
                  <span className="text-[10px] font-mono uppercase">Redeemed</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full flex items-end gap-1 pb-4">
              {/* Simulated bars */}
              {[30, 40, 35, 45, 65, 85, 95, 80, 60, 50, 45, 40].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                   <div 
                    className={cn(
                      "w-full border-t",
                      i > 3 && i < 9 ? "bg-[#00e475]/60 border-[#00e475]" : "bg-[#b0c6ff]/20 border-[#b0c6ff]"
                    )} 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-[#c2c6d7] uppercase">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-[#201f20] border border-[#8c90a0] p-6">
            <h3 className="font-mono text-xs text-[#e5e2e3] uppercase mb-4 border-b border-[#424655] pb-2 font-bold">Node Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HealthItem label="CPU LOAD" value="34%" color="bg-[#00e475]" />
              <HealthItem label="LINK LATENCY" value="4MS" color="bg-[#b0c6ff]" />
              <HealthItem label="MEM USAGE" value="62%" color="bg-[#fe9400]" />
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[#201f20] border border-[#8c90a0] h-full flex flex-col">
            <div className="p-4 border-b border-[#424655] flex justify-between items-center bg-[#2a2a2b]">
              <h3 className="font-mono text-xs text-[#e5e2e3] uppercase font-bold">Recent Activity Feed</h3>
              <Filter className="text-[#c2c6d7] cursor-pointer" size={16} />
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left font-mono text-sm">
                <thead>
                  <tr className="bg-[#0e0e0f] text-[#c2c6d7] uppercase text-[10px] tracking-tighter">
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#424655]">
                  {recentActivity.map((activity, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-[11px]">{activity.time}</td>
                      <td className="px-4 py-3 text-xs">{activity.event}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge className={cn("text-black rounded-none font-bold text-[10px]", activity.statusColor)}>
                          {activity.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-[#424655] text-center">
              <Button asChild variant="link" className="text-[10px] font-bold uppercase text-[#b0c6ff] hover:underline">
                <Link to="/registry">View Full Ticket Registry</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bento Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#201f20] border border-[#8c90a0] p-6 flex flex-col justify-between">
          <p className="font-mono text-xs text-[#c2c6d7] uppercase font-bold">Uptime</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-[#00e475] font-bold">142:04</span>
            <span className="font-mono text-xs">HRS</span>
          </div>
          <div className="text-[10px] text-[#00e475] opacity-80 uppercase tracking-widest font-bold">Stable Connection</div>
        </div>
        <div className="bg-[#201f20] border border-[#8c90a0] p-6 flex flex-col justify-between">
          <p className="font-mono text-xs text-[#c2c6d7] uppercase font-bold">Zone Status</p>
          <div className="space-y-1">
            <ZoneStatus label="ZONE A" status="ACTIVE" active />
            <ZoneStatus label="ZONE B" status="ACTIVE" active />
            <ZoneStatus label="ZONE C" status="OFFLINE" />
          </div>
        </div>
        <div className="md:col-span-2 bg-[#2a2a2b] border border-[#8c90a0] p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#b0c6ff]/10 border border-[#b0c6ff] flex items-center justify-center">
            <TerminalIcon className="text-[#b0c6ff]" size={30} />
          </div>
          <div>
            <p className="font-mono text-sm text-[#e5e2e3] font-bold uppercase">Quick Lookup Engine</p>
            <p className="text-xs text-[#c2c6d7] mt-1">Directly query the database for individual record verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="font-mono text-[10px] uppercase text-[#c2c6d7]">{label}</span>
      <span className={cn("font-mono text-xs font-bold", color.replace('bg-', 'text-'))}>{value}</span>
    </div>
    <div className="h-2 bg-[#0e0e0f] border border-[#424655] overflow-hidden">
      <div className={cn("h-full", color)} style={{ width: value }}></div>
    </div>
  </div>
);

const ZoneStatus = ({ label, status, active }: { label: string, status: string, active?: boolean }) => (
  <div className={cn("flex justify-between items-center text-xs", !active && "opacity-50")}>
    <span className="font-mono text-[10px]">{label}</span>
    <span className={cn("font-bold", active ? "text-[#00e475]" : "text-[#8c90a0]")}>{status}</span>
  </div>
);

export default Dashboard;
