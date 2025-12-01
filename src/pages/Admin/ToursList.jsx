import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ToursList = () => {
  const {
    tours,
    bookings,
    getAllTours,
    getAllBookings,
    changeTourAvailablity,
  } = useContext(TourAdminContext);

  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [toursResponse, bookingsResponse] = await Promise.all([
          getAllTours(),
          getAllBookings(),
        ]);
        console.log("Tours fetched:", toursResponse.tours);
        console.log("Bookings fetched:", bookingsResponse.bookings);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast.error("Failed to fetch tours or bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Helper: Get valid travellers for a tour (strict rules)
  const getValidTravellers = (tourId) => {
    if (!tourId) {
      console.warn("Invalid tourId:", tourId);
      return [];
    }

    const validBookings = bookings.filter((b) => {
      const isValid =
        b.tourId?.toString() === tourId.toString() &&
        b.payment?.advance?.paid === true &&
        b.payment?.balance?.paid === true &&
        b.isBookingCompleted === true;
      if (!isValid) {
        console.log(`Booking ${b._id} filtered out for tour ${tourId}`, {
          tourIdMatch: b.tourId?.toString() === tourId.toString(),
          advancePaid: b.payment?.advance?.paid,
          balancePaid: b.payment?.balance?.paid,
          isBookingCompleted: b.isBookingCompleted,
        });
      }
      return isValid;
    });

    const travellers = validBookings.flatMap((b) => {
      const validTravellers = (b.travellers || []).filter(
        (t) =>
          t.cancelled?.byTraveller !== true && t.cancelled?.byAdmin !== true
      );
      console.log(`Travellers for booking ${b._id}:`, validTravellers);
      return validTravellers;
    });

    console.log(`Valid travellers for tour ${tourId}:`, travellers);
    return travellers;
  };

  // Count functions
  const getTravellerCount = (tourId) => {
    const count = getValidTravellers(tourId).length;
    console.log(`Traveller count for tour ${tourId}: ${count}`);
    return count;
  };

  const getCancellationCount = (tourId) => {
    const count = bookings
      .filter(
        (b) =>
          b.tourId?.toString() === tourId.toString() &&
          b.isBookingCompleted === true
      )
      .reduce((count, b) => {
        const cancelledTravellers = (b.travellers || []).filter(
          (t) =>
            t.cancelled?.byTraveller === true && t.cancelled?.byAdmin === true
        );
        return count + cancelledTravellers.length;
      }, 0);
    console.log(`Cancellation count for tour ${tourId}: ${count}`);
    return count;
  };

  const getDoubleSharingCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) => t.sharingType === "double" && t.sharingType !== "withBerth"
    ).length;
    console.log(`Double sharing count for tour ${tourId}: ${count}`);
    return count;
  };

  const getTripleSharingCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) => t.sharingType === "triple" && t.sharingType !== "withBerth"
    ).length;
    console.log(`Triple sharing count for tour ${tourId}: ${count}`);
    return count;
  };

  const getChildAndWithBerthCount = (tourId) => {
    const travellers = getValidTravellers(tourId);
    const count = travellers.filter(
      (t) =>
        t.sharingType === "withBerth" || t.gender?.toLowerCase() === "other"
    ).length;
    console.log(`Child count for tour ${tourId}: ${count}`, {
      withBerth: travellers.filter((t) => t.sharingType === "withBerth").length,
      children: travellers.filter(
        (t) =>
          t.gender?.toLowerCase() === "other" && t.sharingType !== "withBerth"
      ).length,
    });
    return count;
  };

  const getMaleCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) => t.gender?.toLowerCase() === "male" && t.sharingType !== "withBerth"
    ).length;
    console.log(`Male count for tour ${tourId}: ${count}`);
    return count;
  };

  const getFemaleCount = (tourId) => {
    const count = getValidTravellers(tourId).filter(
      (t) =>
        t.gender?.toLowerCase() === "female" && t.sharingType !== "withBerth"
    ).length;
    console.log(`Female count for tour ${tourId}: ${count}`);
    return count;
  };

  // Filter tours by title
  const filteredTours = tours.filter(
    (tour) =>
      tour?.title?.toLowerCase()?.includes(filterText.toLowerCase()) ?? false
  );

  // Export filtered tours to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Tours Summary", 14, 15);

    const tableColumn = [
      "S.No",
      "Tour Title",
      "Travellers",
      "Cancellations",
      "Double",
      "Triple",
      "Male",
      "Female",
      "Child",
      "Availability",
    ];

    const tableRows = filteredTours.map((tour, index) => {
      const row = [
        index + 1,
        tour.title || "Unknown",
        getTravellerCount(tour._id),
        getCancellationCount(tour._id),
        getDoubleSharingCount(tour._id),
        getTripleSharingCount(tour._id),
        getMaleCount(tour._id),
        getFemaleCount(tour._id),
        getChildAndWithBerthCount(tour._id),
        tour.available ? "Available" : "Unavailable",
      ];
      console.log(`PDF row for tour ${tour._id}:`, row);
      return row;
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Tours_Summary.pdf");
  };

  // Handle tour availability change
  const handleChangeAvailability = async (tourId) => {
    const confirm = window.confirm(
      "Are you sure you want to change the tour availability?"
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      const response = await changeTourAvailablity(tourId);
      if (response.success) {
        toast.success("Tour availability changed successfully");
        await getAllTours(); // Refresh tours after availability change
      } else {
        toast.error(response.message || "Failed to change tour availability");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to change tour availability"
      );
    } finally {
      setIsLoading(false);
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
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-1 sm:mb-2 md:mb-3 lg:mb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-0">
          Tours Controls
        </h1>
        <button
          onClick={exportPDF}
          className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm md:text-base"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Export PDF"}
        </button>
      </div>

      {/* Filter box */}
      <input
        type="text"
        placeholder="Filter by Tour Title..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-1 sm:mb-2 md:mb-3 px-2 sm:px-3 py-1 sm:py-1.5 border rounded w-full sm:w-1/3 text-xs sm:text-sm md:text-base"
        disabled={isLoading}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-1 sm:p-2 md:p-3 w-[5%]">S.No</th>
              <th className="border p-1 sm:p-2 md:p-3 w-[25%]">Tour Title</th>
              <th className="border p-1 sm:p-2 md:p-3 w-[8%]">Travellers</th>
              <th className="border p-1 sm:p-2 md:p-3 w-[8%]">Cancellations</th>
              <th className="border p-1 sm:p-2 md:p-3 w-[8%]">
                Double Sharing
              </th>
              <th className="border p-1 sm:p-2 md:p-3 w-[8%]">
                Triple Sharing
              </th>
              <th className="border p-1 sm:p-2 md:p-3 w-[8%]">Male</th>
              <th className="border p-1 sm:p-2 md:p-3 w-[8%]">Female</th>
              <th className="border p-1 sm:p-2 md:p-3 w-[8%]">Child</th>
              <th className="border p-1 sm:p-2 md:p-3 w-[14%]">
                Change Availability
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTours.map((tour, index) => (
              <tr key={tour._id} className="text-center">
                <td className="border p-1 sm:p-2 md:p-3 w-[5%]">{index + 1}</td>
                <td className="border p-1 sm:p-2 md:p-3 w-[25%]">
                  {tour.title || "Unknown"}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[8%]">
                  {getTravellerCount(tour._id)}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[8%]">
                  {getCancellationCount(tour._id)}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[8%]">
                  {getDoubleSharingCount(tour._id)}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[8%]">
                  {getTripleSharingCount(tour._id)}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[8%]">
                  {getMaleCount(tour._id)}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[8%]">
                  {getFemaleCount(tour._id)}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[8%]">
                  {getChildAndWithBerthCount(tour._id)}
                </td>
                <td className="border p-1 sm:p-2 md:p-3 w-[14%]">
                  <button
                    onClick={() => handleChangeAvailability(tour._id)}
                    className={`px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-lg text-white ${
                      tour.available ? "bg-green-500" : "bg-red-500"
                    } text-xs sm:text-sm md:text-base`}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Processing..."
                      : tour.available
                      ? "Available"
                      : "Unavailable"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredTours.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="text-center text-gray-500 p-1 sm:p-2 md:p-3 text-xs sm:text-sm md:text-base"
                >
                  No tours found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ToursList;
