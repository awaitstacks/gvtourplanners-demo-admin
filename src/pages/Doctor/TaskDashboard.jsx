// /* eslint-disable no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, {
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
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
//   Users,
//   Copy,
//   MapPin,
// } from "lucide-react";

// const TaskDashboard = () => {
//   const {
//     ttoken,
//     allBookings: bookings,
//     getAllBookings,
//     taskMarkAdvanceReceiptSent,
//     taskMarkBalanceReceiptSent,
//     taskMarkModifyReceipt,
//     taskCompleteBooking,
//   } = useContext(TourContext);

//   const [isLoading, setIsLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState({});
//   const [expanded, setExpanded] = useState({});
//   const [showMore, setShowMore] = useState({});

//   const location = useLocation();

//   useEffect(() => {
//     return () => toast.dismiss();
//   }, [location]);

//   useEffect(() => {
//     if (!ttoken) return;

//     const loadData = async () => {
//       setIsLoading(true);
//       try {
//         await getAllBookings();
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load tasks");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, [ttoken, getAllBookings]);

//   // Filters
//   const filters = {
//     advanceReceipt: (b) =>
//       (b.payment?.advance?.paid &&
//         !b.payment?.balance?.paid &&
//         !b.receipts?.advanceReceiptSent &&
//         b.travellers?.some(
//           (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
//         )) ||
//       (b.payment?.advance?.paid &&
//         b.payment?.balance?.paid &&
//         !b.receipts?.advanceReceiptSent &&
//         b.travellers?.some(
//           (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
//         )),

//     balanceReceipt: (b) =>
//       b?.payment?.advance?.paid === true &&
//       b?.payment?.balance?.paid === true &&
//       b?.receipts?.balanceReceiptSent !== true &&
//       (b?.travellers || []).some(
//         (t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
//       ),

//     modifyReceipt: (b) =>
//       b?.isTripCompleted === true &&
//       (b?.travellers || []).some(
//         (t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
//       ),

//     uncompleted: (b) =>
//       b?.payment?.advance?.paid === true &&
//       b?.receipts?.advanceReceiptSent === true &&
//       b?.payment?.balance?.paid === true &&
//       b?.receipts?.balanceReceiptSent === true &&
//       b?.isTripCompleted === false &&
//       b?.isBookingCompleted !== true,
//   };

//   const categorized = useMemo(
//     () => ({
//       advanceReceipt: bookings.filter(filters.advanceReceipt),
//       balanceReceipt: bookings.filter(filters.balanceReceipt),
//       modifyReceipt: bookings.filter(filters.modifyReceipt),
//       uncompleted: bookings.filter(filters.uncompleted),
//     }),
//     [bookings],
//   );

//   const totalPendingTasks = useMemo(() => {
//     return (
//       categorized.advanceReceipt.length +
//       categorized.balanceReceipt.length +
//       categorized.modifyReceipt.length +
//       categorized.uncompleted.length
//     );
//   }, [categorized]);

//   useEffect(() => {
//     if (!isLoading) {
//       if (totalPendingTasks > 0) {
//         toast.info(`${totalPendingTasks} pending tasks`, {
//           toastId: "pending-tasks-count",
//           autoClose: 5000,
//         });
//       } else {
//         toast.success("No pending tasks right now", {
//           toastId: "no-pending-tasks",
//         });
//       }
//     }
//   }, [isLoading, totalPendingTasks]);

//   const metrics = [
//     {
//       label: "Total Pending Tasks",
//       value: totalPendingTasks,
//       Icon: Calendar,
//       color: "text-blue-600",
//       bg: "bg-blue-100",
//     },
//     {
//       label: "Advance receipts Pending",
//       value: categorized.advanceReceipt.length,
//       Icon: IndianRupee,
//       color: "text-green-600",
//       bg: "bg-green-100",
//     },
//     {
//       label: "Balance receipts Pending",
//       value: categorized.balanceReceipt.length,
//       Icon: Receipt,
//       color: "text-yellow-600",
//       bg: "bg-yellow-100",
//     },
//     {
//       label: "Modified receipts Pending",
//       value: categorized.modifyReceipt.length,
//       Icon: FileText,
//       color: "text-purple-600",
//       bg: "bg-purple-100",
//     },
//     {
//       label: "Booking Completion",
//       value: categorized.uncompleted.length,
//       Icon: CheckCircle,
//       color: "text-orange-600",
//       bg: "bg-orange-100",
//     },
//   ];

