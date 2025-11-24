// server.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
// ADD THIS AT THE TOP
const multer = require("multer");
const upload = multer(); // memory storage (buffer)
const FormData = require("form-data");
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MIDDLEWARE
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());

// BASE URL
const BASE_URL = 'https://stage-api.irisgst.com';

// Helper to forward auth headers
// Case-insensitive auth headers (critical fix!)
const authHeaders = (req) => ({
  "X-Auth-Token": req.headers["x-auth-token"] || req.headers["X-Auth-Token"],
  companyId: req.headers.companyid || req.headers.CompanyId || req.headers.companyId,
  product: req.headers.product || "ONYX",
});

// 1. LOGIN (already working)
app.post('/proxy/login', async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/irisgst/mgmt/login`,
      req.body,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Proxy error' }
    );
  }
});

// 2. CHANGE PASSWORD (already working)
app.post('/proxy/change-password', async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/irisgst/mgmt/public/user/changepassword`,
      req.body,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Proxy error' }
    );
  }
});

// 3. GENERATE IRN (GenerateIRNForm)
app.post('/proxy/irn/addInvoice', async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/irisgst/onyx/irn/addInvoice`,
      req.body,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(req),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to generate IRN' }
    );
  }
});

// 4. GET INVOICE BY IRN (GetByIRNForm)
app.get('/proxy/irn/getInvByIrn', async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/irisgst/onyx/irn/getInvByIrn`,
      {
        params: req.query,
        headers: {
          'Accept': 'application/json',
          ...authHeaders(req),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to fetch invoice' }
    );
  }
});

  // Cancel IRN 
// Proxy for Cancel IRN
app.put('/proxy/irn/cancel', async (req, res) => {
  try {
    const targetUrl = `${BASE_URL}/irisgst/onyx/irn/cancel`;

    // Forwarding all required headers
    const irisResponse = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Accept': req.headers['accept'] || 'application/json',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'companyId': req.headers['companyid'],
        'X-Auth-Token': req.headers['x-auth-token'],
        'userGstin': req.headers['usergstin'],
        'product': req.headers['product'] || 'ONYX'
      },
      body: JSON.stringify(req.body)
    });

    const data = await irisResponse.json();
    res.status(irisResponse.status).json(data);

  } catch (err) {
    console.error('Cancel IRN Proxy Error:', err);
    res.status(500).json({ status: 'FAILURE', message: err.message });
  }
});






// 5. GET IRN BY DOC DETAILS (GetByDocForm)
app.get('/proxy/irn/getIrnByDocDetails', async (req, res) => {
  try {
    const { docNum, docType, userGstin, docDate } = req.query;

    // Validate required query params
    if (!docNum || !docType || !userGstin || !docDate) {
      return res.status(400).json({
        error: 'Missing required query parameters: docNum, docType, userGstin, docDate'
      });
    }

    // Build exact target URL
    const targetUrl = `https://stage-api.irisgst.com/irisgst/onyx/irn/getIrnByDocDetails?` +
      `docNum=${encodeURIComponent(docNum)}&` +
      `docType=${encodeURIComponent(docType)}&` +
      `userGstin=${encodeURIComponent(userGstin)}&` +
      `docDate=${encodeURIComponent(docDate.replace(/-/g, '/'))}`; 

    // Extract and forward required headers
    const forwardedHeaders = {
      'Accept': 'application/json',
      'X-Auth-Token': req.headers['x-auth-token'] || '',
      'companyId': req.headers['companyid'] || '24',
      'product': req.headers['product'] || 'ONYX',
      //'docType': req.headers['doctype'],
      //'userGstin': req.headers['usergstin'],
      //'docDate': req.headers['docdate'],
    };

    const response = await axios.get(targetUrl, { headers: forwardedHeaders });
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to fetch IRN by doc' }
    );
  }
});

