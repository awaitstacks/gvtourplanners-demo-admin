// import React, { useContext, useEffect, useState, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const TourAdminDashboard = () => {
//   const { bookings, getAllBookings, cancelBooking, releaseBooking } =
//     useContext(TourAdminContext);
//   const [expanded, setExpanded] = useState({}); // category-scoped
//   const [isLoading, setIsLoading] = useState(false);
//   const location = useLocation();

//   // Clear toasts on route change
//   useEffect(() => {
//     return () => {
//       toast.dismiss();
//     };
//   }, [location]);

//   // Fetch bookings
//   useEffect(() => {
//     console.log(
//       "Fetching all bookings at",
//       new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//     );
//     setIsLoading(true);
//     getAllBookings()
//       .then((response) => {
//         handleApiResponse(
//           response,
//           "Bookings fetched successfully",
//           "Failed to fetch bookings"
//         );
//       })
//       .catch((error) => {
//         console.error(
//           "Fetch bookings error at",
//           new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//           error
//         );
//         toast.error(
//           error.response?.data?.message ||
//             error.message ||
//             "Failed to fetch bookings"
//         );
//       })
//       .finally(() => setIsLoading(false));
//   }, [getAllBookings]);

//   // Handle API responses
//   const handleApiResponse = useCallback(
//     (response, successMessage, errorMessage) => {
//       console.log(
//         "API Response at",
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//         response
//       );
//       if (response && typeof response === "object" && "success" in response) {
//         if (response.success) {
//           toast.success(successMessage || "Operation completed successfully");
//           return true;
//         } else {
//           toast.error(response.message || errorMessage || "Operation failed");
//           return false;
//         }
//       } else {
//         toast.error("Invalid response from server");
//         return false;
//       }
//     },
//     []
//   );

//   // Define filters dynamically
//   const filters = {
//     advance: (b) =>
//       (b.payment?.advance?.paid &&
//         !b.payment?.balance?.paid &&
//         !b.receipts?.advanceReceiptSent &&
//         b.travellers?.some(
//           (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//         )) ||
//       (b.payment?.advance?.paid &&
//         b.payment?.balance?.paid &&
//         !b.receipts?.advanceReceiptSent &&
//         b.travellers?.some(
//           (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//         )),
//     balance: (b) =>
//       b.payment?.advance?.paid &&
//       b.payment?.balance?.paid &&
//       !b.receipts?.balanceReceiptSent &&
//       b.travellers?.some(
//         (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//       ),
//     completion: (b) =>
//       b.payment?.advance?.paid &&
//       b.payment?.balance?.paid &&
//       b.receipts?.advanceReceiptSent &&
//       b.receipts?.balanceReceiptSent &&
//       !b.isBookingCompleted,
//     cancellation: (b) =>
//       b.travellers?.some(
//         (t) => t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//       ),
//     modifyReceipt: (b) =>
//       b.isTripCompleted &&
//       b.travellers?.some(
//         (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//       ), // New filter for modified receipts
//   };

//   // Classify bookings into buckets
//   const categorized = {
//     advance: bookings.filter(filters.advance),
//     balance: bookings.filter(filters.balance),
//     completion: bookings.filter(filters.completion),
//     cancellation: bookings.filter(filters.cancellation),
//     modifyReceipt: bookings.filter(filters.modifyReceipt), // New category
//   };

//   // Dashboard Metrics
//   const totalTravellers = bookings.reduce((count, b) => {
//     if (
//       b.payment?.advance?.paid &&
//       b.payment?.balance?.paid &&
//       b.isBookingCompleted
//     ) {
//       const validTravellers =
//         b.travellers?.filter(
//           (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//         ) || [];
//       return count + validTravellers.length;
//     }
//     return count;
//   }, 0);

//   const uniqueUsers = new Set(
//     bookings.map((b) => b.userData?._id || b.contact?.email)
//   ).size;

//   // Toggle expand state per category + booking id
//   const toggleExpand = (category, id) => {
//     setExpanded((prev) => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [id]: !prev[category]?.[id],
//       },
//     }));
//   };

//   // Handle cancellation actions
//   const handleCancelBooking = async (bookingId, travellerId) => {
//     const confirm = window.confirm(
//       "Are you sure you want to approve this cancellation?"
//     );
//     if (!confirm) return;

