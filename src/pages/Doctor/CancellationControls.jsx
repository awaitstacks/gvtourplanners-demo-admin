// import React, { useContext, useEffect, useState } from "react";
// import { TourContext } from "../../context/TourContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

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
//       setSelectedIndexes([]);
//       setCancellationDate("");
//       setTrainCancellations({});
//       setFlightCancellations({});
//       setCustomAddons([{ name: "", amount: "", remark: "" }]);
//       fetchCancellationHistory(singleBooking._id);
//     } else {
//       setCancellationHistory([]);
//       setHistoryError(null);
//     }
//   }, [singleBooking]);

//   // ────────────────────── API CALLS ──────────────────────
//   const handleFetch = async () => {
//     if (!bookingId.trim()) return toast.error("Paste a Booking ID");
//     setLoading(true);
//     setError(null);
//     const result = await viewBooking(bookingId.trim());
//     setLoading(false);
//     result.success
//       ? toast.success("Booking loaded!")
//       : setError(result.message);
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
//       Object.entries(trainCancellations).filter(([k]) => {
//         const idx = Number(k.split("-")[1]);
//         return selectedIndexes.includes(idx);
//       })
//     );
//     const relevantFlight = Object.fromEntries(
//       Object.entries(flightCancellations).filter(([k]) => {
//         const idx = Number(k.split("-")[1]);
//         return selectedIndexes.includes(idx);
//       })
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
//       await viewBooking(singleBooking._id);
//       fetchCancellationHistory(singleBooking._id);
//     } else {
//       toast.error(result.message || "Cancellation failed");
//     }
//   };

//   // ────────────────────── PDF EXPORT – CLEAN, MONOSPACE FONT, PERFECT ALIGNMENT ──────────────────────
//   const handleExportCancelledPDF = () => {
//     if (selectedIndexes.length === 0) {
//       toast.error("Select at least one traveller to export");
//       return;
//     }

//     // A4 landscape
//     const doc = new jsPDF({
//       orientation: "landscape",
//       unit: "mm",
//       format: "a4",
//     });
//     const pageWidth = doc.internal.pageSize.getWidth(); // 297
//     const pageHeight = doc.internal.pageSize.getHeight(); // 210
//     const margin = 15;
//     let y = 20;

//     /**
//      * checkPage(neededHeight)
//      * Adds a new page if the remaining vertical space is less than neededHeight.
//      */
//     const checkPage = (neededHeight = 12) => {
//       if (y + neededHeight > pageHeight - 20) {
//         doc.addPage();
//         y = 20;
//       }
//     };

//     // ── Use Courier (monospaced) – every character takes same width → perfect alignment ──
//     doc.setFont("courier", "normal");
//     doc.setFontSize(10);

//     // ── Helper: clean amount (replace NBSP/narrow NBSP inserted by toLocaleString)
//     const rawFmtNumber = (n) => {
//       if (n == null || isNaN(Number(n))) return "0";
//       // produce en-IN style with grouping, then replace NBSP/narrow NBSP with comma
//       return new Intl.NumberFormat("en-IN")
//         .format(Number(n))
//         .replace(/\u00A0|\u202F/g, ",");
//     };
//     const fmt = (n) => `₹${rawFmtNumber(n)}`;

//     // ── Header ──
//     doc.setFont("courier", "bold");
//     doc.setFontSize(14);
//     doc.setTextColor(63, 81, 181);
//     doc.text("GV - Tour Planners LLP", pageWidth / 2, y, { align: "center" });
//     y += 6;
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.setFont("courier", "normal");
//     doc.text(
//       "Old 15/4, New 23, Nehru Street, Jaihindpuram, Madurai - 625011",
//       pageWidth / 2,
//       y,
//       { align: "center" }
//     );
//     y += 12;

//     // ── Title ──
//     doc.setFontSize(20);
//     doc.setFont("courier", "bold");
//     doc.setTextColor(0, 230, 118);
//     doc.text("TRAVELLER CANCELLATION CHART", pageWidth / 2, y, {
//       align: "center",
//     });
//     y += 15;

