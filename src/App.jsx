import React, { useState, useEffect } from "react";
import axios from "axios";
import AirQualityChart from "./components/airQualityChart";

const App = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(""); // Reset error message when file is selected
  };

  // Validate file extension
  const isFileValid = (file) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    return allowedTypes.includes(file.type);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    if (!isFileValid(file)) {
      setError("Invalid file type. Please upload an .xlsx file.");
      return;
    }

    setLoading(true); // Start loading

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload_data",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("File uploaded successfully!");
      fetchData(); // Re-fetch data after successful upload
      setFile(null); // Reset the file input
    } catch (error) {
      setError("Error uploading file: " + error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch air quality data from Flask API
  const fetchData = async () => {
    setLoading(true); // Set loading true when fetching data
    try {
      const response = await axios.get("http://127.0.0.1:5000/get_data");
      setData(response.data);
    } catch (error) {
      setError("Error fetching data: " + error.message);
    } finally {
      setLoading(false); // Set loading false after fetching
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on initial load
  }, []);

  return (
    <div>
      <h1>Air Quality Dashboard</h1>

      <div>
        <h2>Upload Excel File</h2>
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}{" "}
        {/* Show error message */}
      </div>

      <h2>Air Quality Data</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Suhu (°C)</th>
            <th>Kelembapan (%)</th>
            <th>PM2.5 (µg/m³)</th>
            <th>Status Kualitas Udara</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5">Loading data...</td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index}>
                <td>{row.timestamp}</td>
                <td>{row.temperature}</td>
                <td>{row.humidity}</td>
                <td>{row.pm25}</td>
                <td>{row.air_quality}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <AirQualityChart />
    </div>
  );
};

export default App;