//     setIsLoading(true);
//     try {
//       console.log(
//         `Approving cancellation for booking ${bookingId}, traveller ${travellerId} at`,
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//       );
//       const response = await cancelBooking(bookingId, [travellerId]);
//       handleApiResponse(
//         response,
//         "Cancellation approved successfully",
//         "Failed to approve cancellation"
//       );
//     } catch (error) {
//       console.error(
//         "Cancel booking error at",
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//         error
//       );
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to approve cancellation"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle release (reject cancellation) actions
//   const handleReleaseBooking = async (bookingId, travellerId) => {
//     const confirm = window.confirm(
//       "Are you sure you want to reject this cancellation request?"
//     );
//     if (!confirm) return;

//     setIsLoading(true);
//     try {
//       console.log(
//         `Rejecting cancellation for booking ${bookingId}, traveller ${travellerId} at`,
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//       );
//       const response = await releaseBooking(bookingId, [travellerId]);
//       handleApiResponse(
//         response,
//         "Cancellation request rejected successfully",
//         "Failed to reject cancellation"
//       );
//     } catch (error) {
//       console.error(
//         "Release booking error at",
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//         error
//       );
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to reject cancellation"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Reusable Booking Item
//   const BookingItem = ({ booking, category, statusLabel, statusColor }) => {
//     // Get the first traveller's name, fallback to "Unknown Traveller" if none
//     const firstTraveller =
//       booking.travellers && booking.travellers.length > 0
//         ? booking.travellers[0]
//         : null;
//     const displayName = firstTraveller
//       ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
//       : "Unknown Traveller";
//     return (
//       <li
//         key={booking._id}
//         className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border"
//       >
//         <div
//           className="flex justify-between items-center cursor-pointer"
//           onClick={() => toggleExpand(category, booking._id)}
//         >
//           <span className="text-sm sm:text-base md:text-lg">
//             {booking.tourData?.title || "Untitled Tour"} —{" "}
//             <strong>{displayName}</strong>{" "}
//           </span>
//           <span
//             className={`font-medium text-xs sm:text-sm md:text-base ${statusColor}`}
//           >
//             {statusLabel}
//           </span>
//         </div>

//         {expanded[category]?.[booking._id] && (
//           <div className="mt-2 sm:mt-3 md:mt-4 border-t pt-2 sm:pt-3 md:pt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
//             <p>
//               <strong>Booking ID:</strong> {booking._id}
//             </p>
//             <p>
//               <strong>Email:</strong> {booking.contact?.email}
//             </p>
//             <p>
//               <strong>Mobile:</strong> {booking.contact?.mobile}
//             </p>
//             <p>
//               <strong>Advance Paid:</strong>{" "}
//               {booking.payment?.advance?.paid ? "Yes" : "No"}
//             </p>
//             <p>
//               <strong>Balance Paid:</strong>{" "}
//               {booking.payment?.balance?.paid ? "Yes" : "No"}
//             </p>
//             <p>
//               <strong>Is receipt modified</strong>{" "}
//               {booking.isTripCompleted ? "Yes" : "No"}
//             </p>

//             <div>
//               <h4 className="font-semibold mb-1 text-sm sm:text-base">
//                 Travellers
//               </h4>
//               <ul className="space-y-1 sm:space-y-2">
//                 {booking.travellers?.map((t, i) => (
//                   <li
//                     key={i}
//                     className="flex justify-between border p-1 sm:p-2 rounded text-xs sm:text-sm"
//                   >
//                     <span>
//                       {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
//                       {t.gender})
//                     </span>
//                     <span className="text-xs sm:text-sm text-gray-500">
//                       {t.sharingType} sharing
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         )}
//       </li>
//     );
//   };

//   return (
//     <div className="p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8 ml-2 sm:ml-4 md:ml-6 lg:ml-8 xl:ml-10 2xl:ml-12">
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />

//       <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center ml-10 sm:ml-0 md:ml-0 lg:ml-0 xl:ml-0 2xl:ml-0">
//         Super Admin Dashboard
//       </h1>