//     // ── Booking Info ──
//     doc.setFontSize(11);
//     doc.setFont("courier", "bold");
//     doc.setTextColor(63, 81, 181);
//     doc.text("Booking Information", margin, y);
//     y += 8;
//     doc.setFont("courier", "normal");
//     doc.setFontSize(10);
//     doc.setTextColor(0);

//     checkPage(30);
//     doc.text(`Booking ID: ${singleBooking._id || "—"}`, margin, y);
//     y += 5;
//     doc.text(
//       `Tour: ${tourFull?.title ?? "—"} (${tourFull?.batch ?? "—"})`,
//       margin,
//       y
//     );
//     y += 5;
//     doc.text(`Cancellation Date: ${cancellationDate || "—"}`, margin, y);
//     y += 12;

//     // ── Lead Traveller ──
//     doc.setFontSize(12);
//     doc.setFont("courier", "bold");
//     doc.setTextColor(63, 81, 181);
//     doc.text("Lead Traveller Details", margin, y);
//     y += 8;
//     doc.setFont("courier", "normal");
//     doc.setFontSize(10);
//     doc.setTextColor(0);

//     const lead = firstTraveller
//       ? `${firstTraveller.title ?? ""} ${firstTraveller.firstName ?? ""} ${
//           firstTraveller.lastName ?? ""
//         }`.trim()
//       : "—";
//     const leadAge = firstTraveller ? String(firstTraveller.age ?? "—") : "—";
//     const leadGender = firstTraveller
//       ? String(firstTraveller.gender ?? "—")
//       : "—";
//     const leadPkg =
//       firstTraveller?.packageType === "variant" ? "Variant" : "Main";
//     const leadSharing =
//       firstTraveller && parseInt(firstTraveller.age) <= 12
//         ? firstTraveller.sharingType === "withBerth"
//           ? "Child (with berth)"
//           : "Child (without berth)"
//         : firstTraveller?.sharingType === "triple"
//         ? "Triple"
//         : "Double";

//     doc.text(`Name: ${lead}`, margin, y);
//     y += 5;
//     doc.text(`Age: ${leadAge}`, margin, y);
//     y += 5;
//     doc.text(`Gender: ${leadGender}`, margin, y);
//     y += 5;
//     doc.text(`Package: ${leadPkg}`, margin, y);
//     y += 5;
//     doc.text(`Sharing: ${leadSharing}`, margin, y);
//     y += 12;

//     // ── Package Details ──
//     doc.setFontSize(12);
//     doc.setFont("courier", "bold");
//     doc.setTextColor(63, 81, 181);
//     doc.text("Package Details", margin, y);
//     y += 8;
//     doc.setFont("courier", "normal");
//     doc.setFontSize(10);
//     doc.setTextColor(0);
//     const totalCost =
//       typeof calculateTourCost === "function" ? calculateTourCost() : 0;
//     const advanceAmt = payment?.advance?.paid ? payment.advance.amount : 0;
//     doc.text(`Total Package Cost (w/o addons): ${fmt(totalCost)}`, margin, y);
//     y += 5;
//     doc.text(`Advance Paid: ${fmt(advanceAmt)}`, margin, y);
//     y += 12;

//     // ── CANCELLATION HISTORY (Monospaced Alignment) ──
//     if (Array.isArray(cancellationHistory) && cancellationHistory.length > 0) {
//       doc.setFontSize(12);
//       doc.setFont("courier", "bold");
//       doc.setTextColor(63, 81, 181);
//       doc.text("Cancellation History", margin, y);
//       y += 8;

//       doc.setFont("courier", "normal");
//       doc.setFontSize(10);
//       doc.setTextColor(0);

//       // Determine max width for padding (safe values)
//       const labelPad = 18;
//       const longPad = 45;

//       cancellationHistory.forEach((c, i) => {
//         // anticipate height for 9 short lines
//         checkPage(9 * 5 + 6);

