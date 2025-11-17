// import React, { useContext, useEffect, useState } from "react";
// import { TourContext } from "../../context/TourContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const trainClasses = [
//   { value: "3A", label: "3A - Three tier AC" },
//   { value: "2A", label: "2A - Two tier AC" },
//   { value: "1A", label: "1A - First AC" },
//   { value: "3E", label: "3E - Three tier economy AC" },
//   { value: "SL", label: "SL - Sleeper" },
//   { value: "2S", label: "2S - Second sitting" },
//   { value: "CC", label: "CC - Chair car AC" },
//   { value: "EC", label: "EC - Executive chair car AC" },
// ];
// const flightClasses = [
//   { value: "Economy", label: "Economy" },
//   { value: "Business", label: "Business" },
//   { value: "First", label: "First Class" },
// ];

// /**
//  * Returns consistent status object for a cancellation record
//  */
// const getCancellationStatus = (c) => {
//   if (c.approvedBy === true && c.raisedBy === false) {
//     return {
//       status: "APPROVED",
//       bg: "bg-green-50",
//       border: "border-green-500",
//       badge: "APPROVED",
//       badgeBg: "bg-green-600 text-white",
//     };
//   }
//   if (c.raisedBy === true && c.approvedBy === false) {
//     return {
//       status: "PENDING FOR APPROVAL",
//       bg: "bg-yellow-50",
//       border: "border-yellow-500",
//       badge: "PENDING",
//       badgeBg: "bg-yellow-600 text-white",
//     };
//   }
//   if (c.approvedBy === false && c.raisedBy === false) {
//     return {
//       status: "REJECTED",
//       bg: "bg-red-50",
//       border: "border-red-500",
//       badge: "REJECTED",
//       badgeBg: "bg-red-600 text-white",
//     };
//   }
//   return {
//     status: "UNKNOWN",
//     bg: "bg-gray-50",
//     border: "border-gray-500",
//     badge: "UNKNOWN",
//     badgeBg: "bg-gray-600 text-white",
//   };
// };

// const CancellationControls = () => {
//   const {
//     viewBooking,
//     singleBooking,
//     calculateCancelBooking,
//     fetchCancellationsByBooking,
//   } = useContext(TourContext);

//   // ────────────────────── STATE ──────────────────────
//   const [bookingId, setBookingId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedIndexes, setSelectedIndexes] = useState([]);
//   const [cancellationDate, setCancellationDate] = useState("");
//   const [trainCancellations, setTrainCancellations] = useState({});
//   const [flightCancellations, setFlightCancellations] = useState({});
//   const [customAddons, setCustomAddons] = useState([
//     { name: "", amount: "", remark: "" },
//   ]);
//   const [submitting, setSubmitting] = useState(false);

//   const [cancellationHistory, setCancellationHistory] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [historyError, setHistoryError] = useState(null);

//   // ────────────────────── EFFECTS ──────────────────────
//   useEffect(() => {
//     if (singleBooking) {
//       resetForm();
//       fetchCancellationHistory(singleBooking._id);
//     } else {
//       setCancellationHistory([]);
//       setHistoryError(null);
//     }
//   }, [singleBooking]);

//   const resetForm = () => {
//     setSelectedIndexes([]);
//     setCancellationDate("");
//     setTrainCancellations({});
//     setFlightCancellations({});
//     setCustomAddons([{ name: "", amount: "", remark: "" }]);
//   };

//   // ────────────────────── API CALLS ──────────────────────
//   const handleFetch = async () => {
//     if (!bookingId.trim()) return toast.error("Paste a Booking ID");
//     setLoading(true);
//     setError(null);
//     const result = await viewBooking(bookingId.trim());
//     setLoading(false);
//     if (result.success) {
//       toast.success("Booking loaded!");
//     } else {
//       setError(result.message);
//     }
//   };

//   const fetchCancellationHistory = async (bookingId) => {
//     if (!bookingId) return;
//     setHistoryLoading(true);
//     setHistoryError(null);
//     const result = await fetchCancellationsByBooking(bookingId);
//     setHistoryLoading(false);
//     if (result.success) {
//       const sorted = (result.results || []).sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//       setCancellationHistory(sorted);
//     } else {
//       setHistoryError(result.message);
//       setCancellationHistory([]);
//     }
//   };

//   // ────────────────────── TRAVELLER SELECTION ──────────────────────
//   const toggleTraveller = (idx) => {
//     const t = singleBooking.travellers[idx];
//     const cancelled = t.cancelled || {};

//     const isApprovedAndAdminCancelled =
//       cancellationHistory.some(
//         (c) => c.travellerIds?.includes(t._id) && c.approvedBy === true
//       ) && cancelled.byAdmin === true;

//     if (isApprovedAndAdminCancelled) return; // blocked

//     setSelectedIndexes((prev) =>
//       prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
//     );
//   };

//   const setTrain = (key, value) =>
//     setTrainCancellations((prev) => ({
//       ...prev,
//       [key]: value === "" ? 0 : Number(value),
//     }));
//   const setFlight = (key, value) =>
//     setFlightCancellations((prev) => ({
//       ...prev,
//       [key]: value === "" ? 0 : Number(value),
//     }));

//   // ────────────────────── CUSTOM ADDONS ──────────────────────
//   const handleAddAddon = () =>
//     setCustomAddons([...customAddons, { name: "", amount: "", remark: "" }]);
//   const handleRemoveAddon = (i) =>
//     setCustomAddons(customAddons.filter((_, idx) => idx !== i));
//   const handleAddonChange = (i, field, val) => {
//     const upd = [...customAddons];
//     upd[i][field] = val;
//     setCustomAddons(upd);
//   };

//   // ────────────────────── BULK CANCEL ──────────────────────
//   const handleBulkCancel = async () => {
//     if (selectedIndexes.length === 0)
//       return toast.error("Select at least one traveller");
//     if (!cancellationDate) return toast.error("Pick a cancellation date");
//     setSubmitting(true);

//     const relevantTrain = Object.fromEntries(
//       Object.entries(trainCancellations).filter(([k]) =>
//         selectedIndexes.includes(Number(k.split("-")[1]))
//       )
//     );
//     const relevantFlight = Object.fromEntries(
//       Object.entries(flightCancellations).filter(([k]) =>
//         selectedIndexes.includes(Number(k.split("-")[1]))
//       )
//     );

