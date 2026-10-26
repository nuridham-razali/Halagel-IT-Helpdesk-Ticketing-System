import { CONFIG } from "../config";
import { Ticket } from "../types";

// TAB 1 — "Tickets" columns (Row 1 = headers):
// A: Subject | B: RequesterEmail | C: RequesterName | D: Department | E: Category |
// F: Priority | G: Description | H: Status | I: SubmittedDate |
// J: ResolutionNotes | K: TicketID | L: LastUpdated | M: AssignedTo | N: Notes

export async function fetchTickets(): Promise<Ticket[]> {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("Using mock data. Missing APPS_SCRIPT_URL.");
    return mockTickets;
  }
  if (!CONFIG.APPS_SCRIPT_URL.endsWith("/exec")) {
    throw new Error("Invalid APPS_SCRIPT_URL configured. It must end in /exec.");
  }

  try {
    let res;
    try {
      res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "read",
          sheetName: "Tickets",
          sheetId: CONFIG.GOOGLE_SHEET_ID,
        }),
      });
    } catch (networkError) {
      console.error("Network or CORS error:", networkError);
      throw new Error("Failed to fetch. Please verify that your Apps Script Web App is deployed with 'Execute as: Me' and 'Who has access: Anyone'.");
    }

    if (!res.ok) {
      throw new Error(`Apps Script fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch tickets via Apps Script");
    }

    // Parse
    const rows = data.data || [];
    if (rows.length <= 1) return []; // Only headers

    const tickets: Ticket[] = [];
    // Start from row 1 (exclude header 0). Row in Google Sheet is 1-based, so index 1 is row 2
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const parsedSub = parseSheetDate(row[7] || row[10]);
      const subDate = parsedSub || new Date().toISOString();
      
      const parsedUpdated = parseSheetDate(row[11]);
      // Use submitted date as fallback if lastUpdated column is empty or unset, NOT today's date!
      const lastUpdated = parsedUpdated || subDate;

      tickets.push({
        id: row[0] || "",
        requesterEmail: row[1] || "",
        requesterName: row[2] || "",
        department: row[3] || "Admin",
        category: row[4] || "Other",
        priority: row[5] || "Low",
        description: row[6] || "",
        submittedDate: subDate,
        status: row[8] || "Open",
        subject: row[9] || (row[6] ? row[6].substring(0, 50) + "..." : "Support Request"),
        lastUpdated: lastUpdated,
        assignedTo: row[12] || "",
        resolutionNotes: row[13] || "",
        notes: row[14] || "", // Admin Notes
        _rowIndex: i + 1, // Google Sheet rows are 1-based
      });
    }

    // Sort by submitted date descending (newest first)
    return tickets.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
  } catch (err) {
    console.error("Error fetching tickets:", err);
    throw err;
  }
}

export function parseSheetDate(dateVal: any): string {
  if (!dateVal) return "";
  const str = String(dateVal).trim();
  if (!str) return "";

  // Fix potential DD/MM/YYYY or DD-MM-YYYY format
  if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(str)) {
    const parts = str.split(/[^\d]/).filter(Boolean);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const hour = parts.length > 3 ? parseInt(parts[3], 10) : 0;
      const min = parts.length > 4 ? parseInt(parts[4], 10) : 0;
      const sec = parts.length > 5 ? parseInt(parts[5], 10) : 0;
      const d = new Date(year, month, day, hour, min, sec);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    }
  }

  // YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(str)) {
    const parts = str.split(/[^\d]/).filter(Boolean);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const hour = parts.length > 3 ? parseInt(parts[3], 10) : 0;
      const min = parts.length > 4 ? parseInt(parts[4], 10) : 0;
      const sec = parts.length > 5 ? parseInt(parts[5], 10) : 0;
      const d = new Date(year, month, day, hour, min, sec);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    }
  }

  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  return "";
}

export function isDateToday(dateStrOrVal: any): boolean {
  if (!dateStrOrVal) return false;
  const now = new Date();
  
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDate = now.getDate();

  const iso = parseSheetDate(dateStrOrVal);
  let d: Date | null = null;
  if (iso) {
    d = new Date(iso);
  } else if (dateStrOrVal instanceof Date && !isNaN(dateStrOrVal.getTime())) {
    d = dateStrOrVal;
  }

  if (d && !isNaN(d.getTime())) {
    if (d.getFullYear() === localYear && d.getMonth() === localMonth && d.getDate() === localDate) {
      return true;
    }
    // Also check UTC day in case date is stored as UTC
    if (d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate()) {
      return true;
    }
  }

  // Quick prefix matching (e.g. YYYY-MM-DD or DD/MM/YYYY)
  const raw = String(dateStrOrVal).trim();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyymmdd = `${localYear}-${pad(localMonth + 1)}-${pad(localDate)}`;
  const ddmmyyyy = `${pad(localDate)}/${pad(localMonth + 1)}/${localYear}`;
  const dmmyyyy = `${localDate}/${pad(localMonth + 1)}/${localYear}`;
  if (raw.startsWith(yyyymmdd) || raw.startsWith(ddmmyyyy) || raw.startsWith(dmmyyyy)) {
    return true;
  }

  return false;
}

export function formatToMYT(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const offsetHours = 8;
  const localD = new Date(d.getTime() + offsetHours * 60 * 60 * 1000);
  
  const y = localD.getUTCFullYear();
  const m = String(localD.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localD.getUTCDate()).padStart(2, '0');
  const h = String(localD.getUTCHours()).padStart(2, '0');
  const min = String(localD.getUTCMinutes()).padStart(2, '0');
  const s = String(localD.getUTCSeconds()).padStart(2, '0');
  
  return `${y}-${m}-${day}T${h}:${min}:${s}+08:00`;
}

export async function appendTicket(ticket: Ticket): Promise<void> {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("Simulated append: Missing Apps Script URL.");
    mockTickets.push({ ...ticket, _rowIndex: mockTickets.length + 2 });
    return;
  }
  if (!CONFIG.APPS_SCRIPT_URL.endsWith("/exec")) {
    throw new Error("Invalid APPS_SCRIPT_URL. You must use the Web App URL ending in '/exec'. The URL you provided is a Library/Editor URL.");
  }

  const formattedSubmitted = formatToMYT(ticket.submittedDate);
  const formattedUpdated = formatToMYT(ticket.lastUpdated || ticket.submittedDate);

  const rowData = [
    ticket.id,                      // 0: ID
    ticket.requesterEmail,          // 1: Email
    ticket.requesterName,           // 2: Full Name
    ticket.department,              // 3: Department
    ticket.category,                // 4: Request Type
    ticket.priority,                // 5: Priority
    ticket.description,             // 6: Description
    formattedSubmitted,             // 7: Submitted Date & Time (formatted)
    ticket.status,                  // 8: Status
    ticket.subject,                 // 9: Subject
    formattedSubmitted,             // 10: Submitted Date
    formattedUpdated,               // 11: Last Updated
    ticket.assignedTo,              // 12: Assigned To
    ticket.resolutionNotes,         // 13: Resolution Notes
    ticket.notes,                   // 14: Admin Notes
  ];

  try {
    let res;
    try {
      res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "append",
          sheetName: "Tickets",
          sheetId: CONFIG.GOOGLE_SHEET_ID,
          data: rowData,
          adminEmail: CONFIG.ADMIN_EMAIL
        })
      });
    } catch (networkError) {
      console.error("Network or CORS error:", networkError);
      throw new Error("Failed to fetch. Please verify that your Apps Script Web App is deployed with 'Execute as: Me' and 'Who has access: Anyone'.");
    }
    if (!res.ok) throw new Error("Network response was not ok");
  } catch (err) {
    console.error("Append error:", err);
    throw err;
  }
}

export async function updateTicket(ticket: Ticket): Promise<void> {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("Simulated update: Missing Apps Script URL.");
    const idx = mockTickets.findIndex(t => t.id === ticket.id);
    if(idx !== -1) mockTickets[idx] = ticket;
    return;
  }
  if (!CONFIG.APPS_SCRIPT_URL.endsWith("/exec")) {
    throw new Error("Invalid APPS_SCRIPT_URL. You must use the Web App URL ending in '/exec'. The URL you provided is a Library/Editor URL.");
  }

  const formattedSubmitted = formatToMYT(ticket.submittedDate);
  const formattedUpdated = formatToMYT(ticket.lastUpdated || ticket.submittedDate);

  const rowData = [
    ticket.id,                      // 0: ID
    ticket.requesterEmail,          // 1: Email
    ticket.requesterName,           // 2: Full Name
    ticket.department,              // 3: Department
    ticket.category,                // 4: Request Type
    ticket.priority,                // 5: Priority
    ticket.description,             // 6: Description
    formattedSubmitted,             // 7: Submitted Date & Time (formatted)
    ticket.status,                  // 8: Status
    ticket.subject,                 // 9: Subject
    formattedSubmitted,             // 10: Submitted Date
    formattedUpdated,               // 11: Last Updated
    ticket.assignedTo,              // 12: Assigned To
    ticket.resolutionNotes,         // 13: Resolution Notes
    ticket.notes,                   // 14: Admin Notes
  ];

  try {
    let res;
    try {
      res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "update",
          sheetName: "Tickets",
          sheetId: CONFIG.GOOGLE_SHEET_ID,
          data: rowData,
          rowIndex: ticket._rowIndex,
          adminEmail: CONFIG.ADMIN_EMAIL
        })
      });
    } catch (networkError) {
      console.error("Network or CORS error:", networkError);
      throw new Error("Failed to fetch. Please verify that your Apps Script Web App is deployed with 'Execute as: Me' and 'Who has access: Anyone'.");
    }
    if (!res.ok) throw new Error("Network response was not ok");
  } catch (err) {
    console.error("Update error:", err);
    throw err;
  }
}

const mockTickets: Ticket[] = [
  {
    id: "TKT-20231012-0001",
    subject: "Laptop won't turn on",
    description: "I tried pressing the power button but nothing happens. The battery might be dead or the charger is broken.",
    category: "Hardware",
    department: "Sales",
    priority: "High",
    status: "Open",
    requesterName: "John Doe",
    requesterEmail: "john.doe@example.com",
    submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    assignedTo: "",
    notes: "",
    resolutionNotes: "",
    _rowIndex: 2
  },
  {
    id: "TKT-20231012-0002",
    subject: "Need Photoshop installed",
    description: "Please install Adobe Photoshop on my machine for the new design project.",
    category: "Software",
    department: "Marketing",
    priority: "High",
    status: "In Progress",
    requesterName: "Jane Smith",
    requesterEmail: "jane.smith@example.com",
    submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    assignedTo: "Admin",
    notes: "Checking license availability.",
    resolutionNotes: "",
    _rowIndex: 3
  },
  {
    id: "TKT-20231010-0003",
    subject: "WiFi dropping in meeting room A",
    description: "The connection keeps dropping during video calls.",
    category: "Network",
    department: "Admin",
    priority: "High",
    status: "Resolved",
    requesterName: "Mike Johnson",
    requesterEmail: "mike.j@example.com",
    submittedDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    assignedTo: "Admin",
    notes: "Replaced the access point.",
    resolutionNotes: "Access point AP-05 was faulty. Replaced with new unit.",
    _rowIndex: 4
  }
];
