import { createContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export const TourAdminContext = createContext();
const TourAdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dashData, setDashData] = useState(false);
  // const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const getAllTours = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/touradmin/all-tours",
        {},
        {
          headers: { aToken },
        }
      );
      if (data.success) {
        setTours(data.tours);
        console.log(data.tours);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const changeTourAvailablity = async (tourId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/touradmin/change-touravailablity",
        { tourId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllTours();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const getAllBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/touradmin/bookings", {
        headers: { aToken },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [aToken, backendUrl]);

  const getAdminDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/touradmin/touradmindashboard",
        {
          headers: { aToken },
        }
      );
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const cancelBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/touradmin/cancel-bookingadmin",
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllBookings();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const rejectBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/touradmin/reject-bookingadmin",
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllBookings();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const releaseBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/touradmin/release-bookingadmin",
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllBookings();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    tours,
    getAllBookings,
    changeTourAvailablity,
    bookings,
    setBookings,
    cancelBooking,
    rejectBooking,
    releaseBooking,
    dashData,
    getAdminDashData,
    getAllTours,
  };
  return (
    <TourAdminContext.Provider value={value}>
      {props.children}
    </TourAdminContext.Provider>
  );
};

export default TourAdminContextProvider;
