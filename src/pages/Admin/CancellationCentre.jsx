/* eslint-disable no-unused-vars */
// import React, { useContext, useEffect, useState } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { ClipLoader } from "react-spinners";

// const CancellationCentre = () => {
//   const { getCancellations, approveCancellation, rejectCancellation } =
//     useContext(TourAdminContext);

//   const [cancellations, setCancellations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [processingIds, setProcessingIds] = useState(new Set());
//   const [expandedIds, setExpandedIds] = useState(new Set());

//   // Local toast queue – will be cleared on unmount
//   const [toastQueue, setToastQueue] = useState([]);

//   // Show toast locally (auto-dismiss after 3s)
//   useEffect(() => {
//     if (toastQueue.length === 0) return;

//     const timer = setTimeout(() => {
//       setToastQueue((prev) => prev.slice(1));
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [toastQueue]);

//   // Fetch cancellations
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const res = await getCancellations();
//         setCancellations(res.data || []);
//       } catch {
//         setToastQueue((prev) => [
//           ...prev,
//           { type: "error", msg: "Failed to load cancellations" },
//         ]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [getCancellations]);

//   const handleApprove = async (cancellation) => {
//     const { _id, bookingId, travellerIds } = cancellation;
//     setProcessingIds((s) => new Set(s).add(_id));
//     try {
//       await approveCancellation(bookingId, travellerIds);
//       setToastQueue((prev) => [
//         ...prev,
//         { type: "success", msg: "Approved successfully" },
//       ]);

//       const res = await getCancellations();
//       setCancellations(res.data);
//     } catch {
//       setToastQueue((prev) => [
//         ...prev,
//         { type: "error", msg: "Approve failed" },
//       ]);
//     } finally {
//       setProcessingIds((s) => {
//         const newS = new Set(s);
//         newS.delete(_id);
//         return newS;
//       });
//     }
//   };

//   const handleReject = async (cancellation) => {
//     const { _id, bookingId, travellerIds } = cancellation;
//     setProcessingIds((s) => new Set(s).add(_id));
//     try {
//       await rejectCancellation(bookingId, travellerIds, _id);
//       setToastQueue((prev) => [
//         ...prev,
//         { type: "success", msg: "Rejected successfully" },
//       ]);

//       const res = await getCancellations();
//       setCancellations(res.data);
//     } catch {
//       setToastQueue((prev) => [
//         ...prev,
//         { type: "error", msg: "Reject failed" },
//       ]);
//     } finally {
//       setProcessingIds((s) => {
//         const newS = new Set(s);
//         newS.delete(_id);
//         return newS;
//       });
//     }
//   };

//   const toggleExpand = (id) => {
//     setExpandedIds((s) => {
//       const newS = new Set(s);
//       newS.has(id) ? newS.delete(id) : newS.add(id);
//       return newS;
//     });
//   };

//   // Clear toasts when leaving the page
//   useEffect(() => {
//     return () => setToastQueue([]);
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen gap-4">
//         <ClipLoader color="#3B82F6" size={60} />
//         <p className="text-lg font-medium text-gray-700">
//           Loading cancellations...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen relative">
//       {/* Local Toast Container */}
//       <div className="fixed top-4 right-4 z-50 space-y-2">
//         {toastQueue.map((t, i) => (
//           <div
//             key={i}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white font-medium text-sm transition-all animate-slide-in-right ${
//               t.type === "success" ? "bg-green-600" : "bg-red-600"
//             }`}
//           >
//             <span>{t.type === "success" ? "Success" : "Error"}</span>
//             <span>{t.msg}</span>
//           </div>
//         ))}
//       </div>

//       <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-800">
//         Cancellation Centre
//       </h1>

//       {cancellations.length === 0 ? (
//         <p className="text-center text-lg text-gray-600">
//           No pending cancellations.
//         </p>
//       ) : (
//         <div className="space-y-4">
//           {cancellations.map((c) => {
//             const isProcessing = processingIds.has(c._id);
//             const isExpanded = expandedIds.has(c._id);

