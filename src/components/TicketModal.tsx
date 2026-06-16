import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Ticket } from '../types';
import { PriorityBadge, StatusBadge } from './UserPortal';
import { IconX } from '@tabler/icons-react';

export function TicketModal({ ticket, onClose, onUpdate }: { ticket: Ticket, onClose: () => void, onUpdate: (t:Ticket) => void }) {
  const [notes, setNotes] = useState(ticket.notes || '');
  const [resNotes, setResNotes] = useState(ticket.resolutionNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (statusOverride?: string) => {
    setIsSaving(true);
    const newStatus = statusOverride || ticket.status;
    
    const updated = {
      ...ticket,
      status: newStatus,
      notes,
      resolutionNotes: resNotes,
      lastUpdated: new Date().toISOString()
    };

    try {
      await onUpdate(updated);
      if(statusOverride) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex flex-col gap-2 pr-4">
             <div className="flex items-center gap-3">
               <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{ticket.id}</span>
               <StatusBadge status={ticket.status as any} />
             </div>
             <h2 className="text-xl font-semibold text-[#1e1b4b] leading-tight">{ticket.subject}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div className="flex flex-col gap-1">
               <span className="text-gray-500 text-xs font-semibold uppercase">Requester</span>
               <span className="font-medium text-gray-900 truncate">{ticket.requesterName}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-gray-500 text-xs font-semibold uppercase">Email</span>
               <span className="font-medium text-gray-900 truncate" title={ticket.requesterEmail}>{ticket.requesterEmail}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-gray-500 text-xs font-semibold uppercase">Department</span>
               <span className="font-medium text-gray-900">{ticket.department}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-gray-500 text-xs font-semibold uppercase">Category</span>
               <span className="font-medium text-gray-900">{ticket.category}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-gray-500 text-xs font-semibold uppercase">Priority</span>
               <div className="mt-0.5"><PriorityBadge priority={ticket.priority as any} /></div>
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-800 tracking-tight">Description</span>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
               {ticket.description}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-800 tracking-tight">Admin Notes (Internal)</span>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="Private notes..."
              className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7F77DD] focus:ring-[3px] focus:ring-[#7F77DD]/15 resize-none h-24"
            />
          </div>

          {(ticket.status === 'Resolved' || ticket.status === 'Closed' || true) && (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-800 tracking-tight">Resolution Notes (Sent to user)</span>
              <textarea 
                value={resNotes} 
                onChange={e => setResNotes(e.target.value)}
                placeholder="Explain how this was resolved..."
                className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#7F77DD] focus:ring-[3px] focus:ring-[#7F77DD]/15 resize-none h-24"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 justify-end items-center">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Close
          </button>
          
          <button onClick={() => handleSave()} disabled={isSaving} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#7F77DD] hover:bg-[#6c65bd] text-white transition-all shadow-sm flex items-center gap-2">
            {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            Save Changes
          </button>

          {ticket.status === 'Open' && (
            <button onClick={() => handleSave('In Progress')} disabled={isSaving} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#fbbf24] hover:bg-[#f59e0b] text-[#78350f] transition-all shadow-sm">
              Start working
            </button>
          )}

          {ticket.status === 'In Progress' && (
            <button onClick={() => handleSave('Resolved')} disabled={isSaving} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#34d399] hover:bg-[#10b981] text-[#064e3b] transition-all shadow-sm">
              Mark complete
            </button>
          )}

          {ticket.status === 'Resolved' && (
            <button onClick={() => handleSave('Closed')} disabled={isSaving} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gray-600 hover:bg-gray-800 text-white transition-all shadow-sm">
              Close Ticket
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
