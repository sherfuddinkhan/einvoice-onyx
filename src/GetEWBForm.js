// src/components/GetEWBForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GetEWBForm = () => {
  const { authToken, lastIrn, lastUserGstin } = useAuth();

  const [irn, setIrn] = useState(lastIrn || '');
  const [userGstin, setUserGstin] = useState(lastUserGstin || '');
  const [updateFlag, setUpdateFlag] = useState(true);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (lastIrn) setIrn(lastIrn);
    if (lastUserGstin) setUserGstin(lastUserGstin);
  }, [lastIrn, lastUserGstin]);

  // Build proxy URL with query params
  const proxyUrl = `http://localhost:3001/proxy/irn/getEwbByIrn?` +
    `irn=${encodeURIComponent(irn)}&` +
    `userGstin=${encodeURIComponent(userGstin)}&` +
    `updateFlag=${updateFlag}`;

  const headers = {
    'Accept': 'application/json',
    'X-Auth-Token': authToken || 'Not logged in',
    'companyId': '24',
    'product': 'ONYX',
    'userGstin': userGstin,
    'irn': irn,
    'updateFlag': updateFlag.toString(),
  };

  const handleFetch = async () => {
    if (!authToken) return alert('Login first!');
    if (!irn || !userGstin) return alert('IRN and User GSTIN required');

    console.log('Sending to:', proxyUrl); // DEBUG
    console.log('Headers:', headers); // DEBUG

    setResponse(null);
    try {
      const res = await fetch(proxyUrl, {
        method: 'GET',
        headers,
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setResponse({ error: 'Network error' });
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#34495e', marginBottom: '24px' }}>Get E-Way Bill by IRN</h2>

      <div style={inputGrid}>
        <Input label="IRN" value={irn} onChange={setIrn} placeholder="e.g. 6eefd4c593d1..." />
        <Input label="User GSTIN" value={userGstin} onChange={setUserGstin} placeholder="e.g. 01AAACI9260R002" />
        <label style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
          <input type="checkbox" checked={updateFlag} onChange={e => setUpdateFlag(e.target.checked)} style={{ marginRight: '8px' }} />
          <span>Update Flag</span>
        </label>
      </div>

      <button onClick={handleFetch} disabled={!authToken || !irn || !userGstin} style={buttonStyle(!authToken || !irn || !userGstin)}>
        Fetch E-Way Bill
      </button>

      <Section title="Request URL (Proxy)">
        <pre style={codeStyle}>{proxyUrl}</pre>
      </Section>

      <Section title="Request Headers">
        <pre style={codeStyle}>{JSON.stringify(headers, null, 2)}</pre>
      </Section>

      <Section title="Request Body">
        <pre style={codeStyle}>{"{}"}</pre>
        <small style={{ color: '#7f8c8d' }}>No request body</small>
      </Section>

      {response && (
        <Section title="API Response" style={{ backgroundColor: '#eaecee' }}>
          <pre style={codeStyle}>{JSON.stringify(response, null, 2)}</pre>
        </Section>
      )}
    </div>
  );
};

// ... (Input, Section, styles same as before)
const Input = ({ label, value, onChange, placeholder }) => (
  <label style={{ display: 'block', marginBottom: 12 }}>
    <span style={{ display: 'inline-block', width: 130, fontWeight: 600 }}>{label}:</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
  </label>
);

const Section = ({ title, children, style }) => (
  <div style={{ ...sectionStyle, ...style }}>
    <strong style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>{title}:</strong>
    {children}
  </div>
);

const containerStyle = { maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' };
const inputGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 };
const inputStyle = { width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' };
const buttonStyle = disabled => ({
  padding: '12px 28px',
  backgroundColor: disabled ? '#ccc' : '#34495e',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '15px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  marginBottom: '24px',
});
const sectionStyle = { marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' };
const codeStyle = { background: '#fff', padding: '14px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', border: '1px solid #ddd', margin: 0 };

export default GetEWBForm;