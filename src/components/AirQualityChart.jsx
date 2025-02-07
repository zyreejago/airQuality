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
  const [latestQuality, setLatestQuality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/get_data")
      .then((response) => {
        const newData = response.data;
        setData(newData);

        // Ambil kualitas udara dari data terakhir
        if (newData.length > 0) {
          setLatestQuality(newData[newData.length - 1]); // Data terakhir
        }
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }, []);

  // Algoritma Fuzzy
  const fuzzy_pm25 = (pm25) => {
    if (pm25 < 50) return "Baik";
    else if (pm25 >= 50 && pm25 < 100) return "Sedang";
    else if (pm25 >= 100 && pm25 < 300) return "Buruk";
    else if (pm25 >= 300 && pm25 < 500) return "Sangat Buruk";
    return "Berbahaya";
  };

  // Threshold Logic untuk PM2.5
  const threshold_pm25 = (pm25) => {
    if (pm25 < 50) return "Baik";
    else if (pm25 >= 50 && pm25 < 100) return "Sedang";
    else if (pm25 >= 100 && pm25 < 300) return "Buruk";
    else if (pm25 >= 300 && pm25 < 500) return "Sangat Buruk";
    return "Berbahaya";
  };

  // Menyiapkan data untuk chart
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
        label: "PM10 Levels",
        data: data.map((item) => item.pm10),
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: "CO2 Levels",
        data: data.map((item) => item.co2),
        borderColor: "rgba(255, 165, 0, 1)",
        fill: false,
      },
      {
        label: "CO Levels",
        data: data.map((item) => item.co),
        borderColor: "rgba(0, 0, 255, 1)",
        fill: false,
      },
      {
        label: "VOC Levels",
        data: data.map((item) => item.voc),
        borderColor: "rgba(128, 0, 128, 1)",
        fill: false,
      },
      // Dataset untuk Fuzzy Logic
      {
        label: "Fuzzy PM2.5",
        data: data.map((item) => fuzzy_pm25(item.pm25)),
        borderColor: "rgba(0, 255, 0, 1)", // Green color for Fuzzy Algorithm
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
      // Dataset untuk Threshold Logic
      {
        label: "Threshold PM2.5",
        data: data.map((item) => threshold_pm25(item.pm25)),
        borderColor: "rgba(255, 165, 0, 1)", // Orange color for Threshold Logic
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Memastikan grafik tidak terlalu kecil
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  const getFuzzyColor = (category) => {
    switch (category) {
      case "Baik":
        return "green";
      case "Sedang":
        return "orange";
      case "Buruk":
        return "red";
      case "Sangat Buruk":
        return "darkred";
      case "Berbahaya":
        return "black";
      default:
        return "gray";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Air Quality Analysis - Fuzzy Logic vs Threshold Logic
      </h2>

      {/* Menampilkan grafik */}
      {loading ? (
        <p className="text-center">Loading data...</p>
      ) : (
        <div className="bg-white p-4 shadow rounded-lg w-full max-w-5xl mx-auto">
          <h3 className="text-lg font-semibold mb-2 text-center">
            Grafik Kualitas Udara
          </h3>
          <div className="w-full h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Menampilkan kualitas udara terkini */}
      {latestQuality && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-100 text-center">
          <h3 className="font-semibold text-lg">Kualitas Udara Saat Ini</h3>
          <p className="mt-2">
            <strong>Waktu:</strong> {latestQuality.timestamp}
          </p>
          <p className="mt-1">
            <strong>Kualitas Udara:</strong>{" "}
            <span style={{ color: getFuzzyColor(latestQuality.air_quality) }}>
              {latestQuality.air_quality}
            </span>
          </p>
        </div>
      )}

      {/* Menampilkan riwayat perhitungan */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Riwayat Perhitungan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Timestamp</th>
                <th className="border p-2">PM2.5</th>
                <th className="border p-2">PM10</th>
                <th className="border p-2">CO2</th>
                <th className="border p-2">CO</th>
                <th className="border p-2">VOC</th>
                <th className="border p-2">Kualitas Udara</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-10).map((item, index) => (
                <tr key={index} className="text-center">
                  <td className="border p-2">{item.timestamp}</td>
                  <td className="border p-2">{item.pm25}</td>
                  <td className="border p-2">{item.pm10}</td>
                  <td className="border p-2">{item.co2}</td>
                  <td className="border p-2">{item.co}</td>
                  <td className="border p-2">{item.voc}</td>
                  <td
                    className="border p-2 font-semibold"
                    style={{ color: getFuzzyColor(item.air_quality) }}
                  >
                    {item.air_quality}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Menampilkan perbandingan hasil algoritma */}
      <div className="mt-6 p-4 border rounded-lg bg-gray-100 text-center">
        <h3 className="font-semibold text-lg">Perbandingan Hasil Algoritma</h3>
        <div className="w-full h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AirQualityChart;