//             return (
//               <div
//                 key={c._id}
//                 className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
//               >
//                 {/* Header Row */}
//                 <div
//                   className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:bg-gray-50 transition"
//                   onClick={() => toggleExpand(c._id)}
//                 >
//                   <div className="flex-1">
//                     <p className="font-semibold text-gray-800">
//                       Cancellation ID:{" "}
//                       <span className="font-mono text-sm">{c._id}</span>
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Booking: <span className="font-mono">{c.bookingId}</span>{" "}
//                       | Travellers: {c.travellerIds?.length || 0}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs text-gray-500">
//                       {isExpanded ? "Collapse" : "Expand"}
//                     </span>
//                     <svg
//                       className={`w-5 h-5 text-gray-600 transition-transform ${
//                         isExpanded ? "rotate-180" : ""
//                       }`}
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M19 9l-7 7-7-7"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 {/* Expandable Details */}
//                 {isExpanded && (
//                   <div className="px-4 pb-4 border-t border-gray-200">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
//                       {/* Cancellation Details */}
//                       <div>
//                         <h3 className="font-medium text-gray-700 mb-2">
//                           Cancellation Details
//                         </h3>
//                         <div className="space-y-1 text-gray-600">
//                           <p>
//                             <strong>Net Paid:</strong> ₹{c.netAmountPaid || 0}
//                           </p>
//                           <p>
//                             <strong>Days:</strong> {c.noOfDays || "N/A"}
//                           </p>
//                           <p>
//                             <strong>GV Cancel:</strong> ₹
//                             {c.gvCancellationAmount || 0}
//                           </p>
//                           <p>
//                             <strong>IRCTC Cancel:</strong> ₹
//                             {c.irctcCancellationAmount || 0}
//                           </p>
//                           <p>
//                             <strong>Pre-Balance:</strong> ₹
//                             {c.preBalanceAmount || 0}
//                           </p>
//                           <p>
//                             <strong>Balance Mgmt:</strong> ₹
//                             {c.bookingBalanceManagementAmount || 0}
//                           </p>
//                           <p>
//                             <strong>Remarks Amt:</strong> ₹
//                             {c.remarksAmount || 0}
//                           </p>
//                           <p>
//                             <strong>Total Cancel:</strong> ₹
//                             {c.totalCancellationAmount || 0}
//                           </p>
//                           <p>
//                             <strong>Updated Balance:</strong> ₹
//                             {c.updatedBalance || 0}
//                           </p>
//                           <p>
//                             <strong>Refund:</strong> ₹{c.refundAmount || 0}
//                           </p>
//                           {c.remarkText && (
//                             <p>
//                               <strong>Remark:</strong> {c.remarkText}
//                             </p>
//                           )}
//                         </div>
//                       </div>

//                       {/* Booking Summary */}
//                       {c.booking && (
//                         <div>
//                           <h3 className="font-medium text-gray-700 mb-2">
//                             Booking Summary
//                           </h3>
//                           <div className="space-y-1 text-gray-600">
//                             <p>
//                               <strong>User ID:</strong> {c.booking.userId}
//                             </p>
//                             <p>
//                               <strong>Tour ID:</strong> {c.booking.tourId}
//                             </p>
//                             <p>
//                               <strong>Date:</strong>{" "}
//                               {new Date(
//                                 c.booking.bookingDate
//                               ).toLocaleDateString()}
//                             </p>
//                             <p>
//                               <strong>Email:</strong> {c.booking.contact?.email}
//                             </p>
//                             <p>
//                               <strong>Mobile:</strong>{" "}
//                               {c.booking.contact?.mobile}
//                             </p>
//                             <p>
//                               <strong>Advance:</strong> ₹
//                               {c.booking.payment?.advance?.amount || 0}
//                             </p>
//                             <p>
//                               <strong>Balance:</strong> ₹
//                               {c.booking.payment?.balance?.amount || 0}
//                             </p>
//                           </div>

