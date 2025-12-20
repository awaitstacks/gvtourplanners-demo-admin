/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Users,
  User,
  IndianRupee,
  Receipt,
  CheckCircle,
  XCircle,
  FileText,
  Copy,
  Loader2,
  FilePenLine,
} from "lucide-react";

const TourAdminDashboard = () => {
  const {
    bookings,
    getAllBookings,
    releaseBooking,
    getPendingApprovals,
    pendingApprovals,
    approveBookingUpdate,
    rejectBookingUpdate,
  } = useContext(TourAdminContext);

  const [expanded, setExpanded] = useState({});
  const [showMore, setShowMore] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const location = useLocation();

  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getAllBookings(), getPendingApprovals()]);
        toast.success("Dashboard loaded successfully");
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [getAllBookings, getPendingApprovals]);

  const toggleExpand = (category, id) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: { ...prev[category], [id]: !prev[category]?.[id] },
    }));
  };

  const toggleShowMore = (category) => {
    setShowMore((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Booking ID copied!"),
      () => toast.error("Failed to copy")
    );
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve this manage booking request?")) return;
    setActionLoading((prev) => ({ ...prev, [bookingId]: "approve" }));
    try {
      const res = await approveBookingUpdate(bookingId);
      if (res?.success) await getPendingApprovals();
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Reject this manage booking request?")) return;
    setActionLoading((prev) => ({ ...prev, [bookingId]: "reject" }));
    try {
      const res = await rejectBookingUpdate(bookingId);
      if (res?.success) await getPendingApprovals();
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleReleaseBooking = async (bookingId, travellerId) => {
    if (!window.confirm("Reject this cancellation request?")) return;
    setIsLoading(true);
    try {
      const res = await releaseBooking(bookingId, [travellerId]);
      if (res?.success) {
        toast.success("Cancellation rejected");
        await getAllBookings();
      } else {
        toast.error(res?.message || "Failed to reject");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const BookingItem = ({
    booking,
    category,
    statusLabel,
    statusColor,
    Icon,
  }) => {
    const first = booking.travellers?.[0] || {};
    const name =
      `${first.firstName || ""} ${first.lastName || ""}`.trim() ||
      "Unknown Traveller";

    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={() => toggleExpand(category, booking._id)}
      >
        {/* Header Summary */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-base">
                {booking.tourData?.title || "Untitled Tour"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{name}</strong> ({booking.travellers?.length || 0}{" "}
                traveller{booking.travellers?.length !== 1 ? "s" : ""})
              </p>
              <p className="text-xs text-gray-500">
                {new Date(booking.bookingDate).toLocaleDateString()} •{" "}
                {booking.bookingType}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-xs font-medium ${statusColor} px-3 py-1 rounded-full bg-opacity-10`}
            >
              {statusLabel}
            </span>
            {expanded[category]?.[booking._id] ? (
              <ChevronUp className="w-5 h-5 text-gray-400 mt-2 mx-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 mt-2 mx-auto" />
            )}
          </div>
        </div>

        {/* Expanded Detailed View */}
        {expanded[category]?.[booking._id] && (
          <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-5 text-sm text-gray-700">
            {/* Booking ID + Copy */}
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
              <strong>Booking ID:</strong>
              <code className="bg-gray-200 px-3 py-1 rounded text-xs font-mono">
                {booking._id}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(booking._id);
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <strong>Email:</strong> {booking.contact?.email || "—"}
              </div>
              <div>
                <strong>Mobile:</strong> {booking.contact?.mobile || "—"}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-gray-800 mb-3">
                Payment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p>
                    <strong>Advance:</strong> ₹
                    {booking.payment?.advance?.amount || 0}
                  </p>
                  <p
                    className={
                      booking.payment?.advance?.paid
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    → {booking.payment?.advance?.paid ? "Paid" : "Pending"}
                    {booking.payment?.advance?.paidAt && (
                      <span className="text-xs block text-gray-500">
                        on{" "}
                        {new Date(
                          booking.payment.advance.paidAt
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Balance:</strong> ₹
                    {booking.payment?.balance?.amount || 0}
                  </p>
                  <p
                    className={
                      booking.payment?.balance?.paid
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    → {booking.payment?.balance?.paid ? "Paid" : "Pending"}
                    {booking.payment?.balance?.paidAt && (
                      <span className="text-xs block text-gray-500">
                        on{" "}
                        {new Date(
                          booking.payment.balance.paidAt
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Remarks */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Admin Remarks
              </h4>
              {booking.adminRemarks && booking.adminRemarks.length > 0 ? (
                <div className="space-y-3">
                  {booking.adminRemarks.map((remark, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium">{remark.remark}</p>
                      {remark.amount !== undefined && remark.amount > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Advance Admin Remarks
              </h4>
              {booking.advanceAdminRemarks &&
              booking.advanceAdminRemarks.length > 0 ? (
                <div className="space-y-3">
                  {booking.advanceAdminRemarks.map((remark, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium">{remark.remark}</p>
                      {remark.amount !== undefined && remark.amount > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
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

            {/* Travellers List */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Travellers (
                {booking.travellers?.length})
              </h4>
              <div className="space-y-3">
                {booking.travellers?.map((t, i) => {
                  const status =
                    t.cancelled?.byTraveller && t.cancelled?.byAdmin
                      ? "Cancelled"
                      : t.cancelled?.byTraveller && !t.cancelled?.byAdmin
                      ? "Cancellation Requested"
                      : t.cancelled?.byAdmin && !t.cancelled?.byTraveller
                      ? "Rejected"
                      : null;

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        status
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
                            {t.gender})
                          </p>
                          <p className="text-xs text-gray-600">
                            Package: {t.packageType} • Sharing: {t.sharingType}
                          </p>
                          {t.boardingPoint?.stationName && (
                            <p className="text-xs text-gray-600 mt-1">
                              Boarding: {t.boardingPoint.stationName} (
                              {t.boardingPoint.stationCode})
                            </p>
                          )}
                          {t.deboardingPoint?.stationName && (
                            <p className="text-xs text-gray-600">
                              Deboarding: {t.deboardingPoint.stationName} (
                              {t.deboardingPoint.stationCode})
                            </p>
                          )}
                          {t.selectedAddon?.name && (
                            <p className="text-xs text-gray-600">
                              Add-on: {t.selectedAddon.name} (₹
                              {t.selectedAddon.price})
                            </p>
                          )}
                          {t.remarks && (
                            <p className="italic text-gray-500 text-xs mt-1">
                              Remarks: {t.remarks}
                            </p>
                          )}
                        </div>
                        {status && (
                          <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                            {status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billing Address */}
            {booking.billingAddress && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Billing Address
                </h4>
                <p className="text-sm text-gray-600">
                  {booking.billingAddress.addressLine1}
                  {booking.billingAddress.addressLine2 &&
                    `, ${booking.billingAddress.addressLine2}`}
                  <br />
                  {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
                  - {booking.billingAddress.pincode}
                  <br />
                  {booking.billingAddress.country}
                </p>
              </div>
            )}

            {/* Completion Status */}
            {booking.isBookingCompleted && (
              <div className="text-center py-2 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">
                  ✓ Booking Marked as Completed
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const CancellationItem = ({ booking }) => {
    const first = booking.travellers?.[0] || {};
    const name =
      `${first.firstName || ""} ${first.lastName || ""}`.trim() ||
      "Unknown Traveller";

    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-red-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
        onClick={() => toggleExpand("cancellation", booking._id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-base">
                {booking.tourData?.title || "Untitled Tour"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{name}</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
            Cancellation Request
          </span>
        </div>

        {expanded["cancellation"]?.[booking._id] && (
          <div className="mt-4 pt-4 border-t border-red-100 space-y-3">
            <div className="flex items-center gap-2">
              <strong>Booking ID:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                {booking._id}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(booking._id);
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <h4 className="font-semibold mb-2 text-sm flex items-center gap-1">
              Travellers Requested
            </h4>
            {booking.travellers
              .filter((t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin)
              .map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-red-50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-red-900">
                      {t.firstName} {t.lastName} ({t.age} yrs)
                    </p>
                    <p className="text-xs text-red-700">
                      {t.sharingType} sharing
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReleaseBooking(booking._id, t._id);
                    }}
                    disabled={isLoading}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition mt-2 sm:mt-0 ${
                      isLoading ? "opacity-50" : ""
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Reject"
                    )}
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const ManageRequestItem = ({ booking }) => {
    const first = booking.travellers?.[0] || {};
    const name =
      `${first.firstName || ""} ${first.lastName || ""}`.trim() ||
      "Unknown Traveller";
    const isActing = actionLoading[booking._id];

    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-pink-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
        onClick={() => toggleExpand("manageRequests", booking._id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <FilePenLine className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-base">
                {booking.tourData?.title || "Untitled Tour"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{name}</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
            Manage Request
          </span>
        </div>

        {expanded["manageRequests"]?.[booking._id] && (
          <div className="mt-4 pt-4 border-t border-pink-100 space-y-4">
            <div className="flex items-center gap-2">
              <strong>Booking ID:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                {booking._id}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(booking._id);
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <p>
                <strong>Email:</strong> {booking.contact?.email}
              </p>
              <p>
                <strong>Mobile:</strong> {booking.contact?.mobile}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(booking._id);
                }}
                disabled={isActing === "approve"}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(booking._id);
                }}
                disabled={isActing === "reject"}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, category, statusLabel, statusColor, Icon }) => {
    const items = categorized[category] || [];
    const visible = showMore[category] ? items : items.slice(0, 5);

    return (
      <section className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Icon className="w-6 h-6 text-blue-600" />
          {title}{" "}
          <span className="text-sm font-normal text-gray-500 ml-1">
            ({items.length})
          </span>
        </h2>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-lg">
            No pending actions.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {category === "cancellation"
                ? visible.map((b) => (
                    <CancellationItem key={b._id} booking={b} />
                  ))
                : category === "manageRequests"
                ? visible.map((b) => (
                    <ManageRequestItem key={b._id} booking={b} />
                  ))
                : visible.map((b) => (
                    <BookingItem
                      key={b._id}
                      booking={b}
                      category={category}
                      statusLabel={statusLabel}
                      statusColor={statusColor}
                      Icon={Icon}
                    />
                  ))}
            </div>
            {items.length > 5 && (
              <button
                onClick={() => toggleShowMore(category)}
                className="mt-6 w-full sm:w-auto mx-auto block px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center justify-center gap-2"
              >
                {showMore[category]
                  ? "Show Less"
                  : `Show More (${items.length - 5})`}
              </button>
            )}
          </>
        )}
      </section>
    );
  };

  const filters = {
    advance: (b) =>
      (b.payment?.advance?.paid &&
        !b.payment?.balance?.paid &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
        )) ||
      (b.payment?.advance?.paid &&
        b.payment?.balance?.paid &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
        )),

    balance: (b) =>
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      b.travellers?.some(
        (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
      ),

    completion: (b) =>
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      !b.isBookingCompleted,

    cancellation: (b) =>
      b.travellers?.some(
        (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin
      ),

    modifyReceipt: (b) =>
      b.isTripCompleted &&
      b.travellers?.some(
        (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
      ),
  };

  const categorized = {
    advance: bookings.filter(filters.advance),
    balance: bookings.filter(filters.balance),
    completion: bookings.filter(filters.completion),
    cancellation: bookings.filter(filters.cancellation),
    modifyReceipt: bookings.filter(filters.modifyReceipt),
    manageRequests: Array.isArray(pendingApprovals) ? pendingApprovals : [],
  };

  const totalTravellers = bookings.reduce((count, b) => {
    if (
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      b.isBookingCompleted
    ) {
      const valid =
        b.travellers?.filter(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
        ) || [];
      return count + valid.length;
    }
    return count;
  }, 0);

  const uniqueUsers = new Set(
    bookings.map((b) => b.userData?._id || b.contact?.email)
  ).size;
  const pendingManageCount = categorized.manageRequests.length;

  const metrics = [
    {
      label: "Travellers",
      value: totalTravellers,
      Icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Users",
      value: uniqueUsers,
      Icon: User,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      label: "Advance",
      value: categorized.advance.length,
      Icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Balance",
      value: categorized.balance.length,
      Icon: Receipt,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Completion",
      value: categorized.completion.length,
      Icon: CheckCircle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      label: "Cancellations",
      value: categorized.cancellation.length,
      Icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Modified",
      value: categorized.modifyReceipt.length,
      Icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Manage Requests",
      value: pendingManageCount,
      Icon: FilePenLine,
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-10 leading-tight">
          Super Admin Dashboard
        </h1>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
            <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">No bookings found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-4 mb-10">
              {metrics.map((s, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition text-center"
                >
                  <div
                    className={`w-12 h-12 ${s.bg} rounded-full flex items-center justify-center mx-auto mb-3`}
                  >
                    <s.Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <Section
              title="Advance Receipt Pending"
              category="advance"
              statusLabel="Pending"
              statusColor="text-red-600"
              Icon={IndianRupee}
            />
            <Section
              title="Balance Receipt Pending"
              category="balance"
              statusLabel="Pending"
              statusColor="text-red-600"
              Icon={Receipt}
            />
            <Section
              title="Modified Receipts Pending"
              category="modifyReceipt"
              statusLabel="Pending"
              statusColor="text-purple-600"
              Icon={FileText}
            />
            <Section
              title="Booking Completion Actions"
              category="completion"
              statusLabel="Pending"
              statusColor="text-orange-600"
              Icon={CheckCircle}
            />
            <Section
              title="Cancellation Request Actions"
              category="cancellation"
              statusLabel="Request"
              statusColor="text-red-600"
              Icon={XCircle}
            />
            <Section
              title="Manage Booking Requests"
              category="manageRequests"
              statusLabel="Pending Approval"
              statusColor="text-pink-600"
              Icon={FilePenLine}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TourAdminDashboard;