//       {isLoading ? (
//         <div className="text-center text-gray-500 text-sm sm:text-base md:text-lg">
//           Loading...
//         </div>
//       ) : bookings.length === 0 ? (
//         <div className="text-center text-gray-500 text-sm sm:text-base md:text-lg">
//           No bookings found.
//         </div>
//       ) : (
//         <>
//           {/* Dashboard Metrics */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
//             <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
//                 <span className="text-blue-500 text-lg sm:text-xl">👥</span>
//               </div>
//               <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
//                 {totalTravellers}
//               </p>
//               <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                 Total Travellers
//               </p>
//             </div>
//             <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
//                 <span className="text-indigo-500 text-lg sm:text-xl">🧑</span>
//               </div>
//               <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
//                 {uniqueUsers}
//               </p>
//               <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                 Total users
//               </p>
//             </div>
//             <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
//                 <span className="text-green-500 text-lg sm:text-xl">💰</span>
//               </div>
//               <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
//                 {categorized.advance.length}
//               </p>
//               <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                 Advance Pending
//               </p>
//             </div>
//             <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
//                 <span className="text-yellow-500 text-lg sm:text-xl">💸</span>
//               </div>
//               <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
//                 {categorized.balance.length}
//               </p>
//               <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                 Balance Pending
//               </p>
//             </div>
//             <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
//                 <span className="text-orange-500 text-lg sm:text-xl">✅</span>
//               </div>
//               <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
//                 {categorized.completion.length}
//               </p>
//               <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                 Completion Pending
//               </p>
//             </div>
//             <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
//                 <span className="text-red-500 text-lg sm:text-xl">❌</span>
//               </div>
//               <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
//                 {categorized.cancellation.length}
//               </p>
//               <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                 Cancellation Requests
//               </p>
//             </div>
//             <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border text-center">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
//                 <span className="text-purple-500 text-lg sm:text-xl">📝</span>
//               </div>
//               <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
//                 {categorized.modifyReceipt.length}
//               </p>
//               <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                 Modified Receipts
//               </p>
//             </div>
//           </div>

//           {/* Advance Receipt */}
//           <section className="mb-4 sm:mb-6 md:mb-8">
//             <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
//               Advance Receipt Pending ({categorized.advance.length})
//             </h2>
//             {categorized.advance.length === 0 ? (
//               <p className="text-gray-500 text-sm sm:text-base md:text-lg">
//                 No pending advance receipts.
//               </p>
//             ) : (
//               <ul className="space-y-2 sm:space-y-3 md:space-y-4">
//                 {categorized.advance.map((b) => (
//                   <BookingItem
//                     key={b._id}
//                     booking={b}
//                     category="advance"
//                     statusLabel="Pending Advance Receipt"
//                     statusColor="text-red-600"
//                   />
//                 ))}
//               </ul>
//             )}
//           </section>

//           {/* Balance Receipt */}
//           <section className="mb-4 sm:mb-6 md:mb-8">
//             <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
//               Balance Receipt Pending ({categorized.balance.length})
//             </h2>
//             {categorized.balance.length === 0 ? (
//               <p className="text-gray-500 text-sm sm:text-base md:text-lg">
//                 No pending balance receipts.
//               </p>
//             ) : (
//               <ul className="space-y-2 sm:space-y-3 md:space-y-4">
//                 {categorized.balance.map((b) => (
//                   <BookingItem
//                     key={b._id}
//                     booking={b}
//                     category="balance"
//                     statusLabel="Pending Balance Receipt"
//                     statusColor="text-red-600"
//                   />
//                 ))}
//               </ul>
//             )}
//           </section>

//           {/* Modified Receipts */}
//           <section className="mb-4 sm:mb-6 md:mb-8">
//             <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
//               Modified Receipts Pending ({categorized.modifyReceipt.length})
//             </h2>
//             {categorized.modifyReceipt.length === 0 ? (
//               <p className="text-gray-500 text-sm sm:text-base md:text-lg">
//                 No modified receipts pending.
//               </p>
//             ) : (
//               <ul className="space-y-2 sm:space-y-3 md:space-y-4">
//                 {categorized.modifyReceipt.map((b) => (
//                   <BookingItem
//                     key={b._id}
//                     booking={b}
//                     category="modifyReceipt"
//                     statusLabel="Modified Receipt Pending"
//                     statusColor="text-purple-600"
//                   />
//                 ))}
//               </ul>
//             )}
//           </section>

