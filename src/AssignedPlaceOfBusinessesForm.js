// AssignedPlaceOfBusinessesForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const AssignedPlaceOfBusinessesForm = ({ authToken, defaultCompanyId }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState(defaultCompanyId || "");
  const [pobList, setPobList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Request headers & payload state
  const [headers, setHeaders] = useState({
    accept: "application/json",
    companyId: defaultCompanyId || "",
    "X-Auth-Token": authToken || "",
    product: "ONYX",
    "Content-Type": "application/json",
  });

  const [payload, setPayload] = useState({
    companyid: defaultCompanyId || "",
  });

  // API response
  const [apiResponse, setApiResponse] = useState(null);

  // Fetch POB list
  const fetchPOBList = async () => {
    if (!payload.companyid) return;

    setLoading(true);
    setError("");
    setApiResponse(null);

    try {
      const response = await axios.get(
        "https://stage-api.irisgst.com/irisgst/mgmt/user/getAssignedPlaceOfBusinesses",
        {
          headers,
          params: payload,
        }
      );

      setApiResponse(response.data);

      if (response.data.status === "SUCCESS") {
        setPobList(response.data.response);
        if (response.data.response.length > 0) {
          setSelectedCompanyId(response.data.response[0].companyId);
        }
      } else {
        setError("Failed to fetch Place of Businesses.");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching Place of Businesses.");
      setApiResponse(err.response ? err.response.data : { error: "Request failed" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (defaultCompanyId) {
      fetchPOBList();
    }
  }, [defaultCompanyId]);

  // Handle form inputs
  const handleHeaderChange = (e) => {
    setHeaders({ ...headers, [e.target.name]: e.target.value });
  };

  const handlePayloadChange = (e) => {
    setPayload({ ...payload, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h3>Assigned Place of Businesses</h3>

      {/* POB Dropdown */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Place of Business:</label>
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          style={{ width: "100%", padding: "10px", fontSize: "16px", marginTop: "5px" }}
        >
          <option value="">-- Select Place of Business --</option>
          {pobList.map((pob) => (
            <option key={pob.companyId} value={pob.companyId}>
              {pob.companyName} ({pob.cmpPincode})
            </option>
          ))}
        </select>
      </div>

      {/* Editable Headers */}
      <div style={{ marginBottom: "20px" }}>
        <h4>📌 Request Headers (Editable)</h4>
        {Object.keys(headers).map((key) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <label>{key}:</label>
            <input
              type="text"
              name={key}
              value={headers[key]}
              onChange={handleHeaderChange}
              style={{ width: "100%", padding: "5px", fontSize: "14px" }}
            />
          </div>
        ))}
      </div>

      {/* Editable Payload */}
      <div style={{ marginBottom: "20px" }}>
        <h4>📌 Request Payload</h4>
        <textarea
          name="companyid"
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => {
            try {
              setPayload(JSON.parse(e.target.value));
            } catch {
              // ignore invalid JSON while typing
            }
          }}
          rows={6}
          style={{ width: "100%", fontFamily: "monospace", fontSize: "14px", padding: "10px" }}
        />
      </div>

      {/* Fetch Button */}
      <button
        onClick={fetchPOBList}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Fetch POBs
      </button>

      {/* API Response */}
      <div style={{ marginTop: "20px" }}>
        <h4>📌 API Response</h4>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre style={{ background: "#f5f5f5", padding: "10px" }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default AssignedPlaceOfBusinessesForm;
