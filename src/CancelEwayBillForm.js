// CancelEwayBillForm.js (your original)
import React, { useState } from "react";
import axios from "axios";

const CancelEwayBillForm = () => {
  const [data, setData] = useState({
    ewbNo: "",
    cnlRsn: "",
    cnlRem: "",
    userGstin: "",
  });
  const [responseData, setResponseData] = useState(null);

  const cancelEWB = async () => {
    try {
      const response = await axios.put(
        "http://localhost:3001/proxy/irn/cancelEwb",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": localStorage.getItem("token"),
            companyId: "24",
            product: "ONYX",
          },
        }
      );
      setResponseData(response.data);
    } catch (error) {
      setResponseData(error.response?.data || { error: "Failed to cancel EWB" });
    }
  };

  return (
    <div style={{ margin: "20px", fontFamily: "Arial" }}>
      <h2>Cancel E-Way Bill</h2>
      <input
        placeholder="EWB Number"
        onChange={(e) => setData({ ...data, ewbNo: e.target.value })}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <select
        onChange={(e) => setData({ ...data, cnlRsn: e.target.value })}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      >
        <option value="">Select Reason</option>
        <option value="1">Duplicate</option>
        <option value="2">Data Entry Mistake</option>
        <option value="3">Order Cancelled</option>
        <option value="4">Others</option>
      </select>
      <input
        placeholder="Cancel Remarks"
        onChange={(e) => setData({ ...data, cnlRem: e.target.value })}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <input
        placeholder="User GSTIN"
        onChange={(e) => setData({ ...data, userGstin: e.target.value })}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <button onClick={cancelEWB} style={{ marginTop: "10px", padding: "8px 16px" }}>
        Cancel EWB
      </button>
      {responseData && (
        <pre style={{ background: "#f4f4f4", padding: "10px", marginTop: "10px" }}>
          {JSON.stringify(responseData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CancelEwayBillForm;