/* eslint-disable no-useless-catch */
/* eslint-disable react-refresh/only-export-components */

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
  const [cancelRule, setCancelRule] = useState(null);
  const [cancelBookings, setCancelBookings] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // === VALIDATE API RESPONSE ===
  const validateApiResponse = useCallback((data, errorMessage) => {
    console.log(
      "API Response:",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data
    );
    if (data && typeof data === "object" && "success" in data) return data;
    throw new Error(data?.message || errorMessage || "Invalid response");
  }, []);

  // === ADD MISSING FIELDS TO ALL BOOKINGS ===
  const addMissingFields = useCallback(async () => {
    try {
      console.log("Adding missing fields to all bookings...");
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/add-missing-fields`,
        {}, // empty body
        {
          headers: { aToken },
        }
      );

      const validated = validateApiResponse(
        data,
        "Failed to add missing fields"
      );

      return validated;
    } catch (error) {
      console.error("Add missing fields error:", error);

      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  // === GET CANCELLATION CHART ===
  const getCancelRule = useCallback(async () => {
    try {
      console.log("Fetching cancellation chart...");
      const response = await axios.get(
        `${backendUrl}/api/touradmin/touradmingetcancelrule`,
        { headers: { aToken } }
      );

      const validated = validateApiResponse(
        response.data,
        "Failed to fetch chart"
      );
      setCancelRule(validated.data);
      return validated;
    } catch (error) {
      console.error("Fetch error:", error);
      const msg = error.response?.data?.message || "Failed to load chart";
      toast.error(msg);
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  // === UPDATE CANCELLATION CHART ===
  const updateCancelRule = async (payload) => {
    try {
      console.log("Updating chart:", payload);
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/touradmincancelrule`,
        payload,
        {
          headers: {
            aToken,
            "Content-Type": "application/json",
          },
        }
      );

      const validated = validateApiResponse(data, "Failed to update chart");
      if (validated.success) {
        setCancelRule(validated.data);
        toast.success("Cancellation rule updated");
        return validated;
      }
    } catch (error) {
      console.error("Update error:", error);
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
      throw error;
    }
  };

  // === OTHER API FUNCTIONS (UNCHANGED) ===
  const getAllTours = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/all-tours`,
        {},
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to fetch tours");
      setTours(validated.tours);
      return validated;
    } catch (error) {
      console.error("Fetch tours error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch tours");
    }
  };

  const changeTourAvailablity = async (tourId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/change-touravailablity`,
        { tourId },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(
        data,
        "Failed to change availability"
      );
      await getAllTours();
      return validated;
    } catch (error) {
      console.error("Change availability error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to change availability"
      );
    }
  };

  const getAllBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/touradmin/bookings`, {
        headers: { aToken },
      });
      const validated = validateApiResponse(data, "Failed to fetch bookings");
      setBookings(validated.bookings);
      return validated;
    } catch (error) {
      console.error("Fetch bookings error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const getAdminDashData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/touradmindashboard`,
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to fetch dashboard");
      setDashData(validated.dashData);
      return validated;
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch dashboard"
      );
    }
  };

  const cancelBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/cancel-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to cancel booking");
      await getAllBookings();
      return validated;
    } catch (error) {
      console.error("Cancel booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  };

  const rejectBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/reject-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to reject booking");
      await getAllBookings();
      return validated;
    } catch (error) {
      console.error("Reject booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reject booking"
      );
    }
  };

  const releaseBooking = async (tourBookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/release-bookingadmin`,
        { tourBookingId, travellerIds },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to release booking");
      await getAllBookings();
      return validated;
    } catch (error) {
      console.error("Release booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to release booking"
      );
    }
  };

  const getCancellations = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/touradmingetcancellations`,
        { headers: { aToken } }
      );
      const validated = validateApiResponse(
        data,
        "Failed to fetch cancellations"
      );
      setCancelBookings(validated.data);
      return validated;
    } catch (error) {
      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  const approveCancellation = async (bookingId, travellerIds) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/approvecancellation`,
        { bookingId, travellerIds },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to approve");
      await getCancellations();
      return validated;
    } catch (error) {
      throw error;
    }
  };

  const rejectCancellation = async (
    bookingId,
    travellerIds,
    cancellationId
  ) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/rejectcancellation`,
        { bookingId, travellerIds, cancellationId },
        { headers: { aToken } }
      );
      const validated = validateApiResponse(data, "Failed to reject");
      await getCancellations();
      return validated;
    } catch (error) {
      throw error;
    }
  };

  // === GET PENDING MANAGE-BOOKING APPROVALS ===
  const getPendingApprovals = useCallback(async () => {
    try {
      console.log("Fetching pending manage-booking approvals...");
      const { data } = await axios.get(
        `${backendUrl}/api/touradmin/pending-approvals`,
        {
          headers: { aToken },
        }
      );

      const validated = validateApiResponse(
        data,
        "Failed to fetch pending approvals"
      );

      // Optional: store in state if needed
      // setPendingApprovals(validated.data);
      setPendingApprovals(validated.data);

      return validated; // { success: true, count: 3, data: [...] }
    } catch (error) {
      console.error("getPendingApprovals error:", error);

      throw error;
    }
  }, [aToken, backendUrl, validateApiResponse]);

  // === APPROVE BOOKING UPDATE (NEW) ===
  const approveBookingUpdate = async (bookingId) => {
    try {
      console.log("Approving booking update for:", bookingId);
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/approvebookingupdate`,
        { bookingId },
        {
          headers: { aToken },
        }
      );

      const validated = validateApiResponse(
        data,
        "Failed to approve booking update"
      );

      if (validated.success) {
        toast.success("Booking update approved!");
        // Refresh the list of pending approvals
        await getPendingApprovals();
        // Optionally refresh bookings list
        await getAllBookings();
      }

      return validated;
    } catch (error) {
      console.error("Approve update error:", error);
      const msg = error.response?.data?.message || "Failed to approve update";
      toast.error(msg);
      throw error;
    }
  };

  // === REJECT BOOKING UPDATE (NEW) ===
  const rejectBookingUpdate = async (bookingId, remark = "") => {
    try {
      console.log("Rejecting booking update for:", bookingId);
      const { data } = await axios.post(
        `${backendUrl}/api/touradmin/rejectbookingupdate`,
        { bookingId, remark },
        {
          headers: { aToken },
        }
      );

      const validated = validateApiResponse(
        data,
        "Failed to reject booking update"
      );

      if (validated.success) {
        toast.success("Booking update rejected!");
        // Refresh the pending list
        await getPendingApprovals();
        // Optionally refresh full bookings list
        await getAllBookings();
      }

      return validated;
    } catch (error) {
      console.error("Reject update error:", error);
      const msg = error.response?.data?.message || "Failed to reject update";
      toast.error(msg);
      throw error;
    }
  };
  // === CONTEXT VALUE ===
  const value = {
    aToken,
    setAToken,
    backendUrl,
    tours,
    setTours,
    getAllTours,
    changeTourAvailablity,
    bookings,
    setBookings,
    getAllBookings,
    cancelBooking,
    rejectBooking,
    releaseBooking,
    dashData,
    setDashData,
    getAdminDashData,
    cancelRule,
    setCancelRule,
    getCancelRule,
    updateCancelRule,
    getCancellations,
    approveCancellation,
    rejectCancellation,
    cancelBookings,
    setCancelBookings,

    // ← NEW FUNCTION
    addMissingFields,
    getPendingApprovals,
    pendingApprovals,
    setPendingApprovals,
    approveBookingUpdate,
    rejectBookingUpdate,
  };

  return (
    <TourAdminContext.Provider value={value}>
      {props.children}
    </TourAdminContext.Provider>
  );
};

export default TourAdminContextProvider;
