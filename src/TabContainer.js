import React, { useState } from "react";

// ========================================================
// 1. Authentication
// ========================================================
import LoginForm from "./Authentication/LoginForm.js";
import ChangePasswordForm from "./Authentication/ChangePasswordForm.js";

// ========================================================
// 2. Onyx Core (IRN / E-Invoice)
// ========================================================
import GenerateIRNForm from "./E-invoice&IRN/GenerateIRNForm.js";                     
import CancelIRNForm from "./E-invoice&IRN/CancelIRNForm.js";                         
import GetInvByIrnForm from "./E-invoice&IRN/GetByIRNForm.js";                     
import GetIrnByDocDetailsForm from "./E-invoice&IRN/GetIrnByDocDetailsForm.js";       
// Removed GetEwbByIrnForm from this section's imports (if it was here)
import VerifySignatureForm from "./E-invoice&IRN/VerifySignatureForm.js";             

// ========================================================
// 3. E-Way Bill (ONLY TWO ENDPOINTS + Get EWB by IRN)
// The GetEwbByIrnForm component is logically grouped here now.
// ========================================================
import GenerateEwbByIrnForm from "./E-waybill/GenerateEwbByIrnForm.js";           
import CancelEwbForm from "./E-waybill/CancelEwbForm.js";                         
// <-- IMPORT ADDED HERE
import GetEwbByIrnForm from "./E-waybill/GetEwbByIrnForm.js";                     

// ========================================================
// 4. Print
// ========================================================
import PrintEInvoiceForm from "./print/PrintEInvoiceForm.js";

// ========================================================
// 5. View Invoice
// ========================================================
import ListEInvoicesForm from "./Viewinvoice/ListEInvoicesForm.js";
import InvoiceDetailsForm from "./Viewinvoice/InvoiceDetailsForm.js";

// ========================================================
// 6. Download Invoice (Using 'Downloadinvoice' folder path)
// ========================================================
import DownloadEInvoicesForm from "./Downloadinvoice/DownloadEInvoicesForm.js";
import DownloadGstr1Form from "./Downloadinvoice/DownloadGstr1Form.js";
import DownloadStatusForm from "./Downloadinvoice/DownloadStatusForm.js";

// ========================================================
// 7. Upload Invoice (Using 'Upload invoice' folder path)
// ========================================================
import UploadInvoice from "./Upload invoice/UploadInvoice.js";
import UploadStatus from "./Upload invoice/UploadStatus.js";
import UploadErrors from "./Upload invoice/UploadErrors.js";

// ========================================================
// 8. Entity Management
// ========================================================
import AddBusinessForm from "./Entitymanagment/AddBusinessForm.js"; 
import BusinessHierarchyForm from "./Entitymanagment/BusinessHierarchyForm.js";
import AssignedPlaceOfBusinessesForm from "./Entitymanagment/AssignedPlaceOfBusinessesForm.js";
import AssignedGstinsForm from "./Entitymanagment/AssignedGstinsForm.js";


