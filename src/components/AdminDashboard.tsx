import React, { useState, useEffect } from 'react';
import { IconLayoutDashboard, IconTicket, IconDeviceDesktopAnalytics, IconSettings, IconBell, IconCpu, IconCode, IconWifi, IconMail, IconLock } from '@tabler/icons-react';
import { Logo } from './Logo';
import { CONFIG } from '../config';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../types';
import { fetchTickets, updateTicket } from '../lib/sheets';
import { useToast } from './ToastProvider';
import { PriorityBadge, StatusBadge } from './UserPortal';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TicketModal } from './TicketModal';
import { AllTicketsTab } from './AllTicketsTab';
import { ReportsTab } from './ReportsTab';
import { SettingsTab } from './SettingsTab';

export function AdminDashboard() {
  const [tab, setTab] = useState<'dashboard' | 'tickets' | 'reports' | 'settings'>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch(err) {
      showToast("Error loading tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTicket = async (updatedTicket: Ticket) => {
    try {
      // Optimistic update
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket); // Update modal UI if open
      await updateTicket(updatedTicket);
      showToast("Ticket updated", "success");
    } catch (error) {
      showToast("Failed to update ticket", "error");
      loadData(); // Revert
    }
  };

  // Derived state
  const filteredTickets = tickets.filter(t => 
    searchQuery === '' || 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.requesterName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#f0f4ff] font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 bg-[#1e1b4b] flex flex-col items-center py-6 gap-8 shadow-xl z-20">
        
        <nav className="flex flex-col gap-6 w-full items-center mt-4">
          <SidebarItem icon={<IconLayoutDashboard stroke={2}/>} active={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
          <SidebarItem icon={<IconTicket stroke={2}/>} active={tab === 'tickets'} onClick={() => setTab('tickets')} />
          <SidebarItem icon={<IconDeviceDesktopAnalytics stroke={2}/>} active={tab === 'reports'} onClick={() => setTab('reports')} />
        </nav>
        
        <div className="mt-auto flex flex-col items-center gap-6 w-full">
           <SidebarItem icon={<IconSettings stroke={2}/>} active={tab === 'settings'} onClick={() => setTab('settings')} />
           <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'user' }))} className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Open User Portal">
             <IconTicket stroke={2} />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8 relative flex-shrink-0 z-10 shadow-sm w-full">
           <div className="flex flex-col">
             <div className="flex items-center gap-3">
               <h1 className="text-[#1e1b4b] font-semibold text-lg leading-tight">Good {getGreeting()}, Admin!</h1>
             </div>
             <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</span>
           </div>
           
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
             <Logo size={40} className="text-[#2d7a3e]" isHeadsetIconColor="#0bd179" />
           </div>
           
           <div className="flex items-center gap-6 ml-auto">
             <div className="relative flex items-center">
               <svg className="absolute left-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#f8fafc] border border-gray-200 rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/20 transition-all" />
             </div>

             <div className="relative">
               <div onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="w-10 h-10 bg-[#ede9fe] rounded-full flex items-center justify-center text-[#7F77DD] cursor-pointer hover:bg-[#d8b4fe] transition-colors relative z-20">
                 <IconBell size={20} stroke={2} />
               </div>
               {tickets.filter(t=>t.status==='Open').length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white pointer-events-none z-30">{tickets.filter(t=>t.status==='Open').length}</span>}
               
               {isNotificationOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)}></div>
                   <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden flex flex-col">
                     <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                       <h3 className="font-semibold text-gray-800">Notifications</h3>
                       <span className="text-xs text-[#7F77DD] font-medium bg-[#7F77DD]/10 px-2 py-0.5 rounded-full">{tickets.filter(t=>t.status==='Open').length} New</span>
                     </div>
                     <div className="max-h-80 overflow-y-auto">
                       {tickets.filter(t=>t.status==='Open').sort((a,b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime() || 0).slice(0, 5).map((t, index) => {
                         let timeAgo = "some time ago";
                         try {
                           timeAgo = formatDistanceToNow(new Date(t.submittedDate), { addSuffix: true })
                         } catch (e) {}
                         return (
                         <div key={`${t.id || 'tkt'}-${t._rowIndex || index}`} onClick={() => { setSelectedTicket(t); setIsNotificationOpen(false); }} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                           <div className="flex justify-between items-start mb-1">
                             <span className="font-medium text-sm text-gray-800">{t.requesterName}</span>
                             <span className="text-xs text-gray-400">{timeAgo}</span>
                           </div>
                           <p className="text-xs text-gray-600 line-clamp-1">{t.subject}</p>
                           <div className="mt-2 flex gap-2">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{t.priority}</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{t.department}</span>
                           </div>
                         </div>
                       )})}
                       {tickets.filter(t=>t.status==='Open').length === 0 && (
                         <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                       )}
                     </div>
                     {tickets.filter(t=>t.status==='Open').length > 5 && (
                        <div onClick={() => { setTab('tickets'); setIsNotificationOpen(false); }} className="p-3 text-center text-xs font-medium text-[#7F77DD] hover:bg-gray-50 cursor-pointer border-t border-gray-50 transition-colors">
                          View all open tickets
                        </div>
                     )}
                   </div>
                 </>
               )}
             </div>
             
             <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
               <div className="w-9 h-9 bg-[#7F77DD] rounded-full flex items-center justify-center text-white text-sm font-bold">
                 AD
               </div>
             </div>
           </div>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-auto p-8 flex flex-col gap-8">
           <div className="w-full h-full flex flex-col">
             {tab === 'dashboard' && <DashboardTab tickets={filteredTickets} loading={loading} onSelect={(t)=>setSelectedTicket(t)} onUpdate={handleUpdateTicket} />}
             {tab === 'tickets' && <AllTicketsTab tickets={filteredTickets} loading={loading} onSelect={(t)=>setSelectedTicket(t)} />}
             {tab === 'reports' && <ReportsTab tickets={tickets} />}
             {tab === 'settings' && <SettingsTab />}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={handleUpdateTicket} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`transition-all ${active ? 'p-2 bg-[#312e81] rounded-xl text-[#7F77DD]' : 'p-2 text-gray-400 hover:text-white'}`}>
      {icon}
    </button>
  );
}