//         const idx = cancellationHistory.length - i;
//         const date = c.createdAt
//           ? new Date(c.createdAt).toLocaleDateString("en-GB")
//           : "—";

//         // Build padded lines using padEnd (monospace keeps alignment)
//         const line1 = `Cancellation #${idx}`.padEnd(labelPad);
//         const line2 = `Date: ${date}`.padEnd(longPad);
//         const line3 = `GV Cancellation: ${fmt(c.gvCancellationAmount)}`.padEnd(
//           longPad
//         );
//         const line4 = `IRCTC Cancellation: ${fmt(
//           c.irctcCancellationAmount
//         )}`.padEnd(longPad);
//         const line5 = `Remarks Amount: ${fmt(c.remarksAmount)}`.padEnd(longPad);
//         const line6 = `Total Cancellation: ${fmt(
//           c.totalCancellationAmount
//         )}`.padEnd(longPad);
//         const line7 = `Refund Amount: ${fmt(c.refundAmount)}`.padEnd(longPad);
//         const line8 = `Updated Balance: ${fmt(c.updatedBalance)}`.padEnd(
//           longPad
//         );
//         const line9 = `Days: ${c.noOfDays ?? 0}`.padEnd(labelPad);

//         doc.setFont("courier", "bold");
//         doc.text(line1, margin, y);
//         y += 6;
//         doc.setFont("courier", "normal");

//         doc.text(line2, margin, y);
//         y += 5;
//         doc.text(line3, margin, y);
//         y += 5;
//         doc.text(line4, margin, y);
//         y += 5;
//         doc.text(line5, margin, y);
//         y += 5;
//         doc.text(line6, margin, y);
//         y += 5;
//         doc.text(line7, margin, y);
//         y += 5;
//         doc.text(line8, margin, y);
//         y += 5;
//         doc.text(line9, margin, y);
//         y += 8;
//       });
//     }

//     // ── CANCELLED TRAVELLERS (Monospaced) ──
//     if (selectedIndexes.length > 0) {
//       doc.setFontSize(12);
//       doc.setFont("courier", "bold");
//       doc.setTextColor(63, 81, 181);
//       doc.text("Cancelled Travellers", margin, y);
//       y += 8;

//       doc.setFont("courier", "normal");
//       doc.setFontSize(10);
//       doc.setTextColor(0);

//       const travellersToExport = Array.isArray(singleBooking?.travellers)
//         ? singleBooking.travellers.filter((_, i) => selectedIndexes.includes(i))
//         : [];

//       travellersToExport.forEach((t, idx) => {
//         // anticipate space needed (name may wrap)
//         checkPage(40);

//         const name =
//           `${t.title ?? ""} ${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() ||
//           "—";
//         const age = String(t.age ?? "—");
//         const gender = String(t.gender ?? "—");
//         const pkg = t.packageType === "variant" ? "Variant" : "Main";
//         const sharing =
//           parseInt(t.age) <= 12
//             ? t.sharingType === "withBerth"
//               ? "Child (with berth)"
//               : "Child (without berth)"
//             : t.sharingType === "triple"
//             ? "Triple"
//             : "Double";

//         doc.setFont("courier", "bold");
//         doc.text(`Traveller ${idx + 1}`, margin, y);
//         y += 6;
//         doc.setFont("courier", "normal");

//         // Wrap long name: allow width up to pageWidth - margins - 40
//         const nameMaxW = pageWidth - 2 * margin - 40;
//         const nameLines = doc.splitTextToSize(name, nameMaxW);
//         doc.text(`Name: `, margin, y);
//         doc.text(nameLines, margin + 15, y);
//         y += nameLines.length * 5 + 2;

//         // Age/Gender/Package/Sharing on separate lines so monospace pad works
//         doc.text(`Age: ${age}`.padEnd(20), margin, y);
//         y += 5;
//         doc.text(`Gender: ${gender}`.padEnd(20), margin, y);
//         y += 5;
//         doc.text(`Package: ${pkg}`.padEnd(25), margin, y);
//         y += 5;
//         doc.text(`Sharing: ${sharing}`.padEnd(30), margin, y);
//         y += 8;
//       });
//     }