//                           <div className="mt-3">
//                             <h4 className="font-medium text-gray-600">
//                               Cancelled Travellers
//                             </h4>
//                             <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
//                               {c.booking.travellers?.map((t) => (
//                                 <li key={t._id}>
//                                   {t.title} {t.firstName} {t.lastName} ({t.age},{" "}
//                                   {t.gender})
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="mt-5 flex justify-end gap-3">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleApprove(c);
//                         }}
//                         disabled={isProcessing}
//                         className={`px-4 py-2 rounded font-medium text-white flex items-center gap-2 transition ${
//                           isProcessing
//                             ? "bg-gray-400 cursor-not-allowed"
//                             : "bg-green-600 hover:bg-green-700"
//                         }`}
//                       >
//                         {isProcessing ? (
//                           <>
//                             <ClipLoader size={16} color="#fff" /> Processing...
//                           </>
//                         ) : (
//                           "Approve"
//                         )}
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleReject(c);
//                         }}
//                         disabled={isProcessing}
//                         className={`px-4 py-2 rounded font-medium text-white flex items-center gap-2 transition ${
//                           isProcessing
//                             ? "bg-gray-400 cursor-not-allowed"
//                             : "bg-red-600 hover:bg-red-700"
//                         }`}
//                       >
//                         {isProcessing ? (
//                           <>
//                             <ClipLoader size={16} color="#fff" /> Processing...
//                           </>
//                         ) : (
//                           "Reject"
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CancellationCentre;

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

  // Local toast queue
  const [toastQueue, setToastQueue] = useState([]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastQueue.length === 0) return;
    const timer = setTimeout(() => {
      setToastQueue((prev) => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastQueue]);

  // Fetch cancellations on mount
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

  // Helper to show toast
  const showToast = (type, msg) => {
    setToastQueue((prev) => [...prev, { type, msg }]);
  };

  // Approve cancellation
  const handleApprove = async (cancellation) => {
    const { _id, bookingId, travellerIds } = cancellation;
    setProcessingIds((s) => new Set(s).add(_id));
    try {
      const res = await approveCancellation(bookingId, travellerIds);
      showToast("success", res.message || "Approved successfully");

      const fresh = await getCancellations();
      if (fresh.success) setCancellations(fresh.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Approve failed";
      showToast("error", msg);
    } finally {
      setProcessingIds((s) => {
        const ns = new Set(s);
        ns.delete(_id);
        return ns;
      });
    }
  };

  // Reject cancellation
  const handleReject = async (cancellation) => {
    const { _id, bookingId, travellerIds } = cancellation;
    setProcessingIds((s) => new Set(s).add(_id));
    try {
      const res = await rejectCancellation(bookingId, travellerIds, _id);
      showToast("success", res.message || "Rejected successfully");

      const fresh = await getCancellations();
      if (fresh.success) setCancellations(fresh.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Reject failed";
      showToast("error", msg);
    } finally {
      setProcessingIds((s) => {
        const ns = new Set(s);
        ns.delete(_id);
        return ns;
      });
    }
  };

  // Toggle expand
  const toggleExpand = (id) => {
    setExpandedIds((s) => {
      const ns = new Set(s);
      ns.has(id) ? ns.delete(id) : ns.add(id);
      return ns;
    });
  };

  // Cleanup toasts on unmount
  useEffect(() => {
    return () => setToastQueue([]);
  }, []);

  // Loading state
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
      {/* Local Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastQueue.map((t, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white font-medium text-sm transition-all animate-slide-in-right ${
              t.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <span>{t.type === "success" ? "Success" : "Error"}</span>
            <span>{t.msg}</span>
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

            return (
              <div
                key={c._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Header Row */}
                <div
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpand(c._id)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      Cancellation ID:{" "}
                      <span className="font-mono text-sm">{c._id}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Booking: <span className="font-mono">{c.bookingId}</span>{" "}
                      | Travellers: {c.travellerIds?.length || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
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

                {/* Expandable Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                      {/* Cancellation Details */}
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">
                          Cancellation Details
                        </h3>
                        <div className="space-y-1 text-gray-600">
                          <p>
                            <strong>Net Paid:</strong> ₹{c.netAmountPaid || 0}
                          </p>
                          <p>
                            <strong>Days:</strong> {c.noOfDays || "N/A"}
                          </p>
                          <p>
                            <strong>GV Cancel:</strong> ₹
                            {c.gvCancellationAmount || 0}
                          </p>
                          <p>
                            <strong>IRCTC Cancel:</strong> ₹
                            {c.irctcCancellationAmount || 0}
                          </p>
                          <p>
                            <strong>Pre-Balance:</strong> ₹
                            {c.preBalanceAmount || 0}
                          </p>
                          <p>
                            <strong>Balance Mgmt:</strong> ₹
                            {c.bookingBalanceManagementAmount || 0}
                          </p>
                          <p>
                            <strong>Remarks Amt:</strong> ₹
                            {c.remarksAmount || 0}
                          </p>
                          <p>
                            <strong>Total Cancel:</strong> ₹
                            {c.totalCancellationAmount || 0}
                          </p>
                          <p>
                            <strong>Updated Balance:</strong> ₹
                            {c.updatedBalance || 0}
                          </p>
                          <p>
                            <strong>Refund:</strong> ₹{c.refundAmount || 0}
                          </p>
                          {c.remarkText && (
                            <p>
                              <strong>Remark:</strong> {c.remarkText}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Booking Summary */}
                      {c.booking && (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-2">
                            Booking Summary
                          </h3>
                          <div className="space-y-1 text-gray-600">
                            <p>
                              <strong>User ID:</strong> {c.booking.userId}
                            </p>
                            <p>
                              <strong>Tour ID:</strong> {c.booking.tourId}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                c.booking.bookingDate
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Email:</strong> {c.booking.contact?.email}
                            </p>
                            <p>
                              <strong>Mobile:</strong>{" "}
                              {c.booking.contact?.mobile}
                            </p>
                            <p>
                              <strong>Advance:</strong> ₹
                              {c.booking.payment?.advance?.amount || 0}
                            </p>
                            <p>
                              <strong>Balance:</strong> ₹
                              {c.booking.payment?.balance?.amount || 0}
                            </p>
                          </div>

                          <div className="mt-3">
                            <h4 className="font-medium text-gray-600">
                              Cancelled Travellers
                            </h4>
                            <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                              {c.booking.travellers
                                ?.filter((t) => c.travellerIds?.includes(t._id))
                                .map((t) => (
                                  <li key={t._id}>
                                    {t.title} {t.firstName} {t.lastName} (
                                    {t.age}, {t.gender})
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(c);
                        }}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded font-medium text-white flex items-center gap-2 transition ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <ClipLoader size={16} color="#fff" /> Processing...
                          </>
                        ) : (
                          "Approve"
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(c);
                        }}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded font-medium text-white flex items-center gap-2 transition ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <ClipLoader size={16} color="#fff" /> Processing...
                          </>
                        ) : (
                          "Reject"
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
