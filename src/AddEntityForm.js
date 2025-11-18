import React, { useState, useEffect } from "react";
import axios from "axios";

const AddEntityForm = ({ previousResponse }) => {
  // formData will auto-populate from previous response if available
  const [formData, setFormData] = useState({
    companyname: "",
    pan: "",
    address: "",
    entitytype: "BUSINESS",
  });

  // headers will auto-populate from previous response or default values
  const [headers, setHeaders] = useState({
    accept: "application/json",
    companyId: "", // auto-populated from previous response
    "X-Auth-Token": "", // auto-populated
    product: "ONYX",
    "Content-Type": "application/json",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-populate formData and headers from previous API response
  useEffect(() => {
    if (previousResponse?.response) {
      // populate headers
      setHeaders((prev) => ({
        ...prev,
        companyId: previousResponse.response.companyid || prev.companyId,
        "X-Auth-Token": previousResponse.authToken || prev["X-Auth-Token"],
        product: previousResponse.product || prev.product,
      }));

      // populate formData with response attributes
      setFormData((prev) => ({
        ...prev,
        ...previousResponse.response,
      }));
    }
  }, [previousResponse]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHeaderChange = (e) => {
    setHeaders({ ...headers, [e.target.name]: e.target.value });
  };

  const addEntity = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.put(
        "https://stage-api.irisgst.com/irisgst/mgmt/company/business",
        formData,
        { headers }
      );

      // Auto-populate formData and headers for next addition
      setFormData((prev) => ({ ...prev, ...response.data.response }));
      setHeaders((prev) => ({
        ...prev,
        companyId: response.data.response.companyid || prev.companyId,
      }));

      setResult(response.data);
    } catch (error) {
      setResult(error.response?.data || { error: "Failed to add entity" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Entity (Root / Legal / Filing / Business)</h2>

      {/* Input Form */}
      {Object.keys(formData).map((key) => {
        if (["authToken", "product", "companyId"].includes(key)) return null;
        return (
          <div key={key} style={{ marginBottom: 8 }}>
            <label style={{ width: 120, display: "inline-block" }}>{key}:</label>
            {key === "entitytype" ? (
              <select name={key} value={formData[key]} onChange={handleChange}>
                <option value="BUSINESS">BUSINESS</option>
                <option value="ROOT">ROOT</option>
                <option value="LEGAL">LEGAL</option>
                <option value="FILING">FILING</option>
              </select>
            ) : (
              <input name={key} value={formData[key] || ""} onChange={handleChange} />
            )}
          </div>
        );
      })}

      <button onClick={addEntity} disabled={loading}>
        {loading ? "Processing..." : "Add Entity"}
      </button>

      <br />
      <br />

      {/* Editable Headers */}
      <h3>📌 Request Headers (Editable):</h3>
      {Object.keys(headers).map((key) => (
        <div key={key} style={{ marginBottom: 6 }}>
          <label style={{ width: 120, display: "inline-block" }}>{key}:</label>
          <input
            name={key}
            value={headers[key]}
            onChange={handleHeaderChange}
            style={{ width: 400 }}
          />
        </div>
      ))}

      {/* Payload Preview */}
      <h3>📌 Request Payload:</h3>
      <pre
        style={{
          background: "#111",
          color: "#0ff",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {JSON.stringify(formData, null, 2)}
      </pre>

      {/* Response */}
      {result && (
        <>
          <h3>📌 Response:</h3>
          <pre
            style={{
              background: "#000",
              color: "#fff",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default AddEntityForm;
