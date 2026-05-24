import React, { useState } from 'react';
import { CONFIG } from '../config';
import { useToast } from './ToastProvider';
import { Logo } from './Logo';

export function SettingsTab() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-[#1e1b4b]">Settings & Setup</h2>
      
      <BrandingSection />
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <h3 className="font-semibold text-gray-800">Current Configuration</h3>
        <p className="text-sm text-gray-500 mb-2">These values are loaded from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">src/config.ts</code>.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {Object.entries(CONFIG).filter(([k])=>k!=='BRAND_LOGO_BASE64').map(([k,v]) => (
            <div key={k} className="flex flex-col gap-1 border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-mono text-[10px] uppercase">{k}</span>
              <span className="font-medium text-gray-800 truncate" title={v as string}>{v as string}</span>
            </div>
          ))}
        </div>
      </div>

      <SetupInstructions />
    </div>
  );
}

function BrandingSection() {
  const { showToast } = useToast();
  const [b64, setB64] = useState('');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;

    if(!file.type.startsWith('image/')) {
       showToast("Please upload an image file", "error");
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
       const result = event.target?.result as string;
       if(result) {
         const base64str = result.split(',')[1];
         setB64(base64str);
       }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
    if(!b64) return;
    navigator.clipboard.writeText(b64);
    showToast("Base64 copied to clipboard!", "success");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
      <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-4">Branding (Logo)</h3>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
         <div className="flex flex-col gap-2 flex-1 w-full">
            <span className="text-sm font-medium text-gray-700">1. Select an image (PNG, SVG, JPG)</span>
            <input type="file" accept="image/*" onChange={handleImage} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-200 rounded-full p-1" />
            
            {b64 && (
              <div className="mt-4 flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium text-gray-700">2. Copy Base64 String</span>
                   <button onClick={copyToClipboard} className="text-xs bg-[#ede9fe] text-[#4c1d95] px-3 py-1 rounded-full font-medium hover:bg-[#ddd6fe]">Copy</button>
                </div>
                <textarea readOnly value={b64} className="w-full h-24 text-xs font-mono p-3 rounded-xl border border-gray-200 bg-gray-50 resize-none outline-none text-gray-500 break-all"></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Copy the string above → paste into <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">CONFIG.BRAND_LOGO_BASE64</code> in <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">src/config.ts</code> → save.
                </p>
              </div>
            )}
         </div>

         <div className="flex flex-col items-center gap-4 bg-gray-50 rounded-xl p-6 border border-gray-100 md:w-64">
            <span className="text-sm font-medium text-gray-500">Live Preview</span>
            <div className="w-[80px] h-[80px] bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-200">
               {b64 ? (
                 <img src={`data:image/png;base64,${b64}`} alt="preview" style={{width:56, height:56, objectFit:'contain'}} />
               ) : (
                 <Logo size={40} isHeadsetIconColor="#7F77DD" />
               )}
            </div>
            {b64 && <button onClick={()=>setB64('')} className="text-xs text-red-500 font-medium hover:underline">Reset to Default</button>}
         </div>
      </div>
    </div>
  );
}

function SetupInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
      <button onClick={()=>setOpen(!open)} className="w-full p-6 text-left flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
        <span>Setup Instructions</span>
        <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {open && (
        <div className="p-6 border-t border-gray-100 flex flex-col gap-8 bg-gray-50/50 text-gray-600 leading-relaxed">
          
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Step 1 — Google Sheets</h4>
            <p>Create a Google Sheet with the tab "Tickets" and columns in Row 1:<br/>
            <code>TicketID | Subject | Description | Category | Priority | Status | RequesterName | RequesterEmail | SubmittedDate | LastUpdated | AssignedTo | Notes | ResolutionNotes</code></p>
            <p className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs font-medium border border-amber-200">Note the Sheet ID from the URL: <code>https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit</code> and paste into CONFIG.GOOGLE_SHEET_ID.</p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Step 2 — Google Cloud API Key</h4>
            <p>Go to <a href="https://console.cloud.google.com" target="_blank" className="text-indigo-600 hover:underline">console.cloud.google.com</a> → Enable Google Sheets API.</p>
            <p>Create an API key → restrict it to Google Sheets API.</p>
            <p>Paste into CONFIG.GOOGLE_API_KEY.</p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Step 3 — Apps Script Web App</h4>
            <p>1. In your Google Sheet: Extensions → Apps Script. Paste the latest Apps Script code found in <code>apps-script.js</code>.</p>
            <p>2. To verify your email works, select the <code>testEmail</code> function in the toolbar and click <strong>"Run"</strong>. You will be prompted to "Review Permissions". Click Allow. Look for the email in your inbox!</p>
            <p className="text-red-600 font-semibold mt-2">3. VERY IMPORTANT: Click "Deploy" → "New deployment" → Select type "Web App". Set "Execute as" to "Me", and "Who has access" to "Anyone". Click Deploy.</p>
            <p className="text-indigo-600 font-semibold text-sm">If you are updating an existing script: Click "Deploy" → "Manage deployments". Click the pencil (Edit) icon. Under "Version", select "New version". Click Deploy.</p>
            <p>4. Copy the Web App URL and paste it into <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">CONFIG.APPS_SCRIPT_URL</code>. <br/><span className="text-red-500 font-medium text-xs">Note: The URL MUST end in <code>/exec</code>.</span></p>
          </div>

        </div>
      )}
    </div>
  );
}
