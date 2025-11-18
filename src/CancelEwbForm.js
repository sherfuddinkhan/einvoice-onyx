// CancelEwbForm.js - Fully Auto-Populated & Transparent
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_einvoice_shared_config';

const CancelEwbForm = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/irn/cancelEwb',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    },
    body: {
      ewbNo: '',
      cnlRsn: '3', // 1=Duplicate, 2=Data Entry Mistake, 3=Order Cancelled, 4=Others
      cnlRem: '',
      userGstin: ''
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-load shared auth & GSTIN from any previous successful action
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const shared = JSON.parse(saved);
        setConfig(prev => ({
          ...prev,
          headers: {
            ...prev.headers,
            companyId: shared.companyId || '',
            'X-Auth-Token': shared.token || ''
          },
          body: {
            ...prev.body,
            userGstin: shared.companyUniqueCode || prev.body.userGstin
          }
        }));
      } catch (e) {
        console.warn('Failed to load shared config');
      }
    }
  }, []);

  const cancelEWB = async () => {
    if (!config.body.ewbNo.trim()) {
      alert('Please enter E-Way Bill Number');
      return;
    }
    if (!config.body.cnlRem.trim()) {
      alert('Please enter cancellation remark');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${config.proxyBase}${config.endpoint}`, {
        method: 'PUT',
        headers: config.headers,
        body: JSON.stringify(config.body)
      });

      const data = await res.json();
      const result = {
        status: res.status,
        body: data,
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
      setResponse(result);

      if (res.ok && data.status === 'SUCCESS') {
        alert('E-Way Bill Cancelled Successfully!');
      }
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isReady = config.headers.companyId && config.headers['X-Auth-Token'];

  const cancelReasons = {
    '1': '1 - Duplicate',
    '2': '2 - Data Entry Mistake',
    '3': '3 - Order Cancelled',
    '4': '4 - Others'
  };

  return (
    <div style={{
      padding: '30px',
      background: '#ffebee',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#c62828', marginBottom: '10px', fontSize: '34px' }}>
        Cancel E-Way Bill
      </h1>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
        All headers & payload visible • Auto-filled from previous actions
      </p>

      <div style={{
        background: 'white',
        padding: '35px',
        borderRadius: '20px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        maxWidth: '900px',
        margin: '0 auto'
      }}>

        {/* ==================== REQUEST HEADERS ==================== */}
        <h2 style={{ color: '#b71c1c', borderBottom: '4px solid #e57373', paddingBottom: '10px' }}>
          REQUEST HEADERS
        </h2>
        <div style={{
          background: '#fff5f5',
          padding: '20px',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '15px',
          margin: '20px 0',
          border: '2px solid #e57373'
        }}>
          {Object.entries(config.headers).map(([key, value]) => (
            <div key={key} style={{ margin: '12px 0', display: 'flex' }}>
              <strong style={{ width: '160px', color: '#880e4f' }}>{key}:</strong>
              <span style={{ 
                color: key.includes('Token') ? '#666' : '#000',
                wordBreak: 'break-all',
                flex: 1
              }}>
                {key.includes('Token') 
                  ? value.slice(0, 30) + '...' + value.slice(-10)
                  : value || <em style={{ color: '#999' }}>Not set</em>
                }
              </span>
            </div>
          ))}
        </div>

        {/* ==================== REQUEST PAYLOAD (JSON) ==================== */}
        <h2 style={{ color: '#b71c1c', borderBottom: '4px solid #e57373', paddingBottom: '10px', marginTop: '40px' }}>
          REQUEST PAYLOAD (JSON Body)
        </h2>
        <pre style={{
          background: '#263238',
          color: '#ff5252',
          padding: '20px',
          borderRadius: '12px',
          fontSize: '15px',
          margin: '20px 0',
          overflow: 'auto',
          border: '2px solid #e57373'
        }}>
          {JSON.stringify(config.body, null, 2)}
        </pre>

        {/* ==================== INPUT FORM ==================== */}
        <h2 style={{ color: '#c62828', marginTop: '40px' }}>Cancel E-Way Bill</h2>

        <div style={{ margin: '20px 0' }}>
          <strong>E-Way Bill Number:</strong>
          <input
            value={config.body.ewbNo}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              body: { ...prev.body, ewbNo: e.target.value }
            }))}
            placeholder="e.g., 331010514730"
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              borderRadius: '10px',
              border: '2px solid #ef5350',
              fontSize: '18px',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ margin: '20px 0' }}>
          <strong>Cancellation Reason:</strong>
          <select
            value={config.body.cnlRsn}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              body: { ...prev.body, cnlRsn: e.target.value }
            }))}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              borderRadius: '10px',
              border: '2px solid #ef5350',
              fontSize: '16px'
            }}
          >
            {Object.entries(cancelReasons).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ margin: '20px 0' }}>
          <strong>Cancellation Remark:</strong>
          <input
            value={config.body.cnlRem}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              body: { ...prev.body, cnlRem: e.target.value }
            }))}
            placeholder="e.g., Order cancelled by buyer"
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              borderRadius: '10px',
              border: '2px solid #ef5350',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ margin: '20px 0' }}>
          <strong>User GSTIN (Auto-filled):</strong>
          <input
            value={config.body.userGstin}
            readOnly
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              borderRadius: '10px',
              background: '#fff5f5',
              border: '2px solid #ef5350',
              fontSize: '16px',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <button
          onClick={cancelEWB}
          disabled={loading || !isReady || !config.body.ewbNo || !config.body.cnlRem}
          style={{
            width: '100%',
            padding: '26px',
            marginTop: '40px',
            background: (!isReady || !config.body.ewbNo || !config.body.cnlRem || loading) ? '#999' : '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '30px',
            fontWeight: 'bold',
            cursor: (!isReady || !config.body.ewbNo || !config.body.cnlRem || loading) ? 'not-allowed' : 'pointer',
            boxShadow: '0 12px 40px rgba(211,47,47,0.5)'
          }}
        >
          {loading ? 'Cancelling E-Way Bill...' : 'CANCEL E-WAY BILL'}
        </button>
      </div>

      {/* ==================== RESPONSE ==================== */}
      {response && (
        <div style={{ marginTop: '50px' }}>
          <h2 style={{ color: '#b71c1c', borderBottom: '4px solid #e57373', paddingBottom: '10px' }}>
            RESPONSE ({response.time} IST)
          </h2>
          <pre style={{
            background: '#1e1e1e',
            color: '#ff5252',
            padding: '30px',
            borderRadius: '16px',
            fontSize: '15px',
            marginTop: '20px',
            border: '2px solid #ff5252'
          }}>
            {JSON.stringify(response.body || response, null, 2)}
          </pre>
        </div>
      )}

      <footer style={{
        marginTop: '80px',
        textAlign: 'center',
        color: '#888',
        fontSize: '14px'
      }}>
        IRIS GST ONYX • Cancel E-Way Bill • {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </footer>
    </div>
  );
};

export default CancelEwbForm;