// 6. GET E-WAY BILL BY IRN (GetEWBForm)
app.get('/proxy/irn/getEwbByIrn', async (req, res) => {
  console.log('Query params:', req.query); // DEBUG

  const { irn, userGstin, updateFlag } = req.query; // <-- MUST BE req.query for GET

  if (!irn || !userGstin) {
    return res.status(400).json({ error: 'Missing irn or userGstin in query' });
  }

  const targetUrl = `https://stage-api.irisgst.com/irisgst/onyx/irn/getEwbByIrn?` +
    `irn=${encodeURIComponent(irn)}&userGstin=${encodeURIComponent(userGstin)}&updateFlag=${updateFlag || 'true'}`;

  const response = await axios.get(targetUrl, {
    headers: {
      'Accept': 'application/json',
      'X-Auth-Token': req.headers['x-auth-token'] || '',
      'companyId': req.headers['companyid'] || '24',
      'product': req.headers['product'] || 'ONYX',
      'userGstin': req.headers['usergstin'] || userGstin, // Fallback to query
      'irn': req.headers['irn'] || irn,
      'updateFlag': req.headers['updateflag'] || updateFlag,
    },
  });

  res.json(response.data);
});

// 7. CANCEL IRN (CancelIRNForm)
app.put('/proxy/irn/cancel', async (req, res) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/irisgst/onyx/irn/cancel`,
      req.body,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(req),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to cancel IRN' }
    );
  }
});

// 8. VERIFY SIGNED QR CODE (VerifyQRForm)
// POST: /proxy/einvoice/verifySignature
app.post('/proxy/einvoice/verifySignature', async (req, res) => {
  try {
    const { jwt } = req.body;

    if (!jwt) {
      return res.status(400).json({ error: 'Missing jwt in request body' });
    }

    const targetUrl = 'https://stage-api.irisgst.com/irisgst/onyx/einvoice/verifySignature';

    const response = await axios.post(
      targetUrl,
      { jwt }, // ← Send exactly this
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': req.headers['x-auth-token'] || '',
          'companyId': req.headers['companyid'] || '24',
          'product': req.headers['product'] || 'ONYX',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: 'Failed to verify JWT' }
    );
  }
});


// 9. GENERATE E-WAY BILL BY IRN (GenerateEWBByIRN)
app.put('/proxy/irn/generateEwbByIrn', async (req, res) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/irisgst/onyx/irn/generateEwbByIrn`,
      req.body,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(req),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to generate E-Way Bill' }
    );
  }
});

// 10. CANCEL E-WAY BILL (CancelEWB)
app.put('/proxy/irn/cancelEwb', async (req, res) => {
  try {
    const { ewbNo, cnlRsn, cnlRem, userGstin } = req.body;

    if (!ewbNo || !cnlRsn || !userGstin || cnlRem) {
      return res.status(400).json({
        error: 'Missing required fields: ewbNo, cnlRsn, userGstin'
      });
    }

    const response = await axios.put(
      `${BASE_URL}/irisgst/onyx/irn/cancelEwb`,
      req.body,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(req),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to cancel E-Way Bill' }
    );
  }
});

// 11. PRINT E-INVOICE (PrintEInvoice)
app.get('/proxy/einvoice/print', async (req, res) => {
  try {
    const { template = 'STANDARD', id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing required query parameter: id' });
    }

    const targetUrl = `${BASE_URL}/irisgst/onyx/einvoice/print`;
    const response = await axios.get(targetUrl, {
      params: { template, id },
      headers: {
        'Accept': '*/*',
        ...authHeaders(req),
      },
      responseType: 'arraybuffer', // Important for binary PDF data
    });

    // Set proper headers for PDF response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="einvoice_${id}.pdf"`,
    });

    res.send(response.data);
  } catch (error) {
    if (error.response?.data) {
      // If backend returns JSON error even in binary endpoint
      try {
        const errMsg = JSON.parse(Buffer.from(error.response.data).toString());
        return res.status(error.response.status).json(errMsg);
      } catch {
        // Fall back to binary error if not JSON
      }
    }
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to print E-Invoice' }
    );
  }
});

