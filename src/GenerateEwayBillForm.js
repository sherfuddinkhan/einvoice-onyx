// GenerateEwayBillForm.js

import React, { useState } from "react";
import axios from "axios";

const GenerateEwayBillForm = () => {
  const [formData, setFormData] = useState({
    userGstin: "",
    supplyType: "",
    ntr: "",
    docType: "",
    catg: "",
    dst: "",
    trnTyp: "",
    no: "",
    dt: "",
    pos: "",
    rchrg: "",
    sgstin: "",
    slglNm: "",
    sbnm: "",
    sloc: "",
    sstcd: "",
    spin: "",
    bgstin: "",
    blglNm: "",
    bbnm: "",
    bloc: "",
    bstcd: "",
    bpin: "",
    taxSch: "",
    totinvval: 0,
    tottxval: 0,
    totiamt: 0,
    subSplyTyp: "",
    genIrn: true,
    genewb: "Y",
    signedDataReq: true,
    itemList: [
      {
        num: "",
        hsnCd: "",
        prdNm: "",
        qty: "",
        unit: "",
        unitPrice: "",
        txval: "",
        sval: "",
        iamt: "",
        irt: "",
        rt: "",
        itmVal: "",
      },
    ],
    transMode: "",
    vehTyp: "",
    transDist: "",
    transName: "",
    transDocNo: "",
    transDocDate: "",
    vehNo: "",
    transId: "",
    irn: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateEwb = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/proxy/irn/generateEwbByIrn",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": localStorage.getItem("token"),
            companyId: "24",
            product: "ONYX",
          },
        }
      );
      setResult(response.data);
    } catch (error) {
      setResult(error.response?.data || { error: "Failed to generate EWB" });
    }
  };

  return (
    <div>
      <h2>Generate E-Way Bill by IRN</h2>

      <input
        name="userGstin"
        placeholder="User GSTIN"
        onChange={handleChange}
      />

      <button onClick={generateEwb}>Generate EWB</button>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default GenerateEwayBillForm;
