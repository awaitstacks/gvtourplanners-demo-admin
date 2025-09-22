// import { createContext, useState, useCallback } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// export const TourAdminContext = createContext();
// const TourAdminContextProvider = (props) => {
//   const [aToken, setAToken] = useState(
//     localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
//   );
//   const [tours, setTours] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [dashData, setDashData] = useState(false);
//   // const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const backendUrl =
//     import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

//   const getAllTours = async () => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/touradmin/all-tours",
//         {},
//         {
//           headers: { aToken },
//         }
//       );
//       if (data.success) {
//         setTours(data.tours);
//         console.log(data.tours);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };
//   const changeTourAvailablity = async (tourId) => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/touradmin/change-touravailablity",
//         { tourId },
//         { headers: { aToken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getAllTours();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };
//   const getAllBookings = useCallback(async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/touradmin/bookings", {
//         headers: { aToken },
//       });
//       if (data.success) {
//         setBookings(data.bookings);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   }, [aToken, backendUrl]);

//   const getAdminDashData = async () => {
//     try {
//       const { data } = await axios.get(
//         backendUrl + "/api/touradmin/touradmindashboard",
//         {
//           headers: { aToken },
//         }
//       );
//       if (data.success) {
//         setDashData(data.dashData);
//         console.log(data.dashData);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };
//   const cancelBooking = async (tourBookingId, travellerIds) => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/touradmin/cancel-bookingadmin",
//         { tourBookingId, travellerIds },
//         { headers: { aToken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getAllBookings();
//       } else toast.error(data.message);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const rejectBooking = async (tourBookingId, travellerIds) => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/touradmin/reject-bookingadmin",
//         { tourBookingId, travellerIds },
//         { headers: { aToken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getAllBookings();
//       } else toast.error(data.message);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const releaseBooking = async (tourBookingId, travellerIds) => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/touradmin/release-bookingadmin",
//         { tourBookingId, travellerIds },
//         { headers: { aToken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getAllBookings();
//       } else toast.error(data.message);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const value = {
//     aToken,
//     setAToken,
//     backendUrl,
//     tours,
//     getAllBookings,
//     changeTourAvailablity,
//     bookings,
//     setBookings,
//     cancelBooking,
//     rejectBooking,
//     releaseBooking,
//     dashData,
//     getAdminDashData,
//     getAllTours,
//   };
//   return (
//     <TourAdminContext.Provider value={value}>
//       {props.children}
//     </TourAdminContext.Provider>
//   );
// };

// export default TourAdminContextProvider;

import { createContext, useState, useCallback } from "react";
import axios from "axios";

export const TourAdminContext = createContext();

const TourAdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dashData, setDashData] = useState(false);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // Validate API response
  const validateApiResponse = useCallback((data, errorMessage) => {
    console.log(
      "API Response at",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data
    );
    if (data && typeof data === "object" && "success" in data) {
      return data;
    } else {
      throw new Error(
        data?.message || errorMessage || "Invalid response from server"
      );
    }
  }, []);

  const getAllTours = async () => {
    try {
      console.log(
        "Fetching all tours at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/all-tours`,
        {},
        {
          headers: { aToken },
        }
      );
      const validatedData = validateApiResponse(data, "Failed to fetch tours");
      setTours(validatedData.tours);
      console.log("Tours set:", validatedData.tours);
      return validatedData;
    } catch (error) {
      console.error(
        "Fetch tours error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch tours"
      );
    }
  };

  const changeTourAvailablity = async (tourId) => {
    try {
      console.log(
        `Changing tour availability for tourId ${tourId} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/change-touravailablity`,
        { tourId },
        { headers: { aToken } }
      );
      const validatedData = validateApiResponse(
        data,
        "Failed to change tour availability"
      );
      await getAllTours();
      return validatedData;
    } catch (error) {
      console.error(
        "Change tour availability error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to change tour availability"
      );
    }
  };

  const getAllBookings = useCallback(async () => {
    try {
      console.log(
        "Fetching all bookings at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const { data } = await axios.get(`${backendUrl}/api/touradmin/bookings`, {
        headers: { aToken },
      });
      const validatedData = validateApiResponse(
        data,
        "Failed to fetch bookings"
      );
      setBookings(validatedData.bookings);
      console.log("Bookings set:", validatedData.bookings);
      return validatedData;
    } catch (error) {
      console.error(
        "Fetch bookings error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch bookings"
      );
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const getAdminDashData = async () => {
    try {
      console.log(
        "Fetching admin dashboard data at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/touradmindashboard`,
        {
          headers: { aToken },
        }
      );
      const validatedData = validateApiResponse(
        data,
        "Failed to fetch dashboard data"
      );
      setDashData(validatedData.dashData);
      console.log("Dashboard data set:", validatedData.dashData);
      return validatedData;
    } catch (error) {
      console.error(
        "Fetch dashboard data error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch dashboard data"
      );
    }
  };

  const cancelBooking = async (tourBookingId, travellerIds) => {
    try {
      console.log(
        `Cancelling booking ${tourBookingId} for travellers ${travellerIds} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/cancel-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validatedData = validateApiResponse(
        data,
        "Failed to cancel booking"
      );
      await getAllBookings();
      return validatedData;
    } catch (error) {
      console.error(
        "Cancel booking error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel booking"
      );
    }
  };

  const rejectBooking = async (tourBookingId, travellerIds) => {
    try {
      console.log(
        `Rejecting booking ${tourBookingId} for travellers ${travellerIds} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/reject-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validatedData = validateApiResponse(
        data,
        "Failed to reject booking"
      );
      await getAllBookings();
      return validatedData;
    } catch (error) {
      console.error(
        "Reject booking error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject booking"
      );
    }
  };

  const releaseBooking = async (tourBookingId, travellerIds) => {
    try {
      console.log(
        `Releasing booking ${tourBookingId} for travellers ${travellerIds} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/release-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validatedData = validateApiResponse(
        data,
        "Failed to release booking"
      );
      await getAllBookings();
      return validatedData;
    } catch (error) {
      console.error(
        "Release booking error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to release booking"
      );
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
