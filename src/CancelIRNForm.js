// CancelIRNForm.js - Fully Auto-Populated & Transparent (IRIS GST Style)
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_einvoice_shared_config';

const CancelIRNForm = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/irn/cancel',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    },
    body: {
      irn: '',
      cancelRsn: '1', // 1=Wrong Entry, 2=Duplicate, 3=Order Cancelled, 4=Others
      cancelRem: ''
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-load shared auth from any previous successful action
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
          }
        }));
      } catch (e) {
        console.warn('Failed to load shared config');
      }
    }
  }, []);

  const cancelIRN = async () => {
    if (!config.body.irn.trim()) {
      alert('Please enter IRN');
      return;
    }
    if (!config.body.cancelRem.trim()) {
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
        alert('IRN Cancelled Successfully!');
      }
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isReady = config.headers.companyId && config.headers['X-Auth-Token'];

  const cancelReasons = {
    '1': '1 - Wrong Entry',
    '2': '2 - Duplicate',
    '3': '3 - Order Cancelled',
    '4': '4 - Others'
  };

  return (
    <div style={{
      padding: '30px',
      background: '#fffde7',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#f57f17', marginBottom: '10px', fontSize: '36px' }}>
        Cancel IRN (E-Invoice)
      </h1>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
        All headers & payload visible before sending • Auto-filled from previous actions
      </p>

      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 14px 50px rgba(0,0,0,0.15)',
        maxWidth: '950px',
        margin: '0 auto'
      }}>

        {/* ==================== REQUEST HEADERS ==================== */}
        <h2 style={{ color: '#e65100', borderBottom: '4px solid #ffb74d', paddingBottom: '12px' }}>
          REQUEST HEADERS
        </h2>
        <div style={{
          background: '#fff8e1',
          padding: '25px',
          borderRadius: '14px',
          fontFamily: 'monospace',
          fontSize: '15px',
          margin: '20px 0',
          border: '3px solid #ffb74d'
        }}>
          {Object.entries(config.headers).map(([key, value]) => (
            <div key={key} style={{ margin: '14px 0', display: 'flex' }}>
              <strong style={{ width: '170px', color: '#e65100' }}>{key}:</strong>
              <span style={{ 
                color: key.includes('Token') ? '#666' : '#000',
                wordBreak: 'break-all',
                flex: 1,
                fontWeight: key.includes('Token') ? 'normal' : 'bold'
              }}>
                {key.includes('Token') 
                  ? value.slice(0, 35) + '...' + value.slice(-10)
                  : value || <em style={{ color: '#999' }}>Not set</em>
                }
              </span>
            </div>
          ))}
        </div>

        {/* ==================== REQUEST PAYLOAD (JSON) ==================== */}
        <h2 style={{ color: '#e65100', borderBottom: '4px solid #ffb74d', paddingBottom: '12px', marginTop: '50px' }}>
          REQUEST PAYLOAD (JSON Body)
        </h2>
        <pre style={{
          background: '#263238',
          color: '#ff9100',
          padding: '25px',
          borderRadius: '14px',
          fontSize: '16px',
          margin: '20px 0',
          overflow: 'auto',
          border: '3px solid #ffb74d'
        }}>
          {JSON.stringify(config.body, null, 2)}
        </pre>

        {/* ==================== INPUT FORM ==================== */}
        <h2 style={{ color: '#f57f17', marginTop: '50px' }}>Cancel IRN Details</h2>

        <div style={{ margin: '25px 0' }}>
          <strong>IRN (64 characters):</strong>
          <input
            value={config.body.irn}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              body: { ...prev.body, irn: e.target.value }
            }))}
            placeholder="Enter 64-character IRN"
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '10px',
              borderRadius: '12px',
              border: '3px solid #ffb74d',
              fontSize: '18px',
              fontFamily: 'monospace',
              backgroundColor: '#fffde7'
            }}
          />
        </div>

        <div style={{ margin: '25px 0' }}>
          <strong>Cancellation Reason:</strong>
          <select
            value={config.body.cancelRsn}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              body: { ...prev.body, cancelRsn: e.target.value }
            }))}
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '10px',
              borderRadius: '12px',
              border: '3px solid #ffb74d',
              fontSize: '18px',
              backgroundColor: '#fffde7'
            }}
          >
            {Object.entries(cancelReasons).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ margin: '25px 0' }}>
          <strong>Cancellation Remark (Required):</strong>
          <input
            value={config.body.cancelRem}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              body: { ...prev.body, cancelRem: e.target.value }
            }))}
            placeholder="e.g., Wrong entry in invoice amount"
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '10px',
              borderRadius: '12px',
              border: '3px solid #ffb74d',
              fontSize: '18px',
              backgroundColor: '#fffde7'
            }}
          />
        </div>

        <button
          onClick={cancelIRN}
          disabled={loading || !isReady || !config.body.irn || !config.body.cancelRem}
          style={{
            width: '100%',
            padding: '28px',
            marginTop: '50px',
            background: (!isReady || !config.body.irn || !config.body.cancelRem || loading) ? '#999' : '#f57f17',
            color: 'white',
            border: 'none',
            borderRadius: '18px',
            fontSize: '32px',
            fontWeight: 'bold',
            cursor: (!isReady || !config.body.irn || !config.body.cancelRem || loading) ? 'not-allowed' : 'pointer',
            boxShadow: '0 14px 50px rgba(245,127,23,0.5)',
            transition: 'all 0.3s'
          }}
       Fuck        >
          {loading ? 'Cancelling IRN...' : 'CANCEL IRN'}
        </button>
      </div>

      {/* ==================== RESPONSE ==================== */}
      {response && (
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ color: '#e65100', borderBottom: '4px solid #ffb74d', paddingBottom: '12px' }}>
            RESPONSE ({response.time} IST)
          </h2>
          <pre style={{
            background: '#1e1e1e',
            color: '#ff9100',
            padding: '35px',
            borderRadius: '18px',
            fontSize: '16px',
            marginTop: '25px',
            border: '3px solid #ffb74d'
          }}>
            {JSON.stringify(response.body || response, null, 2)}
          </pre>
        </div>
      )}

      <footer style={{
        marginTop: '100px',
        textAlign: 'center',
        color: '#888',
        fontSize: '15px'
      }}>
        IRIS GST ONYX • Cancel IRN • {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </footer>
    </div>
  );
};

export default CancelIRNForm;