// 12. VIEW INVOICES (Filter & List Invoices)
app.post('/proxy/onyx/einvoice/view', async (req, res) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/irisgst/onyx/einvoice/view`,
      req.body,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeaders(req),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: "Failed to fetch invoice list" }
    );
  }
});

// 13. GET INVOICE DETAILS BY ID
app.get('/proxy/einvoice/details', async (req, res) => {
  try {
    const { einvId } = req.query;
    if (!einvId) {
      return res.status(400).json({ error: 'Missing required query parameter: einvId' });
    }

    const response = await axios.get(`${BASE_URL}/irisgst/onyx/einvoice/details`, {
      params: { einvId },
      headers: {
        'Accept': 'application/json',
        ...authHeaders(req),
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to fetch invoice details' }
    );
  }
});

// 14. REQUEST E-INVOICE DOWNLOAD
// ====================== DOWNLOAD E-INVOICES (ONE-CLICK) ======================
app.post("/proxy/onyx/download/einvoices", async (req, res) => {
  console.log("Download request received");
  console.log("Headers:", req.headers);
  console.log("Payload:", req.body);

  try {
    const response = await axios.post(
      `${BASE_URL}/irisgst/onyx/download/einvoices`,
      req.body,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          product: "ONYX",
          ...authHeaders(req),
        },
        timeout: 120000, // 2 minutes
      }
    );

    console.log("IRIS Success:", response.data);

    // For small date ranges → IRIS returns filePath immediately!
    res.json(response.data);

  } catch (error) {
    console.error("IRIS Download Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: "Failed to initiate download" }
    );
  }
});



// 15. REQUEST GSTR-1 DOWNLOAD
// 
app.post("/proxy/onyx/download/gstr1", async (req, res) => {
  try {
    const { companyUniqueCode, gstin, returnPeriod } = req.body;
    if (!companyUniqueCode || !gstin || !returnPeriod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/irisgst/onyx/download/gstr1`,
      data: req.body,
      headers: {
        Accept: "*/*", // Important: accept any content type
        "Content-Type": "application/json",
        ...authHeaders(req),
      },
      responseType: "arraybuffer", // Critical for binary ZIP
      validateStatus: () => true, // Handle all statuses
    });

    // Forward headers
    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }
    if (response.headers["content-disposition"]) {
      res.set("Content-Disposition", response.headers["content-disposition"]);
    }

    // Send raw buffer (handles both JSON and ZIP)
    res.status(response.status).send(response.data);

  } catch (error) {
    console.error("Proxy error:", error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Failed to download GSTR-1" });
  }
});


// 16. CHECK DOWNLOAD STATUS (E-Invoice or GSTR-1)
// server.js — Add this route
// GET: Check download status (official IrisGST Onyx API)
app.get("/proxy/onyx/download/status", async (req, res) => {
  try {
    const { companyCode, downloadType, downloadId } = req.query;

    if (!companyCode || !downloadType || !downloadId) {
      return res.status(400).json({
        error: "Missing required query params: companyCode, downloadType, downloadId"
      });
    }

    const response = await axios.get(
      `${BASE_URL}/irisgst/onyx/download/status`,
      {
        params: {
          companyCode,
          downloadType, // Dnld_Gstr1 or EINV_DATA
          downloadId,   // <--- required now
        },
        headers: {
          Accept: "application/json",
          companyId: req.headers["companyid"],
          "X-Auth-Token": req.headers["x-auth-token"],
          product: req.headers["product"] || "ONYX",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Download status error:",
      error.response?.data || error.message
    );
    res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || { error: "Failed to check download status" }
      );
  }
});


// 17. GET BUSINESS HIERARCHY
app.get('/proxy/company/businesshierarchy', async (req, res) => {
  try {
    const { companyid } = req.query;
    if (!companyid) {
      return res.status(400).json({ error: 'Missing required query parameter: companyid' });
    }

    const response = await axios.get(`${BASE_URL}/irisgst/mgmt/company/businesshierarchy`, {
      params: { companyid },
      headers: {
        'Accept': 'application/json',
        ...authHeaders(req),
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to fetch business hierarchy' }
    );
  }
});

// 18. ADD ROOT/LEGAL/FILING BUSINESS
app.put('/proxy/company/business', async (req, res) => {
  try {
    const { companyname, gstinno, parentid, entitytype, address, pincode } = req.body;
    if (!companyname || !gstinno || !parentid || !entitytype) {
      return res.status(400).json({
        error: 'Missing required fields: companyname, gstinno, parentid, entitytype'
      });
    }

    const response = await axios.put(
      `${BASE_URL}/irisgst/mgmt/company/business`,
      req.body,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(req),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to add business' }
    );
  }
});

// 19. GET ASSIGNED PLACE OF BUSINESSES (GSTINs Access & POB List)
app.get('/proxy/user/getAssignedPlaceOfBusinesses', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: 'Missing required query parameter: companyId' });
    }

    const response = await axios.get(`${BASE_URL}/irisgst/mgmt/user/getAssignedPlaceOfBusinesses`, {
      params: { companyId },
      headers: {
        'Accept': 'application/json',
        ...authHeaders(req),
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: 'Failed to fetch assigned places of business' }
    );
  }
});
// 20. GET ASSIGNED GSTINS (FILING BUSINESS)
app.get('/proxy/user/company/filingbusiness', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Missing required query parameter: companyId'
      });
    }

    // Extract token from incoming request headers
    const token = req.headers['x-auth-token'];

    if (!token) {
      return res.status(401).json({
        error: 'Missing X-Auth-Token'
      });
    }

    const response = await axios.get(
      `${BASE_URL}/irisgst/mgmt/user/company/filingbusiness`,
      {
        headers: {
          Accept: "application/json",
          "X-Auth-Token": token,
          companyId: companyId,       // <-- required in headers only
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: "Failed to fetch filing business GSTINs" }
    );
  }
});



