import React, { useState, useEffect } from "react";
import axios from "axios";

// Storage keys
const STORAGE_KEY = "iris_einvoice_shared_config";
const DOWNLOAD_ID_KEY = "iris_einvoice_last_download_id";

const DownloadStatusForm = ({ previousResponse }) => {
  // ----------------- STATES -----------------
  const [headers, setHeaders] = useState({
    Accept: "application/json",
    companyId: "",
    "X-Auth-Token": "",
    product: "ONYX",
  });

  const [query, setQuery] = useState({
    companyCode: "",
    downloadType: "Dnld_Gstr1", // default GSTR1
    downloadId: "", // NEW: auto-populate downloadId
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // ----------------- AUTO POPULATE -----------------
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const savedDownloadId = localStorage.getItem(DOWNLOAD_ID_KEY) || "";

    const autoCompanyId =
      previousResponse?.response?.companyid || saved.companyId || "";
    const autoToken =
      previousResponse?.response?.token || saved.token || "";
    const autoCompanyCode =
      previousResponse?.response?.companyUniqueCode ||
      saved.companyUniqueCode ||
      "";

    setHeaders((prev) => ({
      ...prev,
      companyId: autoCompanyId,
      "X-Auth-Token": autoToken,
    }));

    setQuery((prev) => ({
      ...prev,
      companyCode: autoCompanyCode,
      downloadId: savedDownloadId, // auto-populate last downloadId
    }));

    // Save to localStorage for future sessions
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: autoCompanyId,
        token: autoToken,
        companyUniqueCode: autoCompanyCode,
      })
    );
  }, [previousResponse]);

  // ----------------- CHECK STATUS -----------------
  const checkStatus = async () => {
    if (!headers.companyId || !headers["X-Auth-Token"] || !query.companyCode) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.get(
        "http://localhost:3001/proxy/onyx/download/status",
        {
          headers,
          params: {
            companyCode: query.companyCode,
            downloadType: query.downloadType,
            downloadId: query.downloadId, // pass downloadId if available
          },
        }
      );

      setResponse(res.data);

      // If API returns a downloadId, save it locally
      const downloadIdFromResponse = res.data.response?.downloadId;
      if (downloadIdFromResponse) {
        localStorage.setItem(DOWNLOAD_ID_KEY, downloadIdFromResponse);
        setQuery((prev) => ({ ...prev, downloadId: downloadIdFromResponse }));
      }
    } catch (err) {
      setResponse({
        error: err.response?.data || err.message || "Network error",
      });
    }

    setLoading(false);
  };

  const fileUrl = response?.response?.filePath;

  return (
    <div style={{ padding: "30px", fontFamily: "Segoe UI", maxWidth: "800px", margin: "auto" }}>
      <h1>GSTR-1 / E-Invoice Download Status</h1>
      <p>Auto-populated from previous login, saved session, or last download.</p>

      {/* ---------------- HEADERS ---------------- */}
      <h3>Headers</h3>
      {["companyId", "X-Auth-Token", "product", "Accept"].map((key) => (
        <div key={key} style={{ marginBottom: "12px" }}>
          <label>{key}:</label>
          <input
            type={key === "X-Auth-Token" ? "password" : "text"}
            value={headers[key]}
            onChange={(e) =>
              setHeaders({ ...headers, [key]: e.target.value })
            }
            style={{ width: "100%", padding: "8px", fontFamily: "monospace" }}
          />
        </div>
      ))}

      {/* ---------------- QUERY PARAMETERS ---------------- */}
      <h3>Query Parameters</h3>

      <div style={{ marginBottom: "12px" }}>
        <label>companyCode:</label>
        <input
          type="text"
          value={query.companyCode}
          onChange={(e) =>
            setQuery({ ...query, companyCode: e.target.value })
          }
          style={{ width: "100%", padding: "8px", fontFamily: "monospace" }}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>downloadId:</label>
        <input
          type="text"
          value={query.downloadId}
          onChange={(e) =>
            setQuery({ ...query, downloadId: e.target.value })
          }
          style={{ width: "100%", padding: "8px", fontFamily: "monospace" }}
        />
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label>downloadType:</label>
        <select
          value={query.downloadType}
          onChange={(e) =>
            setQuery({ ...query, downloadType: e.target.value })
          }
          style={{ width: "100%", padding: "8px" }}
        >
          <option value="Dnld_Gstr1">Dnld_Gstr1 (GSTR-1)</option>
          <option value="EINV_DATA">EINV_DATA (E-Invoice)</option>
        </select>
      </div>

      <button
        onClick={checkStatus}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          background: loading ? "#999" : "#1a73e8",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Checking..." : "Check Status"}
      </button>

      {/* ---------------- DOWNLOAD LINK ---------------- */}
      {fileUrl && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#dfffe0",
            borderRadius: "8px",
          }}
        >
          <h3>Download Ready!</h3>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#34a853", fontWeight: "bold", fontSize: "18px" }}
          >
            Click here to download
          </a>
        </div>
      )}

      {/* ---------------- RAW RESPONSE ---------------- */}
      {response && (
        <pre
          style={{
            marginTop: "20px",
            background: "#f4f4f4",
            padding: "12px",
            borderRadius: "6px",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DownloadStatusForm;
