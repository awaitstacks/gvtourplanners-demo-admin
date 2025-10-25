// import { useEffect, useContext, useState, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import { TourContext } from "../../context/TourContext";
// import { ChevronDown, ChevronUp, CheckCircle, Copy } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const TourBookings = () => {
//   const {
//     tourList,
//     getTourList,
//     bookings,
//     getBookings,
//     markAdvancePaid,
//     markBalancePaid,
//     completeBooking,
//     ttoken,
//   } = useContext(TourContext);

//   const [expanded, setExpanded] = useState(null);
//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [isLoadingBookings, setIsLoadingBookings] = useState(false);
//   const location = useLocation();

//   // Fetch the list of all tours when the component mounts
//   useEffect(() => {
//     if (ttoken) {
//       getTourList();
//     }
//   }, [ttoken, getTourList]);

//   // Fetch bookings for the selected tour whenever selectedTourId changes
//   useEffect(() => {
//     if (ttoken && selectedTourId) {
//       setIsLoadingBookings(true);
//       getBookings(selectedTourId)
//         .then((response) => {
//           if (
//             response &&
//             typeof response === "object" &&
//             "success" in response
//           ) {
//             if (response.success) {
//               toast.success("Bookings fetched successfully");
//             } else {
//               toast.error(response.message || "Failed to fetch bookings");
//             }
//           } else {
//             toast.error("Invalid response from server");
//           }
//         })
//         .catch((error) => {
//           console.error("getBookings error:", error);
//           toast.error(
//             error.response?.data?.message ||
//               error.message ||
//               "Failed to fetch bookings"
//           );
//         })
//         .finally(() => {
//           setIsLoadingBookings(false);
//         });
//     } else {
//       setIsLoadingBookings(false);
//     }
//   }, [ttoken, selectedTourId, getBookings]);

//   // Clear toasts on component unmount or route change
//   useEffect(() => {
//     return () => {
//       toast.dismiss(); // Dismiss all toasts when leaving the page
//     };
//   }, [location]);

//   const toggleExpand = (id) => {
//     setExpanded(expanded === id ? null : id);
//   };

//   const handleTourChange = (e) => {
//     setSelectedTourId(e.target.value);
//   };

//   // Handle API responses with toast notifications
//   const handleApiResponse = useCallback(
//     (response, successMessage) => {
//       console.log("API Response:", response); // Debug log
//       if (response && typeof response === "object" && "success" in response) {
//         if (response.success) {
//           toast.success(successMessage || "Operation completed successfully");
//           if (selectedTourId) {
//             getBookings(selectedTourId); // Refresh bookings on success
//           }
//         } else {
//           toast.error(
//             response.message || "An error occurred during the operation"
//           );
//         }
//       } else {
//         toast.error("Invalid response from server");
//       }
//     },
//     [selectedTourId, getBookings]
//   );

//   const handleMarkAdvancePaid = async (bookingId, tourId) => {
//     try {
//       const response = await markAdvancePaid(bookingId, tourId);
//       handleApiResponse(response, "Advance payment marked successfully");
//     } catch (error) {
//       console.error("markAdvancePaid error:", error);
//       toast.error("Failed to mark advance payment: " + error.message);
//     }
//   };

//   const handleMarkBalancePaid = async (bookingId, tourId) => {
//     if (!tourId) {
//       toast.error("Please select a tour first.");
//       return;
//     }
//     try {
//       const response = await markBalancePaid(bookingId, tourId);
//       handleApiResponse(response, "Balance payment marked successfully");
//     } catch (error) {
//       console.error("markBalancePaid error:", error);
//       toast.error("Failed to mark balance payment: " + error.message);
//     }
//   };

//   const handleCompleteBooking = async (bookingId, tourId) => {
//     const confirm = window.confirm(
//       "Are you sure you want to mark this booking as completed?"
//     );
//     if (!confirm) return;
//     try {
//       const response = await completeBooking(bookingId, tourId);
//       handleApiResponse(response, "Booking marked as completed successfully");
//     } catch (error) {
//       console.error("completeBooking error:", error);
//       toast.error("Failed to complete booking: " + error.message);
//     }
//   };

