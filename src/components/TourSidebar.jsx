/* eslint-disable no-unused-vars */

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
  IndianRupee,
  TicketX,
  CalendarCheck,
  OctagonAlert,
  Signature,
} from "lucide-react";

const TourSidebar = () => {
  const { aToken } = useContext(TourAdminContext);
  const { ttoken } = useContext(TourContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button — Smaller, elegant & perfectly placed */}
      <button
        className="md:hidden fixed top-16 left-2 z-50 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 border-2 border-white/40"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar — Starts below navbar */}
      <div
        className={`
          fixed left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-lg
          top-16 bottom-0
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="pt-8 pb-8">
          {/* Admin Menu */}
          {aToken && (
            <ul className="text-[#515151] space-y-1 px-4">
              {adminMenuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </ul>
          )}

          {/* Tour Operator Menu */}
          {ttoken && (
            <ul className="text-[#515151] space-y-1 px-4">
              {tourMenuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

// Reusable Sidebar Item
const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 group relative
      ${
        isActive
          ? "bg-[#F2F3FF] text-primary border-r-4 border-primary font-medium"
          : "hover:bg-gray-100"
      }`
    }
  >
    <Icon size={22} />
    <span className="text-sm font-medium">{label}</span>
    <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
      {label}
    </span>
  </NavLink>
);

// Menu Items
const adminMenuItems = [
  { to: "/admin-dashboard", icon: Home, label: "Dashboard" },
  { to: "/all-bookings", icon: Calendar, label: "Bookings" },
  { to: "/add-tour", icon: Plus, label: "Add Tour" },
  { to: "/tour-list", icon: Users, label: "Tour Controls and Data" },
  { to: "/cancel-rule", icon: FileText, label: "Cancellation Rule" },
  { to: "/db-migration", icon: OctagonAlert, label: "DB Migration centre" },
  { to: "/booking-approvals", icon: Signature, label: "Booking approvals" },
  { to: "/cancel-centre", icon: TicketX, label: "Cancellation approvals" },
];

const tourMenuItems = [
  { to: "/tour-dashboard", icon: Home, label: "Dashboard" },
  { to: "/tour-bookings", icon: Calendar, label: "Bookings" },
  { to: "/tour-profile", icon: User, label: "Tour profile" },
  { to: "/tour-namelist", icon: FileText, label: "Name List" },
  { to: "/tour-updateBalance", icon: IndianRupee, label: "Payment controller" },
  {
    to: "/tour-cancelTraveller",
    icon: TicketX,
    label: "Cancellation Controller",
  },
  {
    to: "/tour-managebooking",
    icon: CalendarCheck,
    label: "Booking controller",
  },
];

export default TourSidebar;
