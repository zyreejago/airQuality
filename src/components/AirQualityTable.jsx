import React from "react";

const AirQualityTable = ({ data, loading }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Air Quality Data</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : data.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2">Suhu (°C)</th>
              <th className="px-4 py-2">Kelembapan (%)</th>
              <th className="px-4 py-2">PM2.5 (µg/m³)</th>
              <th className="px-4 py-2">Status Kualitas Udara</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{row.timestamp}</td>
                <td className="px-4 py-2">{row.temperature}</td>
                <td className="px-4 py-2">{row.humidity}</td>
                <td className="px-4 py-2">{row.PM25}</td>
                <td className="px-4 py-2">{row.air_quality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default AirQualityTable;
