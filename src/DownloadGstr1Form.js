// DownloadGstr1Form.js - Auto-Populates from Previous Responses
import React, { useState, useEffect } from 'react';

const SHARED_STORAGE_KEY = 'iris_gstr1_shared_values';

const DownloadGstr1Form = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/download/gstr1',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    },
    body: {
      companyUniqueCode: '',
      gstin: '',
      returnPeriod: '112025'
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load values from shared storage (populated from previous responses)
  useEffect(() => {
    const saved = localStorage.getItem(SHARED_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({
          ...prev,
          headers: {
            ...prev.headers,
            companyId: parsed.companyId || prev.headers.companyId,
            'X-Auth-Token': parsed['X-Auth-Token'] || prev.headers['X-Auth-Token']
          },
          body: {
            ...prev.body,
            companyUniqueCode: parsed.companyUniqueCode || prev.body.companyUniqueCode,
            gstin: parsed.gstin || prev.body.gstin
          }
        }));
      } catch (e) {
        console.warn('Failed to load shared values');
      }
    }
  }, []);

  // Save successful values after response
  const handleSuccess = (resp) => {
    if (resp.body.status === 'SUCCESS') {
      const valuesToSave = {
        companyId: config.headers.companyId,
        'X-Auth-Token': config.headers['X-Auth-Token'],
        companyUniqueCode: config.body.companyUniqueCode,
        gstin: config.body.gstin
      };
      localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(valuesToSave));
    }
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${config.proxyBase}${config.endpoint}`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(config.body),
      });

      const data = await res.json();
      const resp = { status: res.status, body: data, time: new Date().toLocaleString('en-IN') };
      setResponse(resp);
      handleSuccess(resp);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#fff8e1', fontFamily: 'Segoe UI', minHeight: '100vh' }}>
      <h1 style={{ color: '#d32f2f' }}>GSTR-1 Download Request</h1>
      <p style={{ color: '#666' }}>All values auto-populated from previous successful responses</p>

      <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
        <h3>Headers (Auto-filled)</h3>
        {['companyId', 'X-Auth-Token'].map(key => (
          <div key={key} style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
            <strong style={{ width: '170px' }}>{key}:</strong>
            <input
              value={config.headers[key] || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                headers: { ...prev.headers, [key]: e.target.value }
              }))}
              style={{ flex: 1, padding: '10px', fontFamily: 'monospace' }}
              type={key.includes('Token') ? 'password' : 'text'}
            />
          </div>
        ))}

        <h3 style={{ marginTop: '25px' }}>Request Body (Auto-filled)</h3>
        {['companyUniqueCode', 'gstin'].map(key => (
          <div key={key} style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
            <strong style={{ width: '170px' }}>{key}:</strong>
            <input
              value={config.body[key] || ''}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                body: { ...prev.body, [key]: e.target.value }
              }))}
              style={{ flex: 1, padding: '10px', fontFamily: 'monospace', background: '#fff8e1' }}
            />
          </div>
        ))}

        <button
          onClick={sendRequest}
          disabled={loading}
          style={{
            marginTop: '30px',
            padding: '18px 60px',
            background: loading ? '#999' : '#ea4335',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '22px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Starting...' : 'START DOWNLOAD'}
        </button>
      </div>

      {response && (
        <pre style={{ marginTop: '25px', background: '#333', color: '#0f0', padding: '20px', borderRadius: '12px' }}>
          {JSON.stringify(response.body || response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DownloadGstr1Form;