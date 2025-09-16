import { useEffect, useContext, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const TourBookings = () => {
  const {
    bookings,
    getBookings,
    markAdvancePaid,
    markBalancePaid,
    completeBooking,
    ttoken,
  } = useContext(TourContext);

  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (ttoken) {
      getBookings();
    }
  }, [ttoken]);

  if (!bookings || bookings.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No bookings found</p>
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bookings</h2>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const isExpanded = expanded === booking._id;
          return (
            <div
              key={booking._id}
              className="bg-white rounded-2xl shadow border overflow-hidden"
            >
              {/* Row Header */}
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(booking._id)}
              >
                <div>
                  <p className="font-semibold text-lg">
                    {booking.userId?.name || "Guest"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.userId?.email || "No email"} |{" "}
                    {booking.userId?.phone || "No phone"}
                  </p>
                  <div className="mt-1 flex gap-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        booking.payment.advance.paid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      Advance:{" "}
                      {booking.payment.advance.paid ? "Paid" : "Pending"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        booking.payment.balance.paid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      Balance:{" "}
                      {booking.payment.balance.paid ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2">
                  {booking.bookingType === "offline" ? (
                    <>
                      {/* Step 1: Mark Advance */}
                      {!booking.payment.advance.paid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAdvancePaid(booking._id, {
                              paidAt: new Date().toISOString(),
                            });
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <CheckCircle size={16} />
                          Mark Advance Completed
                        </button>
                      )}

                      {/* Step 2: Mark Balance */}
                      {booking.payment.advance.paid &&
                        !booking.payment.balance.paid && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markBalancePaid(booking._id, {
                                paidAt: new Date().toISOString(),
                              });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                          >
                            <CheckCircle size={16} />
                            Mark Balance Completed
                          </button>
                        )}

                      {/* Step 3: After balance is done → Booking Completed */}
                      {booking.payment.advance.paid &&
                        booking.payment.balance.paid && (
                          <>
                            {booking.isBookingCompleted ? (
                              <button
                                disabled
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-400 text-white rounded-lg cursor-not-allowed"
                              >
                                <CheckCircle size={16} />
                                Booking Completed
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const confirm = window.confirm(
                                    "Are you sure you want to mark this booking as completed?"
                                  );
                                  if (confirm) {
                                    completeBooking(booking._id);
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                              >
                                <CheckCircle size={16} />
                                Booking Complete
                              </button>
                            )}
                          </>
                        )}
                    </>
                  ) : (
                    // Online booking flow
                    <>
                      {booking.isBookingCompleted ? (
                        <button
                          disabled
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-400 text-white rounded-lg cursor-not-allowed"
                        >
                          <CheckCircle size={16} />
                          Booking Completed
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirm = window.confirm(
                              "Are you sure you want to mark this booking as completed?"
                            );
                            if (confirm) {
                              completeBooking(booking._id);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <CheckCircle size={16} />
                          Booking Complete
                        </button>
                      )}
                    </>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="text-gray-500" />
                  ) : (
                    <ChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 border-t bg-gray-50 text-sm text-gray-700 space-y-4">
                  {/* Booking Info */}
                  <div>
                    <p>
                      <span className="font-medium">Booking Date:</span>{" "}
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Booking Type:</span>{" "}
                      {booking.bookingType}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Traveller Contact
                    </h3>
                    <p>Email: {booking.contact?.email}</p>
                    <p>Mobile: {booking.contact?.mobile}</p>
                  </div>

                  {/* Billing Address */}
                  {booking.billingAddress && (
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Billing Address
                      </h3>
                      <p>{booking.billingAddress.addressLine1}</p>
                      {booking.billingAddress.addressLine2 && (
                        <p>{booking.billingAddress.addressLine2}</p>
                      )}
                      <p>
                        {booking.billingAddress.city},{" "}
                        {booking.billingAddress.state} -{" "}
                        {booking.billingAddress.pincode}
                      </p>
                      <p>{booking.billingAddress.country}</p>
                    </div>
                  )}

                  {/* Travellers List */}
                  {booking.travellers.map((trav, idx) => {
                    let cancellationStatus = null;

                    if (
                      trav.cancelled?.byTraveller &&
                      !trav.cancelled?.byAdmin
                    ) {
                      cancellationStatus =
                        "Cancellation Requested by Traveller";
                    } else if (
                      trav.cancelled?.byAdmin &&
                      !trav.cancelled?.byTraveller
                    ) {
                      cancellationStatus = "Booking Rejected by Admin";
                    } else if (
                      trav.cancelled?.byTraveller &&
                      trav.cancelled?.byAdmin
                    ) {
                      cancellationStatus = "Traveller Cancelled";
                    }

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-lg border shadow-sm"
                      >
                        <p className="font-medium">
                          {trav.title} {trav.firstName} {trav.lastName} (
                          {trav.age} yrs, {trav.gender})
                        </p>
                        <p>Sharing Type: {trav.sharingType}</p>

                        {trav.boardingPoint?.stationName && (
                          <p>
                            Boarding Point: {trav.boardingPoint.stationName} (
                            {trav.boardingPoint.stationCode})
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

                        {/* Cancellation Status */}
                        {cancellationStatus && (
                          <p className="text-red-600 font-medium">
                            {cancellationStatus}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Payment Details */}
                  {booking.payment && (
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Payment Details
                      </h3>
                      <p>
                        Advance: ₹{booking.payment.advance.amount} –{" "}
                        {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
                        {booking.payment.advance.paidAt &&
                          `(at ${new Date(
                            booking.payment.advance.paidAt
                          ).toLocaleDateString()})`}
                      </p>
                      <p>
                        Balance: ₹{booking.payment.balance.amount} –{" "}
                        {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
                        {booking.payment.balance.paidAt &&
                          `(at ${new Date(
                            booking.payment.balance.paidAt
                          ).toLocaleDateString()})`}
                      </p>
                    </div>
                  )}

                  {/* Cancellation Info */}
                  {booking.cancelled?.byAdmin ||
                  booking.cancelled?.byTraveller ? (
                    <div className="text-red-600">
                      <h3 className="font-semibold">Cancelled</h3>
                      <p>
                        Cancelled By:{" "}
                        {booking.cancelled.byAdmin
                          ? "Admin"
                          : booking.cancelled.byTraveller
                          ? "Traveller"
                          : "Unknown"}
                      </p>
                      <p>
                        At:{" "}
                        {booking.cancelled.cancelledAt &&
                          new Date(
                            booking.cancelled.cancelledAt
                          ).toLocaleDateString()}
                      </p>
                      {booking.cancelled.reason && (
                        <p>Reason: {booking.cancelled.reason}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TourBookings;
