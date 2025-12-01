import { useState, useCallback, createContext } from "react";
import axios from "axios";

// eslint-disable-next-line react-refresh/only-export-components
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
  // Add new state near other states
  const [advanceDetails, setAdvanceDetails] = useState(null);
  const [balanceDetails, setBalanceDetails] = useState(null);
  const [singleBooking, setSingleBooking] = useState(null); // NEW: For viewBooking
  const [managedBookingsHistory, setManagedBookingsHistory] = useState([]);
  // ----------------- API Functions -----------------

  const getTourList = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tour/list`, {
        headers: { ttoken },
      });
      if (data.success) {
        setTourList(data.tours);
      }
      return data;
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
          { headers: { ttoken } }
        );
        if (data.success) {
          setBookings(data.bookings);
        }
        return data;
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
        return data;
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

  // src/context/TourContext.jsx
  const viewBooking = useCallback(
    async (bookingId) => {
      if (!bookingId) {
        console.log("viewBooking: No bookingId provided");
        return { success: false, message: "Booking ID is required" };
      }

      console.log("Fetching booking with ID:", bookingId);
      console.log("Backend URL:", backendUrl);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tour/view-booking-cancel/${bookingId}`,
          { headers: { ttoken } }
        );

        console.log("API Response:", data);

        if (data.success) {
          setSingleBooking(data.data);
          console.log("Booking loaded:", data.data);
          return { success: true, booking: data.data };
        } else {
          console.warn("API failed:", data.message);
          return { success: false, message: data.message };
        }
      } catch (error) {
        console.error("viewBooking ERROR:", error);
        console.error("Error response:", error.response?.data);
        console.error("Status:", error.response?.status);
        const message =
          error.response?.data?.message || error.message || "Network error";
        return { success: false, message };
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
      return data;
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
      return data;
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
      return data;
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
      return data;
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
      return data;
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
        { headers: { ttoken } }
      );
      if (data.success) {
        setProfileData(data.tourProfileData);
      } else {
        setProfileData(null);
      }
      return data;
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
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  receipts: {
                    ...booking.receipts,
                    advanceReceiptSent: true,
                    advanceReceiptSentAt: new Date(),
                  },
                }
              : booking
          )
        );
      }
      return data;
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
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  receipts: {
                    ...booking.receipts,
                    balanceReceiptSent: true,
                    balanceReceiptSentAt: new Date(),
                  },
                }
              : booking
          )
        );
      }
      return data;
    } catch (error) {
      console.error("markBalanceReceiptSent error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };
  // ==================== VIEW TOUR ADVANCE ====================
  const viewTourAdvance = async (bookingId) => {
    try {
      if (!bookingId) {
        return { success: false, message: "Booking ID is required" };
      }

      const { data } = await axios.get(
        `${backendUrl}/api/tour/view-tour-advance/${bookingId}`,
        { headers: { ttoken } }
      );

      if (data.success) {
        setAdvanceDetails(data.data);
      }

      return data;
    } catch (error) {
      console.error("viewTourAdvance error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  // ==================== UPDATE TOUR ADVANCE (Shift Advance → Balance) ====================
  const updateTourAdvance = async (bookingId, updates) => {
    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        return { success: false, message: "Updates array is required" };
      }

      const { data } = await axios.post(
        `${backendUrl}/api/tour/update-tour-advance/${bookingId}`,
        { updates },
        { headers: { ttoken } }
      );

      if (data.success) {
        const updatedData = data.data;

        // Update local advance details
        setAdvanceDetails(updatedData);

        // Optimistically update bookings list (if loaded)
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    advance: {
                      ...booking.payment.advance,
                      amount: updatedData.updatedAdvanceAmount,
                    },
                    balance: {
                      ...booking.payment.balance,
                      amount: updatedData.updatedBalanceAmount,
                      paid: false,
                      paymentVerified: false,
                    },
                  },
                  advanceAdminRemarks: updatedData.advanceAdminRemarks,
                  isTripCompleted: true,
                }
              : booking
          )
        );

        // Also update singleBooking if it's currently viewed
        if (singleBooking?._id === bookingId) {
          setSingleBooking((prev) => ({
            ...prev,
            payment: {
              ...prev.payment,
              advance: {
                ...prev.payment.advance,
                amount: updatedData.updatedAdvanceAmount,
              },
              balance: {
                ...prev.payment.balance,
                amount: updatedData.updatedBalanceAmount,
                paid: false,
                paymentVerified: false,
              },
            },
            advanceAdminRemarks: updatedData.advanceAdminRemarks,
            isTripCompleted: true,
          }));
        }
      }

      return data;
    } catch (error) {
      console.error("updateTourAdvance error:", error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };
  const updateTourBalance = async (bookingId, updates) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/tour/update-tour-balance/${bookingId}`,
        { updates },
        { headers: { ttoken } }
      );
      if (data.success) {
        setBalanceDetails(data.data);
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  payment: {
                    ...booking.payment,
                    balance: {
                      ...booking.payment.balance,
                      amount: data.data.updatedBalance,
                    },
                  },
                  adminRemarks: data.data.adminRemarks,
                  isTripCompleted: data.data.isTripCompleted,
                }
              : booking
          )
        );
      }
      return data;
    } catch (error) {
      console.error("updateTourBalance error:", error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const viewTourBalance = async (bookingId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/tour/view-tour-balance/${bookingId}`,
        { headers: { ttoken } }
      );
      if (data.success) {
        setBalanceDetails(data.data);
      }
      return data;
    } catch (error) {
      console.error("viewTourBalance error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const markModifyReceipt = async (bookingId, tourId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/mark-modify-receipt`,
        { bookingId, tourId },
        { headers: { ttoken } }
      );
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  isTripCompleted: false,
                }
              : booking
          )
        );
      }
      return data;
    } catch (error) {
      console.error("markModifyReceipt error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };
  // inside TourContext provider (replace existing cancelBooking)
  const calculateCancelBooking = async ({
    bookingId,
    cancellationDate,
    cancelledTravellerIndexes,
    extraRemarkAmount = 0,
    remark = "",
    irctcCancellationAmount = 0,
  }) => {
    try {
      if (!bookingId) {
        return { success: false, message: "Booking ID is required" };
      }
      if (!cancellationDate) {
        return { success: false, message: "Cancellation date is required" };
      }
      if (
        !Array.isArray(cancelledTravellerIndexes) ||
        cancelledTravellerIndexes.length === 0
      ) {
        return {
          success: false,
          message: "cancelledTravellerIndexes (array) is required",
        };
      }

      const payload = {
        cancellationDate, // ISO string, e.g. new Date().toISOString()
        cancelledTravellerIndexes, // e.g. [0] or [0,1]
        extraRemarkAmount, // optional
        remark, // optional
        irctcCancellationAmount, // optional
      };

      // NOTE: route expects bookingId in URL param :id
      const url = `${backendUrl}/api/tour/bookings/${bookingId}/cancel`;

      const { data } = await axios.post(url, payload, {
        headers: { ttoken },
      });

      // Optionally update local booking state if cancellation succeeded
      if (data && data.message === "Cancellation processed") {
        // you may want to refresh bookings or the specific booking
        await getBookings(/* current tourId if available */);
        // or update bookings state manually
      }

      return data;
    } catch (error) {
      console.error("cancelBooking error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };
  // src/context/TourContext.jsx
  const fetchCancellationsByBooking = async (bookingId, limit = 20) => {
    try {
      if (!bookingId)
        return { success: false, message: "bookingId is required" };

      // <-- FIX HERE
      const url = `${backendUrl}/api/tour/cancelled-bookings/${bookingId}?limit=${limit}`;
      // ---------------------------------

      const { data } = await axios.get(url, { headers: { ttoken } });
      return data;
    } catch (error) {
      console.error("fetchCancellationsByBooking error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };
  // src/context/TourContext.jsx
  // src/context/TourContext.jsx
  const getManagedBookingsHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/tour/managed-bookings/history`,
        { headers: { ttoken } }
      );

      if (data.success) {
        setManagedBookingsHistory(data.data || []);
        return { success: true, data: data.data, count: data.count };
      } else {
        setManagedBookingsHistory([]);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("getManagedBookingsHistory error:", error);
      setManagedBookingsHistory([]);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  }, [backendUrl, ttoken]);
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
    updateTourAdvance,
    setAdvanceDetails,
    advanceDetails,

    viewTourAdvance,
    updateTourBalance,
    viewTourBalance,
    balanceDetails,
    setBalanceDetails,
    markModifyReceipt,
    // ========== NEW: viewBooking ==========
    singleBooking,
    setSingleBooking,
    viewBooking,
    calculateCancelBooking,
    fetchCancellationsByBooking, // <-- add this
    managedBookingsHistory,
    setManagedBookingsHistory,
    getManagedBookingsHistory,
  };

  return (
    <TourContext.Provider value={value}>{props.children}</TourContext.Provider>
  );
};

export default TourContextProvider;
