import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AirQualityChart = () => {
  const [data, setData] = useState([]);
  const [fuzzyResult, setFuzzyResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the API
    axios
      .get("http://127.0.0.1:5000/get_data")
      .then((response) => {
        const newData = response.data;
        setData(newData);

        // Assuming fuzzy logic result is part of the response
        if (newData.length > 0 && newData[0].fuzzyResult) {
          const currentFuzzyResult = newData[0].fuzzyResult;
          setFuzzyResult(currentFuzzyResult);
        }
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }, []);

  // Create chart data dynamically based on the fetched data
  const chartData = {
    labels: data.map((item) => item.timestamp),
    datasets: [
      {
        label: "PM2.5 Levels",
        data: data.map((item) => item.pm25),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
      {
        label: "Threshold Algorithm - PM2.5",
        data: data.map((item) => item.pm25),
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
    ],
  };

  const getFuzzyColor = (category) => {
    switch (category) {
      case "Baik":
        return "green";
      case "Sedang":
        return "orange";
      case "Buruk":
        return "red";
      default:
        return "black";
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">
        Air Quality Analysis - Fuzzy vs Threshold Algorithms
      </h2>
      {loading ? <p>Loading data...</p> : <Line data={chartData} />}

      {fuzzyResult && (
        <div className="mt-4 p-4 border rounded-md bg-gray-100">
          <h3 className="font-semibold">Kualitas Udara Fuzzy Logic</h3>
          <p style={{ color: getFuzzyColor("Baik") }}>
            <strong>Baik:</strong> {(fuzzyResult.Baik * 100).toFixed(2)}%
          </p>
          <p style={{ color: getFuzzyColor("Sedang") }}>
            <strong>Sedang:</strong> {(fuzzyResult.Sedang * 100).toFixed(2)}%
          </p>
          <p style={{ color: getFuzzyColor("Buruk") }}>
            <strong>Buruk:</strong> {(fuzzyResult.Buruk * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default AirQualityChart;
