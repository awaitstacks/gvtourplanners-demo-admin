import React, { useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TourAdminDashboard = () => {
  const { bookings, getAllBookings, cancelBooking, releaseBooking } =
    useContext(TourAdminContext);
  const [expanded, setExpanded] = useState({}); // category-scoped
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Clear toasts on route change
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

  // Fetch bookings
  useEffect(() => {
    console.log(
      "Fetching all bookings at",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );
    setIsLoading(true);
    getAllBookings()
      .then((response) => {
        handleApiResponse(
          response,
          "Bookings fetched successfully",
          "Failed to fetch bookings"
        );
      })
      .catch((error) => {
        console.error(
          "Fetch bookings error at",
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          error
        );
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch bookings"
        );
      })
      .finally(() => setIsLoading(false));
  }, [getAllBookings]);

  // Handle API responses
  const handleApiResponse = useCallback(
    (response, successMessage, errorMessage) => {
      console.log(
        "API Response at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        response
      );
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          toast.success(successMessage || "Operation completed successfully");
          return true;
        } else {
          toast.error(response.message || errorMessage || "Operation failed");
          return false;
        }
      } else {
        toast.error("Invalid response from server");
        return false;
      }
    },
    []
  );

  // Define filters dynamically
  const filters = {
    advance: (b) =>
      b.payment?.advance?.paid &&
      !b.payment?.balance?.paid &&
      !b.receipts?.advanceReceiptSent &&
      b.travellers?.some(
        (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
      ),
    balance: (b) =>
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      !b.receipts?.balanceReceiptSent &&
      b.travellers?.some(
        (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
      ),
    completion: (b) =>
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      b.receipts?.advanceReceiptSent &&
      b.receipts?.balanceReceiptSent &&
      !b.isBookingCompleted,
    cancellation: (b) =>
      b.travellers?.some(
        (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin
      ),
  };

  // Classify bookings into buckets
  const categorized = {
    advance: bookings.filter(filters.advance),
    balance: bookings.filter(filters.balance),
    completion: bookings.filter(filters.completion),
    cancellation: bookings.filter(filters.cancellation),
  };

  // Dashboard Metrics
  const totalTravellers = bookings.reduce((count, b) => {
    if (
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      b.isBookingCompleted
    ) {
      const validTravellers =
        b.travellers?.filter(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
        ) || [];
      return count + validTravellers.length;
    }
    return count;
  }, 0);

  const uniqueUsers = new Set(
    bookings.map((b) => b.userData?._id || b.contact?.email)
  ).size;

  // Toggle expand state per category + booking id
  const toggleExpand = (category, id) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: !prev[category]?.[id],
      },
    }));
  };

  // Handle cancellation actions
  const handleCancelBooking = async (bookingId, travellerId) => {
    const confirm = window.confirm(
      "Are you sure you want to approve this cancellation?"
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      console.log(
        `Approving cancellation for booking ${bookingId}, traveller ${travellerId} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const response = await cancelBooking(bookingId, [travellerId]);
      handleApiResponse(
        response,
        "Cancellation approved successfully",
        "Failed to approve cancellation"
      );
    } catch (error) {
      console.error(
        "Cancel booking error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve cancellation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle release (reject cancellation) actions
  const handleReleaseBooking = async (bookingId, travellerId) => {
    const confirm = window.confirm(
      "Are you sure you want to reject this cancellation request?"
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      console.log(
        `Rejecting cancellation for booking ${bookingId}, traveller ${travellerId} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const response = await releaseBooking(bookingId, [travellerId]);
      handleApiResponse(
        response,
        "Cancellation request rejected successfully",
        "Failed to reject cancellation"
      );
    } catch (error) {
      console.error(
        "Release booking error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject cancellation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable Booking Item
  const BookingItem = ({ booking, category, statusLabel, statusColor }) => {
    // Get the first traveller's name, fallback to "Unknown Traveller" if none
    const firstTraveller =
      booking.travellers && booking.travellers.length > 0
        ? booking.travellers[0]
        : null;
    const displayName = firstTraveller
      ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
      : "Unknown Traveller";
    return (
      <li
        key={booking._id}
        className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border"
      >
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpand(category, booking._id)}
        >
          <span className="text-sm sm:text-base md:text-lg">
            {booking.tourData?.title || "Untitled Tour"} —{" "}
            <strong>{displayName}</strong>{" "}
          </span>
          <span
            className={`font-medium text-xs sm:text-sm md:text-base ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {expanded[category]?.[booking._id] && (
          <div className="mt-2 sm:mt-3 md:mt-4 border-t pt-2 sm:pt-3 md:pt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
            <p>
              <strong>Booking ID:</strong> {booking._id}
            </p>
            <p>
              <strong>Email:</strong> {booking.contact?.email}
            </p>
            <p>
              <strong>Mobile:</strong> {booking.contact?.mobile}
            </p>
            <p>
              <strong>Advance Paid:</strong>{" "}
              {booking.payment?.advance?.paid ? "Yes" : "No"}
            </p>
            <p>
              <strong>Balance Paid:</strong>{" "}
              {booking.payment?.balance?.paid ? "Yes" : "No"}
            </p>

            <div>
              <h4 className="font-semibold mb-1 text-sm sm:text-base">
                Travellers
              </h4>
              <ul className="space-y-1 sm:space-y-2">
                {booking.travellers?.map((t, i) => (
                  <li
                    key={i}
                    className="flex justify-between border p-1 sm:p-2 rounded text-xs sm:text-sm"
                  >
                    <span>
                      {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
                      {t.gender})
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {t.sharingType} sharing
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8 ml-2 sm:ml-4 md:ml-6 lg:ml-8 xl:ml-10 2xl:ml-12">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center ml-10 sm:ml-0 md:ml-0 lg:ml-0 xl:ml-0 2xl:ml-0">
        Super Admin Dashboard
      </h1>

      {isLoading ? (
        <div className="text-center text-gray-500 text-sm sm:text-base md:text-lg">
          Loading...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-500 text-sm sm:text-base md:text-lg">
          No bookings found.
        </div>
      ) : (
        <>
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <span className="text-blue-500 text-lg sm:text-xl">👥</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                {totalTravellers}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">
                Total Travellers
              </p>
            </div>
            <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <span className="text-indigo-500 text-lg sm:text-xl">🧑</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                {uniqueUsers}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">
                Unique Users
              </p>
            </div>
            <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <span className="text-green-500 text-lg sm:text-xl">💰</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                {categorized.advance.length}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">
                Advance Pending
              </p>
            </div>
            <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <span className="text-yellow-500 text-lg sm:text-xl">💸</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                {categorized.balance.length}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">
                Balance Pending
              </p>
            </div>
            <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <span className="text-orange-500 text-lg sm:text-xl">✅</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                {categorized.completion.length}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">
                Completion Pending
              </p>
            </div>
            <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <span className="text-red-500 text-lg sm:text-xl">❌</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                {categorized.cancellation.length}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">
                Cancellation Requests
              </p>
            </div>
          </div>

          {/* Advance Receipt */}
          <section className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
              Advance Receipt Pending ({categorized.advance.length})
            </h2>
            {categorized.advance.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                No pending advance receipts.
              </p>
            ) : (
              <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                {categorized.advance.map((b) => (
                  <BookingItem
                    key={b._id}
                    booking={b}
                    category="advance"
                    statusLabel="Pending Advance Receipt"
                    statusColor="text-red-600"
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Balance Receipt */}
          <section className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
              Balance Receipt Pending ({categorized.balance.length})
            </h2>
            {categorized.balance.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                No pending balance receipts.
              </p>
            ) : (
              <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                {categorized.balance.map((b) => (
                  <BookingItem
                    key={b._id}
                    booking={b}
                    category="balance"
                    statusLabel="Pending Balance Receipt"
                    statusColor="text-red-600"
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Completion */}
          <section className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
              Booking Completion Actions ({categorized.completion.length})
            </h2>
            {categorized.completion.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                All bookings are completed.
              </p>
            ) : (
              <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                {categorized.completion.map((b) => (
                  <BookingItem
                    key={b._id}
                    booking={b}
                    category="completion"
                    statusLabel="Pending Completion"
                    statusColor="text-orange-600"
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Cancellation */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
              Cancellation Request Actions ({categorized.cancellation.length})
            </h2>
            {categorized.cancellation.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                No cancellation requests.
              </p>
            ) : (
              <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                {categorized.cancellation.map((b) => {
                  // Get the first traveller's name, fallback to "Unknown Traveller" if none
                  const firstTraveller =
                    b.travellers && b.travellers.length > 0
                      ? b.travellers[0]
                      : null;
                  const displayName = firstTraveller
                    ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
                    : "Unknown Traveller";
                  return (
                    <li
                      key={b._id}
                      className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border"
                    >
                      <div
                        className="flex justify-between cursor-pointer items-center"
                        onClick={() => toggleExpand("cancellation", b._id)}
                      >
                        <p className="font-semibold text-sm sm:text-base md:text-lg">
                          {b.tourData?.title || "Untitled Tour"} —{" "}
                          <strong>{displayName}</strong>{" "}
                        </p>
                        <span className="text-red-600 font-medium text-xs sm:text-sm md:text-base">
                          Cancellation Request
                        </span>
                      </div>

                      {expanded["cancellation"]?.[b._id] && (
                        <div className="mt-2 sm:mt-3 md:mt-4 border-t pt-2 sm:pt-3 md:pt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
                          <p>
                            <strong>Booking ID:</strong> {b._id}
                          </p>
                          <h4 className="font-semibold mb-1 text-sm sm:text-base">
                            Travellers Requested
                          </h4>
                          {b.travellers
                            .filter(
                              (t) =>
                                t.cancelled?.byTraveller &&
                                !t.cancelled?.byAdmin
                            )
                            .map((t, i) => (
                              <div
                                key={i}
                                className="flex flex-col sm:flex-row justify-between items-center border p-1 sm:p-2 md:p-3 rounded mb-1 sm:mb-2"
                              >
                                <span className="text-xs sm:text-sm md:text-base">
                                  {t.firstName} {t.lastName} ({t.age} yrs)
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-0">
                                  {t.sharingType} sharing
                                </span>

                                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 space-x-0 sm:space-x-2 w-full sm:w-auto">
                                  <button
                                    onClick={() =>
                                      handleCancelBooking(b._id, t._id)
                                    }
                                    disabled={isLoading}
                                    className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 ${
                                      isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    } w-full sm:w-auto`}
                                  >
                                    {isLoading
                                      ? "Processing..."
                                      : "Approve Cancellation"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReleaseBooking(b._id, t._id)
                                    }
                                    disabled={isLoading}
                                    className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 ${
                                      isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    } w-full sm:w-auto`}
                                  >
                                    {isLoading
                                      ? "Processing..."
                                      : "Reject Cancellation"}
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default TourAdminDashboard;
