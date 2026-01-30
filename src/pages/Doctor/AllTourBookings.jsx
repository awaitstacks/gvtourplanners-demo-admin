import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext"; // adjust path
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllTourBookings = () => {
  const { allBookings, getAllBookings } = useContext(TourContext);
  const location = useLocation();

  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({
    tour: "",
    contact: "", // Now filters name OR mobile only
    payment: "",
    status: "all",
    fromDate: "",
    toDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Clear toasts on route change
  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  // Fetch all bookings
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        const result = await getAllBookings();
        if (!result.success) {
          toast.error(result.message || "Failed to load bookings");
        }
      } catch (err) {
        toast.error("Something went wrong while loading bookings");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [getAllBookings]);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Booking ID copied!"),
      () => toast.error("Failed to copy"),
    );
  };

  // Dynamic status key (short string for filtering)
  const getStatusKey = (booking) => {
    const isFullyCancelled =
      booking.cancelled?.byAdmin || booking.cancelled?.byTraveller;
    const allTravellersCancelled = booking.travellers?.every(
      (t) => t.cancelled?.byAdmin || t.cancelled?.byTraveller,
    );

    if (isFullyCancelled || allTravellersCancelled) {
      return "cancelled";
    }

    if (booking.isBookingCompleted) {
      return "completed";
    }

    const advancePaid = booking.payment?.advance?.paid;
    const balancePaid = booking.payment?.balance?.paid;

    if (advancePaid && balancePaid) {
      return "fully_paid";
    }

    if (advancePaid && !balancePaid) {
      return "advance_paid";
    }

    if (!advancePaid) {
      return "advance_pending";
    }

    return "under_completion";
  };

  // Human-readable status label for display
  const getStatusLabel = (booking) => {
    const key = getStatusKey(booking);
    switch (key) {
      case "cancelled":
        return <span className="text-red-600 font-medium">Cancelled</span>;
      case "completed":
        return <span className="text-green-600 font-medium">Completed</span>;
      case "fully_paid":
        return <span className="text-green-600 font-medium">Fully Paid</span>;
      case "advance_paid":
        return (
          <span className="text-yellow-600 font-medium">Advance Paid</span>
        );
      case "advance_pending":
        return (
          <span className="text-orange-600 font-medium">Advance Pending</span>
        );
      default:
        return (
          <span className="text-gray-600 font-medium">Under Completion</span>
        );
    }
  };

  // Filtered Bookings (contact filter = name OR mobile only)
  const filteredBookings = allBookings
    ?.filter((b) => {
      const firstTraveller = b.travellers?.[0];
      const displayName = firstTraveller
        ? `${firstTraveller.firstName} ${firstTraveller.lastName}`.toLowerCase()
        : "unknown traveller";

      const tourMatch = b?.tourData?.title
        ?.toLowerCase()
        .includes(filters.tour.toLowerCase());

      // Contact filter: name OR mobile (email removed from filter)
      const contactMatch =
        filters.contact === "" ||
        displayName.includes(filters.contact.toLowerCase()) ||
        b?.contact?.mobile
          ?.toLowerCase()
          .includes(filters.contact.toLowerCase());

      const paymentStatus = `${
        b.payment?.advance?.paid ? "advance-paid" : "advance-pending"
      } ${b.payment?.balance?.paid ? "balance-paid" : "balance-pending"}`;

      const paymentMatch = paymentStatus.includes(
        filters.payment.toLowerCase(),
      );

      const statusKey = getStatusKey(b);
      const statusMatch =
        filters.status === "all" || statusKey === filters.status;

      // Date range filter
      let dateMatch = true;
      if (filters.fromDate || filters.toDate) {
        const bookedDate = new Date(b.bookingDate);
        if (filters.fromDate) {
          const from = new Date(filters.fromDate);
          dateMatch = dateMatch && bookedDate >= from;
        }
        if (filters.toDate) {
          const to = new Date(filters.toDate);
          to.setHours(23, 59, 59, 999);
          dateMatch = dateMatch && bookedDate <= to;
        }
      }

      return (
        tourMatch && contactMatch && paymentMatch && statusMatch && dateMatch
      );
    })
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto bg-gray-50 min-h-screen">
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

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-6 text-center">
        All Bookings
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour
            </label>
            <input
              type="text"
              placeholder="Filter tour"
              value={filters.tour}
              onChange={(e) => setFilters({ ...filters, tour: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name / Mobile
            </label>
            <input
              type="text"
              placeholder="Filter by name or mobile"
              value={filters.contact}
              onChange={(e) =>
                setFilters({ ...filters, contact: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment
            </label>
            <select
              value={filters.payment}
              onChange={(e) =>
                setFilters({ ...filters, payment: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="">All</option>
              <option value="advance-paid">Advance Paid</option>
              <option value="advance-pending">Advance Pending</option>
              <option value="balance-paid">Balance Paid</option>
              <option value="balance-pending">Balance Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="all">All</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="fully_paid">Fully Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-600 py-10">
          Loading all bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">
          No bookings found
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-700 w-10"></th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  S.No
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Tour
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Booked On
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Contact
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Payment
                </th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking, index) => {
                const firstTraveller = booking.travellers?.[0];
                const displayName = firstTraveller
                  ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
                  : "Unknown Traveller";

                return (
                  <React.Fragment key={booking._id}>
                    <tr
                      className="border-b hover:bg-gray-50 transition cursor-pointer"
                      onClick={() =>
                        setExpandedRow(expandedRow === index ? null : index)
                      }
                    >
                      <td className="p-3 text-gray-600">
                        {expandedRow === index ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-800">{index + 1}</td>
                      <td className="p-3 text-sm text-gray-800">
                        {booking?.tourData?.title || "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        {booking?.bookingDate
                          ? new Date(booking.bookingDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        <div>
                          <strong>{displayName}</strong>
                        </div>
                        <div>Mobile: {booking?.contact?.mobile || "N/A"}</div>
                        <div>Email: {booking?.contact?.email || "N/A"}</div>
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        <div>
                          Advance:{" "}
                          {booking.payment?.advance?.paid ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-red-600">Pending</span>
                          )}
                        </div>
                        <div>
                          Balance:{" "}
                          {booking.payment?.balance?.paid ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium">
                        {getStatusLabel(booking)}
                      </td>
                    </tr>

                    {expandedRow === index && (
                      <tr className="bg-gray-50">
                        <td></td>
                        <td colSpan="7" className="p-4">
                          {/* Booking ID with Copy */}
                          <div className="mb-4 flex items-center gap-3 text-sm">
                            <strong>Booking ID:</strong>
                            <code className="bg-gray-200 px-3 py-1 rounded font-mono">
                              {booking._id}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(booking._id).then(
                                  () => toast.success("Booking ID copied!"),
                                  () => toast.error("Failed to copy"),
                                );
                              }}
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              title="Copy Booking ID"
                            >
                              <Copy size={16} />
                              Copy
                            </button>
                          </div>

                          {/* Billing Address */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2 text-base">
                              Billing Address
                            </h4>
                            <p className="text-sm text-gray-700">
                              {booking.billingAddress?.addressLine1 || "N/A"},{" "}
                              {booking.billingAddress?.addressLine2 || ""}
                            </p>
                            <p className="text-sm text-gray-700">
                              {booking.billingAddress?.city || "N/A"},{" "}
                              {booking.billingAddress?.state || "N/A"} -{" "}
                              {booking.billingAddress?.pincode || "N/A"}
                            </p>
                            <p className="text-sm text-gray-700">
                              Country:{" "}
                              {booking.billingAddress?.country || "India"}
                            </p>
                          </div>

                          <h4 className="font-semibold text-gray-800 mb-3 text-base">
                            Travellers Details
                          </h4>

                          {booking.travellers?.length > 0 ? (
                            <ul className="space-y-4">
                              {booking.travellers.map((t, i) => (
                                <li
                                  key={i}
                                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-sm"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                      <p className="font-medium text-gray-800">
                                        Name: {t.title} {t.firstName}{" "}
                                        {t.lastName}
                                      </p>
                                      <p>Age: {t.age}</p>
                                      <p>Gender: {t.gender}</p>
                                      <p>Sharing Type: {t.sharingType}</p>
                                    </div>

                                    <div className="space-y-1">
                                      <p>
                                        Package:{" "}
                                        {t.packageType === "main"
                                          ? "Main Package"
                                          : `Variant Package ${t.variantPackageIndex + 1}`}
                                      </p>
                                      <p>
                                        Addon:{" "}
                                        {t.selectedAddon?.name
                                          ? `${t.selectedAddon.name} (₹${t.selectedAddon.price || 0})`
                                          : "Nil"}
                                      </p>
                                      <p>
                                        Boarding:{" "}
                                        {t.boardingPoint?.stationName || "N/A"}{" "}
                                        ({t.boardingPoint?.stationCode || "N/A"}
                                        )
                                      </p>
                                      <p>
                                        Deboarding:{" "}
                                        {t.deboardingPoint?.stationName ||
                                          "N/A"}{" "}
                                        (
                                        {t.deboardingPoint?.stationCode ||
                                          "N/A"}
                                        )
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="font-medium">
                                        Remarks: {t.remarks || "Nil"}
                                      </p>
                                    </div>
                                  </div>
                                  {/* No Cancel button */}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500">No travellers</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredBookings.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-gray-500 p-6 text-base"
                  >
                    No results match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllTourBookings;
