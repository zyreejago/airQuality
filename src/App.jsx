import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import FileUpload from "./components/FileUpload";
import AirQualityTable from "./components/AirQualityTable";
import AirQualityChart from "./components/AirQualityChart";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Register from "./components/Register";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/get_data");
      setData(response.data);
    } catch (error) {
      setError("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} fetchData={fetchData} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                data={data}
                loading={loading}
                setActivePage={setActivePage}
                activePage={activePage}
                fetchData={fetchData}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      )}
    </Router>
  );
};

const Dashboard = ({ data, loading, setActivePage, activePage, fetchData }) => {
  useEffect(() => {
    fetchData();
  }, [activePage]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col w-full overflow-hidden p-4">
        <h1 className="text-3xl font-bold mb-4">Air Quality</h1>
        {activePage === "dashboard" && (
          <>
            <FileUpload onDataUploaded={fetchData} loading={loading} />
            <AirQualityTable data={data} loading={loading} />
          </>
        )}
        {activePage === "analytics" && (
          <div className="w-full h-full overflow-auto">
            <AirQualityChart />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
