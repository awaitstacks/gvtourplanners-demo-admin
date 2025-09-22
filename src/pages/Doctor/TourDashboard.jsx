// import React, { useEffect, useContext, useMemo, useState } from "react";
// import { TourContext } from "../../context/TourContext";
// import {
//   Users,
//   CalendarCheck,
//   Clock,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import { toast } from "react-toastify";

// const TourDashboard = () => {
//   const {
//     tourList, // This is a new prop from your context, assumed to be available
//     getTourList, // This is also new, to fetch the list of tours
//     dashData,
//     bookings,
//     getDashData,
//     getBookings,
//     markAdvanceReceiptSent,
//     markBalanceReceiptSent,
//     ttoken, // Assuming ttoken is in your context for authentication
//   } = useContext(TourContext);

//   // State for the selected tour ID
//   const [selectedTourId, setSelectedTourId] = useState("");

//   // Local state to track dismissed bookings (for receipt pending lists)
//   const [dismissedBookings, setDismissedBookings] = useState(new Set());

//   // Step 1: Fetch the list of all tours when the component mounts
//   useEffect(() => {
//     if (ttoken) {
//       getTourList();
//     }
//   }, [ttoken, getTourList]);

//   // Step 2: Fetch dashboard data and bookings when a tour is selected
//   useEffect(() => {
//     if (ttoken && selectedTourId) {
//       getDashData(selectedTourId);
//       getBookings(selectedTourId);
//     }
//   }, [ttoken, selectedTourId, getDashData, getBookings]);

//   // ---- Stats Calculations ----
//   const stats = useMemo(() => {
//     if (!bookings || bookings.length === 0) {
//       return {
//         totalBookings: 0,
//         totalTravellers: 0,
//         completedBookings: 0,
//         pendingBookings: 0,
//         advancePending: [],
//         balancePending: [],
//         uncompleted: [],
//       };
//     }

//     const uniqueUsers = new Set();
//     let travellerCount = 0;
//     let completed = 0;
//     let pending = 0;
//     let advancePending = [];
//     let balancePending = [];
//     let uncompleted = [];

//     bookings.forEach((b) => {
//       if (b.userId?._id) uniqueUsers.add(b.userId._id.toString());
//       travellerCount += b.travellers?.length || 0;

//       if (b.isBookingCompleted) {
//         completed++;
//       } else {
//         pending++;
//         uncompleted.push(b); // always keep uncompleted here
//       }

//       // ----- Advance Receipt Pending -----
//       if (b.payment.advance.paid && !b.receipts?.advanceReceiptSent) {
//         advancePending.push(b);
//       }

//       // ----- Balance Receipt Pending -----
//       if (b.payment.balance.paid && !b.receipts?.balanceReceiptSent) {
//         balancePending.push(b);
//       }
//     });

//     return {
//       totalBookings: uniqueUsers.size,
//       totalTravellers: travellerCount,
//       completedBookings: completed,
//       pendingBookings: pending,
//       advancePending: advancePending.sort(
//         (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
//       ),
//       balancePending: balancePending.sort(
//         (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
//       ),
//       uncompleted: uncompleted.sort(
//         (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
//       ),
//     };
//   }, [bookings]);

//   // ---- Handle Mark as Receipt Complete ----
//   const handleDismiss = async (booking, type) => {
//     // Check if a tour is selected before allowing action
//     if (!selectedTourId) {
//       toast.error("Please select a tour first.");
//       return;
//     }

//     const confirm = window.confirm(
//       "Are you sure you want to mark this receipt as complete?"
//     );
//     if (!confirm) return;

//     try {
//       if (type === "advance") {
//         if (!booking.payment.advance.paid) {
//           toast.error(
//             "❌ Cannot complete. Advance payment not marked as paid."
//           );
//           return;
//         }
//         await markAdvanceReceiptSent(booking._id, selectedTourId); // Pass tourId
//       }

//       if (type === "balance") {
//         if (!booking.payment.advance.paid) {
//           toast.error("❌ Cannot complete. Advance payment is not paid yet.");
//           return;
//         }
//         if (!booking.payment.balance.paid) {
//           toast.error("❌ Cannot complete. Balance payment is not paid yet.");
//           return;
//         }
//         await markBalanceReceiptSent(booking._id, selectedTourId); // Pass tourId
//       }