//           {/* Completion */}
//           <section className="mb-4 sm:mb-6 md:mb-8">
//             <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
//               Booking Completion Actions ({categorized.completion.length})
//             </h2>
//             {categorized.completion.length === 0 ? (
//               <p className="text-gray-500 text-sm sm:text-base md:text-lg">
//                 All bookings are completed.
//               </p>
//             ) : (
//               <ul className="space-y-2 sm:space-y-3 md:space-y-4">
//                 {categorized.completion.map((b) => (
//                   <BookingItem
//                     key={b._id}
//                     booking={b}
//                     category="completion"
//                     statusLabel="Pending Completion"
//                     statusColor="text-orange-600"
//                   />
//                 ))}
//               </ul>
//             )}
//           </section>

//           {/* Cancellation */}
//           <section>
//             <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-2 sm:mb-4">
//               Cancellation Request Actions ({categorized.cancellation.length})
//             </h2>
//             {categorized.cancellation.length === 0 ? (
//               <p className="text-gray-500 text-sm sm:text-base md:text-lg">
//                 No cancellation requests.
//               </p>
//             ) : (
//               <ul className="space-y-2 sm:space-y-3 md:space-y-4">
//                 {categorized.cancellation.map((b) => {
//                   // Get the first traveller's name, fallback to "Unknown Traveller" if none
//                   const firstTraveller =
//                     b.travellers && b.travellers.length > 0
//                       ? b.travellers[0]
//                       : null;
//                   const displayName = firstTraveller
//                     ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
//                     : "Unknown Traveller";
//                   return (
//                     <li
//                       key={b._id}
//                       className="p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow border"
//                     >
//                       <div
//                         className="flex justify-between cursor-pointer items-center"
//                         onClick={() => toggleExpand("cancellation", b._id)}
//                       >
//                         <p className="font-semibold text-sm sm:text-base md:text-lg">
//                           {b.tourData?.title || "Untitled Tour"} —{" "}
//                           <strong>{displayName}</strong>{" "}
//                         </p>
//                         <span className="text-red-600 font-medium text-xs sm:text-sm md:text-base">
//                           Cancellation Request
//                         </span>
//                       </div>

//                       {expanded["cancellation"]?.[b._id] && (
//                         <div className="mt-2 sm:mt-3 md:mt-4 border-t pt-2 sm:pt-3 md:pt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
//                           <p>
//                             <strong>Booking ID:</strong> {b._id}
//                           </p>
//                           <h4 className="font-semibold mb-1 text-sm sm:text-base">
//                             Travellers Requested
//                           </h4>
//                           {b.travellers
//                             .filter(
//                               (t) =>
//                                 t.cancelled?.byTraveller &&
//                                 !t.cancelled?.byAdmin
//                             )
//                             .map((t, i) => (
//                               <div
//                                 key={i}
//                                 className="flex flex-col sm:flex-row justify-between items-center border p-1 sm:p-2 md:p-3 rounded mb-1 sm:mb-2"
//                               >
//                                 <span className="text-xs sm:text-sm md:text-base">
//                                   {t.firstName} {t.lastName} ({t.age} yrs)
//                                 </span>
//                                 <span className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-0">
//                                   {t.sharingType} sharing
//                                 </span>

//                                 <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 space-x-0 sm:space-x-2 w-full sm:w-auto">
//                                   <button
//                                     onClick={() =>
//                                       handleCancelBooking(b._id, t._id)
//                                     }
//                                     disabled={isLoading}
//                                     className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 ${
//                                       isLoading
//                                         ? "opacity-50 cursor-not-allowed"
//                                         : ""
//                                     } w-full sm:w-auto`}
//                                   >
//                                     {isLoading
//                                       ? "Processing..."
//                                       : "Approve Cancellation"}
//                                   </button>
//                                   <button
//                                     onClick={() =>
//                                       handleReleaseBooking(b._id, t._id)
//                                     }
//                                     disabled={isLoading}
//                                     className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 ${
//                                       isLoading
//                                         ? "opacity-50 cursor-not-allowed"
//                                         : ""
//                                     } w-full sm:w-auto`}
//                                   >
//                                     {isLoading
//                                       ? "Processing..."
//                                       : "Reject Cancellation"}
//                                   </button>
//                                 </div>
//                               </div>
//                             ))}
//                         </div>
//                       )}
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}
//           </section>
//         </>
//       )}
//     </div>
//   );
// };

// export default TourAdminDashboard;
import React, { useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
} from "lucide-react";

