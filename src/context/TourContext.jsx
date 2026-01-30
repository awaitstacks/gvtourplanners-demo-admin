import { useState, useCallback, createContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const TourContext = createContext();

const TourContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [ttoken, setttoken] = useState(
    localStorage.getItem("ttoken") ? localStorage.getItem("ttoken") : "",
  );

  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [tourList, setTourList] = useState([]);
  const [advanceDetails, setAdvanceDetails] = useState(null);
  const [balanceDetails, setBalanceDetails] = useState(null);
  const [singleBooking, setSingleBooking] = useState(null);
  const [managedBookingsHistory, setManagedBookingsHistory] = useState([]);
  const [roomAllocation, setRoomAllocation] = useState(null);
  const [roomAllocationLoading, setRoomAllocationLoading] = useState(false);
  const [roomAllocationError, setRoomAllocationError] = useState(null);

  // ==================== GET ALL BOOKINGS ====================
  const getAllBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/tour/bookings-all`, {
        headers: { ttoken },
      });

      if (data.success) {
        setAllBookings(data.bookings || []);

        return { success: true, bookings: data.bookings, stats: data };
      } else {
        setAllBookings([]);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("getAllBookings error:", error);
      setAllBookings([]);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  }, [backendUrl, ttoken]);

  // ==================== TASK DASHBOARD ACTIONS ====================

  // // 1. Complete Booking (Mark as Completed)
  // const taskCompleteBooking = async (bookingId) => {
  //   try {
  //     const { data } = await axios.put(
  //       `${backendUrl}/api/tour/task/complete-booking`,
  //       { bookingId },
  //       { headers: { ttoken } }
  //     );

  //     if (data.success) {
  //       // Optimistic update
  //       setAllBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId
  //             ? { ...b, isBookingCompleted: true, bookingCompletedAt: new Date() }
  //             : b
  //         )
  //       );
  //       setBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId
  //             ? { ...b, isBookingCompleted: true, bookingCompletedAt: new Date() }
  //             : b
  //         )
  //       );
  //       toast.success("Booking marked as completed!");
  //     } else {
  //       toast.error(data.message || "Failed to complete booking");
  //     }

  //     return data;
  //   } catch (error) {
  //     console.error("taskCompleteBooking error:", error);
  //     toast.error(error.response?.data?.message || "Failed to complete booking");
  //     return { success: false, message: "Failed" };
  //   }
  // };

  // // 2. Mark Modify Receipt (Set isTripCompleted = false)
  // const taskMarkModifyReceipt = async (bookingId) => {
  //   try {
  //     const { data } = await axios.put(
  //       `${backendUrl}/api/tour/task/modify-receipt`,
  //       { bookingId },
  //       { headers: { ttoken } }
  //     );

  //     if (data.success) {
  //       setAllBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId ? { ...b, isTripCompleted: false } : b
  //         )
  //       );
  //       setBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId ? { ...b, isTripCompleted: false } : b
  //         )
  //       );
  //       toast.success("Trip marked as not completed (modify receipt action done)");
  //     } else {
  //       toast.error(data.message || "Failed to update modify receipt");
  //     }

  //     return data;
  //   } catch (error) {
  //     console.error("taskMarkModifyReceipt error:", error);
  //     toast.error(error.response?.data?.message || "Failed to update modify receipt");
  //     return { success: false, message: "Failed" };
  //   }
  // };

  // // 3. Mark Advance Receipt Sent
  // const taskMarkAdvanceReceiptSent = async (bookingId) => {
  //   try {
  //     const { data } = await axios.put(
  //       `${backendUrl}/api/tour/task/mark-advance-receipt-sent`,
  //       { bookingId },
  //       { headers: { ttoken } }
  //     );

  //     if (data.success) {
  //       setAllBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId
  //             ? {
  //                 ...b,
  //                 receipts: {
  //                   ...b.receipts,
  //                   advanceReceiptSent: true,
  //                   advanceReceiptSentAt: new Date(),
  //                 },
  //               }
  //             : b
  //         )
  //       );
  //       setBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId
  //             ? {
  //                 ...b,
  //                 receipts: {
  //                   ...b.receipts,
  //                   advanceReceiptSent: true,
  //                   advanceReceiptSentAt: new Date(),
  //                 },
  //               }
  //             : b
  //         )
  //       );
  //       toast.success("Advance receipt marked as sent!");
  //     } else {
  //       toast.error(data.message || "Failed to mark advance receipt");
  //     }

  //     return data;
  //   } catch (error) {
  //     console.error("taskMarkAdvanceReceiptSent error:", error);
  //     toast.error(error.response?.data?.message || "Failed to mark advance receipt");
  //     return { success: false, message: "Failed" };
  //   }
  // };

  // // 4. Mark Balance Receipt Sent
  // const taskMarkBalanceReceiptSent = async (bookingId) => {
  //   try {
  //     const { data } = await axios.put(
  //       `${backendUrl}/api/tour/task/mark-balance-receipt-sent`,
  //       { bookingId },
  //       { headers: { ttoken } }
  //     );

  //     if (data.success) {
  //       setAllBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId
  //             ? {
  //                 ...b,
  //                 receipts: {
  //                   ...b.receipts,
  //                   balanceReceiptSent: true,
  //                   balanceReceiptSentAt: new Date(),
  //                 },
  //               }
  //             : b
  //         )
  //       );
  //       setBookings((prev) =>
  //         prev.map((b) =>
  //           b._id === bookingId
  //             ? {
  //                 ...b,
  //                 receipts: {
  //                   ...b.receipts,
  //                   balanceReceiptSent: true,
  //                   balanceReceiptSentAt: new Date(),
  //                 },
  //               }
  //             : b
  //         )
  //       );
  //       toast.success("Balance receipt marked as sent!");
  //     } else {
  //       toast.error(data.message || "Failed to mark balance receipt");
  //     }

  //     return data;
  //   } catch (error) {
  //     console.error("taskMarkBalanceReceiptSent error:", error);
  //     toast.error(error.response?.data?.message || "Failed to mark balance receipt");
  //     return { success: false, message: "Failed" };
  //   }
  // };

  // 1. taskMarkAdvanceReceiptSent
  const taskMarkAdvanceReceiptSent = async (bookingId) => {
    try {
      console.log("Calling advance receipt API for booking:", bookingId);
      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/mark-advance-receipt-sent`,
        { bookingId },
        {
          headers: { ttoken },
          timeout: 10000, // 10 seconds timeout to prevent stuck
        },
      );
      console.log("Advance receipt API success:", data);
      if (data.success) {
        setAllBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    advanceReceiptSent: true,
                    advanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    advanceReceiptSent: true,
                    advanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
      }
      return data;
    } catch (error) {
      console.error("taskMarkAdvanceReceiptSent ERROR:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };

  // 2. taskMarkBalanceReceiptSent
  const taskMarkBalanceReceiptSent = async (bookingId) => {
    try {
      console.log("Calling balance receipt API for booking:", bookingId);
      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/mark-balance-receipt-sent`,
        { bookingId },
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );
      console.log("Balance receipt API success:", data);
      if (data.success) {
        setAllBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    balanceReceiptSent: true,
                    balanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  receipts: {
                    ...b.receipts,
                    balanceReceiptSent: true,
                    balanceReceiptSentAt: new Date(),
                  },
                }
              : b,
          ),
        );
      }
      return data;
    } catch (error) {
      console.error("taskMarkBalanceReceiptSent ERROR:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };

  // 3. taskMarkModifyReceipt
  const taskMarkModifyReceipt = async (bookingId) => {
    try {
      console.log("Calling modify receipt API for booking:", bookingId);
      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/modify-receipt`,
        { bookingId },
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );
      console.log("Modify receipt API success:", data);
      if (data.success) {
        setAllBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, isTripCompleted: false } : b,
          ),
        );
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, isTripCompleted: false } : b,
          ),
        );
      }
      return data;
    } catch (error) {
      console.error("taskMarkModifyReceipt ERROR:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };

  // 4. taskCompleteBooking
  const taskCompleteBooking = async (bookingId) => {
    try {
      console.log("Calling complete booking API for booking:", bookingId);
      const { data } = await axios.put(
        `${backendUrl}/api/tour/task/complete-booking`,
        { bookingId },
        {
          headers: { ttoken },
          timeout: 10000,
        },
      );
      console.log("Complete booking API success:", data);
      if (data.success) {
        setAllBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  isBookingCompleted: true,
                  bookingCompletedAt: new Date(),
                }
              : b,
          ),
        );
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? {
                  ...b,
                  isBookingCompleted: true,
                  bookingCompletedAt: new Date(),
                }
              : b,
          ),
        );
      }
      return data;
    } catch (error) {
      console.error("taskCompleteBooking ERROR:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };

  // ==================== Existing Functions (unchanged) ====================

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
          { headers: { ttoken } },
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
    [backendUrl, ttoken],
  );

  const getDashData = useCallback(
    async (tourId) => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tour/tour-dashboard/${tourId}`,
          { headers: { ttoken } },
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
    [backendUrl, ttoken],
  );

  const viewBooking = useCallback(
    async (bookingId) => {
      if (!bookingId) {
        console.log("viewBooking: No bookingId provided");
        return { success: false, message: "Booking ID is required" };
      }

      console.log("Fetching booking with ID:", bookingId);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tour/view-booking-cancel/${bookingId}`,
          { headers: { ttoken } },
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
    [backendUrl, ttoken],
  );

  const updateTravellerDetails = async (
    bookingId,
    travellerId,
    travellerData,
  ) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/tour/update-traveller`,
        { bookingId, travellerId, ...travellerData },
        { headers: { ttoken } },
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
        { headers: { ttoken } },
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
              : booking,
          ),
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
        { headers: { ttoken } },
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
              : booking,
          ),
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
        { headers: { ttoken } },
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
              : booking,
          ),
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
        { headers: { ttoken } },
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
        { headers: { ttoken } },
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
        { headers: { ttoken } },
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
              : booking,
          ),
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
        { headers: { ttoken } },
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
              : booking,
          ),
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

  const viewTourAdvance = async (bookingId) => {
    try {
      if (!bookingId) {
        return { success: false, message: "Booking ID is required" };
      }

      const { data } = await axios.get(
        `${backendUrl}/api/tour/view-tour-advance/${bookingId}`,
        { headers: { ttoken } },
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

  const updateTourAdvance = async (bookingId, updates) => {
    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        return { success: false, message: "Updates array is required" };
      }

      const { data } = await axios.post(
        `${backendUrl}/api/tour/update-tour-advance/${bookingId}`,
        { updates },
        { headers: { ttoken } },
      );

      if (data.success) {
        const updatedData = data.data;

        setAdvanceDetails(updatedData);

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
              : booking,
          ),
        );

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
        { headers: { ttoken } },
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
              : booking,
          ),
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
        { headers: { ttoken } },
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
        { headers: { ttoken } },
      );
      if (data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  isTripCompleted: false,
                }
              : booking,
          ),
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
        cancellationDate,
        cancelledTravellerIndexes,
        extraRemarkAmount,
        remark,
        irctcCancellationAmount,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/tour/bookings/${bookingId}/cancel`,
        payload,
        { headers: { ttoken } },
      );

      if (data && data.message === "Cancellation processed") {
        await getBookings(/* current tourId if available */);
      }

      return data;
    } catch (error) {
      console.error("calculateCancelBooking error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Network error",
      };
    }
  };

  const fetchCancellationsByBooking = async (bookingId, limit = 20) => {
    try {
      if (!bookingId)
        return { success: false, message: "bookingId is required" };

      const { data } = await axios.get(
        `${backendUrl}/api/tour/cancelled-bookings/${bookingId}?limit=${limit}`,
        { headers: { ttoken } },
      );
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

  const getManagedBookingsHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/tour/managed-bookings/history`,
        { headers: { ttoken } },
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

  const getRoomAllocation = useCallback(
    async (tourId) => {
      if (!tourId) {
        setRoomAllocation(null);
        setRoomAllocationError("Tour ID is required");
        return { success: false, message: "Tour ID is required" };
      }

      setRoomAllocationLoading(true);
      setRoomAllocationError(null);

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tour/allot-rooms/${tourId}`,
          { headers: { ttoken } },
        );

        if (data.saved || data.roomAllocations) {
          setRoomAllocation(data);
          console.log("Room allocation loaded:", data);
          return { success: true, data };
        } else {
          setRoomAllocation(null);
          setRoomAllocationError(
            data.message || "Failed to load room allocation",
          );
          return { success: false, message: data.message };
        }
      } catch (error) {
        console.error("getRoomAllocation error:", error);
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch room allocation";

        setRoomAllocationError(message);
        setRoomAllocation(null);

        return { success: false, message };
      } finally {
        setRoomAllocationLoading(false);
      }
    },
    [backendUrl, ttoken],
  );

  // ==================== Context Value ====================
  const value = {
    ttoken,
    setttoken,
    backendUrl,
    bookings,
    setBookings,
    getBookings,
    allBookings,
    getAllBookings,
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
    advanceDetails,
    setAdvanceDetails,
    viewTourAdvance,
    updateTourBalance,
    viewTourBalance,
    balanceDetails,
    setBalanceDetails,
    markModifyReceipt,
    singleBooking,
    setSingleBooking,
    viewBooking,
    calculateCancelBooking,
    fetchCancellationsByBooking,
    managedBookingsHistory,
    setManagedBookingsHistory,
    getManagedBookingsHistory,
    roomAllocation,
    setRoomAllocation,
    roomAllocationLoading,
    roomAllocationError,
    getRoomAllocation,

    // Existing mark functions (unchanged)
    markAdvancePaid,
    markBalancePaid,
    completeBooking,
    cancelBooking,
    markAdvanceReceiptSent,
    markBalanceReceiptSent,

    // NEW: Task Dashboard Actions – correctly linked to your routes
    taskCompleteBooking,
    taskMarkModifyReceipt,
    taskMarkAdvanceReceiptSent,
    taskMarkBalanceReceiptSent,
  };

  return (
    <TourContext.Provider value={value}>{props.children}</TourContext.Provider>
  );
};

export default TourContextProvider;
