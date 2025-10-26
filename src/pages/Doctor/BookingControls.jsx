// import React, { useState, useContext, useEffect } from "react";
// import { TourContext } from "../../context/TourContext";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const BookingControls = () => {
//   const { viewTourBalance, updateTourBalance, balanceDetails } =
//     useContext(TourContext);
//   const [bookingId, setBookingId] = useState("");
//   const [updates, setUpdates] = useState([{ remarks: "", amount: "" }]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Log state changes for debugging
//   useEffect(() => {
//     console.log("Updates state:", updates);
//     console.log("Balance Details:", balanceDetails); // Debug balanceDetails
//   }, [updates, balanceDetails]);

//   // Handle input change for bookingId
//   const handleBookingIdChange = (e) => {
//     setBookingId(e.target.value);
//   };

//   // Handle view balance details
//   const handleViewBalance = async () => {
//     if (!bookingId.trim()) {
//       toast.error("Booking ID is required!");
//       return;
//     }
//     setIsLoading(true);
//     const result = await viewTourBalance(bookingId);
//     setIsLoading(false);
//     if (result?.success) {
//       toast.success("Balance details retrieved successfully!");
//     } else {
//       toast.error(result?.message || "Failed to retrieve balance details");
//     }
//   };

//   // Handle updates input change
//   const handleUpdateChange = (index, field, value) => {
//     const newUpdates = [...updates];
//     newUpdates[index] = { ...newUpdates[index], [field]: value || "" }; // Ensure object integrity
//     setUpdates(newUpdates);
//   };

//   // Add new update field
//   const addUpdateField = () => {
//     setUpdates([...updates, { remarks: "", amount: "" }]);
//   };

//   // Remove update field with confirmation
//   const removeUpdateField = (index) => {
//     if (updates.length <= 1) return;
//     if (window.confirm("Are you sure you want to remove this update?")) {
//       const filtered = updates.filter((_, i) => i !== index);
//       setUpdates(filtered.length ? filtered : [{ remarks: "", amount: "" }]);
//     }
//   };

//   // Handle update balance
//   const handleUpdateBalance = async () => {
//     if (!bookingId.trim()) {
//       toast.error("Booking ID required to update balance!");
//       return;
//     }

//     setIsLoading(true);
//     console.log("Before Update - Booking ID:", bookingId);
//     console.log("Before Update - Updates:", updates);
//     const validUpdates = updates
//       .map((u) => ({
//         remarks: u.remarks,
//         amount: u.amount.trim() === "" ? undefined : Number(u.amount),
//       }))
//       .filter((u) => u.amount !== undefined && !isNaN(u.amount));
//     console.log("Valid Updates:", validUpdates);
//     if (validUpdates.length === 0) {
//       toast.error("Please provide at least one valid amount");
//       setIsLoading(false);
//       return;
//     }

//     const result = await updateTourBalance(bookingId, validUpdates);
//     console.log("After Update - Result:", result);
//     setIsLoading(false);

//     if (result?.success) {
//       setUpdates([{ remarks: "", amount: "" }]); // Reset to one empty field
//       toast.success("Balance updated successfully!");
//     } else {
//       toast.error(result?.message || "Failed to update balance");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//           Booking Balance Management
//         </h2>

//         <div className="mb-6">
//           <label className="block font-medium mb-2">Booking ID</label>
//           <input
//             type="text"
//             value={bookingId}
//             onChange={handleBookingIdChange}
//             placeholder="Enter Booking ID"
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//           <button
//             onClick={handleViewBalance}
//             disabled={isLoading}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {isLoading ? "Loading..." : "View Balance"}
//           </button>
//         </div>

//         {balanceDetails && (
//           <div className="mb-6 bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-semibold text-lg mb-2">Balance Details</h3>
//             <p>Advance Amount: ₹{balanceDetails?.advance?.amount ?? 0}</p>
//             <p>Balance Amount: ₹{balanceDetails?.balance?.amount ?? 0}</p>
//             <div className="mt-4">
//               <h4 className="font-semibold">Admin Remarks:</h4>
//               {Array.isArray(balanceDetails?.adminRemarks) &&
//               balanceDetails.adminRemarks.length > 0 ? (
//                 <ul className="list-decimal ml-6 space-y-1">
//                   {balanceDetails.adminRemarks.map((r, index) => {
//                     const date = r?.addedAt
//                       ? new Date(r.addedAt).toLocaleDateString("en-GB")
//                       : "N/A";
//                     return (
//                       <li key={index}>
//                         ({date}) {r?.remark || "No remark"} - ₹{r?.amount ?? 0}
//                       </li>
//                     );
//                   })}
//                 </ul>
//               ) : (
//                 <p>None</p>
//               )}
//             </div>
//           </div>
//         )}

//         <div className="mb-6">
//           <h3 className="font-semibold text-lg mb-2">Update Balance</h3>
//           {Array.isArray(updates) && updates.length > 0 ? (
//             updates.map((u, i) => (
//               <div key={i} className="flex gap-4 mb-2 items-end">
//                 <input
//                   type="text"
//                   placeholder="Remarks"
//                   value={u.remarks || ""}
//                   onChange={(e) =>
//                     handleUpdateChange(i, "remarks", e.target.value)
//                   }
//                   className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Amount"
//                   value={u.amount || ""}
//                   onChange={(e) =>
//                     handleUpdateChange(i, "amount", e.target.value)
//                   }
//                   className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 {updates.length > 1 && (
//                   <button
//                     className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//                     onClick={() => removeUpdateField(i)}
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))
//           ) : (
//             <p>No updates available. Add an update to proceed.</p>
//           )}
//           <button
//             onClick={addUpdateField}
//             className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           >
//             Add More
//           </button>
//         </div>

