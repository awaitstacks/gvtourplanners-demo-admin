// import React, { useContext, useEffect, useState } from "react";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const ToursList = () => {
//   const {
//     tours,
//     bookings,
//     getAllTours,
//     getAllBookings,
//     changeTourAvailablity,
//   } = useContext(TourAdminContext);

//   const [filterText, setFilterText] = useState("");

//   useEffect(() => {
//     getAllTours();
//     getAllBookings();
//   }, []);

//   // ✅ Helper: Get valid travellers for a tour (strict rules)
//   const getValidTravellers = (tourId) => {
//     return bookings
//       .filter(
//         (b) =>
//           b.tourId === tourId &&
//           b.payment?.advance?.paid &&
//           b.payment?.balance?.paid &&
//           b.isBookingCompleted
//       )
//       .flatMap(
//         (b) =>
//           b.travellers?.filter(
//             (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
//           ) || []
//       );
//   };

//   // ✅ Count functions
//   const getTravellerCount = (tourId) => getValidTravellers(tourId).length;

//   const getCancellationCount = (tourId) => {
//     return bookings
//       .filter((b) => b.tourId === tourId && b.isBookingCompleted)
//       .reduce((count, b) => {
//         const cancelledTravellers = b.travellers?.filter(
//           (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin
//         );
//         return count + (cancelledTravellers?.length || 0);
//       }, 0);
//   };

//   const getDoubleSharingCount = (tourId) =>
//     getValidTravellers(tourId).filter((t) => t.sharingType === "double").length;

//   const getTripleSharingCount = (tourId) =>
//     getValidTravellers(tourId).filter((t) => t.sharingType === "triple").length;

//   const getMaleCount = (tourId) =>
//     getValidTravellers(tourId).filter((t) => t.gender?.toLowerCase() === "male")
//       .length;

//   const getFemaleCount = (tourId) =>
//     getValidTravellers(tourId).filter(
//       (t) => t.gender?.toLowerCase() === "female"
//     ).length;

//   const getOtherCount = (tourId) =>
//     getValidTravellers(tourId).filter(
//       (t) => t.gender && !["male", "female"].includes(t.gender?.toLowerCase())
//     ).length;

//   // ✅ Filter tours by title
//   const filteredTours = tours.filter((tour) =>
//     tour.title.toLowerCase().includes(filterText.toLowerCase())
//   );

//   // ✅ Export filtered tours to PDF
//   const exportPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Tours Summary", 14, 15);

//     const tableColumn = [
//       "S.No",
//       "Tour Title",
//       "Travellers",
//       "Cancellations",
//       "Double",
//       "Triple",
//       "Male",
//       "Female",
//       "Other",
//       "Availability",
//     ];

//     const tableRows = [];

//     filteredTours.forEach((tour, index) => {
//       tableRows.push([
//         index + 1,
//         tour.title,
//         getTravellerCount(tour._id),
//         getCancellationCount(tour._id),
//         getDoubleSharingCount(tour._id),
//         getTripleSharingCount(tour._id),
//         getMaleCount(tour._id),
//         getFemaleCount(tour._id),
//         getOtherCount(tour._id),
//         tour.available ? "Available" : "Unavailable",
//       ]);
//     });

//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//       startY: 20,
//     });

//     doc.save("Tours_Summary.pdf");
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Tours Controls</h1>
//         <button
//           onClick={exportPDF}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Export PDF
//         </button>
//       </div>

//       {/* Filter box */}
//       <input
//         type="text"
//         placeholder="Filter by Tour Title..."
//         value={filterText}
//         onChange={(e) => setFilterText(e.target.value)}
//         className="mb-4 px-3 py-2 border rounded w-full md:w-1/3"
//       />

