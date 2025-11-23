// BusinessHierarchyForm.js
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "iris_einvoice_shared_config";

const BusinessHierarchyForm = ({ loginResponse }) => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  const [config, setConfig] = useState({
    proxyBase: "http://localhost:3001/proxy",
    endpoint: "/company/businesshierarchy", // <-- proxy endpoint

    headers: {
      Accept: "application/json",
      companyId: loginResponse?.companyId || saved?.companyId || "",
      "X-Auth-Token": loginResponse?.token || saved?.token || "",
      product: "ONYX",
    },
    queryCompanyId: loginResponse?.companyId || saved?.companyId || "",
  });

  const [rawResponse, setRawResponse] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-save headers to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: config.headers.companyId,
        token: config.headers["X-Auth-Token"],
      })
    );
  }, [config]);

  const updateHeader = (key, value) =>
    setConfig((prev) => ({
      ...prev,
      headers: { ...prev.headers, [key]: value },
    }));

  const updateQuery = (value) =>
    setConfig((prev) => ({ ...prev, queryCompanyId: value }));

  // API call via proxy
  const sendRequest = async () => {
    setLoading(true);
    setError("");
    setBusinessData(null);
    setRawResponse(null);

    const finalURL = `${config.proxyBase}${config.endpoint}?companyid=${config.queryCompanyId}`;

    try {
      const res = await fetch(finalURL, {
        method: "GET",
        headers: config.headers,
      });

      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (_) {}

      setRawResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: json || text,
        time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });

      if (res.ok && json?.status === "SUCCESS") {
        setBusinessData(json.response);
      } else {
        setError(json?.message || "Invalid Response");
      }
    } catch (err) {
      setError(err.message || "Request Failed");
    } finally {
      setLoading(false);
    }
  };

  const finalURL = `${config.proxyBase}${config.endpoint}?companyid=${config.queryCompanyId}`;

  const renderCompanyNode = (company) => (
    <li style={{ margin: "10px 0" }}>
      <div style={{ fontWeight: "bold" }}>
        {company.companyName} ({company.entityType})
      </div>
      <div>Company ID: {company.companyId}</div>
      {company.gstin && <div>GSTIN: {company.gstin}</div>}
      {company.pobCode && <div>POB Code: {company.pobCode}</div>}
      {company.childCompanies && company.childCompanies.length > 0 && (
        <ul style={{ marginLeft: 20 }}>
          {company.childCompanies.map((child) => renderCompanyNode(child))}
        </ul>
      )}
    </li>
  );

  return (
    <div style={{ padding: 30, fontFamily: "Arial", background: "#f4f4f4" }}>
      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <h2>Business Hierarchy (Debug Panel)</h2>

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

        <h3>Query Parameter</h3>
        <label>companyid (query):</label>
        <input
          value={config.queryCompanyId}
          onChange={(e) => updateQuery(e.target.value)}
          style={{ padding: 8, marginLeft: 10, width: 200 }}
        />

        <h3>Headers</h3>
        {Object.entries(config.headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label
              style={{
                width: 140,
                display: "inline-block",
                fontWeight: "bold",
              }}
            >
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
        <div
          style={{
            background: "#fff8e1",
            padding: 20,
            marginTop: 20,
            borderRadius: 10,
          }}
        >
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
        <div
          style={{
            background: "#ffcdd2",
            padding: 12,
            marginTop: 20,
            color: "#b71c1c",
          }}
        >
          {error}
        </div>
      )}

      {businessData && (
        <div
          style={{
            background: "white",
            padding: 20,
            marginTop: 20,
            borderRadius: 10,
          }}
        >
          <h3>Business Hierarchy Tree</h3>
          <ul>{renderCompanyNode(businessData)}</ul>
        </div>
      )}
    </div>
  );
};

export default BusinessHierarchyForm;