//     const trainSum = Object.values(relevantTrain).reduce((s, v) => s + v, 0);
//     const flightSum = Object.values(relevantFlight).reduce((s, v) => s + v, 0);
//     const irctcCancellationAmount = trainSum + flightSum;
//     const extraRemarkAmount = customAddons
//       .filter((a) => a.amount)
//       .reduce((s, a) => s + parseFloat(a.amount || 0), 0);
//     const remark = customAddons
//       .filter((a) => a.remark)
//       .map((a) => `${a.name}: ${a.remark}`)
//       .join("; ");

//     const payload = {
//       bookingId: singleBooking._id,
//       cancellationDate,
//       cancelledTravellerIndexes: selectedIndexes,
//       extraRemarkAmount,
//       remark: remark || undefined,
//       irctcCancellationAmount,
//       trainCancellations: relevantTrain,
//       flightCancellations: relevantFlight,
//     };

//     const result = await calculateCancelBooking(payload);
//     setSubmitting(false);
//     if (result.success) {
//       toast.success(`${selectedIndexes.length} traveller(s) cancelled`);
//       await viewBooking(singleBooking._id); // refresh
//       fetchCancellationHistory(singleBooking._id); // refresh history
//     } else {
//       toast.error(result.message || "Cancellation failed");
//     }
//   };

//   // ────────────────────── HELPERS ──────────────────────
//   const firstTraveller = singleBooking?.travellers?.[0];
//   const tourFull = singleBooking?.tourFull;
//   const payment = singleBooking?.payment || {
//     advance: { amount: 0, paid: false },
//     balance: { amount: 0, paid: false },
//   };

//   const getSharingText = (t) => {
//     const age = parseInt(t.age);
//     if (age <= 12) {
//       return t.sharingType === "withBerth"
//         ? "Child w/ Berth"
//         : "Child w/o Berth";
//     }
//     return t.sharingType === "triple" ? "Triple Sharing" : "Double Sharing";
//   };

//   const getBalance = (traveller) => {
//     const isVariant =
//       traveller?.packageType === "variant" &&
//       traveller?.variantPackageIndex != null;
//     const variant = isVariant
//       ? tourFull?.variantPackage?.[traveller.variantPackageIndex]
//       : null;
//     if (isVariant && variant) {
//       return {
//         double: variant.balanceDouble || 0,
//         triple: variant.balanceTriple || 0,
//         childWithBerth: variant.balanceChildWithBerth || 0,
//         childWithoutBerth: variant.balanceChildWithoutBerth || 0,
//       };
//     }
//     return {
//       double: tourFull?.balanceDouble || 0,
//       triple: tourFull?.balanceTriple || 0,
//       childWithBerth: tourFull?.balanceChildWithBerth || 0,
//       childWithoutBerth: tourFull?.balanceChildWithoutBerth || 0,
//     };
//   };

//   const calculateTourCost = () => {
//     if (!singleBooking?.travellers) return 0;
//     let total = 0;
//     singleBooking.travellers.forEach((t) => {
//       const balance = getBalance(t);
//       const age = parseInt(t.age);
//       const isChild = age <= 12;
//       total += isChild
//         ? t.sharingType === "withBerth"
//           ? balance.childWithBerth
//           : balance.childWithoutBerth
//         : t.sharingType === "triple"
//         ? balance.triple
//         : balance.double;
//     });
//     return total;
//   };

//   const openingBalance = calculateTourCost();
//   const advancePaid = payment?.advance?.paid ? payment.advance.amount : 0;
//   const balancePaid = payment?.balance?.paid ? payment.balance.amount : 0;
//   const negativeAdminNet = (singleBooking?.adminRemarks || [])
//     .filter((r) => r.amount < 0)
//     .reduce((s, r) => s + r.amount, 0);
//   const negativeRemarkSum = Math.abs(negativeAdminNet);
//   const totalPaidSoFar = advancePaid + negativeRemarkSum + balancePaid;

//   const getPaymentStatus = (type) => {
//     const p = type === "advance" ? payment.advance : payment.balance;
//     if (!p.paid) return { text: "Not Paid", color: "text-red-700 bg-red-50" };
//     if (!p.paymentVerified)
//       return {
//         text: "Paid (Not Verified)",
//         color: "text-yellow-700 bg-yellow-50",
//       };
//     return { text: "Paid & Verified", color: "text-green-700 bg-green-50" };
//   };
//   const advanceStatus = getPaymentStatus("advance");
//   const balanceStatus = getPaymentStatus("balance");

//   const isBookingRejected = singleBooking?.cancelled?.byAdmin === true;

//   // ────────────────────── RENDER ──────────────────────
//   if (!singleBooking && !loading && !error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
//         <ToastContainer position="top-right" autoClose={3000} />
//         <div className="max-w-4xl mx-auto mb-10">
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 text-center">
//               Cancellation Controller
//             </h1>
//             <div className="flex flex-col sm:flex-row gap-3">
//               <input
//                 type="text"
//                 value={bookingId}
//                 onChange={(e) => setBookingId(e.target.value)}
//                 placeholder="Paste Booking ID"
//                 className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
//               />
//               <button
//                 onClick={handleFetch}
//                 disabled={loading}
//                 className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
//                   loading
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-indigo-600 hover:bg-indigo-700"
//                 }`}
//               >
//                 {loading ? "Loading…" : "Get Details"}
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="max-w-5xl mx-auto text-center text-gray-500 mt-20">
//           <p className="text-lg">Paste a Booking ID and click "Get Details"</p>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
//           <p className="mt-3 text-gray-600">Fetching booking...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
//         <ToastContainer position="top-right" autoClose={3000} />
//         <div className="max-w-4xl mx-auto mb-10">
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 text-center">
//               Cancellation Controller
//             </h1>
//             <div className="flex flex-col sm:flex-row gap-3">
//               <input
//                 type="text"
//                 value={bookingId}
//                 onChange={(e) => setBookingId(e.target.value)}
//                 placeholder="Paste Booking ID"
//                 className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
//               />
//               <button
//                 onClick={handleFetch}
//                 className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
//               >
//                 Get Details
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="max-w-5xl mx-auto">
//           <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded-lg">
//             <strong>Error:</strong> {error}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
//       <ToastContainer position="top-right" autoClose={3000} />

