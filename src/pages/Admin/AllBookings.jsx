// import React, { useContext, useEffect, useState, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { ChevronDown, ChevronRight } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const AllBookings = () => {
//   const { aToken, bookings, getAllBookings, rejectBooking } =
//     useContext(TourAdminContext);
//   const location = useLocation();

//   const [expandedRow, setExpandedRow] = useState(null);
//   const [filters, setFilters] = useState({
//     tour: "",
//     contact: "",
//     payment: "",
//     status: "",
//   });
//   const [rejectedTravellers, setRejectedTravellers] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   // Clear toasts on route change
//   useEffect(() => {
//     return () => {
//       toast.dismiss();
//     };
//   }, [location]);

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

//   // Fetch bookings
//   useEffect(() => {
//     if (aToken) {
//       console.log(
//         "Fetching all bookings at",
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//       );
//       setIsLoading(true);
//       getAllBookings()
//         .then((response) => {
//           handleApiResponse(
//             response,
//             "Bookings fetched successfully",
//             "Failed to fetch bookings"
//           );
//         })
//         .catch((error) => {
//           console.error(
//             "Fetch bookings error at",
//             new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//             error
//           );
//           toast.error(
//             error.response?.data?.message ||
//               error.message ||
//               "Failed to fetch bookings"
//           );
//         })
//         .finally(() => setIsLoading(false));
//     }
//   }, [aToken, getAllBookings, handleApiResponse]);

//   const toggleRow = (index) => {
//     setExpandedRow(expandedRow === index ? null : index);
//   };

//   // Filtered Bookings with new bookings first
//   const filteredBookings = bookings
//     ?.filter((b) => {
//       // Get the first traveller's name for filtering
//       const firstTraveller =
//         b.travellers && b.travellers.length > 0 ? b.travellers[0] : null;
//       const displayName = firstTraveller
//         ? `${firstTraveller.firstName} ${firstTraveller.lastName}`.toLowerCase()
//         : "unknown traveller";

//       const tourMatch = b?.tourData?.title
//         ?.toLowerCase()
//         .includes(filters.tour.toLowerCase());

//       const contactMatch =
//         displayName.includes(filters.contact.toLowerCase()) ||
//         b?.contact?.mobile
//           ?.toLowerCase()
//           .includes(filters.contact.toLowerCase());

//       const paymentStatus = `${
//         b.payment?.advance?.paid ? "advance-paid" : "advance-pending"
//       } ${b.payment?.balance?.paid ? "balance-paid" : "balance-pending"}`;

//       const paymentMatch = paymentStatus.includes(
//         filters.payment.toLowerCase()
//       );

//       const statusValue = b.isBookingCompleted
//         ? "completed"
//         : b.cancelled?.byAdmin || b.cancelled?.byTraveller
//         ? "cancelled"
//         : "under completion";

//       const statusMatch = statusValue.includes(filters.status.toLowerCase());

//       return tourMatch && contactMatch && paymentMatch && statusMatch;
//     })
//     .sort((a, b) => {
//       // Sort to show newly added bookings first (assuming newer bookings have higher _id or timestamp)
//       return (
//         new Date(b.createdAt) - new Date(a.createdAt) ||
//         b._id.localeCompare(a._id)
//       );
//     });

//   // Handle reject with confirmation
//   const handleReject = async (bookingId, travellerId) => {
//     const confirmReject = window.confirm(
//       "Are you sure you want to reject this booking?"
//     );
//     if (confirmReject) {
//       setIsLoading(true);
//       try {
//         console.log(
//           `Rejecting booking ${bookingId} for traveller ${travellerId} at`,
//           new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//         );
//         const response = await rejectBooking(bookingId, [travellerId]);
//         if (
//           handleApiResponse(
//             response,
//             "Booking rejected successfully",
//             "Failed to reject booking"
//           )
//         ) {
//           setRejectedTravellers((prev) => ({
//             ...prev,
//             [travellerId]: true,
//           }));
//         }
//       } catch (error) {
//         console.error(
//           "Reject booking error at",
//           new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//           error
//         );
//         toast.error(
//           error.response?.data?.message ||
//             error.message ||
//             "Failed to reject booking"
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="p-1 sm:p-2 md:p-3 lg:p-4 xl:p-6 2xl:p-8 w-full max-w-full">
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
//       <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-center ml-4 sm:ml-0 md:ml-0 lg:ml-0 xl:ml-0 2xl:ml-0">
//         Super Admin Bookings Dashboard
//       </h1>

