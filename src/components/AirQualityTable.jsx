import React from "react";

const AirQualityTable = ({ data, loading }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Air Quality Data</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : data.length > 0 ? (
        <div className="overflow-x-auto max-h-96 border border-gray-300 rounded-md">
          <table className="table-auto w-full border-collapse">
            <thead className="sticky top-0 bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Timestamp</th>
                <th className="px-4 py-2 border">Suhu (°C)</th>
                <th className="px-4 py-2 border">Kelembapan (%)</th>
                <th className="px-4 py-2 border">PM2.5 (µg/m³)</th>
                <th className="px-4 py-2 border">PM10 (µg/m³)</th>
                <th className="px-4 py-2 border">CO2 (ppm)</th>
                <th className="px-4 py-2 border">CO (ppm)</th>
                <th className="px-4 py-2 border">VOC (ppb)</th>
                <th className="px-4 py-2 border">Status Kualitas Udara</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 border">{row.timestamp}</td>
                  <td className="px-4 py-2 border">{row.temperature}</td>
                  <td className="px-4 py-2 border">{row.humidity}</td>
                  <td className="px-4 py-2 border">{row.pm25}</td>
                  <td className="px-4 py-2 border">{row.pm10}</td>
                  <td className="px-4 py-2 border">{row.co2}</td>
                  <td className="px-4 py-2 border">{row.co}</td>
                  <td className="px-4 py-2 border">{row.voc}</td>
                  <td className="px-4 py-2 border">{row.air_quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default AirQualityTable;
