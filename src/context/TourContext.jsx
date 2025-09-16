// import { useState } from "react";
// import { createContext } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// export const TourContext = createContext();
// const TourContextProvider = (props) => {
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [ttoken, setttoken] = useState(
//     localStorage.getItem("ttoken") ? localStorage.getItem("ttoken") : ""
//   );
//   const [bookings, setBookings] = useState([]);
//   const [dashData, setDashData] = useState(false);
//   const [profileData, setProfileData] = useState(false);

//   const getBookings = async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/tour/bookings-tour", {
//         headers: { ttoken },
//       });
//       if (data.success) {
//         setBookings(data.bookings);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };
//   const updateTravellerDetails = async (
//     bookingId,
//     travellerId,
//     travellerData
//   ) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/update-traveller",
//         {
//           bookingId,
//           travellerId,
//           ...travellerData, // spread out trainSeats, flightSeats, staffRemarks
//         },
//         { headers: { ttoken } }
//       );

//       if (data.success) {
//         toast.success("Traveller details updated");
//         getBookings();
//       } else {
//         toast.error(data.message || "Failed to update traveller details");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const markAdvancePaid = async (bookingId) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/mark-advancepaid",

//         { bookingId },
//         { headers: { ttoken } } // ✅ fixed
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getBookings();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const markBalancePaid = async (bookingId) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/mark-balancepaid",
//         { bookingId },
//         { headers: { ttoken } } // ✅ fixed
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getBookings();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };
//   const completeBooking = async (bookingId) => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/tour/complete-bookingtour",
//         { bookingId },
//         { headers: { ttoken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getBookings();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };
//   const cancelBooking = async (bookingId) => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/tour/cancel-bookingtour",
//         { bookingId },
//         { headers: { ttoken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getBookings();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const getDashData = async () => {
//     try {
//       const { data } = await axios.get(
//         backendUrl + "/api/tour/tour-dashboard",
//         {
//           headers: { ttoken },
//         }
//       );
//       if (data.success) {
//         setDashData(data.data);
//         console.log(data.data);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };
//   const getProfileData = async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/tour/tour-profile", {
//         headers: { ttoken },
//       });
//       if (data.success) {
//         setProfileData(data.tourProfileData); // ✅ Corrected key
//       } else {
//         toast.error(data.message || "Failed to load profile");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   };

//   const value = {
//     ttoken,
//     setttoken,
//     backendUrl,
//     bookings,
//     setBookings,
//     getBookings,
//     markAdvancePaid,
//     markBalancePaid,
//     completeBooking,
//     cancelBooking,
//     dashData,
//     setDashData,
//     getDashData,
//     profileData,
//     setProfileData,
//     getProfileData,
//     updateTravellerDetails,
//   };
//   return (
//     <TourContext.Provider value={value}>{props.children}</TourContext.Provider>
//   );
// };

// export default TourContextProvider;

import { useState, useCallback } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const TourContext = createContext();

const TourContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [ttoken, setttoken] = useState(
    localStorage.getItem("ttoken") ? localStorage.getItem("ttoken") : ""
  );
  const [bookings, setBookings] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);

  // ----------------- API Functions -----------------

  const getBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/tour/bookings-tour", {
        headers: { ttoken },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, [backendUrl, ttoken]);

  const getDashData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/tour/tour-dashboard",
        { headers: { ttoken } }
      );
      if (data.success) {
        setDashData(data.data);
        console.log("Dashboard Data:", data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, [backendUrl, ttoken]);

  const updateTravellerDetails = async (
    bookingId,
    travellerId,
    travellerData
  ) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/tour/update-traveller",
        { bookingId, travellerId, ...travellerData },
        { headers: { ttoken } }
      );

      if (data.success) {
        toast.success("Traveller details updated");
        getBookings();
      } else {
        toast.error(data.message || "Failed to update traveller details");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const markAdvancePaid = async (bookingId) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/tour/mark-advancepaid",
        { bookingId },
        { headers: { ttoken } }
      );
      if (data.success) {
        toast.success(data.message);
        getBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const markBalancePaid = async (bookingId) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/tour/mark-balancepaid",
        { bookingId },
        { headers: { ttoken } }
      );
      if (data.success) {
        toast.success(data.message);
        getBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const completeBooking = async (bookingId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/tour/complete-bookingtour",
        { bookingId },
        { headers: { ttoken } }
      );
      if (data.success) {
        toast.success(data.message);
        getBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/tour/cancel-bookingtour",
        { bookingId },
        { headers: { ttoken } }
      );
      if (data.success) {
        toast.success(data.message);
        getBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/tour/tour-profile", {
        headers: { ttoken },
      });
      if (data.success) {
        setProfileData(data.tourProfileData);
      } else {
        toast.error(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const markAdvanceReceiptSent = async (bookingId) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/tour/mark-advance-receipt",
        { bookingId },
        { headers: { ttoken } }
      );
      if (data.success) {
        toast.success("Advance receipt marked as sent");
        getBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const markBalanceReceiptSent = async (bookingId) => {
    try {
      const { data } = await axios.put(
        backendUrl + "/api/tour/mark-balance-receipt",
        { bookingId },
        { headers: { ttoken } }
      );
      if (data.success) {
        toast.success("Balance receipt marked as sent");
        getBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // ----------------- Context Value -----------------
  const value = {
    ttoken,
    setttoken,
    backendUrl,
    bookings,
    setBookings,
    getBookings,
    markAdvancePaid,
    markBalancePaid,
    markAdvanceReceiptSent,
    markBalanceReceiptSent,
    completeBooking,
    cancelBooking,
    dashData,
    setDashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    updateTravellerDetails,
  };

  return (
    <TourContext.Provider value={value}>{props.children}</TourContext.Provider>
  );
};

export default TourContextProvider;