//     // ── Footer ──
//     checkPage(12);
//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(
//       `Generated on: ${new Date().toLocaleString()}`,
//       margin,
//       pageHeight - 12
//     );

//     doc.save(`cancellation_${singleBooking?._id ?? "export"}.pdf`);
//   };

//   // ────────────────────── HELPERS ──────────────────────
//   const firstTraveller = singleBooking?.travellers?.[0];
//   const tourFull = singleBooking?.tourFull;
//   const payment = singleBooking?.payment || {
//     advance: { amount: 0, paid: false },
//     balance: { amount: 0, paid: false },
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
//   const negativeAdminNet = (singleBooking?.adminRemarks || [])
//     .filter((r) => r.amount < 0)
//     .reduce((s, r) => s + r.amount, 0);
//   const negativeRemarkSum = Math.abs(negativeAdminNet);
//   const totalPaidSoFar = advancePaid + negativeRemarkSum;

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

//   // ────────────────────── UI (UNCHANGED) ──────────────────────
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
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 text-center">
//             Cancellation Controller
//           </h1>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <input
//               type="text"
//               value={bookingId}
//               onChange={(e) => setBookingId(e.target.value)}
//               placeholder="Paste Booking ID"
//               className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={handleFetch}
//                 className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
//               >
//                 Get Details
//               </button>
//               <button
//                 onClick={handleExportCancelledPDF}
//                 disabled={selectedIndexes.length === 0}
//                 className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
//                   selectedIndexes.length === 0
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-green-600 hover:bg-green-700"
//                 }`}
//               >
//                 Export PDF
//               </button>
//             </div>
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
//               Advance + Negative Admin Remarks
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
//               const date = c.createdAt
//                 ? new Date(c.createdAt).toLocaleString()
//                 : "—";
//               return (
//                 <div
//                   key={i}
//                   className="border rounded-lg p-3 bg-rose-50 border-rose-200"
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <p className="font-medium text-rose-800">
//                         Cancellation #{cancellationHistory.length - i}
//                       </p>
//                       <p className="text-xs text-rose-600">Date: {date}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-bold text-rose-800">
//                         Refund amount: ₹{(c.refundAmount ?? 0).toLocaleString()}
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
//                       <strong>Total cancellation Amount:</strong> ₹
//                       {(c.totalCancellationAmount ?? 0).toLocaleString()}
//                     </div>
//                     <div>
//                       <strong>Updated balance:</strong> ₹
//                       {(c.updatedBalance ?? 0).toLocaleString()}
//                     </div>
//                     <div>
//                       <strong>Days falling for cancellation : </strong>
//                       {(c.noOfDays ?? 0).toLocaleString()}
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
//                 />
//               </div>
//               <button
//                 onClick={handleBulkCancel}
//                 disabled={submitting || selectedIndexes.length === 0}
//                 className={`px-3 py-1 sm:px-4 sm:py-2 rounded font-semibold text-white text-xs sm:text-sm ${
//                   submitting || selectedIndexes.length === 0
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
//               const isChecked = selectedIndexes.includes(idx);
//               const isVariant =
//                 t.packageType === "variant" && t.variantPackageIndex != null;
//               const variant = isVariant
//                 ? tourFull?.variantPackage?.[t.variantPackageIndex]
//                 : null;
//               const getPkg = (field) =>
//                 (isVariant && variant?.[field]) || tourFull?.[field] || [];
//               const trainDetails = getPkg("trainDetails");
//               const flightDetails = getPkg("flightDetails");
//               const age = parseInt(t.age);
//               const sharingText =
//                 age <= 12
//                   ? t.sharingType === "withBerth"
//                     ? "Child (with berth)"
//                     : "Child (without berth)"
//                   : t.sharingType === "triple"
//                   ? "Triple"
//                   : "Double";

