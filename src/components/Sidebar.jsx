import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ setActivePage }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <ul>
        <li
          className="mb-2 hover:bg-gray-700 p-2 rounded cursor-pointer"
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </li>
        <li
          className="mb-2 hover:bg-gray-700 p-2 rounded cursor-pointer"
          onClick={() => setActivePage("analytics")}
        >
          Analytics
        </li>
        <li
          onClick={handleLogout}
          className="mb-2 hover:bg-gray-700 p-2 rounded cursor-pointer"
        >
          Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
