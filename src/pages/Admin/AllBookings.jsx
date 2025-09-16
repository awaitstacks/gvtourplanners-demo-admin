import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { ChevronDown, ChevronRight } from "lucide-react";

const AllBookings = () => {
  const { aToken, bookings, getAllBookings, rejectBooking } =
    useContext(TourAdminContext);

  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({
    tour: "",
    contact: "",
    payment: "",
    status: "",
  });
  const [rejectedTravellers, setRejectedTravellers] = useState({}); // local rejected state

  useEffect(() => {
    if (aToken) {
      getAllBookings();
    }
  }, [aToken]);

  if (!aToken) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-500">
          Unauthorized Access 🚫
        </h2>
        <p className="text-gray-600">Please login as Admin to continue.</p>
      </div>
    );
  }

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // 🔎 Filtered Bookings
  const filteredBookings = bookings?.filter((b) => {
    const tourMatch = b?.tourData?.title
      ?.toLowerCase()
      .includes(filters.tour.toLowerCase());

    const contactMatch =
      b?.contact?.email
        ?.toLowerCase()
        .includes(filters.contact.toLowerCase()) ||
      b?.contact?.mobile?.toLowerCase().includes(filters.contact.toLowerCase());

    const paymentStatus = `${
      b.payment?.advance?.paid ? "advance-paid" : "advance-pending"
    } ${b.payment?.balance?.paid ? "balance-paid" : "balance-pending"}`;

    const paymentMatch = paymentStatus.includes(filters.payment.toLowerCase());

    const statusValue = b.isBookingCompleted
      ? "completed"
      : b.cancelled?.byAdmin || b.cancelled?.byTraveller
      ? "cancelled"
      : "under completion";

    const statusMatch = statusValue.includes(filters.status.toLowerCase());

    return tourMatch && contactMatch && paymentMatch && statusMatch;
  });

  // 🚫 Handle reject with confirmation
  const handleReject = (bookingId, travellerId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this booking?"
    );
    if (confirmReject) {
      rejectBooking(bookingId, [travellerId]);
      setRejectedTravellers((prev) => ({
        ...prev,
        [travellerId]: true,
      }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Super admin bookings Dashboard
      </h1>

      {!bookings || bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th></th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  S.No
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Tour
                  <input
                    type="text"
                    placeholder="Filter tour"
                    value={filters.tour}
                    onChange={(e) =>
                      setFilters({ ...filters, tour: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Contact
                  <input
                    type="text"
                    placeholder="Filter contact"
                    value={filters.contact}
                    onChange={(e) =>
                      setFilters({ ...filters, contact: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                  />
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Payment
                  <select
                    value={filters.payment}
                    onChange={(e) =>
                      setFilters({ ...filters, payment: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="">All</option>
                    <option value="advance-paid">Advance Paid</option>
                    <option value="advance-pending">Advance Pending</option>
                    <option value="balance-paid">Balance Paid</option>
                    <option value="balance-pending">Balance Pending</option>
                  </select>
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Status
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="under completion">Under Completion</option>
                  </select>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking, index) => (
                <React.Fragment key={booking._id}>
                  <tr
                    className="border-b hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => toggleRow(index)}
                  >
                    <td className="px-4 py-2 text-gray-600">
                      {expandedRow === index ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {booking?.tourData?.title || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      <div>{booking?.contact?.email}</div>
                      <div>{booking?.contact?.mobile}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      <div>
                        Advance:{" "}
                        {booking.payment?.advance?.paid ? (
                          <span className="text-green-600">Paid ✅</span>
                        ) : (
                          <span className="text-red-600">Pending ❌</span>
                        )}
                      </div>
                      <div>
                        Balance:{" "}
                        {booking.payment?.balance?.paid ? (
                          <span className="text-green-600">Paid ✅</span>
                        ) : (
                          <span className="text-yellow-600">Pending ⏳</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {booking.isBookingCompleted ? (
                        <span className="text-green-600">Completed ✅</span>
                      ) : booking.cancelled?.byAdmin ||
                        booking.cancelled?.byTraveller ? (
                        <span className="text-red-600">Cancelled ❌</span>
                      ) : (
                        <span className="text-yellow-600">
                          Under completion ⏳
                        </span>
                      )}
                    </td>
                  </tr>

                  {expandedRow === index && (
                    <tr className="bg-gray-50">
                      <td></td>
                      <td colSpan="5" className="px-6 py-4">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Travellers
                        </h4>
                        {booking.travellers && booking.travellers.length > 0 ? (
                          <ul className="list-disc list-inside space-y-2">
                            {booking.travellers.map((t, i) => {
                              const isCancelledByAdmin = t.cancelled?.byAdmin;
                              const isCancelledByTraveller =
                                t.cancelled?.byTraveller;
                              const isLocallyRejected =
                                rejectedTravellers[t._id];

                              const isDisabled =
                                isCancelledByAdmin ||
                                isCancelledByTraveller ||
                                isLocallyRejected;

                              let buttonLabel = "Reject Booking";
                              if (isCancelledByTraveller) {
                                buttonLabel = "Cancelled by Traveller";
                              } else if (
                                isCancelledByAdmin ||
                                isLocallyRejected
                              ) {
                                buttonLabel = "Booking Rejected";
                              }

                              return (
                                <li
                                  key={i}
                                  className="text-sm text-gray-700 flex justify-between items-center"
                                >
                                  <span>
                                    {t.title} {t.firstName} {t.lastName} (
                                    {t.age}y)
                                  </span>

                                  <button
                                    disabled={isDisabled}
                                    onClick={
                                      !isDisabled
                                        ? () => handleReject(booking._id, t._id)
                                        : undefined
                                    }
                                    className={`ml-4 px-3 py-1.5 rounded text-xs ${
                                      isDisabled
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                    }`}
                                  >
                                    {buttonLabel}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No travellers</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-4">
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

export default AllBookings;
