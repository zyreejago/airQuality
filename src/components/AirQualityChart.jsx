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

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function AirQualityChart() {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [fuzzyResult, setFuzzyResult] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/get_data").then((response) => {
      setData(response.data);
      if (response.data.length > 0) {
        const lastPm25 = response.data[response.data.length - 1].PM25;
        axios
          .get(`http://127.0.0.1:5000/fuzzy_air_quality?pm25=${lastPm25}`)
          .then((res) => setFuzzyResult(res.data))
          .catch((error) => console.error("Error fetching fuzzy data", error));
      }
    });
  }, []);

  const charttData = {
    labels: data.map((entry) => entry.Timestamp),
    datasets: [
      {
        label: "PM2.5 Levels",
        data: data.map((entry) => entry.PM25),
        borderColor: "blue",
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

  useEffect(() => {
    if (data.length > 0) {
      const timestamps = data.map((item) => item.timestamp);
      const pm25Values = data.map((item) => item.pm25);

      setChartData({
        labels: timestamps,
        datasets: [
          {
            label: "PM2.5 Levels",
            data: pm25Values,
            borderColor: "rgba(75, 192, 192, 1)",
            fill: false,
          },
        ],
      });

      // Ambil nilai PM2.5 terbaru untuk fuzzy logic
      const latestPM25 = pm25Values[pm25Values.length - 1];

      axios
        .get(`http://127.0.0.1:5000/fuzzy_air_quality?pm25=${latestPM25}`)
        .then((response) => {
          setFuzzyResult(response.data);
        })
        .catch((error) => console.error(error));
    }
  }, [data]);

  return (
    <div>
      <h2>Air Quality - PM2.5 Levels</h2>
      {chartData ? <Line data={chartData} /> : <p>Loading data...</p>}

      {fuzzyResult ? (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          <h3>Kualitas Udara Fuzzy Logic</h3>
          <p>
            <strong>Baik:</strong> {fuzzyResult.Baik}
          </p>
          <p>
            <strong>Sedang:</strong> {fuzzyResult.Sedang}
          </p>
          <p>
            <strong>Buruk:</strong> {fuzzyResult.Buruk}
          </p>
        </div>
      ) : (
        <p>Memproses data fuzzy...</p>
      )}
      <div>
        <h2>Grafik Kualitas Udara (PM2.5)</h2>
        <Line data={charttData} />

        {fuzzyResult ? (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <h3>Kualitas Udara Fuzzy Logic</h3>
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
        ) : (
          <p>Memproses data fuzzy...</p>
        )}
      </div>
    </div>
  );
}

export default AirQualityChart;
