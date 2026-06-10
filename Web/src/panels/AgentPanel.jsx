import { useState } from "react";
import { LayoutDashboard, Ticket } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { TicketDetail } from "../components/tickets/TicketDetail";
import { AgentDashboardView } from "../views/AgentDashboardView";
import { TicketsView } from "../views/TicketsView";
import { useTickets } from "../hooks/useTickets";
import { useAgents } from "../hooks/useAgents";

const AGENT_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard",   Icon: LayoutDashboard },
  { key: "tickets",   label: "Mis Tickets", Icon: Ticket, hasBadge: true },
];

export function AgentPanel({ user, onLogout, dark, onToggleDark }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const agents = useAgents();
  const { tickets, filteredTickets, filter, setFilter, agentFilter, setAgentFilter, search, setSearch, updateTicket, stats, loading, error, refresh } = useTickets(user.agentName);

  const handleSearch = q => {
    setSearch(q);
    if (q && activeView !== "tickets") setActiveView("tickets");
  };

  const agentTickets   = tickets.filter(t => t.agent === user.agentName || t.requester === user.agentName);
  const selectedTicket = agentTickets.find(t => t.id === selectedId) ?? null;

  return (
    <AppLayout
      activeView={activeView} onNavigate={setActiveView}
      search={search} onSearch={handleSearch}
      pendingCount={stats.pending} dark={dark} onToggleDark={onToggleDark}
      user={user} onLogout={onLogout} navItems={AGENT_NAV_ITEMS}
    >
      {activeView === "dashboard" && (
        <AgentDashboardView stats={stats} tickets={agentTickets} onNavigate={setActiveView}
          onOpenTicket={setSelectedId} user={user} loading={loading} error={error} onRetry={refresh} />
      )}
      {activeView === "tickets" && (
        <TicketsView filteredTickets={filteredTickets} filter={filter} setFilter={setFilter}
          agentFilter={agentFilter} setAgentFilter={setAgentFilter} agents={agents}
          onOpenTicket={setSelectedId} loading={loading} error={error} onRetry={refresh} />
      )}
      {selectedTicket && (
        <TicketDetail ticket={selectedTicket} agents={agents} user={user}
          onClose={() => setSelectedId(null)} onSave={updateTicket} isAgent={true} />
      )}
    </AppLayout>
  );
}