//               return (
//                 <div
//                   key={idx}
//                   className="border rounded-lg p-3 sm:p-4 bg-gray-50"
//                 >
//                   <div className="flex items-start justify-between gap-2">
//                     <label className="flex items-center gap-2 sm:gap-3 flex-1">
//                       <input
//                         type="checkbox"
//                         checked={isChecked}
//                         onChange={() => toggleTraveller(idx)}
//                         className="h-4 w-4 sm:h-5 sm:w-5"
//                       />
//                       <div>
//                         <div className="text-sm sm:text-base font-medium">
//                           {t.title} {t.firstName} {t.lastName}
//                           <span className="text-xs sm:text-sm text-gray-500 ml-1">
//                             ({t.age}, {t.gender})
//                           </span>
//                         </div>
//                         <div className="text-xs text-gray-600 mt-1">
//                           Package:{" "}
//                           <span className="font-semibold">
//                             {isVariant ? "Variant" : "Main"}
//                           </span>{" "}
//                           • Sharing:{" "}
//                           <span className="font-semibold">{sharingText}</span>
//                         </div>
//                       </div>
//                     </label>
//                   </div>

//                   {isChecked && (
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

//           {/* GLOBAL CUSTOM ADDONS */}
//           <div className="mt-4 sm:mt-6 md:mt-8">
//             <div className="flex justify-between items-center mb-2">
//               <label className="block text-xs sm:text-sm font-medium text-gray-700">
//                 Custom Addons (apply to whole cancellation)
//               </label>
//               <button
//                 onClick={handleAddAddon}
//                 className="text-xs text-indigo-600 hover:text-indigo-800"
//               >
//                 + Add New
//               </button>
//             </div>

//             {customAddons.map((a, i) => (
//               <div
//                 key={i}
//                 className="mb-2 p-2 sm:p-3 bg-yellow-50 rounded border border-yellow-200"
//               >
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                   <input
//                     type="text"
//                     placeholder="Name"
//                     value={a.name}
//                     onChange={(e) =>
//                       handleAddonChange(i, "name", e.target.value)
//                     }
//                     className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                   />
//                   <input
//                     type="number"
//                     placeholder="Amount (Amount)"
//                     value={a.amount}
//                     onChange={(e) =>
//                       handleAddonChange(i, "amount", e.target.value)
//                     }
//                     className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Remark"
//                     value={a.remark}
//                     onChange={(e) =>
//                       handleAddonChange(i, "remark", e.target.value)
//                     }
//                     className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
//                   />
//                 </div>
//                 {customAddons.length > 1 && (
//                   <button
//                     onClick={() => handleRemoveAddon(i)}
//                     className="mt-1 sm:mt-2 text-xs text-red-600 hover:text-red-800"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CancellationControls;

// import React, { useContext, useEffect, useState } from "react";
// import { TourContext } from "../../context/TourContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

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
//       setSelectedIndexes([]);
//       setCancellationDate("");
//       setTrainCancellations({});
//       setFlightCancellations({});
//       setCustomAddons([{ name: "", amount: "", remark: "" }]);
//       fetchCancellationHistory(singleBooking._id);
//     } else {
//       setCancellationHistory([]);
//       setHistoryError(null);
//     }
//   }, [singleBooking]);

//   // ────────────────────── API CALLS ──────────────────────
//   const handleFetch = async () => {
//     if (!bookingId.trim()) return toast.error("Paste a Booking ID");
//     setLoading(true);
//     setError(null);
//     const result = await viewBooking(bookingId.trim());
//     setLoading(false);
//     result.success
//       ? toast.success("Booking loaded!")
//       : setError(result.message);
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