//       {/* HEADER */}
//       <div className="max-w-4xl mx-auto mb-10">
//         <div className="bg-white rounded-2xl shadow-xl p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
//               Cancellation Controller
//             </h1>
//             {isBookingRejected && (
//               <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
//                 OFF - Booking Rejected
//               </span>
//             )}
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <input
//               type="text"
//               value={bookingId}
//               onChange={(e) => setBookingId(e.target.value)}
//               placeholder="Paste Booking ID"
//               className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
//               disabled={isBookingRejected}
//             />
//             <button
//               onClick={handleFetch}
//               className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
//               disabled={isBookingRejected}
//             >
//               Get Details
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* BOOKING SUMMARY */}
//       <div className="max-w-5xl mx-auto space-y-8">
//         <div className="bg-white rounded-2xl shadow-lg p-6">
//           <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4">
//             Booking ID #{singleBooking._id}
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//             <div>
//               <strong>Lead Traveller:</strong> {firstTraveller?.title}{" "}
//               {firstTraveller?.firstName} {firstTraveller?.lastName}
//             </div>
//             <div>
//               <strong>Mobile:</strong> {singleBooking.contact.mobile}
//             </div>
//             <div>
//               <strong>Tour:</strong> {tourFull?.title} ({tourFull?.batch})
//             </div>
//             <div>
//               <strong>Date:</strong>{" "}
//               {new Date(singleBooking.bookingDate).toLocaleString()}
//             </div>
//             <div className="sm:col-span-2">
//               <strong>Booking Type:</strong>{" "}
//               <span
//                 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                   singleBooking.bookingType === "online"
//                     ? "bg-green-100 text-green-800"
//                     : "bg-blue-100 text-blue-800"
//                 }`}
//               >
//                 {singleBooking.bookingType.toUpperCase()}
//               </span>
//             </div>
//           </div>
//           <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium">
//             <div className={`p-3 rounded-lg border ${advanceStatus.color}`}>
//               <p className="font-semibold">Advance</p>
//               <p className="text-xl font-bold">₹{payment.advance.amount}</p>
//               <p className="text-xs mt-1">{advanceStatus.text}</p>
//             </div>
//             <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
//               <p className="text-yellow-800">Opening Balance (Tour Cost)</p>
//               <p className="text-xl font-bold text-yellow-700">
//                 ₹{openingBalance.toLocaleString()}
//               </p>
//             </div>
//             <div className={`p-3 rounded-lg border ${balanceStatus.color}`}>
//               <p className="font-semibold">Balance</p>
//               <p className="text-xl font-bold">₹{payment.balance.amount}</p>
//               <p className="text-xs mt-1">{balanceStatus.text}</p>
//             </div>
//           </div>
//           <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
//             <label className="block text-sm font-medium text-indigo-800 mb-1">
//               Total Amount Paid So Far
//             </label>
//             <input
//               type="text"
//               value={`₹${totalPaidSoFar.toLocaleString()}`}
//               readOnly
//               className="w-full px-3 py-2 bg-indigo-100 border border-indigo-300 rounded-md text-sm font-semibold text-indigo-900"
//             />
//             <p className="text-xs text-indigo-600 mt-1">
//               Advance (Paid) + Negative Admin Remarks + Balance (Paid)
//             </p>
//           </div>
//         </div>

//         {/* ADMIN REMARKS */}
//         {singleBooking.adminRemarks?.length > 0 && (
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-3">
//               Admin Actions History
//             </h3>
//             <div className="space-y-3">
//               <div className="p-4 rounded-lg border-l-4 bg-indigo-50 border-indigo-500 text-sm">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <p className="font-medium">Tour Cost (Opening Balance)</p>
//                   </div>
//                   <div className="text-right ml-4">
//                     <p className="font-bold text-indigo-700">
//                       ₹{openingBalance.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               {(singleBooking.adminRemarks || []).map((r, i) => {
//                 let runningBalance = openingBalance;
//                 for (let j = 0; j <= i; j++) {
//                   runningBalance += singleBooking.adminRemarks[j]?.amount || 0;
//                 }
//                 return (
//                   <div
//                     key={i}
//                     className={`p-4 rounded-lg border-l-4 text-sm ${
//                       r.amount > 0
//                         ? "bg-green-50 border-green-500"
//                         : r.amount < 0
//                         ? "bg-red-50 border-red-500"
//                         : "bg-blue-50 border-blue-500"
//                     }`}
//                   >
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <p className="font-medium">Remark: {r.remark}</p>
//                         {r.amount !== 0 && (
//                           <p className="mt-1">
//                             Amount:{" "}
//                             <span
//                               className={
//                                 r.amount > 0 ? "text-green-700" : "text-red-700"
//                               }
//                             >
//                               {r.amount > 0 ? "+" : "-"}₹
//                               {Math.abs(r.amount).toLocaleString()}
//                             </span>
//                           </p>
//                         )}
//                         <p className="text-xs text-gray-500 mt-1">
//                           Date: {new Date(r.addedAt).toLocaleString()}
//                         </p>
//                       </div>
//                       <div className="text-right ml-4">
//                         <p className="text-xs text-gray-600">Closing Balance</p>
//                         <p className="font-bold text-indigo-700">
//                           ₹{runningBalance.toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* CANCELLATION HISTORY */}
//         <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
//               Cancellation History
//             </h3>
//             <div>
//               {historyLoading ? (
//                 <span className="text-xs text-gray-500">Loading...</span>
//               ) : historyError ? (
//                 <span className="text-xs text-red-600">Error</span>
//               ) : (
//                 <span className="text-xs text-gray-500">
//                   {cancellationHistory.length} record(s)
//                 </span>
//               )}
//             </div>
//           </div>

//           {historyLoading && (
//             <div className="text-xs text-gray-500">Loading history...</div>
//           )}
//           {historyError && (
//             <div className="text-xs text-red-600">{historyError}</div>
//           )}
//           {!historyLoading && cancellationHistory.length === 0 && (
//             <div className="text-xs text-gray-500">No cancellations yet.</div>
//           )}

//           <div className="space-y-3">
//             {cancellationHistory.map((c, i) => {
//               const status = getCancellationStatus(c);