//   // Handle copying bookingId to clipboard
//   const handleCopyBookingId = (bookingId) => {
//     navigator.clipboard
//       .writeText(bookingId)
//       .then(() => {
//         toast.success("Booking ID copied to clipboard!");
//       })
//       .catch((err) => {
//         console.error("Failed to copy booking ID:", err);
//         toast.error("Failed to copy booking ID");
//       });
//   };

//   // Filter and sort bookings
//   const activeBookings = bookings
//     .filter(
//       (booking) =>
//         !booking.isBookingCompleted &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin || traveller.cancelled?.byTraveller
//         )
//     )
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const completedBookings = bookings
//     .filter(
//       (booking) =>
//         booking.isBookingCompleted &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin || traveller.cancelled?.byTraveller
//         )
//     )
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const cancellationRequestBookings = bookings
//     .filter(
//       (booking) =>
//         booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byTraveller && !traveller.cancelled?.byAdmin
//         ) &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin && traveller.cancelled?.byTraveller
//         ) &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin && !traveller.cancelled?.byTraveller
//         )
//     )
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const rejectedByAdminBookings = bookings
//     .filter(
//       (booking) =>
//         booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin && !traveller.cancelled?.byTraveller
//         ) &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin && traveller.cancelled?.byTraveller
//         ) &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byTraveller && !traveller.cancelled?.byAdmin
//         )
//     )
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const cancelledByTravellerBookings = bookings
//     .filter(
//       (booking) =>
//         booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin && traveller.cancelled?.byTraveller
//         ) &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byTraveller && !traveller.cancelled?.byAdmin
//         ) &&
//         !booking.travellers.some(
//           (traveller) =>
//             traveller.cancelled?.byAdmin && !traveller.cancelled?.byTraveller
//         )
//     )
//     .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

//   const renderBookingCard = (booking, category) => {
//     const isExpanded = expanded === booking._id;
//     // Get the first traveller's name, fallback to "Unknown Traveller" if none
//     const firstTraveller =
//       booking.travellers && booking.travellers.length > 0
//         ? booking.travellers[0]
//         : null;
//     const displayName = firstTraveller
//       ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
//       : "Unknown Traveller";
//     return (
//       <div
//         key={booking._id}
//         className="bg-white rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto"
//       >
//         {/* Row Header */}
//         <div
//           className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
//           onClick={() => toggleExpand(booking._id)}
//         >
//           <div className="w-full sm:w-auto">
//             <p className="font-semibold text-base sm:text-lg">
//               <strong>{displayName}</strong>
//             </p>
//             <p className="text-xs sm:text-sm text-gray-600 truncate">
//               {booking.userId?.email || "No email"} |{" "}
//               {booking.userId?.phone || "No phone"}
//             </p>
//             <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
//               <span
//                 className={`px-2 py-1 rounded-lg text-xs font-medium ${
//                   booking.payment.advance.paid
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-600"
//                 }`}
//               >
//                 Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
//               </span>
//               <span
//                 className={`px-2 py-1 rounded-lg text-xs font-medium ${
//                   booking.payment.balance.paid
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-600"
//                 }`}
//               >
//                 Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
//               </span>
//             </div>
//             {category === "rejected" && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
//                 Rejected by Admin
//               </span>
//             )}
//             {category === "cancellationRequest" && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
//                 Cancellation Request
//               </span>
//             )}
//             {category === "cancelledByTraveller" && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
//                 Cancelled by Traveller
//               </span>
//             )}
//             {category === "completed" && (
//               <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
//                 Completed
//               </span>
//             )}
//             {/* Booking ID and Type */}
//             <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
//               <span className="text-gray-600">Booking ID: {booking._id}</span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCopyBookingId(booking._id);
//                 }}
//                 className="text-blue-500 hover:text-blue-700 focus:outline-none flex items-center"
//                 title="Copy Booking ID"
//               >
//                 <Copy size={14} />
//               </button>
//               <span className="text-gray-600">
//                 | Type: {booking.bookingType}
//               </span>
//             </div>
//           </div>

