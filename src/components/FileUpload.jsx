import React, { useState } from "react";
import axios from "axios";

const FileUpload = ({ onDataUploaded, loading, error }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const isFileValid = (file) =>
    file?.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const handleFileUpload = async () => {
    if (!file) return;

    if (!isFileValid(file)) {
      alert("Invalid file type. Please upload an .xlsx file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:5000/upload_data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onDataUploaded();
      setFile(null);
    } catch (error) {
      alert("Error uploading file: " + error.message);
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Upload Excel File</h2>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="border rounded p-2"
      />
      <button
        onClick={handleFileUpload}
        disabled={loading}
        className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default FileUpload;
