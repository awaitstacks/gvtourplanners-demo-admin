import { useContext, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import { Loader2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const DBMigrationCenter = () => {
  const { addMissingFields } = useContext(TourAdminContext);
  const [loading, setLoading] = useState(false);

  const handleRunMigration = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await addMissingFields();

      toast.success(
        `Migration complete! Updated ${result.data.modifiedCount} booking(s).`,
        {
          containerId: "migration-toast",
          position: "top-right",
          autoClose: 5000,
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
        autoClose: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto bg-white rounded-xl shadow-lg">
      {/* ===== LOCAL TOAST (Top-Right of Card) ===== */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 pointer-events-none">
        <ToastContainer
          containerId="migration-toast"
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="colored"
          limit={1}
          toastClassName="!w-64 sm:!w-80"
          bodyClassName="text-xs sm:text-sm"
          style={{ width: "auto" }}
        />
      </div>

      {/* Title */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 pr-16 sm:pr-20">
        DB Migration (WARNING ...!)
      </h2>

      {/* Run Button */}
      <button
        onClick={handleRunMigration}
        disabled={loading}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3 
          rounded-lg font-medium text-sm sm:text-base text-white transition-all
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md"
          }
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span className="hidden xs:inline">Running Migration…</span>
            <span className="xs:hidden">Running…</span>
          </>
        ) : (
          <>
            <span className="hidden xs:inline">
              Run Migration (Add Missing Fields)
            </span>
            <span className="xs:hidden">Run Migration</span>
          </>
        )}
      </button>

      {/* Warning */}
      <p className="mt-3 sm:mt-4 text-xs text-center text-red-600 font-medium">
        Should not run without permission
      </p>
    </div>
  );
};

export default DBMigrationCenter;