//           {/* Actions Section */}
//           <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
//             {category === "rejected" ||
//             category === "cancelledByTraveller" ||
//             category === "cancellationRequest" ? (
//               <button
//                 disabled
//                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
//               >
//                 <CheckCircle size={16} />
//                 Cancelled Booking
//               </button>
//             ) : booking.isBookingCompleted ? (
//               <button
//                 disabled
//                 className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
//               >
//                 <CheckCircle size={16} />
//                 Booking Completed
//               </button>
//             ) : (
//               <>
//                 {/* Payment buttons for offline bookings */}
//                 {booking.bookingType === "offline" && (
//                   <>
//                     {!booking.payment.advance.paid && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleMarkAdvancePaid(booking._id, selectedTourId);
//                         }}
//                         className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[120px] sm:min-w-[140px]"
//                       >
//                         <CheckCircle size={16} />
//                         Mark Advance
//                       </button>
//                     )}
//                     {booking.payment.advance.paid &&
//                       !booking.payment.balance.paid && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleMarkBalancePaid(booking._id, selectedTourId);
//                           }}
//                           className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-w-[120px] sm:min-w-[140px]"
//                         >
//                           <CheckCircle size={16} />
//                           Mark Balance
//                         </button>
//                       )}
//                   </>
//                 )}
//                 {/* Mark as Booking Complete button for all bookings */}
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCompleteBooking(booking._id, selectedTourId);
//                   }}
//                   className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[120px] sm:min-w-[140px]"
//                 >
//                   <CheckCircle size={16} />
//                   Mark Complete
//                 </button>
//               </>
//             )}
//             {isExpanded ? (
//               <ChevronUp className="text-gray-500 w-5 h-5" />
//             ) : (
//               <ChevronDown className="text-gray-500 w-5 h-5" />
//             )}
//           </div>
//         </div>

//         {/* Expanded Details */}
//         {isExpanded && (
//           <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
//             {/* Booking Info */}
//             <div>
//               <p>
//                 <span className="font-medium">Tour title:</span>{" "}
//                 {booking?.tourData?.title}
//               </p>
//               <p>
//                 <span className="font-medium">Booking Date:</span>{" "}
//                 {new Date(booking.bookingDate).toLocaleDateString()}
//               </p>
//               <p>
//                 <span className="font-medium">Booking Type:</span>{" "}
//                 {booking.bookingType}
//               </p>
//             </div>

//             {/* Contact Info */}
//             <div>
//               <h3 className="font-semibold text-gray-800">Traveller Contact</h3>
//               <p>Email: {booking.contact?.email}</p>
//               <p>Mobile: {booking.contact?.mobile}</p>
//             </div>

//             {/* Billing Address */}
//             {booking.billingAddress && (
//               <div>
//                 <h3 className="font-semibold text-gray-800">Billing Address</h3>
//                 <p>{booking.billingAddress.addressLine1}</p>
//                 {booking.billingAddress.addressLine2 && (
//                   <p>{booking.billingAddress.addressLine2}</p>
//                 )}
//                 <p>
//                   {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
//                   - {booking.billingAddress.pincode}
//                 </p>
//                 <p>{booking.billingAddress.country}</p>
//               </div>
//             )}

//             {/* Travellers List */}
//             {booking.travellers.map((trav, idx) => {
//               let cancellationStatus = null;

//               if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
//                 cancellationStatus = "Cancellation Requested by Traveller";
//               } else if (
//                 trav.cancelled?.byAdmin &&
//                 !trav.cancelled?.byTraveller
//               ) {
//                 cancellationStatus = "Booking Rejected by Admin";
//               } else if (
//                 trav.cancelled?.byTraveller &&
//                 trav.cancelled?.byAdmin
//               ) {
//                 cancellationStatus = "Traveller Cancelled";
//               }