//   const handleMarkAction = useCallback(
//     async (bookingId, type) => {
//       const successMessages = {
//         advance: "Advance Receipt marked as Complete!",
//         balance: "Balance Receipt marked as Complete!",
//         modify: "Modify Receipt marked as Complete!",
//         completeBooking: "Booking marked as Completed!",
//       };

//       const errorMessages = {
//         advance: "Failed to mark Advance Receipt",
//         balance: "Failed to mark Balance Receipt",
//         modify: "Failed to mark Modify Receipt",
//         completeBooking: "Failed to mark Booking Completed",
//       };

//       if (!window.confirm(`Mark this as Complete?`)) return;

//       setActionLoading((prev) => ({ ...prev, [bookingId]: type }));

//       try {
//         let res;
//         if (type === "advance") {
//           res = await taskMarkAdvanceReceiptSent(bookingId);
//         } else if (type === "balance") {
//           res = await taskMarkBalanceReceiptSent(bookingId);
//         } else if (type === "modify") {
//           res = await taskMarkModifyReceipt(bookingId);
//         } else if (type === "completeBooking") {
//           res = await taskCompleteBooking(bookingId);
//         }

//         if (
//           res &&
//           (res.success === true || res.success === "true" || !!res.success)
//         ) {
//           toast.success(successMessages[type]);
//           await getAllBookings();
//         } else {
//           toast.error(res?.message || errorMessages[type] || "Unknown error");
//         }
//       } catch (err) {
//         toast.error(
//           err?.response?.data?.message ||
//             errorMessages[type] ||
//             "Something went wrong",
//         );
//       } finally {
//         setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
//       }
//     },
//     [
//       taskMarkAdvanceReceiptSent,
//       taskMarkBalanceReceiptSent,
//       taskMarkModifyReceipt,
//       taskCompleteBooking,
//       getAllBookings,
//     ],
//   );

//   const toggleExpand = (category, id) => {
//     setExpanded((prev) => ({
//       ...prev,
//       [category]: { ...prev[category], [id]: !prev[category]?.[id] },
//     }));
//   };

//   const toggleShowMore = (category) => {
//     setShowMore((prev) => ({ ...prev, [category]: !prev[category] }));
//   };

