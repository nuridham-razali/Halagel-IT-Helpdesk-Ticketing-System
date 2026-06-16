import React, { useState } from 'react';
import { Logo } from './Logo';
import { CONFIG } from '../config';
import { motion } from 'motion/react';
import { appendTicket, fetchTickets } from '../lib/sheets';
import { useToast } from './ToastProvider';
import { Ticket, TicketCategory, TicketPriority, TicketDepartment, TicketStatus } from '../types';
import { IconCheck, IconSearch, IconAlertCircle } from '@tabler/icons-react';

export function UserPortal() {
  const [tab, setTab] = useState<'submit' | 'status'>('submit');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin#@5529') {
      setShowAuthModal(false);
      setAdminPassword('');
      setLoginError(false);
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }));
    } else {
      setLoginError(true);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center bg-[linear-gradient(45deg,#e0f2fe,#d1fae5,#ffffff,#e0f2fe)] bg-[length:400%_400%] animate-[gradient_15s_ease_infinite] relative overflow-hidden">
      
      {/* Decorative Glowing Blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-300/30 rounded-full blur-[80px] animate-[blob_7s_infinite]"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-[80px] animate-[blob_7s_infinite] [animation-delay:2s]"></div>
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-sky-300/30 rounded-full blur-[80px] animate-[blob_7s_infinite] [animation-delay:4s]"></div>

      {/* Header Banner (Transparent to let gradient show through) */}
      <div className="w-full pt-16 pb-12 px-4 flex flex-col items-center relative z-10">
        <button onClick={() => setShowAuthModal(true)} className="absolute top-4 right-4 bg-white/50 hover:bg-white/80 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border border-white/40">
          Admin Login
        </button>
        <div className="max-w-xl w-full flex flex-col items-center text-center z-10">
          {CONFIG.BRAND_LOGO_BASE64 && CONFIG.BRAND_LOGO_BASE64.length > 50 ? (
            <div className="mb-5 drop-shadow-xl">
              <Logo size={120} />
            </div>
          ) : (
            <div className="w-[80px] h-[80px] bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 backdrop-blur-sm">
              <Logo size={56} className="text-[#0bd179]" isHeadsetIconColor="#0bd179" />
            </div>
          )}
          
          <h1 className="text-4xl font-black text-slate-800 mb-1 tracking-tight drop-shadow-sm">
            {CONFIG.COMPANY_NAME === 'HALAGEL' ? (
              <>
                <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]" style={{ WebkitTextStroke: "1px black" }}>HALA</span>
                <span className="text-[#2d7a3e]">GEL</span>
              </>
            ) : (
              CONFIG.COMPANY_NAME
            )}
          </h1>
          <h2 className="text-xl font-bold text-slate-500 tracking-wider mt-1 uppercase">
            IT Helpdesk Ticketing System 
          </h2>
        </div>
      </div>

      <div className="max-w-xl w-full z-20 px-4">
        {/* Tab switcher */}
        <div className="flex bg-white/80 backdrop-blur-md rounded-full p-1 mb-8 shadow-sm border border-white/60">
           <button
             onClick={() => setTab('submit')}
             className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
               tab === 'submit' ? 'bg-[#2d7a3e] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
             }`}
           >
             Submit a Ticket
           </button>
           <button
             onClick={() => setTab('status')}
             className={`flex-1 py-3 text-sm font-medium rounded-full transition-all ${
               tab === 'status' ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
             }`}
           >
             Check Status
           </button>
         </div>

         {/* Content */}
         <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-xl border border-white/60 min-h-[450px] relative overflow-hidden">
           {tab === 'submit' ? <SubmitTicketTab /> : <CheckStatusTab />}
         </div>
         
         <div className="mt-8 text-center text-xs text-slate-500 font-medium drop-shadow-sm pb-4">
           Created by Muhammad Nur Idham Bin Razali
         </div>
       </div>

       {showAuthModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Login</h3>
             <p className="text-gray-500 text-sm mb-6">Please enter the administrator password.</p>
             <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
               <div>
                 <input 
                   type="password" 
                   value={adminPassword} 
                   onChange={(e) => { setAdminPassword(e.target.value); setLoginError(false); }}
                   placeholder="Password"
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all text-gray-900"
                   autoFocus
                 />
                 {loginError && <p className="text-red-500 text-xs mt-2 ml-1">Incorrect password</p>}
               </div>
               <div className="flex gap-3 mt-2">
                 <button 
                   type="button" 
                   onClick={() => { setShowAuthModal(false); setAdminPassword(''); setLoginError(false); }}
                   className="flex-1 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-medium shadow-sm transition-colors"
                 >
                   Login
                 </button>
               </div>
             </form>
           </motion.div>
         </div>
       )}
    </div>
  );
}

function SubmitTicketTab() {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<Ticket | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'Hardware' as TicketCategory,
    department: 'Sales' as TicketDepartment,
    priority: 'Medium' as TicketPriority,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.description.length < 20) {
      showToast("Description needs to be at least 20 characters.", 'error');
      return;
    }

    setIsSubmitting(true);
    
    // Generate TicketID
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randId = Math.floor(1000 + Math.random() * 9000).toString();
    const ticketId = `TKT-${dateStr}-${randId}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id: ticketId,
      subject: formData.subject,
      description: formData.description,
      category: formData.category,
      department: formData.department,
      priority: formData.priority,
      status: "Open",
      requesterName: formData.name,
      requesterEmail: formData.email,
      submittedDate: now,
      lastUpdated: now,
      assignedTo: "",
      notes: "",
      resolutionNotes: ""
    };

    try {
      await appendTicket(newTicket);
      setSubmittedTicket(newTicket);
      showToast("Ticket submitted successfully", 'success');
    } catch (err: any) {
      showToast(err.message || "Failed to submit ticket. Check config.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedTicket) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-10">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center mb-6">
          <IconCheck className="text-emerald-500" size={40} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">You're all set</h3>
        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl mb-8 w-full max-w-sm">
          <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-semibold">Your Ticket ID</p>
          <p className="font-mono text-xl font-bold text-gray-900 select-all tracking-tight">
            {submittedTicket.id}
          </p>
        </div>
        <p className="text-gray-500 mb-8 max-w-sm">I've sent a confirmation to your email and will review this matter shortly.</p>
        <button
          onClick={() => {
            setSubmittedTicket(null);
            setFormData(f => ({...f, subject: '', description: ''})); // Keep name/email
          }}
          className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-full font-bold transition-all"
        >
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0bd179] focus:ring-[3px] focus:ring-[#0bd179]/15 transition-all bg-white placeholder-gray-400 text-gray-900" placeholder="Your Name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0bd179] focus:ring-[3px] focus:ring-[#0bd179]/15 transition-all bg-white placeholder-gray-400 text-gray-900" placeholder="email@halagel.com.my" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Subject</label>
        <input required type="text" maxLength={100} value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0bd179] focus:ring-[3px] focus:ring-[#0bd179]/15 transition-all bg-white placeholder-gray-400 text-gray-900" placeholder="Brief summary of the issue" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Department</label>
          <div className="relative">
             <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value as TicketDepartment})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 appearance-none outline-none focus:border-[#0bd179] focus:ring-[3px] focus:ring-[#0bd179]/15 transition-all bg-white text-gray-900 cursor-pointer">
                <option value="Sales">Sales</option>
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="QA/QC">QA/QC</option>
                <option value="Production">Production</option>
                <option value="Engineering">Engineering</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Marketing">Marketing</option>
                <option value="R&D">R&D</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <div className="relative">
             <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as TicketCategory})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 appearance-none outline-none focus:border-[#0bd179] focus:ring-[3px] focus:ring-[#0bd179]/15 transition-all bg-white text-gray-900 cursor-pointer">
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Email">Email</option>
                <option value="Access / Permissions">Access / Permissions</option>
                <option value="Password Reset">Password Reset</option>
                <option value="Projector Setup">Projector Setup</option>
                <option value="New Equipment">New Equipment</option>
                <option value="Printer">Printer</option>
                <option value="Access Request">Access Request</option>
                <option value="Other">Other</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Priority</label>
          <div className="relative">
             <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as TicketPriority})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 appearance-none outline-none focus:border-[#0bd179] focus:ring-[3px] focus:ring-[#0bd179]/15 transition-all bg-white text-gray-900 cursor-pointer">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea required rows={4} minLength={20} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-[#0bd179] focus:ring-[3px] focus:ring-[#0bd179]/15 transition-all resize-none" placeholder="Please describe your issue in detail (min 20 chars)..."></textarea>
      </div>

      <button
        disabled={isSubmitting}
        type="submit"
        className="mt-2 w-full bg-[#2d7a3e] hover:bg-[#205b2e] text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 drop-shadow-md"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          "Submit Ticket"
        )}
      </button>
    </motion.form>
  );
}

