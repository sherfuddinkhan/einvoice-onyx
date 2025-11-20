// src/api/onyxApi.js
import axios from "axios";

// Replace this with your actual IRISGST Onyx base URL
const BASE_URL = "https://your-irisgst-base-url.com";

// -------------------- Helper: Get Headers --------------------
const getHeaders = (isFile = false) => ({
  "Content-Type": isFile ? "multipart/form-data" : "application/json",
  "X-Auth-Token": localStorage.getItem("authToken") || "",
  "companyId": localStorage.getItem("companyId") || "",
  "product": "ONYX",
});

// -------------------- Upload Invoice --------------------
export const uploadInvoice = async (companyUniqueCode, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${BASE_URL}/irisgst/onyx/upload/invoices`, formData, {
    headers: getHeaders(true),
    params: { companyUniqueCode },
  });
};

// -------------------- Upload Status --------------------
export const getUploadStatus = async (uploadId) => {
  return axios.get(`${BASE_URL}/irisgst/onyx/upload/status`, {
    headers: getHeaders(),
    params: { uploadId },
  });
};

// -------------------- Upload Errors --------------------
export const getUploadErrors = async (uploadId, page = 0, size = 50) => {
  return axios.get(`${BASE_URL}/irisgst/onyx/upload/errors`, {
    headers: getHeaders(),
    params: { uploadId, page, size },
  });
};
