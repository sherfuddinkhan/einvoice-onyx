// src/components/UploadErrors.js
import React, { useState } from "react";
import { getUploadErrors } from "./api/onyxApi";


const UploadErrors = () => {
  const [uploadId, setUploadId] = useState(
    localStorage.getItem("lastUploadId") || ""
  );
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [result, setResult] = useState(null);

  const handleFetch = async () => {
    try {
      const response = await getUploadErrors(uploadId, page, size);
      setResult(response.data);
    } catch (e) {
      setResult(e.response?.data || { error: "Fetching errors failed" });
    }
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ddd", marginTop: 20 }}>
      <h2>Upload Errors</h2>

      <input
        type="text"
        value={uploadId}
        onChange={(e) => setUploadId(e.target.value)}
        placeholder="Upload ID"
      />

      <br /><br />

      <label>Page:</label>
      <input
        type="number"
        value={page}
        onChange={(e) => setPage(e.target.value)}
        min="0"
      />

      <label>Size:</label>
      <input
        type="number"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        min="1"
      />

      <br /><br />

      <button onClick={handleFetch}>Fetch Errors</button>

      {result && (
        <pre style={{ background: "#eee", padding: 10, marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default UploadErrors;
