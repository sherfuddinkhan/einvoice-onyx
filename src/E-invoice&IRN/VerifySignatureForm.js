// VerifyQRForm.js - Fully Auto-Populated & Professional (IRIS GST Style)
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_einvoice_shared_config';
const LAST_SIGNED_QR_JWT_KEY = 'iris_last_signed_qr_jwt'; // Key for last generated signed QR JWT

const VerifyQRForm = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/einvoice/verifySignature',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    },
    body: {
      jwt: ''
    },
    bypassSignature: false
  });
  const [response, setResponse] = useState(null);
  const [decodedInvoice, setDecodedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoFillStatus, setAutoFillStatus] = useState({
    auth: false,
    jwt: false
  });

  // Combined Auto-Load for Auth & JWT (runs once on mount)
  useEffect(() => {
    // Load auth from shared storage
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
        setAutoFillStatus(prev => ({ ...prev, auth: true }));
        console.log('✅ Auto-filled auth from shared config');
      } catch (e) {
        console.warn('Failed to load shared config');
      }
    }

    // ⭐ AUTO-POPULATE LAST GENERATED SIGNED QR JWT (PRIORITY 1)
    const lastSignedQrJwt = localStorage.getItem(LAST_SIGNED_QR_JWT_KEY);
    if (lastSignedQrJwt && lastSignedQrJwt.includes('ey') && lastSignedQrJwt.split('.').length === 3) {
      setConfig(prev => ({ ...prev, body: { jwt: lastSignedQrJwt } }));
      setAutoFillStatus(prev => ({ ...prev, jwt: true }));
      console.log('✅ Auto-populated last signed QR JWT from localStorage:', lastSignedQrJwt.substring(0, 50) + '...');
      return; // Exit early if filled from storage
    }

    // PRIORITY 2: Fallback to clipboard (only if no storage value)
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text.includes('ey') && text.split('.').length === 3) {
          setConfig(prev => ({ ...prev, body: { jwt: text } }));
          setAutoFillStatus(prev => ({ ...prev, jwt: true }));
          console.log('✅ Auto-filled JWT from clipboard:', text.substring(0, 50) + '...');
        } else {
          console.log('No valid JWT in clipboard');
        }
      } catch (err) {
        console.warn('Clipboard access denied or not supported');
      }
    };
    checkClipboard();
  }, []); // Empty dependency: Runs only once on mount

  const decodeJwtPayload = (jwt) => {
    try {
      const payload = jwt.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonStr = atob(base64);
      const payloadObj = JSON.parse(jsonStr);
      if (payloadObj.data && typeof payloadObj.data === 'string') {
        try {
          payloadObj.data = JSON.parse(payloadObj.data);
        } catch (e) {
          console.warn('Failed to parse inner data');
        }
      }
      return payloadObj;
    } catch (e) {
      return null;
    }
  };

  const handleVerify = async () => {
    if (!config.body.jwt.trim()) {
      alert('Please paste a JWT');
      return;
    }
    setLoading(true);
    setResponse(null);
    setDecodedInvoice(null);
    const jwt = config.body.jwt.trim();
    if (config.bypassSignature) {
      const decoded = decodeJwtPayload(jwt);
      if (decoded) setDecodedInvoice(decoded);
      else setResponse({ error: 'Invalid JWT format' });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${config.proxyBase}${config.endpoint}`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({ jwt })
      });
      const data = await res.json();
      const result = {
        status: res.status,
        body: data,
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
      setResponse(result);
      if (res.ok && data.status === 'SUCCESS' && data.response?.valid) {
        const decoded = decodeJwtPayload(jwt);
        if (decoded) setDecodedInvoice(decoded);
      }
    } catch (err) {
      setResponse({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const isReady = config.headers.companyId && config.headers['X-Auth-Token'];
  const invoiceFromResponse = response?.body?.response?.valid
    ? response.body.response
    : null;

  // Clear auto-filled JWT button (optional, for manual override)
  const clearJwt = () => {
    setConfig(prev => ({ ...prev, body: { jwt: '' } }));
    setAutoFillStatus(prev => ({ ...prev, jwt: false }));
    localStorage.removeItem(LAST_SIGNED_QR_JWT_KEY); // Optional: Clear storage
    console.log('Cleared auto-filled JWT');
  };

  return (
    <div style={{
      padding: '30px',
      background: '#fff3e0',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#e67e22', marginBottom: '10px', fontSize: '38px' }}>
        Verify Signed QR Code (JWT)
      </h1>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
        Token auto-filled • Paste JWT → Verify in 2 seconds
      </p>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 14px 50px rgba(0,0,0,0.15)',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        {/* ==================== AUTO-FILL STATUS ======================= */}
        <div style={{ marginBottom: '30px', padding: '15px', background: '#e8f5e8', borderRadius: '10px', border: '1px solid #4caf50' }}>
          <strong>Auto-Fill Status:</strong>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Auth Headers: {autoFillStatus.auth ? '✅ Auto-filled' : '❌ Manual entry needed'}</li>
            <li>Signed QR JWT: {autoFillStatus.jwt ? '✅ Auto-filled from last generation' : '❌ Paste manually (or from clipboard)'}</li>
          </ul>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Generate an IRN first to auto-fill JWT. Check browser console for logs.
          </p>
          {autoFillStatus.jwt && (
            <button onClick={clearJwt} style={{ marginTop: '10px', padding: '6px 12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              Clear Auto-Fill
            </button>
          )}
        </div>

        {/* ==================== REQUEST HEADERS ==================== */}
        <h2 style={{ color: '#d35400', borderBottom: '4px solid #f39c12', paddingBottom: '12px' }}>
          REQUEST HEADERS
        </h2>
        <div style={{
          background: '#fff8e1',
          padding: '25px',
          borderRadius: '14px',
          fontFamily: 'monospace',
          fontSize: '15px',
          margin: '20px 0',
          border: '3px solid #f39c12'
        }}>
          {Object.entries(config.headers).map(([key, value]) => (
            <div key={key} style={{ margin: '14px 0', display: 'flex' }}>
              <strong style={{ width: '170px', color: '#d35400' }}>{key}:</strong>
              <span style={{
                color: key.includes('Token') ? '#666' : '#000',
                wordBreak: 'break-all',
                flex: 1
              }}>
                {key.includes('Token')
                  ? value.slice(0, 35) + '...' + value.slice(-10)
                  : value || <em style={{ color: '#999' }}>Not set</em>
                }
              </span>
            </div>
          ))}
        </div>
        {/* ==================== JWT INPUT ==================== */}
        <h2 style={{ color: '#d35400', marginTop: '50px' }}>
          Signed QR Code (JWT) {autoFillStatus.jwt ? '(Auto-filled ✅)' : '(Manual)'}
        </h2>
        <textarea
          value={config.body.jwt}
          onChange={(e) => setConfig(prev => ({ ...prev, body: { jwt: e.target.value } }))}
          placeholder={autoFillStatus.jwt ? "Auto-filled from last generation" : "Paste full JWT here... (auto-filled from clipboard if possible)"}
          rows={8}
          style={{
            width: '100%',
            padding: '18px',
            marginTop: '15px',
            borderRadius: '14px',
            border: `3px solid ${autoFillStatus.jwt ? '#4caf50' : '#f39c12'}`,
            fontFamily: 'monospace',
            fontSize: '15px',
            backgroundColor: autoFillStatus.jwt ? '#f3e5f5' : '#fff8e1'
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', margin: '20px 0', fontSize: '18px' }}>
          <input
            type="checkbox"
            checked={config.bypassSignature}
            onChange={(e) => setConfig(prev => ({ ...prev, bypassSignature: e.target.checked }))}
            style={{ width: '24px', height: '24px', marginRight: '12px' }}
          />
          <span style={{ fontWeight: 'bold', color: '#d35400' }}>
            Bypass signature verification (decode only)
          </span>
        </label>
        <button
          onClick={handleVerify}
          disabled={loading || !isReady || !config.body.jwt.trim()}
          style={{
            width: '100%',
            padding: '28px',
            marginTop: '30px',
            background: (!isReady || !config.body.jwt.trim() || loading) ? '#999' : '#e67e22',
            color: 'white',
            border: 'none',
            borderRadius: '18px',
            fontSize: '32px',
            fontWeight: 'bold',
            cursor: (!isReady || !config.body.jwt.trim() || loading) ? 'not-allowed' : 'pointer',
            boxShadow: '0 14px 50px rgba(230,126,34,0.5)'
          }}
        >
          {loading ? 'Verifying...' : config.bypassSignature ? 'DECODE JWT' : 'VERIFY SIGNATURE'}
        </button>
        {/* ==================== REQUEST BODY (when not bypassed) ==================== */}
        {!config.bypassSignature && config.body.jwt && (
          <>
            <h2 style={{ color: '#d35400', marginTop: '50px', borderBottom: '4px solid #f39c12', paddingBottom: '12px' }}>
              REQUEST PAYLOAD (JSON)
            </h2>
            <pre style={{
              background: '#263238',
              color: '#f39c12',
              padding: '25px',
              borderRadius: '14px',
              fontSize: '15px',
              margin: '20px 0',
              overflow: 'auto',
              border: '3px solid #f39c12'
            }}>
              {JSON.stringify({ jwt: config.body.jwt }, null, 2)}
            </pre>
          </>
        )}
        {/* ==================== RESPONSE ==================== */}
        {response && (
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ color: '#d35400', borderBottom: '4px solid #f39c12', paddingBottom: '12px' }}>
              API RESPONSE ({response.time} IST)
            </h2>
            <pre style={{
              background: '#1e1e1e',
              color: response.body?.status === 'SUCCESS' ? '#2ecc71' : '#e74c3c',
              padding: '35px',
              borderRadius: '18px',
              fontSize: '15px',
              marginTop: '25px',
              border: '3px solid #f39c12'
            }}>
              {JSON.stringify(response.body || response, null, 2)}
            </pre>
          </div>
        )}
        {/* ==================== DECODED JWT ==================== */}
        {decodedInvoice && (
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ color: '#27ae60', borderBottom: '4px solid #2ecc71', paddingBottom: '12px' }}>
              DECODED JWT (Full Payload)
            </h2>
            <pre style={{
              background: '#1e1e1e',
              color: '#2ecc71',
              padding: '35px',
              borderRadius: '18px',
              fontSize: '15px',
              marginTop: '25px',
              border: '3px solid #2ecc71'
            }}>
              {JSON.stringify(decodedInvoice, null, 2)}
            </pre>
          </div>
        )}
        {/* ==================== VERIFIED INVOICE SUMMARY ==================== */}
        {invoiceFromResponse && (
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ color: '#27ae60', borderBottom: '4px solid #2ecc71', paddingBottom: '12px' }}>
              VERIFIED INVOICE SUMMARY
            </h2>
            <div style={{
              background: '#e8f5e9',
              padding: '30px',
              borderRadius: '18px',
              border: '3px solid #2ecc71',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              fontSize: '18px'
            }}>
              {[
                ['IRN', invoiceFromResponse.Irn],
                ['Doc No', invoiceFromResponse.DocNo],
                ['Doc Date', invoiceFromResponse.DocDt],
                ['Doc Type', invoiceFromResponse.DocTyp],
                ['Seller GSTIN', invoiceFromResponse.SellerGstin],
                ['Buyer GSTIN', invoiceFromResponse.BuyerGstin],
                ['Total Value', `₹${Number(invoiceFromResponse.TotInvVal).toLocaleString('en-IN')}`],
                ['Main HSN', invoiceFromResponse.MainHsnCode],
                ['Item Count', invoiceFromResponse.ItemCnt]
              ].map(([label, value]) => (
                <div key={label}>
                  <strong style={{ color: '#27ae60' }}>{label}:</strong>
                  <div style={{ fontFamily: 'monospace', background: 'white', padding: '10px', borderRadius: '8px', marginTop: '8px', fontWeight: 'bold' }}>
                    {value || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <footer style={{
        marginTop: '100px',
        textAlign: 'center',
        color: '#888',
        fontSize: '15px'
      }}>
        IRIS GST ONYX • Verify Signed QR Code • November 17, 2025 • {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </footer>
    </div>
  );
};

export default VerifyQRForm;