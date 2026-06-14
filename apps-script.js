/**
 * GOOGLE APPS SCRIPT — COPY THIS TO YOUR APPS SCRIPT PROJECT
 * 
 * Step 1: Open your Google Sheet
 * Step 2: Extensions -> Apps Script
 * Step 3: Paste this code
 * Step 4: Deploy -> New deployment -> Web App
 * Step 5: Execute as: "Me", Who has access: "Anyone"
 * Step 6: Copy Web App URL to CONFIG.APPS_SCRIPT_URL
 * 
 * Note: Apps Script Web Apps deployed as "Anyone" automatically handle CORS.
 */
function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "doPost was run manually without data. This function must be triggered via an HTTP POST request." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try {
    var params = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss && params.sheetId) {
      ss = SpreadsheetApp.openById(params.sheetId);
    }
    var sheet = ss.getSheetByName(params.sheetName || 'Tickets') || ss.getSheets()[0];
    var result;

    if (params.action === "append") {
      sheet.appendRow(params.data);
      result = { success: true, action: "append" };
      
      // Send Email Notifications
      sendNewTicketEmails(params.data, ss.getUrl(), params.adminEmail);
    }
    else if (params.action === "update") {
      var range = sheet.getRange(params.rowIndex, 1, 1, params.data.length);
      var oldValues = range.getValues()[0];
      var oldStatus = oldValues[8]; // Status is at index 8
      
      range.setValues([params.data]);
      result = { success: true, action: "update" };
      
      var newStatus = params.data[8]; // Status is at index 8
      // Send Completion Email
      if (newStatus === "Resolved" && oldStatus !== "Resolved") {
        sendResolvedTicketEmail(params.data, ss.getUrl(), params.adminEmail);
      }
    }
    else if (params.action === "read") {
      var data = sheet.getDataRange().getValues();
      result = { success: true, data: data };
    }
    else {
      result = { success: false, error: "Unknown action" };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success:false, error:err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "IT Helpdesk API running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// --------------------- EMAIL NOTIFICATIONS ---------------------

function testEmail() {
  try {
    var email = Session.getActiveUser().getEmail();
    if (!email) {
      console.log("Could not determine your email. Please ensure you are logged in.");
      return;
    }
    
    // Using GmailApp sometimes helps trigger the Google authorization screen properly
    var dummy = GmailApp.getAliases(); 
    
    MailApp.sendEmail({
      to: email,
      subject: "Test Email from IT Helpdesk App",
      htmlBody: "<h3>Success!</h3><p>Your Google Apps Script is successfully authorized to send emails.</p>"
    });
    
    console.log("SUCCESS: A test email was sent to " + email);
    console.log("If you do not see it in your Inbox, please check your Spam AND your 'Sent' folder.");
  } catch (error) {
    console.error("ERROR SENDING EMAIL: " + error.toString());
  }
}

function sendNewTicketEmails(rowData, sheetUrl, forcedAdminEmail) {
  if (!rowData) {
    console.log("sendNewTicketEmails was run manually without data. Please test by submitting a ticket from the app.");
    return;
  }
  try {
    var adminEmail = forcedAdminEmail || Session.getActiveUser().getEmail(); // Use provided config email
    
    var ticketId = rowData[0];
    var requesterEmail = rowData[1];
    var requesterName = rowData[2];
    var department = rowData[3];
    var category = rowData[4];
    var priority = rowData[5];
    var description = rowData[6];
    var subject = rowData[9];
    var submittedDate = rowData[10];

    // 1. Alert Admin
     var adminSubject = "🎫 New Helpdesk Ticket #" + ticketId + " - " + priority + " Priority";
    var adminBody = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background-color:#2d7a3e;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
        <h2>🎫 New Support Ticket Received</h2>
        <p>Ticket #${ticketId}</p>
      </div>
      <div style="background:#f8f9fa;padding:20px;border-radius:0 0 10px 10px;">
        <div style="background:white;padding:15px;border-radius:8px;margin:10px 0;">
          <p><b style="color:#2d7a3e;">From:</b> ${requesterName}</p>
          <p><b style="color:#2d7a3e;">Email:</b> ${requesterEmail}</p>
          <p><b style="color:#2d7a3e;">Department:</b> ${department}</p>
          <p><b style="color:#2d7a3e;">Category:</b> ${category}</p>
          <p><b style="color:#2d7a3e;">Priority:</b> ${priority}</p>
          <p><b style="color:#2d7a3e;">Subject:</b> ${subject}</p>
        </div>
        <div style="background:white;padding:15px;border-radius:8px;margin:10px 0;">
          <p><b style="color:#2d7a3e;">Description:</b></p>
          <p>${description}</p>
        </div>
        <div style="background:white;padding:15px;border-radius:8px;margin:10px 0;">
          <p><b style="color:#2d7a3e;">Submitted:</b> ${new Date(submittedDate).toLocaleString()}</p>
        </div>
        <p style="text-align:center;margin-top:20px;">
          <a href="${sheetUrl}" 
             style="background:#2d7a3e;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">
            View in Spreadsheet
          </a>
        </p>
      </div>
    </div>`;

 if (adminEmail) {
      MailApp.sendEmail({
        to: adminEmail,
        subject: adminSubject,
        htmlBody: adminBody,
        name: 'IT Helpdesk'
      });
    }

    // 2. Alert User
      var userSubject = "Support Ticket Received: #" + ticketId;
    var userBody = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background-color:#2d7a3e;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
        <h2>Ticket Received ✅</h2>
        <p>Ticket #${ticketId}</p>
      </div>
      <div style="background:#f8f9fa;padding:20px;border-radius:0 0 10px 10px;">
        <p>Hi ${requesterName},</p>
        <p>Your request has been received, and I am currently checking on it..</p>
        <div style="background:white;padding:15px;border-radius:8px;margin:10px 0;">
          <p><b style="color:#2d7a3e;">Subject:</b> ${subject}</p>
          <p><b style="color:#2d7a3e;">Priority:</b> ${priority}</p>
        </div>
        <p>I will notify you once this is resolved.</p>
        <p>Best regards,<br><b>Idham Razali</b><br>IT/Admin Executive </p>
      </div>
      <div style="text-align:center;margin-top:15px;color:#999;font-size:12px;">
        Halagel Helpdesk System - Automated Notification
      </div>
    </div>`;



    if (requesterEmail) {
      MailApp.sendEmail({
        to: requesterEmail,
        subject: userSubject,
        htmlBody: userBody,
        name: 'IT Helpdesk'
      });
    }
  } catch (error) {
    console.error('Error sending emails: ' + error.toString());
  }
}

function sendResolvedTicketEmail(rowData, sheetUrl, forcedAdminEmail) {
  if (!rowData) {
    console.log("sendResolvedTicketEmail was run manually without data. Please test by resolving a ticket from the app.");
    return;
  }
  try {
    var ticketId = rowData[0];
    var requesterEmail = rowData[1];
    var requesterName = rowData[2];
    var subject = rowData[9];
    var resolutionNotes = rowData[13];
    
     var userSubject = "✅ Ticket Resolved: #" + ticketId;
    var userBody = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="background-color:#2d7a3e;color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
        <h2>Ticket Resolved ✅</h2>
        <p>Ticket #${ticketId}</p>
      </div>
      <div style="background:#f8f9fa;padding:20px;border-radius:0 0 10px 10px;">
        <p>Hi ${requesterName},</p>
        <p>Your IT support ticket has been successfully resolved.</p>
        <div style="background:white;padding:15px;border-radius:8px;margin:10px 0;">
          <p><b style="color:#2d7a3e;">Subject:</b> ${subject}</p>
          <p><b style="color:#2d7a3e;">Resolution Notes:</b></p>
          <p>${resolutionNotes || "Completed."}</p>
        </div>
        
         <p>If you have any questions or need further assistance, please don't hesitate to submit a new ticket.</p>
        <p>Best regards,<br><b>Idham Razali</b><br>IT/Admin Executive </p>
      </div>
      <div style="text-align:center;margin-top:15px;color:#999;font-size:12px;">
        Halagel Helpdesk System - Automated Notification
      </div>
    </div>`;


    if (requesterEmail) {
      MailApp.sendEmail({
        to: requesterEmail,
        subject: userSubject,
        htmlBody: userBody,
        name: 'IT Helpdesk'
      });
    }
  } catch (error) {
    console.error('Error sending resolved email: ' + error.toString());
  }
}
