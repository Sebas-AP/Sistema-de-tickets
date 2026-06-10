import { useState } from "react";
import { LayoutDashboard, Ticket, Users, UserCog, BarChart3, Settings } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { TicketDetail } from "../components/tickets/TicketDetail";
import { DashboardView } from "../views/DashboardView";
import { TicketsView } from "../views/TicketsView";
import { UsersView } from "../views/UsersView";
import { AgentsView } from "../views/AgentsView";
import { ReportsView } from "../views/ReportsView";
import { ConfigView } from "../views/ConfigView";
import { PlaceholderView } from "../views/PlaceholderView";
import { useTickets } from "../hooks/useTickets";
import { useAgents } from "../hooks/useAgents";

const ADMIN_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard",     Icon: LayoutDashboard },
  { key: "tickets",   label: "Tickets",       Icon: Ticket, hasBadge: true },
  { key: "users",     label: "Usuarios",      Icon: Users },
  { key: "agents",    label: "Agentes",       Icon: UserCog },
  { key: "reports",   label: "Reportes",      Icon: BarChart3 },
  { key: "config",    label: "Configuración", Icon: Settings },
];

export function AdminPanel({ user, onLogout, dark, onToggleDark }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const agents = useAgents();
  const { tickets, filteredTickets, filter, setFilter, agentFilter, setAgentFilter, search, setSearch, updateTicket, stats, loading, error, refresh } = useTickets();

  const handleSearch = q => {
    setSearch(q);
    if (q && activeView !== "tickets") setActiveView("tickets");
  };

  const selectedTicket = tickets.find(t => t.id === selectedId) ?? null;

  return (
    <AppLayout
      activeView={activeView} onNavigate={setActiveView}
      search={search} onSearch={handleSearch}
      pendingCount={stats.pending} dark={dark} onToggleDark={onToggleDark}
      user={user} onLogout={onLogout} navItems={ADMIN_NAV_ITEMS}
    >
      {activeView === "dashboard" && (
        <DashboardView stats={stats} tickets={tickets} onNavigate={setActiveView}
          onOpenTicket={setSelectedId} user={user} loading={loading} error={error} onRetry={refresh} />
      )}
      {activeView === "tickets" && (
        <TicketsView filteredTickets={filteredTickets} filter={filter} setFilter={setFilter}
          agentFilter={agentFilter} setAgentFilter={setAgentFilter} agents={agents}
          onOpenTicket={setSelectedId} loading={loading} error={error} onRetry={refresh} />
      )}
      {activeView === "users" && (
        <UsersView />
      )}
      {activeView === "agents" && (
        <AgentsView agents={agents} tickets={tickets} onOpenTicket={setSelectedId} />
      )}
      {activeView === "reports" && (
        <ReportsView tickets={tickets} onTicketAdded={refresh} />
      )}
      {activeView === "config" && (
        <ConfigView />
      )}
      {selectedTicket && (
        <TicketDetail ticket={selectedTicket} agents={agents} user={user}
          onClose={() => setSelectedId(null)} onSave={updateTicket} isAgent={false} />
      )}
    </AppLayout>
  );
}