//               return (
//                 <div
//                   key={i}
//                   className={`border rounded-lg p-3 ${status.bg} ${status.border} border-l-4`}
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <p className="font-medium">
//                         Cancellation #{cancellationHistory.length - i}
//                         <span
//                           className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${status.badgeBg}`}
//                         >
//                           {status.badge}
//                         </span>
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         Date:{" "}
//                         {c.createdAt
//                           ? new Date(c.createdAt).toLocaleString()
//                           : "—"}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-bold text-rose-800">
//                         Refund: ₹{(c.refundAmount ?? 0).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
//                     <div>
//                       <strong>GV Cancellation:</strong> ₹
//                       {(c.gvCancellationAmount ?? 0).toLocaleString()}
//                     </div>
//                     <div>
//                       <strong>IRCTC Cancellation:</strong> ₹
//                       {(c.irctcCancellationAmount ?? 0).toLocaleString()}
//                     </div>
//                     <div>
//                       <strong>Remarks Amount:</strong> ₹
//                       {(c.remarksAmount ?? 0).toLocaleString()}
//                     </div>
//                     <div>
//                       <strong>Total Cancelled:</strong> ₹
//                       {(c.totalCancellationAmount ?? 0).toLocaleString()}
//                     </div>
//                     <div>
//                       <strong>Updated Balance:</strong> ₹
//                       {(c.updatedBalance ?? 0).toLocaleString()}
//                     </div>
//                     <div>
//                       <strong>Days:</strong> {c.noOfDays ?? 0}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* TRAVELLERS */}
//         <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
//             <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
//               Travellers ({singleBooking?.travellers?.length ?? 0})
//             </h3>
//             <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
//               <div className="w-full sm:w-48">
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700">
//                   Cancellation Date
//                 </label>
//                 <input
//                   type="date"
//                   value={cancellationDate}
//                   onChange={(e) => setCancellationDate(e.target.value)}
//                   className="w-full px-2 py-1 sm:px-3 sm:py-2 border rounded text-xs sm:text-sm"
//                   disabled={isBookingRejected}
//                 />
//               </div>
//               <button
//                 onClick={handleBulkCancel}
//                 disabled={
//                   submitting ||
//                   selectedIndexes.length === 0 ||
//                   isBookingRejected
//                 }
//                 className={`px-3 py-1 sm:px-4 sm:py-2 rounded font-semibold text-white text-xs sm:text-sm ${
//                   submitting ||
//                   selectedIndexes.length === 0 ||
//                   isBookingRejected
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-red-600 hover:bg-red-700"
//                 }`}
//               >
//                 {submitting
//                   ? "Processing…"
//                   : `Cancel ${selectedIndexes.length} Selected`}
//               </button>
//             </div>
//           </div>

//           <div className="space-y-3 sm:space-y-4">
//             {(singleBooking?.travellers || []).map((t, idx) => {
//               const cancelled = t.cancelled || {};
//               const isApprovedAndAdminCancelled =
//                 cancellationHistory.some(
//                   (c) =>
//                     c.travellerIds?.includes(t._id) && c.approvedBy === true
//                 ) && cancelled.byAdmin === true;

//               const isSelectable = !isApprovedAndAdminCancelled;
//               const isVariant =
//                 t.packageType === "variant" && t.variantPackageIndex != null;
//               const variant = isVariant
//                 ? tourFull?.variantPackage?.[t.variantPackageIndex]
//                 : null;
//               const getPkg = (field) =>
//                 (isVariant && variant?.[field]) || tourFull?.[field] || [];
//               const trainDetails = getPkg("trainDetails");
//               const flightDetails = getPkg("flightDetails");

//               return (
//                 <div
//                   key={idx}
//                   className={`border rounded-lg p-3 sm:p-4 ${
//                     isApprovedAndAdminCancelled
//                       ? "bg-gray-100 opacity-60"
//                       : "bg-gray-50"
//                   }`}
//                 >
//                   <div className="flex items-start justify-between gap-2">
//                     <label
//                       className={`flex items-center gap-2 sm:gap-3 flex-1 ${
//                         !isSelectable ? "cursor-not-allowed" : ""
//                       }`}
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedIndexes.includes(idx)}
//                         onChange={() => toggleTraveller(idx)}
//                         className="h-4 w-4 sm:h-5 sm:w-5"
//                         disabled={!isSelectable}
//                       />
//                       <div>
//                         <div className="text-sm sm:text-base font-medium">
//                           {t.title} {t.firstName} {t.lastName}
//                           <span className="text-xs sm:text-sm text-gray-500 ml-1">
//                             ({t.age}, {t.gender})
//                           </span>
//                           {isApprovedAndAdminCancelled && (
//                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
//                               OFF - Cancellation Approved
//                             </span>
//                           )}
//                         </div>
//                         <div className="text-xs text-gray-600 mt-1">
//                           Package:{" "}
//                           <span className="font-semibold">
//                             {isVariant ? "Variant" : "Main"}
//                           </span>{" "}
//                           • Sharing:{" "}
//                           <span className="font-semibold">
//                             {getSharingText(t)}
//                           </span>
//                         </div>
//                       </div>
//                     </label>
//                   </div>

//                   {selectedIndexes.includes(idx) && isSelectable && (
//                     <div className="mt-3 space-y-3 border-t pt-3">
//                       {trainDetails.length > 0 && (
//                         <div>
//                           <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
//                             Train Cancellation
//                           </div>
//                           {trainDetails.map((tr, i) => {
//                             const key = `train-${idx}-${i}`;
//                             const amt = trainCancellations[key] || 0;
//                             return (
//                               <div
//                                 key={i}
//                                 className="p-2 sm:p-3 bg-white rounded border mb-2"
//                               >
//                                 <p className="font-medium text-indigo-700 text-xs sm:text-sm">
//                                   {tr.trainName} ({tr.trainNo})
//                                 </p>
//                                 <p className="text-xs text-gray-600">
//                                   {tr.fromStation} to {tr.toStation}
//                                 </p>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 sm:mt-2">
//                                   <select className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm">
//                                     <option>Select Class</option>
//                                     {trainClasses.map((c) => (
//                                       <option key={c.value} value={c.value}>
//                                         {c.label}
//                                       </option>
//                                     ))}
//                                   </select>
//                                   <input
//                                     type="number"
//                                     placeholder="Amount"
//                                     value={amt > 0 ? amt : ""}
//                                     onChange={(e) =>
//                                       setTrain(key, e.target.value)
//                                     }
//                                     className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                                   />
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}

//                       {flightDetails.length > 0 && (
//                         <div>
//                           <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
//                             Flight Cancellation
//                           </div>
//                           {flightDetails.map((fl, i) => {
//                             const key = `flight-${idx}-${i}`;
//                             const amt = flightCancellations[key] || 0;
//                             return (
//                               <div
//                                 key={i}
//                                 className="p-2 sm:p-3 bg-white rounded border mb-2"
//                               >
//                                 <p className="font-medium text-indigo-700 text-xs sm:text-sm">
//                                   {fl.airline} {fl.flightNo}
//                                 </p>
//                                 <p className="text-xs text-gray-600">
//                                   {fl.fromAirport} to {fl.toAirport}
//                                 </p>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 sm:mt-2">
//                                   <select className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm">
//                                     <option>Select Class</option>
//                                     {flightClasses.map((c) => (
//                                       <option key={c.value} value={c.value}>
//                                         {c.label}
//                                       </option>
//                                     ))}
//                                   </select>
//                                   <input
//                                     type="number"
//                                     placeholder="Amount"
//                                     value={amt > 0 ? amt : ""}
//                                     onChange={(e) =>
//                                       setFlight(key, e.target.value)
//                                     }
//                                     className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                                   />
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}

