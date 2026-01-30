/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { TourContext } from "../context/TourContext";
import { TourAdminContext } from "../context/TourAdminContext";
import { NavLink, useMatch } from "react-router-dom";
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
  Hotel,
  UserCircle,
  User2Icon,
  LucideThermometerSnowflake,
  Info,
  Book,
  BookAIcon,
  BookImage,
} from "lucide-react";

const TourSidebar = () => {
  const { aToken } = useContext(TourAdminContext);
  const { ttoken } = useContext(TourContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button - Auto sizes with icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-50
                   flex items-center justify-center
                   w-10 h-10                /* Fixed size - change here if you want smaller/bigger */
                   bg-green-600 text-white
                   rounded-full shadow-2xl hover:bg-green-700
                   transition-all duration-200"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}{" "}
        {/* Just change size here */}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-300 ease-in-out overflow-y-auto z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="pt-20 pb-20 px-6 md:pt-10">
          {aToken && (
            <nav className="space-y-3">
              {adminMenuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </nav>
          )}

          {ttoken && (
            <nav className="space-y-3">
              {tourMenuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  {...item}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </nav>
          )}
        </div>
      </aside>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const SidebarItem = ({ to, icon: Icon, label, onClick }) => {
  const match = useMatch({ path: to, end: true });

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-5 
        px-1                    /* more left/right padding */
        py-2 
        rounded-2xl
        font-semibold text-base tracking-wide
        transition-all duration-200
        w-full                  /* forces full width */
        justify-start           /* keeps icon + text aligned left */
        ${
          match
            ? "bg-green-600 text-white shadow-lg"
            : "text-gray-700 hover:bg-green-100 hover:text-green-800"
        }
      `}
    >
      <Icon size={26} className={match ? "text-white" : "text-gray-600"} />

      {/* Removed truncate → now full text shows */}
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
        {label}
      </span>
    </NavLink>
  );
};

const adminMenuItems = [
  { to: "/admin-dashboard", icon: Home, label: "Dashboard" },
  { to: "/all-bookings", icon: Calendar, label: "Bookings" },
  { to: "/add-tour", icon: Plus, label: "Add Tour" },
  { to: "/tour-list", icon: Users, label: "Tour Controls and Data" },
  { to: "/cancel-rule", icon: FileText, label: "Cancellation Rule" },
  { to: "/db-migration", icon: OctagonAlert, label: "DB Migration centre" },
  { to: "/booking-approvals", icon: Signature, label: "Booking approvals" },
  { to: "/cancel-centre", icon: TicketX, label: "Cancellation approvals" },
  { to: "/all-users", icon: User2Icon, label: "All users" },
];

const tourMenuItems = [
  { to: "/task-dashboard", icon: LucideThermometerSnowflake, label: "Task Dashboard" },
   {
    to: "/tour-allbookings",
    icon: Calendar,
    label: "All Bookings",
  },
  { to: "/tour-dashboard", icon: Info, label: "Tour info" },
  { to: "/tour-bookings", icon: BookImage, label: "Tour Bookings" },
  { to: "/tour-profile", icon: User, label: "Tour profile" },
  { to: "/tour-namelist", icon: FileText, label: "Name List" },
  {
    to: "/tour-roomlist",
    icon: Hotel,
    label: "Room list",
  },
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
