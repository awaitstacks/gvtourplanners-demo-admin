// import React, { useContext, useEffect } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { toast } from "react-toastify";
// import { format } from "date-fns";

// const BookingApprovals = () => {
//   const {
//     pendingApprovals,
//     getPendingApprovals,
//     approveBookingUpdate,
//     rejectBookingUpdate,
//     aToken,
//   } = useContext(TourAdminContext);

//   useEffect(() => {
//     if (aToken) {
//       getPendingApprovals();
//     }
//   }, [aToken, getPendingApprovals]);

//   const handleApprove = async (bookingId) => {
//     if (!window.confirm("Are you sure you want to approve this update?"))
//       return;
//     try {
//       await approveBookingUpdate(bookingId);
//       toast.success("Update approved and applied!");
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleReject = async (bookingId) => {
//     if (!window.confirm("Are you sure you want to reject this update request?"))
//       return;
//     try {
//       await rejectBookingUpdate(bookingId, "Update rejected by admin");
//       toast.success("Update request rejected!");
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   if (!pendingApprovals || pendingApprovals.length === 0) {
//     return (
//       <div className="p-6 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-4 text-gray-800">
//           Pending Booking Updates
//         </h2>
//         <p className="text-gray-600">No pending approvals at the moment.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">
//           Pending Booking Updates ({pendingApprovals.length})
//         </h2>
//         <button
//           onClick={getPendingApprovals}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//         >
//           Refresh
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 User
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Tour
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Old Amounts
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 New Amounts
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Travellers
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Requested On
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {pendingApprovals.map((item) => {
//               const original = item.bookingId || {};
//               const user = item.userId || {};
//               const tour = item.tourId || {};

//               const bookingId = item.bookingId?._id || item.bookingId;

//               // Extract Old Values from Original Booking
//               const oldAdvance = original.payment?.advance?.amount || 0;
//               const oldBalance = original.payment?.balance?.amount || 0;

//               // Extract New Values from ManageBooking
//               const newAdvance = item.updatedAdvance || 0;
//               const newBalance = item.updatedBalance || 0;

//               return (
//                 <tr key={item._id} className="hover:bg-gray-50">
//                   {/* User Info */}
//                   <td className="px-4 py-4 whitespace-nowrap text-sm">
//                     <div>
//                       <p className="font-medium text-gray-900">{user.name}</p>
//                       <p className="text-gray-500">{user.email}</p>
//                       <p className="text-gray-500">{user.mobile}</p>
//                     </div>
//                   </td>

//                   {/* Tour Info */}
//                   <td className="px-4 py-4 text-sm">
//                     <div>
//                       <p className="font-medium text-gray-900">{tour.title}</p>
//                       <p className="text-gray-500">{tour.destination}</p>
//                       <p className="text-xs text-gray-400">
//                         {tour.startDate &&
//                           format(new Date(tour.startDate), "dd MMM yyyy")}
//                       </p>
//                     </div>
//                   </td>

//                   {/* OLD AMOUNTS */}
//                   <td className="px-4 py-4 text-sm">
//                     <div className="space-y-1 text-gray-600">
//                       <p>
//                         <strong>Advance:</strong> ₹{oldAdvance.toLocaleString()}
//                       </p>
//                       <p>
//                         <strong>Balance:</strong> ₹{oldBalance.toLocaleString()}
//                       </p>
//                     </div>
//                   </td>

//                   {/* NEW AMOUNTS */}
//                   <td className="px-4 py-4 text-sm">
//                     <div className="space-y-1">
//                       <p
//                         className={
//                           newAdvance !== oldAdvance
//                             ? "text-green-600 font-medium"
//                             : ""
//                         }
//                       >
//                         <strong>Advance:</strong> ₹{newAdvance.toLocaleString()}
//                         {newAdvance !== oldAdvance && " ↑"}
//                       </p>
//                       <p
//                         className={
//                           newBalance !== oldBalance
//                             ? "text-blue-600 font-medium"
//                             : ""
//                         }
//                       >
//                         <strong>Balance:</strong> ₹{newBalance.toLocaleString()}
//                         {newBalance !== oldBalance && " ↑"}
//                       </p>
//                     </div>
//                   </td>

//                   {/* Travellers Count */}
//                   <td className="px-4 py-4 text-sm text-center">
//                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       {item.travellers?.length || 0} Traveller(s)
//                     </span>
//                   </td>

//                   {/* Requested Date */}
//                   <td className="px-4 py-4 text-sm text-gray-600">
//                     {format(new Date(item.bookingDate), "dd MMM yyyy, hh:mm a")}
//                   </td>

//                   {/* Actions */}
//                   <td className="px-4 py-4 text-sm space-x-2">
//                     <button
//                       onClick={() => handleApprove(bookingId)}
//                       className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => handleReject(bookingId)}
//                       className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
//                     >
//                       Reject
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-4 text-xs text-gray-500 space-y-1">
//         <p>
//           * Approving will update the original booking with new advance,
//           balance, and traveller details.
//         </p>
//         <p>
//           * Rejecting will close the update request without changing the
//           original booking.
//         </p>
//         <p className="text-green-600">↑ Indicates change in amount</p>
//       </div>
//     </div>
//   );
// };

// export default BookingApprovals;

// BookingApprovals.jsx
import React, { useContext, useEffect } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast } from "react-toastify";
import { format } from "date-fns";

const BookingApprovals = () => {
  const {
    pendingApprovals,
    getPendingApprovals,
    approveBookingUpdate,
    rejectBookingUpdate,
    aToken,
  } = useContext(TourAdminContext);

  useEffect(() => {
    if (aToken) getPendingApprovals();
  }, [aToken, getPendingApprovals]);

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Are you sure you want to approve this update?"))
      return;
    try {
      await approveBookingUpdate(bookingId);
      toast.success("Update approved and applied!");
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Are you sure you want to reject this update request?"))
      return;
    try {
      await rejectBookingUpdate(bookingId, "Update rejected by admin");
      toast.success("Update request rejected!");
    } catch (err) {
      console.log(err);
    }
  };

  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pending Booking Updates
        </h2>
        <p className="text-gray-600">No pending approvals at the moment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Pending Booking Updates ({pendingApprovals.length})
        </h2>
        <button
          onClick={getPendingApprovals}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          Refresh
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tour
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Old Amounts
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Amounts
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Travellers
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested On
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingApprovals.map((item) => {
              const original = item.bookingId || {};
              const user = item.userId || {};
              const tour = item.tourId || {};
              const bookingId = item.bookingId?._id || item.bookingId;

              const oldAdvance = original.payment?.advance?.amount || 0;
              const oldBalance = original.payment?.balance?.amount || 0;
              const newAdvance = item.updatedAdvance || 0;
              const newBalance = item.updatedBalance || 0;

              return (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  {/* User */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-gray-500">{user.email}</p>
                      <p className="text-gray-500">{user.mobile}</p>
                    </div>
                  </td>

                  {/* Tour */}
                  <td className="px-4 py-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{tour.title}</p>
                      <p className="text-gray-500">{tour.destination}</p>
                      <p className="text-xs text-gray-400">
                        {tour.startDate &&
                          format(new Date(tour.startDate), "dd MMM yyyy")}
                      </p>
                    </div>
                  </td>

                  {/* Old Amounts */}
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      <p>
                        <strong>Advance:</strong> ₹{oldAdvance.toLocaleString()}
                      </p>
                      <p>
                        <strong>Balance:</strong> ₹{oldBalance.toLocaleString()}
                      </p>
                    </div>
                  </td>

                  {/* New Amounts */}
                  <td className="px-4 py-4 text-sm">
                    <div className="space-y-1">
                      <p
                        className={
                          newAdvance !== oldAdvance
                            ? "text-green-600 font-medium"
                            : ""
                        }
                      >
                        <strong>Advance:</strong> ₹{newAdvance.toLocaleString()}
                        {newAdvance !== oldAdvance && " up"}
                      </p>
                      <p
                        className={
                          newBalance !== oldBalance
                            ? "text-blue-600 font-medium"
                            : ""
                        }
                      >
                        <strong>Balance:</strong> ₹{newBalance.toLocaleString()}
                        {newBalance !== oldBalance && " up"}
                      </p>
                    </div>
                  </td>

                  {/* Travellers – BETTER BADGE */}
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H9v-1c0-1.105.895-2 2-2h2c1.105 0 2 .895 2 2v1z"
                        />
                      </svg>
                      {item.travellers?.length || 0}
                    </span>
                  </td>

                  {/* Requested On */}
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {format(new Date(item.bookingDate), "dd MMM yyyy, hh:mm a")}
                  </td>

                  {/* Actions – NICER BUTTONS */}
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(bookingId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-medium shadow-sm transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(bookingId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-xs font-medium shadow-sm transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards – SAME POLISH */}
      <div className="lg:hidden space-y-4">
        {pendingApprovals.map((item) => {
          const original = item.bookingId || {};
          const user = item.userId || {};
          const tour = item.tourId || {};
          const bookingId = item.bookingId?._id || item.bookingId;

          const oldAdvance = original.payment?.advance?.amount || 0;
          const oldBalance = original.payment?.balance?.amount || 0;
          const newAdvance = item.updatedAdvance || 0;
          const newBalance = item.updatedBalance || 0;

          return (
            <div
              key={item._id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{tour.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {format(new Date(item.bookingDate), "dd MMM yyyy")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(item.bookingDate), "hh:mm a")}
                  </p>
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-600">Old</p>
                  <p className="text-sm">
                    <strong>Advance:</strong> ₹{oldAdvance.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Balance:</strong> ₹{oldBalance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">New</p>
                  <p
                    className={
                      newAdvance !== oldAdvance
                        ? "text-green-600 font-medium text-sm"
                        : "text-sm"
                    }
                  >
                    <strong>Advance:</strong> ₹{newAdvance.toLocaleString()}
                    {newAdvance !== oldAdvance && " up"}
                  </p>
                  <p
                    className={
                      newBalance !== oldBalance
                        ? "text-blue-600 font-medium text-sm"
                        : "text-sm"
                    }
                  >
                    <strong>Balance:</strong> ₹{newBalance.toLocaleString()}
                    {newBalance !== oldBalance && " up"}
                  </p>
                </div>
              </div>

              {/* Travellers – SAME NICE BADGE */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H9v-1c0-1.105.895-2 2-2h2c1.105 0 2 .895 2 2v1z"
                    />
                  </svg>
                  {item.travellers?.length || 0}
                </span>
              </div>

              {/* Actions – SAME NICE BUTTONS */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(bookingId)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-medium shadow-sm transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={() => handleReject(bookingId)}
                  className="flex-1 flex items-center justify-center gap-1.5  px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-xs font-medium shadow-sm transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-6 text-xs text-gray-500 space-y-1">
        <p>
          * Approving will update the original booking with new advance,
          balance, and traveller details.
        </p>
        <p>
          * Rejecting will close the update request without changing the
          original booking.
        </p>
        <p className="text-green-600">up Indicates change in amount</p>
      </div>
    </div>
  );
};

export default BookingApprovals;
