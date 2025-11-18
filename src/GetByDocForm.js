// src/components/GetByDocForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GetByDocForm = () => {
  const {
    authToken,
    lastDocNo,
    lastUserGstin,
    lastDocDate,
    lastDocType,
  } = useAuth();

  // Auto-fill from last generated invoice
  const [docNum, setDocNum] = useState(lastDocNo || '');
  const [docType, setDocType] = useState(lastDocType || 'RI');
  const [userGstin, setUserGstin] = useState(lastUserGstin || '');
  const [docDate, setDocDate] = useState(lastDocDate || '');
  const [response, setResponse] = useState(null);

  // Keep in sync with context
  useEffect(() => {
    if (lastDocNo) setDocNum(lastDocNo);
    if (lastDocType) setDocType(lastDocType);
    if (lastUserGstin) setUserGstin(lastUserGstin);
    if (lastDocDate) setDocDate(lastDocDate);
  }, [lastDocNo, lastDocType, lastUserGstin, lastDocDate]);

  // -----------------------------------------------------------------
  // 1. Build EXACT URL
  // -----------------------------------------------------------------
  const baseUrl = 'https://stage-api.irisgst.com/irisgst/onyx/irn/getIrnByDocDetails';
  const url = `${baseUrl}?` +
    `docNum=${encodeURIComponent(docNum)}&` +
    `docType=${encodeURIComponent(docType)}&` +
    `userGstin=${encodeURIComponent(userGstin)}&` +
    `docDate=${encodeURIComponent(docDate.replace(/-/g, '/'))}`; // 11-11-2025 → 11/11/2025

  // -----------------------------------------------------------------
  // 2. Headers (as required)
  // -----------------------------------------------------------------
  const headers = {
    'X-Auth-Token': authToken || 'Not logged in',
    //accept: application/json,
    companyId: '24',
    product: 'ONYX',
  };

  // -----------------------------------------------------------------
  // 3. Request Payload (for display)
  // -----------------------------------------------------------------
  const requestPayload = {
    queryParams: {
      docNum,
      docType,
      userGstin,
      docDate: docDate.replace(/-/g, '/'),
    },
    headers,
  };

  // -----------------------------------------------------------------
  // 4. Fetch
  // -----------------------------------------------------------------
  const handleFetch = async () => {
    if (!authToken) return alert('Login first!');
    if (!docNum || !userGstin || !docDate || !docType) return alert('Fill all fields');

    setResponse(null);
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: 'Network error' });
    }
  };

  // -----------------------------------------------------------------
  // 5. UI
  // -----------------------------------------------------------------
  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#8e44ad', marginBottom: '24px' }}>
        Get IRN by Document Details
      </h2>

      {/* Input Fields */}
      <div style={inputGrid}>
        <Input label="Document No" value={docNum} onChange={setDocNum} placeholder="e.g. AG/11-11/9939" />
        <Input label="User GSTIN" value={userGstin} onChange={setUserGstin} placeholder="e.g. 01AAACI9260R002" />
        <Input label="Doc Date (DD-MM-YYYY)" value={docDate} onChange={setDocDate} placeholder="e.g. 11-11-2025" />
        <select value={docType} onChange={e => setDocType(e.target.value)} style={selectStyle}>
          <option value="RI">RI</option>
          <option value="INV">INV</option>
        </select>
      </div>

      <button
        onClick={handleFetch}
        disabled={!authToken || !docNum || !userGstin || !docDate}
        style={buttonStyle(!authToken || !docNum || !userGstin || !docDate)}
      >
        Fetch IRN
      </button>

      {/* URL */}
      <Section title="Request URL">
        <pre style={codeStyle}>{url}</pre>
      </Section>

      {/* Headers */}
      <Section title="Request Headers">
        <pre style={codeStyle}>{JSON.stringify(headers, null, 2)}</pre>
      </Section>

      {/* Payload */}
      <Section title="Request Payload (Query + Headers)">
        <pre style={codeStyle}>{JSON.stringify(requestPayload, null, 2)}</pre>
      </Section>

      {/* Response */}
      {response && (
        <Section title="API Response" style={{ backgroundColor: '#f4ecf7' }}>
          <pre style={codeStyle}>{JSON.stringify(response, null, 2)}</pre>
        </Section>
      )}
    </div>
  );
};

// -----------------------------------------------------------------
// UI Components
// -----------------------------------------------------------------
const Input = ({ label, value, onChange, placeholder }) => (
  <label style={{ display: 'block', marginBottom: 12 }}>
    <span style={{ display: 'inline-block', width: 150, fontWeight: 600 }}>{label}:</span>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  </label>
);

const Section = ({ title, children, style }) => (
  <div style={{ ...sectionStyle, ...style }}>
    <strong style={{ display: 'block', marginBottom: '8px', color: '#8e44ad' }}>
      {title}:
    </strong>
    {children}
  </div>
);

// -----------------------------------------------------------------
// Styles
// -----------------------------------------------------------------
const containerStyle = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: 24,
  fontFamily: 'sans-serif',
};

const inputGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  marginBottom: 24,
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '14px',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const selectStyle = {
  ...inputStyle,
  height: '40px',
  marginTop: '28px',
};

const buttonStyle = (disabled) => ({
  padding: '12px 28px',
  backgroundColor: disabled ? '#ccc' : '#9b59b6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '15px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginBottom: '24px',
});

const sectionStyle = {
  marginBottom: '20px',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
};

const codeStyle = {
  background: '#fff',
  padding: '14px',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '13px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  border: '1px solid #ddd',
  margin: 0,
};

export default GetByDocForm;