//       setDismissedBookings((prev) => new Set(prev).add(booking._id));
//       toast.success("✅ Receipt marked as complete.");
//     } catch (error) {
//       toast.error("Something went wrong while updating receipt.");
//       console.error(error);
//     }
//   };

//   // ---- Render booking cards ----
//   const renderBookingCards = (list, type) => {
//     let filteredList = list;

//     // For receipt pending lists → exclude dismissed
//     if (type === "advance" || type === "balance") {
//       filteredList = list.filter((b) => !dismissedBookings.has(b._id));
//     }

//     // For uncompleted → only show bookings still incomplete
//     if (type === "uncompleted") {
//       filteredList = list.filter((b) => !b.isBookingCompleted);
//     }

//     if (!filteredList || filteredList.length === 0) {
//       return (
//         <p className="text-gray-500 text-center py-6">
//           🎉 No pending actions, happy working!
//         </p>
//       );
//     }

//     return (
//       <div className="space-y-3">
//         {filteredList.map((b) => (
//           <div
//             key={b._id}
//             className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between"
//           >
//             <div>
//               <p className="font-medium">
//                 {b.userId?.name || "Guest"} ({b.userId?.email || "No Email"})
//               </p>
//               <p className="text-sm text-gray-600">
//                 Travellers: {b.travellers?.length || 0} | Booking Date:{" "}
//                 {new Date(b.bookingDate).toLocaleDateString()}
//               </p>

//               {type === "advance" && b.receipts?.advanceReceiptSentAt && (
//                 <p className="text-xs text-green-600">
//                   ✅ Advance Sent on{" "}
//                   {new Date(b.receipts.advanceReceiptSentAt).toLocaleString()}
//                 </p>
//               )}
//               {type === "balance" && b.receipts?.balanceReceiptSentAt && (
//                 <p className="text-xs text-green-600">
//                   ✅ Balance Sent on{" "}
//                   {new Date(b.receipts.balanceReceiptSentAt).toLocaleString()}
//                 </p>
//               )}
//             </div>

//             {/* Buttons only for receipt actions */}
//             {(type === "advance" || type === "balance") && (
//               <button
//                 onClick={() => handleDismiss(b, type)}
//                 className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
//               >
//                 <CheckCircle size={16} />
//                 Mark as Receipt Complete
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Tour Dashboard</h1>

//       {/* Dropdown Menu for Tour Selection */}
//       <div className="mb-6">
//         <label
//           htmlFor="tour-select"
//           className="block text-sm font-medium text-gray-700 mb-1"
//         >
//           Select a Tour:
//         </label>
//         <select
//           id="tour-select"
//           value={selectedTourId}
//           onChange={(e) => setSelectedTourId(e.target.value)}
//           className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//         >
//           <option value="">-- Select a Tour --</option>
//           {tourList.map((tour) => (
//             <option key={tour._id} value={tour._id}>
//               {tour.title}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Conditionally render content based on selectedTourId */}
//       {!selectedTourId ? (
//         <div className="p-6 text-center text-gray-500">
//           <p>Please select a tour to view dashboard data.</p>
//         </div>
//       ) : (
//         <>
//           {/* Stats */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <Users className="text-blue-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Total Bookings (Unique Users)
//                 </p>
//                 <p className="text-xl font-semibold">
//                   {dashData?.totalUsers || 0}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <Users className="text-indigo-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">Total Travellers</p>
//                 <p className="text-xl font-semibold">
//                   {dashData?.totalTravellers || 0}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <CalendarCheck className="text-green-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">Completed Bookings</p>
//                 <p className="text-xl font-semibold">
//                   {stats.completedBookings}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <Clock className="text-orange-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">Pending Bookings</p>
//                 <p className="text-xl font-semibold">{stats.pendingBookings}</p>
//               </div>
//             </div>
//           </div>

//           {/* Receipt Pending Lists */}
//           <div className="bg-gray-50 rounded-2xl p-6 mb-6">
//             <h2 className="text-lg font-semibold mb-4">
//               Advance Receipt Pending
//             </h2>
//             {renderBookingCards(stats.advancePending, "advance")}
//           </div>

//           <div className="bg-gray-50 rounded-2xl p-6 mb-6">
//             <h2 className="text-lg font-semibold mb-4">
//               Balance Receipt Pending
//             </h2>
//             {renderBookingCards(stats.balancePending, "balance")}
//           </div>

