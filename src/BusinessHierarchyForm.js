import React, { useState } from "react";
import axios from "axios";

// Helper to render nested child companies
const renderCompanies = (companies, level = 0) => {
  return companies.map((company, index) => (
    <React.Fragment key={`${company.companyId}-${index}`}>
      <tr>
        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {"—".repeat(level)} {company.entityType}
        </td>
        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {company.companyName || company.companyname}
        </td>
        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {company.roleName}
        </td>
        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {company.companyId || company.id}
        </td>
        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
          {company.gstin || company.pan || "-"}
        </td>
      </tr>
      {company.childCompanies &&
        company.childCompanies.length > 0 &&
        renderCompanies(company.childCompanies, level + 1)}
    </React.Fragment>
  ));
};

const BusinessHierarchyForm = ({ previousResponse }) => {
  /**
   * previousResponse should contain at least:
   * {
   *   companyId: "24",
   *   authToken: "xyz",
   *   product: "ONYX"
   * }
   */

  const [hierarchy, setHierarchy] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-populate headers from previous response
  const companyId = previousResponse?.companyId || "";
  const headers = {
    accept: "application/json",
    companyId: companyId,
    "X-Auth-Token": previousResponse?.authToken || "",
    product: previousResponse?.product || "ONYX",
  };

  // Auto-populate query params
  const queryParams = { companyid: companyId };

  const fetchHierarchy = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.get(
        "https://stage-api.irisgst.com/irisgst/mgmt/company/businesshierarchy",
        {
          headers,
          params: queryParams,
        }
      );

      const data = response.data.response
        ? Array.isArray(response.data.response)
          ? response.data.response
          : [response.data.response]
        : [];

      setHierarchy(data);
      setResult(response.data);
    } catch (error) {
      setHierarchy([]);
      setResult(error.response?.data || { error: "Failed to fetch hierarchy" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Business Hierarchy</h2>

      <button onClick={fetchHierarchy} disabled={loading || !companyId}>
        {loading ? "Loading..." : "Fetch Hierarchy"}
      </button>

      {!companyId && (
        <p style={{ color: "red" }}>
          ⚠ Company ID not available from previous response!
        </p>
      )}

      {/* HEADERS */}
      <h3>📌 Request Headers (Auto-Populated):</h3>
      <pre style={{ background: "#222", color: "#0f0", padding: 10, borderRadius: 5 }}>
        {JSON.stringify(headers, null, 2)}
      </pre>

      {/* QUERY PARAMS */}
      <h3>📌 Query Parameters:</h3>
      <pre style={{ background: "#333", color: "#ff0", padding: 10, borderRadius: 5 }}>
        {JSON.stringify(queryParams, null, 2)}
      </pre>

      {/* RESPONSE */}
      {result && (
        <>
          <h3>📌 Response:</h3>
          <pre style={{ background: "#000", color: "#fff", padding: 10, borderRadius: 5 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}

      {/* TABLE */}
      {hierarchy.length > 0 && (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Entity Type</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Company Name</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Role Name</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Company ID</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>GSTIN / PAN</th>
            </tr>
          </thead>
          <tbody>{renderCompanies(hierarchy)}</tbody>
        </table>
      )}
    </div>
  );
};

export default BusinessHierarchyForm;
