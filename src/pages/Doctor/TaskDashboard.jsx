// import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { TourContext } from "../../context/TourContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   IndianRupee,
//   Receipt,
//   CheckCircle,
//   FileText,
//   Loader2,
//   Check,
//   Calendar,
// } from "lucide-react";

// const TaskDashboard = () => {
//   const {
//     ttoken,
//     allBookings:bookings,
//     getAllBookings,
//     markAdvanceReceiptSent,
//     markBalanceReceiptSent,
//     markModifyReceipt,
//   } = useContext(TourContext);

//   const [isLoading, setIsLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState({});
//   const [expanded, setExpanded] = useState({});
//   const [showMore, setShowMore] = useState({});

//   const location = useLocation();

//   // Clear old toasts when changing page
//   useEffect(() => {
//     return () => toast.dismiss();
//   }, [location]);

//   // Load ALL bookings on mount (once per login / refresh)
//   useEffect(() => {
//     if (!ttoken) return;

//     const loadAllPendingTasks = async () => {
//       setIsLoading(true);
//       try {
//         await getAllBookings(); // ← this should fetch ALL tours' bookings for this operator
//         toast.success(`Loaded ${bookings.length || 0} bookings from all tours`);
//       } catch (err) {
//         console.error("Failed to load bookings:", err);
//         toast.error("Could not load pending tasks. Check network or login.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadAllPendingTasks();
//   }, [ttoken, getAllBookings]);

//   // ────────────────────────────────────────────────
//   //  Filters – pending actions across ALL tours
//   // ────────────────────────────────────────────────
//   const filters = {
//     advanceReceipt: (b) =>
//       b?.payment?.advance?.paid === true &&
//       b?.receipts?.advanceReceiptSent !== true &&
//       (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),

//     balanceReceipt: (b) =>
//       b?.payment?.advance?.paid === true &&
//       b?.payment?.balance?.paid === true &&
//       b?.receipts?.balanceReceiptSent !== true &&
//       (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),

//     modifyReceipt: (b) =>
//       b?.isTripCompleted === true &&
//       b?.isBookingCompleted !== true &&
//       (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),

//     uncompleted: (b) =>
//       b?.isBookingCompleted !== true &&
//       (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),
//   };

//   const categorized = useMemo(() => ({
//     advanceReceipt: bookings.filter(filters.advanceReceipt),
//     balanceReceipt: bookings.filter(filters.balanceReceipt),
//     modifyReceipt: bookings.filter(filters.modifyReceipt),
//     uncompleted: bookings.filter(filters.uncompleted),
//   }), [bookings]);

//   const metrics = [
//     { label: "Total Pending Tasks", value: bookings.length,              Icon: Calendar,      color: "text-blue-600",   bg: "bg-blue-100" },
//     { label: "Advance Receipts",     value: categorized.advanceReceipt.length,  Icon: IndianRupee,   color: "text-green-600",  bg: "bg-green-100" },
//     { label: "Balance Receipts",     value: categorized.balanceReceipt.length,  Icon: Receipt,       color: "text-yellow-600", bg: "bg-yellow-100" },
//     { label: "Modified Receipts",    value: categorized.modifyReceipt.length,   Icon: FileText,      color: "text-purple-600", bg: "bg-purple-100" },
//     { label: "Uncompleted Bookings", value: categorized.uncompleted.length,     Icon: CheckCircle,   color: "text-orange-600", bg: "bg-orange-100" },
//   ];

//   // ────────────────────────────────────────────────
//   // Mark complete action
//   // ────────────────────────────────────────────────
//   const handleMarkComplete = useCallback(async (bookingId, type) => {
//     if (!window.confirm(`Mark this ${type} as complete?`)) return;

//     setActionLoading((prev) => ({ ...prev, [bookingId]: type }));

//     try {
//       let res;
//       if (type === "advance") {
//         res = await markAdvanceReceiptSent(bookingId);
//       } else if (type === "balance") {
//         res = await markBalanceReceiptSent(bookingId);
//       } else if (type === "modify") {
//         res = await markModifyReceipt(bookingId);
//       }

