import React, { useMemo } from 'react';
import { Ticket } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

const COLORS_STATUS = {
  "Open": "#3730a3", // indigo-800
  "In Progress": "#f59e0b", // amber-500
  "Resolved": "#10b981", // emerald-500
  "Closed": "#6b7280" // gray-500
};

const COLORS_CAT = {
  "Hardware": "#be185d", // pink-700
  "Software": "#7c3aed", // violet-600
  "Network": "#1d4ed8", // blue-700
  "Email": "#047857", // emerald-700
  "Access / Permissions": "#d97706", // amber-600
  "Other": "#4b5563" // gray-600
};

export function ReportsTab({ tickets }: { tickets: Ticket[] }) {
  const catData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value);
  }, [tickets]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const lineData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
       const date = subDays(today, i);
       const count = tickets.filter(t => isSameDay(parseISO(t.submittedDate), date)).length;
       data.push({ date: format(date, 'MMM dd'), count });
    }
    return data;
  }, [tickets]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Category Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="font-semibold text-gray-800 mb-6 w-full text-left">Tickets by Category</h3>
          <div className="w-full h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={catData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                 <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-30} textAnchor="end" height={60} stroke="#9ca3af" axisLine={false} tickLine={false} />
                 <YAxis tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                 <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {catData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={(COLORS_CAT as any)[entry.name] || COLORS_CAT["Other"]} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center w-full">
          <h3 className="font-semibold text-gray-800 mb-6 w-full text-left">Tickets by Status</h3>
          <div className="w-full h-[300px] flex items-center justify-center -ml-8">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Pie
                   data={statusData}
                   cx="50%"
                   cy="50%"
                   innerRadius={70}
                   outerRadius={100}
                   paddingAngle={4}
                   dataKey="value"
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={(COLORS_STATUS as any)[entry.name] || COLORS_STATUS["Closed"]} />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Timeline Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center w-full mt-2">
        <h3 className="font-semibold text-gray-800 mb-6 w-full text-left">Tickets Submitted (Last 30 Days)</h3>
        <div className="w-full h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={lineData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
               <XAxis dataKey="date" tick={{fontSize: 10}} minTickGap={20} stroke="#9ca3af" axisLine={false} tickLine={false} />
               <YAxis tick={{fontSize: 12}} stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
               <Line type="monotone" dataKey="count" stroke="#7F77DD" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#7F77DD', stroke: '#fff', strokeWidth: 2 }} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
