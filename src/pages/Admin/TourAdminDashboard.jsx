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
//       b.payment?.advance?.paid &&
//       !b.payment?.balance?.paid &&
//       !b.receipts?.advanceReceiptSent,
//     balance: (b) =>
//       b.payment?.advance?.paid &&
//       b.payment?.balance?.paid &&
//       !b.receipts?.balanceReceiptSent,
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
//   };

//   // Classify bookings into buckets
//   const categorized = {
//     advance: bookings.filter(filters.advance),
//     balance: bookings.filter(filters.balance),
//     completion: bookings.filter(filters.completion),
//     cancellation: bookings.filter(filters.cancellation),
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
//   const BookingItem = ({ booking, category, statusLabel, statusColor }) => (
//     <li key={booking._id} className="p-3 bg-white rounded-lg shadow border">
//       <div
//         className="flex justify-between items-center cursor-pointer"
//         onClick={() => toggleExpand(category, booking._id)}
//       >
//         <span>
//           {booking.tourData?.title || "Untitled Tour"} —{" "}
//           {booking.userData?.name || "Guest"}
//         </span>
//         <span className={`font-medium ${statusColor}`}>{statusLabel}</span>
//       </div>

//       {expanded[category]?.[booking._id] && (
//         <div className="mt-3 border-t pt-3 space-y-2 text-sm text-gray-700">
//           <p>
//             <strong>Booking ID:</strong> {booking._id}
//           </p>
//           <p>
//             <strong>Email:</strong> {booking.contact?.email}
//           </p>
//           <p>
//             <strong>Mobile:</strong> {booking.contact?.mobile}
//           </p>
//           <p>
//             <strong>Advance Paid:</strong>{" "}
//             {booking.payment?.advance?.paid ? "Yes" : "No"}
//           </p>
//           <p>
//             <strong>Balance Paid:</strong>{" "}
//             {booking.payment?.balance?.paid ? "Yes" : "No"}
//           </p>

//           <div>
//             <h4 className="font-semibold mb-1">Travellers</h4>
//             <ul className="space-y-1">
//               {booking.travellers?.map((t, i) => (
//                 <li key={i} className="flex justify-between border p-2 rounded">
//                   <span>
//                     {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
//                     {t.gender})
//                   </span>
//                   <span className="text-sm text-gray-500">
//                     {t.sharingType} sharing
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </li>
//   );

//   return (
//     <div className="p-6 space-y-8">
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

//       <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>

//       {isLoading ? (
//         <div className="text-center text-gray-500">Loading...</div>
//       ) : bookings.length === 0 ? (
//         <div className="text-center text-gray-500">No bookings found.</div>
//       ) : (
//         <>
//           {/* Dashboard Metrics */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//             <div className="p-4 bg-white rounded-lg shadow border text-center">
//               <p className="text-lg font-semibold">{totalTravellers}</p>
//               <p className="text-sm text-gray-500">Total Travellers</p>
//             </div>
//             <div className="p-4 bg-white rounded-lg shadow border text-center">
//               <p className="text-lg font-semibold">{uniqueUsers}</p>
//               <p className="text-sm text-gray-500">Unique Users</p>
//             </div>
//             <div className="p-4 bg-white rounded-lg shadow border text-center">
//               <p className="text-lg font-semibold">
//                 {categorized.advance.length}
//               </p>
//               <p className="text-sm text-gray-500">Advance Pending</p>
//             </div>
//             <div className="p-4 bg-white rounded-lg shadow border text-center">
//               <p className="text-lg font-semibold">
//                 {categorized.balance.length}
//               </p>
//               <p className="text-sm text-gray-500">Balance Pending</p>
//             </div>
//             <div className="p-4 bg-white rounded-lg shadow border text-center">
//               <p className="text-lg font-semibold">
//                 {categorized.completion.length}
//               </p>
//               <p className="text-sm text-gray-500">Completion Pending</p>
//             </div>
//             <div className="p-4 bg-white rounded-lg shadow border text-center">
//               <p className="text-lg font-semibold">
//                 {categorized.cancellation.length}
//               </p>
//               <p className="text-sm text-gray-500">Cancellation Requests</p>
//             </div>
//           </div>

