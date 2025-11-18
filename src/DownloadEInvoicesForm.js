// DownloadEInvoicesForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const DownloadEInvoicesForm = ({ previousResponse }) => {
  // Auto-populate payload from previous response or defaults
  const [formData, setFormData] = useState({
    invStatus: previousResponse?.invStatus || ["IRN_GENERATED", "EWB_GENERATED", "BOTH"],
    catg: previousResponse?.catg || ["B2B", "SEWOP", "SEWP", "EXWP", "EXWOP", "DE"],
    fromUpDt: previousResponse?.fromUpDt || "2025-11-11",
    toUpDt: previousResponse?.toUpDt || "2025-11-11",
    eligibleForIrn: previousResponse?.eligibleForIrn ?? true,
    gstin: previousResponse?.gstin || previousResponse?.companyGstin || "",
    companyUniqueCode: previousResponse?.companyUniqueCode || previousResponse?.companyUniqueCode || "",
  });

  // Headers with companyId from previous response
  const [headers, setHeaders] = useState({
    accept: "application/json",
    companyId: previousResponse?.companyId || "", // auto-populate
    "X-Auth-Token": previousResponse?.token || "", // auto-populate
    product: "ONYX",
    "Content-Type": "application/json",
  });

  const [result, setResult] = useState(null);
  const [downloadId, setDownloadId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update formData & headers if previousResponse changes dynamically
  useEffect(() => {
    if (previousResponse) {
      setFormData({
        invStatus: previousResponse.invStatus || formData.invStatus,
        catg: previousResponse.catg || formData.catg,
        fromUpDt: previousResponse.fromUpDt || formData.fromUpDt,
        toUpDt: previousResponse.toUpDt || formData.toUpDt,
        eligibleForIrn: previousResponse.eligibleForIrn ?? formData.eligibleForIrn,
        gstin: previousResponse.gstin || previousResponse.companyGstin || formData.gstin,
        companyUniqueCode: previousResponse.companyUniqueCode || formData.companyUniqueCode,
      });

      setHeaders((prev) => ({
        ...prev,
        companyId: previousResponse.companyId || prev.companyId,
        "X-Auth-Token": previousResponse.token || prev["X-Auth-Token"],
      }));
    }
  }, [previousResponse]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "invStatus" || name === "catg") {
      const newValue = value.split(",").map((v) => v.trim());
      setFormData({ ...formData, [name]: newValue });
    } else {
      setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    }
  };

  const requestDownload = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(
        "https://stage-api.irisgst.com/irisgst/onyx/download/einvoices",
        formData,
        { headers }
      );
      setResult(response.data);
      if (response.data.response?.downloadId) {
        setDownloadId(response.data.response.downloadId);
      }
    } catch (error) {
      setResult(error.response?.data || { error: "Failed to request download" });
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!downloadId) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.get(
        `https://stage-api.irisgst.com/irisgst/onyx/download/status?companyCode=${formData.companyUniqueCode}&downloadType=Dnld_Einvoices&downloadId=${downloadId}`,
        { headers }
      );
      setResult(response.data);
      if (response.data.response?.status === "COMPLETED" && response.data.response.filePath) {
        window.open(response.data.response.filePath, "_blank");
      }
    } catch (error) {
      setResult(error.response?.data || { error: "Failed to check status" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Download E-Invoices</h2>

      {/* Headers */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Request Headers:</h3>
        <pre style={{ background: "#f5f5f5", padding: "10px" }}>{JSON.stringify(headers, null, 2)}</pre>
      </div>

      {/* Payload */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Request Payload:</h3>
        {Object.keys(formData).map((key) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <label>{key}:</label>
            {typeof formData[key] === "boolean" ? (
              <input
                name={key}
                type="checkbox"
                checked={formData[key]}
                onChange={handleChange}
              />
            ) : (
              <input
                name={key}
                value={Array.isArray(formData[key]) ? formData[key].join(",") : formData[key]}
                onChange={handleChange}
                style={{ width: "100%" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={requestDownload} disabled={loading} style={{ marginRight: "10px" }}>
          {loading ? "Requesting..." : "Request Download"}
        </button>
        {downloadId && (
          <button onClick={checkStatus} disabled={loading}>
            {loading ? "Checking..." : "Check Status & Download"}
          </button>
        )}
      </div>

      {/* Response */}
      {result && (
        <div>
          <h3>Response:</h3>
          <pre style={{ background: "#e8f0fe", padding: "10px" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DownloadEInvoicesForm;
