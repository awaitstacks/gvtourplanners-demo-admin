// import { useState, useCallback, createContext } from "react";
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
//   const [tourList, setTourList] = useState([]);

//   // ----------------- API Functions -----------------

//   const getTourList = useCallback(async () => {
//     try {
//       const { data } = await axios.get(`${backendUrl}/api/tour/list`, {
//         headers: { ttoken },
//       });
//       if (data.success) {
//         setTourList(data.tours);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(error.message);
//     }
//   }, [backendUrl, ttoken]);

//   const getBookings = useCallback(
//     async (tourId) => {
//       try {
//         if (!tourId) {
//           setBookings([]);
//           return;
//         }

//         const { data } = await axios.get(
//           `${backendUrl}/api/tour/bookings-tour/${tourId}`,
//           {
//             headers: { ttoken },
//           }
//         );

//         if (data.success) {
//           setBookings(data.bookings);
//         } else {
//           toast.error(data.message);
//         }
//       } catch (error) {
//         console.error(error);
//         toast.error(error.message);
//       }
//     },
//     [backendUrl, ttoken]
//   );

//   const getDashData = useCallback(
//     async (tourId) => {
//       try {
//         const { data } = await axios.get(
//           backendUrl + `/api/tour/tour-dashboard/${tourId}`,
//           { headers: { ttoken } }
//         );
//         if (data.success) {
//           setDashData(data.data);
//           console.log("Dashboard Data:", data.data);
//         } else {
//           toast.error(data.message);
//         }
//       } catch (error) {
//         console.error(error);
//         toast.error(error.message);
//       }
//     },
//     [backendUrl, ttoken]
//   );

//   const updateTravellerDetails = async (
//     bookingId,
//     travellerId,
//     travellerData
//   ) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/update-traveller",
//         { bookingId, travellerId, ...travellerData },
//         { headers: { ttoken } }
//       );

//       if (data.success) {
//         toast.success("Traveller details updated");
//         getBookings();
//       } else {
//         toast.error(data.message || "Failed to update traveller details");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(error.message);
//     }
//   };

//   const markAdvancePaid = async (bookingId, tourId) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/mark-advancepaid",
//         { bookingId, tourId }, // Include tourId here
//         { headers: { ttoken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getBookings(tourId);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(error.message);
//     }
//   };

//   const markBalancePaid = async (bookingId, tourId) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/mark-balancepaid",
//         { bookingId, tourId }, // Include the tourId in the request body
//         { headers: { ttoken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getBookings(tourId);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(error.message);
//     }
//   };

//   const completeBooking = async (bookingId, tourId) => {
//     try {
//       const { data } = await axios.post(
//         backendUrl + "/api/tour/complete-bookingtour",
//         { bookingId, tourId }, // Include tourId in the request body
//         { headers: { ttoken } }
//       );
//       if (data.success) {
//         toast.success(data.message);
//         getBookings(tourId); // Re-fetch bookings for the specific tour
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
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
//       console.error(error);
//       toast.error(error.message);
//     }
//   };

//   const getProfileData = async (tourId) => {
//     try {
//       const { data } = await axios.get(
//         backendUrl + `/api/tour/tour-profile/${tourId}`,
//         {
//           headers: { ttoken },
//         }
//       );
//       if (data.success) {
//         setProfileData(data.tourProfileData);
//       } else {
//         setProfileData(null); // Clear previous profile data on error
//         toast.error(data.message || "Failed to load profile");
//       }
//     } catch (error) {
//       console.error(error);
//       setProfileData(null); // Clear profile data on network or other error
//       toast.error(error.message);
//     }
//   };

//   const markAdvanceReceiptSent = async (bookingId, tourId) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/mark-advance-receipt",
//         { bookingId, tourId }, // Include tourId in the request body
//         { headers: { ttoken } }
//       );
//       if (data.success) {
//         toast.success("Advance receipt marked as sent");
//         getBookings();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(error.message);
//     }
//   };

//   const markBalanceReceiptSent = async (bookingId, tourId) => {
//     try {
//       const { data } = await axios.put(
//         backendUrl + "/api/tour/mark-balance-receipt",
//         { bookingId, tourId }, // Include tourId in the request body
//         { headers: { ttoken } }
//       );
//       if (data.success) {
//         toast.success("Balance receipt marked as sent");
//         getBookings();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error(error.message);
//     }
//   };
//   // ----------------- Context Value -----------------
//   const value = {
//     ttoken,
//     setttoken,
//     backendUrl,
//     bookings,
//     setBookings,
//     getBookings,
//     markAdvancePaid,
//     markBalancePaid,
//     markAdvanceReceiptSent,
//     markBalanceReceiptSent,
//     completeBooking,
//     cancelBooking,
//     dashData,
//     setDashData,
//     getDashData,
//     profileData,
//     setProfileData,
//     getProfileData,
//     updateTravellerDetails,
//     tourList,
//     getTourList,
//   };

