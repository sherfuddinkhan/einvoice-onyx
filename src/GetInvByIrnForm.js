import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_einvoice_shared_config';

const GetInvByIrnForm = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/irn/getInvByIrn',
    headers: {
      'Accept': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    },
    params: {
      irn: '',
      userGstin: ''
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Auto-populate IRN and GSTIN from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const shared = JSON.parse(saved);

      setConfig(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          companyId: shared.companyId || '',
          'X-Auth-Token': shared.token || ''
        },
        params: {
          ...prev.params,
          irn: shared.irn || '',
          userGstin: shared.companyUniqueCode || prev.params.userGstin
        }
      }));

      if (shared.lastGeneratedResponse) {
        const lastResp = shared.lastGeneratedResponse;

        const autoResponse = {
          url: 'Auto-loaded from last successful IRN generation',
          status: 200,
          body: {
            status: 'SUCCESS',
            message: 'Auto-populated from previous generation',
            response: lastResp
          },
          time: new Date(shared.lastGeneratedAt || Date.now()).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata'
          })
        };

        setResponse(autoResponse);
      }
    } catch (e) {
      console.warn('Failed to load shared config', e);
    }
  }, []);

  const fetchInvoice = async () => {
    if (!config.params.irn.trim()) {
      alert('Please enter or select an IRN');
      return;
    }

    setLoading(true);
    setResponse(null);

    const queryString = new URLSearchParams({
      irn: config.params.irn,
      userGstin: config.params.userGstin
    }).toString();

    const fullUrl = `${config.proxyBase}${config.endpoint}?${queryString}`;

    try {
      const res = await fetch(fullUrl, {
        method: 'GET',
        headers: config.headers
      });

      const data = await res.json();

      const result = {
        url: fullUrl,
        status: res.status,
        body: data,
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      setResponse(result);

      if (res.ok && data.status === 'SUCCESS') {
        alert('Invoice fetched successfully!');

        // Save IRN & response for other components
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved.irn = config.params.irn;
        saved.lastGeneratedResponse = data.response || {};
        saved.lastGeneratedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      }
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const isReady = config.headers.companyId && config.headers['X-Auth-Token'] && config.params.irn;

  return (
    <div style={{ padding: '30px', background: '#e8f5e9', fontFamily: 'Segoe UI, Arial, sans-serif', minHeight: '100vh' }}>
      <h1 style={{ color: '#2e7d32', marginBottom: '10px', fontSize: '38px' }}>Get Invoice by IRN</h1>
      <p style={{ color: '#388e3c', fontWeight: 'bold', fontSize: '18px', marginBottom: '30px' }}>
        ✅ Auto-filled & instantly displays last generated invoice (QR + JWTs included)
      </p>

      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 14px 50px rgba(0,0,0,0.15)', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Headers */}
        <h2 style={{ color: '#1b5e20', borderBottom: '4px solid #66bb6a', paddingBottom: '12px' }}>REQUEST HEADERS</h2>
        <div style={{ background: '#e8f5e9', padding: '25px', borderRadius: '14px', fontFamily: 'monospace', fontSize: '15px', margin: '20px 0', border: '3px solid #66bb6a' }}>
          {Object.entries(config.headers).map(([key, value]) => (
            <div key={key} style={{ margin: '14px 0', display: 'flex' }}>
              <strong style={{ width: '170px', color: '#1b5e20' }}>{key}:</strong>
              <span style={{ color: key.includes('Token') ? '#666' : '#000', wordBreak: 'break-all', flex: 1 }}>
                {key.includes('Token') ? value.slice(0, 35) + '...' + value.slice(-10) : value || <em style={{ color: '#999' }}>Not set</em>}
              </span>
            </div>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ margin: '40px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <strong style={{ fontSize: '18px' }}>IRN (Auto-filled):</strong>
            <input
              value={config.params.irn}
              onChange={(e) => setConfig(prev => ({ ...prev, params: { ...prev.params, irn: e.target.value } }))}
              placeholder="Auto-filled after generation"
              style={{ width: '100%', padding: '16px', marginTop: '10px', borderRadius: '12px', border: '3px solid #66bb6a', fontSize: '18px', fontFamily: 'monospace', backgroundColor: '#e8f5e9' }}
            />
          </div>
          <div>
            <strong style={{ fontSize: '18px' }}>User GSTIN (Auto-filled):</strong>
            <input
              value={config.params.userGstin}
              readOnly
              style={{ width: '100%', padding: '16px', marginTop: '10px', borderRadius: '12px', background: '#f1f8e9', border: '3px solid #66bb6a', fontSize: '18px', fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <button
          onClick={fetchInvoice}
          disabled={loading || !isReady}
          style={{
            width: '100%',
            padding: '28px',
            marginTop: '40px',
            background: (!isReady || loading) ? '#999' : '#43a047',
            color: 'white',
            border: 'none',
            borderRadius: '18px',
            fontSize: '32px',
            fontWeight: 'bold',
            cursor: (!isReady || loading) ? 'not-allowed' : 'pointer',
            boxShadow: '0 14px 50px rgba(67,160,71,0.5)',
            transition: 'all 0.3s'
          }}
        >
          {loading ? 'Fetching Fresh Data...' : 'REFRESH / RE-FETCH INVOICE'}
        </button>

        <button
          onClick={() => setShowClearConfirm(true)}
          style={{ marginTop: '20px', padding: '14px 28px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          Clear Saved Data
        </button>
      </div>

      {/* Confirm Modal */}
      {showClearConfirm && (
        <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ background:'white', padding:'40px', borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center', maxWidth:'500px' }}>
            <h2 style={{ color:'#d32f2f', marginBottom:'20px' }}>Clear Saved IRN?</h2>
            <p style={{ fontSize:'18px', marginBottom:'30px' }}>This will remove the auto-filled IRN, QR code, and all cached data.</p>
            <div>
              <button onClick={clearSavedData} style={{ padding:'14px 32px', background:'#d32f2f', color:'white', border:'none', borderRadius:'12px', margin:'0 10px', cursor:'pointer', fontSize:'18px' }}>Yes, Clear</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ padding:'14px 32px', background:'#666', color:'white', border:'none', borderRadius:'12px', margin:'0 10px', cursor:'pointer', fontSize:'18px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div style={{ marginTop:'80px' }}>
          <h2 style={{ color:'#1b5e20', borderBottom:'4px solid #66bb6a', paddingBottom:'12px', display:'inline-block' }}>
            API RESPONSE • {response.time} IST
          </h2>
          <pre style={{ background:'#1e1e1e', color: response.body?.status === 'SUCCESS' ? '#69f0ae' : '#e74c3c', padding:'35px', borderRadius:'18px', fontSize:'15px', marginTop:'25px', border:'3px solid #66bb6a', overflow:'auto' }}>
            {JSON.stringify(response.body || response, null, 2)}
          </pre>
        </div>
      )}

      <footer style={{ marginTop:'120px', textAlign:'center', color:'#666', fontSize:'16px', fontWeight:'bold' }}>
        IRIS GST ONYX • Get Invoice by IRN • Auto-Populated • November 18, 2025
      </footer>
    </div>
  );
};

export default GetInvByIrnForm;
