import React, { useState, useEffect } from 'react';

const SHARED_STORAGE_KEY = 'iris_gstr1_shared_values';

const DownloadStatusForm = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/onyx/download/status',
    companyCode: '',
    downloadType: 'Dnld_Gstr1',
    headers: {
      Accept: 'application/json',
      companyId: '',
      'X-Auth-Token': '',
      product: 'ONYX'
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved values from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SHARED_STORAGE_KEY);
    let companyId = 'TEST_COMPANY';
    let token = 'TEST_TOKEN';

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.parsed("saved items",parsed)
        companyId = parsed?.CompanyId || companyId;
        token = parsed?.Token || token;
      } catch (e) {
        console.warn('Failed to parse shared storage:', e);
      }
    } else {
      console.warn('No shared storage found for GSTR-1. Using fallback values.');
    }

    setConfig(prev => ({
      ...prev,
      companyCode: companyId,
      headers: {
        ...prev.headers,
        companyId,
        'X-Auth-Token': token
      }
    }));
  }, []);

  const handleDownloadTypeChange = (e) => {
    setConfig(prev => ({ ...prev, downloadType: e.target.value }));
  };

  const checkStatus = async () => {
    if (!config.companyCode) {
      alert('Company code is missing!');
      return;
    }

    setLoading(true);
    setResponse(null);

    const url = `${config.proxyBase}${config.endpoint}?companyCode=${config.companyCode}&downloadType=${config.downloadType}`;

    try {
      const res = await fetch(url, { headers: config.headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
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
      <h1 style={{ color: '#1a73e8' }}>Download Status</h1>
      <p style={{ color: '#666' }}>Fill headers and query parameters</p>

      <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
        <h3>Headers (Auto-filled from Login API)</h3>
        {['companyId', 'X-Auth-Token', 'product', 'Accept'].map(key => (
          <div key={key} style={{ margin: '12px 0', display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {key} {['companyId', 'X-Auth-Token'].includes(key) ? '*' : ''}
            </label>
            <small style={{ color: '#666', marginBottom: '4px' }}>
              {key === 'companyId' ? 'As provided in Login API response' :
               key === 'X-Auth-Token' ? 'As provided in Login API response' :
               key === 'product' ? 'Identification of product. Default: ONYX' :
               'Request content type'}
            </small>
            <input
              value={config.headers[key] || ''}
              readOnly
              style={{ padding: '10px', fontFamily: 'monospace', background: '#f0f8ff' }}
              type={key.includes('Token') ? 'password' : 'text'}
            />
          </div>
        ))}

        <h3 style={{ marginTop: '25px' }}>Query Parameters</h3>

        <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '4px' }}>companyCode *</label>
          <small style={{ color: '#666', marginBottom: '4px' }}>As provided in Login API response</small>
          <input
            value={config.companyCode}
            readOnly
            style={{ padding: '10px', fontFamily: 'monospace', background: '#f0f8ff' }}
          />
        </div>

        <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '4px' }}>downloadType *</label>
          <small style={{ color: '#666', marginBottom: '4px' }}>
            Dnld_Gstr1: Download GSTR1 data | EINV_DATA: Download e-invoice data
          </small>
          <select
            value={config.downloadType}
            onChange={handleDownloadTypeChange}
            style={{ padding: '10px', fontFamily: 'monospace' }}
          >
            <option value="Dnld_Gstr1">Dnld_Gstr1</option>
            <option value="EINV_DATA">EINV_DATA</option>
          </select>
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
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Checking...' : 'CHECK STATUS'}
        </button>
      </div>

      {fileUrl && (
        <div style={{ marginTop: '40px', padding: '40px', background: '#e8f5e8', borderRadius: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#34a853' }}>Download Ready!</h2>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '20px 60px',
              background: '#34a853',
              color: 'white',
              fontSize: '24px',
              textDecoration: 'none',
              borderRadius: '16px',
              fontWeight: 'bold'
            }}
          >
            DOWNLOAD FILE
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
