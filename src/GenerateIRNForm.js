// GenerateIRNForm.js - Full Working Version with Cleaned UI and Styles

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// -------------------------
// CONSTANTS & KEYS
// -------------------------
const STORAGE_KEY = 'iris_einvoice_shared_config';
const LAST_DOC_DETAILS_KEY = 'iris_last_used_doc_details';
const LAST_IRN_KEY = 'iris_last_used_irn';
const LAST_SIGNED_QR_JWT_KEY = 'iris_last_signed_qr_jwt';
const LAST_EWB_DETAILS_KEY = 'iris_last_ewb_details';
const LAST_GENERATED_ID_KEY = 'iris_last_generated_id';

// -------------------------
// STYLES
// -------------------------
const colors = {
    primary: '#1A73E8', // Blue
    primaryDark: '#0B4F9C',
    primaryLight: '#E8F0FE',
    success: '#34A853', // Green
    danger: '#EA4335', // Red
    background: '#F5F5F7',
    cardBackground: '#FFFFFF',
    textDark: '#333333',
    textLight: '#707070',
};

const styles = {
    container: {
        padding: '40px',
        background: colors.background,
        minHeight: '100vh',
        fontFamily: 'Roboto, Arial, sans-serif',
    },
    header: {
        textAlign: 'center',
        color: colors.primaryDark,
        fontSize: '36px',
        marginBottom: '40px',
        fontWeight: 500,
        borderBottom: `2px solid ${colors.primaryLight}`,
        paddingBottom: '15px',
    },
    section: {
        background: colors.cardBackground,
        padding: '30px',
        borderRadius: '16px',
        marginBottom: '30px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        borderLeft: `5px solid ${colors.primary}`,
    },
    sectionTitle: {
        color: colors.primary,
        fontSize: '22px',
        marginBottom: '20px',
        fontWeight: 600,
        borderBottom: `1px solid ${colors.primaryLight}`,
        paddingBottom: '10px',
    },
    grid: (cols) => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '25px',
    }),
    label: {
        fontWeight: 600,
        color: colors.textDark,
        display: 'block',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${colors.textLight}`,
        fontSize: '15px',
        background: colors.cardBackground,
        transition: 'border-color 0.2s',
    },
    inputFocus: {
        borderColor: colors.primary,
        boxShadow: `0 0 0 3px ${colors.primaryLight}`,
    },
    readOnlyBox: {
        padding: '12px',
        background: colors.primaryLight,
        borderRadius: '8px',
        marginTop: '6px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: colors.textDark,
    },
    itemCard: {
        background: colors.primaryLight,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        border: `1px solid ${colors.primary}`,
    },
    lineTotal: {
        marginTop: 12,
        fontWeight: 'bold',
        color: colors.primaryDark,
        padding: '8px 0',
        borderTop: `1px dashed ${colors.primary}`,
    },
    btnGreen: {
        padding: '12px 24px',
        background: colors.success,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '15px',
        transition: 'background 0.2s',
    },
    btnRed: {
        padding: '10px 16px',
        background: colors.danger,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    btnGenerate: (loading, authToken) => ({
        padding: '28px 100px',
        fontSize: '32px',
        fontWeight: 'bold',
        background: loading || !authToken ? '#BDBDBD' : colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        cursor: loading || !authToken ? 'not-allowed' : 'pointer',
        boxShadow: `0 10px 30px ${loading || !authToken ? 'rgba(0,0,0,0.2)' : 'rgba(26, 115, 232, 0.4)'}`,
        transition: 'all 0.3s',
    }),
    responseBox: (status) => ({
        background: '#1e1e1e',
        color: status === 'SUCCESS' ? '#A8FFBF' : colors.danger,
        padding: '30px',
        borderRadius: '16px',
        fontSize: '14px',
        border: `2px solid ${status === 'SUCCESS' ? colors.success : colors.danger}`,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    }),
};

// -------------------------
// REUSABLE COMPONENTS
// -------------------------
const Section = ({ title, children }) => (
    <div style={styles.section}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {children}
    </div>
);
const Grid = ({ cols = 2, children }) => (
    <div style={styles.grid(cols)}>{children}</div>
);
const Input = ({ label, value, onChange, type = 'text', step, note }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <label style={{ display: 'block' }}>
            <span style={styles.label}>
                {label} {note && <small style={{ color: colors.textLight }}>({note})</small>}
            </span>
            <input
                type={type}
                step={step}
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={e => onChange?.(type === 'number' ? Number(e.target.value) : e.target.value)}
                style={{ ...styles.input, ...(isFocused ? styles.inputFocus : {}) }}
            />
        </label>
    );
};
const Select = ({ label, value, options, onChange, note }) => (
    <label style={{ display: 'block' }}>
        <span style={styles.label}>
            {label} {note && <small style={{ color: colors.textLight }}>({note})</small>}
        </span>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ ...styles.input, padding: '13px' }}
        >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </label>
);
const ReadOnly = ({ label, value }) => (
    <div>
        <strong style={{ color: colors.primaryDark }}>{label}:</strong>
        <div style={styles.readOnlyBox}>
            {value}
        </div>
    </div>
);

// -------------------------
// MAIN COMPONENT
// -------------------------
const GenerateIRNForm = () => {
    const { authToken, setLastInvoice } = useAuth();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const [payload, setPayload] = useState({
        userGstin: '01AAACI9260R002',
        supplyType: 'O',
        ntr: 'Inter',
        docType: 'RI',
        catg: 'B2B',
        dst: 'O',
        trnTyp: 'REG',
        no: '',
        dt: '',
        pos: '',
        rchrg: 'N',
        sgstin: '',
        slglNm: '',
        sbnm: '',
        sloc: '',
        sstcd: '',
        spin: '',
        bgstin: '',
        blglNm: '',
        bbnm: '',
        bloc: '',
        bstcd: '',
        bpin: '',
        taxSch: 'GST',
        totinvval: 0,
        tottxval: 0,
        totiamt: 0,
        subSplyTyp: 'Supply',
        genIrn: true,
        genewb: 'N',
        signedDataReq: true,
        itemList: [],
        lastGeneratedId: '',
    });

    // -------------------------
    // Load Auto-Populated Data (Includes DocNum increment for new invoice)
    // -------------------------
    useEffect(() => {
        const shared = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const lastDoc = JSON.parse(localStorage.getItem(LAST_DOC_DETAILS_KEY) || '{}');
        const lastSavedId = localStorage.getItem(LAST_GENERATED_ID_KEY) || '';

        let nextDocNum = lastDoc.docNum || '';

        // Logic to increment docNum for uniqueness to prevent duplicate errors
        if (nextDocNum) {
            const match = nextDocNum.match(/(\D*)(\d+)$/);
            if (match) {
                const prefix = match[1];
                const number = parseInt(match[2], 10);
                const numLength = match[2].length;
                nextDocNum = `${prefix}${String(number + 1).padStart(numLength, '0')}`;
            } else if (Number.isInteger(parseInt(nextDocNum, 10))) {
                nextDocNum = String(parseInt(nextDocNum, 10) + 1);
            }
        }

        setPayload(prev => ({
            ...prev,
            userGstin: shared.companyUniqueCode || prev.userGstin,
            no: nextDocNum || prev.no,
            dt: lastDoc.docDate || prev.dt,
            docType: lastDoc.docType || prev.docType,
            pos: prev.pos || '04',
            sgstin: prev.sgstin || shared.companyUniqueCode || '01AAACI9260R002',
            slglNm: prev.slglNm || 'Calibre Cue Private Limited',
            sbnm: prev.sbnm || 'Head Office',
            sloc: prev.sloc || 'Srinagar',
            sstcd: prev.sstcd || '01',
            spin: prev.spin || '190001',
            bgstin: prev.bgstin || '04AAACI9260R002',
            blglNm: prev.blglNm || 'Chandigarh Trader Pvt Ltd',
            bbnm: prev.bbnm || 'Main Branch',
            bloc: prev.bloc || 'Chandigarh',
            bstcd: prev.bstcd || '04',
            bpin: prev.bpin || '160001',
            itemList: prev.itemList.length ? prev.itemList : [{
                num: '00001',
                hsnCd: '73041190',
                prdNm: 'SEAMLESS STEEL TUBE 10X2MM',
                qty: 1,
                unit: 'NOS',
                unitPrice: 3322.45,
                txval: 3322.45,
                sval: 3322.45,
                iamt: 598.04,
                irt: 18,
                rt: 18,
                itmVal: 3920.49,
            }],
            totinvval: 3920.49,
            tottxval: 3322.45,
            totiamt: 598.04,
            lastGeneratedId: lastSavedId,
        }));
    }, []);

    // -------------------------
    // Helpers
    // -------------------------
    const setField = (field, value) => setPayload(prev => ({ ...prev, [field]: value }));

    const updateItem = (idx, field, value) => {
        setPayload(prev => {
            const items = [...prev.itemList];
            items[idx] = { ...items[idx], [field]: value };
            const qty = Number(items[idx].qty) || 0;
            const price = Number(items[idx].unitPrice) || 0;
            const rate = Number(items[idx].irt || 18) / 100;
            const txval = qty * price;
            const iamt = txval * rate;
            const itmVal = txval + iamt;
            items[idx].txval = Number(txval.toFixed(2));
            items[idx].sval = Number(txval.toFixed(2));
            items[idx].iamt = Number(iamt.toFixed(2));
            items[idx].itmVal = Number(itmVal.toFixed(2));
            const totals = items.reduce((a, i) => ({
                totinvval: a.totinvval + i.itmVal,
                tottxval: a.tottxval + i.txval,
                totiamt: a.totiamt + i.iamt,
            }), { totinvval: 0, tottxval: 0, totiamt: 0 });
            return { ...prev, itemList: items, ...totals };
        });
    };

    const addItem = () => {
        setPayload(prev => ({
            ...prev,
            itemList: [
                ...prev.itemList,
                {
                    num: String(prev.itemList.length + 1).padStart(5, '0'),
                    hsnCd: '',
                    prdNm: '',
                    qty: 1,
                    unit: 'NOS',
                    unitPrice: 0,
                    txval: 0,
                    sval: 0,
                    iamt: 0,
                    irt: 18,
                    rt: 18,
                    itmVal: 0,
                }
            ]
        }));
    };

    const removeItem = (idx) => {
        setPayload(prev => {
            const items = prev.itemList.filter((_, i) => i !== idx);
            const totals = items.reduce((a, i) => ({
                totinvval: a.totinvval + i.itmVal,
                tottxval: a.tottxval + i.txval,
                totiamt: a.totiamt + i.iamt,
            }), { totinvval: 0, tottxval: 0, totiamt: 0 });
            return { ...prev, itemList: items, ...totals };
        });
    };

    // -------------------------
    // Save Response & Auto-Populate
    // -------------------------
    const saveResponseForAutoPopulate = (data) => {
        if (!data?.response) return;
        const responseData = data.response;

        if (responseData.id) {
            try {
                localStorage.setItem(LAST_GENERATED_ID_KEY, String(responseData.id));
                setPayload(prev => ({ ...prev, lastGeneratedId: String(responseData.id) }));
            } catch (e) {
                console.warn('Could not save generated id to localStorage', e);
            }
        }

        const sharedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        sharedData.companyId = '24';
        sharedData.token = authToken;
        sharedData.irn = responseData.irn;
        sharedData.companyUniqueCode = payload.userGstin;
        sharedData.lastGeneratedResponse = responseData;
        sharedData.lastGeneratedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedData));

        localStorage.setItem(LAST_DOC_DETAILS_KEY, JSON.stringify({
            docNum: payload.no.trim(),
            docDate: payload.dt.trim(),
            docType: payload.docType,
            timestamp: new Date().toISOString()
        }));

        localStorage.setItem(LAST_IRN_KEY, JSON.stringify({ irn: responseData.irn, timestamp: new Date().toISOString() }));

        if (responseData.signedQrCode) {
            localStorage.setItem(LAST_SIGNED_QR_JWT_KEY, responseData.signedQrCode);
        }

        localStorage.setItem(LAST_EWB_DETAILS_KEY, JSON.stringify({
            ewbNo: responseData.ewbNo || '',
            ewbDate: responseData.ewbDate || '',
            timestamp: new Date().toISOString()
        }));

        setLastInvoice?.(responseData.irn, payload.userGstin, payload.no, payload.dt, payload.docType);
    };

    // -------------------------
    // Generate IRN
    // -------------------------
    const handleGenerate = async () => {
        if (!authToken) return alert('Login required!');
        setLoading(true);
        setResponse(null);
        try {
            const res = await fetch('http://localhost:3001/proxy/irn/addInvoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Token': authToken,
                    companyId: '24',
                    product: 'ONYX',
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setResponse(data);

            if (data.status === 'SUCCESS' && data.response?.irn) {
                saveResponseForAutoPopulate(data);
                alert(`IRN Generated Successfully!\nIRN: ${data.response.irn}\nAck No: ${data.response.ackNo}`);
            } else if (data.status === 'FAILURE') {
                const errorMsg = data.errors?.[0]?.msg || 'Unknown error';
                alert(`Generation Failed: ${errorMsg}`);
            }
        } catch (err) {
            setResponse({ error: err.message });
            alert('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // UI
    // -------------------------
    return (
        <div style={styles.container}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={styles.header}>
                    📄 Generate E-Invoice • IRIS ONYX
                </h1>
                
                {/* Headers */}
                <Section title="REQUEST HEADERS">
                    <Grid cols={4}>
                        <ReadOnly label="companyId" value="24" />
                        <ReadOnly label="X-Auth-Token" value={authToken ? authToken.slice(0, 40) + '...' : 'Not logged in'} />
                        <ReadOnly label="product" value="ONYX" />
                        <ReadOnly label="Last Generated ID" value={payload.lastGeneratedId || 'N/A'} />
                    </Grid>
                </Section>
                
                {/* Invoice Header */}
                <Section title="INVOICE HEADER DETAILS">
                    <Grid cols={4}>
                        <Input label="User GSTIN" value={payload.userGstin} onChange={v => setField('userGstin', v)} />
                        <Input label="Invoice No" value={payload.no} onChange={v => setField('no', v)} />
                        <Input label="Date (DD-MM-YYYY)" value={payload.dt} onChange={v => setField('dt', v)} />
                        <Input label="Place of Supply" value={payload.pos} onChange={v => setField('pos', v)} />
                        <Select label="Doc Type" value={payload.docType} options={['RI', 'CR', 'DB']} onChange={v => setField('docType', v)} note="RI=Invoice" />
                        <Select label="Category" value={payload.catg} options={['B2B', 'B2C']} onChange={v => setField('catg', v)} />
                        <Select label="Nature" value={payload.ntr} options={['Inter', 'Intra']} onChange={v => setField('ntr', v)} />
                        <Select label="Reverse Charge" value={payload.rchrg} options={['Y', 'N']} onChange={v => setField('rchrg', v)} />
                    </Grid>
                </Section>
                
                {/* Seller & Buyer Details */}
                <Section title="SELLER DETAILS (SUPPLIER)">
                    <Grid cols={3}>
                        <Input label="GSTIN" value={payload.sgstin} onChange={v => setField('sgstin', v)} />
                        <Input label="Legal Name" value={payload.slglNm} onChange={v => setField('slglNm', v)} />
                        <Input label="Trade Name" value={payload.sbnm} onChange={v => setField('sbnm', v)} />
                        <Input label="Location" value={payload.sloc} onChange={v => setField('sloc', v)} />
                        <Input label="State Code" value={payload.sstcd} onChange={v => setField('sstcd', v)} />
                        <Input label="PIN" value={payload.spin} onChange={v => setField('spin', v)} />
                    </Grid>
                </Section>
                <Section title="BUYER DETAILS (RECIPIENT)">
                    <Grid cols={3}>
                        <Input label="GSTIN" value={payload.bgstin} onChange={v => setField('bgstin', v)} />
                        <Input label="Legal Name" value={payload.blglNm} onChange={v => setField('blglNm', v)} />
                        <Input label="Trade Name" value={payload.bbnm} onChange={v => setField('bbnm', v)} />
                        <Input label="Location" value={payload.bloc} onChange={v => setField('bloc', v)} />
                        <Input label="State Code" value={payload.bstcd} onChange={v => setField('bstcd', v)} />
                        <Input label="PIN" value={payload.bpin} onChange={v => setField('bpin', v)} />
                    </Grid>
                </Section>
                
                {/* Item List */}
                <Section title={`ITEM LIST (${payload.itemList.length} Items)`}>
                    {payload.itemList.map((item, idx) => (
                        <div key={idx} style={styles.itemCard}>
                            <Grid cols={8}>
                                <Input label="Sl No" value={item.num} onChange={v => updateItem(idx, 'num', v)} />
                                <Input label="HSN" value={item.hsnCd} onChange={v => updateItem(idx, 'hsnCd', v)} />
                                <Input label="Description" value={item.prdNm} onChange={v => updateItem(idx, 'prdNm', v)} />
                                <Input label="Qty" type="number" value={item.qty} onChange={v => updateItem(idx, 'qty', v)} />
                                <Select label="Unit" value={item.unit} options={['NOS', 'KGS', 'MTR']} onChange={v => updateItem(idx, 'unit', v)} />
                                <Input label="Rate" type="number" step="0.01" value={item.unitPrice} onChange={v => updateItem(idx, 'unitPrice', v)} />
                                <Input label="IGST %" type="number" value={item.irt} onChange={v => updateItem(idx, 'irt', v)} />
                                <button onClick={() => removeItem(idx)} style={{ ...styles.btnRed, alignSelf: 'flex-end', height: '44px' }}>Remove Item</button>
                            </Grid>
                            <div style={styles.lineTotal}>
                                Line Total: **₹{item.itmVal.toFixed(2)}** (Taxable: ₹{item.txval.toFixed(2)} + IGST: ₹{item.iamt.toFixed(2)})
                            </div>
                        </div>
                    ))}
                    <button onClick={addItem} style={styles.btnGreen}>+ Add New Item</button>
                </Section>
                
                {/* Totals */}
                <Section title="INVOICE TOTALS">
                    <Grid cols={4}>
                        <ReadOnly label="Total Invoice Value" value={`₹${payload.totinvval.toFixed(2)}`} />
                        <ReadOnly label="Total Taxable Value" value={`₹${payload.tottxval.toFixed(2)}`} />
                        <ReadOnly label="Total IGST Amount" value={`₹${payload.totiamt.toFixed(2)}`} />
                        <ReadOnly label="Total Items" value={payload.itemList.length} />
                    </Grid>
                </Section>
                
                {/* Generate Button */}
                <div style={{ textAlign: 'center', margin: '50px 0 70px' }}>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !authToken}
                        style={styles.btnGenerate(loading, authToken)}
                    >
                        {loading ? 'Processing Request...' : '✨ GENERATE IRN NOW'}
                    </button>
                </div>
                
                {/* Response */}
                {response && (
                    <Section title="API RESPONSE (JSON)">
                        <pre style={styles.responseBox(response.status)}>
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </Section>
                )}
            </div>
        </div>
    );
};

export default GenerateIRNForm;