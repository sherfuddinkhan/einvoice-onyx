import React, { useState } from 'react';
import { useAuth } from './AuthContext';

// Define the common storage key
const STORAGE_KEY = 'iris_einvoice_shared_config';

// -------------------------
// STYLES
// -------------------------
const colors = {
    primary: '#1A73E8', 
    primaryDark: '#0B4F9C',
    primaryLight: '#E8F0FE',
    success: '#34A853', 
    danger: '#EA4335',
    background: '#F5F5F7',
    cardBackground: '#FFFFFF',
    textDark: '#333333',
    textLight: '#707070',
    codeBg: '#263238',
    codeText: '#A8FFBF',
};

const styles = {
    container: {
        padding: '40px',
        background: colors.background,
        minHeight: '100vh',
        fontFamily: 'Roboto, Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        background: colors.cardBackground,
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        width: '450px',
    },
    header: {
        textAlign: 'center',
        color: colors.primaryDark,
        fontSize: '32px',
        marginBottom: '30px',
        fontWeight: 500,
    },
    label: {
        fontWeight: 600,
        color: colors.textDark,
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${colors.textLight}`,
        fontSize: '16px',
        marginBottom: '20px',
        transition: 'border-color 0.2s',
    },
    btnPrimary: (loading) => ({
        width: '100%',
        padding: '15px',
        background: loading ? '#BDBDBD' : colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        fontSize: '20px',
        marginTop: '20px',
        transition: 'all 0.3s',
        boxShadow: loading ? 'none' : `0 4px 15px rgba(26, 115, 232, 0.3)`,
    }),
    section: {
        marginBottom: '15px',
        padding: '15px',
        backgroundColor: colors.primaryLight,
        borderRadius: '8px',
        borderLeft: `5px solid ${colors.primary}`,
    },
    codeBox: (isResponse) => ({
        background: isResponse ? colors.codeBg : colors.cardBackground,
        color: isResponse ? colors.codeText : colors.textDark,
        padding: '10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        margin: '8px 0 0',
        border: `1px solid ${isResponse ? colors.primaryDark : '#ddd'}`,
        fontSize: '13px',
    }),
    responseBox: (status) => ({
        marginTop: '30px',
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: status === 'SUCCESS' ? colors.success + '1A' : colors.danger + '1A',
        border: `2px solid ${status === 'SUCCESS' ? colors.success : colors.danger}`,
    }),
};

// -------------------------
// MAIN COMPONENT
// -------------------------
const LoginForm = () => {
    const [email, setEmail] = useState('ateeq@calibrecue.com');
    const [password, setPassword] = useState('Abcd@1234567');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const endpoint = 'http://localhost:3001/proxy/login';
    const method = 'POST';

    const headers = { 'Content-Type': 'application/json' };
    const requestBody = { email, password };

    const handleLogin = async () => {
        setLoading(true);
        setResponse(null);
        try {
            const res = await fetch(endpoint, {
                method,
                headers,
                body: JSON.stringify(requestBody),
            });
            const data = await res.json();
            setResponse(data);

            if (data.status === 'SUCCESS' && data.response?.token) {
                const authToken = data.response.token;
                
                // ✅ Extract companyId directly from the response, with fallback
                const companyId = data.response.companyId || '24'; 
                
                // 1. Update global AuthContext
                login(authToken);

                // 2. Load existing config and save new auth details
                const existingConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                const newConfig = {
                    ...existingConfig,
                    token: authToken,
                    companyId: companyId,
                    lastLogin: new Date().toISOString()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));

                console.log(`Saved to LocalStorage: Token, CompanyId (${companyId})`);
            }
        } catch (error) {
            setResponse({ status: 'ERROR', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>🔓 API Gateway Login</h2>

                {/* Input Fields */}
                <label style={styles.label}>Email</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Email" 
                    style={styles.input} 
                />
                
                <label style={styles.label}>Password</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Password" 
                    style={styles.input} 
                />
                
                {/* Request Details */}
                <div style={styles.section}>
                    <strong>Endpoint:</strong> <pre style={styles.codeBox(false)}>{endpoint}</pre>
                </div>
                
                <div style={styles.section}>
                    <strong>Headers:</strong> <pre style={styles.codeBox(false)}>{JSON.stringify(headers, null, 2)}</pre>
                </div>
                
                <div style={styles.section}>
                    <strong>Request Body:</strong> <pre style={styles.codeBox(false)}>{JSON.stringify(requestBody, null, 2)}</pre>
                </div>

                {/* Login Button */}
                <button 
                    onClick={handleLogin} 
                    disabled={loading}
                    style={styles.btnPrimary(loading)}
                >
                    {loading ? 'Logging In...' : 'LOGIN & SAVE CONFIG'}
                </button>

                {/* Response */}
                {response && (
                    <div style={styles.responseBox(response.status)}>
                        <h3 style={{ color: response.status === 'SUCCESS' ? colors.success : colors.danger, margin: '0 0 10px' }}>
                            Status: {response.status}
                        </h3>
                        <strong>Response Body:</strong>
                        <pre style={styles.codeBox(true)}>{JSON.stringify(response, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginForm;