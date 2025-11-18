// InvoiceListForm.js
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_einvoice_shared_config';

const InvoiceListForm = () => {
  const getDefaultConfig = () => ({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/einvoice/list',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    },
    body: {
      companyUniqueCode: '',
      docNo: [],
      fromDt: '',
      toDt: '',
      btrdNm: '',
      catg: [],
      docType: [],
      invStatus: [],
      irnStatus: [],
      totinvval: { gt: '' },
      itemCount: { gt: '' },
      hasError: false,
      hasWarning: true,
      page: 0,
      size: 50
    }
  });

  const [config, setConfig] = useState(getDefaultConfig());
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load from shared storage
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
          },
          body: {
            ...prev.body,
            companyUniqueCode: parsed.companyUniqueCode || '',
            fromDt: parsed.fromDt || '',
            toDt: parsed.toDt || ''
          }
        }));
      } catch (e) {}
    }
  }, []);

  // Save on successful response
  const saveToShared = () => {
    const toSave = {
      companyId: config.headers.companyId,
      token: config.headers['X-Auth-Token'],
      companyUniqueCode: config.body.companyUniqueCode,
      fromDt: config.body.fromDt,
      toDt: config.body.toDt
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const fetchInvoiceList = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${config.proxyBase}${config.endpoint}`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(config.body)
      });

      const data = await res.json();
      setResponse({ status: res.status, body: data, time: new Date().toLocaleString('en-IN') });

      if (res.ok && data.status === 'SUCCESS') {
        saveToShared();
        alert('Invoice list fetched & values saved for next use!');
      }
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateArrayField = (field, value) => {
    const arr = value.split(',').map(v => v.trim()).filter(v => v);
    setConfig(prev => ({ ...prev, body: { ...prev.body, [field]: arr } }));
  };

  return (
    <div style={{ padding: '30px', background: '#f3e5f5', fontFamily: 'Segoe UI', minHeight: '100vh' }}>
      <h1 style={{ color: '#6a1b9a' }}>E-Invoice List (Auto-Populated)</h1>
      <p style={{ color: '#555' }}>companyId, Token, companyUniqueCode, dates auto-filled from previous response</p>

      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <h3>Headers (Auto-filled)</h3>
        {['companyId', 'X-Auth-Token'].map(key => (
          <div key={key} style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
            <strong style={{ width: '160px' }}>{key}:</strong>
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

        <h3 style={{ marginTop: '25px' }}>Request Body (Key Fields Auto-filled)</h3>
        <div style={{ margin: '12px 0' }}>
          <strong>companyUniqueCode:</strong>
          <input
            value={config.body.companyUniqueCode}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              body: { ...prev.body, companyUniqueCode: e.target.value }
            }))}
            style={{ width: '100%', padding: '10px', marginTop: '5px', fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div>
            <strong>From Date:</strong>
            <input
              type="date"
              value={config.body.fromDt}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                body: { ...prev.body, fromDt: e.target.value }
              }))}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>
          <div>
            <strong>To Date:</strong>
            <input
              type="date"
              value={config.body.toDt}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                body: { ...prev.body, toDt: e.target.value }
              }))}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>
        </div>

        <button
          onClick={fetchInvoiceList}
          disabled={loading}
          style={{
            marginTop: '30px',
            padding: '18px 60px',
            background: loading ? '#999' : '#8e24aa',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '22px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Fetching...' : 'FETCH INVOICE LIST'}
        </button>
      </div>

      {response && (
        <pre style={{ marginTop: '30px', background: '#333', color: '#0f0', padding: '25px', borderRadius: '12px', fontSize: '13px' }}>
          {JSON.stringify(response.body || response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default InvoiceListForm;