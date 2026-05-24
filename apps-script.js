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
    var sheet = ss.getSheetByName(params.sheetName || 'Tickets');
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
      var oldStatus = oldValues[5];
      
      range.setValues([params.data]);
      result = { success: true, action: "update" };
      
      var newStatus = params.data[5];
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
    var subject = rowData[1];
    var description = rowData[2];
    var category = rowData[3];
    var priority = rowData[4];
    var requesterName = rowData[6];
    var requesterEmail = rowData[7];
    var submittedDate = rowData[8];
    var department = rowData[13];

    // 1. Alert Admin
    var adminSubject = "New Helpdesk Ticket #" + ticketId + " - " + priority;
    var adminBody = "<h3>New Support Ticket Received: #" + ticketId + "</h3>" +
      "<p><b>From:</b> " + requesterName + " (" + requesterEmail + ")</p>" +
      "<p><b>Department:</b> " + department + "</p>" +
      "<p><b>Category:</b> " + category + "</p>" +
      "<p><b>Priority:</b> " + priority + "</p>" +
      "<p><b>Subject:</b> " + subject + "</p>" +
      "<p><b>Description:</b> " + description + "</p>" +
      "<p><a href='" + sheetUrl + "'>View in Spreadsheet</a></p>";

    if (adminEmail) {
      MailApp.sendEmail({
        to: adminEmail,
        subject: adminSubject,
        htmlBody: adminBody
      });
    }

    // 2. Alert User
    var userSubject = "Support Ticket Received: #" + ticketId;
    var userBody = "<h3>Ticket Received</h3>" +
      "<p>Hi " + requesterName + ",</p>" +
      "<p>We've received your request and our IT team is looking into it.</p>" +
      "<p><b>Subject:</b> " + subject + "<br>" +
      "<b>Priority:</b> " + priority + "</p>" +
      "<p>We will notify you once this is resolved.</p>" +
      "<p>Thanks,<br>IT Support Team</p>";


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
    var subject = rowData[1];
    var requesterName = rowData[6];
    var requesterEmail = rowData[7];
    var resolutionNotes = rowData[12];
    
    var userSubject = "✅ Ticket Resolved: #" + ticketId;
    var userBody = "<h3>Ticket Resolved: #" + ticketId + "</h3>" +
      "<p>Hi " + requesterName + ",</p>" +
      "<p>Your IT support ticket has been successfully resolved.</p>" +
      "<p><b>Subject:</b> " + subject + "<br>" +
      "<b>Resolution Notes:</b><br>" + (resolutionNotes || "Completed.") + "</p>" +
      "<p>Thanks for your patience,<br>IT Support Team</p>";

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
