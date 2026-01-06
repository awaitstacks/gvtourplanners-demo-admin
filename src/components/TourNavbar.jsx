import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { TourAdminContext } from "../context/TourAdminContext";
import { TourContext } from "../context/TourContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

const TourNavbar = () => {
  const navigate = useNavigate();
  const { aToken, setAToken } = useContext(TourAdminContext);
  const { ttoken, setttoken } = useContext(TourContext);

  const logout = () => {
    navigate("/");
    if (aToken) {
      setAToken("");
      localStorage.removeItem("aToken");
    }
    if (ttoken) {
      setttoken("");
      localStorage.removeItem("ttoken");
    }
  };

  const roleText = aToken ? "Admin" : "Tour admin";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
      {/* Left side – Logo + Role */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo */}
        <img
          src={assets.admin_logo}
          alt="GV Tour Planners"
          className="h-8 sm:h-9 md:h-10 object-contain"
        />

        {/* Role badge – always visible, small & beautiful */}
        <span
          className={`
            px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full
            ${
              aToken
                ? "bg-white-100 text-green-800 border border-blue-500"
                : "bg-white-100 text-green-800 border border-blue-500"
            }
          `}
        >
          {roleText}
        </span>
      </div>

      {/* Logout button – compact but tappable */}
      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-shadow"
      >
        Logout
      </button>
    </div>
  );
};

export default TourNavbar;