//       if (res?.success) {
//         toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} marked complete`);
//         await getAllBookings(); // refresh whole list
//       } else {
//         toast.error(res?.message || "Operation failed");
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Action failed");
//     } finally {
//       setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
//     }
//   }, [markAdvanceReceiptSent, markBalanceReceiptSent, markModifyReceipt, getAllBookings]);

//   const toggleExpand = (cat, id) => {
//     setExpanded((p) => ({
//       ...p,
//       [cat]: { ...p[cat], [id]: !p[cat]?.[id] },
//     }));
//   };

//   const toggleShowMore = (cat) => {
//     setShowMore((p) => ({ ...p, [cat]: !p[cat] }));
//   };

//   const formatDate = (d) => (d ? new Date(d).toLocaleString("en-IN") : "—");

//   // ────────────────────────────────────────────────
//   // Card component – shows tour name clearly
//   // ────────────────────────────────────────────────
//   const TaskCard = ({ booking, category, type, label, color }) => {
//     const firstTrav = booking.travellers?.[0] || {};
//     const travellerName = `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() || "Unknown";

//     return (
//       <div
//         className="bg-white rounded-xl shadow border hover:shadow-lg transition p-5 cursor-pointer"
//         onClick={() => toggleExpand(category, booking._id)}
//       >
//         <div className="flex justify-between items-start gap-4">
//           <div className="flex-1">
//             <p className="font-semibold text-lg mb-1 text-gray-900">
//               {booking.tourData?.title || booking.tour?.title || booking.tourName || "Tour"}
//             </p>
//             <p className="text-gray-700 font-medium">{travellerName}</p>
//           </div>
//           <span className={`px-3 py-1 text-xs font-medium rounded-full ${color} bg-opacity-10`}>
//             {label}
//           </span>
//         </div>

//         {expanded[category]?.[booking._id] && (
//           <div className="mt-5 pt-4 border-t space-y-3 text-sm text-gray-700">
//             <div className="flex items-center gap-2">
//               <strong>Booking ID:</strong>
//               <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{booking._id}</code>
//             </div>
//             <p><strong>Tour:</strong> {booking.tourData?.title || "—"}</p>
//             <p><strong>Email:</strong> {booking.contact?.email || booking.userId?.email || "—"}</p>
//             <p><strong>Mobile:</strong> {booking.contact?.mobile || "—"}</p>
//             <p><strong>Date:</strong> {formatDate(booking.bookingDate)}</p>
//             <p><strong>Travellers:</strong> {booking.travellers?.length || 0}</p>