//       {!aToken ? (
//         <div className="text-center">
//           <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-red-500">
//             Unauthorized Access 🚫
//           </h2>
//           <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">
//             Please login as Admin to continue.
//           </p>
//         </div>
//       ) : isLoading ? (
//         <div className="text-center text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg">
//           Loading bookings...
//         </div>
//       ) : !bookings || bookings.length === 0 ? (
//         <p className="text-center text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg">
//           No bookings found
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
//             <thead className="bg-gray-100 border-b">
//               <tr>
//                 <th className="p-1 sm:p-2"></th>
//                 <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
//                   S.No
//                 </th>
//                 <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
//                   Tour
//                   <input
//                     type="text"
//                     placeholder="Filter tour"
//                     value={filters.tour}
//                     onChange={(e) =>
//                       setFilters({ ...filters, tour: e.target.value })
//                     }
//                     className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
//                     disabled={isLoading}
//                   />
//                 </th>
//                 <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
//                   Contact
//                   <input
//                     type="text"
//                     placeholder="Filter contact"
//                     value={filters.contact}
//                     onChange={(e) =>
//                       setFilters({ ...filters, contact: e.target.value })
//                     }
//                     className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
//                     disabled={isLoading}
//                   />
//                 </th>
//                 <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
//                   Payment
//                   <select
//                     value={filters.payment}
//                     onChange={(e) =>
//                       setFilters({ ...filters, payment: e.target.value })
//                     }
//                     className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
//                     disabled={isLoading}
//                   >
//                     <option value="">All</option>
//                     <option value="advance-paid">Advance Paid</option>
//                     <option value="advance-pending">Advance Pending</option>
//                     <option value="balance-paid">Balance Paid</option>
//                     <option value="balance-pending">Balance Pending</option>
//                   </select>
//                 </th>
//                 <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
//                   Status
//                   <select
//                     value={filters.status}
//                     onChange={(e) =>
//                       setFilters({ ...filters, status: e.target.value })
//                     }
//                     className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
//                     disabled={isLoading}
//                   >
//                     <option value="">All</option>
//                     <option value="completed">Completed</option>
//                     <option value="cancelled">Cancelled</option>
//                     <option value="under completion">Under Completion</option>
//                   </select>
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredBookings.map((booking, index) => {
//                 // Get the first traveller's name, fallback to "Unknown Traveller" if none
//                 const firstTraveller =
//                   booking.travellers && booking.travellers.length > 0
//                     ? booking.travellers[0]
//                     : null;
//                 const displayName = firstTraveller
//                   ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
//                   : "Unknown Traveller";
//                 return (
//                   <React.Fragment key={booking._id}>
//                     <tr
//                       className="border-b hover:bg-gray-50 transition cursor-pointer"
//                       onClick={() => toggleRow(index)}
//                     >
//                       <td className="p-1 sm:p-2 text-gray-600">
//                         {expandedRow === index ? (
//                           <ChevronDown size={12} sm:size={16} />
//                         ) : (
//                           <ChevronRight size={12} sm:size={16} />
//                         )}
//                       </td>
//                       <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
//                         {index + 1}
//                       </td>
//                       <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
//                         {booking?.tourData?.title || "N/A"}
//                       </td>
//                       <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
//                         <div>
//                           <strong>{displayName}</strong>
//                         </div>
//                         <div>{booking?.contact?.mobile}</div>
//                       </td>
//                       <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
//                         <div>
//                           Advance:{" "}
//                           {booking.payment?.advance?.paid ? (
//                             <span className="text-green-600">Paid ✅</span>
//                           ) : (
//                             <span className="text-red-600">Pending ❌</span>
//                           )}
//                         </div>
//                         <div>
//                           Balance:{" "}
//                           {booking.payment?.balance?.paid ? (
//                             <span className="text-green-600">Paid ✅</span>
//                           ) : (
//                             <span className="text-yellow-600">Pending ⏳</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="p-1 sm:p-2 text-xs sm:text-sm font-medium">
//                         {booking.isBookingCompleted ? (
//                           <span className="text-green-600">Completed ✅</span>
//                         ) : booking.cancelled?.byAdmin ||
//                           booking.cancelled?.byTraveller ? (
//                           <span className="text-red-600">Cancelled ❌</span>
//                         ) : (
//                           <span className="text-yellow-600">
//                             Under completion ⏳
//                           </span>
//                         )}
//                       </td>
//                     </tr>

//                     {expandedRow === index && (
//                       <tr className="bg-gray-50">
//                         <td></td>
//                         <td
//                           colSpan="5"
//                           className="p-1 sm:p-2 md:p-4 lg:p-6 xl:p-8"
//                         >
//                           <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
//                             Travellers
//                           </h4>
//                           {booking.travellers &&
//                           booking.travellers.length > 0 ? (
//                             <ul className="list-disc list-inside space-y-1 sm:space-y-2">
//                               {booking.travellers.map((t, i) => {
//                                 const isCancelledByAdmin = t.cancelled?.byAdmin;
//                                 const isCancelledByTraveller =
//                                   t.cancelled?.byTraveller;
//                                 const isLocallyRejected =
//                                   rejectedTravellers[t._id];

//                                 const isDisabled =
//                                   isCancelledByAdmin ||
//                                   isCancelledByTraveller ||
//                                   isLocallyRejected ||
//                                   isLoading;

//                                 let buttonLabel = "Reject Booking";
//                                 if (isCancelledByTraveller) {
//                                   buttonLabel = "Cancelled by Traveller";
//                                 } else if (
//                                   isCancelledByAdmin ||
//                                   isLocallyRejected
//                                 ) {
//                                   buttonLabel = "Booking Rejected";
//                                 }

//                                 return (
//                                   <li
//                                     key={i}
//                                     className="text-xs sm:text-sm md:text-base text-gray-700 flex justify-between items-center"
//                                   >
//                                     <span>
//                                       {t.title} {t.firstName} {t.lastName} (
//                                       {t.age}y)
//                                     </span>

//                                     <button
//                                       disabled={isDisabled}
//                                       onClick={
//                                         !isDisabled
//                                           ? () =>
//                                               handleReject(booking._id, t._id)
//                                           : undefined
//                                       }
//                                       className={`ml-1 sm:ml-2 md:ml-4 px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded text-xs sm:text-sm md:text-base ${
//                                         isDisabled
//                                           ? "bg-gray-400 text-white cursor-not-allowed"
//                                           : "bg-red-500 text-white hover:bg-red-600"
//                                       }`}
//                                     >
//                                       {isLoading &&
//                                       !isCancelledByAdmin &&
//                                       !isCancelledByTraveller &&
//                                       !isLocallyRejected
//                                         ? "Rejecting..."
//                                         : buttonLabel}
//                                     </button>
//                                   </li>
//                                 );
//                               })}
//                             </ul>
//                           ) : (
//                             <p className="text-xs sm:text-sm md:text-base text-gray-500">
//                               No travellers
//                             </p>
//                           )}
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })}

