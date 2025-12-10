// AddBusinessForm.js
import React, { useState } from "react";
import axios from "axios";

const AddBusinessForm = () => {
  const [formData, setFormData] = useState({
    companyname: "",
    roleName: "Generator",
    id: "",
    gstinno: "",
    parentid: "24",
    state: "1",
    entitytype: "FILING",
    address: "",
    pincode: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Headers to show on UI
  const headers = {
    accept: "application/json",
    companyId: "24",
    "X-Auth-Token":
      "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhdGVlcUBjYWxpYnJlY3VlLmNvbSIsImNyZWF0ZWQiOjE3NjMwMjM2MTA0NjcsIm5hbWUiOiJBdGVlcSIsImV4cCI6MTc2MzExMDAxMH0.DK43Z5gxto5n7ufRiOiEOIw3j1UdF2AEYKRdBNTcV03P7-Pcd_rr-xmmu4uTw5cdJwoOPdZtzF117EjXR7MbIw",
    product: "ONYX",
    "Content-Type": "application/json",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addBusiness = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.put(
        "https://stage-api.irisgst.com/irisgst/mgmt/company/business",
        formData,
        { headers }
      );

      setResult(response.data);
    } catch (error) {
      setResult(error.response?.data || { error: "Failed to add business" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Root / Legal / Filing Business</h2>

      {/* FORM */}
      <div>
        <label>Company Name:</label>
        <input
          name="companyname"
          value={formData.companyname}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Role Name:</label>
        <input
          name="roleName"
          value={formData.roleName}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>ID:</label>
        <input name="id" value={formData.id} onChange={handleChange} />
      </div>

      <div>
        <label>GSTIN No:</label>
        <input
          name="gstinno"
          value={formData.gstinno}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Parent ID:</label>
        <input
          name="parentid"
          value={formData.parentid}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>State:</label>
        <input
          name="state"
          value={formData.state}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Entity Type:</label>
        <input
          name="entitytype"
          value={formData.entitytype}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Address:</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Pincode:</label>
        <input
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
        />
      </div>

      <button onClick={addBusiness} disabled={loading}>
        {loading ? "Adding..." : "Add Business"}
      </button>

      <br />
      <br />

      {/* ------------ HEADERS PREVIEW ----------- */}
      <h3>📌 Request Headers:</h3>
      <pre
        style={{
          background: "#222",
          color: "#0f0",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {JSON.stringify(headers, null, 2)}
      </pre>

      {/* ------------ PAYLOAD PREVIEW ----------- */}
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

      {/* ------------ RESPONSE VIEW ----------- */}
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

export default AddBusinessForm;
