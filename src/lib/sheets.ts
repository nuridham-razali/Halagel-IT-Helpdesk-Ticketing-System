import { CONFIG } from "../config";
import { Ticket } from "../types";

// TAB 1 — "Tickets" columns (Row 1 = headers):
// A: TicketID | B: Subject | C: Description | D: Category | E: Priority |
// F: Status | G: RequesterName | H: RequesterEmail | I: SubmittedDate |
// J: LastUpdated | K: AssignedTo | L: Notes | M: ResolutionNotes | N: Department

export async function fetchTickets(): Promise<Ticket[]> {
  // If no API key or Sheet ID, return mock data for preview/testing
  if (!CONFIG.GOOGLE_API_KEY || CONFIG.GOOGLE_API_KEY === "YOUR_API_KEY_HERE" || !CONFIG.GOOGLE_SHEET_ID || CONFIG.GOOGLE_SHEET_ID === "YOUR_SHEET_ID_HERE") {
    console.warn("Using mock data. Missing Google API Key or Sheet ID.");
    return mockTickets;
  }
  if (CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.endsWith("/exec") && CONFIG.APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("Invalid APPS_SCRIPT_URL configured. It must end in /exec.");
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/Tickets!A:N?key=${CONFIG.GOOGLE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Sheets fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    
    // Parse
    const rows = data.values || [];
    if (rows.length <= 1) return []; // Only headers

    const tickets: Ticket[] = [];
    // Start from row 1 (exclude header 0). Row in Google Sheet is 1-based, so index 1 is row 2
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      tickets.push({
        id: row[0] || "",
        subject: row[1] || "",
        description: row[2] || "",
        category: row[3] || "Other",
        priority: row[4] || "Low",
        status: row[5] || "Open",
        requesterName: row[6] || "",
        requesterEmail: row[7] || "",
        submittedDate: row[8] || new Date().toISOString(),
        lastUpdated: row[9] || new Date().toISOString(),
        assignedTo: row[10] || "",
        notes: row[11] || "",
        resolutionNotes: row[12] || "",
        department: row[13] || "Admin",
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

export async function appendTicket(ticket: Ticket): Promise<void> {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("Simulated append: Missing Apps Script URL.");
    mockTickets.push({ ...ticket, _rowIndex: mockTickets.length + 2 });
    return;
  }
  if (!CONFIG.APPS_SCRIPT_URL.endsWith("/exec")) {
    throw new Error("Invalid APPS_SCRIPT_URL. You must use the Web App URL ending in '/exec'. The URL you provided is a Library/Editor URL.");
  }

  const rowData = [
    ticket.id,
    ticket.subject,
    ticket.description,
    ticket.category,
    ticket.priority,
    ticket.status,
    ticket.requesterName,
    ticket.requesterEmail,
    ticket.submittedDate,
    ticket.lastUpdated,
    ticket.assignedTo,
    ticket.notes,
    ticket.resolutionNotes,
    ticket.department,
  ];

  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "append",
        sheetName: "Tickets",
        data: rowData,
        adminEmail: CONFIG.ADMIN_EMAIL
      })
    });
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

  const rowData = [
    ticket.id,
    ticket.subject,
    ticket.description,
    ticket.category,
    ticket.priority,
    ticket.status,
    ticket.requesterName,
    ticket.requesterEmail,
    ticket.submittedDate,
    ticket.lastUpdated,
    ticket.assignedTo,
    ticket.notes,
    ticket.resolutionNotes,
    ticket.department,
  ];

  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "update",
        sheetName: "Tickets",
        data: rowData,
        rowIndex: ticket._rowIndex,
        adminEmail: CONFIG.ADMIN_EMAIL
      })
    });
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
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    assignedTo: "Admin",
    notes: "Replaced the access point.",
    resolutionNotes: "Access point AP-05 was faulty. Replaced with new unit.",
    _rowIndex: 4
  }
];
