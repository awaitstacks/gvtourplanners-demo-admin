import React, { useState, useContext } from "react";
import { TourContext } from "../../context/TourContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingControls = () => {
  const {
    viewTourBalance,
    updateTourBalance,
    balanceDetails,
    viewTourAdvance,
    updateTourAdvance,
    advanceDetails,
  } = useContext(TourContext);

  const [bookingId, setBookingId] = useState("");
  const [balanceUpdates, setBalanceUpdates] = useState([
    { remarks: "", amount: "" },
  ]);
  const [advanceUpdates, setAdvanceUpdates] = useState([
    { remarks: "", amount: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookingIdChange = (e) => setBookingId(e.target.value);

  // ==================== BALANCE SECTION ====================
  const handleViewBalance = async () => {
    if (!bookingId.trim()) {
      toast.error("Booking ID is required!");
      return;
    }
    setIsLoading(true);
    const result = await viewTourBalance(bookingId);
    setIsLoading(false);
    result?.success
      ? toast.success("Balance details retrieved successfully!")
      : toast.error(result?.message || "Failed to retrieve balance details");
  };

  const handleBalanceChange = (index, field, value) => {
    const newUpdates = [...balanceUpdates];
    newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
    setBalanceUpdates(newUpdates);
  };

  const addBalanceField = () =>
    setBalanceUpdates([...balanceUpdates, { remarks: "", amount: "" }]);

  const removeBalanceField = (index) => {
    if (balanceUpdates.length <= 1) return;
    if (window.confirm("Are you sure you want to remove this update?")) {
      const filtered = balanceUpdates.filter((_, i) => i !== index);
      setBalanceUpdates(
        filtered.length ? filtered : [{ remarks: "", amount: "" }]
      );
    }
  };

  const handleUpdateBalance = async () => {
    if (!bookingId.trim()) {
      toast.error("Booking ID required to update balance!");
      return;
    }

    const validUpdates = balanceUpdates
      .map((u) => ({
        remarks: u.remarks,
        amount: u.amount.trim() === "" ? undefined : Number(u.amount),
      }))
      .filter((u) => u.amount !== undefined && !isNaN(u.amount));

    if (validUpdates.length === 0) {
      toast.error("Please provide at least one valid amount");
      return;
    }

    setIsLoading(true);
    const result = await updateTourBalance(bookingId, validUpdates);
    setIsLoading(false);

    if (result?.success) {
      setBalanceUpdates([{ remarks: "", amount: "" }]);
      toast.success("Balance updated successfully!");
    } else {
      toast.error(result?.message || "Failed to update balance");
    }
  };

  // ==================== ADVANCE SECTION ====================
  const handleViewAdvance = async () => {
    if (!bookingId.trim()) {
      toast.error("Booking ID is required!");
      return;
    }
    setIsLoading(true);
    const result = await viewTourAdvance(bookingId);
    setIsLoading(false);
    result?.success
      ? toast.success("Advance details retrieved successfully!")
      : toast.error(result?.message || "Failed to retrieve advance details");
  };

  const handleAdvanceChange = (index, field, value) => {
    const newUpdates = [...advanceUpdates];
    newUpdates[index] = { ...newUpdates[index], [field]: value || "" };
    setAdvanceUpdates(newUpdates);
  };

  const addAdvanceField = () =>
    setAdvanceUpdates([...advanceUpdates, { remarks: "", amount: "" }]);

  const removeAdvanceField = (index) => {
    if (advanceUpdates.length <= 1) return;
    if (window.confirm("Are you sure you want to remove this update?")) {
      const filtered = advanceUpdates.filter((_, i) => i !== index);
      setAdvanceUpdates(
        filtered.length ? filtered : [{ remarks: "", amount: "" }]
      );
    }
  };

  const handleUpdateAdvance = async () => {
    if (!bookingId.trim()) {
      toast.error("Booking ID required to update advance!");
      return;
    }

    const validUpdates = advanceUpdates
      .map((u) => ({
        remarks: u.remarks,
        amount: u.amount.trim() === "" ? undefined : Number(u.amount),
      }))
      .filter(
        (u) => u.amount !== undefined && !isNaN(u.amount) && u.amount > 0
      );

    if (validUpdates.length === 0) {
      toast.error("Please provide at least one valid positive amount");
      return;
    }

    setIsLoading(true);
    const result = await updateTourAdvance(bookingId, validUpdates);
    setIsLoading(false);

    if (result?.success) {
      setAdvanceUpdates([{ remarks: "", amount: "" }]);
      toast.success("Advance shifted to balance successfully!");
    } else {
      toast.error(result?.message || "Failed to update advance");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Shared Booking ID Input */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
            Payment controller
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={bookingId}
              onChange={handleBookingIdChange}
              placeholder="Enter Booking ID"
              className="flex-1 p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <div className="flex gap-3">
              <button
                onClick={handleViewBalance}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                View Balance
              </button>
              <button
                onClick={handleViewAdvance}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium"
              >
                View Advance
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* ==================== BALANCE MANAGEMENT ==================== */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
            Booking Balance controller
          </h2>

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
            {balanceUpdates.map((u, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-2 sm:mb-3"
              >
                <input
                  type="text"
                  placeholder="Remarks"
                  value={u.remarks || ""}
                  onChange={(e) =>
                    handleBalanceChange(i, "remarks", e.target.value)
                  }
                  className="w-full sm:w-auto flex-1 p-2 sm:p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={u.amount || ""}
                  onChange={(e) =>
                    handleBalanceChange(i, "amount", e.target.value)
                  }
                  className="w-full sm:w-auto flex-1 p-2 sm:p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {balanceUpdates.length > 1 && (
                  <button
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={() => removeBalanceField(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addBalanceField}
              className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add More
            </button>
          </div>

          <button
            onClick={handleUpdateBalance}
            disabled={isLoading}
            className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-red-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg"
          >
            {isLoading ? "Updating..." : "Update Balance"}
          </button>
        </div>

        {/* ==================== ADVANCE MANAGEMENT ==================== */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
            Booking Advance controller
          </h2>

          {advanceDetails && (
            <div className="mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2">
                Advance Details
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <p className="text-sm sm:text-base md:text-lg">
                  Advance Amount: ₹{advanceDetails?.advance?.amount ?? 0}
                </p>
                <p className="text-sm sm:text-base md:text-lg">
                  Paid: {advanceDetails?.advance?.paid ? "Yes" : "No"}
                </p>
                <p className="text-sm sm:text-base md:text-lg">
                  Verified:{" "}
                  {advanceDetails?.advance?.paymentVerified ? "Yes" : "No"}
                </p>
                <p className="text-sm sm:text-base md:text-lg">
                  Trip Completed:{" "}
                  {advanceDetails?.isTripCompleted ? "Yes" : "No"}
                </p>
                <div className="mt-2 sm:mt-3">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold">
                    Advance Admin Remarks:
                  </h4>
                  {Array.isArray(advanceDetails?.advanceAdminRemarks) &&
                  advanceDetails.advanceAdminRemarks.length > 0 ? (
                    <ul className="list-decimal ml-4 sm:ml-6 md:ml-8 space-y-1 sm:space-y-2">
                      {advanceDetails.advanceAdminRemarks.map((r, index) => {
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
              Shift from Advance to Balance
            </h3>
            {advanceUpdates.map((u, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-2 sm:mb-3"
              >
                <input
                  type="text"
                  placeholder="Remarks"
                  value={u.remarks || ""}
                  onChange={(e) =>
                    handleAdvanceChange(i, "remarks", e.target.value)
                  }
                  className="w-full sm:w-auto flex-1 p-2 sm:p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount (positive only)"
                  value={u.amount || ""}
                  onChange={(e) =>
                    handleAdvanceChange(i, "amount", e.target.value)
                  }
                  className="w-full sm:w-auto flex-1 p-2 sm:p-3 md:p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {advanceUpdates.length > 1 && (
                  <button
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-1 sm:py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    onClick={() => removeAdvanceField(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAdvanceField}
              className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-green-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add More
            </button>
          </div>

          <button
            onClick={handleUpdateAdvance}
            disabled={isLoading}
            className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-red-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg"
          >
            {isLoading ? "Updating..." : "Update advance"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingControls;
