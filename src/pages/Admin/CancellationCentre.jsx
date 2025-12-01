/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { ClipLoader } from "react-spinners";

const CancellationCentre = () => {
  const { getCancellations, approveCancellation, rejectCancellation } =
    useContext(TourAdminContext);

  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [toastQueue, setToastQueue] = useState([]);

  // Auto-dismiss toast after 5 seconds (5000ms)
  useEffect(() => {
    if (toastQueue.length === 0) return;

    const timer = setTimeout(() => {
      setToastQueue((prev) => prev.slice(1));
    }, 5000); // Changed from 3000 → 5000

    return () => clearTimeout(timer);
  }, [toastQueue]);

  // Fetch cancellations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCancellations();
        if (res.success) {
          setCancellations(res.data || []);
        } else {
          showToast("error", res.message || "Failed to load cancellations");
        }
      } catch (err) {
        showToast("error", "Failed to load cancellations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getCancellations]);

  const showToast = (type, msg) => {
    setToastQueue((prev) => [...prev, { type, msg, id: Date.now() }]);
  };

  // CONFIRM + APPROVE
  const handleApprove = async (cancellation) => {
    const leadTraveller =
      cancellation.booking?.travellers?.find((t) =>
        cancellation.travellerIds?.includes(t._id.toString())
      ) || cancellation.booking?.travellers?.[0];

    const leadName = leadTraveller
      ? `${leadTraveller.title} ${leadTraveller.firstName} ${leadTraveller.lastName}`
      : "Traveller";

    const count = cancellation.travellerIds?.length || 0;

    const confirmed = window.confirm(
      `APPROVE CANCELLATION?\n\n` +
        `Traveller: ${leadName}\n` +
        `Cancelling: ${count} traveller(s)\n\n` +
        `This will deduct charges and update balance.\n\n` +
        `Are you sure you want to APPROVE?`
    );

    if (!confirmed) {
      showToast("info", "Approval cancelled by admin");
      return;
    }

    setProcessingIds((s) => new Set(s).add(cancellation._id));
    try {
      const res = await approveCancellation(
        cancellation.bookingId,
        cancellation.travellerIds,
        cancellation._id
      );
      showToast("success", res.message || "Cancellation approved successfully");
      const fresh = await getCancellations();
      if (fresh.success) setCancellations(fresh.data);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Approve failed");
    } finally {
      setProcessingIds((s) => {
        const ns = new Set(s);
        ns.delete(cancellation._id);
        return ns;
      });
    }
  };

  // CONFIRM + REJECT
  const handleReject = async (cancellation) => {
    const leadTraveller =
      cancellation.booking?.travellers?.find((t) =>
        cancellation.travellerIds?.includes(t._id.toString())
      ) || cancellation.booking?.travellers?.[0];

    const leadName = leadTraveller
      ? `${leadTraveller.title} ${leadTraveller.firstName} ${leadTraveller.lastName}`
      : "Traveller";

    const count = cancellation.travellerIds?.length || 0;

    const confirmed = window.confirm(
      `REJECT CANCELLATION?\n\n` +
        `Traveller: ${leadName}\n` +
        `Request for: ${count} traveller(s)\n\n` +
        `This will keep travellers in the tour and clear the request.\n\n` +
        `Are you sure you want to REJECT?`
    );

    if (!confirmed) {
      showToast("info", "Rejection cancelled by admin");
      return;
    }

    setProcessingIds((s) => new Set(s).add(cancellation._id));
    try {
      const res = await rejectCancellation(
        cancellation.bookingId,
        cancellation.travellerIds,
        cancellation._id
      );
      showToast("success", res.message || "Cancellation request rejected");
      const fresh = await getCancellations();
      if (fresh.success) setCancellations(fresh.data);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Reject failed");
    } finally {
      setProcessingIds((s) => {
        const ns = new Set(s);
        ns.delete(cancellation._id);
        return ns;
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((s) => {
      const ns = new Set(s);
      ns.has(id) ? ns.delete(id) : ns.add(id);
      return ns;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <ClipLoader color="#3B82F6" size={60} />
        <p className="text-lg font-medium text-gray-700">
          Loading cancellations...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {/* Toast - Now stays for 5 seconds */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {toastQueue.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-medium text-sm transition-all animate-slide-in-right border-l-4 ${
              t.type === "success"
                ? "bg-green-600 border-green-800"
                : t.type === "info"
                ? "bg-blue-600 border-blue-800"
                : "bg-red-600 border-red-800"
            }`}
          >
            <span className="mt-0.5">
              {t.type === "success"
                ? "Success"
                : t.type === "info"
                ? "Info"
                : "Error"}
            </span>
            <div className="flex-1 whitespace-pre-line leading-tight">
              {t.msg}
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-800">
        Cancellation Centre
      </h1>

      {cancellations.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          No pending cancellations.
        </p>
      ) : (
        <div className="space-y-4">
          {cancellations.map((c) => {
            const isProcessing = processingIds.has(c._id);
            const isExpanded = expandedIds.has(c._id);

            const leadTraveller =
              c.booking?.travellers?.find((t) =>
                c.travellerIds?.includes(t._id.toString())
              ) || c.booking?.travellers?.[0];

            const leadName = leadTraveller
              ? `${leadTraveller.title || ""} ${
                  leadTraveller.firstName || ""
                } ${leadTraveller.lastName || ""}`.trim()
              : "Unknown Traveller";

            const mobile = c.booking?.contact?.mobile || "N/A";

            return (
              <div
                key={c._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpand(c._id)}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-lg">
                      <span className="font-bold text-gray-900">
                        {leadName}
                      </span>
                      <span className="text-gray-500">•</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        <strong>Mobile:</strong> {mobile}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Travellers:</strong>{" "}
                        {c.travellerIds?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-xs">
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 text-sm">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Cancellation Summary
                        </h3>
                        <div className="space-y-2 text-gray-700">
                          <p>
                            <strong>Net Paid:</strong> ₹{c.netAmountPaid || 0}
                          </p>
                          <p>
                            <strong>GV Cancellation:</strong> ₹
                            {c.gvCancellationAmount || 0}
                          </p>
                          <p>
                            <strong>IRCTC Cancellation:</strong> ₹
                            {c.irctcCancellationAmount || 0}
                          </p>
                          <p>
                            <strong>Remarks Amount:</strong> ₹
                            {c.remarksAmount || 0}
                          </p>
                          <p>
                            <strong>Total Deduction:</strong> ₹
                            {c.totalCancellationAmount || 0}
                          </p>
                          <p>
                            <strong>Updated Balance:</strong> ₹
                            {c.updatedBalance || 0}
                          </p>
                          <p className="text-green-600 font-medium">
                            <strong>Refund Amount:</strong> ₹
                            {c.refundAmount || 0}
                          </p>
                          {c.remarkText && (
                            <p className="text-xs italic text-gray-600 mt-2">
                              "{c.remarkText}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Travellers to Cancel ({c.travellerIds?.length})
                        </h3>
                        <ul className="space-y-2">
                          {c.booking?.travellers
                            ?.filter((t) =>
                              c.travellerIds?.includes(t._id.toString())
                            )
                            .map((t) => (
                              <li
                                key={t._id}
                                className="flex justify-between items-center bg-white px-3 py-2 rounded border"
                              >
                                <span>
                                  {t.title} {t.firstName} {t.lastName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {t.age} yrs, {t.gender}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(c);
                        }}
                        disabled={isProcessing}
                        className={`px-6 py-3 rounded font-semibold text-white flex items-center gap-2 transition ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 shadow-lg"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <ClipLoader size={18} color="#fff" /> Processing...
                          </>
                        ) : (
                          "Approve Cancellation"
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(c);
                        }}
                        disabled={isProcessing}
                        className={`px-6 py-3 rounded font-semibold text-white flex items-center gap-2 transition ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 shadow-lg"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <ClipLoader size={18} color="#fff" /> Processing...
                          </>
                        ) : (
                          "Reject Request"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CancellationCentre;