//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse border border-gray-300 text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border p-2">S.No</th>
//               <th className="border p-2">Tour Title</th>
//               <th className="border p-2">Travellers</th>
//               <th className="border p-2">Cancellations</th>
//               <th className="border p-2">Double Sharing</th>
//               <th className="border p-2">Triple Sharing</th>
//               <th className="border p-2">Male</th>
//               <th className="border p-2">Female</th>
//               <th className="border p-2">Other</th>
//               <th className="border p-2">Change Availability</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTours.map((tour, index) => (
//               <tr key={tour._id} className="text-center">
//                 <td className="border p-2">{index + 1}</td>
//                 <td className="border p-2">{tour.title}</td>
//                 <td className="border p-2">{getTravellerCount(tour._id)}</td>
//                 <td className="border p-2">{getCancellationCount(tour._id)}</td>
//                 <td className="border p-2">
//                   {getDoubleSharingCount(tour._id)}
//                 </td>
//                 <td className="border p-2">
//                   {getTripleSharingCount(tour._id)}
//                 </td>
//                 <td className="border p-2">{getMaleCount(tour._id)}</td>
//                 <td className="border p-2">{getFemaleCount(tour._id)}</td>
//                 <td className="border p-2">{getOtherCount(tour._id)}</td>
//                 <td className="border p-2">
//                   <button
//                     onClick={() => changeTourAvailablity(tour._id)}
//                     className={`px-3 py-1.5 rounded-lg text-white ${
//                       tour.available ? "bg-green-500" : "bg-red-500"
//                     }`}
//                   >
//                     {tour.available ? "Available" : "Unavailable"}
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {filteredTours.length === 0 && (
//               <tr>
//                 <td colSpan="10" className="text-center text-gray-500 p-3">
//                   No tours found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ToursList;

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
    getAllTours();
    getAllBookings();
  }, []);

  // ✅ Helper: Get valid travellers for a tour (strict rules)
  const getValidTravellers = (tourId) => {
    return bookings
      .filter(
        (b) =>
          b.tourId === tourId &&
          b.payment?.advance?.paid &&
          b.payment?.balance?.paid &&
          b.isBookingCompleted
      )
      .flatMap(
        (b) =>
          b.travellers?.filter(
            (t) => !t.cancelled?.byTraveller && !t.cancelled?.byAdmin
          ) || []
      );
  };

  // ✅ Count functions
  const getTravellerCount = (tourId) => getValidTravellers(tourId).length;

  const getCancellationCount = (tourId) => {
    return bookings
      .filter((b) => b.tourId === tourId && b.isBookingCompleted)
      .reduce((count, b) => {
        const cancelledTravellers = b.travellers?.filter(
          (t) => t.cancelled?.byTraveller || t.cancelled?.byAdmin
        );
        return count + (cancelledTravellers?.length || 0);
      }, 0);
  };

  const getDoubleSharingCount = (tourId) =>
    getValidTravellers(tourId).filter((t) => t.sharingType === "double").length;

  const getTripleSharingCount = (tourId) =>
    getValidTravellers(tourId).filter((t) => t.sharingType === "triple").length;

  const getMaleCount = (tourId) =>
    getValidTravellers(tourId).filter((t) => t.gender?.toLowerCase() === "male")
      .length;

  const getFemaleCount = (tourId) =>
    getValidTravellers(tourId).filter(
      (t) => t.gender?.toLowerCase() === "female"
    ).length;

  const getOtherCount = (tourId) =>
    getValidTravellers(tourId).filter(
      (t) => t.gender && !["male", "female"].includes(t.gender?.toLowerCase())
    ).length;

  // ✅ Filter tours by title
  const filteredTours = tours.filter((tour) =>
    tour.title.toLowerCase().includes(filterText.toLowerCase())
  );

  // ✅ Export filtered tours to PDF
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
      "Other",
      "Availability",
    ];

    const tableRows = [];

    filteredTours.forEach((tour, index) => {
      tableRows.push([
        index + 1,
        tour.title,
        getTravellerCount(tour._id),
        getCancellationCount(tour._id),
        getDoubleSharingCount(tour._id),
        getTripleSharingCount(tour._id),
        getMaleCount(tour._id),
        getFemaleCount(tour._id),
        getOtherCount(tour._id),
        tour.available ? "Available" : "Unavailable",
      ]);
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
    <div className="p-6">
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

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tours Controls</h1>
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700"
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
        className="mb-4 px-3 py-2 border rounded w-full md:w-1/3"
        disabled={isLoading}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">S.No</th>
              <th className="border p-2">Tour Title</th>
              <th className="border p-2">Travellers</th>
              <th className="border p-2">Cancellations</th>
              <th className="border p-2">Double Sharing</th>
              <th className="border p-2">Triple Sharing</th>
              <th className="border p-2">Male</th>
              <th className="border p-2">Female</th>
              <th className="border p-2">Other</th>
              <th className="border p-2">Change Availability</th>
            </tr>
          </thead>
          <tbody>
            {filteredTours.map((tour, index) => (
              <tr key={tour._id} className="text-center">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{tour.title}</td>
                <td className="border p-2">{getTravellerCount(tour._id)}</td>
                <td className="border p-2">{getCancellationCount(tour._id)}</td>
                <td className="border p-2">
                  {getDoubleSharingCount(tour._id)}
                </td>
                <td className="border p-2">
                  {getTripleSharingCount(tour._id)}
                </td>
                <td className="border p-2">{getMaleCount(tour._id)}</td>
                <td className="border p-2">{getFemaleCount(tour._id)}</td>
                <td className="border p-2">{getOtherCount(tour._id)}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleChangeAvailability(tour._id)}
                    className={`px-3 py-1.5 rounded-lg text-white ${
                      tour.available ? "bg-green-500" : "bg-red-500"
                    }`}
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
                <td colSpan="10" className="text-center text-gray-500 p-3">
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
