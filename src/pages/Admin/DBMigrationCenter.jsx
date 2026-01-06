import { useContext, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import { Loader2, AlertTriangle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const DBMigrationCenter = () => {
  const { addMissingFields } = useContext(TourAdminContext);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRunMigration = async () => {
    setShowConfirm(true);
  };

  const confirmAndRun = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const result = await addMissingFields();

      toast.success(
        `Migration complete! Updated ${result.data.modifiedCount} booking(s).`,
        {
          containerId: "migration-toast",
          position: "top-right",
          autoClose: 6000,
        }
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Migration failed. Please try again.";
      toast.error(msg, {
        containerId: "migration-toast",
        position: "top-right",
        autoClose: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Toast Container */}
          <div className="absolute top-4 right-4 z-50 pointer-events-none">
            <ToastContainer
              containerId="migration-toast"
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              theme="colored"
              limit={1}
            />
          </div>

          <div className="p-8 sm:p-10 text-center">
            {/* Icon + Title */}
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Database Migration
              </h2>
              <p className="text-red-600 font-bold text-lg mt-2">DANGER ZONE</p>
            </div>

            {/* Warning Text */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-8 text-left">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                This action will <strong>add missing fields</strong> to{" "}
                <strong>ALL tour bookings</strong> in the database.
              </p>
              <p className="text-xs sm:text-sm text-red-700 font-bold mt-3">
                This operation cannot be undone easily.
              </p>
            </div>

            {/* Main Button */}
            <button
              onClick={handleRunMigration}
              disabled={loading}
              className={`
                w-full flex items-center justify-center gap-3 px-6 py-5 
                rounded-xl font-bold text-lg text-white shadow-xl
                transition-all duration-200 transform hover:scale-105
                ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span>Running Migration...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6" />
                  <span>Run Migration Now</span>
                </>
              )}
            </button>

            <p className="mt-6 text-xs sm:text-sm font-extrabold text-red-700 uppercase tracking-widest">
              Only run if explicitly authorized
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Are You Absolutely Sure?
              </h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                This will modify <strong>all tour bookings</strong> in the
                database.
                <br />
                <span className="text-red-600 font-bold">
                  This action is irreversible.
                </span>
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndRun}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    "Yes, Run It!"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DBMigrationCenter;