//         <button
//           onClick={handleUpdateBalance}
//           className="w-full py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
//           disabled={isLoading}
//         >
//           {isLoading ? "Updating..." : "Update Balance"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BookingControls;

// CRITICAL COPY DO NOT DELETE
import React, { useState, useContext, useEffect } from "react";
import { TourContext } from "../../context/TourContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingControls = () => {
  const { viewTourBalance, updateTourBalance, balanceDetails } =
    useContext(TourContext);
  const [bookingId, setBookingId] = useState("");
  const [updates, setUpdates] = useState([{ remarks: "", amount: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  // Log state changes for debugging
  useEffect(() => {
    console.log("Updates state:", updates);
    console.log("Balance Details:", balanceDetails); // Debug balanceDetails
  }, [updates, balanceDetails]);

  // Handle input change for bookingId
  const handleBookingIdChange = (e) => {
    setBookingId(e.target.value);
  };

  // Handle view balance details
  const handleViewBalance = async () => {
    if (!bookingId.trim()) {
      toast.error("Booking ID is required!");
      return;
    }
    setIsLoading(true);
    const result = await viewTourBalance(bookingId);
    setIsLoading(false);
    if (result?.success) {
      toast.success("Balance details retrieved successfully!");
    } else {
      toast.error(result?.message || "Failed to retrieve balance details");
    }
  };

  // Handle updates input change
  const handleUpdateChange = (index, field, value) => {
    const newUpdates = [...updates];
    newUpdates[index] = { ...newUpdates[index], [field]: value || "" }; // Ensure object integrity
    setUpdates(newUpdates);
  };

  // Add new update field
  const addUpdateField = () => {
    setUpdates([...updates, { remarks: "", amount: "" }]);
  };

  // Remove update field with confirmation
  const removeUpdateField = (index) => {
    if (updates.length <= 1) return;
    if (window.confirm("Are you sure you want to remove this update?")) {
      const filtered = updates.filter((_, i) => i !== index);
      setUpdates(filtered.length ? filtered : [{ remarks: "", amount: "" }]);
    }
  };

  // Handle update balance
  const handleUpdateBalance = async () => {
    if (!bookingId.trim()) {
      toast.error("Booking ID required to update balance!");
      return;
    }

    setIsLoading(true);
    console.log("Before Update - Booking ID:", bookingId);
    console.log("Before Update - Updates:", updates);
    const validUpdates = updates
      .map((u) => ({
        remarks: u.remarks,
        amount: u.amount.trim() === "" ? undefined : Number(u.amount),
      }))
      .filter((u) => u.amount !== undefined && !isNaN(u.amount));
    console.log("Valid Updates:", validUpdates);
    if (validUpdates.length === 0) {
      toast.error("Please provide at least one valid amount");
      setIsLoading(false);
      return;
    }

    const result = await updateTourBalance(bookingId, validUpdates);
    console.log("After Update - Result:", result);
    setIsLoading(false);

    if (result?.success) {
      setUpdates([{ remarks: "", amount: "" }]); // Reset to one empty field
      toast.success("Balance updated successfully!");
    } else {
      toast.error(result?.message || "Failed to update balance");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          Booking Balance Management
        </h2>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-2">
            Booking ID
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <input
              type="text"
              value={bookingId}
              onChange={handleBookingIdChange}
              placeholder="Enter Booking ID"
              className="w-full sm:w-auto flex-1 p-2 sm:p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleViewBalance}
              disabled={isLoading}
              className="mt-2 sm:mt-0 w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "View Balance"}
            </button>
          </div>
        </div>

        {balanceDetails && (
          <div className="mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2">
              Balance Details
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm sm:text-base md:text-lg">
                Advance Amount: ₹{balanceDetails?.advance?.amount ?? 0}
              </p>
              <p className="text-sm sm:text-base md:text-lg">
                Balance Amount: ₹{balanceDetails?.balance?.amount ?? 0}
              </p>
              <div className="mt-2 sm:mt-3">
                <h4 className="text-sm sm:text-base md:text-lg font-semibold">
                  Admin Remarks:
                </h4>
                {Array.isArray(balanceDetails?.adminRemarks) &&
                balanceDetails.adminRemarks.length > 0 ? (
                  <ul className="list-decimal ml-4 sm:ml-6 md:ml-8 space-y-1 sm:space-y-2">
                    {balanceDetails.adminRemarks.map((r, index) => {
                      const date = r?.addedAt
                        ? new Date(r.addedAt).toLocaleDateString("en-GB")
                        : "N/A";
                      return (
                        <li
                          key={index}
                          className="text-sm sm:text-base md:text-lg"
                        >
                          ({date}) {r?.remark || "No remark"} - ₹
                          {r?.amount ?? 0}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-base md:text-lg">None</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2">
            Update Balance
          </h3>
          {Array.isArray(updates) && updates.length > 0 ? (
            updates.map((u, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-2 sm:mb-3"
              >
                <input
                  type="text"
                  placeholder="Remarks"
                  value={u.remarks || ""}
                  onChange={(e) =>
                    handleUpdateChange(i, "remarks", e.target.value)
                  }
                  className="w-full sm:w-auto flex-1 p-2 sm:p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={u.amount || ""}
                  onChange={(e) =>
                    handleUpdateChange(i, "amount", e.target.value)
                  }
                  className="w-full sm:w-auto flex-1 p-2 sm:p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {updates.length > 1 && (
                  <button
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={() => removeUpdateField(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm sm:text-base md:text-lg">
              No updates available. Add an update to proceed.
            </p>
          )}
          <button
            onClick={addUpdateField}
            className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add More
          </button>
        </div>

        <button
          onClick={handleUpdateBalance}
          className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-green-600 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Balance"}
        </button>
      </div>
    </div>
  );
};

export default BookingControls;
