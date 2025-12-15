import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";

import TourNavbar from "./components/TourNavbar.jsx";
import TourSidebar from "./components/TourSidebar.jsx";

import { TourAdminContext } from "./context/TourAdminContext.jsx";
import { TourContext } from "./context/TourContext.jsx";

import TourAdminDashboard from "./pages/Admin/TourAdminDashboard.jsx";
import AllBookings from "./pages/Admin/AllBookings.jsx";
import AddTour from "./pages/Admin/AddTour.jsx";

import TourLogin from "./pages/TourLogin.jsx";
import ToursList from "./pages/Admin/ToursList.jsx";
import TourDashboard from "./pages/Doctor/TourDashboard.jsx";
import TourBookings from "./pages/Doctor/TourBookings.jsx";
import TourProfile from "./pages/Doctor/TourProfile.jsx";
import TourNameList from "./pages/Doctor/TourNameList.jsx";
import CancelRule from "./pages/Admin/CancelRule.jsx";

import BookingControls from "./pages/Doctor/BookingControls.jsx";
import CancellationControls from "./pages/Doctor/CancellationControls.jsx";
import CancellationCentre from "./pages/Admin/CancellationCentre.jsx";
import ManageBooking from "./pages/Doctor/ManageBooking.jsx";
import DBMigrationCenter from "./pages/Admin/DBMigrationCenter.jsx";
import BookingApprovals from "./pages/Admin/BookingApprovals.jsx";
import TourRoomList from "./pages/Doctor/TourRoomList.jsx";

const TourApp = () => {
  const { aToken } = useContext(TourAdminContext);
  const { ttoken } = useContext(TourContext);

  return aToken || ttoken ? (
    <div className="bg-[#F8F9FD]">
      <TourNavbar />
      <div className="flex">
        <TourSidebar />
        <main className="flex-1 ml-0 md:ml-72 pt-16 min-h-screen bg-[#F8F9FD] transition-all duration-300">
          <Routes>
            {/* Admin Routes */}
            <Route path="/" element={<></>} />
            <Route path="/admin-dashboard" element={<TourAdminDashboard />} />
            <Route path="/all-bookings" element={<AllBookings />} />
            <Route path="/add-tour" element={<AddTour />} />
            <Route path="/tour-list" element={<ToursList />} />
            <Route path="/cancel-rule" element={<CancelRule />} />
            <Route path="/cancel-centre" element={<CancellationCentre />} />
            <Route path="/db-migration" element={<DBMigrationCenter />} />
            <Route path="/booking-approvals" element={<BookingApprovals />} />

            {/* Doctor Routes */}
            <Route path="/tour-dashboard" element={<TourDashboard />} />
            <Route path="/tour-bookings" element={<TourBookings />} />
            <Route path="/tour-profile" element={<TourProfile />} />
            <Route path="/tour-namelist" element={<TourNameList />} />
            <Route path="/tour-updateBalance" element={<BookingControls />} />
            <Route
              path="/tour-cancelTraveller"
              element={<CancellationControls />}
            />
            <Route path="/tour-managebooking" element={<ManageBooking />} />
            <Route path="/tour-roomlist" element={<TourRoomList />} />
          </Routes>
        </main>
      </div>
    </div>
  ) : (
    <TourLogin />
  );
};

export default TourApp;