//           {/* Uncompleted Bookings */}
//           <div className="bg-gray-50 rounded-2xl p-6 mt-6">
//             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               Uncompleted Booking List
//             </h2>
//             {renderBookingCards(stats.uncompleted, "uncompleted")}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default TourDashboard;

// import { useEffect, useContext, useMemo, useState, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import { TourContext } from "../../context/TourContext";
// import {
//   Users,
//   CalendarCheck,
//   Clock,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const TourDashboard = () => {
//   const {
//     tourList,
//     getTourList,
//     dashData,
//     bookings,
//     getDashData,
//     getBookings,
//     markAdvanceReceiptSent,
//     markBalanceReceiptSent,
//     ttoken,
//   } = useContext(TourContext);

//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [dismissedBookings, setDismissedBookings] = useState(new Set());
//   const location = useLocation();

//   // Fetch the list of all tours when the component mounts
//   useEffect(() => {
//     if (ttoken) {
//       getTourList();
//     }
//   }, [ttoken, getTourList]);

//   // Fetch dashboard data and bookings when a tour is selected
//   useEffect(() => {
//     if (ttoken && selectedTourId) {
//       getDashData(selectedTourId);
//       getBookings(selectedTourId);
//     }
//   }, [ttoken, selectedTourId, getDashData, getBookings]);

//   // Clear toasts on component unmount or route change
//   useEffect(() => {
//     return () => {
//       toast.dismiss(); // Dismiss all toasts when leaving the page
//     };
//   }, [location]);

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

//   // Stats Calculations
//   const stats = useMemo(() => {
//     if (!bookings || bookings.length === 0) {
//       return {
//         totalBookings: 0,
//         totalTravellers: 0,
//         completedBookings: 0,
//         pendingBookings: 0,
//         advancePending: [],
//         balancePending: [],
//         uncompleted: [],
//       };
//     }

//     const uniqueUsers = new Set();
//     let travellerCount = 0;
//     let completed = 0;
//     let pending = 0;
//     let advancePending = [];
//     let balancePending = [];
//     let uncompleted = [];

//     bookings.forEach((b) => {
//       if (b.userId?._id) uniqueUsers.add(b.userId._id.toString());
//       travellerCount += b.travellers?.length || 0;

//       if (b.isBookingCompleted) {
//         completed++;
//       } else {
//         pending++;
//         uncompleted.push(b);
//       }

//       // Advance Receipt Pending
//       if (b.payment.advance.paid && !b.receipts?.advanceReceiptSent) {
//         advancePending.push(b);
//       }

//       // Balance Receipt Pending
//       if (b.payment.balance.paid && !b.receipts?.balanceReceiptSent) {
//         balancePending.push(b);
//       }
//     });

//     return {
//       totalBookings: uniqueUsers.size,
//       totalTravellers: travellerCount,
//       completedBookings: completed,
//       pendingBookings: pending,
//       advancePending: advancePending.sort(
//         (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
//       ),
//       balancePending: balancePending.sort(
//         (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
//       ),
//       uncompleted: uncompleted.sort(
//         (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
//       ),
//     };
//   }, [bookings]);

//   // Handle Mark as Receipt Complete
//   const handleDismiss = async (booking, type) => {
//     if (!selectedTourId) {
//       toast.error("Please select a tour first.");
//       return;
//     }

//     const confirm = window.confirm(
//       "Are you sure you want to mark this receipt as complete?"
//     );
//     if (!confirm) return;

//     try {
//       let response;
//       if (type === "advance") {
//         if (!booking.payment.advance.paid) {
//           toast.error(
//             "❌ Cannot complete. Advance payment not marked as paid."
//           );
//           return;
//         }
//         response = await markAdvanceReceiptSent(booking._id, selectedTourId);
//       } else if (type === "balance") {
//         if (!booking.payment.advance.paid) {
//           toast.error("❌ Cannot complete. Advance payment is not paid yet.");
//           return;
//         }
//         if (!booking.payment.balance.paid) {
//           toast.error("❌ Cannot complete. Balance payment is not paid yet.");
//           return;
//         }
//         response = await markBalanceReceiptSent(booking._id, selectedTourId);
//       }

//       handleApiResponse(
//         response,
//         `${
//           type.charAt(0).toUpperCase() + type.slice(1)
//         } receipt marked as complete`
//       );
//       setDismissedBookings((prev) => new Set(prev).add(booking._id));
//     } catch (error) {
//       console.error(
//         `mark${type.charAt(0).toUpperCase() + type.slice(1)}ReceiptSent error:`,
//         error
//       );
//       toast.error(`Failed to mark ${type} receipt: ${error.message}`);
//     }
//   };

