import React from "react";

const Sidebar = ({ setActivePage }) => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col flex-shrink-0">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <ul>
        <li
          className="mb-2 hover:bg-gray-700 p-2 rounded cursor-pointer"
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </li>
        {/* <li
          className="mb-2 hover:bg-gray-700 p-2 rounded cursor-pointer"
          onClick={() => setActivePage("upload")}
        >
          Upload Data
        </li> */}
        <li
          className="mb-2 hover:bg-gray-700 p-2 rounded cursor-pointer"
          onClick={() => setActivePage("analytics")}
        >
          Analytics
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
