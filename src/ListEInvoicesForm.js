// ListEInvoicesForm.js - Fully Auto-Populated & Shared
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'iris_einvoice_shared_config'; // Same key as other forms

const ListEInvoicesForm = () => {
  const [config, setConfig] = useState({
    proxyBase: 'http://localhost:3001',
    endpoint: '/proxy/einvoice/list',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'companyId': '',
      'X-Auth-Token': '',
      'product': 'ONYX'
    },
    filters: {
      companyUniqueCode: '',
      fromDt: '',
      toDt: '',
      docType: [],
      invStatus: [],
      page: 0,
      size: 20
    }
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-load from shared storage (from any previous successful call)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const shared = JSON.parse(saved);
        setConfig(prev => ({
          ...prev,
          headers: {
            ...prev.headers,
            companyId: shared.companyId || prev.headers.companyId,
            'X-Auth-Token': shared.token || prev.headers['X-Auth-Token']
          },
          filters: {
            ...prev.filters,
            companyUniqueCode: shared.companyUniqueCode || prev.filters.companyUniqueCode,
            fromDt: shared.fromDt || prev.filters.fromDt,
            toDt: shared.toDt || prev.filters.toDt
          }
        }));
      } catch (e) {
        console.warn('Failed to load shared config');
      }
    }
  }, []);

  // Save critical values on successful response
  const saveSharedConfig = () => {
    const toSave = {
      companyId: config.headers.companyId,
      token: config.headers['X-Auth-Token'],
      companyUniqueCode: config.filters.companyUniqueCode,
      fromDt: config.filters.fromDt,
      toDt: config.filters.toDt
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const listInvoices = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${config.proxyBase}${config.endpoint}`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(config.filters)
      });

      const data = await res.json();
      setResponse({ status: res.status, body: data, time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) });

      if (res.ok && data.status === 'SUCCESS') {
        saveSharedConfig();
        alert('E-Invoices fetched successfully! All values saved for next use.');
      }
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleArray = (field, value) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: prev.filters[field].includes(value)
          ? prev.filters[field].filter(v => v !== value)
          : [...prev.filters[field], value]
      }
    }));
  };

  return (
    <div style={{
      padding: '30px',
      background: '#f3e5f5',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#8e24aa', marginBottom: '10px' }}>
        List E-Invoices (Auto-Populated)
      </h1>
      <p style={{ color: '#555', fontSize: '15px' }}>
        companyId, Token, companyUniqueCode, dates auto-filled from previous responses
      </p>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '18px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        maxWidth: '900px'
      }}>
        {/* Headers - Visible Before Click */}
        <h3 style={{ color: '#6a1b9a' }}>Headers (Auto-filled)</h3>
        <div style={{ background: '#f8f0fc', padding: '15px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '13px' }}>
          {['companyId', 'X-Auth-Token'].map(key => (
            <div key={key} style={{ margin: '8px 0' }}>
              <strong style={{ color: '#4a148c' }}>{key}:</strong>{' '}
              {config.headers[key] ? (
                <span style={{ color: '#2e7d32' }}>
                  {key.includes('Token') ? config.headers[key].slice(0, 20) + '...' : config.headers[key]}
                </span>
              ) : (
                <span style={{ color: '#c62828' }}>Not set</span>
              )}
            </div>
          ))}
        </div>

        {/* Filters - Auto-filled */}
        <h3 style={{ marginTop: '25px', color: '#6a1b9a' }}>Search Filters (Auto-filled)</h3>
        <div style={{ margin: '15px 0' }}>
          <strong>Company Unique Code:</strong>
          <input
            value={config.filters.companyUniqueCode}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              filters: { ...prev.filters, companyUniqueCode: e.target.value }
            }))}
            placeholder="01AAACI9260R002"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontFamily: 'monospace',
              fontSize: '15px'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div>
            <strong>From Date:</strong>
            <input
              type="date"
              value={config.filters.fromDt.split('/').reverse().join('-')} // DD/MM/YYYY → YYYY-MM-DD
              onChange={(e) => {
                const [y, m, d] = e.target.value.split('-');
                setConfig(prev => ({
                  ...prev,
                  filters: { ...prev.filters, fromDt: `${d}/${m}/${y}` }
                }));
              }}
              style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px' }}
            />
          </div>
          <div>
            <strong>To Date:</strong>
            <input
              type="date"
              value={config.filters.toDt.split('/').reverse().join('-')}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split('-');
                setConfig(prev => ({
                  ...prev,
                  filters: { ...prev.filters, toDt: `${d}/${m}/${y}` }
                }));
              }}
              style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <strong>Doc Type:</strong><br />
          {["RI", "CRN", "DBN"].map(type => (
            <label key={type} style={{ marginRight: '20px', fontSize: '15px' }}>
              <input
                type="checkbox"
                checked={config.filters.docType.includes(type)}
                onChange={() => toggleArray('docType', type)}
              /> {type}
            </label>
          ))}
        </div>

        <div style={{ marginTop: '15px' }}>
          <strong>Invoice Status:</strong><br />
          {["UPLOADED", "IRN_GENERATED", "CANCELLED"].map(status => (
            <label key={status} style={{ marginRight: '20px', fontSize: '15px' }}>
              <input
                type="checkbox"
                checked={config.filters.invStatus.includes(status)}
                onChange={() => toggleArray('invStatus', status)}
              /> {status}
            </label>
          ))}
        </div>

        <button
          onClick={listInvoices}
          disabled={loading}
          style={{
            marginTop: '30px',
            padding: '18px 60px',
            background: loading ? '#999' : '#8e24aa',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '22px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(142,36,170,0.4)'
          }}
        >
          {loading ? 'Searching...' : 'SEARCH E-INVOICES'}
        </button>
      </div>

      {/* Response - After Click */}
      {response && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#4a148c' }}>
            Response ({response.time} IST)
          </h3>
          <pre style={{
            background: '#333',
            color: '#0f0',
            padding: '25px',
            borderRadius: '14px',
            fontSize: '13px',
            maxHeight: '600px',
            overflow: 'auto'
          }}>
            {JSON.stringify(response.body || response, null, 2)}
          </pre>
        </div>
      )}

      <footer style={{ marginTop: '50px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
        IRIS GST ONYX • Auto-saved • {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </footer>
    </div>
  );
};

export default ListEInvoicesForm;