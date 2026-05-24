export interface Ticket {
  id: string; // TicketID
  subject: string; // Subject
  description: string; // Description
  category: string; // Category
  department: string; // Department
  priority: string; // Priority
  status: string; // Status
  requesterName: string; // RequesterName
  requesterEmail: string; // RequesterEmail
  submittedDate: string; // SubmittedDate
  lastUpdated: string; // LastUpdated
  assignedTo: string; // AssignedTo
  notes: string; // Notes
  resolutionNotes: string; // ResolutionNotes
  _rowIndex?: number; // Internal: 1-based row index in Google Sheets
}

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketCategory = "Hardware" | "Software" | "Network" | "Email" | "Access / Permissions" | "Password Reset" | "Projector Setup" | "New Equipment" | "Printer" | "Access Request" | "Other";
export type TicketDepartment = "Sales" | "Admin" | "HR" | "QA/QC" | "Production" | "Engineering" | "Warehouse" | "Supply Chain" | "Marketing" | "R&D";