function getGreeting() {
  const hr = new Date().getHours();
  if(hr < 12) return 'morning';
  if(hr < 18) return 'afternoon';
  return 'evening';
}

function DashboardTab({ tickets, loading, onSelect, onUpdate }: any) {
  const [filter, setFilter] = useState<'All' | TicketStatus>('All');

  const openTickets = tickets.filter((t:Ticket) => t.status === 'Open').length;
  const inProgressTickets = tickets.filter((t:Ticket) => t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter((t:Ticket) => t.status === 'Resolved').length;

  const displayTickets = tickets.filter((t:Ticket) => filter === 'All' ? true : t.status === filter);

  return (
    <div className="flex flex-col h-full animate-fade-in text-[#1e1b4b] overflow-hidden">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Open Tickets" value={openTickets} bg="bg-[#ede9fe]" text="text-[#3730a3]" />
        <StatCard title="In Progress" value={inProgressTickets} bg="bg-[#fef9c3]" text="text-[#92400e]" />
        <StatCard title="Resolved Today" value={resolvedTickets} bg="bg-[#d1fae5]" text="text-[#047857]" />
        <StatCard title="Total All Time" value={tickets.length} bg="bg-[#fce7f3]" text="text-[#9d174d]" />
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-hidden">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
              <FilterPill key={f} label={f} active={filter === f} onClick={() => setFilter(f as any)} />
            ))}
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'user' }))} className="bg-[#7F77DD] text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg> Create Ticket
          </button>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar pb-4">
          {loading && <div className="flex flex-col gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200/50 rounded-[14px] animate-pulse"></div>)}</div>}
          
          {!loading && displayTickets.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed text-gray-500">
               <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><IconTicket size={24} className="text-gray-400" /></div>
               All clear! No tickets here right now.
            </div>
          )}

          {displayTickets.map((t:Ticket, index:number) => (
            <TicketCard key={`${t.id}-${index}`} ticket={t} onClick={() => onSelect(t)} onUpdate={onUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, bg, text }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center ${text}`}>
         <IconTicket size={24} stroke={2} />
      </div>
      <div>
        <span className="block text-2xl font-bold text-[#1e1b4b]">{value}</span>
        <span className="text-xs text-gray-500 font-medium">{title}</span>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${active ? 'bg-[#ede9fe] border-[#c4b5fd] text-[#4c1d95] shadow-sm border' : 'bg-white border-gray-200 text-gray-500 border hover:bg-gray-50 hover:text-gray-800'}`}>
      {label}
    </button>
  );
}

