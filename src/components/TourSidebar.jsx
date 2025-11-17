import React, { useContext, useState } from "react";
import { TourContext } from "../context/TourContext";
import { TourAdminContext } from "../context/TourAdminContext";
import { NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Plus,
  Users,
  X,
  Menu,
  FileText,
  User,
  Settings, // New icon for Booking Controls
  TicketX,
  CalendarCheck,
  OctagonAlert,
  Signature,
} from "lucide-react";

const TourSidebar = () => {
  const { aToken } = useContext(TourAdminContext);
  const { ttoken } = useContext(TourContext);
  const [isOpen, setIsOpen] = useState(false); // State for mobile sidebar toggle

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden fixed left-4 z-50 p-2 bg-primary text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
          isOpen ? "top-102" : "top-16"
        }`}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`min-h-screen bg-white border-r fixed md:static top-7 left-3 h-full z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-16 sm:w-20 md:w-72`}
      >
        {aToken && (
          <ul className="text-[#515151] mt-16 md:mt-5">
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/admin-dashboard"
              aria-label="Dashboard"
            >
              <Home size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">Dashboard</p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Dashboard
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/all-bookings"
              aria-label="Bookings"
            >
              <Calendar size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">Bookings</p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Bookings
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/add-tour"
              aria-label="Add Tour"
            >
              <Plus size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">Add Tour</p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Add Tour
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-list"
              aria-label="Tour Controls and Data"
            >
              <Users size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">
                Tour Controls and Data
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Tour Controls and Data
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/cancel-rule"
              aria-label="Cancellation Rule"
            >
              <FileText size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">
                Cancellation Rule
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Cancellation Rule
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/cancel-centre"
              aria-label="Cancellation centre"
            >
              <TicketX size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">
                Cancellation centre
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Cancellation centre
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/db-migration"
              aria-label="DB Migration Centre"
            >
              <OctagonAlert size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">
                DB Migration centre
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                DB Migration centre
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/booking-approvals"
              aria-label="Booking approvals"
            >
              <Signature size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">
                Booking approvals
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Booking approvals
              </span>
            </NavLink>
          </ul>
        )}
        {ttoken && (
          <ul className="text-[#515151] mt-16 md:mt-5">
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-dashboard"
              aria-label="Dashboard"
            >
              <Home size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">Dashboard</p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Dashboard
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-bookings"
              aria-label="Bookings"
            >
              <Calendar size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">Bookings</p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Bookings
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-profile"
              aria-label="Profile"
            >
              <User size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">Profile</p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Profile
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-namelist"
              aria-label="Name List"
            >
              <FileText size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
              <p className="hidden md:block text-sm sm:text-base">Name List</p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Name List
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-updateBalance"
              aria-label="Booking Controls"
            >
              <Settings size={24} className="w-6 h-6 sm:w-7 sm:h-7" />{" "}
              {/* Changed to Settings icon */}
              <p className="hidden md:block text-sm sm:text-base">
                Booking Controls
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Booking Controls
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-cancelTraveller"
              aria-label="Cancellation Controls"
            >
              <TicketX size={24} className="w-6 h-6 sm:w-7 sm:h-7" />{" "}
              {/* Changed to Settings icon */}
              <p className="hidden md:block text-sm sm:text-base">
                Cancellation Controls
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Cancellation Controls
              </span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 py-3 px-2 sm:px-3 md:px-9 w-full cursor-pointer group relative ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
              to="/tour-managebooking"
              aria-label="managebooking"
            >
              <CalendarCheck size={24} className="w-6 h-6 sm:w-7 sm:h-7" />{" "}
              {/* Changed to Settings icon */}
              <p className="hidden md:block text-sm sm:text-base">
                Manage Booking
              </p>
              <span className="absolute left-full md:hidden ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Manage Booking
              </span>
            </NavLink>
          </ul>
        )}
      </div>
    </>
  );
};

export default TourSidebar;
