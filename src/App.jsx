import React, { useState, useEffect } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload";
import AirQualityTable from "./components/AirQualityTable";
import AirQualityChart from "./components/AirQualityChart";
import Sidebar from "./components/Sidebar";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar setActivePage={setActivePage} />
      <div className="flex-1 container mx-auto p-4 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">Air Quality Dashboard</h1>
        {activePage === "dashboard" && (
          <>
            <FileUpload
              onDataUploaded={fetchData}
              loading={loading}
              error={error}
            />
            <AirQualityTable data={data} loading={loading} />
          </>
        )}
        {activePage === "analytics" && <AirQualityChart />}
      </div>
    </div>
  );
};

export default App;
