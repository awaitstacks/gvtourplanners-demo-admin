import { useEffect, useContext, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TourDashboard = () => {
  const {
    tourList,
    getTourList,
    dashData,
    bookings,
    getDashData,
    getBookings,
    markAdvanceReceiptSent,
    markBalanceReceiptSent,
    ttoken,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [dismissedBookings, setDismissedBookings] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Clear toasts on route change
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

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

  // Fetch tour list
  useEffect(() => {
    if (ttoken) {
      console.log(
        "Fetching tour list at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      setIsLoading(true);
      getTourList()
        .then((response) => {
          handleApiResponse(
            response,
            "Tour list fetched successfully",
            "Failed to fetch tour list"
          );
        })
        .catch((error) => {
          console.error(
            "Fetch tour list error at",
            new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            error
          );
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch tour list"
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, getTourList, handleApiResponse]);

  // Fetch dashboard data and bookings
  useEffect(() => {
    if (ttoken && selectedTourId) {
      console.log(
        `Fetching dashboard data and bookings for tour ${selectedTourId} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      setIsLoading(true);
      Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)])
        .then(([dashResponse, bookingsResponse]) => {
          handleApiResponse(
            dashResponse,
            "Dashboard data fetched successfully",
            "Failed to fetch dashboard data"
          );
          // Removed toast for bookings fetched to avoid duplication
        })
        .catch((error) => {
          console.error(
            "Fetch dashboard/bookings error at",
            new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            error
          );
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch dashboard data or bookings"
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, selectedTourId, getDashData, getBookings, handleApiResponse]);

  // Stats Calculations
  const stats = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        totalBookings: 0,
        totalTravellers: 0,
        completedBookings: 0,
        pendingBookings: 0,
        advancePending: [],
        balancePending: [],
        uncompleted: [],
      };
    }

    const uniqueUsers = new Set();
    let travellerCount = 0;
    let completed = 0;
    let pending = 0;
    let advancePending = [];
    let balancePending = [];
    let uncompleted = [];

    bookings.forEach((b) => {
      if (b.userId?._id) uniqueUsers.add(b.userId._id.toString());

      // Filter out travellers who are cancelled (by admin, traveller, or both)
      const nonCancelledTravellers =
        b.travellers?.filter(
          (trav) => !trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin
        ) || [];

      // Only count travellers if there are non-cancelled travellers and advance is paid
      if (b.payment?.advance?.paid && nonCancelledTravellers.length > 0) {
        travellerCount += nonCancelledTravellers.length;
      }

      if (b.isBookingCompleted) {
        completed++;
      } else {
        // Check if all travellers are cancelled
        const allTravellersCancelled =
          b.travellers?.every(
            (trav) =>
              trav.cancelled?.byTraveller === true ||
              trav.cancelled?.byAdmin === true
          ) || b.travellers?.length === 0;
        if (!allTravellersCancelled) {
          pending++;
          uncompleted.push(b);
        }
      }

      // Check for advance receipt pending only if there are non-cancelled travellers
      if (
        b.payment.advance.paid &&
        !b.receipts?.advanceReceiptSent &&
        nonCancelledTravellers.length > 0
      ) {
        advancePending.push(b);
      }

      // Check for balance receipt pending only if there are non-cancelled travellers
      if (
        b.payment.balance.paid &&
        !b.receipts?.balanceReceiptSent &&
        nonCancelledTravellers.length > 0
      ) {
        balancePending.push(b);
      }
    });

    return {
      totalBookings: uniqueUsers.size,
      totalTravellers: travellerCount,
      completedBookings: completed,
      pendingBookings: pending,
      advancePending: advancePending.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      ),
      balancePending: balancePending.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      ),
      uncompleted: uncompleted.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      ),
    };
  }, [bookings]);

  // Handle Mark as Receipt Complete
  const handleDismiss = async (booking, type) => {
    if (!selectedTourId) {
      toast.error("Please select a tour first.");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to mark this receipt as complete?"
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      let response;
      if (type === "advance") {
        if (!booking.payment.advance.paid) {
          toast.error(
            "❌ Cannot complete. Advance payment not marked as paid."
          );
          return;
        }
        console.log(
          `Marking advance receipt sent for booking ${booking._id} at`,
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        );
        response = await markAdvanceReceiptSent(booking._id, selectedTourId);
      } else if (type === "balance") {
        if (!booking.payment.advance.paid) {
          toast.error("❌ Cannot complete. Advance payment is not paid yet.");
          return;
        }
        if (!booking.payment.balance.paid) {
          toast.error("❌ Cannot complete. Balance payment is not paid yet.");
          return;
        }
        console.log(
          `Marking balance receipt sent for booking ${booking._id} at`,
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        );
        response = await markBalanceReceiptSent(booking._id, selectedTourId);
      }

      if (
        handleApiResponse(
          response,
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } receipt marked as complete`,
          `Failed to mark ${type} receipt`
        )
      ) {
        setDismissedBookings((prev) => new Set(prev).add(booking._id));
      }
    } catch (error) {
      console.error(
        `mark${
          type.charAt(0).toUpperCase() + type.slice(1)
        }ReceiptSent error at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to mark ${type} receipt`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render booking cards
  const renderBookingCards = (list, type) => {
    let filteredList = list;

    if (type === "advance" || type === "balance") {
      filteredList = list.filter((b) => !dismissedBookings.has(b._id));
    }

    if (type === "uncompleted") {
      filteredList = list.filter((b) => !b.isBookingCompleted);
    }

    if (!filteredList || filteredList.length === 0) {
      return (
        <p className="text-gray-500 text-center py-6">
          🎉 No pending actions, happy working!
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {filteredList.map((b) => {
          // Get the first traveller's name, fallback to "Unknown Traveller" if none
          const firstTraveller =
            b.travellers && b.travellers.length > 0 ? b.travellers[0] : null;
          const displayName = firstTraveller
            ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
            : "Unknown Traveller";
          return (
            <div
              key={b._id}
              className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-medium">
                  <strong>{displayName}</strong> (
                  {b.userId?.email || "No Email"})
                </p>
                <p className="text-sm text-gray-600">
                  Travellers: {b.travellers?.length || 0} | Booking Date:{" "}
                  {new Date(b.bookingDate).toLocaleDateString()}
                </p>
              </div>

              {(type === "advance" || type === "balance") && (
                <button
                  onClick={() => handleDismiss(b, type)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Processing..." : "Mark as Receipt Complete"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center">
        Tour Dashboard
      </h1>

      {isLoading ? (
        <div className="text-center text-gray-500 text-lg sm:text-xl">
          Loading...
        </div>
      ) : !ttoken ? (
        <div className="p-4 sm:p-6 text-center text-gray-500 text-lg sm:text-xl">
          <p>Please log in to view dashboard data.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 sm:mb-8">
            <label
              htmlFor="tour-select"
              className="block text-sm sm:text-base lg:text-lg font-medium text-gray-700 mb-2"
            >
              Select a Tour:
            </label>
            <select
              id="tour-select"
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-3 text-sm sm:text-base lg:text-lg border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:bg-gray-100"
              disabled={isLoading}
            >
              <option value="">-- Select a Tour --</option>
              {tourList.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>

          {!selectedTourId ? (
            <div className="p-4 sm:p-6 text-center text-gray-500 text-lg sm:text-xl">
              <p>Please select a tour to view dashboard data.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white shadow rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-500 text-lg sm:text-xl">👤</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-500">
                      Total Bookings (Unique Users)
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold">
                      {dashData?.totalUsers || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-500 text-lg sm:text-xl">
                      👥
                    </span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-500">
                      Total Travellers
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold">
                      {stats.totalTravellers}
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-lg sm:text-xl">✔</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-500">
                      Completed Bookings
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold">
                      {stats.completedBookings}
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-500 text-lg sm:text-xl">
                      ⏳
                    </span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-500">
                      Pending Bookings
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold">
                      {stats.pendingBookings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">
                  Advance Receipt Pending
                </h2>
                {renderBookingCards(stats.advancePending, "advance")}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">
                  Balance Receipt Pending
                </h2>
                {renderBookingCards(stats.balancePending, "balance")}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">
                  Uncompleted Booking List
                </h2>
                {renderBookingCards(stats.uncompleted, "uncompleted")}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TourDashboard;