//     // BLOCK SELECTION IF ALREADY CANCELLED BY ADMIN OR BOTH
//     if (cancelled.byAdmin || (cancelled.byTraveller && cancelled.byAdmin)) {
//       return;
//     }

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
//       Object.entries(trainCancellations).filter(([k]) => {
//         const idx = Number(k.split("-")[1]);
//         return selectedIndexes.includes(idx);
//       })
//     );
//     const relevantFlight = Object.fromEntries(
//       Object.entries(flightCancellations).filter(([k]) => {
//         const idx = Number(k.split("-")[1]);
//         return selectedIndexes.includes(idx);
//       })
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
//       await viewBooking(singleBooking._id);
//       fetchCancellationHistory(singleBooking._id);
//     } else {
//       toast.error(result.message || "Cancellation failed");
//     }
//   };

//   // ────────────────────── PDF EXPORT ──────────────────────
//   const handleExportCancelledPDF = () => {
//     if (selectedIndexes.length === 0) {
//       toast.error("Select at least one traveller");
//       return;
//     }
//     if (!cancellationDate) {
//       toast.error("Pick a cancellation date");
//       return;
//     }

//     const doc = new jsPDF({ unit: "mm", format: "a4" });
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(10);
//     doc.setLineHeightFactor(1.2);

//     let y = 12;
//     const line = 4;
//     const left = 15;
//     const indent = left + 5;

//     const setBold = () => doc.setFont("helvetica", "bold");
//     const setNormal = () => doc.setFont("helvetica", "normal");
//     const space = (count = 1) => {
//       y += line * count;
//     };
//     const writeAt = (txt = "", x = left) => {
//       doc.text(String(txt), x, y);
//       y += line;
//     };
//     const writePair = (label, value) => {
//       setBold();
//       doc.text(label + ":", left, y);
//       setNormal();
//       doc.text(String(value), left + 45, y);
//       y += line;
//     };
//     const writeSectionTitle = (title, x = left) => {
//       space(0.75);
//       doc.setFontSize(11);
//       setBold();
//       writeAt(title, x);
//       setNormal();
//       doc.setFontSize(10);
//       space(0.25);
//     };

//     // Header
//     doc.setFontSize(16);
//     setBold();
//     doc.text(`CANCELLATION REPORT`, left, y);
//     setNormal();
//     y += line * 1.0;

//     doc.setFontSize(12);
//     setBold();
//     doc.text(`Booking ID: ${singleBooking._id}`, left, y);
//     setNormal();
//     doc.setFontSize(10);
//     y += line;

//     writePair(
//       "Tour Name & Batch",
//       `${tourFull?.title || ""} (${tourFull?.batch || ""})`
//     );
//     writePair("Cancellation Date", cancellationDate);
//     space(1);

//     // Cancelled Travellers
//     writeSectionTitle("CANCELLED TRAVELLERS");
//     selectedIndexes.forEach((idx, i) => {
//       const t = singleBooking.travellers[idx];
//       const cancelled = t.cancelled || {};
//       const status = cancelled.byAdmin
//         ? " (OFF - Booking Rejected)"
//         : cancelled.byTraveller && cancelled.byAdmin
//         ? " (OFF - Traveller Cancelled)"
//         : "";

//       setBold();
//       writeAt(
//         `${i + 1}. ${t.title} ${t.firstName} ${t.lastName} (${t.age}/${
//           t.gender
//         })${status}`
//       );
//       setNormal();
//       writeAt(
//         `Package: ${
//           t.packageType === "variant" ? "Variant" : "Main"
//         } | Sharing: ${getSharingText(t)}`,
//         indent
//       );
//     });
//     space(1);

//     // Package Pricing
//     writeSectionTitle("PACKAGE PRICING (REFERENCE)");
//     const pkg = (type, dbl, tri, cwb, cwo) => {
//       setBold();
//       writeAt(`• ${type} Package Rates:`, left);
//       setNormal();
//       writeAt(`Double: ₹${Number(dbl || 0).toLocaleString()}`, indent);
//       writeAt(`Triple: ₹${Number(tri || 0).toLocaleString()}`, indent);
//       writeAt(`Child w/ Berth: ₹${Number(cwb || 0).toLocaleString()}`, indent);
//       writeAt(`Child w/o Berth: ₹${Number(cwo || 0).toLocaleString()}`, indent);
//       space(0.5);
//     };