//               {filteredBookings.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan="6"
//                     className="text-center text-gray-500 p-1 sm:p-2 md:p-4 text-xs sm:text-sm md:text-base"
//                   >
//                     No results match your filters
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllBookings;

import React, { useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { TourAdminContext } from "../../context/TourAdminContext";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllBookings = () => {
  const { aToken, bookings, getAllBookings, rejectBooking } =
    useContext(TourAdminContext);
  const location = useLocation();

  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({
    tour: "",
    contact: "",
    payment: "",
    status: "",
  });
  const [rejectedTravellers, setRejectedTravellers] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  // Fetch bookings
  useEffect(() => {
    if (aToken) {
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
    }
  }, [aToken, getAllBookings, handleApiResponse]);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Booking ID copied!"),
      () => toast.error("Failed to copy")
    );
  };

  // Filtered Bookings with new bookings first
  const filteredBookings = bookings
    ?.filter((b) => {
      const firstTraveller =
        b.travellers && b.travellers.length > 0 ? b.travellers[0] : null;
      const displayName = firstTraveller
        ? `${firstTraveller.firstName} ${firstTraveller.lastName}`.toLowerCase()
        : "unknown traveller";

      const tourMatch = b?.tourData?.title
        ?.toLowerCase()
        .includes(filters.tour.toLowerCase());

      const contactMatch =
        displayName.includes(filters.contact.toLowerCase()) ||
        b?.contact?.mobile
          ?.toLowerCase()
          .includes(filters.contact.toLowerCase());

      const paymentStatus = `${
        b.payment?.advance?.paid ? "advance-paid" : "advance-pending"
      } ${b.payment?.balance?.paid ? "balance-paid" : "balance-pending"}`;

      const paymentMatch = paymentStatus.includes(
        filters.payment.toLowerCase()
      );

      const statusValue = b.isBookingCompleted
        ? "completed"
        : b.cancelled?.byAdmin || b.cancelled?.byTraveller
        ? "cancelled"
        : "under completion";

      const statusMatch = statusValue.includes(filters.status.toLowerCase());

      return tourMatch && contactMatch && paymentMatch && statusMatch;
    })
    .sort((a, b) => {
      return (
        new Date(b.createdAt) - new Date(a.createdAt) ||
        b._id.localeCompare(a._id)
      );
    });

  // Handle reject with confirmation
  const handleReject = async (bookingId, travellerId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this booking?"
    );
    if (confirmReject) {
      setIsLoading(true);
      try {
        console.log(
          `Rejecting booking ${bookingId} for traveller ${travellerId} at`,
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        );
        const response = await rejectBooking(bookingId, [travellerId]);
        if (
          handleApiResponse(
            response,
            "Booking rejected successfully",
            "Failed to reject booking"
          )
        ) {
          setRejectedTravellers((prev) => ({
            ...prev,
            [travellerId]: true,
          }));
        }
      } catch (error) {
        console.error(
          "Reject booking error at",
          new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          error
        );
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to reject booking"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-1 sm:p-2 md:p-3 lg:p-4 xl:p-6 2xl:p-8 w-full max-w-full">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pausaOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-center ml-4 sm:ml-0 md:ml-0 lg:ml-0 xl:ml-0 2xl:ml-0">
        Super Admin Bookings Dashboard
      </h1>

      {!aToken ? (
        <div className="text-center">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-red-500">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">
            Please login as Admin to continue.
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg">
          Loading bookings...
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <p className="text-center text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg">
          No bookings found
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-1 sm:p-2"></th>
                <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  S.No
                </th>
                <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Tour
                  <input
                    type="text"
                    placeholder="Filter tour"
                    value={filters.tour}
                    onChange={(e) =>
                      setFilters({ ...filters, tour: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
                    disabled={isLoading}
                  />
                </th>
                <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Contact
                  <input
                    type="text"
                    placeholder="Filter contact"
                    value={filters.contact}
                    onChange={(e) =>
                      setFilters({ ...filters, contact: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
                    disabled={isLoading}
                  />
                </th>
                <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Payment
                  <select
                    value={filters.payment}
                    onChange={(e) =>
                      setFilters({ ...filters, payment: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    <option value="">All</option>
                    <option value="advance-paid">Advance Paid</option>
                    <option value="advance-pending">Advance Pending</option>
                    <option value="balance-paid">Balance Paid</option>
                    <option value="balance-pending">Balance Pending</option>
                  </select>
                </th>
                <th className="p-1 sm:p-2 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Status
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="mt-1 w-full border rounded px-1 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="under completion">Under Completion</option>
                  </select>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking, index) => {
                const firstTraveller =
                  booking.travellers && booking.travellers.length > 0
                    ? booking.travellers[0]
                    : null;
                const displayName = firstTraveller
                  ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
                  : "Unknown Traveller";
                return (
                  <React.Fragment key={booking._id}>
                    <tr
                      className="border-b hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => toggleRow(index)}
                    >
                      <td className="p-1 sm:p-2 text-gray-600">
                        {expandedRow === index ? (
                          <ChevronDown size={12} className="sm:w-4 sm:h-4" />
                        ) : (
                          <ChevronRight size={12} className="sm:w-4 sm:h-4" />
                        )}
                      </td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
                        {index + 1}
                      </td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
                        {booking?.tourData?.title || "N/A"}
                      </td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
                        <div>
                          <strong>{displayName}</strong>
                        </div>
                        <div>{booking?.contact?.mobile}</div>
                      </td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm text-gray-800">
                        <div>
                          Advance:{" "}
                          {booking.payment?.advance?.paid ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-red-600">Pending</span>
                          )}
                        </div>
                        <div>
                          Balance:{" "}
                          {booking.payment?.balance?.paid ? (
                            <span className="text-green-600">Paid</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </div>
                      </td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm font-medium">
                        {booking.isBookingCompleted ? (
                          <span className="text-green-600">Completed</span>
                        ) : booking.cancelled?.byAdmin ||
                          booking.cancelled?.byTraveller ? (
                          <span className="text-red-600">Cancelled</span>
                        ) : (
                          <span className="text-yellow-600">
                            Under completion
                          </span>
                        )}
                      </td>
                    </tr>

                    {expandedRow === index && (
                      <tr className="bg-gray-50">
                        <td></td>
                        <td
                          colSpan="5"
                          className="p-1 sm:p-2 md:p-4 lg:p-6 xl:p-8"
                        >
                          {/* Booking ID with Copy Button */}
                          <div className="mb-2 flex items-center gap-2 text-xs sm:text-sm">
                            <strong>Booking ID:</strong>
                            <code className="bg-gray-200 px-2 py-1 rounded font-mono text-xs">
                              {booking._id}
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(booking._id);
                              }}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                              title="Copy Booking ID"
                            >
                              <Copy size={14} />
                              Copy
                            </button>
                          </div>

                          <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
                            Travellers
                          </h4>
                          {booking.travellers &&
                          booking.travellers.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                              {booking.travellers.map((t, i) => {
                                const isCancelledByAdmin = t.cancelled?.byAdmin;
                                const isCancelledByTraveller =
                                  t.cancelled?.byTraveller;
                                const isLocallyRejected =
                                  rejectedTravellers[t._id];

                                const isDisabled =
                                  isCancelledByAdmin ||
                                  isCancelledByTraveller ||
                                  isLocallyRejected ||
                                  isLoading;

                                let buttonLabel = "Reject Booking";
                                if (isCancelledByTraveller) {
                                  buttonLabel = "Cancelled by Traveller";
                                } else if (
                                  isCancelledByAdmin ||
                                  isLocallyRejected
                                ) {
                                  buttonLabel = "Booking Rejected";
                                }

                                return (
                                  <li
                                    key={i}
                                    className="text-xs sm:text-sm md:text-base text-gray-700 flex justify-between items-center"
                                  >
                                    <span>
                                      {t.title} {t.firstName} {t.lastName} (
                                      {t.age}y)
                                    </span>

                                    <button
                                      disabled={isDisabled}
                                      onClick={
                                        !isDisabled
                                          ? () =>
                                              handleReject(booking._id, t._id)
                                          : undefined
                                      }
                                      className={`ml-1 sm:ml-2 md:ml-4 px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded text-xs sm:text-sm md:text-base ${
                                        isDisabled
                                          ? "bg-gray-400 text-white cursor-not-allowed"
                                          : "bg-red-500 text-white hover:bg-red-600"
                                      }`}
                                    >
                                      {isLoading &&
                                      !isCancelledByAdmin &&
                                      !isCancelledByTraveller &&
                                      !isLocallyRejected
                                        ? "Rejecting..."
                                        : buttonLabel}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-xs sm:text-sm md:text-base text-gray-500">
                              No travellers
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredBookings.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-500 p-1 sm:p-2 md:p-4 text-xs sm:text-sm md:text-base"
                  >
                    No results match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllBookings;