//               return (
//                 <div
//                   key={idx}
//                   className="p-3 bg-white rounded-lg border shadow-sm"
//                 >
//                   <p className="font-medium">
//                     {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
//                     yrs, {trav.gender})
//                   </p>
//                   <p>Package Type: {trav.packageType}</p>
//                   <p>Sharing Type: {trav.sharingType}</p>
//                   {trav.boardingPoint?.stationName && (
//                     <p>
//                       Boarding Point: {trav.boardingPoint.stationName} (
//                       {trav.boardingPoint.stationCode})
//                     </p>
//                   )}
//                   {trav.deboardingPoint?.stationName && (
//                     <p>
//                       Return De-Boarding Point:{" "}
//                       {trav.deboardingPoint.stationName} (
//                       {trav.deboardingPoint.stationCode})
//                     </p>
//                   )}
//                   {trav.selectedAddon?.name && (
//                     <p>
//                       Add-on: {trav.selectedAddon.name} (₹
//                       {trav.selectedAddon.price})
//                     </p>
//                   )}
//                   {trav.remarks && (
//                     <p className="italic text-gray-500">
//                       Remarks: {trav.remarks}
//                     </p>
//                   )}
//                   {/* Cancellation Status */}
//                   {cancellationStatus && (
//                     <p className="text-red-600 font-medium">
//                       {cancellationStatus}
//                     </p>
//                   )}
//                 </div>
//               );
//             })}

//             {/* Payment Details */}
//             {booking.payment && (
//               <div>
//                 <h3 className="font-semibold text-gray-800">Payment Details</h3>
//                 <p>
//                   Advance: ₹{booking.payment.advance.amount} –{" "}
//                   {booking.payment.advance.paid ? "Paid" : "Pending"}{" "}
//                   {booking.payment.advance.paidAt &&
//                     `(at ${new Date(
//                       booking.payment.advance.paidAt
//                     ).toLocaleDateString()})`}
//                 </p>
//                 <p>
//                   Balance: ₹{booking.payment.balance.amount} –{" "}
//                   {booking.payment.balance.paid ? "Paid" : "Pending"}{" "}
//                   {booking.payment.balance.paidAt &&
//                     `(at ${new Date(
//                       booking.payment.balance.paidAt
//                     ).toLocaleDateString()})`}
//                 </p>
//               </div>
//             )}

//             {/* Cancellation Info */}
//             {booking.cancelled?.byAdmin || booking.cancelled?.byTraveller ? (
//               <div className="text-red-600">
//                 <h3 className="font-semibold">Cancelled</h3>
//                 <p>
//                   Cancelled By:{" "}
//                   {booking.cancelled.byAdmin
//                     ? "Admin"
//                     : booking.cancelled.byTraveller
//                     ? "Traveller"
//                     : "Unknown"}
//                 </p>
//                 <p>
//                   At:{" "}
//                   {booking.cancelled.cancelledAt &&
//                     new Date(
//                       booking.cancelled.cancelledAt
//                     ).toLocaleDateString()}
//                 </p>
//                 {booking.cancelled.reason && (
//                   <p>Reason: {booking.cancelled.reason}</p>
//                 )}
//               </div>
//             ) : null}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//       {/* Local ToastContainer for TourBookings */}
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
//         className="text-sm"
//       />

//       <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
//         Bookings
//       </h2>

//       {/* Dropdown Menu for Tour Selection */}
//       <div className="mb-4 sm:mb-6">
//         <label
//           htmlFor="tour-select"
//           className="block text-sm font-medium text-gray-700 mb-1"
//         >
//           Select a Tour:
//         </label>
//         <select
//           id="tour-select"
//           value={selectedTourId}
//           onChange={handleTourChange}
//           className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
//         >
//           <option value="">-- Select a Tour --</option>
//           {tourList.map((tour) => (
//             <option key={tour._id} value={tour._id}>
//               {tour.title}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Conditionally render bookings based on selection and data */}
//       {!selectedTourId ? (
//         <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
//           <p>Please select a tour to view bookings.</p>
//         </div>
//       ) : isLoadingBookings ? (
//         <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
//           <p>Loading bookings...</p>
//         </div>
//       ) : bookings.length === 0 ? (
//         <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
//           <p>No bookings found for this tour.</p>
//         </div>
//       ) : (
//         <>
//           {/* Active Bookings */}
//           {activeBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
//                 Active Bookings
//               </h3>
//               {activeBookings.map((booking) =>
//                 renderBookingCard(booking, "active")
//               )}
//             </div>
//           )}