//     if (tourFull) {
//       pkg(
//         "Main",
//         tourFull.balanceDouble,
//         tourFull.balanceTriple,
//         tourFull.balanceChildWithBerth,
//         tourFull.balanceChildWithoutBerth
//       );
//       (tourFull.variantPackage || []).forEach((vp, i) => {
//         pkg(
//           `Variant ${i + 1}`,
//           vp.balanceDouble,
//           vp.balanceTriple,
//           vp.balanceChildWithBerth,
//           vp.balanceChildWithoutBerth
//         );
//       });
//     }
//     space(0.5);

//     // Cancellation Details
//     writeSectionTitle("TRAVEL COMPONENT CANCELLATION DETAILS");
//     selectedIndexes.forEach((idx) => {
//       const t = singleBooking.travellers[idx];
//       const isVariant =
//         t.packageType === "variant" && t.variantPackageIndex != null;
//       const variant = isVariant
//         ? tourFull?.variantPackage?.[t.variantPackageIndex]
//         : null;
//       const get = (f) => (isVariant && variant?.[f]) || tourFull?.[f] || [];
//       const trains = get("trainDetails");
//       const flights = get("flightDetails");
//       const subIndent = indent + 5;

//       setBold();
//       writeAt(`Traveller: ${t.title} ${t.firstName} ${t.lastName}`);
//       setNormal();

//       if (trains.length) {
//         writeAt("Train Cancellations:", indent);
//         trains.forEach((tr, i) => {
//           const key = `train-${idx}-${i}`;
//           const amt = Number(trainCancellations[key] || 0);
//           writeAt(
//             `• ${tr.trainName} (${tr.trainNo}) ${tr.fromStation}→${
//               tr.toStation
//             } | Amount: ₹${amt.toLocaleString()}`,
//             subIndent
//           );
//         });
//         space(0.25);
//       }

//       if (flights.length) {
//         writeAt("Flight Cancellations:", indent);
//         flights.forEach((fl, i) => {
//           const key = `flight-${idx}-${i}`;
//           const amt = Number(flightCancellations[key] || 0);
//           writeAt(
//             `• ${fl.airline} ${fl.flightNo} ${fl.fromAirport}→${
//               fl.toAirport
//             } | Amount: ₹${amt.toLocaleString()}`,
//             subIndent
//           );
//         });
//         space(0.25);
//       }
//     });
//     space(1);

//     // Custom Add-ons
//     const addons = (customAddons || []).filter(
//       (a) => a?.name || a?.amount || a?.remark
//     );
//     if (addons.length) {
//       writeSectionTitle("CUSTOM ADD-ONS / EXTRA REMARKS");
//       addons.forEach((a) => {
//         const amt = a.amount
//           ? `₹${Number(a.amount || 0).toLocaleString()}`
//           : "";
//         writeAt(
//           `• ${a.name || ""} - ${amt} (${a.remark || ""})`.trim(),
//           indent
//         );
//       });
//       space(1);
//     }

//     // Totals
//     const trainSum = Object.entries(trainCancellations || {})
//       .filter(([k]) => selectedIndexes.includes(Number(k.split("-")[1])))
//       .reduce((s, [, v]) => s + Number(v || 0), 0);
//     const flightSum = Object.entries(flightCancellations || {})
//       .filter(([k]) => selectedIndexes.includes(Number(k.split("-")[1])))
//       .reduce((s, [, v]) => s + Number(v || 0), 0);
//     const irctcTotal = trainSum + flightSum;
//     const addonTotal = addons.reduce((s, a) => s + Number(a.amount || 0), 0);
//     const grand = irctcTotal + addonTotal;

