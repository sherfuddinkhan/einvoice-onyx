import React, { useState } from "react";

// ========================================================
// 1. Authentication
// ========================================================
import LoginForm from "./LoginForm.js";
import ChangePasswordForm from "./ChangePasswordForm.js";

// ========================================================
// 2. Onyx Core (IRN / E-Invoice)
// ========================================================
import GenerateIRNForm from "./GenerateIRNForm.js";                     // /irn/addInvoice
import CancelIRNForm from "./CancelIRNForm.js";                         // /irn/cancel
import GetInvByIrnForm from "./GetInvByIrnForm.js";                     // /irn/getInvByIrn
import GetIrnByDocDetailsForm from "./GetIrnByDocDetailsForm.js";       // /irn/getIrnByDocDetails
import GetEwbByIrnForm from "./GetEwbByIrnForm.js";                     // /irn/getEwbByIrn
import VerifySignatureForm from "./VerifySignatureForm.js";             // /einvoice/verifySignature

// ========================================================
// 3. E-Way Bill (ONLY TWO ENDPOINTS)
// ========================================================
import GenerateEwbByIrnForm from "./GenerateEwbByIrnForm.js";           // /irn/generateEwbByIrn
import CancelEwbForm from "./CancelEwbForm.js";                         // /irn/cancelEwb

// ========================================================
// 4. Print
// ========================================================
import PrintEInvoiceForm from "./PrintEInvoiceForm.js";

// ========================================================
// 5. View Invoice
// ========================================================
import ListEInvoicesForm from "./ListEInvoicesForm.js";
import InvoiceDetailsForm from "./InvoiceDetailsForm.js";

// ========================================================
// 6. Download Invoice
// ========================================================
import DownloadEInvoicesForm from "./DownloadEInvoicesForm.js";
import DownloadGstr1Form from "./DownloadGstr1Form.js";
import DownloadStatusForm from "./DownloadStatusForm.js";



// ========================================================
// 8. Entity Management
// ========================================================
import AddEntityForm from "./AddEntityForm.js";
import BusinessHierarchyForm from "./BusinessHierarchyForm.js";
import AssignedPlaceOfBusinessesForm from "./AssignedPlaceOfBusinessesForm.js";
import AssignedGstinsForm from "./AssignedGstinsForm.js";
import UploadInvoice from "./UploadInvoice.js";
import UploadStatus from "./UploadStatus.js";
import UploadErrors from "./UploadErrors.js";

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
  // TAB MAP (Your component names used exactly as-is)
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
    "get-ewb-by-irn": <GetEwbByIrnForm {...props} />,
    "verify-signature": <VerifySignatureForm {...props} />,

    // E-Way Bill
    "generate-ewb-by-irn": <GenerateEwbByIrnForm {...props} />,
    "cancel-ewb": <CancelEwbForm {...props} />,

    // Print Invoice
    "print-einvoice": <PrintEInvoiceForm {...props} />,

    // Upload Invoice
     "Upload -invoice":<UploadInvoice {...props} />,
     "Upload -status":<UploadStatus {...props} />,
     "Upload -errors":<UploadErrors {...props} />,

    // View Invoice
    "view-list": <ListEInvoicesForm {...props} />,
    "view-details": <InvoiceDetailsForm {...props} />,

    // Download Invoice
    "download-einvoices": <DownloadEInvoicesForm {...props} />,
    "download-gstr1": <DownloadGstr1Form {...props} />,
    "download-status": <DownloadStatusForm {...props} />,

    

    // Entity Management
    "add-entity": <AddEntityForm {...props} />,
    "biz-hierarchy": <BusinessHierarchyForm {...props} />,
    "assigned-pobs": <AssignedPlaceOfBusinessesForm {...props} />,
    "assigned-gstins": <AssignedGstinsForm {...props} />,
  };

  // ========================================================
  // SECTIONS (Group UI)
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
        { key: "get-ewb-by-irn", name: "Get EWB by IRN" },
        { key: "verify-signature", name: "Verify Signature" },
      ],
    },
    {
      title: "E-Way Bill",
      tabs: [
        { key: "generate-ewb-by-irn", name: "Generate EWB by IRN" },
        { key: "cancel-ewb", name: "Cancel EWB" },
      ],
    },
    {
      title: "Print",
      tabs: [{ key: "print-einvoice", name: "Print E-Invoice" }],
    },
      {
      title: " Upload Invoice",
      tabs: [
        { key: "Upload -invoice", name: "UploadInvoice"},
        { key: "Upload -status", name: "Uploadstatus" },
        { key: "Upload -errors", name: "UploadErrors" }
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
  // BUTTON STYLE
  // ========================================================
  const buttonStyle = (key) => ({
    padding: "8px 12px",
    background: activeTab === key ? "#3498db" : "#f8f9fa",
    color: activeTab === key ? "white" : "#333",
    borderRadius: "4px",
    cursor: "pointer",
    border: "1px solid #ccc",
    fontWeight: activeTab === key ? "bold" : "normal",
  });

  return (
    <div style={{ maxWidth: "1250px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>
        IRISGST E-Invoicing
      </h1>

      {/* SECTION BUTTONS */}
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: "20px" }}>
          <h3>{section.title}</h3>
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

      {/* CONTENT PANEL */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#f9f9f9",
          borderRadius: "8px",
          minHeight: "420px",
        }}
      >
        {tabMap[activeTab] || <div>Select a function above.</div>}
      </div>
    </div>
  );
};

export default TabContainer;