// ========================================================
// MAIN COMPONENT
// ========================================================
const TabContainer = () => {
  const [activeTab, setActiveTab] = useState("login");

  const [sharedData, setSharedData] = useState({
    token: localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    email: localStorage.getItem("email") || "",
  });

  const updateSharedData = (key, value) => {
    setSharedData((prev) => ({ ...prev, [key]: value }));

    if (value !== null && value !== undefined) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  };

  const props = {
    shared: sharedData,
    updateShared: updateSharedData,
    setActiveTab,
  };

  // ========================================================
  // TAB MAP (Maps a string key to its corresponding React component)
  // ========================================================
  const tabMap = {
    // Authentication
    login: <LoginForm {...props} />,
    "change-password": <ChangePasswordForm {...props} />,

    // Onyx Core
    "generate-irn": <GenerateIRNForm {...props} />,
    "cancel-irn": <CancelIRNForm {...props} />,
    "get-inv-by-irn": <GetInvByIrnForm {...props} />,
    "get-irn-by-doc": <GetIrnByDocDetailsForm {...props} />,
    // REMOVED from Onyx Core: "get-ewb-by-irn": <GetEwbByIrnForm {...props} />,
    "verify-signature": <VerifySignatureForm {...props} />,

    // E-Way Bill
    "generate-ewb-by-irn": <GenerateEwbByIrnForm {...props} />,
    "cancel-ewb": <CancelEwbForm {...props} />,
    "get-ewb-by-irn": <GetEwbByIrnForm {...props} />, // <-- ADDED HERE
    
    // Print Invoice
    "print-einvoice": <PrintEInvoiceForm {...props} />,

    // Upload Invoice (Keys standardized)
    "upload-invoice": <UploadInvoice {...props} />,
    "upload-status": <UploadStatus {...props} />,
    "upload-errors": <UploadErrors {...props} />,

    // View Invoice
    "view-list": <ListEInvoicesForm {...props} />,
    "view-details": <InvoiceDetailsForm {...props} />,

    // Download Invoice
    "download-einvoices": <DownloadEInvoicesForm {...props} />,
    "download-gstr1": <DownloadGstr1Form {...props} />,
    "download-status": <DownloadStatusForm {...props} />,

    // Entity Management
    "add-entity": <AddBusinessForm {...props} />, 
    "biz-hierarchy": <BusinessHierarchyForm {...props} />,
    "assigned-pobs": <AssignedPlaceOfBusinessesForm {...props} />,
    "assigned-gstins": <AssignedGstinsForm {...props} />,
  };

  // ========================================================
  // SECTIONS (Defines the group and tabs for the UI menu)
  // ========================================================
  const sections = [
    {
      title: "Authentication",
      tabs: [
        { key: "login", name: "Login" },
        { key: "change-password", name: "Change Password" },
      ],
    },
    {
      title: "Onyx Core (IRN + E-Invoice)",
      tabs: [
        { key: "generate-irn", name: "Generate IRN + EWB" },
        { key: "cancel-irn", name: "Cancel IRN" },
        { key: "get-inv-by-irn", name: "Get Invoice by IRN" },
        { key: "get-irn-by-doc", name: "Get IRN by Doc" },
        // REMOVED from Onyx Core: { key: "get-ewb-by-irn", name: "Get EWB by IRN" },
        { key: "verify-signature", name: "Verify Signature" },
      ],
    },
    {
      title: "E-Way Bill",
      tabs: [
        { key: "generate-ewb-by-irn", name: "Generate EWB by IRN" },
        { key: "cancel-ewb", name: "Cancel EWB" },
        { key: "get-ewb-by-irn", name: "Get EWB by IRN" }, // <-- ADDED HERE
      ],
    },
    {
      title: "Print",
      tabs: [{ key: "print-einvoice", name: "Print E-Invoice" }],
    },
    {
      title: "Upload Invoice", 
      tabs: [
        { key: "upload-invoice", name: "Upload Invoice" },
        { key: "upload-status", name: "Upload Status" },
        { key: "upload-errors", name: "Upload Errors" }
      ],
    },
    {
      title: "View Invoice",
      tabs: [
        { key: "view-list", name: "Invoice List" },
        { key: "view-details", name: "Invoice Details" },
      ],
    },
    {
      title: "Download Invoice",
      tabs: [
        { key: "download-einvoices", name: "Download E-Invoices" },
        { key: "download-gstr1", name: "Download GSTR-1" },
        { key: "download-status", name: "Download Status" },
      ],
    },
    {
      title: "Entity Management",
      tabs: [
        { key: "add-entity", name: "Add Entity" },
        { key: "biz-hierarchy", name: "Business Hierarchy" },
        { key: "assigned-pobs", name: "Assigned POBs" },
        { key: "assigned-gstins", name: "Assigned GSTINs" },
      ],
    },
  ];

  // ========================================================
  // BUTTON STYLE (Function to dynamically style the tab buttons)
  // ========================================================
  const buttonStyle = (key) => ({
    padding: "8px 12px",
    background: activeTab === key ? "#3498db" : "#f8f9fa",
    color: activeTab === key ? "white" : "#333",
    borderRadius: "4px",
    cursor: "pointer",
    border: "1px solid #ccc",
    fontWeight: activeTab === key ? "bold" : "normal",
    transition: "background 0.3s, color 0.3s", 
  });

  return (
    <div style={{ maxWidth: "1250px", margin: "0 auto", padding: "20px", fontFamily: "'Arial', sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "10px" }}>
        IRISGST E-Invoicing Demo App
      </h1>

      {/* SECTION BUTTONS / NAVIGATION */}
      <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", background: "#ecf0f1" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: "15px" }}>
            <h3 style={{ color: "#2980b9", borderBottom: "1px dotted #bdc3c7", paddingBottom: "5px", marginTop: "0" }}>{section.title}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {section.tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={buttonStyle(tab.key)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CONTENT PANEL */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#ffffff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          minHeight: "420px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Render the component corresponding to the activeTab key */}
        {tabMap[activeTab] || <div>Select a function above to view its API demo form.</div>}
      </div>
    </div>
  );
};

export default TabContainer;