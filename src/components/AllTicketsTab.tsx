import React, { useState } from 'react';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../types';
import { StatusBadge, PriorityBadge } from './UserPortal';
import { format } from 'date-fns';

export function AllTicketsTab({ tickets, loading, onSelect }: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleExportCSV = () => {
    const headers = ["TicketID", "Subject", "Description", "Department", "Category", "Priority", "Status", "RequesterName", "RequesterEmail", "SubmittedDate", "LastUpdated", "AssignedTo", "Notes", "ResolutionNotes"];
    const csvContent = [
      headers.join(","),
      ...tickets.map((t:Ticket) => 
        [
          t.id, 
          `"${t.subject.replace(/"/g, '""')}"`, 
          `"${t.description.replace(/"/g, '""')}"`, 
          t.department,
          t.category, t.priority, t.status, 
          `"${t.requesterName}"`, t.requesterEmail, 
          t.submittedDate, t.lastUpdated, 
          t.assignedTo, `"${t.notes.replace(/"/g, '""')}"`, `"${t.resolutionNotes.replace(/"/g, '""')}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tickets_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedTickets = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  return (
    <div className="flex flex-col animate-fade-in bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-semibold text-[#1e1b4b]">All Tickets</h2>
        <button onClick={handleExportCSV} className="bg-[#ede9fe] hover:bg-[#ddd6fe] text-[#4c1d95] px-4 py-2 rounded-full text-xs font-semibold transition-colors">
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Ticket ID</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Requester</th>
              <th className="px-6 py-4">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-20 text-gray-500">Loading tickets...</td></tr>
            ) : paginatedTickets.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-20 text-gray-500">No tickets found.</td></tr>
            ) : paginatedTickets.map((t:Ticket, index:number) => {
              let dateStr = t.submittedDate;
              try {
                dateStr = format(new Date(t.submittedDate), 'MMM d, yyyy h:mm a');
              } catch (e) {}
              return (
              <tr key={`${t.id || 'tkt'}-${t._rowIndex || index}`} onClick={() => onSelect(t)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                <td className="px-6 py-4 font-mono text-[11px] text-gray-500">{t.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-indigo-600 truncate max-w-[250px]">{t.subject}</td>
                <td className="px-6 py-4 text-gray-600">{t.department}</td>
                <td className="px-6 py-4"><StatusBadge status={t.status as any} /></td>
                <td className="px-6 py-4"><PriorityBadge priority={t.priority as any} /></td>
                <td className="px-6 py-4 text-gray-600">{t.requesterName}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{dateStr}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {!loading && tickets.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
           <span className="text-sm text-gray-500">Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, tickets.length)} of {tickets.length}</span>
           <div className="flex gap-2">
             <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-600 disabled:opacity-50 text-sm hover:bg-gray-50 cursor-pointer">Previous</button>
             <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)} className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-600 disabled:opacity-50 text-sm hover:bg-gray-50 cursor-pointer">Next</button>
           </div>
        </div>
      )}
    </div>
  );
}