//           {/* Advance Receipt */}
//           <section>
//             <h2 className="text-xl font-semibold mb-2">
//               Advance Receipt Pending ({categorized.advance.length})
//             </h2>
//             {categorized.advance.length === 0 ? (
//               <p className="text-gray-500">No pending advance receipts.</p>
//             ) : (
//               <ul className="space-y-2">
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
//           <section>
//             <h2 className="text-xl font-semibold mb-2">
//               Balance Receipt Pending ({categorized.balance.length})
//             </h2>
//             {categorized.balance.length === 0 ? (
//               <p className="text-gray-500">No pending balance receipts.</p>
//             ) : (
//               <ul className="space-y-2">
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

//           {/* Completion */}
//           <section>
//             <h2 className="text-xl font-semibold mb-2">
//               Booking Completion Actions ({categorized.completion.length})
//             </h2>
//             {categorized.completion.length === 0 ? (
//               <p className="text-gray-500">All bookings are completed.</p>
//             ) : (
//               <ul className="space-y-2">
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
//             <h2 className="text-xl font-semibold mb-2">
//               Cancellation Request Actions ({categorized.cancellation.length})
//             </h2>
//             {categorized.cancellation.length === 0 ? (
//               <p className="text-gray-500">No cancellation requests.</p>
//             ) : (
//               <ul className="space-y-3">
//                 {categorized.cancellation.map((b) => (
//                   <li
//                     key={b._id}
//                     className="p-4 bg-white rounded-lg shadow border"
//                   >
//                     <div
//                       className="flex justify-between cursor-pointer"
//                       onClick={() => toggleExpand("cancellation", b._id)}
//                     >
//                       <p className="font-semibold">
//                         {b.tourData?.title} — {b.userData?.name || "Guest"}
//                       </p>
//                       <span className="text-red-600 font-medium">
//                         Cancellation Request
//                       </span>
//                     </div>

//                     {expanded["cancellation"]?.[b._id] && (
//                       <div className="mt-3 border-t pt-3 space-y-2 text-sm text-gray-700">
//                         <p>
//                           <strong>Booking ID:</strong> {b._id}
//                         </p>
//                         <h4 className="font-semibold">Travellers Requested</h4>
//                         {b.travellers
//                           .filter(
//                             (t) =>
//                               t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//                           )
//                           .map((t, i) => (
//                             <div
//                               key={i}
//                               className="flex justify-between items-center border p-2 rounded"
//                             >
//                               <span>
//                                 {t.firstName} {t.lastName} ({t.age} yrs)
//                               </span>
//                               <span className="text-sm text-gray-500">
//                                 {t.sharingType} sharing
//                               </span>

//                               <div className="flex space-x-2">
//                                 <button
//                                   onClick={() =>
//                                     handleCancelBooking(b._id, t._id)
//                                   }
//                                   disabled={isLoading}
//                                   className={`px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 ${
//                                     isLoading
//                                       ? "opacity-50 cursor-not-allowed"
//                                       : ""
//                                   }`}
//                                 >
//                                   {isLoading
//                                     ? "Processing..."
//                                     : "Approve Cancellation"}
//                                 </button>
//                                 <button
//                                   onClick={() =>
//                                     handleReleaseBooking(b._id, t._id)
//                                   }
//                                   disabled={isLoading}
//                                   className={`px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 ${
//                                     isLoading
//                                       ? "opacity-50 cursor-not-allowed"
//                                       : ""
//                                   }`}
//                                 >
//                                   {isLoading
//                                     ? "Processing..."
//                                     : "Reject Cancellation"}
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                     )}
//                   </li>
//                 ))}
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

