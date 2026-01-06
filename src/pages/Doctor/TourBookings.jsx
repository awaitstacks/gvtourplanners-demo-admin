import { useEffect, useContext, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { ChevronDown, ChevronUp, CheckCircle, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TourBookings = () => {
  const {
    tourList,
    getTourList,
    bookings,
    getBookings,
    markAdvancePaid,
    markBalancePaid,
    completeBooking,
    ttoken,
  } = useContext(TourContext);

  const [expanded, setExpanded] = useState(null);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [travellerNameFilter, setTravellerNameFilter] = useState("");
  const location = useLocation();

  // Fetch tour list
  useEffect(() => {
    if (ttoken) {
      getTourList();
    }
  }, [ttoken, getTourList]);

  // Fetch bookings when tour changes
  useEffect(() => {
    if (ttoken && selectedTourId) {
      setIsLoadingBookings(true);
      getBookings(selectedTourId)
        .then((response) => {
          if (
            response &&
            typeof response === "object" &&
            "success" in response
          ) {
            if (response.success) {
              toast.success("Bookings fetched successfully");
            } else {
              toast.error(response.message || "Failed to fetch bookings");
            }
          } else {
            toast.error("Invalid response from server");
          }
        })
        .catch((error) => {
          console.error("getBookings error:", error);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch bookings"
          );
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else {
      setIsLoadingBookings(false);
    }
  }, [ttoken, selectedTourId, getBookings]);

  // Clear toasts on route change
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleTourChange = (e) => {
    setSelectedTourId(e.target.value);
    setPaymentFilter("all");
    setStatusFilter("all");
    setTravellerNameFilter("");
  };

  // API response handler
  const handleApiResponse = useCallback(
    (response, successMessage) => {
      console.log("API Response:", response);
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          toast.success(successMessage || "Operation completed successfully");
          if (selectedTourId) {
            getBookings(selectedTourId);
          }
        } else {
          toast.error(response.message || "An error occurred");
        }
      } else {
        toast.error("Invalid response from server");
      }
    },
    [selectedTourId, getBookings]
  );

  const handleMarkAdvancePaid = async (bookingId, tourId) => {
    try {
      const response = await markAdvancePaid(bookingId, tourId);
      handleApiResponse(response, "Advance payment marked successfully");
    } catch (error) {
      console.error("markAdvancePaid error:", error);
      toast.error("Failed to mark advance: " + error.message);
    }
  };

  const handleMarkBalancePaid = async (bookingId, tourId) => {
    if (!tourId) {
      toast.error("Please select a tour first.");
      return;
    }
    try {
      const response = await markBalancePaid(bookingId, tourId);
      handleApiResponse(response, "Balance payment marked successfully");
    } catch (error) {
      console.error("markBalancePaid error:", error);
      toast.error("Failed to mark balance: " + error.message);
    }
  };

  const handleCompleteBooking = async (bookingId, tourId) => {
    const confirm = window.confirm("Mark this booking as completed?");
    if (!confirm) return;
    try {
      const response = await completeBooking(bookingId, tourId);
      handleApiResponse(response, "Booking completed successfully");
    } catch (error) {
      console.error("completeBooking error:", error);
      toast.error("Failed to complete: " + error.message);
    }
  };

  const handleCopyBookingId = (bookingId) => {
    navigator.clipboard
      .writeText(bookingId)
      .then(() => toast.success("Booking ID copied!"))
      .catch(() => toast.error("Failed to copy"));
  };

  // === HELPER FUNCTIONS ===
  const areAllTravellersCancelled = (booking) =>
    booking.travellers.length > 0 &&
    booking.travellers.every(
      (t) => t.cancelled?.byTraveller && t.cancelled?.byAdmin
    );

  const areAllTravellersRejected = (booking) =>
    booking.travellers.length > 0 &&
    booking.travellers.every(
      (t) => t.cancelled?.byAdmin && !t.cancelled?.byTraveller
    );

  const hasCancellationRequest = (booking) =>
    booking.travellers.some(
      (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin
    ) && !areAllTravellersCancelled(booking);

  const hasActiveTraveller = (booking) =>
    booking.travellers.some(
      (t) => !(t.cancelled?.byTraveller || t.cancelled?.byAdmin)
    );

  // === FILTER BOOKINGS ===
  const filteredBookings = bookings.filter((booking) => {
    const firstTraveller = booking.travellers[0] || {};
    const displayName = `${firstTraveller.firstName || ""} ${
      firstTraveller.lastName || ""
    }`.trim();

    // Payment Filter
    let paymentMatch = true;
    if (paymentFilter !== "all") {
      if (paymentFilter === "advancePaid" && !booking.payment.advance.paid) {
        paymentMatch = false;
      } else if (
        paymentFilter === "advancePending" &&
        booking.payment.advance.paid
      ) {
        paymentMatch = false;
      } else if (
        paymentFilter === "balancePaid" &&
        !booking.payment.balance.paid
      ) {
        paymentMatch = false;
      } else if (
        paymentFilter === "balancePending" &&
        booking.payment.balance.paid
      ) {
        paymentMatch = false;
      }
    }

    // Status Filter
    let statusMatch = true;
    if (statusFilter !== "all") {
      const allCancelled = areAllTravellersCancelled(booking);
      const allRejected = areAllTravellersRejected(booking);
      const hasActive = hasActiveTraveller(booking);

      if (statusFilter === "active") {
        statusMatch = !booking.isBookingCompleted && hasActive;
      } else if (statusFilter === "completed") {
        statusMatch = booking.isBookingCompleted && hasActive;
      } else if (statusFilter === "rejected") {
        statusMatch = allRejected;
      } else if (statusFilter === "cancelled") {
        statusMatch = allCancelled;
      }
    }

    // Name Filter
    let nameMatch = true;
    if (travellerNameFilter) {
      nameMatch = displayName
        .toLowerCase()
        .includes(travellerNameFilter.toLowerCase());
    }

    return paymentMatch && statusMatch && nameMatch;
  });

  // === CATEGORIZE BOOKINGS ===
  const activeBookings = filteredBookings
    .filter((b) => !b.isBookingCompleted && hasActiveTraveller(b))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const completedBookings = filteredBookings
    .filter((b) => b.isBookingCompleted && hasActiveTraveller(b))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const cancellationRequestBookings = filteredBookings
    .filter(hasCancellationRequest)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const rejectedByAdminBookings = filteredBookings
    .filter(areAllTravellersRejected)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const cancelledByTravellerBookings = filteredBookings
    .filter(areAllTravellersCancelled)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  // === RENDER CARD ===
  const renderBookingCard = (booking, category) => {
    const isExpanded = expanded === booking._id;
    const firstTraveller = booking.travellers[0] || {};
    const displayName =
      `${firstTraveller.firstName || ""} ${
        firstTraveller.lastName || ""
      }`.trim() || "Unknown Traveller";

    const showPartialCancellation = hasCancellationRequest(booking);
    const isFullyCancelled = areAllTravellersCancelled(booking);
    const isFullyRejected = areAllTravellersRejected(booking);

    return (
      <div
        key={booking._id}
        className="bg-white rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto"
      >
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleExpand(booking._id)}
        >
          <div className="w-full sm:w-auto">
            <p className="font-semibold text-base sm:text-lg">
              <strong>{displayName}</strong>
            </p>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {booking.userId?.email || "No email"} |{" "}
              {booking.userId?.phone || "No phone"}
            </p>

            {/* Payment Status */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  booking.payment.advance.paid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
              </span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  booking.payment.balance.paid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
              </span>
            </div>

            {/* Status Badges */}
            {category === "completed" && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
                Completed
              </span>
            )}
            {showPartialCancellation && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
                Partial Cancellation Request
              </span>
            )}
            {isFullyRejected && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
                Rejected by Admin
              </span>
            )}
            {isFullyCancelled && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
                Fully Cancelled
              </span>
            )}

            {/* Booking ID */}
            <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-600">ID: {booking._id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyBookingId(booking._id);
                }}
                className="text-blue-500 hover:text-blue-700"
                title="Copy ID"
              >
                <Copy size={14} />
              </button>
              <span className="text-gray-600">| {booking.bookingType}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
            {isFullyCancelled || isFullyRejected ? (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
              >
                <CheckCircle size={16} />
                Cancelled
              </button>
            ) : booking.isBookingCompleted ? (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
              >
                <CheckCircle size={16} />
                Completed
              </button>
            ) : (
              <>
                {booking.bookingType === "offline" && (
                  <>
                    {!booking.payment.advance.paid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAdvancePaid(booking._id, selectedTourId);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[120px] sm:min-w-[140px]"
                      >
                        <CheckCircle size={16} />
                        Mark Advance
                      </button>
                    )}
                    {booking.payment.advance.paid &&
                      !booking.payment.balance.paid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkBalancePaid(booking._id, selectedTourId);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-w-[120px] sm:min-w-[140px]"
                        >
                          <CheckCircle size={16} />
                          Mark Balance
                        </button>
                      )}
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteBooking(booking._id, selectedTourId);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[120px] sm:min-w-[140px]"
                >
                  <CheckCircle size={16} />
                  Mark Complete
                </button>
              </>
            )}
            {isExpanded ? (
              <ChevronUp className="text-gray-500 w-5 h-5" />
            ) : (
              <ChevronDown className="text-gray-500 w-5 h-5" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
            <div>
              <p>
                <strong>Tour:</strong> {booking?.tourData?.title}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Type:</strong> {booking.bookingType}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Contact</h3>
              <p>Email: {booking.contact?.email}</p>
              <p>Mobile: {booking.contact?.mobile}</p>
            </div>

            {booking.billingAddress && (
              <div>
                <h3 className="font-semibold text-gray-800">Billing Address</h3>
                <p>{booking.billingAddress.addressLine1}</p>
                {booking.billingAddress.addressLine2 && (
                  <p>{booking.billingAddress.addressLine2}</p>
                )}
                <p>
                  {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
                  - {booking.billingAddress.pincode}
                </p>
                <p>{booking.billingAddress.country}</p>
              </div>
            )}

            {/* Admin Remarks */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">
                Admin Remarks
              </h3>
              {booking.adminRemarks && booking.adminRemarks.length > 0 ? (
                <div className="space-y-3">
                  {booking.adminRemarks.map((remark, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm">{remark.remark}</p>
                      {remark.amount > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Amount: ₹{remark.amount}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Added on:{" "}
                        {new Date(remark.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No remarks found</p>
              )}
            </div>

            {/* Advance Admin Remarks */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-3">
                Advance Admin Remarks
              </h3>
              {booking.advanceAdminRemarks &&
              booking.advanceAdminRemarks.length > 0 ? (
                <div className="space-y-3">
                  {booking.advanceAdminRemarks.map((remark, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm">{remark.remark}</p>
                      {remark.amount > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Amount: ₹{remark.amount}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Added on:{" "}
                        {new Date(remark.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No remarks found</p>
              )}
            </div>

            {booking.travellers.map((trav, idx) => {
              let status = null;
              if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
                status = "Cancellation Requested";
              } else if (
                trav.cancelled?.byAdmin &&
                !trav.cancelled?.byTraveller
              ) {
                status = "Rejected by Admin";
              } else if (
                trav.cancelled?.byTraveller &&
                trav.cancelled?.byAdmin
              ) {
                status = "Cancelled";
              }

              return (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-lg border shadow-sm"
                >
                  <p className="font-medium">
                    {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
                    yrs, {trav.gender})
                  </p>
                  <p>Package: {trav.packageType}</p>
                  <p>Sharing: {trav.sharingType}</p>
                  {trav.boardingPoint?.stationName && (
                    <p>
                      Boarding: {trav.boardingPoint.stationName} (
                      {trav.boardingPoint.stationCode})
                    </p>
                  )}
                  {trav.deboardingPoint?.stationName && (
                    <p>
                      Deboarding: {trav.deboardingPoint.stationName} (
                      {trav.deboardingPoint.stationCode})
                    </p>
                  )}
                  {trav.selectedAddon?.name && (
                    <p>
                      Add-on: {trav.selectedAddon.name} (₹
                      {trav.selectedAddon.price})
                    </p>
                  )}
                  {trav.remarks && (
                    <p className="italic text-gray-500">
                      Remarks: {trav.remarks}
                    </p>
                  )}
                  {status && (
                    <p className="text-red-600 font-medium">{status}</p>
                  )}
                </div>
              );
            })}

            {booking.payment && (
              <div>
                <h3 className="font-semibold text-gray-800">Payment</h3>
                <p>
                  Advance: ₹{booking.payment.advance.amount} –{" "}
                  {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
                  {booking.payment.advance.paidAt &&
                    `(on ${new Date(
                      booking.payment.advance.paidAt
                    ).toLocaleDateString()})`}
                </p>
                <p>
                  Balance: ₹{booking.payment.balance.amount} –{" "}
                  {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
                  {booking.payment.balance.paidAt &&
                    `(on ${new Date(
                      booking.payment.balance.paidAt
                    ).toLocaleDateString()})`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
        Bookings
      </h2>

      {/* Tour Selector */}
      <div className="mb-4 sm:mb-6">
        <label
          htmlFor="tour-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select a Tour:
        </label>
        <select
          id="tour-select"
          value={selectedTourId}
          onChange={handleTourChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        >
          <option value="">-- Select a Tour --</option>
          {tourList.map((tour) => (
            <option key={tour._id} value={tour._id}>
              {tour.title}
            </option>
          ))}
        </select>
      </div>

      {/* Filters */}
      {selectedTourId && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status:
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="all">All</option>
              <option value="advancePaid">Advance Paid</option>
              <option value="advancePending">Advance Pending</option>
              <option value="balancePaid">Balance Paid</option>
              <option value="balancePending">Balance Pending</option>
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traveller Name:
            </label>
            <input
              type="text"
              value={travellerNameFilter}
              onChange={(e) => setTravellerNameFilter(e.target.value)}
              placeholder="Search by name..."
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {!selectedTourId ? (
        <div className="text-center text-gray-500 p-6">
          Please select a tour to view bookings.
        </div>
      ) : isLoadingBookings ? (
        <div className="text-center text-gray-500 p-6">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center text-gray-500 p-6">No bookings found.</div>
      ) : (
        <>
          {activeBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Active Bookings
              </h3>
              {activeBookings.map((b) => renderBookingCard(b, "active"))}
            </div>
          )}

          {completedBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
                Completed Bookings
              </h3>
              {completedBookings.map((b) => renderBookingCard(b, "completed"))}
            </div>
          )}

          {cancellationRequestBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
                Cancellation Requests
              </h3>
              {cancellationRequestBookings.map((b) =>
                renderBookingCard(b, "cancellationRequest")
              )}
            </div>
          )}

          {rejectedByAdminBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
                Rejected by Admin
              </h3>
              {rejectedByAdminBookings.map((b) =>
                renderBookingCard(b, "rejected")
              )}
            </div>
          )}

          {cancelledByTravellerBookings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
                Cancelled Bookings
              </h3>
              {cancelledByTravellerBookings.map((b) =>
                renderBookingCard(b, "cancelledByTraveller")
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TourBookings;
