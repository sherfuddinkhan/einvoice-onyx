// DownloadStatusForm.js
import React, { useState, useEffect } from 'react';

const SHARED_STORAGE_KEY = 'iris_gstr1_shared_values';

const DownloadStatusForm = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/download/status',
    companyCode: '',
    downloadType: 'Dnld_Gstr1',
    headers: {
      'Accept': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all values from shared storage
  useEffect(() => {
    const saved = localStorage.getItem(SHARED_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({
          ...prev,
          companyCode: parsed.companyUniqueCode || prev.companyCode,
          headers: {
            ...prev.headers,
            companyId: parsed.companyId || prev.headers.companyId,
            'X-Auth-Token': parsed['X-Auth-Token'] || prev.headers['X-Auth-Token']
          }
        }));
      } catch (e) {
        console.warn('Failed to load shared values');
      }
    }
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    setResponse(null);

    const url = `${config.proxyBase}${config.endpoint}?companyCode=${config.companyCode}&downloadType=${config.downloadType}`;

    try {
      const res = await fetch(url, { headers: config.headers });
      const data = await res.json();
      setResponse({ body: data, time: new Date().toLocaleString('en-IN') });
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fileUrl = response?.body?.response?.filePath;

  return (
    <div style={{ padding: '30px', background: '#e8f5ff', fontFamily: 'Segoe UI', minHeight: '100vh' }}>
      <h1 style={{ color: '#1a73e8' }}>GSTR-1 Download Status</h1>
      <p style={{ color: '#666' }}>Auto-populated from previous download response</p>

      <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
        <h3>Headers (Auto-filled)</h3>
        {['companyId', 'X-Auth-Token'].map(key => (
          <div key={key} style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
            <strong style={{ width: '170px' }}>{key}:</strong>
            <input
              value={config.headers[key] || ''}
              readOnly
              style={{ flex: 1, padding: '10px', fontFamily: 'monospace', background: '#f0f8ff' }}
              type={key.includes('Token') ? 'password' : 'text'}
            />
          </div>
        ))}

        <h3 style={{ marginTop: '25px' }}>Query Params (Auto-filled)</h3>
        <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
          <strong style={{ width: '170px' }}>companyCode:</strong>
          <input
            value={config.companyCode || ''}
            readOnly
            style={{ flex: 1, padding: '10px', fontFamily: 'monospace', background: '#f0f8ff' }}
          />
        </div>

        <button
          onClick={checkStatus}
          disabled={loading}
          style={{
            marginTop: '30px',
            padding: '18px 60px',
            background: loading ? '#999' : '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '22px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Checking...' : 'CHECK STATUS'}
        </button>
      </div>

      {fileUrl && (
        <div style={{ marginTop: '40px', padding: '40px', background: '#e8f5e8', borderRadius: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#34a853' }}>Download Ready!</h2>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer"
            style={{ padding: '20px 60px', background: '#34a853', color: 'white', fontSize: '24px', textDecoration: 'none', borderRadius: '16px', fontWeight: 'bold' }}>
            DOWNLOAD GSTR1 FILE
          </a>
        </div>
      )}

      {response && (
        <pre style={{ marginTop: '25px', background: '#333', color: '#0f0', padding: '20px', borderRadius: '12px' }}>
          {JSON.stringify(response.body || response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DownloadStatusForm;