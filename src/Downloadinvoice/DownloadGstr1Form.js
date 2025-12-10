import React, { useState, useEffect } from "react";

const STORAGE_KEY = "iris_einvoice_shared_config";

// ---------- Helper ----------
const getCurrentPeriod = () => {
  const now = new Date();
  return String(now.getMonth() + 1).padStart(2, "0") + now.getFullYear();
};

const DownloadGstr1Form = ({ previousResponse }) => {
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  // ---------- STATE ----------
  const [headers, setHeaders] = useState({
    Accept: "application/json",
    "Content-Type": "application/json",
    companyId: "",
    "X-Auth-Token": "",
    product: "ONYX",
  });

  const [body, setBody] = useState({
    gstin: "",
    companyUniqueCode: "",
    returnPeriod: getCurrentPeriod(),
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ---------- AUTO POPULATE ----------
  useEffect(() => {
    const autoCompanyId =
      previousResponse?.response?.companyid ||
      savedConfig.companyId ||
      "";

    const autoToken =
      previousResponse?.response?.token ||
      savedConfig.token ||
      "";

    const autoGstin =
      previousResponse?.response?.companyUniqueCode ||
      savedConfig.companyUniqueCode ||
      "";

    setHeaders((prev) => ({
      ...prev,
      companyId: autoCompanyId,
      "X-Auth-Token": autoToken,
    }));

    setBody((prev) => ({
      ...prev,
      gstin: autoGstin,
      companyUniqueCode: autoGstin,
    }));

    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: autoCompanyId,
        token: autoToken,
        companyUniqueCode: autoGstin,
      })
    );
  }, [previousResponse]);

  // ---------- HANDLERS ----------
  const handleBodyChange = (key, value) => {
    setBody((prev) => ({ ...prev, [key]: value }));
  };

  const handleHeaderChange = (key, value) => {
    setHeaders((prev) => ({ ...prev, [key]: value }));
  };

  // ---------- VALIDATION ----------
  const isReady =
    headers.companyId &&
    headers["X-Auth-Token"] &&
    body.gstin &&
    body.companyUniqueCode &&
    body.returnPeriod;

  // ---------- API CALL ----------
  const startDownload = async () => {
    if (!isReady) {
      alert("Missing required fields!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:3001/proxy/onyx/download/gstr1", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "companyId": headers.companyId,
          "X-Auth-Token": headers["X-Auth-Token"],
          "product": "ONYX",
        },
        body: JSON.stringify(body),
      });

      // Try to parse JSON response
      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Server returned HTML instead of JSON", raw: text };
      }

      setResult(data);

      if (res.ok && data.status === "SUCCESS") {
        alert("GSTR-1 Download Requested!");
      } else {
        alert("API Error: " + (data.message || "Unexpected response"));
      }
    } catch (err) {
      setResult({ error: err.message });
      alert("Network Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div
      style={{
        padding: "30px",
        background: "#fff8e1",
        minHeight: "100vh",
        fontFamily: "Segoe UI",
      }}
    >
      <h1 style={{ color: "#d32f2f", fontSize: "36px" }}>
        GSTR-1 Download Request 🇮🇳
      </h1>

      <p style={{ color: "#666", fontSize: "16px" }}>
        Headers and GSTIN auto-populated from login / previous session.
      </p>

      <div
        style={{
          background: "white",
          padding: "35px",
          borderRadius: "20px",
          maxWidth: "900px",
          margin: "20px auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* HEADERS */}
        <h2>Request Headers</h2>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ margin: "12px 0" }}>
            <strong>{key}:</strong>
            <input
              type={key === "X-Auth-Token" ? "password" : "text"}
              value={value || ""}
              onChange={(e) => handleHeaderChange(key, e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}

        {/* BODY */}
        <h2 style={{ marginTop: "20px" }}>Request Body</h2>
        {Object.entries(body).map(([key, value]) => (
          <div key={key} style={{ margin: "12px 0" }}>
            <strong>{key}:</strong>
            <input
              value={value || ""}
              onChange={(e) => handleBodyChange(key, e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}

        {/* BUTTON */}
        <button
          onClick={startDownload}
          disabled={!isReady || loading}
          style={{
            width: "100%",
            padding: "24px",
            marginTop: "30px",
            background: !isReady || loading ? "#999" : "#ea4335",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "28px",
            fontWeight: "bold",
            cursor: !isReady || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Starting..." : "START GSTR-1 DOWNLOAD"}
        </button>
      </div>

      {result && (
        <pre
          style={{
            margin: "30px auto",
            maxWidth: "900px",
            background: "#1e1e1e",
            color: "#00e676",
            padding: "25px",
            borderRadius: "16px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DownloadGstr1Form;
