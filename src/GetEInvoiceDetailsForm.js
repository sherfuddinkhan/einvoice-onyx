// GetEInvoiceDetailsForm.js
import React, { useState } from "react";
import axios from "axios";

const GetEInvoiceDetailsForm = () => {
  const [einvId, setEinvId] = useState("");
  const [responseData, setResponseData] = useState(null);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/proxy/einvoice/details",
        {
          params: { einvId },
          headers: {
            "X-Auth-Token": localStorage.getItem("token"),
            companyId: "24",
            product: "ONYX",
          },
        }
      );
      setResponseData(response.data);
    } catch (error) {
      setResponseData(
        error.response?.data || { error: "Failed to fetch invoice details" }
      );
    }
  };

  return (
    <div style={{ margin: "20px", fontFamily: "Arial" }}>
      <h2>Get E-Invoice Details</h2>
      <input
        placeholder="E-Invoice ID (e.g., 714847)"
        value={einvId}
        onChange={(e) => setEinvId(e.target.value)}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <button onClick={fetchDetails} style={{ marginTop: "10px", padding: "8px 16px" }}>
        Fetch Details
      </button>
      {responseData && (
        <pre style={{ background: "#f4f4f4", padding: "10px", marginTop: "10px", maxHeight: "500px", overflow: "auto" }}>
          {JSON.stringify(responseData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default GetEInvoiceDetailsForm;