//     writeSectionTitle("TOTAL CANCELLATION SUMMARY");
//     doc.setFontSize(11);
//     setBold();
//     space(1);
//     writePair("IRCTC & Flight Cancellation", `₹${irctcTotal.toLocaleString()}`);
//     setNormal();
//     space(1);
//     writePair("Custom Add-on/Remarks Total", `₹${addonTotal.toLocaleString()}`);
//     setNormal();
//     doc.setFontSize(14);
//     setBold();
//     space(1);
//     writePair("GRAND TOTAL CANCELLED AMOUNT", `₹${grand}`);
//     setNormal();
//     doc.setFontSize(10);
//     space(1);

//     // Cancellation History
//     if ((cancellationHistory || []).length) {
//       writeSectionTitle("CANCELLATION HISTORY");
//       cancellationHistory.forEach((c, i) => {
//         const date = c.createdAt ? new Date(c.createdAt).toLocaleString() : "—";
//         setBold();
//         writeAt(
//           `${cancellationHistory.length - i}. Previous Cancellation on ${date}`
//         );
//         setNormal();
//         setBold();
//         writeAt(
//           `GV Cancellation: ₹${Number(
//             c.gvCancellationAmount || 0
//           ).toLocaleString()}`,
//           indent
//         );
//         setNormal();
//         setBold();
//         writeAt(
//           `IRCTC & Travel: ₹${Number(
//             c.irctcCancellationAmount || 0
//           ).toLocaleString()}`,
//           indent
//         );
//         setNormal();
//         setBold();
//         writeAt(`Remarks: ${c.remarks || "-"}`, indent);
//         setNormal();
//         setBold();
//         writeAt(
//           `Total Cancelled: ₹${Number(
//             c.totalCancellationAmount || 0
//           ).toLocaleString()}`,
//           indent
//         );
//         setNormal();
//         setBold();
//         writeAt(
//           `Updated Balance: ₹${Number(c.updatedBalance || 0).toLocaleString()}`,
//           indent
//         );
//         setNormal();
//         setBold();
//         writeAt(
//           `Cancellation Days Remaining: ${Number(c.noOfDays || 0)}`,
//           indent
//         );
//         setNormal();
//         space(0);
//       });
//     }

//     doc.save(`cancellation_${singleBooking._id}.pdf`);
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

//   // ────────────────────── BOOKING REJECTED? ──────────────────────
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
//             <div className="flex gap-2">
//               <button
//                 onClick={handleFetch}
//                 className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
//                 disabled={isBookingRejected}
//               >
//                 Get Details
//               </button>
//               <button
//                 onClick={handleExportCancelledPDF}
//                 disabled={selectedIndexes.length === 0 || isBookingRejected}
//                 className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
//                   selectedIndexes.length === 0 || isBookingRejected
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-green-600 hover:bg-green-700"
//                 }`}
//               >
//                 Export PDF
//               </button>
//             </div>
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
//               const isApproved = c.approvedBy === true;
//               const bgColor = isApproved
//                 ? "bg-green-50 border-green-500"
//                 : "bg-red-50 border-red-500";
//               const textColor = isApproved ? "text-green-800" : "text-red-800";
//               const badge = isApproved ? "APPROVED" : "REJECTED";

//               return (
//                 <div
//                   key={i}
//                   className={`border rounded-lg p-3 ${bgColor} border-l-4`}
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <p className={`font-medium ${textColor}`}>
//                         Cancellation #{cancellationHistory.length - i}
//                         <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-white">
//                           {badge}
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
//               const isAdminCancelled = cancelled.byAdmin === true;
//               const isTravellerCancelled = cancelled.byTraveller === true;
//               const isFullyCancelled = isAdminCancelled && isTravellerCancelled;
//               const isSelectable = !isAdminCancelled && !isFullyCancelled;

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
//                     isAdminCancelled || isFullyCancelled
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
//                           {isAdminCancelled && (
//                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
//                               OFF - Booking Rejected
//                             </span>
//                           )}
//                           {isFullyCancelled && (
//                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-600 text-white">
//                               OFF - Traveller Cancelled
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
                      <p className="text-xs text-gray-600">
                        Date:{" "}
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
                      <strong>Days:</strong> {c.noOfDays ?? 0}
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
