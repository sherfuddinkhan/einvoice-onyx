import React, { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY = "iris_einvoice_shared_config";

const AddEntityForm = ({ previousResponse }) => {
  // Load saved config first
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

 const initialCompanyCode =
  previousResponse?.response?.companyUniqueCode ||
  savedConfig?.companyUniqueCode ||
  previousResponse?.response?.userGstin ||
  "";

   const initialCompanyName =
  previousResponse?.response?.companyname ||
  savedConfig?.companyname ||
  "";


  // ------------ ---------- FORM DATA ----------------------
  const [formData, setFormData] = useState({
    companyname: " ",
    roleName: "Admin",
    id: "",
   gstinno: "27AAACI9260R1Z4 ",
   parentid: previousResponse?.response?.companyid || savedConfig?.companyId || "",
    state: "",
   "pan": "AHYPN4137B",
    entitytype: "BUSINESS",
    address: "",
    pincode: "",
  });

  // ---------------------- HEADERS ----------------------
  const [headers, setHeaders] = useState({
    companyId:
      previousResponse?.companyId ||
      savedConfig?.companyId ||
      "",
    "X-Auth-Token":
      previousResponse?.token ||
      savedConfig?.token ||
      "",
    product: "ONYX",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-populate headers when previousResponse changes
  useEffect(() => {
    if (previousResponse) {
      setHeaders((prev) => ({
        ...prev,
        companyId: previousResponse.companyId || prev.companyId,
        "X-Auth-Token": previousResponse.token || prev["X-Auth-Token"],
      }));
    }
  }, [previousResponse]);

  // ---------------------- Update Form ----------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHeaderChange = (e) => {
    setHeaders({ ...headers, [e.target.name]: e.target.value });
  };

  // ---------------------- API CALL ----------------------
  const addEntity = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.put(
        "http://localhost:3001/proxy/company/business",
        formData,
        {
          headers: headers,
        }
      );

      setResult(response.data);

      // Save config for future auto-fill
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          companyId: headers.companyId,
          token: headers["X-Auth-Token"],
          companyname: formData.companyname,
          companyUniqueCode: formData.gstinno,
        })
      );
    } catch (error) {
      setResult(
        error.response?.data || {
          error: "Failed to add entity",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- UI ----------------------
  return (
    <div style={{ padding: 20 }}>
      <h2>Add Entity (POB/ Legal / Filing / Business)</h2>

      {/* FORM FIELDS */}
      {Object.keys(formData).map((key) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label style={{ width: 120, display: "inline-block" }}>{key}:</label>

          {key === "entitytype" ? (
            <select name={key} value={formData[key]} onChange={handleChange}>
              <option value="ROOT">POB</option>
              <option value="LEGAL">LEGAL</option>
              <option value="FILING">FILING</option>
              <option value="BUSINESS">BUSINESS</option>
            </select>
          ) : (
            <input
              name={key}
              value={formData[key]}
              onChange={handleChange}
              style={{ width: 300 }}
            />
          )}
        </div>
      ))}

      <button onClick={addEntity} disabled={loading}>
        {loading ? "Processing..." : "Add Entity"}
      </button>

      <h3>Headers</h3>
      {Object.keys(headers).map((key) => (
        <div key={key} style={{ marginBottom: 6 }}>
          <label style={{ width: 120, display: "inline-block" }}>{key}:</label>
          <input
            name={key}
            value={headers[key]}
            onChange={handleHeaderChange}
            style={{ width: 300 }}
          />
        </div>
      ))}

      {result && (
        <>
          <h3>Response</h3>
          <pre
            style={{
              background: "#000",
              color: "#0f0",
              padding: 10,
              borderRadius: 5,
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