//   // Render booking cards
//   const renderBookingCards = (list, type) => {
//     let filteredList = list;

//     // For receipt pending lists → exclude dismissed
//     if (type === "advance" || type === "balance") {
//       filteredList = list.filter((b) => !dismissedBookings.has(b._id));
//     }

//     // For uncompleted → only show bookings still incomplete
//     if (type === "uncompleted") {
//       filteredList = list.filter((b) => !b.isBookingCompleted);
//     }

//     if (!filteredList || filteredList.length === 0) {
//       return (
//         <p className="text-gray-500 text-center py-6">
//           🎉 No pending actions, happy working!
//         </p>
//       );
//     }

//     return (
//       <div className="space-y-3">
//         {filteredList.map((b) => (
//           <div
//             key={b._id}
//             className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between"
//           >
//             <div>
//               <p className="font-medium">
//                 {b.userId?.name || "Guest"} ({b.userId?.email || "No Email"})
//               </p>
//               <p className="text-sm text-gray-600">
//                 Travellers: {b.travellers?.length || 0} | Booking Date:{" "}
//                 {new Date(b.bookingDate).toLocaleDateString()}
//               </p>

//               {type === "advance" && b.receipts?.advanceReceiptSentAt && (
//                 <p className="text-xs text-green-600">
//                   ✅ Advance Sent on{" "}
//                   {new Date(b.receipts.advanceReceiptSentAt).toLocaleString()}
//                 </p>
//               )}
//               {type === "balance" && b.receipts?.balanceReceiptSentAt && (
//                 <p className="text-xs text-green-600">
//                   ✅ Balance Sent on{" "}
//                   {new Date(b.receipts.balanceReceiptSentAt).toLocaleString()}
//                 </p>
//               )}
//             </div>

//             {(type === "advance" || type === "balance") && (
//               <button
//                 onClick={() => handleDismiss(b, type)}
//                 className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
//               >
//                 <CheckCircle size={16} />
//                 Mark as Receipt Complete
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="p-6">
//       {/* Local ToastContainer for TourDashboard */}
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

//       <h1 className="text-2xl font-bold mb-6">Tour Dashboard</h1>

//       {/* Dropdown Menu for Tour Selection */}
//       <div className="mb-6">
//         <label
//           htmlFor="tour-select"
//           className="block text-sm font-medium text-gray-700 mb-1"
//         >
//           Select a Tour:
//         </label>
//         <select
//           id="tour-select"
//           value={selectedTourId}
//           onChange={(e) => setSelectedTourId(e.target.value)}
//           className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//         >
//           <option value="">-- Select a Tour --</option>
//           {tourList.map((tour) => (
//             <option key={tour._id} value={tour._id}>
//               {tour.title}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Conditionally render content based on selectedTourId */}
//       {!selectedTourId ? (
//         <div className="p-6 text-center text-gray-500">
//           <p>Please select a tour to view dashboard data.</p>
//         </div>
//       ) : (
//         <>
//           {/* Stats */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <Users className="text-blue-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">
//                   Total Bookings (Unique Users)
//                 </p>
//                 <p className="text-xl font-semibold">
//                   {dashData?.totalUsers || 0}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <Users className="text-indigo-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">Total Travellers</p>
//                 <p className="text-xl font-semibold">
//                   {dashData?.totalTravellers || 0}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <CalendarCheck className="text-green-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">Completed Bookings</p>
//                 <p className="text-xl font-semibold">
//                   {stats.completedBookings}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
//               <Clock className="text-orange-500 w-8 h-8" />
//               <div>
//                 <p className="text-sm text-gray-500">Pending Bookings</p>
//                 <p className="text-xl font-semibold">{stats.pendingBookings}</p>
//               </div>
//             </div>
//           </div>

//           {/* Receipt Pending Lists */}
//           <div className="bg-gray-50 rounded-2xl p-6 mb-6">
//             <h2 className="text-lg font-semibold mb-4">
//               Advance Receipt Pending
//             </h2>
//             {renderBookingCards(stats.advancePending, "advance")}
//           </div>

