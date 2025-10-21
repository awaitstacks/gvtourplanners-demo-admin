import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { TourAdminContext } from "../context/TourAdminContext";
import { useNavigate } from "react-router-dom";
import { TourContext } from "../context/TourContext";

const TourNavbar = () => {
  const navigate = useNavigate();
  const { aToken, setAToken } = useContext(TourAdminContext);
  const { ttoken, setttoken } = useContext(TourContext);

  const logout = () => {
    navigate("/");
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
    ttoken && setttoken("");
    ttoken && localStorage.removeItem("ttoken");
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-6 md:px-10 py-2 sm:py-3 border-b bg-white">
      <div className="flex items-center gap-2 sm:gap-3">
        <img
          className="w-32 sm:w-36 md:w-40 cursor-pointer"
          src={assets.admin_logo}
          alt="Admin Logo"
        />
        <p className="border px-2 py-0.5 rounded-full border-gray-500 text-gray-600 text-xs sm:text-sm">
          {aToken ? "Admin" : "Tour"}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-primary text-white text-xs sm:text-sm px-6 sm:px-8 md:px-10 py-2 rounded-full min-w-[100px] sm:min-w-[120px] hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      >
        Logout
      </button>
    </div>
  );
};

export default TourNavbar;