const TourAdminDashboard = () => {
  const { bookings, getAllBookings, cancelBooking, releaseBooking } =
    useContext(TourAdminContext);
  const [expanded, setExpanded] = useState({});
  const [showMore, setShowMore] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    return () => toast.dismiss();
  }, [location]);

  useEffect(() => {
    setIsLoading(true);
    getAllBookings()
      .then((response) => {
        if (response?.success) {
          toast.success("Bookings fetched successfully");
        } else {
          toast.error(response?.message || "Failed to fetch bookings");
        }
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch bookings"
        );
      })
      .finally(() => setIsLoading(false));
  }, [getAllBookings]);

  const handleApiResponse = useCallback(
    (response, successMessage, errorMessage) => {
      if (response?.success) {
        toast.success(successMessage || "Operation completed successfully");
        return true;
      } else {
        toast.error(response?.message || errorMessage || "Operation failed");
        return false;
      }
    },
    []
  );

  const filters = {
    advance: (b) =>
      (b.payment?.advance?.paid &&
        !b.payment?.balance?.paid &&
        !b.receipts?.advanceReceiptSent &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
        )) ||
      (b.payment?.advance?.paid &&
        b.payment?.balance?.paid &&
        !b.receipts?.advanceReceiptSent &&
        b.travellers?.some(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
        )),
    balance: (b) =>
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      !b.receipts?.balanceReceiptSent &&
      b.travellers?.some(
        (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
      ),
    completion: (b) =>
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      b.receipts?.advanceReceiptSent &&
      b.receipts?.balanceReceiptSent &&
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

  // const handleCancelBooking = async (bookingId, travellerId) => {
  //   if (!window.confirm("Approve this cancellation?")) return;
  //   setIsLoading(true);
  //   try {
  //     const res = await cancelBooking(bookingId, [travellerId]);
  //     handleApiResponse(res, "Cancellation approved", "Failed to approve");
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Error");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleReleaseBooking = async (bookingId, travellerId) => {
    if (!window.confirm("Reject this cancellation request?")) return;
    setIsLoading(true);
    try {
      const res = await releaseBooking(bookingId, [travellerId]);
      handleApiResponse(res, "Cancellation rejected", "Failed to reject");
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
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
        onClick={() => toggleExpand(category, booking._id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
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
          <span
            className={`text-xs font-medium ${statusColor} px-2 py-1 rounded-full bg-opacity-10`}
          >
            {statusLabel}
          </span>
        </div>

        {expanded[category]?.[booking._id] && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm text-gray-700">
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
                title="Copy"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p>
                <strong>Email:</strong> {booking.contact?.email || "—"}
              </p>
              <p>
                <strong>Mobile:</strong> {booking.contact?.mobile || "—"}
              </p>
              <p>
                <strong>Advance:</strong>{" "}
                <span
                  className={
                    booking.payment?.advance?.paid
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {booking.payment?.advance?.paid ? "Paid" : "Pending"}
                </span>
              </p>
              <p>
                <strong>Balance:</strong>{" "}
                <span
                  className={
                    booking.payment?.balance?.paid
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {booking.payment?.balance?.paid ? "Paid" : "Pending"}
                </span>
              </p>
              <p>
                <strong>Receipt Modified:</strong>{" "}
                {booking.isTripCompleted ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm flex items-center gap-1">
                <Users className="w-4 h-4" /> Travellers
              </h4>
              <div className="space-y-1">
                {booking.travellers?.map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between bg-gray-50 p-2 rounded text-xs"
                  >
                    <span>
                      {t.title} {t.firstName} {t.lastName} ({t.age} yrs)
                    </span>
                    <span className="text-gray-500">
                      {t.sharingType} sharing
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
                title="Copy"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <h4 className="font-semibold mb-2 text-sm flex items-center gap-1">
              <User className="w-4 h-4" /> Travellers Requested
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
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelBooking(booking._id, t._id);
                      }}
                      disabled={isLoading}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition ${
                        isLoading ? "opacity-50" : ""
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </button> */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReleaseBooking(booking._id, t._id);
                      }}
                      disabled={isLoading}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition ${
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
                </div>
              ))}
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
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-10">
          Super Admin Dashboard
        </h1>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600" />
            <p className="mt-4 text-gray-600 text-lg">Loading...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">No bookings found.</p>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-10">
              {[
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
              ].map((s, i) => (
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
          </>
        )}
      </div>
    </div>
  );
};

export default TourAdminDashboard;