//                       <div className="p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded">
//                         <p className="text-xs sm:text-sm font-medium text-orange-800">
//                           IRCTC for this traveller: ₹
//                           {(
//                             Object.entries(trainCancellations)
//                               .filter(([k]) => k.startsWith(`train-${idx}-`))
//                               .reduce((s, [, v]) => s + v, 0) +
//                             Object.entries(flightCancellations)
//                               .filter(([k]) => k.startsWith(`flight-${idx}-`))
//                               .reduce((s, [, v]) => s + v, 0)
//                           ).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* CUSTOM ADDONS */}
//           {!isBookingRejected && (
//             <div className="mt-4 sm:mt-6 md:mt-8">
//               <div className="flex justify-between items-center mb-2">
//                 <label className="block text-xs sm:text-sm font-medium text-gray-700">
//                   Custom Addons (apply to whole cancellation)
//                 </label>
//                 <button
//                   onClick={handleAddAddon}
//                   className="text-xs text-indigo-600 hover:text-indigo-800"
//                   disabled={isBookingRejected}
//                 >
//                   + Add New
//                 </button>
//               </div>

//               {customAddons.map((a, i) => (
//                 <div
//                   key={i}
//                   className="mb-2 p-2 sm:p-3 bg-yellow-50 rounded border border-yellow-200"
//                 >
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={a.name}
//                       onChange={(e) =>
//                         handleAddonChange(i, "name", e.target.value)
//                       }
//                       className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                       disabled={isBookingRejected}
//                     />
//                     <input
//                       type="number"
//                       placeholder="Amount"
//                       value={a.amount}
//                       onChange={(e) =>
//                         handleAddonChange(i, "amount", e.target.value)
//                       }
//                       className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                       disabled={isBookingRejected}
//                     />
//                     <input
//                       type="text"
//                       placeholder="Remark"
//                       value={a.remark}
//                       onChange={(e) =>
//                         handleAddonChange(i, "remark", e.target.value)
//                       }
//                       className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                       disabled={isBookingRejected}
//                     />
//                   </div>
//                   {customAddons.length > 1 && (
//                     <button
//                       onClick={() => handleRemoveAddon(i)}
//                       className="mt-1 sm:mt-2 text-xs text-red-600 hover:text-red-800"
//                       disabled={isBookingRejected}
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CancellationControls;

