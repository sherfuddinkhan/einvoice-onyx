// AssignedGstinsForm.js - Full Debug UI Version
import React, { useState, useEffect } from 'react';

const AssignedGstinsForm = () => {
  // === Config: Editable in UI ===
  const [requestConfig, setRequestConfig] = useState({
    proxyBase: 'http://localhost:3001/proxy',
    endpoint: '/irisgst/mgmt/user/company/filingbusiness',
    companyId: '24',
    headers: {
      'Accept': 'application/json',
      'companyId': '24',
      'X-Auth-Token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhdGVlcUBjYWxpYnJlY3VlLmNvbSIsImNyZWF0ZWQiOjE3NjMwMjM2MTA0NjcsIm5hbWUiOiJBdGVlcSIsImV4cCI6MTc2MzExMDAxMH0.DK43Z5gxto5n7ufRiOiEOIw3j1UdF2AEYKRdBNTcV03P7-Pcd_rr-xmmu4uTw5cdJwoOPdZtzF117EjXR7MbIw',
      'product': 'ONYX'
    }
  });

  const [gstins, setGstins] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-save config to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('iris_debug_config');
    if (saved) setRequestConfig(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('iris_debug_config', JSON.stringify(requestConfig));
  }, [requestConfig]);

  const updateHeader = (key, value) => {
    setRequestConfig(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value }
    }));
  };

  const sendRequest = async () => {
    setLoading(true);
    setError('');
    setRawResponse(null);
    setGstins([]);

    const fullUrl = `${requestConfig.proxyBase}${requestConfig.endpoint}?companyId=${requestConfig.companyId}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include',
        headers: requestConfig.headers,
      });

      const text = await response.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        // keep raw text if not JSON
      }

      const responseObj = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: json || text,
        requestedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      setRawResponse(responseObj);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      if (json?.status === 'SUCCESS' && Array.isArray(json.response)) {
        setGstins(json.response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fullRequestUrl = `${requestConfig.proxyBase}${requestConfig.endpoint}?companyId=${requestConfig.companyId}`;

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ color: '#1a73e8' }}></h1>
      <p style={{ color: '#555' }}></p>

      {/* === REQUEST SECTION === */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ color: '#1a73e8' }}>Request Configuration (Visible & Editable)</h2>

        <div style={{ marginBottom: '15px' }}>
          <strong>Full Request URL:</strong>
          <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', marginTop: '5px', wordBreak: 'break-all' }}>
            {fullRequestUrl}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Headers:</strong>
          {Object.entries(requestConfig.headers).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
              <span style={{ width: '160px', fontWeight: 'bold' }}>{key}:</span>
              <input
                type={key.includes('Token') ? 'password' : 'text'}
                value={value}
                onChange={(e) => updateHeader(key, e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontFamily: key.includes('Token') ? 'sans-serif' : 'monospace',
                  background: key.includes('Token') ? '#fff8e1' : '#f8f9fa'
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={sendRequest}
          disabled={loading}
          style={{
            padding: '14px 32px',
            background: loading ? '#999' : '#ea4335',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending Request...' : 'SEND REQUEST →'}
        </button>
      </div>

      {/* === RESPONSE SECTION === */}
      {rawResponse && (
        <div style={{ background: '#fff8e1', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h2 style={{ color: '#f9a825' }}>Raw Response ({rawResponse.requestedAt} IST)</h2>
          <pre style={{
            background: '#333',
            color: '#0f0',
            padding: '15px',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '500px',
            fontSize: '13px'
          }}>
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', border: '2px solid #ffcdd2' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* === GSTIN TABLE === */}
      {gstins.length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#34a853' }}>Success! Assigned GSTINs ({gstins.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#34a853', color: 'white' }}>
              <tr>
                <th style={{ padding: '14px', textAlign: 'left' }}>Company Name</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>GSTIN</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {gstins.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{item.companyname}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{item.gstin || item.gstinno}</td>
                  <td style={{ padding: '12px' }}>{item.roleName}</td>
                  <td style={{ padding: '12px' }}>{item.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer style={{ marginTop: '50px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
        Auto-saved config • {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </footer>
    </div>
  );
};

export default AssignedGstinsForm;