const TourAdminDashboard = () => {
  const { bookings, getAllBookings, cancelBooking, releaseBooking } =
    useContext(TourAdminContext);
  const [expanded, setExpanded] = useState({}); // category-scoped
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Clear toasts on route change
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

  // Fetch bookings
  useEffect(() => {
    console.log(
      "Fetching all bookings at",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );
    setIsLoading(true);
    getAllBookings()
      .then((response) => {
        handleApiResponse(
          response,
          "Bookings fetched successfully",
          "Failed to fetch bookings"
        );
      })
      .catch((error) => {
        console.error(
          "Fetch bookings error at",
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          error
        );
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch bookings"
        );
      })
      .finally(() => setIsLoading(false));
  }, [getAllBookings]);

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

  // Define filters dynamically
  const filters = {
    advance: (b) =>
      b.payment?.advance?.paid &&
      !b.payment?.balance?.paid &&
      !b.receipts?.advanceReceiptSent,
    balance: (b) =>
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      !b.receipts?.balanceReceiptSent,
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
  };

  // Classify bookings into buckets
  const categorized = {
    advance: bookings.filter(filters.advance),
    balance: bookings.filter(filters.balance),
    completion: bookings.filter(filters.completion),
    cancellation: bookings.filter(filters.cancellation),
  };

  // Dashboard Metrics
  const totalTravellers = bookings.reduce((count, b) => {
    if (
      b.payment?.advance?.paid &&
      b.payment?.balance?.paid &&
      b.isBookingCompleted
    ) {
      const validTravellers =
        b.travellers?.filter(
          (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
        ) || [];
      return count + validTravellers.length;
    }
    return count;
  }, 0);

  const uniqueUsers = new Set(
    bookings.map((b) => b.userData?._id || b.contact?.email)
  ).size;

  // Toggle expand state per category + booking id
  const toggleExpand = (category, id) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: !prev[category]?.[id],
      },
    }));
  };

  // Handle cancellation actions
  const handleCancelBooking = async (bookingId, travellerId) => {
    const confirm = window.confirm(
      "Are you sure you want to approve this cancellation?"
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      console.log(
        `Approving cancellation for booking ${bookingId}, traveller ${travellerId} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const response = await cancelBooking(bookingId, [travellerId]);
      handleApiResponse(
        response,
        "Cancellation approved successfully",
        "Failed to approve cancellation"
      );
    } catch (error) {
      console.error(
        "Cancel booking error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve cancellation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle release (reject cancellation) actions
  const handleReleaseBooking = async (bookingId, travellerId) => {
    const confirm = window.confirm(
      "Are you sure you want to reject this cancellation request?"
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      console.log(
        `Rejecting cancellation for booking ${bookingId}, traveller ${travellerId} at`,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const response = await releaseBooking(bookingId, [travellerId]);
      handleApiResponse(
        response,
        "Cancellation request rejected successfully",
        "Failed to reject cancellation"
      );
    } catch (error) {
      console.error(
        "Release booking error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject cancellation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable Booking Item
  const BookingItem = ({ booking, category, statusLabel, statusColor }) => {
    // Get the first traveller's name, fallback to "Unknown Traveller" if none
    const firstTraveller =
      booking.travellers && booking.travellers.length > 0
        ? booking.travellers[0]
        : null;
    const displayName = firstTraveller
      ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
      : "Unknown Traveller";
    return (
      <li key={booking._id} className="p-3 bg-white rounded-lg shadow border">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpand(category, booking._id)}
        >
          <span>
            {booking.tourData?.title || "Untitled Tour"} —{" "}
            <strong>{displayName}</strong>{" "}
            {/* Shows tour title followed by first traveller's name in bold */}
          </span>
          <span className={`font-medium ${statusColor}`}>{statusLabel}</span>
        </div>

        {expanded[category]?.[booking._id] && (
          <div className="mt-3 border-t pt-3 space-y-2 text-sm text-gray-700">
            <p>
              <strong>Booking ID:</strong> {booking._id}
            </p>
            <p>
              <strong>Email:</strong> {booking.contact?.email}
            </p>
            <p>
              <strong>Mobile:</strong> {booking.contact?.mobile}
            </p>
            <p>
              <strong>Advance Paid:</strong>{" "}
              {booking.payment?.advance?.paid ? "Yes" : "No"}
            </p>
            <p>
              <strong>Balance Paid:</strong>{" "}
              {booking.payment?.balance?.paid ? "Yes" : "No"}
            </p>

            <div>
              <h4 className="font-semibold mb-1">Travellers</h4>
              <ul className="space-y-1">
                {booking.travellers?.map((t, i) => (
                  <li
                    key={i}
                    className="flex justify-between border p-2 rounded"
                  >
                    <span>
                      {t.title} {t.firstName} {t.lastName} ({t.age} yrs,{" "}
                      {t.gender})
                    </span>
                    <span className="text-sm text-gray-500">
                      {t.sharingType} sharing
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="p-6 space-y-8">
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

      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-500">No bookings found.</div>
      ) : (
        <>
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white rounded-lg shadow border text-center">
              <p className="text-lg font-semibold">{totalTravellers}</p>
              <p className="text-sm text-gray-500">Total Travellers</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow border text-center">
              <p className="text-lg font-semibold">{uniqueUsers}</p>
              <p className="text-sm text-gray-500">Unique Users</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow border text-center">
              <p className="text-lg font-semibold">
                {categorized.advance.length}
              </p>
              <p className="text-sm text-gray-500">Advance Pending</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow border text-center">
              <p className="text-lg font-semibold">
                {categorized.balance.length}
              </p>
              <p className="text-sm text-gray-500">Balance Pending</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow border text-center">
              <p className="text-lg font-semibold">
                {categorized.completion.length}
              </p>
              <p className="text-sm text-gray-500">Completion Pending</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow border text-center">
              <p className="text-lg font-semibold">
                {categorized.cancellation.length}
              </p>
              <p className="text-sm text-gray-500">Cancellation Requests</p>
            </div>
          </div>

          {/* Advance Receipt */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Advance Receipt Pending ({categorized.advance.length})
            </h2>
            {categorized.advance.length === 0 ? (
              <p className="text-gray-500">No pending advance receipts.</p>
            ) : (
              <ul className="space-y-2">
                {categorized.advance.map((b) => (
                  <BookingItem
                    key={b._id}
                    booking={b}
                    category="advance"
                    statusLabel="Pending Advance Receipt"
                    statusColor="text-red-600"
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Balance Receipt */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Balance Receipt Pending ({categorized.balance.length})
            </h2>
            {categorized.balance.length === 0 ? (
              <p className="text-gray-500">No pending balance receipts.</p>
            ) : (
              <ul className="space-y-2">
                {categorized.balance.map((b) => (
                  <BookingItem
                    key={b._id}
                    booking={b}
                    category="balance"
                    statusLabel="Pending Balance Receipt"
                    statusColor="text-red-600"
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Completion */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Booking Completion Actions ({categorized.completion.length})
            </h2>
            {categorized.completion.length === 0 ? (
              <p className="text-gray-500">All bookings are completed.</p>
            ) : (
              <ul className="space-y-2">
                {categorized.completion.map((b) => (
                  <BookingItem
                    key={b._id}
                    booking={b}
                    category="completion"
                    statusLabel="Pending Completion"
                    statusColor="text-orange-600"
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Cancellation */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Cancellation Request Actions ({categorized.cancellation.length})
            </h2>
            {categorized.cancellation.length === 0 ? (
              <p className="text-gray-500">No cancellation requests.</p>
            ) : (
              <ul className="space-y-3">
                {categorized.cancellation.map((b) => {
                  // Get the first traveller's name, fallback to "Unknown Traveller" if none
                  const firstTraveller =
                    b.travellers && b.travellers.length > 0
                      ? b.travellers[0]
                      : null;
                  const displayName = firstTraveller
                    ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
                    : "Unknown Traveller";
                  return (
                    <li
                      key={b._id}
                      className="p-4 bg-white rounded-lg shadow border"
                    >
                      <div
                        className="flex justify-between cursor-pointer"
                        onClick={() => toggleExpand("cancellation", b._id)}
                      >
                        <p className="font-semibold">
                          {b.tourData?.title || "Untitled Tour"} —{" "}
                          <strong>{displayName}</strong>{" "}
                          {/* Shows tour title followed by first traveller's name in bold */}
                        </p>
                        <span className="text-red-600 font-medium">
                          Cancellation Request
                        </span>
                      </div>

                      {expanded["cancellation"]?.[b._id] && (
                        <div className="mt-3 border-t pt-3 space-y-2 text-sm text-gray-700">
                          <p>
                            <strong>Booking ID:</strong> {b._id}
                          </p>
                          <h4 className="font-semibold">
                            Travellers Requested
                          </h4>
                          {b.travellers
                            .filter(
                              (t) =>
                                t.cancelled?.byTraveller &&
                                !t.cancelled?.byAdmin
                            )
                            .map((t, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center border p-2 rounded"
                              >
                                <span>
                                  {t.firstName} {t.lastName} ({t.age} yrs)
                                </span>
                                <span className="text-sm text-gray-500">
                                  {t.sharingType} sharing
                                </span>

                                <div className="flex space-x-2">
                                  <button
                                    onClick={() =>
                                      handleCancelBooking(b._id, t._id)
                                    }
                                    disabled={isLoading}
                                    className={`px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 ${
                                      isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    {isLoading
                                      ? "Processing..."
                                      : "Approve Cancellation"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReleaseBooking(b._id, t._id)
                                    }
                                    disabled={isLoading}
                                    className={`px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 ${
                                      isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    {isLoading
                                      ? "Processing..."
                                      : "Reject Cancellation"}
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default TourAdminDashboard;
