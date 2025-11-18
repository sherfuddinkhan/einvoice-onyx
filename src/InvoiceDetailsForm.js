// InvoiceDetailsForm.js
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_einvoice_shared_config';

const InvoiceDetailsForm = () => {
  const [einvId, setEinvId] = useState('');
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    headers: {
      'Accept': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-load shared values
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({
          ...prev,
          headers: {
            ...prev.headers,
            companyId: parsed.companyId || '',
            'X-Auth-Token': parsed.token || ''
          }
        }));
      } catch (e) {}
    }
  }, []);

  const fetchDetails = async () => {
    if (!einvId) return alert('Enter einvId');
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${config.proxyBase}/proxy/einvoice/details?einvId=${einvId}`, {
        headers: config.headers
      });
      const data = await res.json();
      setResponse({ body: data, time: new Date().toLocaleString('en-IN') });
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const printEInvoice = async () => {
    if (!einvId) return alert('Enter einvId');
    try {
      const res = await fetch(`${config.proxyBase}/proxy/einvoice/print?template=STANDARD&id=${einvId}`, {
        headers: { ...config.headers, 'Accept': '*/*' }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `einvoice_${einvId}.pdf`;
      a.click();
      setResponse({ message: 'PDF downloaded!' });
    } catch (err) {
      setResponse({ error: 'Print failed' });
    }
  };

  return (
    <div style={{ padding: '30px', background: '#e8f5e8', fontFamily: 'Segoe UI', minHeight: '100vh' }}>
      <h1 style={{ color: '#2e7d32' }}>E-Invoice Details & Print</h1>
      <p style={{ color: '#555' }}>companyId & Token auto-filled from Invoice List</p>

      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <h3>Headers (Auto-filled)</h3>
        {['companyId', 'X-Auth-Token'].map(key => (
          <div key={key} style={{ margin: '12px 0' }}>
            <strong>{key}:</strong> {config.headers[key] ? 'Filled' : 'Not set'}
          </div>
        ))}

        <div style={{ margin: '20px 0' }}>
          <strong>einvId:</strong>
          <input
            type="number"
            value={einvId}
            onChange={(e) => setEinvId(e.target.value)}
            placeholder="e.g., 714847"
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={fetchDetails} disabled={loading || !einvId}
            style={{ padding: '16px 40px', background: '#43a047', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold' }}>
            {loading ? 'Loading...' : 'FETCH DETAILS'}
          </button>
          <button onClick={printEInvoice} disabled={!einvId}
            style={{ padding: '16px 40px', background: '#1b5e20', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold' }}>
            PRINT PDF
          </button>
        </div>
      </div>

      {response && (
        <pre style={{ marginTop: '30px', background: '#333', color: '#0f0', padding: '25px', borderRadius: '12px' }}>
          {JSON.stringify(response.body || response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default InvoiceDetailsForm;