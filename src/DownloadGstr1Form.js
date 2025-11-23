import React, { useState, useEffect } from 'react';

const STORAGE_KEY = "iris_einvoice_shared_config";

// Helper to get current return period (MMYYYY)
const getCurrentPeriod = () => {
  const now = new Date();
  return String(now.getMonth() + 1).padStart(2, '0') + now.getFullYear();
};

const DownloadGstr1Form = ({ previousResponse }) => {
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  // ---------- STATE ----------
  const [headers, setHeaders] = useState({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    companyId: '',          // auto-populated
    'X-Auth-Token': '',     // auto-populated
    product: 'ONYX',
  });

 const [body, setBody] = useState({
  companyUniqueCode: '', // <-- ADD THIS
  gstin: '',
  returnPeriod: getCurrentPeriod(),
});


  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // ---------- AUTO-POPULATE HEADERS AND BODY ----------
  useEffect(() => {
    const autoCompanyId =
      previousResponse?.response?.companyid ||
      savedConfig.companyId ||
      "";

    const autoToken =
      previousResponse?.response?.token ||
      savedConfig.token ||
      "";

    const autoGstin =
      previousResponse?.response?.companyUniqueCode ||
      savedConfig.companyUniqueCode ||
      "";

    setHeaders(prev => ({
      ...prev,
      companyId: autoCompanyId,
      'X-Auth-Token': autoToken,
      product: 'ONYX',
    }));

    setBody(prev => ({
      ...prev,
      gstin: autoGstin,
      companyUniqueCode:autoGstin
    }));

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      companyId: autoCompanyId,
      token: autoToken,
      companyUniqueCode: autoGstin
    }));
  }, [previousResponse]);

  // ---------- HANDLERS ----------
  const handleBodyChange = (key, value) => {
    setBody(prev => ({ ...prev, [key]: value }));
  };

  const handleHeaderChange = (key, value) => {
    setHeaders(prev => ({ ...prev, [key]: value }));
  };

  // ---------- API CALL ----------
  const startDownload = async () => {
    if (!headers.companyId || !headers['X-Auth-Token'] || !body.gstin ||body.companyUniqueCode || !body.returnPeriod) {
      alert('Missing Company ID, Auth Token, GSTIN, or Return Period!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:3001/proxy/download/gstr1', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResult(data);

      if (res.ok && data.status === 'SUCCESS') {
        alert(`GSTR-1 Download Requested!\nCheck IRIS Portal`);
      } else {
        alert(`API Error: ${data.message || 'Unknown response from server.'}`);
      }
    } catch (err) {
      setResult({ error: err.message });
      alert(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isReady = headers.companyId && headers['X-Auth-Token'] && body.gstin && body.returnPeriod;

  // ---------- RENDER ----------
  return (
    <div style={{ padding: '30px', background: '#fff8e1', minHeight: '100vh', fontFamily: 'Segoe UI' }}>
      <h1 style={{ color: '#d32f2f', fontSize: '36px' }}>GSTR-1 Download Request 🇮🇳</h1>
      <p style={{ color: '#666', fontSize: '16px' }}>Headers and GSTIN auto-populated from login or last session.</p>

      <div style={{ background: 'white', padding: '35px', borderRadius: '20px', maxWidth: '900px', margin: '20px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
        
        {/* Headers */}
        <h2>Request Headers</h2>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ margin: '12px 0' }}>
            <strong>{key}:</strong>
            <input
              type={key === 'X-Auth-Token' ? 'password' : 'text'}
              value={value || ''}
              onChange={e => handleHeaderChange(key, e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>
        ))}

        {/* Body */}
        <h2 style={{ marginTop: '20px' }}>Request Body</h2>
        {Object.entries(body).map(([key, value]) => (
          <div key={key} style={{ margin: '12px 0' }}>
            <strong>{key}:</strong>
            <input
              value={value || ''}
              onChange={e => handleBodyChange(key, e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>
        ))}

        {/* Action Button */}
        <button
          onClick={startDownload}
          disabled={!isReady || loading}
          style={{
            width: '100%',
            padding: '24px',
            marginTop: '30px',
            background: !isReady || loading ? '#999' : '#ea4335',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '28px',
            fontWeight: 'bold',
            cursor: !isReady || loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Starting...' : 'START GSTR-1 DOWNLOAD'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <pre style={{ margin: '30px auto', maxWidth: '900px', background: '#1e1e1e', color: '#00e676', padding: '25px', borderRadius: '16px', overflow: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DownloadGstr1Form;