//           <div className="bg-gray-50 rounded-2xl p-6 mb-6">
//             <h2 className="text-lg font-semibold mb-4">
//               Balance Receipt Pending
//             </h2>
//             {renderBookingCards(stats.balancePending, "balance")}
//           </div>

//           {/* Uncompleted Bookings */}
//           <div className="bg-gray-50 rounded-2xl p-6 mt-6">
//             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               Uncompleted Booking List
//             </h2>
//             {renderBookingCards(stats.uncompleted, "uncompleted")}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default TourDashboard;

import { useEffect, useContext, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TourDashboard = () => {
  const {
    tourList,
    getTourList,
    dashData,
    bookings,
    getDashData,
    getBookings,
    markAdvanceReceiptSent,
    markBalanceReceiptSent,
    ttoken,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [dismissedBookings, setDismissedBookings] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Clear toasts on route change
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

  // Handle API responses
  const handleApiResponse = useCallback(
    (response, successMessage, errorMessage) => {
      console.log(
        "API Response at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        response
      );
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          toast.success(successMessage || "Operation completed successfully");
          return true;
        } else {
          toast.error(response.message || errorMessage || "Operation failed");
          return false;
        }
      } else {
        toast.error("Invalid response from server");
        return false;
      }
    },
    []
  );

  // Fetch tour list
  useEffect(() => {
    if (ttoken) {
      console.log(
        "Fetching tour list at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      setIsLoading(true);
      getTourList()
        .then((response) => {
          handleApiResponse(
            response,
            "Tour list fetched successfully",
            "Failed to fetch tour list"
          );
        })
        .catch((error) => {
          console.error(
            "Fetch tour list error at",
            new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            error
          );
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch tour list"
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, getTourList, handleApiResponse]);

  // Fetch dashboard data and bookings
  useEffect(() => {
    if (ttoken && selectedTourId) {
      console.log(
        `Fetching dashboard data and bookings for tour ${selectedTourId} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      setIsLoading(true);
      Promise.all([getDashData(selectedTourId), getBookings(selectedTourId)])
        .then(([dashResponse, bookingsResponse]) => {
          handleApiResponse(
            dashResponse,
            "Dashboard data fetched successfully",
            "Failed to fetch dashboard data"
          );
          handleApiResponse(
            bookingsResponse,
            "Bookings fetched successfully",
            "Failed to fetch bookings"
          );
        })
        .catch((error) => {
          console.error(
            "Fetch dashboard/bookings error at",
            new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            error
          );
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch dashboard data or bookings"
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [ttoken, selectedTourId, getDashData, getBookings, handleApiResponse]);

  // Stats Calculations
  const stats = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        totalBookings: 0,
        totalTravellers: 0,
        completedBookings: 0,
        pendingBookings: 0,
        advancePending: [],
        balancePending: [],
        uncompleted: [],
      };
    }

    const uniqueUsers = new Set();
    let travellerCount = 0;
    let completed = 0;
    let pending = 0;
    let advancePending = [];
    let balancePending = [];
    let uncompleted = [];

    bookings.forEach((b) => {
      if (b.userId?._id) uniqueUsers.add(b.userId._id.toString());
      travellerCount += b.travellers?.length || 0;

      if (b.isBookingCompleted) {
        completed++;
      } else {
        pending++;
        uncompleted.push(b);
      }

      if (b.payment.advance.paid && !b.receipts?.advanceReceiptSent) {
        advancePending.push(b);
      }

      if (b.payment.balance.paid && !b.receipts?.balanceReceiptSent) {
        balancePending.push(b);
      }
    });

    return {
      totalBookings: uniqueUsers.size,
      totalTravellers: travellerCount,
      completedBookings: completed,
      pendingBookings: pending,
      advancePending: advancePending.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      ),
      balancePending: balancePending.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      ),
      uncompleted: uncompleted.sort(
        (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
      ),
    };
  }, [bookings]);

  // Handle Mark as Receipt Complete
  const handleDismiss = async (booking, type) => {
    if (!selectedTourId) {
      toast.error("Please select a tour first.");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to mark this receipt as complete?"
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      let response;
      if (type === "advance") {
        if (!booking.payment.advance.paid) {
          toast.error(
            "❌ Cannot complete. Advance payment not marked as paid."
          );
          return;
        }
        console.log(
          `Marking advance receipt sent for booking ${booking._id} at`,
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        );
        response = await markAdvanceReceiptSent(booking._id, selectedTourId);
      } else if (type === "balance") {
        if (!booking.payment.advance.paid) {
          toast.error("❌ Cannot complete. Advance payment is not paid yet.");
          return;
        }
        if (!booking.payment.balance.paid) {
          toast.error("❌ Cannot complete. Balance payment is not paid yet.");
          return;
        }
        console.log(
          `Marking balance receipt sent for booking ${booking._id} at`,
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        );
        response = await markBalanceReceiptSent(booking._id, selectedTourId);
      }

      if (
        handleApiResponse(
          response,
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } receipt marked as complete`,
          `Failed to mark ${type} receipt`
        )
      ) {
        setDismissedBookings((prev) => new Set(prev).add(booking._id));
      }
    } catch (error) {
      console.error(
        `mark${
          type.charAt(0).toUpperCase() + type.slice(1)
        }ReceiptSent error at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to mark ${type} receipt`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render booking cards
  const renderBookingCards = (list, type) => {
    let filteredList = list;

    if (type === "advance" || type === "balance") {
      filteredList = list.filter((b) => !dismissedBookings.has(b._id));
    }

    if (type === "uncompleted") {
      filteredList = list.filter((b) => !b.isBookingCompleted);
    }

    if (!filteredList || filteredList.length === 0) {
      return (
        <p className="text-gray-500 text-center py-6">
          🎉 No pending actions, happy working!
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {filteredList.map((b) => {
          // Get the first traveller's name, fallback to "Unknown Traveller" if none
          const firstTraveller =
            b.travellers && b.travellers.length > 0 ? b.travellers[0] : null;
          const displayName = firstTraveller
            ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
            : "Unknown Traveller";
          return (
            <div
              key={b._id}
              className="p-4 bg-white border rounded-xl shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-medium">
                  <strong>{displayName}</strong> (
                  {b.userId?.email || "No Email"})
                </p>
                <p className="text-sm text-gray-600">
                  Travellers: {b.travellers?.length || 0} | Booking Date:{" "}
                  {new Date(b.bookingDate).toLocaleDateString()}
                </p>

                {type === "advance" && b.receipts?.advanceReceiptSentAt && (
                  <p className="text-xs text-green-600">
                    ✅ Advance Sent on{" "}
                    {new Date(b.receipts.advanceReceiptSentAt).toLocaleString()}
                  </p>
                )}
                {type === "balance" && b.receipts?.balanceReceiptSentAt && (
                  <p className="text-xs text-green-600">
                    ✅ Balance Sent on{" "}
                    {new Date(b.receipts.balanceReceiptSentAt).toLocaleString()}
                  </p>
                )}
              </div>

              {(type === "advance" || type === "balance") && (
                <button
                  onClick={() => handleDismiss(b, type)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <CheckCircle size={16} />
                  {isLoading ? "Processing..." : "Mark as Receipt Complete"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6">
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
      />

      <h1 className="text-2xl font-bold mb-6">Tour Dashboard</h1>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : !ttoken ? (
        <div className="p-6 text-center text-gray-500">
          <p>Please log in to view dashboard data.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label
              htmlFor="tour-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select a Tour:
            </label>
            <select
              id="tour-select"
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={isLoading}
            >
              <option value="">-- Select a Tour --</option>
              {tourList.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>

          {!selectedTourId ? (
            <div className="p-6 text-center text-gray-500">
              <p>Please select a tour to view dashboard data.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
                  <Users className="text-blue-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Bookings (Unique Users)
                    </p>
                    <p className="text-xl font-semibold">
                      {dashData?.totalUsers || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
                  <Users className="text-indigo-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-gray-500">Total Travellers</p>
                    <p className="text-xl font-semibold">
                      {dashData?.totalTravellers || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
                  <CalendarCheck className="text-green-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-gray-500">Completed Bookings</p>
                    <p className="text-xl font-semibold">
                      {stats.completedBookings}
                    </p>
                  </div>
                </div>
                <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
                  <Clock className="text-orange-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-gray-500">Pending Bookings</p>
                    <p className="text-xl font-semibold">
                      {stats.pendingBookings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">
                  Advance Receipt Pending
                </h2>
                {renderBookingCards(stats.advancePending, "advance")}
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">
                  Balance Receipt Pending
                </h2>
                {renderBookingCards(stats.balancePending, "balance")}
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  Uncompleted Booking List
                </h2>
                {renderBookingCards(stats.uncompleted, "uncompleted")}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TourDashboard;