function TicketCard({ ticket, onClick, onUpdate }: { ticket: Ticket, onClick: ()=>void, onUpdate: (t:Ticket)=>void, key?: string | number }) {
  let catColors = "bg-[#f3f4f6] text-[#4b5563]";
  let CatIcon = IconTicket;
  
  if(ticket.category === 'Hardware') { catColors = "bg-[#fce7f3] text-[#be185d]"; CatIcon = IconCpu; }
  else if(ticket.category === 'Software') { catColors = "bg-[#ede9fe] text-[#7c3aed]"; CatIcon = IconCode; }
  else if(ticket.category === 'Network') { catColors = "bg-[#dbeafe] text-[#1d4ed8]"; CatIcon = IconWifi; }
  else if(ticket.category === 'Email') { catColors = "bg-[#d1fae5] text-[#047857]"; CatIcon = IconMail; }
  else if(ticket.category === 'Access / Permissions') { catColors = "bg-[#fef3c7] text-[#d97706]"; CatIcon = IconLock; }

  const isYellowBorder = ticket.status === 'Open' || ticket.status === 'In Progress';

  let timeAgo = "some time";
  try {
    timeAgo = formatDistanceToNow(new Date(ticket.submittedDate));
  } catch (e) {}

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer shadow-sm
        ${isYellowBorder ? 'border-[#fbbf24]' : 'border-transparent hover:border-[#c4b5fd]'}`}
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden pointer-events-none">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${catColors}`}>
           <CatIcon size={24} stroke={2} />
        </div>
        <div className="flex flex-col truncate">
           <span className="font-bold text-[#111827] text-sm truncate">{ticket.subject}</span>
           <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
             <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{ticket.id}</span>
             <span className="font-medium text-[10px] text-gray-400">{ticket.department} • {ticket.category} • {timeAgo} ago</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2 pointer-events-none">
          <PriorityBadge priority={ticket.priority as TicketPriority} />
          <StatusBadge status={ticket.status as TicketStatus} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs uppercase shadow-sm">
              {ticket.requesterName.substring(0,2)}
            </div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">{ticket.requesterName}</span>
          </div>
          <ActionButton ticket={ticket} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ ticket, onUpdate }: { ticket: Ticket, onUpdate: (t:Ticket)=>void }) {
  const { showToast } = useToast();

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal opening
    const up = { ...ticket, lastUpdated: new Date().toISOString() };
    if (ticket.status === 'Open') {
      up.status = 'In Progress';
      await onUpdate(up);
    } else if (ticket.status === 'In Progress') {
      up.status = 'Resolved';
      up.resolutionNotes = "Resolved from quick action.";
      await onUpdate(up);
    }
  };

  if (ticket.status === 'Open') {
    return <button onClick={handleAction} className="px-4 py-1.5 bg-[#fbbf24] text-[#78350f] rounded-full text-xs font-bold transition-all active:scale-95">Start working</button>;
  }
  if (ticket.status === 'In Progress') {
    return <button onClick={handleAction} className="px-4 py-1.5 bg-[#34d399] text-[#064e3b] rounded-full text-xs font-bold transition-all active:scale-95">Mark complete</button>;
  }
  return <button className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold transition-all hover:bg-gray-200">View</button>;
}

// Subcomponents continued in their respective files to avoid file size limits.
