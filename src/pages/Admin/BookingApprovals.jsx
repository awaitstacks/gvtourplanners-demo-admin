import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { Search, Users, CheckCircle, XCircle } from "lucide-react";

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

  const hasData = filteredApprovals.length > 0;

  return (
    <div className="relative p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Local Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-lg"
      />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Pending Booking Updates
        </h2>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by traveller name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Count + Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
          <p className="text-lg text-gray-600 font-medium">
            {hasData
              ? `${filteredApprovals.length} pending update${
                  filteredApprovals.length > 1 ? "s" : ""
                }`
              : "No pending approvals"}
          </p>
          <button
            onClick={getPendingApprovals}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition shadow-sm font-medium flex items-center gap-2"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!hasData ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
            <Users className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No Pending Booking Updates
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : "All update requests have been processed. Well done!"}
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
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
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
                    <tr key={item._id} className="hover:bg-gray-50 transition">
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
                            newAdv !== oldAdv ? "text-green-600 font-bold" : ""
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
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-1.5"
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
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition shadow flex items-center gap-1.5"
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

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-5">
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
                  className="p-5 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {traveller.title} {traveller.firstName}{" "}
                      {traveller.lastName}
                    </h3>
                    <p className="text-gray-600">Mobile: {mobile}</p>
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold text-gray-800">{tour.title}</p>
                    <p className="text-sm text-gray-600">{tour.destination}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-bold text-gray-600">Old</p>
                      <p className="text-sm">₹{oldAdv.toLocaleString()}</p>
                      <p className="text-sm">₹{oldBal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-600">New</p>
                      <p className="text-sm font-medium">
                        ₹{newAdv.toLocaleString()}
                      </p>
                      <p className="text-sm font-medium">
                        ₹{newBal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-bold text-indigo-600">
                        {item.travellers?.length || 0} Travellers
                      </span>
                      <span>
                        {format(new Date(item.bookingDate), "dd MMM, hh:mm a")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleApprove(item.bookingId?._id || item.bookingId)
                        }
                        disabled={isLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleReject(item.bookingId?._id || item.bookingId)
                        }
                        disabled={isLoading}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer Note */}
      {hasData && (
        <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <p className="font-semibold mb-1">Important:</p>
          <ul className="list-disc list-inside space-y-1 text-amber-700">
            <li>Approving applies all changes to the original booking</li>
            <li>Rejecting discards the request — no changes made</li>
            <li>Search works on traveller name and mobile number</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BookingApprovals;
