// AssignedGstinsForm.js - FINAL VERSION WITH AUTOPOPULATION FIXED
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "iris_einvoice_shared_config";

const AssignedGstinsForm = ({ previousResponse }) => {
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  // ================================
  //   INITIAL BLANK STATE
  // ================================
  const [requestConfig, setRequestConfig] = useState({
    proxyBase: "http://localhost:3001/proxy",
    endpoint: "/user/company/filingbusiness", // fixed route
    headers: {
      Accept: "application/json",
      companyId: "",
      "X-Auth-Token": "",
      product: "ONYX",
    },
  });

  const [gstins, setGstins] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================================
  //     AUTOPOPULATE ON FIRST LOAD
  // ================================
  useEffect(() => {
    const autoCompanyId =
      previousResponse?.response?.companyid ||
      savedConfig.companyId ||
      "";

    const autoToken =
      previousResponse?.response?.token ||
      savedConfig.token ||
      "";

    setRequestConfig((prev) => ({
      ...prev,
      headers: {
        ...prev.headers,
        companyId: autoCompanyId,
        "X-Auth-Token": autoToken,
      },
    }));
  }, []); // <-- runs only once, guarantees autopopulation

  // ================================
  //     SAVE TO LOCAL STORAGE
  // ================================
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: requestConfig.headers.companyId,
        token: requestConfig.headers["X-Auth-Token"],
      })
    );
  }, [requestConfig]);

  // UPDATE HEADER FIELD
  const updateHeader = (key, value) => {
    setRequestConfig((prev) => ({
      ...prev,
      headers: { ...prev.headers, [key]: value },
    }));
  };

  // ================================
  //             API CALL
  // ================================
  const sendRequest = async () => {
    setLoading(true);
    setError("");
    setGstins([]);
    setRawResponse(null);

    const { proxyBase, endpoint, headers } = requestConfig;
    const finalURL = `${proxyBase}${endpoint}?companyId=${headers.companyId}`;

    try {
      const res = await fetch(finalURL, {
        method: "GET",
        headers,
      });

      const text = await res.text();
      let json = null;

      try {
        json = JSON.parse(text);
      } catch (e) {}

      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: json || text,
        time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      setRawResponse(responseObj);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      if (json?.status === "SUCCESS" && Array.isArray(json.response)) {
        setGstins(json.response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const finalURL = `${requestConfig.proxyBase}${requestConfig.endpoint}?companyId=${requestConfig.headers.companyId}`;

  // ================================
  //              UI
  // ================================
  return (
    <div style={{ padding: 30, fontFamily: "Arial", background: "#f4f4f4" }}>
      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <h2>Assigned GSTINs (Debug Panel)</h2>

        <b>Request URL:</b>
        <div
          style={{
            background: "#eee",
            padding: 10,
            fontFamily: "monospace",
            marginTop: 6,
            borderRadius: 6,
          }}
        >
          {finalURL}
        </div>

        <h3>Headers</h3>
        {Object.entries(requestConfig.headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label style={{ width: 140, display: "inline-block", fontWeight: "bold" }}>
              {key}:
            </label>
            <input
              type={key === "X-Auth-Token" ? "password" : "text"}
              value={value}
              onChange={(e) => updateHeader(key, e.target.value)}
              style={{ width: 300, padding: 8 }}
            />
          </div>
        ))}

        <button
          onClick={sendRequest}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          {loading ? "Loading..." : "Send Request"}
        </button>
      </div>

      {rawResponse && (
        <div style={{ background: "#fff8e1", padding: 20, marginTop: 20, borderRadius: 10 }}>
          <h3>Raw Response</h3>
          <pre
            style={{
              background: "#222",
              color: "#0f0",
              padding: 15,
              borderRadius: 6,
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ background: "#ffcdd2", color: "#b71c1c", padding: 12, marginTop: 20 }}>
          <b>Error:</b> {error}
        </div>
      )}

      {gstins.length > 0 && (
        <div style={{ background: "white", padding: 20, marginTop: 20, borderRadius: 10 }}>
          <h3>Assigned GSTINs ({gstins.length})</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#4caf50", color: "white" }}>
              <tr>
                <th style={{ padding: 10 }}>Company Name</th>
                <th style={{ padding: 10 }}>GSTIN</th>
                <th style={{ padding: 10 }}>Role</th>
                <th style={{ padding: 10 }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {gstins.map((g) => (
                <tr key={g.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: 10 }}>{g.companyname}</td>
                  <td style={{ padding: 10, fontFamily: "monospace" }}>
                    {g.gstin || g.gstinno}
                  </td>
                  <td style={{ padding: 10 }}>{g.roleName}</td>
                  <td style={{ padding: 10 }}>{g.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedGstinsForm;
