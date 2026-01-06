/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState, useMemo } from "react";
import { TourContext } from "../../context/TourContext";
import {
  CalendarCheck,
  Loader2,
  AlertCircle,
  Mail,
  MapPin,
  Users,
  Save,
  MessageSquare,
  IndianRupee,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageBooking = () => {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [tour, setTour] = useState(null);
  const [originalBooking, setOriginalBooking] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [balanceInfo, setBalanceInfo] = useState(null);

  // Balance History State
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const { viewBooking, getTourList, tourList, getManagedBookingsHistory } =
    useContext(TourContext);

  useEffect(() => {
    if (tourList.length === 0) getTourList();
  }, [tourList, getTourList]);

  const isFullyPaid = useMemo(() => {
    if (!booking?.payment) return false;
    return (
      booking.payment.advance.paid === true &&
      booking.payment.balance.paid === true
    );
  }, [booking]);

  const handleGetDetails = async () => {
    if (!bookingId.trim()) return setError("Enter a Booking ID");

    setLoading(true);
    setError("");
    setBooking(null);
    setTour(null);
    setValidationErrors({});
    setBalanceInfo(null);
    setBalanceHistory([]);
    setHistoryError("");

    const res = await viewBooking(bookingId.trim());
    if (!res.success) {
      setError(res.message || "Failed to load booking");
      setLoading(false);
      return;
    }

    const loadedBooking = res.booking;
    const rawTourId = loadedBooking.tourId?._id || loadedBooking.tourId;
    const tourId =
      typeof rawTourId === "object" ? rawTourId.toString() : rawTourId;

    const foundTour = tourList.find((t) => t._id === tourId);
    if (!foundTour) {
      setError("Tour data not found. Please refresh or contact support.");
      setLoading(false);
      return;
    }

    setTour(foundTour);
    setBooking(loadedBooking);
    setOriginalBooking(JSON.parse(JSON.stringify(loadedBooking)));
    setLoading(false);
  };

  const getPackage = (traveller) => {
    if (!tour) return null;
    return traveller.packageType === "main"
      ? tour
      : tour.variantPackage?.[traveller.variantPackageIndex] || null;
  };

  const resetTravellerFields = (idx, fieldsToReset = {}) => {
    const upd = { ...booking };
    const t = upd.travellers[idx];
    const defaults = {
      sharingType: "",
      selectedAddon: null,
      boardingPoint: null,
      deboardingPoint: null,
    };
    Object.assign(t, { ...defaults, ...fieldsToReset });
    setBooking(upd);
  };

  const updateTraveller = (idx, field, value) => {
    const upd = { ...booking };
    const t = upd.travellers[idx];
    const ORIG = originalBooking.travellers[idx];

    if (field === "packageType" || field === "variantPackageIndex") {
      const newPkg = field === "packageType" ? value : t.packageType;
      const newIdx =
        field === "variantPackageIndex" ? value : t.variantPackageIndex;

      t.packageType = newPkg;
      if (field === "variantPackageIndex") t.variantPackageIndex = newIdx;

      const pkgChanged =
        t.packageType !== ORIG.packageType ||
        t.variantPackageIndex !== ORIG.variantPackageIndex;

      if (pkgChanged) {
        resetTravellerFields(idx);
      }

      setBooking(upd);
      return;
    }

    t[field] = value;
    setBooking(upd);
  };

  const updateNested = (path, value) => {
    const parts = path.split(".");
    const upd = { ...booking };
    let ref = upd;
    for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
    ref[parts[parts.length - 1]] = value;
    setBooking(upd);
  };

  const hasChanges = useMemo(() => {
    if (!originalBooking || !booking) return false;
    return JSON.stringify(booking) !== JSON.stringify(originalBooking);
  }, [booking, originalBooking]);

  const travellerPrice = (t) => {
    const pkg =
      t.packageType === "main"
        ? tour
        : tour.variantPackage?.[t.variantPackageIndex] ?? tour;

    let base = 0;
    switch (t.sharingType) {
      case "double":
        base = pkg?.price?.doubleSharing ?? 0;
        break;
      case "triple":
        base = pkg?.price?.tripleSharing ?? 0;
        break;
      case "withBerth":
        base = pkg?.price?.childWithBerth ?? 0;
        break;
      case "withoutBerth":
        base = pkg?.price?.childWithoutBerth ?? 0;
        break;
      default:
        base = pkg?.price?.doubleSharing ?? 0;
    }
    return base + (t.selectedAddon?.price ?? 0);
  };

  const validateBeforeSave = () => {
    const errors = {};
    let hasError = false;

    booking.travellers.forEach((t, idx) => {
      if (t.cancelled?.byAdmin || t.cancelled?.byTraveller) return;

      const errKey = `traveller_${idx}`;
      const err = [];

      if (
        !t.packageType ||
        (t.packageType === "variant" && t.variantPackageIndex === null)
      )
        err.push("Valid package must be selected");
      if (!t.sharingType) err.push("Sharing type is required");
      if (!t.boardingPoint?.stationCode) err.push("Boarding point is required");
      if (!t.deboardingPoint?.stationCode)
        err.push("De-boarding point is required");

      if (err.length) {
        errors[errKey] = err;
        hasError = true;
      }
    });

    setValidationErrors(errors);
    return !hasError;
  };

  const handleSaveUpdate = async () => {
    if (!hasChanges) {
      toast.info("No changes to save.");
      return;
    }

    if (!validateBeforeSave()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updates = {
        travellers: booking.travellers.map((t, i) => {
          const orig = originalBooking.travellers[i];
          const diff = {
            packageType: t.packageType,
            variantPackageIndex: t.variantPackageIndex,
            sharingType: t.sharingType,
            selectedAddon: t.selectedAddon,
            boardingPoint: t.boardingPoint,
            deboardingPoint: t.deboardingPoint,
          };

          for (const k in t) {
            if (
              [
                "packageType",
                "variantPackageIndex",
                "sharingType",
                "selectedAddon",
                "boardingPoint",
                "deboardingPoint",
              ].includes(k)
            )
              continue;
            if (JSON.stringify(t[k]) !== JSON.stringify(orig[k]))
              diff[k] = t[k];
          }
          return diff;
        }),

        contact: {},
        billingAddress: {},
      };

      if (booking.contact.email !== originalBooking.contact.email)
        updates.contact.email = booking.contact.email;
      if (booking.contact.mobile !== originalBooking.contact.mobile)
        updates.contact.mobile = booking.contact.mobile;

      const billingFields = [
        "addressLine1",
        "addressLine2",
        "city",
        "state",
        "pincode",
        "country",
      ];
      billingFields.forEach((f) => {
        if (booking.billingAddress?.[f] !== originalBooking.billingAddress?.[f])
          updates.billingAddress[f] = booking.billingAddress[f];
      });

      if (!Object.keys(updates.contact).length) delete updates.contact;
      if (!Object.keys(updates.billingAddress).length)
        delete updates.billingAddress;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tour/manage-booking-balance/${
          booking._id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ttoken: localStorage.getItem("ttoken"),
          },
          body: JSON.stringify({ updates }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Booking update request raised successfully!");

        const { gvCancellationPool, irctcCancellationPool } = result.data || {};

        setBalanceInfo({
          gvPool: gvCancellationPool,
          irctcPool: irctcCancellationPool,
        });

        setOriginalBooking(JSON.parse(JSON.stringify(booking)));

        const res = await getManagedBookingsHistory();
        if (res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter(
            (e) => e.originalBooking?._id?.toString() === booking._id.toString()
          );
          setBalanceHistory(filtered);
        }
      } else {
        toast.error(result.message || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!booking?._id) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      setBalanceHistory([]);

      try {
        const res = await getManagedBookingsHistory();
        if (res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter(
            (e) => e.originalBooking?._id?.toString() === booking._id.toString()
          );
          setBalanceHistory(filtered);
        }
      } catch (err) {
        console.error("History fetch error:", err);
        setHistoryError("Failed to load balance update history");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [booking?._id, getManagedBookingsHistory]);

  return (
    <div className="relative max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      {/* TOAST CONTAINER – FIXED & ALWAYS VISIBLE */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
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
          limit={6}
          toastClassName="min-w-[320px] max-w-[420px] !bg-white !shadow-2xl !rounded-xl !border !border-gray-200 overflow-hidden"
          bodyClassName="text-sm font-semibold text-gray-800 px-5 py-4"
          progressClassName="!bg-green-500 h-1"
          className="top-4 right-4"
        />
      </div>

      {/* HEADER – Mobile: slightly right | Desktop: centered */}
      <div className="flex items-center justify-between border-b pb-6 mb-8">
        <div className="flex items-center justify-center sm:justify-center gap-6 py-8 px-10 sm:px-0 w-full">
          <CalendarCheck className="w-11 h-11 text-indigo-600 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800">
            Booking Controller
          </h1>
        </div>

        {booking && (
          <button
            onClick={handleSaveUpdate}
            disabled={saving || !hasChanges}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg
              ${
                saving || !hasChanges
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Update
              </>
            )}
          </button>
        )}
      </div>

      {/* Booking ID Input */}
      <div className="max-w-2xl mx-auto mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Enter Booking ID
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Paste Booking ID here..."
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGetDetails()}
            className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 shadow-sm transition-all"
          />
          <button
            onClick={handleGetDetails}
            disabled={loading}
            className="px-10 py-4 bg-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg transition-all transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                Loading...
              </>
            ) : (
              "Get Details"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-7 h-7 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {booking && tour && (
        <div className="space-y-10">
          {/* FULLY PAID BANNER */}
          {isFullyPaid && (
            <div className="p-6 bg-green-100 border-2 border-green-600 rounded-xl text-green-900 font-bold text-center text-lg shadow-md">
              This booking is FULLY PAID
              <br />
              <span className="text-base font-medium">
                Package, Sharing Type & Add-ons are now LOCKED and cannot be
                changed.
              </span>
            </div>
          )}

          {/* Booking ID + Tour Title */}
          <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Booking ID
              </label>
              <input
                type="text"
                value={booking._id}
                disabled
                className="mt-2 w-full px-4 py-3 border rounded-lg bg-gray-100 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tour Title
              </label>
              <input
                type="text"
                value={tour.title}
                disabled
                className="mt-2 w-full px-4 py-3 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          {/* Admin Remarks */}
          {booking.adminRemarks && booking.adminRemarks.length > 0 && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="flex items-center gap-2 font-bold mb-4 text-yellow-800 text-lg">
                <MessageSquare className="w-6 h-6" /> Admin Remarks
              </h3>
              <div className="space-y-3">
                {booking.adminRemarks.map((remark, i) => {
                  const amount = Number(remark.amount) || 0;
                  const isNegative = amount < 0;
                  const date = new Date(remark.addedAt);
                  const formattedDate = date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-lg text-sm font-medium border ${
                        isNegative
                          ? "bg-red-50 text-red-800 border-red-200"
                          : "bg-green-50 text-green-800 border-green-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">
                          {isNegative ? "-₹" : "+₹"}
                          {Math.abs(amount)}
                        </span>
                        <span className="text-sm opacity-75">
                          {formattedDate} at {formattedTime}
                        </span>
                      </div>
                      <div className="mt-1">{remark.remark}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancellation Pools */}
          {(booking.gvCancellationPool !== undefined ||
            booking.irctcCancellationPool !== undefined) && (
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
              <h3 className="flex items-center gap-2 font-bold mb-4 text-purple-800 text-lg">
                <IndianRupee className="w-6 h-6" /> Cancellation Pools
              </h3>
              <div className="grid grid-cols-2 gap-6 text-base">
                {booking.gvCancellationPool !== undefined && (
                  <div>
                    <span className="font-medium">GV Pool:</span>{" "}
                    <span className="font-bold text-purple-700">
                      ₹{booking.gvCancellationPool}
                    </span>
                  </div>
                )}
                {booking.irctcCancellationPool !== undefined && (
                  <div>
                    <span className="font-medium">IRCTC Pool:</span>{" "}
                    <span className="font-bold text-purple-700">
                      ₹{booking.irctcCancellationPool}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Balance Update History */}
          <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 font-bold text-indigo-800 text-lg">
                <IndianRupee className="w-6 h-6" />
                Balance Update History
              </h3>
              <button
                onClick={async () => {
                  setHistoryLoading(true);
                  const res = await getManagedBookingsHistory();
                  if (res.success && Array.isArray(res.data)) {
                    const filtered = res.data.filter(
                      (e) =>
                        e.originalBooking?._id?.toString() ===
                        booking._id.toString()
                    );
                    setBalanceHistory(filtered);
                  }
                  setHistoryLoading(false);
                }}
                className="text-sm text-indigo-600 hover:underline font-medium"
                disabled={historyLoading}
              >
                {historyLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {historyLoading && (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
                Loading history...
              </div>
            )}

            {historyError && (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center text-red-800 font-medium">
                {historyError}
              </div>
            )}

            {!historyLoading &&
              !historyError &&
              balanceHistory.length === 0 && (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-800 font-medium">
                  No balance update history found for this booking.
                </div>
              )}

            {!historyLoading && !historyError && balanceHistory.length > 0 && (
              <div className="space-y-4">
                {balanceHistory.map((entry) => {
                  const isApproved = entry.approvedBy;
                  return (
                    <div
                      key={entry._id}
                      className={`p-5 rounded-xl border text-sm font-medium transition-all ${
                        isApproved
                          ? "bg-green-50 text-green-800 border-green-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-bold text-lg">
                            {isApproved ? "Approved" : "Not Approved"}
                          </span>
                        </div>
                        <span className="text-xs opacity-75">
                          {new Date(
                            entry.raisedAt || entry.createdAt
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Old Advance:</span>{" "}
                          <span className="font-bold">
                            ₹{entry.originalBooking?.advancePaid || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Old Balance:</span>{" "}
                          <span className="font-bold">
                            ₹{entry.originalBooking?.balanceDue || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">New Advance:</span>{" "}
                          <span className="font-bold text-green-700">
                            ₹{entry.requested?.updatedAdvance || 0}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">New Balance:</span>{" "}
                          <span className="font-bold text-green-700">
                            ₹{entry.requested?.updatedBalance || 0}
                          </span>
                        </div>
                      </div>

                      {entry.adminRemarks?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <p className="font-medium text-sm mb-2">
                            Admin Remarks:
                          </p>
                          {entry.adminRemarks.map((r, i) => (
                            <div key={i} className="text-sm">
                              {r.amount ? (
                                <span
                                  className={`font-bold ${
                                    r.amount > 0
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {r.amount > 0 ? "+₹" : "-₹"}
                                  {Math.abs(r.amount)} —{" "}
                                </span>
                              ) : null}
                              <span>{r.remark}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="p-6 bg-blue-50 rounded-xl">
            <h3 className="flex items-center gap-2 font-bold mb-5 text-blue-800 text-lg">
              <Mail className="w-6 h-6" /> Contact
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={booking.contact?.email || ""}
                  onChange={(e) =>
                    updateNested("contact.email", e.target.value)
                  }
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile
                </label>
                <input
                  type="text"
                  value={booking.contact?.mobile || ""}
                  onChange={(e) =>
                    updateNested("contact.mobile", e.target.value)
                  }
                  className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="p-6 bg-green-50 rounded-xl">
            <h3 className="flex items-center gap-2 font-bold mb-5 text-green-800 text-lg">
              <MapPin className="w-6 h-6" /> Billing Address
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "addressLine1",
                "addressLine2",
                "city",
                "state",
                "pincode",
                "country",
              ].map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {f.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="text"
                    value={booking.billingAddress?.[f] || ""}
                    onChange={(e) =>
                      updateNested(`billingAddress.${f}`, e.target.value)
                    }
                    className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Travellers */}
          <div>
            <h3 className="flex items-center gap-3 font-bold mb-6 text-gray-800 text-xl">
              <Users className="w-8 h-8" /> Travellers
            </h3>

            {booking.travellers.map((t, idx) => {
              const isCancelled =
                t.cancelled?.byAdmin || t.cancelled?.byTraveller;
              const pkg = getPackage(t);
              const boardingOpts =
                t.packageType === "main"
                  ? tour.boardingPoints || []
                  : pkg?.boardingPoints || [];
              const deboardingOpts =
                t.packageType === "main"
                  ? tour.deboardingPoints || []
                  : pkg?.deboardingPoints || [];
              const addonOpts =
                t.packageType === "main"
                  ? tour.addons || []
                  : pkg?.addons || [];

              const errKey = `traveller_${idx}`;
              const fieldErrors = validationErrors[errKey] || [];

              return (
                <div
                  key={idx}
                  className={`mb-8 p-6 border-2 rounded-xl ${
                    isCancelled
                      ? "bg-red-50 border-red-300 opacity-75"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">
                      Traveller {idx + 1}
                    </h4>
                    {isCancelled && (
                      <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                        Cancelled – No edits allowed
                      </span>
                    )}
                  </div>

                  <div className="mb-4 text-lg font-bold text-indigo-700">
                    Price: ₹{travellerPrice(t)}
                  </div>

                  {fieldErrors.length > 0 && (
                    <div className="mb-5 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                      {fieldErrors.map((e, i) => (
                        <div key={i}>• {e}</div>
                      ))}
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Package *
                      </label>
                      <select
                        value={
                          t.packageType === "main"
                            ? "main"
                            : t.variantPackageIndex ?? ""
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "main") {
                            updateTraveller(idx, "packageType", "main");
                            updateTraveller(idx, "variantPackageIndex", null);
                          } else {
                            updateTraveller(idx, "packageType", "variant");
                            updateTraveller(
                              idx,
                              "variantPackageIndex",
                              Number(v)
                            );
                          }
                        }}
                        disabled={isCancelled || isFullyPaid}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      >
                        <option value="main">Main Package</option>
                        {tour.variantPackage?.map((_, i) => (
                          <option key={i} value={i}>
                            Variant {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <select
                        value={t.title}
                        onChange={(e) =>
                          updateTraveller(idx, "title", e.target.value)
                        }
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      >
                        <option>Mr</option>
                        <option>Mrs</option>
                        <option>Ms</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={t.firstName}
                        onChange={(e) =>
                          updateTraveller(idx, "firstName", e.target.value)
                        }
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={t.lastName}
                        onChange={(e) =>
                          updateTraveller(idx, "lastName", e.target.value)
                        }
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Age
                      </label>
                      <input
                        type="number"
                        value={t.age}
                        onChange={(e) =>
                          updateTraveller(idx, "age", Number(e.target.value))
                        }
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        value={t.gender}
                        onChange={(e) =>
                          updateTraveller(idx, "gender", e.target.value)
                        }
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sharing *
                      </label>
                      <select
                        value={t.sharingType}
                        onChange={(e) =>
                          updateTraveller(idx, "sharingType", e.target.value)
                        }
                        disabled={isCancelled || isFullyPaid}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      >
                        <option value="">Select</option>
                        {Number(t.age) >= 11 ? (
                          <>
                            <option value="double">Double</option>
                            <option value="triple">Triple</option>
                          </>
                        ) : Number(t.age) >= 6 && Number(t.age) <= 10 ? (
                          <>
                            <option value="withBerth">Child with Berth</option>
                            <option value="withoutBerth">
                              Child without Berth
                            </option>
                          </>
                        ) : null}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Boarding Point *
                      </label>
                      <select
                        value={t.boardingPoint?.stationCode || ""}
                        onChange={(e) => {
                          const p = boardingOpts.find(
                            (x) => x.stationCode === e.target.value
                          );
                          updateTraveller(idx, "boardingPoint", p || null);
                        }}
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      >
                        <option value="">Select</option>
                        {boardingOpts.map((bp) => (
                          <option key={bp.stationCode} value={bp.stationCode}>
                            {bp.stationCode} - {bp.stationName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        De-boarding Point *
                      </label>
                      <select
                        value={t.deboardingPoint?.stationCode || ""}
                        onChange={(e) => {
                          const p = deboardingOpts.find(
                            (x) => x.stationCode === e.target.value
                          );
                          updateTraveller(idx, "deboardingPoint", p || null);
                        }}
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      >
                        <option value="">Select</option>
                        {deboardingOpts.map((dp) => (
                          <option key={dp.stationCode} value={dp.stationCode}>
                            {dp.stationCode} - {dp.stationName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Add-on
                      </label>
                      <select
                        value={t.selectedAddon?.name || ""}
                        onChange={(e) => {
                          const a = addonOpts.find(
                            (x) => x.name === e.target.value
                          );
                          updateTraveller(idx, "selectedAddon", {
                            name: a?.name || "",
                            price: a?.amount || 0,
                          });
                        }}
                        disabled={isCancelled || isFullyPaid}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                      >
                        <option value="">None</option>
                        {addonOpts.map((a) => (
                          <option key={a._id || a.id} value={a.name}>
                            {a.name} (+{a.amount || 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Remarks (optional)
                      </label>
                      <textarea
                        value={t.remarks || ""}
                        onChange={(e) =>
                          updateTraveller(idx, "remarks", e.target.value)
                        }
                        disabled={isCancelled}
                        className="mt-2 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooking;