//             <div className="flex justify-end mt-5">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleMarkComplete(booking._id, type);
//                 }}
//                 disabled={actionLoading[booking._id] === type || isLoading}
//                 className={`flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-lg transition ${
//                   actionLoading[booking._id] === type
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-green-600 hover:bg-green-700"
//                 }`}
//               >
//                 {actionLoading[booking._id] === type ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <Check className="w-4 h-4" />
//                     Mark Complete
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const Section = ({ title, category, type, label, color, Icon }) => {
//     const items = categorized[category] || [];
//     const visible = showMore[category] ? items : items.slice(0, 5);

//     return (
//       <section className="mb-12 bg-white p-6 md:p-8 rounded-2xl shadow border">
//         <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-6 text-gray-900">
//           <Icon className={`w-8 h-8 ${color}`} />
//           {title}
//           <span className="text-gray-500 text-xl ml-3">({items.length})</span>
//         </h2>

//         {items.length === 0 ? (
//           <p className="text-center text-gray-500 py-12 text-lg">
//             No pending {title.toLowerCase()} at the moment.
//           </p>
//         ) : (
//           <>
//             <div className="space-y-4">
//               {visible.map((b) => (
//                 <TaskCard
//                   key={b._id}
//                   booking={b}
//                   category={category}
//                   type={type}
//                   label={label}
//                   color={color}
//                 />
//               ))}
//             </div>

//             {items.length > 5 && (
//               <button
//                 onClick={() => toggleShowMore(category)}
//                 className="mt-8 mx-auto block px-8 py-3 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition"
//               >
//                 {showMore[category] ? "Show Less" : `Show More (${items.length - 5})`}
//               </button>
//             )}
//           </>
//         )}
//       </section>
//     );
//   };

//   if (!ttoken) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gray-50">
//         Please login to view your pending tasks.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
//       <ToastContainer position="top-right" autoClose={4000} theme="light" />

//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 md:mb-14 text-gray-900">
//           All Pending Tasks
//         </h1>

//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center py-24">
//             <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
//             <p className="text-xl text-gray-600">Loading all pending tasks from all tours...</p>
//           </div>
//         ) : bookings.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-600 text-xl">
//             No pending tasks across any tours right now.
//           </div>
//         ) : (
//           <>
//             {/* Metrics overview */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6 mb-12">
//               {metrics.map((m, i) => (
//                 <div
//                   key={i}
//                   className="bg-white p-6 rounded-2xl shadow text-center border hover:shadow-md transition"
//                 >
//                   <div className={`w-14 h-14 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
//                     <m.Icon className={`w-7 h-7 ${m.color}`} />
//                   </div>
//                   <p className="text-3xl md:text-4xl font-bold text-gray-900">{m.value}</p>
//                   <p className="text-sm md:text-base text-gray-600 mt-2">{m.label}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Sections – all tours combined */}
//             <Section
//               title="Advance Receipt Pending"
//               category="advanceReceipt"
//               type="advance"
//               label="Advance Pending"
//               color="text-green-600"
//               Icon={IndianRupee}
//             />

//             <Section
//               title="Balance Receipt Pending"
//               category="balanceReceipt"
//               type="balance"
//               label="Balance Pending"
//               color="text-yellow-600"
//               Icon={Receipt}
//             />

//             <Section
//               title="Modified Receipt Pending"
//               category="modifyReceipt"
//               type="modify"
//               label="Modify Pending"
//               color="text-purple-600"
//               Icon={FileText}
//             />

//             <Section
//               title="Uncompleted Bookings"
//               category="uncompleted"
//               type="completeBooking"
//               label="Needs Completion"
//               color="text-orange-600"
//               Icon={CheckCircle}
//             />
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TaskDashboard;

import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    IndianRupee,
    Receipt,
    CheckCircle,
    FileText,
    Loader2,
    Check,
    Calendar,
    Users,
    Copy,
    XCircle,
    FilePenLine,
    MapPin,
} from "lucide-react";