//           {/* Completed Bookings */}
//           {completedBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
//                 Completed Bookings
//               </h3>
//               {completedBookings.map((booking) =>
//                 renderBookingCard(booking, "completed")
//               )}
//             </div>
//           )}

//           {/* Cancellation Requests */}
//           {cancellationRequestBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
//                 Cancellation Requests
//               </h3>
//               {cancellationRequestBookings.map((booking) =>
//                 renderBookingCard(booking, "cancellationRequest")
//               )}
//             </div>
//           )}

//           {/* Rejected Bookings */}
//           {rejectedByAdminBookings.length > 0 && (
//             <div className="space-y-4 mb-8">
//               <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
//                 Rejected Bookings (by Admin)
//               </h3>
//               {rejectedByAdminBookings.map((booking) =>
//                 renderBookingCard(booking, "rejected")
//               )}
//             </div>
//           )}

//           {/* Cancelled by Traveller */}
//           {cancelledByTravellerBookings.length > 0 && (
//             <div className="space-y-4">
//               <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
//                 Cancellations (by Traveller)
//               </h3>
//               {cancelledByTravellerBookings.map((booking) =>
//                 renderBookingCard(booking, "cancelledByTraveller")
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default TourBookings;

// critical copy do not delete

import { useEffect, useContext, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { ChevronDown, ChevronUp, CheckCircle, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TourBookings = () => {
  const {
    tourList,
    getTourList,
    bookings,
    getBookings,
    markAdvancePaid,
    markBalancePaid,
    completeBooking,
    ttoken,
  } = useContext(TourContext);

  const [expanded, setExpanded] = useState(null);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all"); // "all", "advancePaid", "advancePending", "balancePaid", "balancePending"
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "completed", "rejected", "cancelled"
  const [travellerNameFilter, setTravellerNameFilter] = useState("");
  const location = useLocation();

  // Fetch the list of all tours when the component mounts
  useEffect(() => {
    if (ttoken) {
      getTourList();
    }
  }, [ttoken, getTourList]);

  // Fetch bookings for the selected tour whenever selectedTourId changes
  useEffect(() => {
    if (ttoken && selectedTourId) {
      setIsLoadingBookings(true);
      getBookings(selectedTourId)
        .then((response) => {
          if (
            response &&
            typeof response === "object" &&
            "success" in response
          ) {
            if (response.success) {
              toast.success("Bookings fetched successfully");
            } else {
              toast.error(response.message || "Failed to fetch bookings");
            }
          } else {
            toast.error("Invalid response from server");
          }
        })
        .catch((error) => {
          console.error("getBookings error:", error);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch bookings"
          );
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else {
      setIsLoadingBookings(false);
    }
  }, [ttoken, selectedTourId, getBookings]);

  // Clear toasts on component unmount or route change
  useEffect(() => {
    return () => {
      toast.dismiss(); // Dismiss all toasts when leaving the page
    };
  }, [location]);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleTourChange = (e) => {
    setSelectedTourId(e.target.value);
    // Reset filters when a new tour is selected
    setPaymentFilter("all");
    setStatusFilter("all");
    setTravellerNameFilter("");
  };

  // Handle API responses with toast notifications
  const handleApiResponse = useCallback(
    (response, successMessage) => {
      console.log("API Response:", response); // Debug log
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          toast.success(successMessage || "Operation completed successfully");
          if (selectedTourId) {
            getBookings(selectedTourId); // Refresh bookings on success
          }
        } else {
          toast.error(
            response.message || "An error occurred during the operation"
          );
        }
      } else {
        toast.error("Invalid response from server");
      }
    },
    [selectedTourId, getBookings]
  );

  const handleMarkAdvancePaid = async (bookingId, tourId) => {
    try {
      const response = await markAdvancePaid(bookingId, tourId);
      handleApiResponse(response, "Advance payment marked successfully");
    } catch (error) {
      console.error("markAdvancePaid error:", error);
      toast.error("Failed to mark advance payment: " + error.message);
    }
  };

  const handleMarkBalancePaid = async (bookingId, tourId) => {
    if (!tourId) {
      toast.error("Please select a tour first.");
      return;
    }
    try {
      const response = await markBalancePaid(bookingId, tourId);
      handleApiResponse(response, "Balance payment marked successfully");
    } catch (error) {
      console.error("markBalancePaid error:", error);
      toast.error("Failed to mark balance payment: " + error.message);
    }
  };

  const handleCompleteBooking = async (bookingId, tourId) => {
    const confirm = window.confirm(
      "Are you sure you want to mark this booking as completed?"
    );
    if (!confirm) return;
    try {
      const response = await completeBooking(bookingId, tourId);
      handleApiResponse(response, "Booking marked as completed successfully");
    } catch (error) {
      console.error("completeBooking error:", error);
      toast.error("Failed to complete booking: " + error.message);
    }
  };

  // Handle copying bookingId to clipboard
  const handleCopyBookingId = (bookingId) => {
    navigator.clipboard
      .writeText(bookingId)
      .then(() => {
        toast.success("Booking ID copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy booking ID:", err);
        toast.error("Failed to copy booking ID");
      });
  };

  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter((booking) => {
    const firstTraveller =
      booking.travellers && booking.travellers.length > 0
        ? booking.travellers[0]
        : null;
    const displayName = firstTraveller
      ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
      : "";

    // Payment Filter
    let paymentMatch = true;
    if (paymentFilter !== "all") {
      if (paymentFilter === "advancePaid" && !booking.payment.advance.paid) {
        paymentMatch = false;
      } else if (
        paymentFilter === "advancePending" &&
        booking.payment.advance.paid
      ) {
        paymentMatch = false;
      } else if (
        paymentFilter === "balancePaid" &&
        !booking.payment.balance.paid
      ) {
        paymentMatch = false;
      } else if (
        paymentFilter === "balancePending" &&
        booking.payment.balance.paid
      ) {
        paymentMatch = false;
      }
    }

    // Status Filter
    let statusMatch = true;
    if (statusFilter !== "all") {
      if (statusFilter === "active" && booking.isBookingCompleted) {
        statusMatch = false;
      } else if (statusFilter === "completed" && !booking.isBookingCompleted) {
        statusMatch = false;
      } else if (
        statusFilter === "rejected" &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin && !traveller.cancelled?.byTraveller
        )
      ) {
        statusMatch = false;
      } else if (
        statusFilter === "cancelled" &&
        !booking.travellers.some(
          (traveller) =>
            (traveller.cancelled?.byTraveller &&
              !traveller.cancelled?.byAdmin) ||
            (traveller.cancelled?.byAdmin && traveller.cancelled?.byTraveller)
        )
      ) {
        statusMatch = false;
      }
    }

    // Traveller Name Filter
    let nameMatch = true;
    if (travellerNameFilter) {
      nameMatch = displayName
        .toLowerCase()
        .includes(travellerNameFilter.toLowerCase());
    }

    return paymentMatch && statusMatch && nameMatch;
  });

  // Categorize filtered bookings
  const activeBookings = filteredBookings
    .filter(
      (booking) =>
        !booking.isBookingCompleted &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin || traveller.cancelled?.byTraveller
        )
    )
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const completedBookings = filteredBookings
    .filter(
      (booking) =>
        booking.isBookingCompleted &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin || traveller.cancelled?.byTraveller
        )
    )
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const cancellationRequestBookings = filteredBookings
    .filter(
      (booking) =>
        booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byTraveller && !traveller.cancelled?.byAdmin
        ) &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin && traveller.cancelled?.byTraveller
        ) &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin && !traveller.cancelled?.byTraveller
        )
    )
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const rejectedByAdminBookings = filteredBookings
    .filter(
      (booking) =>
        booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin && !traveller.cancelled?.byTraveller
        ) &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin && traveller.cancelled?.byTraveller
        ) &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byTraveller && !traveller.cancelled?.byAdmin
        )
    )
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const cancelledByTravellerBookings = filteredBookings
    .filter(
      (booking) =>
        booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin && traveller.cancelled?.byTraveller
        ) &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byTraveller && !traveller.cancelled?.byAdmin
        ) &&
        !booking.travellers.some(
          (traveller) =>
            traveller.cancelled?.byAdmin && !traveller.cancelled?.byTraveller
        )
    )
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const renderBookingCard = (booking, category) => {
    const isExpanded = expanded === booking._id;
    // Get the first traveller's name, fallback to "Unknown Traveller" if none
    const firstTraveller =
      booking.travellers && booking.travellers.length > 0
        ? booking.travellers[0]
        : null;
    const displayName = firstTraveller
      ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
      : "Unknown Traveller";
    return (
      <div
        key={booking._id}
        className="bg-white rounded-2xl shadow border overflow-hidden w-full sm:max-w-4xl mx-auto"
      >
        {/* Row Header */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleExpand(booking._id)}
        >
          <div className="w-full sm:w-auto">
            <p className="font-semibold text-base sm:text-lg">
              <strong>{displayName}</strong>
            </p>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {booking.userId?.email || "No email"} |{" "}
              {booking.userId?.phone || "No phone"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  booking.payment.advance.paid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                Advance: {booking.payment.advance.paid ? "Paid" : "Pending"}
              </span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  booking.payment.balance.paid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                Balance: {booking.payment.balance.paid ? "Paid" : "Pending"}
              </span>
            </div>
            {category === "rejected" && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 mt-2 inline-block">
                Rejected by Admin
              </span>
            )}
            {category === "cancellationRequest" && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 mt-2 inline-block">
                Cancellation Request
              </span>
            )}
            {category === "cancelledByTraveller" && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 mt-2 inline-block">
                Cancelled by Traveller
              </span>
            )}
            {category === "completed" && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-2 inline-block">
                Completed
              </span>
            )}
            {/* Booking ID and Type */}
            <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-600">Booking ID: {booking._id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyBookingId(booking._id);
                }}
                className="text-blue-500 hover:text-blue-700 focus:outline-none flex items-center"
                title="Copy Booking ID"
              >
                <Copy size={14} />
              </button>
              <span className="text-gray-600">
                | Type: {booking.bookingType}
              </span>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
            {category === "rejected" ||
            category === "cancelledByTraveller" ||
            category === "cancellationRequest" ? (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
              >
                <CheckCircle size={16} />
                Cancelled Booking
              </button>
            ) : booking.isBookingCompleted ? (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-400 text-white rounded-lg cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
              >
                <CheckCircle size={16} />
                Booking Completed
              </button>
            ) : (
              <>
                {/* Payment buttons for offline bookings */}
                {booking.bookingType === "offline" && (
                  <>
                    {!booking.payment.advance.paid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAdvancePaid(booking._id, selectedTourId);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 min-w-[120px] sm:min-w-[140px]"
                      >
                        <CheckCircle size={16} />
                        Mark Advance
                      </button>
                    )}
                    {booking.payment.advance.paid &&
                      !booking.payment.balance.paid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkBalancePaid(booking._id, selectedTourId);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-w-[120px] sm:min-w-[140px]"
                        >
                          <CheckCircle size={16} />
                          Mark Balance
                        </button>
                      )}
                  </>
                )}
                {/* Mark as Booking Complete button for all bookings */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteBooking(booking._id, selectedTourId);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[120px] sm:min-w-[140px]"
                >
                  <CheckCircle size={16} />
                  Mark Complete
                </button>
              </>
            )}
            {isExpanded ? (
              <ChevronUp className="text-gray-500 w-5 h-5" />
            ) : (
              <ChevronDown className="text-gray-500 w-5 h-5" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="p-4 border-t bg-gray-50 text-xs sm:text-sm text-gray-700 space-y-4">
            {/* Booking Info */}
            <div>
              <p>
                <span className="font-medium">Tour title:</span>{" "}
                {booking?.tourData?.title}
              </p>
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
              <h3 className="font-semibold text-gray-800">Traveller Contact</h3>
              <p>Email: {booking.contact?.email}</p>
              <p>Mobile: {booking.contact?.mobile}</p>
            </div>

            {/* Billing Address */}
            {booking.billingAddress && (
              <div>
                <h3 className="font-semibold text-gray-800">Billing Address</h3>
                <p>{booking.billingAddress.addressLine1}</p>
                {booking.billingAddress.addressLine2 && (
                  <p>{booking.billingAddress.addressLine2}</p>
                )}
                <p>
                  {booking.billingAddress.city}, {booking.billingAddress.state}{" "}
                  - {booking.billingAddress.pincode}
                </p>
                <p>{booking.billingAddress.country}</p>
              </div>
            )}

            {/* Travellers List */}
            {booking.travellers.map((trav, idx) => {
              let cancellationStatus = null;

              if (trav.cancelled?.byTraveller && !trav.cancelled?.byAdmin) {
                cancellationStatus = "Cancellation Requested by Traveller";
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
                    {trav.title} {trav.firstName} {trav.lastName} ({trav.age}{" "}
                    yrs, {trav.gender})
                  </p>
                  <p>Package Type: {trav.packageType}</p>
                  <p>Sharing Type: {trav.sharingType}</p>
                  {trav.boardingPoint?.stationName && (
                    <p>
                      Boarding Point: {trav.boardingPoint.stationName} (
                      {trav.boardingPoint.stationCode})
                    </p>
                  )}
                  {trav.deboardingPoint?.stationName && (
                    <p>
                      Return De-Boarding Point:{" "}
                      {trav.deboardingPoint.stationName} (
                      {trav.deboardingPoint.stationCode})
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
                <h3 className="font-semibold text-gray-800">Payment Details</h3>
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
            {booking.cancelled?.byAdmin || booking.cancelled?.byTraveller ? (
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
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Local ToastContainer for TourBookings */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="text-sm"
      />

      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pl-12 md:pl-0">
        Bookings
      </h2>

      {/* Dropdown Menu for Tour Selection */}
      <div className="mb-4 sm:mb-6">
        <label
          htmlFor="tour-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select a Tour:
        </label>
        <select
          id="tour-select"
          value={selectedTourId}
          onChange={handleTourChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        >
          <option value="">-- Select a Tour --</option>
          {tourList.map((tour) => (
            <option key={tour._id} value={tour._id}>
              {tour.title}
            </option>
          ))}
        </select>
      </div>

      {/* Filters (visible only when a tour is selected) */}
      {selectedTourId && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Payment Filter */}
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status:
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="all">All</option>
              <option value="advancePaid">Advance Paid</option>
              <option value="advancePending">Advance Pending</option>
              <option value="balancePaid">Balance Paid</option>
              <option value="balancePending">Balance Pending</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="all">All</option>
              <option value="active">Active Bookings</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected by Admin</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Traveller Name Filter */}
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traveller Name:
            </label>
            <input
              type="text"
              value={travellerNameFilter}
              onChange={(e) => setTravellerNameFilter(e.target.value)}
              placeholder="Search by name..."
              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm sm:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>
        </div>
      )}

      {/* Conditionally render bookings based on selection and data */}
      {!selectedTourId ? (
        <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
          <p>Please select a tour to view bookings.</p>
        </div>
      ) : isLoadingBookings ? (
        <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
          <p>Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
          <p>No bookings found matching the filters.</p>
        </div>
      ) : (
        <>
          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Active Bookings
              </h3>
              {activeBookings.map((booking) =>
                renderBookingCard(booking, "active")
              )}
            </div>
          )}

          {/* Completed Bookings */}
          {completedBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
                Completed Bookings
              </h3>
              {completedBookings.map((booking) =>
                renderBookingCard(booking, "completed")
              )}
            </div>
          )}

          {/* Cancellation Requests */}
          {cancellationRequestBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
                Cancellation Requests
              </h3>
              {cancellationRequestBookings.map((booking) =>
                renderBookingCard(booking, "cancellationRequest")
              )}
            </div>
          )}

          {/* Rejected Bookings */}
          {rejectedByAdminBookings.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
                Rejected Bookings (by Admin)
              </h3>
              {rejectedByAdminBookings.map((booking) =>
                renderBookingCard(booking, "rejected")
              )}
            </div>
          )}

          {/* Cancelled by Traveller */}
          {cancelledByTravellerBookings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">
                Cancellations (by Traveller)
              </h3>
              {cancelledByTravellerBookings.map((booking) =>
                renderBookingCard(booking, "cancelledByTraveller")
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TourBookings;
