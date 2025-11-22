import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_gstr1_shared_config';

const DownloadGstr1Form = ({ loginResponse }) => {
  const saved = localStorage.getItem(STORAGE_KEY);

  const getCurrentPeriod = () => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, '0') + now.getFullYear();
  };

  // --- State Initialization ---
  const [config, setConfig] = useState({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      companyId: '',
      'X-Auth-Token': '',
      product: 'ONYX',
    },
    body: {
      gstin: '',
      returnPeriod: getCurrentPeriod(),
    },
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showToken, setShowToken] = useState(false);

  // --- Auto-populate headers and body ---
  useEffect(() => {
    let companyId = '';
    let token = '';
    let product = 'ONYX';
    let gstin = '';

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        companyId = parsed.companyId || '';
        token = parsed.token || '';
        gstin = parsed.gstin || '';
      } catch {}
    }

    if (loginResponse?.response) {
      const resp = loginResponse.response;
      companyId = resp.companyid || resp.rootCompanyid || companyId;
      token = resp.token || token;
      product = resp.products?.includes('ONYX') ? 'ONYX' : product;
    }

    setConfig(prev => ({
      headers: { ...prev.headers, companyId, 'X-Auth-Token': token, product },
      body: { ...prev.body, gstin },
    }));

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ companyId, token, gstin })
    );
  }, [loginResponse]);

  // --- Generic input handler ---
  const handleBodyChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      body: { ...prev.body, [key]: value },
    }));
  };

  // --- Save to storage ---
  const saveToStorage = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: config.headers.companyId,
        token: config.headers['X-Auth-Token'],
        gstin: config.body.gstin,
      })
    );
  };

  // --- API Call ---
  const startDownload = async () => {
    const { headers, body } = config;
    if (!body.gstin || !headers.companyId || !headers['X-Auth-Token']) {
      alert('GSTIN, Company ID, or Auth Token missing!');
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

      if (res.ok && (data.status === 'SUCCESS' || data.response?.downloadId)) {
        saveToStorage();
        alert(
          `GSTR-1 Download Started!\nDownload ID: ${data.response?.downloadId || 'Check IRIS Portal'}`
        );
      } else if (!res.ok) {
        alert(`API Error: ${data.message || 'Unknown response from server.'}`);
      }
    } catch (err) {
      setResult({ error: err.message });
      alert(`Network/Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isReady =
    config.headers.companyId && config.headers['X-Auth-Token'] && config.body.gstin;

  // --- Render ---
  return (
    <div style={{ padding: '30px', background: '#fff8e1', minHeight: '100vh', fontFamily: 'Segoe UI' }}>
      <h1 style={{ color: '#d32f2f', fontSize: '36px' }}>GSTR-1 Download Request 🇮🇳</h1>
      <p style={{ color: '#666', fontSize: '16px' }}>Headers and GSTIN auto-populated from login response or last session.</p>

      <div style={{ background: 'white', padding: '35px', borderRadius: '20px', maxWidth: '900px', margin: '20px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
        
        {/* Headers Preview */}
        <h2 style={{ color: '#d84315', borderBottom: '3px solid #ff8a65', paddingBottom: '10px' }}>Request Headers</h2>
        <pre style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', fontFamily: 'monospace', margin: '20px 0', border: '2px solid #ff8a65' }}>
          {JSON.stringify(config.headers, null, 2)}
        </pre>

        {/* Body Preview */}
        <h2 style={{ color: '#d84315', borderBottom: '3px solid #ff8a65', paddingBottom: '10px', marginTop: '30px' }}>Request Body</h2>
        <pre style={{ background: '#263238', color: '#00e676', padding: '20px', borderRadius: '12px', fontFamily: 'monospace', margin: '20px 0', border: '2px solid #ff8a65' }}>
          {JSON.stringify(config.body, null, 2)}
        </pre>

        {/* Editable Fields */}
        <h2 style={{ color: '#e65100', marginTop: '30px' }}>Edit Request Details</h2>
        {Object.entries(config.body).map(([key, value]) => (
          <div key={key} style={{ margin: '12px 0' }}>
            <strong>{key}:</strong>
            <input
              value={value ?? ''}
              onChange={e => handleBodyChange(key, e.target.value)}
              placeholder={key}
              style={{ width: '100%', padding: '12px', marginTop: '4px', borderRadius: '8px', border: '2px solid #ffb74d', fontFamily: 'monospace' }}
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
        <pre style={{ margin: '30px auto', maxWidth: '900px', background: '#1e1e1e', color: '#00e676', padding: '25px', borderRadius: '16px', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DownloadGstr1Form;