//   const formatDate = (date) =>
//     date
//       ? new Date(date).toLocaleString("en-IN", {
//           dateStyle: "medium",
//           timeStyle: "short",
//         })
//       : "—";

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text).then(
//       () => toast.success("Booking ID copied!"),
//       () => toast.error("Failed to copy"),
//     );
//   };

//   const TaskCard = ({ booking, category, type, color }) => {
//     const firstTrav = booking.travellers?.[0] || {};
//     const travellerName =
//       `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() ||
//       "Unknown";

//     const isActing = actionLoading[booking._id] === type;

//     // Determine badge text based on category
//     let badgeText = "";
//     switch (category) {
//       case "advanceReceipt":
//         badgeText = "Advance receipts pending";
//         break;
//       case "balanceReceipt":
//         badgeText = "Balance receipts pending";
//         break;
//       case "modifyReceipt":
//         badgeText = "Modified receipts pending";
//         break;
//       case "uncompleted":
//         badgeText = "Booking completion pending";
//         break;
//       default:
//         badgeText = "Pending";
//     }

//     return (
//       <div
//         className="bg-white rounded-xl shadow border hover:shadow-lg transition p-4 sm:p-5 cursor-pointer relative"
//         onClick={() => toggleExpand(category, booking._id)}
//       >
//         <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleMarkAction(booking._id, type);
//             }}
//             disabled={isActing}
//             className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition ${
//               isActing
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//           >
//             {isActing ? (
//               <Loader2 className="w-4 h-4 animate-spin" />
//             ) : (
//               <Check className="w-4 h-4" />
//             )}
//             <span className="hidden xs:inline">
//               {type === "completeBooking"
//                 ? "Mark Completed"
//                 : "Mark Receipt Sent"}
//             </span>
//           </button>
//         </div>

//         <div className="pr-28 sm:pr-56 flex justify-between items-start gap-3 sm:gap-4">
//           <div className="flex-1 min-w-0">
//             <p className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
//               {booking.tourData?.title || booking.tour?.title || "Tour"}
//             </p>
//             <p className="text-gray-700 font-medium text-sm sm:text-base truncate">
//               {travellerName}
//             </p>
//           </div>
//           <span
//             className={`px-2.5 py-1 text-xs font-medium rounded-full ${color} bg-opacity-10 whitespace-nowrap`}
//           >
//             {badgeText}
//           </span>
//         </div>

//         {expanded[category]?.[booking._id] && (
//           <div className="mt-4 pt-4 border-t space-y-4 text-sm text-gray-700">
//             {/* Booking ID */}
//             <div className="flex items-center gap-2">
//               <strong>Booking ID:</strong>
//               <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
//                 {booking._id}
//               </code>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   copyToClipboard(booking._id);
//                 }}
//                 className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
//               >
//                 <Copy className="w-3 h-3" /> Copy
//               </button>
//             </div>

//             {/* Contact */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <p>
//                 <strong>Email:</strong> {booking.contact?.email || "—"}
//               </p>
//               <p>
//                 <strong>Mobile:</strong> {booking.contact?.mobile || "—"}
//               </p>
//               <p>
//                 <strong>Booking Mode:</strong>{" "}
//                 <span
//                   className={
//                     booking.bookingType === "offline"
//                       ? "text-orange-600 font-medium"
//                       : "text-green-600 font-medium"
//                   }
//                 >
//                   {booking.bookingType?.toUpperCase() || "—"}
//                 </span>
//               </p>
//               <p>
//                 <strong>Booking Date:</strong> {formatDate(booking.bookingDate)}
//               </p>
//             </div>

//             {/* Billing Address */}
//             {booking.billingAddress && (
//               <div>
//                 <h4 className="font-semibold mb-2 flex items-center gap-2">
//                   <MapPin className="w-4 h-4" /> Billing Address
//                 </h4>
//                 <p>
//                   {booking.billingAddress.addressLine1 || "—"}{" "}
//                   {booking.billingAddress.addressLine2 || ""}
//                 </p>
//                 <p>
//                   {booking.billingAddress.city || "—"},{" "}
//                   {booking.billingAddress.state || "—"}{" "}
//                   {booking.billingAddress.pincode || "—"}
//                 </p>
//                 <p>{booking.billingAddress.country || "India"}</p>
//               </div>
//             )}

//             {/* Travellers */}
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center gap-2">
//                 <Users className="w-4 h-4" /> Travellers (
//                 {booking.travellers?.length || 0})
//               </h4>
//               <div className="space-y-3">
//                 {booking.travellers?.map((t, i) => (
//                   <div
//                     key={i}
//                     className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs"
//                   >
//                     <p className="font-medium">
//                       {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
//                       {t.gender || "—"})
//                     </p>
//                     <p>Sharing: {t.sharingType || "—"}</p>
//                     <p>Package: {t.packageType || "—"}</p>
//                     {t.selectedAddon && (
//                       <p>
//                         Addon: {t.selectedAddon.name} (₹
//                         {t.selectedAddon.price || 0})
//                       </p>
//                     )}
//                     {t.boardingPoint && (
//                       <p>
//                         Boarding: {t.boardingPoint.stationName} (
//                         {t.boardingPoint.stationCode})
//                       </p>
//                     )}
//                     {t.deboardingPoint && (
//                       <p>
//                         Deboarding: {t.deboardingPoint.stationName} (
//                         {t.deboardingPoint.stationCode})
//                       </p>
//                     )}
//                     <p>Remarks: {t.remarks || "—"}</p>
//                     {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
//                       <p className="text-red-600">
//                         Cancelled by{" "}
//                         {t.cancelled.byAdmin ? "Admin" : "Traveller"}
//                       </p>
//                     )}
//                   </div>
//                 )) || <p className="text-gray-500">No travellers</p>}
//               </div>
//             </div>

//             {/* Payment */}
//             <div>
//               <h4 className="font-semibold mb-2">Payment Details</h4>
//               <p>
//                 Advance: ₹{booking.payment?.advance?.amount || 0} —{" "}
//                 {booking.payment?.advance?.paid
//                   ? `Paid ${formatDate(booking.payment.advance.paidAt)}`
//                   : "Pending"}
//                 {booking.payment?.advance?.paymentVerified && " (Verified)"}
//               </p>
//               <p>
//                 Balance: ₹{booking.payment?.balance?.amount || 0} —{" "}
//                 {booking.payment?.balance?.paid
//                   ? `Paid ${formatDate(booking.payment.balance.paidAt)}`
//                   : "Pending"}
//                 {booking.payment?.balance?.paymentVerified && " (Verified)"}
//               </p>
//             </div>

//             {/* Receipts */}
//             <div>
//               <h4 className="font-semibold mb-2">Receipts</h4>
//               <p>
//                 Advance:{" "}
//                 {booking.receipts?.advanceReceiptSent
//                   ? `Sent ${formatDate(booking.receipts.advanceReceiptSentAt)}`
//                   : "Not Sent"}
//               </p>
//               <p>
//                 Balance:{" "}
//                 {booking.receipts?.balanceReceiptSent
//                   ? `Sent ${formatDate(booking.receipts.balanceReceiptSentAt)}`
//                   : "Not Sent"}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const Section = ({ title, category, type, color, Icon }) => {
//     const items = categorized[category] || [];
//     const visible = showMore[category] ? items : items.slice(0, 5);

//     return (
//       <section className="mb-10 sm:mb-12 bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow border">
//         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 text-gray-900">
//           <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${color}`} />
//           {title}
//           <span className="text-gray-500 text-lg sm:text-xl ml-2 sm:ml-3">
//             ({items.length})
//           </span>
//         </h2>

//         {items.length === 0 ? (
//           <p className="text-center text-gray-500 py-10 sm:py-12 text-base sm:text-lg">
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
//                   color={color}
//                 />
//               ))}
//             </div>

//             {items.length > 5 && (
//               <button
//                 onClick={() => toggleShowMore(category)}
//                 className="mt-6 sm:mt-8 mx-auto block px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition"
//               >
//                 {showMore[category]
//                   ? "Show Less"
//                   : `Show More (${items.length - 5})`}
//               </button>
//             )}
//           </>
//         )}
//       </section>
//     );
//   };

//   if (!ttoken) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-lg sm:text-xl text-gray-600 bg-gray-50 px-4">
//         Please login to view your pending tasks.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
//       <ToastContainer
//         position="top-right"
//         autoClose={4000}
//         theme="light"
//         limit={3}
//       />

//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-14 text-gray-900">
//           All Pending Tasks
//         </h1>

//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center py-20 sm:py-24">
//             <Loader2 className="w-14 h-14 sm:w-16 sm:h-16 animate-spin text-blue-600 mb-5 sm:mb-6" />
//             <p className="text-lg sm:text-xl text-gray-600 text-center px-4">
//               Loading pending tasks...
//             </p>
//           </div>
//         ) : totalPendingTasks === 0 ? (
//           <div className="bg-white rounded-2xl shadow p-8 sm:p-10 text-center text-gray-600 text-lg sm:text-xl">
//             No pending tasks across any tours right now.
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12">
//               {metrics.map((m, i) => (
//                 <div
//                   key={i}
//                   className="bg-white p-4 sm:p-6 rounded-2xl shadow text-center border hover:shadow-md transition"
//                 >
//                   <div
//                     className={`w-12 h-12 sm:w-14 sm:h-14 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}
//                   >
//                     <m.Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${m.color}`} />
//                   </div>
//                   <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
//                     {m.value}
//                   </p>
//                   <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
//                     {m.label}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <Section
//               title="Advance Receipts Pending"
//               category="advanceReceipt"
//               type="advance"
//               color="text-green-600"
//               Icon={IndianRupee}
//             />

//             <Section
//               title="Balance Receipts Pending"
//               category="balanceReceipt"
//               type="balance"
//               color="text-yellow-600"
//               Icon={Receipt}
//             />

//             <Section
//               title="Modified Receipts Pending"
//               category="modifyReceipt"
//               type="modify"
//               color="text-purple-600"
//               Icon={FileText}
//             />

//             <Section
//               title="Booking Completion Pending"
//               category="uncompleted"
//               type="completeBooking"
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

/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
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
      (b.payment?.advance?.paid &&
        !b.payment?.balance?.paid &&
        !b.receipts?.advanceReceiptSent &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
        )) ||
      (b.payment?.advance?.paid &&
        b.payment?.balance?.paid &&
        !b.receipts?.advanceReceiptSent &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin,
        )),

    balanceReceipt: (b) =>
      b?.payment?.advance?.paid === true &&
      b?.payment?.balance?.paid === true &&
      b?.receipts?.balanceReceiptSent !== true &&
      (b?.travellers || []).some(
        (t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
      ),

    modifyReceipt: (b) =>
      b?.isTripCompleted === true &&
      (b?.travellers || []).some(
        (t) => !t?.cancelled?.byTraveller && !t?.cancelled?.byAdmin,
      ),

    uncompleted: (b) =>
      b?.payment?.advance?.paid === true &&
      b?.receipts?.advanceReceiptSent === true &&
      b?.payment?.balance?.paid === true &&
      b?.receipts?.balanceReceiptSent === true &&
      b?.isTripCompleted === false &&
      b?.isBookingCompleted !== true,
  };

  const categorized = useMemo(
    () => ({
      advanceReceipt: bookings.filter(filters.advanceReceipt),
      balanceReceipt: bookings.filter(filters.balanceReceipt),
      modifyReceipt: bookings.filter(filters.modifyReceipt),
      uncompleted: bookings.filter(filters.uncompleted),
    }),
    [bookings],
  );

  const totalPendingTasks = useMemo(() => {
    return (
      categorized.advanceReceipt.length +
      categorized.balanceReceipt.length +
      categorized.modifyReceipt.length +
      categorized.uncompleted.length
    );
  }, [categorized]);

  useEffect(() => {
    if (!isLoading) {
      if (totalPendingTasks > 0) {
        toast.info(`${totalPendingTasks} pending tasks`, {
          toastId: "pending-tasks-count",
          autoClose: 5000,
        });
      } else {
        toast.success("No pending tasks right now", {
          toastId: "no-pending-tasks",
        });
      }
    }
  }, [isLoading, totalPendingTasks]);

  const metrics = [
    {
      label: "Total Pending Tasks",
      value: totalPendingTasks,
      Icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Advance receipts Pending",
      value: categorized.advanceReceipt.length,
      Icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Balance receipts Pending",
      value: categorized.balanceReceipt.length,
      Icon: Receipt,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Modified receipts Pending",
      value: categorized.modifyReceipt.length,
      Icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Booking Completion",
      value: categorized.uncompleted.length,
      Icon: CheckCircle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  const handleMarkAction = useCallback(
    async (bookingId, type) => {
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

        if (
          res &&
          (res.success === true || res.success === "true" || !!res.success)
        ) {
          toast.success(successMessages[type]);
          await getAllBookings();
        } else {
          toast.error(res?.message || errorMessages[type] || "Unknown error");
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            errorMessages[type] ||
            "Something went wrong",
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
      }
    },
    [
      taskMarkAdvanceReceiptSent,
      taskMarkBalanceReceiptSent,
      taskMarkModifyReceipt,
      taskCompleteBooking,
      getAllBookings,
    ],
  );

  const toggleExpand = (category, id) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: { ...prev[category], [id]: !prev[category]?.[id] },
    }));
  };

  const toggleShowMore = (category) => {
    setShowMore((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Booking ID copied!"),
      () => toast.error("Failed to copy"),
    );
  };

  const TaskCard = ({ booking, category, type, color }) => {
    const firstTrav = booking.travellers?.[0] || {};
    const travellerName =
      `${firstTrav.firstName || ""} ${firstTrav.lastName || ""}`.trim() ||
      "Unknown";

    const isActing = actionLoading[booking._id] === type;

    // Badge text
    let badgeText = "";
    switch (category) {
      case "advanceReceipt":
        badgeText = "Advance receipts pending";
        break;
      case "balanceReceipt":
        badgeText = "Balance receipts pending";
        break;
      case "modifyReceipt":
        badgeText = "Modified receipts pending";
        break;
      case "uncompleted":
        badgeText = "Booking completion pending";
        break;
      default:
        badgeText = "Pending";
    }

    return (
      <div
        className="bg-white rounded-xl shadow border hover:shadow-lg transition p-4 sm:p-5 cursor-pointer relative"
        onClick={() => toggleExpand(category, booking._id)}
      >
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAction(booking._id, type);
            }}
            disabled={isActing}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition ${
              isActing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isActing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span className="hidden xs:inline">
              {type === "completeBooking"
                ? "Mark Completed"
                : "Mark Receipt Sent"}
            </span>
          </button>
        </div>

        <div className="pr-28 sm:pr-56 flex justify-between items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base sm:text-lg mb-1 text-gray-900 truncate">
              {booking.tourData?.title || booking.tour?.title || "Tour"}
            </p>
            <p className="text-gray-700 font-medium text-sm sm:text-base truncate">
              {travellerName}
            </p>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${color} bg-opacity-10 whitespace-nowrap`}
          >
            {badgeText}
          </span>
        </div>

        {expanded[category]?.[booking._id] && (
          <div className="mt-4 pt-4 border-t space-y-4 text-sm text-gray-700">
            {/* Booking ID */}
            <div className="flex items-center gap-2">
              <strong>Booking ID:</strong>
              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                {booking._id}
              </code>
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

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p>
                <strong>Email:</strong> {booking.contact?.email || "—"}
              </p>
              <p>
                <strong>Mobile:</strong> {booking.contact?.mobile || "—"}
              </p>
              <p>
                <strong>Booking Mode:</strong>{" "}
                <span
                  className={
                    booking.bookingType === "offline"
                      ? "text-orange-600 font-medium"
                      : "text-green-600 font-medium"
                  }
                >
                  {booking.bookingType?.toUpperCase() || "—"}
                </span>
              </p>
              <p>
                <strong>Booking Date:</strong> {formatDate(booking.bookingDate)}
              </p>
            </div>

            {/* Billing Address */}
            {booking.billingAddress && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Billing Address
                </h4>
                <p>
                  {booking.billingAddress.addressLine1 || "—"}{" "}
                  {booking.billingAddress.addressLine2 || ""}
                </p>
                <p>
                  {booking.billingAddress.city || "—"},{" "}
                  {booking.billingAddress.state || "—"}{" "}
                  {booking.billingAddress.pincode || "—"}
                </p>
                <p>{booking.billingAddress.country || "India"}</p>
              </div>
            )}

            {/* Travellers */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Travellers (
                {booking.travellers?.length || 0})
              </h4>
              <div className="space-y-3">
                {booking.travellers?.map((t, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs"
                  >
                    <p className="font-medium">
                      {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
                      {t.gender || "—"})
                    </p>
                    <p>Sharing: {t.sharingType || "—"}</p>
                    <p>Package: {t.packageType || "—"}</p>
                    {t.selectedAddon && (
                      <p>
                        Addon: {t.selectedAddon.name} (₹
                        {t.selectedAddon.price || 0})
                      </p>
                    )}
                    {t.boardingPoint && (
                      <p>
                        Boarding: {t.boardingPoint.stationName} (
                        {t.boardingPoint.stationCode})
                      </p>
                    )}
                    {t.deboardingPoint && (
                      <p>
                        Deboarding: {t.deboardingPoint.stationName} (
                        {t.deboardingPoint.stationCode})
                      </p>
                    )}
                    <p>Remarks: {t.remarks || "—"}</p>
                    {(t.cancelled?.byTraveller || t.cancelled?.byAdmin) && (
                      <p className="text-red-600">
                        Cancelled by{" "}
                        {t.cancelled.byAdmin ? "Admin" : "Traveller"}
                      </p>
                    )}
                  </div>
                )) || <p className="text-gray-500">No travellers</p>}
              </div>
            </div>

            {/* Payment */}
            <div>
              <h4 className="font-semibold mb-2">Payment Details</h4>
              <p>
                Advance: ₹{booking.payment?.advance?.amount || 0} —{" "}
                {booking.payment?.advance?.paid
                  ? `Paid ${formatDate(booking.payment.advance.paidAt)}`
                  : "Pending"}
                {booking.payment?.advance?.paymentVerified && " (Verified)"}
              </p>
              <p>
                Balance: ₹{booking.payment?.balance?.amount || 0} —{" "}
                {booking.payment?.balance?.paid
                  ? `Paid ${formatDate(booking.payment.balance.paidAt)}`
                  : "Pending"}
                {booking.payment?.balance?.paymentVerified && " (Verified)"}
              </p>
            </div>

            {/* Receipts */}
            <div>
              <h4 className="font-semibold mb-2">Receipts</h4>
              <p>
                Advance:{" "}
                {booking.receipts?.advanceReceiptSent
                  ? `Sent ${formatDate(booking.receipts.advanceReceiptSentAt)}`
                  : "Not Sent"}
              </p>
              <p>
                Balance:{" "}
                {booking.receipts?.balanceReceiptSent
                  ? `Sent ${formatDate(booking.receipts.balanceReceiptSentAt)}`
                  : "Not Sent"}
              </p>
            </div>

            {/* Advance Admin Remarks */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Advance Admin Remarks
              </h4>
              {booking.advanceAdminRemarks?.length > 0 ? (
                <div className="space-y-2">
                  {booking.advanceAdminRemarks.map((r, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-3 rounded text-xs border border-gray-200"
                    >
                      <p className="font-medium">{r.remark || "—"}</p>

                      {/* Show amount always — with color based on sign */}
                      {r.amount !== undefined && r.amount !== null && (
                        <p
                          className={`font-medium ${
                            Number(r.amount) > 0
                              ? "text-green-700"
                              : Number(r.amount) < 0
                                ? "text-red-700"
                                : "text-gray-700"
                          }`}
                        >
                          Amount: ₹{Number(r.amount).toLocaleString("en-IN")}
                        </p>
                      )}

                      <p className="text-gray-500 mt-1">
                        Added: {formatDate(r.addedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No advance admin remarks</p>
              )}
            </div>

            {/* Admin Remarks – same improvement */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Admin Remarks
              </h4>
              {booking.adminRemarks?.length > 0 ? (
                <div className="space-y-2">
                  {booking.adminRemarks.map((r, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-3 rounded text-xs border border-gray-200"
                    >
                      <p className="font-medium">{r.remark || "—"}</p>

                      {r.amount !== undefined && r.amount !== null && (
                        <p
                          className={`font-medium ${
                            Number(r.amount) > 0
                              ? "text-green-700"
                              : Number(r.amount) < 0
                                ? "text-red-700"
                                : "text-gray-700"
                          }`}
                        >
                          Amount: ₹{Number(r.amount).toLocaleString("en-IN")}
                        </p>
                      )}

                      <p className="text-gray-500 mt-1">
                        Added: {formatDate(r.addedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No admin remarks</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, category, type, color, Icon }) => {
    const items = categorized[category] || [];
    const visible = showMore[category] ? items : items.slice(0, 5);

    return (
      <section className="mb-10 sm:mb-12 bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow border">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 text-gray-900">
          <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${color}`} />
          {title}
          <span className="text-gray-500 text-lg sm:text-xl ml-2 sm:ml-3">
            ({items.length})
          </span>
        </h2>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-10 sm:py-12 text-base sm:text-lg">
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
                  color={color}
                />
              ))}
            </div>

            {items.length > 5 && (
              <button
                onClick={() => toggleShowMore(category)}
                className="mt-6 sm:mt-8 mx-auto block px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition"
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

  if (!ttoken) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg sm:text-xl text-gray-600 bg-gray-50 px-4">
        Please login to view your pending tasks.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        theme="light"
        limit={3}
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-14 text-gray-900">
          Task Dashboard
        </h1>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24">
            <Loader2 className="w-14 h-14 sm:w-16 sm:h-16 animate-spin text-blue-600 mb-5 sm:mb-6" />
            <p className="text-lg sm:text-xl text-gray-600 text-center px-4">
              Loading pending tasks...
            </p>
          </div>
        ) : totalPendingTasks === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 sm:p-10 text-center text-gray-600 text-lg sm:text-xl">
            No pending tasks across any tours right now.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow text-center border hover:shadow-md transition"
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}
                  >
                    <m.Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${m.color}`} />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {m.value}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            <Section
              title="Advance Receipts Pending"
              category="advanceReceipt"
              type="advance"
              color="text-green-600"
              Icon={IndianRupee}
            />

            <Section
              title="Balance Receipts Pending"
              category="balanceReceipt"
              type="balance"
              color="text-yellow-600"
              Icon={Receipt}
            />

            <Section
              title="Modified Receipts Pending"
              category="modifyReceipt"
              type="modify"
              color="text-purple-600"
              Icon={FileText}
            />

            <Section
              title="Booking Completion Pending"
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