function CheckStatusTab() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Ticket[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!query.trim()) return;

    setIsLoading(true);
    try {
      const tickets = await fetchTickets();
      const q = query.toLowerCase().trim();
      const filtered = tickets.filter(t => t.id.toLowerCase() === q || t.requesterEmail.toLowerCase() === q);
      setResults(filtered);
      if(filtered.length === 0) {
        showToast("No tickets found for that ID or Email.", "info");
      }
    } catch(err: any) {
      showToast(err.message || "Error searching. Try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col relative z-10 w-full">
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 w-full max-w-full">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <IconSearch size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-[#1e293b] focus:ring-[3px] focus:ring-[#1e293b]/15 transition-all text-sm"
            placeholder="Ticket ID or Email address..."
          />
        </div>
        <button
          disabled={isLoading}
          type="submit"
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center min-w-[120px] text-sm shadow-sm"
        >
          {isLoading ? (
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : "Search"}
        </button>
      </form>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => <div key={i} className="h-[120px] bg-gray-100 rounded-2xl animate-pulse"></div>)}
          </div>
        )}

        {!isLoading && results?.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center bg-gray-50 rounded-2xl border border-gray-100">
            <IconAlertCircle size={32} className="text-gray-400 mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">No tickets found</h4>
            <p className="text-gray-500 text-sm">Please check your email address or ticket ID.</p>
          </div>
        )}

        {results?.map((ticket, index) => (
          <div key={`${ticket.id || 'tkt'}-${ticket._rowIndex || index}`} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow hover:border-gray-300 transition-all cursor-default">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <span className="bg-gray-100 text-gray-600 font-mono font-medium text-xs px-2.5 py-1 rounded-md border border-gray-200">{ticket.id}</span>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status as TicketStatus} />
                <PriorityBadge priority={ticket.priority as TicketPriority} />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-4">{ticket.subject}</h4>
            <div className="flex flex-wrap gap-6 text-xs text-gray-500">
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-[10px] font-semibold text-gray-400">Department</span>
                <span>{ticket.department}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-[10px] font-semibold text-gray-400">Submitted</span>
                <span>{new Date(ticket.submittedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-wider text-[10px] font-semibold text-gray-400">Last Update</span>
                <span>{new Date(ticket.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function StatusBadge({ status, isDark = false }: { status: TicketStatus, isDark?: boolean }) {
  let colors = isDark 
    ? "bg-slate-800 text-slate-300"
    : "bg-gray-100 text-gray-600";
    
  if (status === "Open") colors = isDark ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-[#dbeafe] text-[#1e40af]";
  else if(status === "In Progress") colors = isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-[#fef3c7] text-[#92400e]";
  else if(status === "Resolved") colors = isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-[#d1fae5] text-[#065f46]";
  else if(status === "Closed") colors = isDark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-200 text-gray-700";
  
  return <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${isDark ? 'border' : ''} whitespace-nowrap ${colors}`}>{status}</span>;
}

export function PriorityBadge({ priority, isDark = false }: { priority: TicketPriority, isDark?: boolean }) {
  let colors = isDark 
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : "bg-gray-100 text-gray-600";
    
  if(priority === "High") colors = isDark ? "bg-orange-500/20 text-orange-300 border-orange-500/30" : "bg-[#fef3c7] text-[#92400e]";
  else if(priority === "Medium") colors = isDark ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-[#dbeafe] text-[#1e40af]";
  
  return <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${isDark ? 'border' : ''} whitespace-nowrap ${colors}`}>{priority}</span>;
}
