import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { Search, Users, Loader2 } from "lucide-react";

const BookingApprovals = () => {
  const {
    pendingApprovals = [],
    getPendingApprovals,
    approveBookingUpdate,
    rejectBookingUpdate,
    aToken,
  } = useContext(TourAdminContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (aToken) getPendingApprovals();
  }, [aToken, getPendingApprovals]);

  // Real-time filtering
  useEffect(() => {
    if (!pendingApprovals.length) {
      setFilteredApprovals([]);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = pendingApprovals.filter((item) => {
      const traveller = item.travellers?.[0] || {};
      const fullName = `${traveller.title || ""} ${traveller.firstName || ""} ${
        traveller.lastName || ""
      }`
        .toLowerCase()
        .trim();
      const mobile = (item.contact?.mobile || "").toLowerCase();

      return fullName.includes(term) || mobile.includes(term);
    });

    setFilteredApprovals(filtered);
  }, [pendingApprovals, searchTerm]);

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve this booking update?")) return;

    setIsLoading(true);
    try {
      const res = await approveBookingUpdate(bookingId);
      if (res?.success) {
        getPendingApprovals();
      } else {
        toast.error(res?.message || "Failed to approve");
      }
    } catch (err) {
      toast.error("Something went wrong while approving");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm("Reject this booking update request?")) return;

    setIsLoading(true);
    try {
      const res = await rejectBookingUpdate(
        bookingId,
        "Update rejected by admin"
      );
      if (res?.success) {
        getPendingApprovals();
      } else {
        toast.error(res?.message || "Failed to reject");
      }
    } catch (err) {
      toast.error("Something went wrong while rejecting");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getPendingApprovals();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const hasData = filteredApprovals.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
          toastClassName="rounded-lg shadow-lg"
        />

        {/* Header */}
        <div className="p-5 sm:p-6 lg:p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 text-center mb-5">
            Pending Booking Approvals
          </h2>

          {/* Search + Count + Refresh */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="w-full lg:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <p className="text-sm sm:text-base font-medium text-gray-700">
                {hasData
                  ? `${filteredApprovals.length} pending approval${
                      filteredApprovals.length > 1 ? "s" : ""
                    }`
                  : "No pending approvals"}
              </p>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium text-sm transition-all shadow-md"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh List
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!hasData ? (
          <div className="text-center py-20 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
              <Users className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              No Pending Approvals
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm
                ? `No results found for "${searchTerm}"`
                : "Great job! All booking updates have been processed."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4 sm:p-6">
              {filteredApprovals.map((item) => {
                const traveller = item.travellers?.[0] || {};
                const tour = item.tourId || {};
                const original = item.bookingId || {};
                const mobile = item.contact?.mobile || "—";
                const oldAdv = original.payment?.advance?.amount || 0;
                const oldBal = original.payment?.balance?.amount || 0;
                const newAdv = item.updatedAdvance || 0;
                const newBal = item.updatedBalance || 0;

                return (
                  <div
                    key={item._id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                          {traveller.title} {traveller.firstName}{" "}
                          {traveller.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Mobile: {mobile}
                        </p>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-bold">
                        {item.travellers?.length || 0} Travellers
                      </span>
                    </div>

                    <p className="font-semibold text-gray-800 text-sm mb-3">
                      {tour.title || "—"}
                    </p>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm mb-4">
                      <div>
                        <p className="text(xs font-medium text-gray-600">Old</p>
                        <p className="text-xs">₹{oldAdv.toLocaleString()}</p>
                        <p className="text-xs">₹{oldBal.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-green-600 font-medium text-xs">
                          New
                        </p>
                        <p className="font-bold text-sm">
                          ₹{newAdv.toLocaleString()}
                        </p>
                        <p className="font-bold text-sm">
                          ₹{newBal.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb and Delimiters mb-4">
                      <span>
                        {format(new Date(item.bookingDate), "dd MMM yyyy")}
                      </span>
                      {" • "}
                      <span>
                        {format(new Date(item.bookingDate), "hh:mm a")}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleApprove(item.bookingId?._id || item.bookingId)
                        }
                        disabled={isLoading}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-medium text-sm transition shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleReject(item.bookingId?._id || item.bookingId)
                        }
                        disabled={isLoading}
                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg font-medium text-sm transition shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Lead Traveller
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tour
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Old Amounts
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      New Amounts
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Travellers
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Requested On
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredApprovals.map((item) => {
                    const traveller = item.travellers?.[0] || {};
                    const tour = item.tourId || {};
                    const original = item.bookingId || {};
                    const mobile = item.contact?.mobile || "—";
                    const oldAdv = original.payment?.advance?.amount || 0;
                    const oldBal = original.payment?.balance?.amount || 0;
                    const newAdv = item.updatedAdvance || 0;
                    const newBal = item.updatedBalance || 0;

                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {traveller.title} {traveller.firstName}{" "}
                              {traveller.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Mobile: {mobile}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {tour.title || "—"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {tour.destination || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm space-y-1">
                          <p>Advance: ₹{oldAdv.toLocaleString()}</p>
                          <p>Balance: ₹{oldBal.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-sm space-y-1">
                          <p
                            className={
                              newAdv !== oldAdv
                                ? "text-green-600 font-bold"
                                : ""
                            }
                          >
                            Advance: ₹{newAdv.toLocaleString()}
                          </p>
                          <p
                            className={
                              newBal !== oldBal ? "text-blue-600 font-bold" : ""
                            }
                          >
                            Balance: ₹{newBal.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            {item.travellers?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(item.bookingDate), "dd MMM yyyy")}
                          <br />
                          <span className="text-xs">
                            {format(new Date(item.bookingDate), "hh:mm a")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() =>
                                handleApprove(
                                  item.bookingId?._id || item.bookingId
                                )
                              }
                              disabled={isLoading}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition shadow"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleReject(
                                  item.bookingId?._id || item.bookingId
                                )
                              }
                              disabled={isLoading}
                              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition shadow"
                            >
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
          </>
        )}

        {/* Footer Note */}
        {hasData && (
          <div className="p-5 bg-amber-50 border-t border-amber-200 text-sm text-amber-800 text-center">
            <p className="font-semibold">Note:</p>
            <p className="text-amber-700">
              Approving applies changes • Rejecting discards request
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingApprovals;