//   return (
//     <TourContext.Provider value={value}>{props.children}</TourContext.Provider>
//   );
// };

// export default TourContextProvider;

import { useState, useCallback, createContext } from "react";
import axios from "axios";

export const TourContext = createContext();

const TourContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [ttoken, setttoken] = useState(
    localStorage.getItem("ttoken") ? localStorage.getItem("ttoken") : ""
  );
  const [bookings, setBookings] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [tourList, setTourList] = useState([]);

  // ----------------- API Functions -----------------

  const getTourList = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tour/list`, {
        headers: { ttoken },
      });
      if (data.success) {
        setTourList(data.tours);
      }
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("getTourList error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }, [backendUrl, ttoken]);

  const getBookings = useCallback(
    async (tourId) => {
      try {
        if (!tourId) {
          setBookings([]);
          return { success: true, bookings: [] };
        }

        const { data } = await axios.get(
          `${backendUrl}/api/tour/bookings-tour/${tourId}`,
          {
            headers: { ttoken },
          }
        );

        if (data.success) {
          setBookings(data.bookings);
        }
        return data; // Return response for caller to handle
      } catch (error) {
        console.error("getBookings error:", error);
        return {
          success: false,
          message: error.response?.data?.message || error.message,
        };
      }
    },
    [backendUrl, ttoken]
  );

  const getDashData = useCallback(
    async (tourId) => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tour/tour-dashboard/${tourId}`,
          { headers: { ttoken } }
        );
        if (data.success) {
          setDashData(data.data);
          console.log("Dashboard Data:", data.data);
        }
        return data; // Return response for caller to handle
      } catch (error) {
        console.error("getDashData error:", error);
        return {
          success: false,
          message: error.response?.data?.message || error.message,
        };
      }
    },
    [backendUrl, ttoken]
  );

  const updateTravellerDetails = async (
    bookingId,
    travellerId,
    travellerData
  ) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/update-traveller`,
        { bookingId, travellerId, ...travellerData },
        { headers: { ttoken } }
      );
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("updateTravellerDetails error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update traveller details",
      };
    }
  };

  const markAdvancePaid = async (bookingId, tourId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-advancepaid`,
        { bookingId, tourId },
        { headers: { ttoken } }
      );
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    advance: {
                      ...booking.payment.advance,
                      paid: true,
                      paymentVerified: true,
                      paidAt: new Date(),
                    },
                  },
                }
              : booking
          )
        );
      }
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("markAdvancePaid error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const markBalancePaid = async (bookingId, tourId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-balancepaid`,
        { bookingId, tourId },
        { headers: { ttoken } }
      );
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    balance: {
                      ...booking.payment.balance,
                      paid: true,
                      paymentVerified: true,
                      paidAt: new Date(),
                    },
                  },
                }
              : booking
          )
        );
      }
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("markBalancePaid error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const completeBooking = async (bookingId, tourId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/tour/complete-bookingtour`,
        { bookingId, tourId },
        { headers: { ttoken } }
      );
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  isBookingCompleted: true,
                  bookingCompletedAt: new Date(),
                }
              : booking
          )
        );
      }
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("completeBooking error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/tour/cancel-bookingtour`,
        { bookingId },
        { headers: { ttoken } }
      );
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("cancelBooking error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const getProfileData = async (tourId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/tour/tour-profile/${tourId}`,
        {
          headers: { ttoken },
        }
      );
      if (data.success) {
        setProfileData(data.tourProfileData);
      } else {
        setProfileData(null);
      }
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("getProfileData error:", error);
      setProfileData(null);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const markAdvanceReceiptSent = async (bookingId, tourId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-advance-receipt`,
        { bookingId, tourId },
        { headers: { ttoken } }
      );
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("markAdvanceReceiptSent error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const markBalanceReceiptSent = async (bookingId, tourId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-balance-receipt`,
        { bookingId, tourId },
        { headers: { ttoken } }
      );
      return data; // Return response for caller to handle
    } catch (error) {
      console.error("markBalanceReceiptSent error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
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
    tourList,
    getTourList,
  };

  return (
    <TourContext.Provider value={value}>{props.children}</TourContext.Provider>
  );
};

export default TourContextProvider;