const TaskDashboard = () => {
    const {
        ttoken,
        allBookings: bookings,
        getAllBookings,
        taskMarkAdvanceReceiptSent,
        taskMarkBalanceReceiptSent,
        taskMarkModifyReceipt,
        taskCompleteBooking,
    } = useContext(TourContext);

    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [expanded, setExpanded] = useState({});
    const [showMore, setShowMore] = useState({});

    const location = useLocation();

    useEffect(() => {
        return () => toast.dismiss();
    }, [location]);

    useEffect(() => {
        if (!ttoken) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                await getAllBookings();
                toast.success(`Loaded ${bookings.length || 0} bookings`);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load tasks");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [ttoken, getAllBookings]);

    // Filters (unchanged)
    const filters = {
        advanceReceipt: (b) =>
            b?.payment?.advance?.paid === true &&
            b?.receipts?.advanceReceiptSent !== true &&
            (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),

        balanceReceipt: (b) =>
            b?.payment?.advance?.paid === true &&
            b?.payment?.balance?.paid === true &&
            b?.receipts?.balanceReceiptSent !== true &&
            (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),

        modifyReceipt: (b) =>
            b?.isTripCompleted === true &&
            b?.isBookingCompleted !== true &&
            (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),

        uncompleted: (b) =>
            b?.isBookingCompleted !== true &&
            (b?.travellers || []).some((t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin),
    };

    const categorized = useMemo(() => ({
        advanceReceipt: bookings.filter(filters.advanceReceipt),
        balanceReceipt: bookings.filter(filters.balanceReceipt),
        modifyReceipt: bookings.filter(filters.modifyReceipt),
        uncompleted: bookings.filter(filters.uncompleted),
    }), [bookings]);

    const metrics = [
        { label: "Total Pending", value: bookings.length, Icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
        { label: "Advance Pending", value: categorized.advanceReceipt.length, Icon: IndianRupee, color: "text-green-600", bg: "bg-green-100" },
        { label: "Balance Pending", value: categorized.balanceReceipt.length, Icon: Receipt, color: "text-yellow-600", bg: "bg-yellow-100" },
        { label: "Modify Pending", value: categorized.modifyReceipt.length, Icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
        { label: "Uncompleted", value: categorized.uncompleted.length, Icon: CheckCircle, color: "text-orange-600", bg: "bg-orange-100" },
    ];

    const handleMarkAction = useCallback(async (bookingId, type) => {
    const successMessages = {
        advance: "Advance Receipt marked as Complete!",
        balance: "Balance Receipt marked as Complete!",
        modify: "Modify Receipt marked as Complete!",
        completeBooking: "Booking marked as Completed!",
    };

    const errorMessages = {
        advance: "Failed to mark Advance Receipt",
        balance: "Failed to mark Balance Receipt",
        modify: "Failed to mark Modify Receipt",
        completeBooking: "Failed to mark Booking Completed",
    };

    if (!window.confirm(`Mark this as Complete?`)) return;

    setActionLoading((prev) => ({ ...prev, [bookingId]: type }));

    console.log(`Starting ${type} action for booking ${bookingId}`);

    try {
        let res;
        if (type === "advance") {
            res = await taskMarkAdvanceReceiptSent(bookingId);
        } else if (type === "balance") {
            res = await taskMarkBalanceReceiptSent(bookingId);
        } else if (type === "modify") {
            res = await taskMarkModifyReceipt(bookingId);
        } else if (type === "completeBooking") {
            res = await taskCompleteBooking(bookingId);
        }

        console.log(`[${type.toUpperCase()}] Full API Response:`, JSON.stringify(res, null, 2)); // Detailed log
        console.log(`Success field type:`, typeof res?.success, res?.success); // Check if string or boolean

        // Loose check: success true or "true" or any truthy value
        if (res && (res.success === true || res.success === "true" || res.success)) {
            toast.success(successMessages[type]);
            await getAllBookings(); // Refresh list
        } else {
            toast.error(res?.message || errorMessages[type] || "Unknown error from backend");
        }
    } catch (err) {
        console.error(`[${type.toUpperCase()}] Action error:`, err);
        toast.error(err?.response?.data?.message || errorMessages[type] || "Something went wrong");
    } finally {
        console.log(`[${type.toUpperCase()}] Action finished - loader should stop`);
        setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
    }
}, [taskMarkAdvanceReceiptSent, taskMarkBalanceReceiptSent, taskMarkModifyReceipt, taskCompleteBooking, getAllBookings]);

    const toggleExpand = (category, id) => {
        setExpanded((prev) => ({
            ...prev,
            [category]: { ...prev[category], [id]: !prev[category]?.[id] },
        }));
    };

    const toggleShowMore = (category) => {
        setShowMore((prev) => ({ ...prev, [category]: !prev[category] }));
    };

    const formatDate = (date) => (date ? new Date(date).toLocaleString("en-IN") : "—");

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => toast.success("Booking ID copied!"),
            () => toast.error("Failed to copy")
        );
    };

    // TaskCard with green button at top-right
    const TaskCard = ({ booking, category, type, label, color }) => {
        const firstTrav = booking.travellers?.[0] || {};
        const travellerName = `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() || "Unknown";

        const isActing = actionLoading[booking._id] === type;

        return (
            <div
                className="bg-white rounded-xl shadow border hover:shadow-lg transition p-5 cursor-pointer relative"
                onClick={() => toggleExpand(category, booking._id)}
            >
                {/* Green Button - Positioned at Top-Right (only this added) */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent expand when clicking button
                            handleMarkAction(booking._id, type);
                        }}
                        disabled={isActing}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition ${isActing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {isActing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        {type === "completeBooking" ? "Mark as Completed" : "Mark as Receipt Complete"}
                    </button>
                </div>

                {/* Original card content (unchanged - button is overlayed) */}
                <div className="flex justify-between items-start gap-4 pr-56"> {/* pr-56 added to prevent text overlap with button */}

                    <div className="flex-1">
                        <p className="font-semibold text-lg mb-1 text-gray-900">
                            {booking.tourData?.title || booking.tour?.title || "Tour"}
                        </p>
                        <p className="text-gray-700 font-medium">{travellerName}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${color} bg-opacity-10`}>
                        {label}
                    </span>
                </div>

                {/* Expanded details (unchanged - no button here) */}
                {expanded[category]?.[booking._id] && (
                    <div className="mt-5 pt-4 border-t space-y-4 text-sm text-gray-700">
                        {/* Booking ID + Copy */}
                        <div className="flex items-center gap-2">
                            <strong>Booking ID:</strong>
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{booking._id}</code>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(booking._id);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                        </div>

                        {/* Contact + Booking Mode */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <p><strong>Email:</strong> {booking.contact?.email || "—"}</p>
                            <p><strong>Mobile:</strong> {booking.contact?.mobile || "—"}</p>
                            <p><strong>Booking Mode:</strong>
                                <span className={booking.bookingType === "offline" ? "text-orange-600 font-medium" : "text-green-600 font-medium"}>
                                    {booking.bookingType ? booking.bookingType.toUpperCase() : "—"}
                                </span>
                            </p>
                            <p><strong>Booking Date:</strong> {formatDate(booking.bookingDate)}</p>
                        </div>

                        {/* Billing Address */}
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Billing Address
                            </h4>
                            <p>
                                {booking.billingAddress?.addressLine1 || "—"} {booking.billingAddress?.addressLine2 || ""}
                            </p>
                            <p>
                                {booking.billingAddress?.city || "—"}, {booking.billingAddress?.state || "—"} {booking.billingAddress?.pincode || "—"}
                            </p>
                            <p>{booking.billingAddress?.country || "India"}</p>
                        </div>

                        {/* Travellers */}
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Travellers ({booking.travellers?.length || 0})
                            </h4>
                            <div className="space-y-3">
                                {booking.travellers?.map((t, i) => (
                                    <div key={i} className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                                        <p className="font-medium">
                                            {t.title} {t.firstName} {t.lastName} ({t.age} yrs, {t.gender || "—"})
                                        </p>
                                        <p>Sharing: {t.sharingType || "—"}</p>
                                        <p>Package: {t.packageType || "—"}</p>
                                        {t.selectedAddon && <p>Addon: {t.selectedAddon.name} (₹{t.selectedAddon.price || 0})</p>}
                                        {t.boardingPoint && <p>Boarding: {t.boardingPoint.stationName} ({t.boardingPoint.stationCode})</p>}
                                        {t.deboardingPoint && <p>Deboarding: {t.deboardingPoint.stationName} ({t.deboardingPoint.stationCode})</p>}
                                        {t.trainSeats?.length > 0 && (
                                            <p>Train Seats: {t.trainSeats.map(s => `${s.trainName}: ${s.seatNo}`).join(", ")}</p>
                                        )}
                                        {t.flightSeats?.length > 0 && (
                                            <p>Flight Seats: {t.flightSeats.map(s => `${s.flightName}: ${s.seatNo}`).join(", ")}</p>
                                        )}
                                        <p>Staff Remarks: {t.staffRemarks || "—"}</p>
                                        <p>Remarks: {t.remarks || "—"}</p>
                                        {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
                                            <p className="text-red-600">
                                                Cancelled by {t.cancelled.byAdmin ? "Admin" : "Traveller"} at {formatDate(t.cancelled.cancelledAt)}
                                                {t.cancelled.reason ? ` (${t.cancelled.reason})` : ""}
                                            </p>
                                        )}
                                    </div>
                                )) || <p>No travellers</p>}
                            </div>
                        </div>

                        {/* Payment */}
                        <div>
                            <h4 className="font-semibold mb-2">Payment Details</h4>
                            <p>
                                Advance: ₹{booking.payment?.advance?.amount || 0} -
                                {booking.payment?.advance?.paid ? ` Paid at ${formatDate(booking.payment.advance.paidAt)}` : " Pending"}
                                {booking.payment?.advance?.paymentVerified ? " (Verified)" : ""}
                            </p>
                            <p>
                                Balance: ₹{booking.payment?.balance?.amount || 0} -
                                {booking.payment?.balance?.paid ? ` Paid at ${formatDate(booking.payment.balance.paidAt)}` : " Pending"}
                                {booking.payment?.balance?.paymentVerified ? " (Verified)" : ""}
                            </p>
                        </div>

                        {/* Receipts */}
                        <div>
                            <h4 className="font-semibold mb-2">Receipts</h4>
                            <p>Advance: {booking.receipts?.advanceReceiptSent ? `Sent at ${formatDate(booking.receipts.advanceReceiptSentAt)}` : "Not Sent"}</p>
                            <p>Balance: {booking.receipts?.balanceReceiptSent ? `Sent at ${formatDate(booking.receipts.balanceReceiptSentAt)}` : "Not Sent"}</p>
                        </div>

                        {/* Admin Remarks */}
                        <div>
                            <h4 className="font-semibold mb-2">Admin Remarks</h4>
                            <div className="space-y-2">
                                {booking.adminRemarks?.map((r, i) => (
                                    <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                                        <p>{r.remark || "—"} (₹{r.amount || 0})</p>
                                        <p className="text-gray-500">Added: {formatDate(r.addedAt)}</p>
                                    </div>
                                )) || <p>No remarks</p>}
                            </div>
                        </div>

                        {/* Cancellation */}
                        {booking.cancelled?.byAdmin || booking.cancelled?.byTraveller ? (
                            <div className="text-red-600">
                                <h4 className="font-semibold mb-2">Cancellation</h4>
                                <p>
                                    Cancelled by {booking.cancelled.byAdmin ? "Admin" : "Traveller"} at {formatDate(booking.cancelled.cancelledAt)}
                                    {booking.cancelled.reason ? ` (${booking.cancelled.reason})` : ""}
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        );
    };

    const Section = ({ title, category, type, label, color, Icon }) => {
        const items = categorized[category] || [];
        const visible = showMore[category] ? items : items.slice(0, 5);

        return (
            <section className="mb-12 bg-white p-6 md:p-8 rounded-2xl shadow border">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-6 text-gray-900">
                    <Icon className={`w-8 h-8 ${color}`} />
                    {title}
                    <span className="text-gray-500 text-xl ml-3">({items.length})</span>
                </h2>

                {items.length === 0 ? (
                    <p className="text-center text-gray-500 py-12 text-lg">
                        No pending {title.toLowerCase()} at the moment.
                    </p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {visible.map((b) => (
                                <TaskCard
                                    key={b._id}
                                    booking={b}
                                    category={category}
                                    type={type}
                                    label={label}
                                    color={color}
                                />
                            ))}
                        </div>

                        {items.length > 5 && (
                            <button
                                onClick={() => toggleShowMore(category)}
                                className="mt-8 mx-auto block px-8 py-3 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition"
                            >
                                {showMore[category] ? "Show Less" : `Show More (${items.length - 5})`}
                            </button>
                        )}
                    </>
                )}
            </section>
        );
    };

    if (!ttoken) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gray-50">
                Please login to view your pending tasks.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
            <ToastContainer position="top-right" autoClose={4000} theme="light" />

            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 md:mb-14 text-gray-900">
                    All Pending Tasks
                </h1>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
                        <p className="text-xl text-gray-600">Loading all pending tasks from all tours...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-600 text-xl">
                        No pending tasks across any tours right now.
                    </div>
                ) : (
                    <>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6 mb-12">
                            {metrics.map((m, i) => (
                                <div
                                    key={i}
                                    className="bg-white p-6 rounded-2xl shadow text-center border hover:shadow-md transition"
                                >
                                    <div className={`w-14 h-14 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <m.Icon className={`w-7 h-7 ${m.color}`} />
                                    </div>
                                    <p className="text-3xl md:text-4xl font-bold text-gray-900">{m.value}</p>
                                    <p className="text-sm md:text-base text-gray-600 mt-2">{m.label}</p>
                                </div>
                            ))}
                        </div>
                        <Section
                            title="Advance Receipt Pending"
                            category="advanceReceipt"
                            type="advance"

                            color="text-green-600"
                            Icon={IndianRupee}
                        />

                        <Section
                            title="Balance Receipt Pending"
                            category="balanceReceipt"
                            type="balance"

                            color="text-yellow-600"
                            Icon={Receipt}
                        />

                        <Section
                            title="Modified Receipt Pending"
                            category="modifyReceipt"
                            type="modify"

                            color="text-purple-600"
                            Icon={FileText}
                        />

                        <Section
                            title="Uncompleted Bookings"
                            category="uncompleted"
                            type="completeBooking"

                            color="text-orange-600"
                            Icon={CheckCircle}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default TaskDashboard;




