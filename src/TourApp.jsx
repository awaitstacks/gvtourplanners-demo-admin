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

const TourApp = () => {
  const { aToken } = useContext(TourAdminContext);
  const { ttoken } = useContext(TourContext);

  return aToken || ttoken ? (
    <div className="bg-[#F8F9FD]">
      <TourNavbar />
      <div className="flex items-start">
        <TourSidebar />
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<></>} />
          <Route path="/admin-dashboard" element={<TourAdminDashboard />} />
          <Route path="/all-bookings" element={<AllBookings />} />
          <Route path="/add-tour" element={<AddTour />} />
          <Route path="/tour-list" element={<ToursList />} />

          {/* Doctor Routes */}
          <Route path="/tour-dashboard" element={<TourDashboard />} />
          <Route path="/tour-bookings" element={<TourBookings />} />
          <Route path="/tour-profile" element={<TourProfile />} />
          <Route path="/tour-namelist" element={<TourNameList />} />
        </Routes>
      </div>
    </div>
  ) : (
    <TourLogin />
  );
};

export default TourApp;