// Add Entity Proxy Route
app.put('/proxy/entity/add', async (req, res) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/irisgst/mgmt/company/business`,
      req.body,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(req),   // companyId, X-Auth-Token, product: ONYX
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(
        error.response
          ? error.response.data
          : { error: 'Failed to add entity' }
      );
  }
});


// -------------------------------------
// ASSIGNED PLACE OF BUSINESSES ENDPOINT
// -------------------------------------

app.get('/proxy/assigned-place-of-businesses', async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/irisgst/mgmt/user/getAssignedPlaceOfBusinesses`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(req), // companyId, X-Auth-Token, product: ONYX
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(
        error.response
          ? error.response.data
          : { error: 'Failed to fetch assigned places of business' }
      );
  }
});


// On your server running at http://localhost:3001
app.get('/proxy/irisgst/mgmt/user/company/filingbusiness', async (req, res) => {
  try {
    const { companyId = '24' } = req.query;

    const response = await axios.get(
      `https://stage-api.irisgst.com/irisgst/mgmt/user/company/filingbusiness`,
      {
        params: { companyId },
        headers: {
          'Accept': 'application/json',
          'companyId': companyId,
          'X-Auth-Token': process.env.IRIS_TOKEN || 'your-valid-token-here',
          'product': 'ONYX',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: 'Proxy failed' });
  }
});


// UPLOAD INVOICE FILE (CSV / ZIP)
app.post('/proxy/onyx/upload/invoices', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const companyUniqueCode = req.query.companyUniqueCode;
    if (!companyUniqueCode) {
      return res.status(400).json({ error: "companyUniqueCode is required" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      `${BASE_URL}/irisgst/onyx/upload/invoices`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...authHeaders(req),
        },
        params: { companyUniqueCode },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: "Failed to upload invoice file" }
    );
  }
});
// UPLOAD STATUS CHECK
app.get('/proxy/onyx/upload/status', async (req, res) => {
  try {
    const { uploadId } = req.query;

    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required" });
    }

    const response = await axios.get(
      `${BASE_URL}/irisgst/onyx/upload/status`,
      {
        headers: {
          Accept: "application/json",
          ...authHeaders(req),
        },
        params: { uploadId },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: "Failed to get upload status" }
    );
  }
});
// UPLOAD ERROR DETAILS
app.get('/proxy/onyx/upload/errors', async (req, res) => {
  try {
    const { uploadId, page, size } = req.query;

    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required" });
    }

    const response = await axios.get(
      `${BASE_URL}/irisgst/onyx/upload/errors`,
      {
        headers: {
          Accept: "application/json",
          ...authHeaders(req),
        },
        params: { uploadId, page, size },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json(
      error.response ? error.response.data : { error: "Failed to fetch upload errors" }
    );
  }
});

// 404 HANDLER
//Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`CORS allowed: http://localhost:3002, http://localhost:3000`);
});