import React, { useContext, useEffect, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const trainClasses = [
  { value: "3A", label: "3A - Three tier AC" },
  { value: "2A", label: "2A - Two tier AC" },
  { value: "1A", label: "1A - First AC" },
  { value: "3E", label: "3E - Three tier economy AC" },
  { value: "SL", label: "SL - Sleeper" },
  { value: "2S", label: "2S - Second sitting" },
  { value: "CC", label: "CC - Chair car AC" },
  { value: "EC", label: "EC - Executive chair car AC" },
];
const flightClasses = [
  { value: "Economy", label: "Economy" },
  { value: "Business", label: "Business" },
  { value: "First", label: "First Class" },
];

/**
 * Returns consistent status object for a cancellation record
 */
const getCancellationStatus = (c) => {
  if (c.approvedBy === true && c.raisedBy === false) {
    return {
      status: "APPROVED",
      bg: "bg-green-50",
      border: "border-green-500",
      badge: "APPROVED",
      badgeBg: "bg-green-600 text-white",
    };
  }
  if (c.raisedBy === true && c.approvedBy === false) {
    return {
      status: "PENDING FOR APPROVAL",
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      badge: "PENDING",
      badgeBg: "bg-yellow-600 text-white",
    };
  }
  if (c.approvedBy === false && c.raisedBy === false) {
    return {
      status: "REJECTED",
      bg: "bg-red-50",
      border: "border-red-500",
      badge: "REJECTED",
      badgeBg: "bg-red-600 text-white",
    };
  }
  return {
    status: "UNKNOWN",
    bg: "bg-gray-50",
    border: "border-gray-500",
    badge: "UNKNOWN",
    badgeBg: "bg-gray-600 text-white",
  };
};

const CancellationControls = () => {
  const {
    viewBooking,
    singleBooking,
    calculateCancelBooking,
    fetchCancellationsByBooking,
  } = useContext(TourContext);

  // ────────────────────── STATE ──────────────────────
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [cancellationDate, setCancellationDate] = useState("");
  const [trainCancellations, setTrainCancellations] = useState({});
  const [flightCancellations, setFlightCancellations] = useState({});
  const [customAddons, setCustomAddons] = useState([
    { name: "", amount: "", remark: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const [cancellationHistory, setCancellationHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // ────────────────────── EFFECTS ──────────────────────
  useEffect(() => {
    if (singleBooking) {
      resetForm();
      fetchCancellationHistory(singleBooking._id);
    } else {
      setCancellationHistory([]);
      setHistoryError(null);
    }
  }, [singleBooking]);

  const resetForm = () => {
    setSelectedIndexes([]);
    setCancellationDate("");
    setTrainCancellations({});
    setFlightCancellations({});
    setCustomAddons([{ name: "", amount: "", remark: "" }]);
  };

  // ────────────────────── API CALLS ──────────────────────
  const handleFetch = async () => {
    if (!bookingId.trim()) return toast.error("Paste a Booking ID");
    setLoading(true);
    setError(null);
    const result = await viewBooking(bookingId.trim());
    setLoading(false);
    if (result.success) {
      toast.success("Booking loaded!");
    } else {
      setError(result.message);
    }
  };

  const fetchCancellationHistory = async (bookingId) => {
    if (!bookingId) return;
    setHistoryLoading(true);
    setHistoryError(null);
    const result = await fetchCancellationsByBooking(bookingId);
    setHistoryLoading(false);
    if (result.success) {
      const sorted = (result.results || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setCancellationHistory(sorted);
    } else {
      setHistoryError(result.message);
      setCancellationHistory([]);
    }
  };

  // ────────────────────── TRAVELLER SELECTION ──────────────────────
  const toggleTraveller = (idx) => {
    const t = singleBooking.travellers[idx];
    const cancelled = t.cancelled || {};

    const isApprovedAndAdminCancelled =
      cancellationHistory.some(
        (c) => c.travellerIds?.includes(t._id) && c.approvedBy === true
      ) && cancelled.byAdmin === true;

    if (isApprovedAndAdminCancelled) return; // blocked

    setSelectedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const setTrain = (key, value) =>
    setTrainCancellations((prev) => ({
      ...prev,
      [key]: value === "" ? 0 : Number(value),
    }));
  const setFlight = (key, value) =>
    setFlightCancellations((prev) => ({
      ...prev,
      [key]: value === "" ? 0 : Number(value),
    }));

  // ────────────────────── CUSTOM ADDONS ──────────────────────
  const handleAddAddon = () =>
    setCustomAddons([...customAddons, { name: "", amount: "", remark: "" }]);
  const handleRemoveAddon = (i) =>
    setCustomAddons(customAddons.filter((_, idx) => idx !== i));
  const handleAddonChange = (i, field, val) => {
    const upd = [...customAddons];
    upd[i][field] = val;
    setCustomAddons(upd);
  };

  // ────────────────────── BULK CANCEL ──────────────────────
  const handleBulkCancel = async () => {
    if (selectedIndexes.length === 0)
      return toast.error("Select at least one traveller");
    if (!cancellationDate) return toast.error("Pick a cancellation date");
    setSubmitting(true);

    const relevantTrain = Object.fromEntries(
      Object.entries(trainCancellations).filter(([k]) =>
        selectedIndexes.includes(Number(k.split("-")[1]))
      )
    );
    const relevantFlight = Object.fromEntries(
      Object.entries(flightCancellations).filter(([k]) =>
        selectedIndexes.includes(Number(k.split("-")[1]))
      )
    );

    const trainSum = Object.values(relevantTrain).reduce((s, v) => s + v, 0);
    const flightSum = Object.values(relevantFlight).reduce((s, v) => s + v, 0);
    const irctcCancellationAmount = trainSum + flightSum;
    const extraRemarkAmount = customAddons
      .filter((a) => a.amount)
      .reduce((s, a) => s + parseFloat(a.amount || 0), 0);
    const remark = customAddons
      .filter((a) => a.remark)
      .map((a) => `${a.name}: ${a.remark}`)
      .join("; ");

    const payload = {
      bookingId: singleBooking._id,
      cancellationDate,
      cancelledTravellerIndexes: selectedIndexes,
      extraRemarkAmount,
      remark: remark || undefined,
      irctcCancellationAmount,
      trainCancellations: relevantTrain,
      flightCancellations: relevantFlight,
    };

    const result = await calculateCancelBooking(payload);
    setSubmitting(false);
    if (result.success) {
      toast.success(`${selectedIndexes.length} traveller(s) cancelled`);
      await viewBooking(singleBooking._id); // refresh
      fetchCancellationHistory(singleBooking._id); // refresh history
    } else {
      toast.error(result.message || "Cancellation failed");
    }
  };

  // ────────────────────── HELPERS ──────────────────────
  const firstTraveller = singleBooking?.travellers?.[0];
  const tourFull = singleBooking?.tourFull;
  const payment = singleBooking?.payment || {
    advance: { amount: 0, paid: false },
    balance: { amount: 0, paid: false },
  };

  const getSharingText = (t) => {
    const age = parseInt(t.age);
    if (age <= 12) {
      return t.sharingType === "withBerth"
        ? "Child w/ Berth"
        : "Child w/o Berth";
    }
    return t.sharingType === "triple" ? "Triple Sharing" : "Double Sharing";
  };

  const getBalance = (traveller) => {
    const isVariant =
      traveller?.packageType === "variant" &&
      traveller?.variantPackageIndex != null;
    const variant = isVariant
      ? tourFull?.variantPackage?.[traveller.variantPackageIndex]
      : null;
    if (isVariant && variant) {
      return {
        double: variant.balanceDouble || 0,
        triple: variant.balanceTriple || 0,
        childWithBerth: variant.balanceChildWithBerth || 0,
        childWithoutBerth: variant.balanceChildWithoutBerth || 0,
      };
    }
    return {
      double: tourFull?.balanceDouble || 0,
      triple: tourFull?.balanceTriple || 0,
      childWithBerth: tourFull?.balanceChildWithBerth || 0,
      childWithoutBerth: tourFull?.balanceChildWithoutBerth || 0,
    };
  };

  const calculateTourCost = () => {
    if (!singleBooking?.travellers) return 0;
    let total = 0;
    singleBooking.travellers.forEach((t) => {
      const balance = getBalance(t);
      const age = parseInt(t.age);
      const isChild = age <= 12;
      total += isChild
        ? t.sharingType === "withBerth"
          ? balance.childWithBerth
          : balance.childWithoutBerth
        : t.sharingType === "triple"
        ? balance.triple
        : balance.double;
    });
    return total;
  };

  const openingBalance = calculateTourCost();
  const advancePaid = payment?.advance?.paid ? payment.advance.amount : 0;
  const balancePaid = payment?.balance?.paid ? payment.balance.amount : 0;
  const negativeAdminNet = (singleBooking?.adminRemarks || [])
    .filter((r) => r.amount < 0)
    .reduce((s, r) => s + r.amount, 0);
  const negativeRemarkSum = Math.abs(negativeAdminNet);
  const totalPaidSoFar = advancePaid + negativeRemarkSum + balancePaid;

  const getPaymentStatus = (type) => {
    const p = type === "advance" ? payment.advance : payment.balance;
    if (!p.paid) return { text: "Not Paid", color: "text-red-700 bg-red-50" };
    if (!p.paymentVerified)
      return {
        text: "Paid (Not Verified)",
        color: "text-yellow-700 bg-yellow-50",
      };
    return { text: "Paid & Verified", color: "text-green-700 bg-green-50" };
  };
  const advanceStatus = getPaymentStatus("advance");
  const balanceStatus = getPaymentStatus("balance");

  const isBookingRejected = singleBooking?.cancelled?.byAdmin === true;

  // ────────────────────── RENDER ──────────────────────
  if (!singleBooking && !loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 text-center">
              Cancellation Controller
            </h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Paste Booking ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              />
              <button
                onClick={handleFetch}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Loading…" : "Get Details"}
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto text-center text-gray-500 mt-20">
          <p className="text-lg">Paste a Booking ID and click "Get Details"</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="mt-3 text-gray-600">Fetching booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 text-center">
              Cancellation Controller
            </h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Paste Booking ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              />
              <button
                onClick={handleFetch}
                className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                Get Details
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Cancellation Controller
            </h1>
            {isBookingRejected && (
              <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                OFF - Booking Rejected
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Paste Booking ID"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              disabled={isBookingRejected}
            />
            <button
              onClick={handleFetch}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
              disabled={isBookingRejected}
            >
              Get Details
            </button>
          </div>
        </div>
      </div>

      {/* BOOKING SUMMARY */}
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4">
            Booking ID #{singleBooking._id}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Lead Traveller:</strong> {firstTraveller?.title}{" "}
              {firstTraveller?.firstName} {firstTraveller?.lastName}
            </div>
            <div>
              <strong>Mobile:</strong> {singleBooking.contact.mobile}
            </div>
            <div>
              <strong>Tour:</strong> {tourFull?.title} ({tourFull?.batch})
            </div>
            <div>
              <strong>Date:</strong>{" "}
              {new Date(singleBooking.bookingDate).toLocaleString()}
            </div>
            <div className="sm:col-span-2">
              <strong>Booking Type:</strong>{" "}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  singleBooking.bookingType === "online"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {singleBooking.bookingType.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium">
            <div className={`p-3 rounded-lg border ${advanceStatus.color}`}>
              <p className="font-semibold">Advance</p>
              <p className="text-xl font-bold">₹{payment.advance.amount}</p>
              <p className="text-xs mt-1">{advanceStatus.text}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">Opening Balance (Tour Cost)</p>
              <p className="text-xl font-bold text-yellow-700">
                ₹{openingBalance.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg border ${balanceStatus.color}`}>
              <p className="font-semibold">Balance</p>
              <p className="text-xl font-bold">₹{payment.balance.amount}</p>
              <p className="text-xs mt-1">{balanceStatus.text}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <label className="block text-sm font-medium text-indigo-800 mb-1">
              Total Amount Paid So Far
            </label>
            <input
              type="text"
              value={`₹${totalPaidSoFar.toLocaleString()}`}
              readOnly
              className="w-full px-3 py-2 bg-indigo-100 border border-indigo-300 rounded-md text-sm font-semibold text-indigo-900"
            />
            <p className="text-xs text-indigo-600 mt-1">
              Advance (Paid) + Negative Admin Remarks + Balance (Paid)
            </p>
          </div>
        </div>

        {/* ADMIN REMARKS */}
        {singleBooking.adminRemarks?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Admin Actions History
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border-l-4 bg-indigo-50 border-indigo-500 text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">Tour Cost (Opening Balance)</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-indigo-700">
                      ₹{openingBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {(singleBooking.adminRemarks || []).map((r, i) => {
                let runningBalance = openingBalance;
                for (let j = 0; j <= i; j++) {
                  runningBalance += singleBooking.adminRemarks[j]?.amount || 0;
                }
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-l-4 text-sm ${
                      r.amount > 0
                        ? "bg-green-50 border-green-500"
                        : r.amount < 0
                        ? "bg-red-50 border-red-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">Remark: {r.remark}</p>
                        {r.amount !== 0 && (
                          <p className="mt-1">
                            Amount:{" "}
                            <span
                              className={
                                r.amount > 0 ? "text-green-700" : "text-red-700"
                              }
                            >
                              {r.amount > 0 ? "+" : "-"}₹
                              {Math.abs(r.amount).toLocaleString()}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Date: {new Date(r.addedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-600">Closing Balance</p>
                        <p className="font-bold text-indigo-700">
                          ₹{runningBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CANCELLATION HISTORY */}
        {/* CANCELLATION HISTORY */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              Cancellation History
            </h3>
            <div>
              {historyLoading ? (
                <span className="text-xs text-gray-500">Loading...</span>
              ) : historyError ? (
                <span className="text-xs text-red-600">Error</span>
              ) : (
                <span className="text-xs text-gray-500">
                  {cancellationHistory.length} record(s)
                </span>
              )}
            </div>
          </div>

          {historyLoading && (
            <div className="text-xs text-gray-500">Loading history...</div>
          )}
          {historyError && (
            <div className="text-xs text-red-600">{historyError}</div>
          )}
          {!historyLoading && cancellationHistory.length === 0 && (
            <div className="text-xs text-gray-500">No cancellations yet.</div>
          )}

          <div className="space-y-3">
            {cancellationHistory.map((c, i) => {
              const status = getCancellationStatus(c);

              // Resolve traveller names using travellerIds
              const cancelledTravellers = c.travellerIds
                ? c.travellerIds
                    .map((id) => {
                      const t = singleBooking?.travellers?.find(
                        (trav) => trav._id.toString() === id.toString()
                      );
                      return t
                        ? `${t.title} ${t.firstName} ${t.lastName}`
                        : null;
                    })
                    .filter(Boolean)
                : [];

              const travellerNames =
                cancelledTravellers.length > 0
                  ? cancelledTravellers.join(", ")
                  : c.travellerIndexes
                  ? c.travellerIndexes
                      .map((idx) => {
                        const t = singleBooking?.travellers?.[idx];
                        return t
                          ? `${t.title} ${t.firstName} ${t.lastName}`
                          : null;
                      })
                      .filter(Boolean)
                      .join(", ")
                  : "—";

              return (
                <div
                  key={i}
                  className={`border rounded-lg p-3 ${status.bg} ${status.border} border-l-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Cancellation #{cancellationHistory.length - i}
                        <span
                          className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${status.badgeBg}`}
                        >
                          {status.badge}
                        </span>
                      </p>

                      {/* NEW: Traveller Names & Cancellation Date */}
                      {travellerNames !== "—" && (
                        <p className="text-xs text-gray-700 mt-1 font-medium">
                          Cancelled:{" "}
                          <span className="text-indigo-700">
                            {travellerNames}
                          </span>
                        </p>
                      )}
                      {c.cancellationDate && (
                        <p className="text-xs text-gray-600">
                          Date of Cancellation:{" "}
                          <span className="font-medium text-rose-700">
                            {new Date(c.cancellationDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </p>
                      )}

                      <p className="text-xs text-gray-600">
                        Requested on:{" "}
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-800">
                        Refund: ₹{(c.refundAmount ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <strong>GV Cancellation:</strong> ₹
                      {(c.gvCancellationAmount ?? 0).toLocaleString()}
                    </div>
                    <div>
                      <strong>IRCTC Cancellation:</strong> ₹
                      {(c.irctcCancellationAmount ?? 0).toLocaleString()}
                    </div>
                    <div>
                      <strong>Remarks Amount:</strong> ₹
                      {(c.remarksAmount ?? 0).toLocaleString()}
                    </div>
                    <div>
                      <strong>Total Cancelled:</strong> ₹
                      {(c.totalCancellationAmount ?? 0).toLocaleString()}
                    </div>
                    <div>
                      <strong>Updated Balance:</strong> ₹
                      {(c.updatedBalance ?? 0).toLocaleString()}
                    </div>
                    <div>
                      <strong>Days Before:</strong> {c.noOfDays ?? 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRAVELLERS */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              Travellers ({singleBooking?.travellers?.length ?? 0})
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="w-full sm:w-48">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Cancellation Date
                </label>
                <input
                  type="date"
                  value={cancellationDate}
                  onChange={(e) => setCancellationDate(e.target.value)}
                  className="w-full px-2 py-1 sm:px-3 sm:py-2 border rounded text-xs sm:text-sm"
                  disabled={isBookingRejected}
                />
              </div>
              <button
                onClick={handleBulkCancel}
                disabled={
                  submitting ||
                  selectedIndexes.length === 0 ||
                  isBookingRejected
                }
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded font-semibold text-white text-xs sm:text-sm ${
                  submitting ||
                  selectedIndexes.length === 0 ||
                  isBookingRejected
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting
                  ? "Processing…"
                  : `Cancel ${selectedIndexes.length} Selected`}
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {(singleBooking?.travellers || []).map((t, idx) => {
              const cancelled = t.cancelled || {};
              const isApprovedAndAdminCancelled =
                cancellationHistory.some(
                  (c) =>
                    c.travellerIds?.includes(t._id) && c.approvedBy === true
                ) && cancelled.byAdmin === true;

              const isSelectable = !isApprovedAndAdminCancelled;
              const isVariant =
                t.packageType === "variant" && t.variantPackageIndex != null;
              const variant = isVariant
                ? tourFull?.variantPackage?.[t.variantPackageIndex]
                : null;
              const getPkg = (field) =>
                (isVariant && variant?.[field]) || tourFull?.[field] || [];
              const trainDetails = getPkg("trainDetails");
              const flightDetails = getPkg("flightDetails");

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-3 sm:p-4 ${
                    isApprovedAndAdminCancelled
                      ? "bg-gray-100 opacity-60"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <label
                      className={`flex items-center gap-2 sm:gap-3 flex-1 ${
                        !isSelectable ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIndexes.includes(idx)}
                        onChange={() => toggleTraveller(idx)}
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        disabled={!isSelectable}
                      />
                      <div>
                        <div className="text-sm sm:text-base font-medium">
                          {t.title} {t.firstName} {t.lastName}
                          <span className="text-xs sm:text-sm text-gray-500 ml-1">
                            ({t.age}, {t.gender})
                          </span>
                          {isApprovedAndAdminCancelled && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                              OFF - Cancellation Approved
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Package:{" "}
                          <span className="font-semibold">
                            {isVariant ? "Variant" : "Main"}
                          </span>{" "}
                          • Sharing:{" "}
                          <span className="font-semibold">
                            {getSharingText(t)}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {selectedIndexes.includes(idx) && isSelectable && (
                    <div className="mt-3 space-y-3 border-t pt-3">
                      {trainDetails.length > 0 && (
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Train Cancellation
                          </div>
                          {trainDetails.map((tr, i) => {
                            const key = `train-${idx}-${i}`;
                            const amt = trainCancellations[key] || 0;
                            return (
                              <div
                                key={i}
                                className="p-2 sm:p-3 bg-white rounded border mb-2"
                              >
                                <p className="font-medium text-indigo-700 text-xs sm:text-sm">
                                  {tr.trainName} ({tr.trainNo})
                                </p>
                                <p className="text-xs text-gray-600">
                                  {tr.fromStation} to {tr.toStation}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 sm:mt-2">
                                  <select className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm">
                                    <option>Select Class</option>
                                    {trainClasses.map((c) => (
                                      <option key={c.value} value={c.value}>
                                        {c.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={amt > 0 ? amt : ""}
                                    onChange={(e) =>
                                      setTrain(key, e.target.value)
                                    }
                                    className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {flightDetails.length > 0 && (
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Flight Cancellation
                          </div>
                          {flightDetails.map((fl, i) => {
                            const key = `flight-${idx}-${i}`;
                            const amt = flightCancellations[key] || 0;
                            return (
                              <div
                                key={i}
                                className="p-2 sm:p-3 bg-white rounded border mb-2"
                              >
                                <p className="font-medium text-indigo-700 text-xs sm:text-sm">
                                  {fl.airline} {fl.flightNo}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {fl.fromAirport} to {fl.toAirport}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 sm:mt-2">
                                  <select className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm">
                                    <option>Select Class</option>
                                    {flightClasses.map((c) => (
                                      <option key={c.value} value={c.value}>
                                        {c.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={amt > 0 ? amt : ""}
                                    onChange={(e) =>
                                      setFlight(key, e.target.value)
                                    }
                                    className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-xs sm:text-sm font-medium text-orange-800">
                          IRCTC for this traveller: ₹
                          {(
                            Object.entries(trainCancellations)
                              .filter(([k]) => k.startsWith(`train-${idx}-`))
                              .reduce((s, [, v]) => s + v, 0) +
                            Object.entries(flightCancellations)
                              .filter(([k]) => k.startsWith(`flight-${idx}-`))
                              .reduce((s, [, v]) => s + v, 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CUSTOM ADDONS */}
          {!isBookingRejected && (
            <div className="mt-4 sm:mt-6 md:mt-8">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Custom Addons (apply to whole cancellation)
                </label>
                <button
                  onClick={handleAddAddon}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                  disabled={isBookingRejected}
                >
                  + Add New
                </button>
              </div>

              {customAddons.map((a, i) => (
                <div
                  key={i}
                  className="mb-2 p-2 sm:p-3 bg-yellow-50 rounded border border-yellow-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) =>
                        handleAddonChange(i, "name", e.target.value)
                      }
                      className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
                      disabled={isBookingRejected}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={a.amount}
                      onChange={(e) =>
                        handleAddonChange(i, "amount", e.target.value)
                      }
                      className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
                      disabled={isBookingRejected}
                    />
                    <input
                      type="text"
                      placeholder="Remark"
                      value={a.remark}
                      onChange={(e) =>
                        handleAddonChange(i, "remark", e.target.value)
                      }
                      className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
                      disabled={isBookingRejected}
                    />
                  </div>
                  {customAddons.length > 1 && (
                    <button
                      onClick={() => handleRemoveAddon(i)}
                      className="mt-1 sm:mt-2 text-xs text-red-600 hover:text-red-800"
                      disabled={isBookingRejected}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancellationControls;
