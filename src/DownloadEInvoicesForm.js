/// DownloadEInvoicesForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY = "iris_einvoice_shared_config";
const DOWNLOAD_ID_KEY = "iris_einvoice_last_download_id";

const DownloadEInvoicesForm = ({ previousResponse }) => {
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  const initialGstin = previousResponse?.userGstin
    || previousResponse?.companyGstin
    || previousResponse?.gstin
    || savedConfig?.gstin
    || savedConfig?.userGstin
    || "";

  const initialCompanyCode = previousResponse?.companyUniqueCode
    || savedConfig?.companyUniqueCode
    || previousResponse?.userGstin
    || "";

  const [headers, setHeaders] = useState({
    Accept: "application/json",
    "Content-Type": "application/json",
    product: "ONYX",
    companyId: previousResponse?.companyId || savedConfig?.companyId || "",
    "X-Auth-Token": previousResponse?.token || savedConfig?.token || "",
  });

  const [formData, setFormData] = useState({
    invStatus: previousResponse?.invStatus || ["IRN_GENERATED", "EWB_GENERATED", "BOTH"],
    catg: previousResponse?.catg || ["B2B", "SEWOP", "SEWP", "EXWP", "EXWOP", "DE"],
    fromUpDt: previousResponse?.fromUpDt || "21/11/2025",
    toUpDt: previousResponse?.toUpDt || "21/11/2025",
    eligibleForIrn: previousResponse?.eligibleForIrn ?? true,
    gstin: initialCompanyCode,
    companyUniqueCode: initialCompanyCode,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lastDownloadId, setLastDownloadId] = useState(localStorage.getItem(DOWNLOAD_ID_KEY) || null);

  useEffect(() => {
    if (previousResponse) {
      setHeaders(prev => ({
        ...prev,
        companyId: previousResponse.companyId || prev.companyId,
        "X-Auth-Token": previousResponse.token || prev["X-Auth-Token"],
      }));

      setFormData(prev => ({
        ...prev,
        gstin: previousResponse.userGstin || previousResponse.companyGstin || prev.gstin,
        companyUniqueCode: previousResponse.companyUniqueCode || prev.companyUniqueCode,
      }));
    }
  }, [previousResponse]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "invStatus" || name === "catg") {
      setFormData({
        ...formData,
        [name]: value.split(",").map(v => v.trim()).filter(Boolean),
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const downloadNow = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "http://localhost:3001/proxy/onyx/download/einvoices",
        formData,
        { headers }
      );

      setResult(response.data);

      const downloadId = response.data.response?.downloadId;
      if (downloadId) {
        // Store downloadId locally
        localStorage.setItem(DOWNLOAD_ID_KEY, downloadId);
        setLastDownloadId(downloadId);
        alert(`Download started! Download ID: ${downloadId}\nCheck IRIS portal → Downloads.`);
      }

      const filePath = response.data.response?.filePath;
      if (filePath) {
        window.open(filePath, "_blank");
      }
    } catch (error) {
      console.error(error);
      setResult(error.response?.data || { error: "Download failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", fontFamily: "Segoe UI, Arial" }}>
      <h2 style={{ color: "#1e3a8a" }}>Download E-Invoices (One-Click)</h2>

      {lastDownloadId && (
        <div style={{ marginBottom: 20, padding: 10, background: "#fef9c3", borderRadius: 6 }}>
          <strong>Last Download ID:</strong> {lastDownloadId}
        </div>
      )}

      <div style={{ marginBottom: 20, padding: 15, background: "#f0f8ff", borderRadius: 8 }}>
        <strong>Headers:</strong>
        <pre style={{ fontSize: "12px", margin: "8px 0" }}>
          {JSON.stringify(headers, null, 2)}
        </pre>
      </div>

      {Object.keys(formData).map((key) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <label style={{ display: "inline-block", width: 180, fontWeight: "bold" }}>{key}:</label>
          <input
            name={key}
            type={typeof formData[key] === "boolean" ? "checkbox" : "text"}
            checked={typeof formData[key] === "boolean" ? formData[key] : undefined}
            value={Array.isArray(formData[key]) ? formData[key].join(", ") : formData[key]}
            onChange={handleChange}
            style={{ width: "380px", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>
      ))}

      <div style={{ marginTop: 30 }}>
        <button
          onClick={downloadNow}
          disabled={loading}
          style={{
            padding: "14px 32px",
            fontSize: 18,
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Processing..." : "🚀 DOWNLOAD E-INVOICES NOW"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>Result</h3>
          <pre style={{
            background: result.response?.filePath ? "#ecfdf5" : "#fef2f2",
            padding: 15,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            overflow: "auto"
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DownloadEInvoicesForm;
