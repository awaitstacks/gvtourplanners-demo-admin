/* eslint-disable no-unused-vars */
import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TourNameList = () => {
  const {
    bookings,
    getBookings,
    updateTravellerDetails,
    tourList,
    getTourList,
  } = useContext(TourContext);

  const [initialized, setInitialized] = useState(false);
  const [tableData, setTableData] = useState({
    trainColumns: [],
    flightColumns: [],
    travellers: [],
  });
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [boardingPointFilter, setBoardingPointFilter] = useState("");
  const [deboardingPointFilter, setDeboardingPointFilter] = useState("");
  const location = useLocation();

  // Fetch the list of all tours for the dropdown
  useEffect(() => {
    getTourList();
  }, [getTourList]);

  // Fetch bookings for the selected tour
  useEffect(() => {
    if (selectedTourId) {
      setIsLoadingBookings(true);
      getBookings(selectedTourId)
        .then((response) => {
          if (
            response &&
            typeof response === "object" &&
            "success" in response
          ) {
            if (response.success) {
              toast.success("Bookings fetched successfully", {
                toastId: "bookings-fetch-success",
              });
            } else {
              toast.error(response.message || "Failed to fetch bookings", {
                toastId: "bookings-fetch-error",
              });
            }
          } else {
            toast.error("Invalid response from server", {
              toastId: "server-error",
            });
          }
        })
        .catch((error) => {
          console.error("getBookings error:", error);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch bookings",
            { toastId: "bookings-fetch-error" }
          );
        })
        .finally(() => {
          setIsLoadingBookings(false);
        });
    } else {
      setIsLoadingBookings(false);
    }
  }, [selectedTourId, getBookings]);

  // Clear toasts on component unmount or route change
  useEffect(() => {
    return () => {
      console.log("Dismissing toasts from TourNameList");
      toast.dismiss();
    };
  }, [location]);

  const handleApiResponse = useCallback(
    (response, successMessage, skipRefresh = false) => {
      console.log("API Response:", response);
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          const toastId =
            typeof successMessage === "string"
              ? successMessage.toLowerCase().replace(/\s/g, "-")
              : `operation-success-${Date.now()}`;
          toast.success(successMessage || "Operation completed successfully", {
            toastId,
          });
          if (selectedTourId && !skipRefresh) {
            getBookings(selectedTourId);
          }
        } else {
          toast.error(
            response.message || "An error occurred during the operation",
            { toastId: "api-error" }
          );
        }
      } else {
        toast.error("Invalid response from server", {
          toastId: "server-error",
        });
      }
    },
    [selectedTourId, getBookings]
  );

  // Filter travellers based on name, phone number, boarding point, and deboarding point
  const filteredTravellers = useMemo(() => {
    return tableData.travellers.filter((traveller) => {
      const matchesName = nameFilter
        ? traveller.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      const matchesPhone = phoneFilter
        ? traveller.mobile && traveller.mobile.includes(phoneFilter)
        : true;
      const matchesBoardingPoint = boardingPointFilter
        ? traveller.boardingPoint &&
          traveller.boardingPoint
            .toLowerCase()
            .includes(boardingPointFilter.toLowerCase())
        : true;
      const matchesDeboardingPoint = deboardingPointFilter
        ? traveller.deboardingPoint &&
          traveller.deboardingPoint
            .toLowerCase()
            .includes(deboardingPointFilter.toLowerCase())
        : true;
      return (
        matchesName &&
        matchesPhone &&
        matchesBoardingPoint &&
        matchesDeboardingPoint
      );
    });
  }, [
    tableData.travellers,
    nameFilter,
    phoneFilter,
    boardingPointFilter,
    deboardingPointFilter,
  ]);

  // Re-initialize the table when bookings change
  useEffect(() => {
    if (bookings.length > 0 && selectedTourId) {
      const trainSet = new Set();
      const flightSet = new Set();
      const travellersList = [];

      bookings.forEach((booking) => {
        if (!booking.payment?.advance?.paymentVerified) {
          return;
        }

        booking.travellers.forEach((trav) => {
          if (trav.cancelled?.byTraveller || trav.cancelled?.byAdmin) {
            return;
          }

          if (Array.isArray(trav.trainSeats)) {
            trav.trainSeats.forEach((s) => {
              if (s?.trainName) trainSet.add(s.trainName);
            });
          } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
            Object.keys(trav.trainSeats).forEach((k) => trainSet.add(k));
          }

          if (Array.isArray(trav.flightSeats)) {
            trav.flightSeats.forEach((s) => {
              if (s?.flightName) flightSet.add(s.flightName);
            });
          } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
            Object.keys(trav.flightSeats).forEach((k) => flightSet.add(k));
          }

          const trainSeatsMap = {};
          const flightSeatsMap = {};

          const trainColumns =
            trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"];
          const flightColumns =
            flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"];

          trainColumns.forEach((tn) => (trainSeatsMap[tn] = ""));
          flightColumns.forEach((fn) => (flightSeatsMap[fn] = ""));
          if (Array.isArray(trav.trainSeats)) {
            trav.trainSeats.forEach((s) => {
              if (s?.trainName) trainSeatsMap[s.trainName] = s.seatNo ?? "";
            });
          } else if (trav.trainSeats && typeof trav.trainSeats === "object") {
            Object.entries(trav.trainSeats).forEach(([k, v]) => {
              trainSeatsMap[k] = v ?? "";
            });
          }

          if (Array.isArray(trav.flightSeats)) {
            trav.flightSeats.forEach((s) => {
              if (s?.flightName) flightSeatsMap[s.flightName] = s.seatNo ?? "";
            });
          } else if (trav.flightSeats && typeof trav.flightSeats === "object") {
            Object.entries(trav.flightSeats).forEach(([k, v]) => {
              flightSeatsMap[k] = v ?? "";
            });
          }

          travellersList.push({
            id: trav._id,
            name: `${trav.firstName || ""} ${trav.lastName || ""}`.trim(),
            age: trav.age ?? "",
            gender: trav.gender || "",
            sharingType: trav.sharingType || "",
            mobile: booking.contact?.mobile ?? trav.phone ?? "",
            boardingPoint: trav.boardingPoint?.stationName || "",
            deboardingPoint: trav.deboardingPoint?.stationName || "",
            trainSeats: trainSeatsMap,
            flightSeats: flightSeatsMap,
          });
        });
      });

      setTableData({
        trainColumns: trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"],
        flightColumns:
          flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"],
        travellers: travellersList,
      });
      setInitialized(true);
    } else if (selectedTourId) {
      setTableData({
        trainColumns: ["Train 1"],
        flightColumns: ["Flight 1"],
        travellers: [],
      });
      setInitialized(false);
    } else {
      setTableData({
        trainColumns: ["Train 1"],
        flightColumns: ["Flight 1"],
        travellers: [],
      });
      setInitialized(false);
    }
    console.log("Table data:", tableData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedTourId]);

  const cloneState = (s) => JSON.parse(JSON.stringify(s));

  // Compute display gender based on age, gender, and sharingType
  const getDisplayGender = (age, gender, sharingType) => {
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 6) return "";
    const genderAbbrev =
      gender.toLowerCase() === "male"
        ? "M"
        : gender.toLowerCase() === "female"
        ? "F"
        : "";
    if (parsedAge >= 6 && parsedAge <= 10) {
      if (["withBerth", "double", "triple"].includes(sharingType)) {
        return genderAbbrev ? `CWB(${genderAbbrev})` : "CWB";
      }
      if (sharingType === "withoutBerth") {
        return genderAbbrev ? `CNB(${genderAbbrev})` : "CNB";
      }
      return "";
    }
    return genderAbbrev;
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape", "pt", "a4");
    const tourTitle =
      bookings[0]?.tourData?.title ||
      tourList.find((tour) => tour._id === selectedTourId)?.title ||
      "Tour Traveller List";

    doc.setFontSize(18);
    doc.text(tourTitle, doc.internal.pageSize.getWidth() / 2, 40, {
      align: "center",
    });

    const head = [
      [
        "SL NO",
        "NAME",
        "AGE",
        "GENDER",
        "MOBILE",
        "BOARDING POINT",
        "DEBOARDING POINT",
        ...tableData.trainColumns,
        ...tableData.flightColumns,
      ],
    ];

    const body = filteredTravellers.map((trav, idx) => [
      String(idx + 1).padStart(2, "0"),
      trav.name,
      trav.age,
      getDisplayGender(trav.age, trav.gender, trav.sharingType),
      trav.mobile || "—",
      trav.boardingPoint || "—",
      trav.deboardingPoint || "—",
      ...tableData.trainColumns.map((c) => trav.trainSeats[c] ?? ""),
      ...tableData.flightColumns.map((c) => trav.flightSeats[c] ?? ""),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 60,
      styles: {
        fontSize: 11,
        cellPadding: 6,
        halign: "center",
        valign: "middle",
      },
      headStyles: { fillColor: [40, 167, 69], halign: "center" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`${tourTitle.replace(/\s+/g, "_")}_Traveller_List.pdf`);
    toast.success(
      <div className="flex items-center gap-2">
        <span>✅</span>
        <span>PDF exported successfully</span>
      </div>,
      { toastId: "pdf-export-success" }
    );
    console.log("Toast displayed: pdf-export-success");
  };

  // Add train/flight column
  const handleAddGlobalColumn = (type) => {
    const maxColumns = 15;
    setTableData((prev) => {
      if (prev.trainColumns.length + prev.flightColumns.length >= maxColumns) {
        toast.error(
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>Cannot add more than {maxColumns} columns</span>
          </div>,
          { toastId: "max-columns-error" }
        );
        console.log("Toast displayed: max-columns-error");
        return prev;
      }
      const updated = cloneState(prev);
      if (type === "train") {
        let newName = `Train ${updated.trainColumns.length + 1}`;
        updated.trainColumns.push(newName);
        updated.travellers.forEach((t) => (t.trainSeats[newName] = ""));
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Train column "{newName}" added</span>
          </div>,
          { toastId: `add-train-${newName}` }
        );
        console.log("Toast displayed: add-train-", newName);
      } else {
        let newName = `Flight ${updated.flightColumns.length + 1}`;
        updated.flightColumns.push(newName);
        updated.travellers.forEach((t) => (t.flightSeats[newName] = ""));
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Flight column "{newName}" added</span>
          </div>,
          { toastId: `add-flight-${newName}` }
        );
        console.log("Toast displayed: add-flight-", newName);
      }
      console.log("Table data after add:", updated);
      return updated;
    });
  };

  // Rename column
  const handleColumnNameChangeGlobal = (type, index, newName) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      if (type === "train") {
        const oldName = updated.trainColumns[index];
        if (oldName === newName) return prev;
        updated.trainColumns[index] = newName;
        updated.travellers.forEach((t) => {
          t.trainSeats[newName] = t.trainSeats[oldName] ?? "";
          delete t.trainSeats[oldName];
        });
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Train column renamed to "{newName}"</span>
          </div>,
          { toastId: `rename-train-${index}` }
        );
        console.log("Toast displayed: rename-train-", index);
      } else {
        const oldName = updated.flightColumns[index];
        if (oldName === newName) return prev;
        updated.flightColumns[index] = newName;
        updated.travellers.forEach((t) => {
          t.flightSeats[newName] = t.flightSeats[oldName] ?? "";
          delete t.flightSeats[oldName];
        });
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Flight column renamed to "{newName}"</span>
          </div>,
          { toastId: `rename-flight-${index}` }
        );
        console.log("Toast displayed: rename-flight-", index);
      }
      console.log("Table data after rename:", updated);
      return updated;
    });
  };

  // Remove column
  const handleRemoveGlobalColumn = async (type, index) => {
    let removed;
    setTableData((prev) => {
      const updated = cloneState(prev);
      if (type === "train") {
        if (updated.trainColumns.length <= 1) {
          toast.error(
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>At least one train column is required</span>
            </div>,
            { toastId: "remove-train-error" }
          );
          console.log("Toast displayed: remove-train-error");
          return prev;
        }
        removed = updated.trainColumns.splice(index, 1)[0];
        updated.travellers.forEach((t) => delete t.trainSeats[removed]);
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Train column "{removed}" removed</span>
          </div>,
          { toastId: `remove-train-${index}` }
        );
        console.log("Toast displayed: remove-train-", index);
      } else {
        if (updated.flightColumns.length <= 1) {
          toast.error(
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>At least one flight column is required</span>
            </div>,
            { toastId: "remove-flight-error" }
          );
          console.log("Toast displayed: remove-flight-error");
          return prev;
        }
        removed = updated.flightColumns.splice(index, 1)[0];
        updated.travellers.forEach((t) => delete t.flightSeats[removed]);
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Flight column "{removed}" removed</span>
          </div>,
          { toastId: `remove-flight-${index}` }
        );
        console.log("Toast displayed: remove-flight-", index);
      }
      console.log("Table data after remove:", updated);
      return updated;
    });

    if (!removed) return;

    const promises = tableData.travellers.map((traveller) => {
      const trainSeatsArr = Object.entries(traveller.trainSeats).map(
        ([trainName, seatNo]) => ({ trainName, seatNo })
      );
      const flightSeatsArr = Object.entries(traveller.flightSeats).map(
        ([flightName, seatNo]) => ({ flightName, seatNo })
      );

      const payload = {
        trainSeats: trainSeatsArr,
        flightSeats: flightSeatsArr,
      };

      const booking = bookings.find((b) =>
        b.travellers.some((t) => t._id === traveller.id)
      );
      if (!booking) return null;

      return updateTravellerDetails(booking._id, traveller.id, payload);
    });

    const responses = await Promise.all(promises);
    responses.forEach((response, idx) => {
      if (response) {
        handleApiResponse(
          response,
          `Traveller ${tableData.travellers[idx].name} details updated`,
          true
        );
      }
    });
  };

  // Traveller edits
  const handleSeatChange = (travellerId, type, column, value) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      const traveller = updated.travellers.find((t) => t.id === travellerId);
      if (!traveller) return prev;
      if (type === "train") traveller.trainSeats[column] = value;
      else traveller.flightSeats[column] = value;
      console.log("Table data after seat change:", updated);
      return updated;
    });
  };

  // Save one traveller
  const handleSaveSingleTraveller = async (traveller) => {
    if (!selectedTourId) {
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Please select a tour first.</span>
        </div>,
        { toastId: "no-tour-error" }
      );
      console.log("Toast displayed: no-tour-error");
      return;
    }

    try {
      const trainSeatsArr = Object.entries(traveller.trainSeats).map(
        ([trainName, seatNo]) => ({ trainName, seatNo })
      );
      const flightSeatsArr = Object.entries(traveller.flightSeats).map(
        ([flightName, seatNo]) => ({ flightName, seatNo })
      );

      const payload = {
        trainSeats: trainSeatsArr,
        flightSeats: flightSeatsArr,
      };

      const booking = bookings.find((b) =>
        b.travellers.some((t) => t._id === traveller.id)
      );
      if (!booking) {
        toast.error(
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>Booking not found for this traveller.</span>
          </div>,
          { toastId: "no-booking-error" }
        );
        console.log("Toast displayed: no-booking-error");
        return;
      }

      const response = await updateTravellerDetails(
        booking._id,
        traveller.id,
        payload
      );
      handleApiResponse(
        response,
        <div className="flex items-center gap-2">
          <span>✅</span>
          <span>Traveller {traveller.name} details updated</span>
        </div>,
        { toastId: `save-traveller-${traveller.id}` }
      );
    } catch (error) {
      console.error("handleSaveSingleTraveller error:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Failed to save traveller details: {error.message}</span>
        </div>,
        { toastId: `save-traveller-error-${traveller.id}` }
      );
      console.log("Toast displayed: save-traveller-error-", traveller.id);
    }
  };

  // Save all travellers
  const handleSaveAllTravellers = async () => {
    if (!selectedTourId) {
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Please select a tour first.</span>
        </div>,
        { toastId: "no-tour-error" }
      );
      console.log("Toast displayed: no-tour-error");
      return;
    }

    try {
      const promises = tableData.travellers.map((traveller) => {
        const trainSeatsArr = Object.entries(traveller.trainSeats).map(
          ([trainName, seatNo]) => ({ trainName, seatNo })
        );
        const flightSeatsArr = Object.entries(traveller.flightSeats).map(
          ([flightName, seatNo]) => ({ flightName, seatNo })
        );

        const payload = {
          trainSeats: trainSeatsArr,
          flightSeats: flightSeatsArr,
        };

        const booking = bookings.find((b) =>
          b.travellers.some((t) => t._id === traveller.id)
        );
        if (!booking) return null;

        return updateTravellerDetails(booking._id, traveller.id, payload);
      });

      const responses = await Promise.all(promises);
      let allSuccessful = true;
      responses.forEach((response, idx) => {
        if (response) {
          handleApiResponse(
            response,
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>
                Traveller {tableData.travellers[idx].name} details updated
              </span>
            </div>,
            { toastId: `update-traveller-${idx}` }
          );
          if (!response.success) allSuccessful = false;
        }
      });

      if (allSuccessful) {
        toast.success(
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>All traveller details saved successfully!</span>
          </div>,
          { toastId: "save-all-success" }
        );
        console.log("Toast displayed: save-all-success");
      }
    } catch (error) {
      console.error("handleSaveAllTravellers error:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <span>❌</span>
          <span>Failed to save all traveller details: {error.message}</span>
        </div>,
        { toastId: "save-all-error" }
      );
      console.log("Toast displayed: save-all-error");
    }
  };

  // Dynamic column width based on number of columns
  const totalColumns =
    tableData.trainColumns.length + tableData.flightColumns.length;
  const columnWidthClass =
    totalColumns > 10
      ? "min-w-[80px]"
      : totalColumns > 6
      ? "min-w-[100px]"
      : "min-w-[120px]";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
      {/* Compact ToastContainer */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="fixed top-2 right-2 max-w-[280px] w-auto z-50"
        toastClassName="text-xs bg-white shadow-sm rounded-lg p-2 border border-gray-100 flex items-center gap-2"
        style={{
          fontSize: "clamp(10px, 2.5vw, 12px)",
        }}
      />

      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-center">
          Traveller Name List
        </h2>
        <div className="mb-4 sm:mb-6">
          <label
            htmlFor="tour-select"
            className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
          >
            Select Tour:
          </label>
          <select
            id="tour-select"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:bg-gray-100 touch-manipulation"
            disabled={isLoadingBookings}
            aria-label="Select a tour"
          >
            <option value="">-- Select a Tour --</option>
            {tourList.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.title}
              </option>
            ))}
          </select>
        </div>
        {selectedTourId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <label
                htmlFor="name-filter"
                className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
              >
                Filter by Name:
              </label>
              <input
                id="name-filter"
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Enter name to filter"
                className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                aria-label="Filter travellers by name"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="phone-filter"
                className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
              >
                Filter by Phone:
              </label>
              <input
                id="phone-filter"
                type="text"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Enter phone to filter"
                className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                aria-label="Filter travellers by phone number"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="boarding-point-filter"
                className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
              >
                Filter by Boarding Point:
              </label>
              <input
                id="boarding-point-filter"
                type="text"
                value={boardingPointFilter}
                onChange={(e) => setBoardingPointFilter(e.target.value)}
                placeholder="Enter boarding point to filter"
                className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                aria-label="Filter travellers by boarding point"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="deboarding-point-filter"
                className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1"
              >
                Filter by Deboarding Point:
              </label>
              <input
                id="deboarding-point-filter"
                type="text"
                value={deboardingPointFilter}
                onChange={(e) => setDeboardingPointFilter(e.target.value)}
                placeholder="Enter deboarding point to filter"
                className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm lg:text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md touch-manipulation"
                aria-label="Filter travellers by deboarding point"
              />
            </div>
          </div>
        )}
      </div>

      {selectedTourId ? (
        isLoadingBookings ? (
          <div className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
            <svg
              className="animate-spin h-5 w-5 sm:h-6 sm:w-6 mx-auto text-indigo-500"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading...
          </div>
        ) : filteredTravellers.length === 0 ? (
          <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
            No active travellers with verified advance payment found for this
            tour.
          </p>
        ) : (
          <>
            <div className="flex justify-end mb-4 sm:mb-6">
              <button
                onClick={exportToPDF}
                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Export traveller list to PDF"
              >
                📄 Export to PDF
              </button>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                onClick={() => handleAddGlobalColumn("train")}
                className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Add new train column"
              >
                + Add Train
              </button>
              <button
                onClick={() => handleAddGlobalColumn("flight")}
                className="px-3 sm:px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Add new flight column"
              >
                + Add Flight
              </button>
              <button
                onClick={handleSaveAllTravellers}
                className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[120px] touch-manipulation"
                aria-label="Save all traveller details"
              >
                💾 Save All
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-4rem)] mx-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 sticky top-0 z-10">
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
                    >
                      SL NO
                    </th>
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[100px] sm:min-w-[120px]`}
                    >
                      NAME
                    </th>
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[50px]`}
                    >
                      AGE
                    </th>
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[60px]`}
                    >
                      GENDER
                    </th>
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}
                    >
                      MOBILE
                    </th>
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                    >
                      BOARDING POINT
                    </th>
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                    >
                      DEBOARDING POINT
                    </th>
                    {tableData.trainColumns.map((col, i) => (
                      <th
                        key={i}
                        className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <input
                            type="text"
                            value={col}
                            onChange={(e) =>
                              handleColumnNameChangeGlobal(
                                "train",
                                i,
                                e.target.value
                              )
                            }
                            className="w-16 sm:w-20 lg:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-center touch-manipulation"
                            aria-label={`Train column ${i + 1} name`}
                          />
                          {tableData.trainColumns.length > 1 && (
                            <button
                              onClick={() =>
                                handleRemoveGlobalColumn("train", i)
                              }
                              className="p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                              aria-label={`Remove train column ${col}`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    {tableData.flightColumns.map((col, i) => (
                      <th
                        key={i}
                        className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold ${columnWidthClass}`}
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <input
                            type="text"
                            value={col}
                            onChange={(e) =>
                              handleColumnNameChangeGlobal(
                                "flight",
                                i,
                                e.target.value
                              )
                            }
                            className="w-16 sm:w-20 lg:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-center touch-manipulation"
                            aria-label={`Flight column ${i + 1} name`}
                          />
                          {tableData.flightColumns.length > 1 && (
                            <button
                              onClick={() =>
                                handleRemoveGlobalColumn("flight", i)
                              }
                              className="p-1 sm:p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                              aria-label={`Remove flight column ${col}`}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th
                      className={`p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base font-semibold min-w-[80px]`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTravellers.map((trav, idx) => (
                    <tr key={trav.id}>
                      <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                        {String(idx + 1).padStart(2, "0")}.
                      </td>
                      <td
                        className="p-2 sm:p-3 border border-gray-200 text-xs sm:text-sm lg:text-base truncate max-w-[100px] sm:max-w-[120px]"
                        title={trav.name}
                      >
                        {trav.name}
                      </td>
                      <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                        {trav.age}
                      </td>
                      <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                        {getDisplayGender(
                          trav.age,
                          trav.gender,
                          trav.sharingType
                        )}
                      </td>
                      <td className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base">
                        {trav.mobile || "—"}
                      </td>
                      <td
                        className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
                        title={trav.boardingPoint}
                      >
                        {trav.boardingPoint || "—"}
                      </td>
                      <td
                        className="p-2 sm:p-3 border border-gray-200 text-center text-xs sm:text-sm lg:text-base truncate max-w-[80px] sm:max-w-[100px]"
                        title={trav.deboardingPoint}
                      >
                        {trav.deboardingPoint || "—"}
                      </td>
                      {tableData.trainColumns.map((col, i) => (
                        <td
                          key={i}
                          className="p-2 sm:p-3 border border-gray-200 text-center"
                        >
                          <input
                            type="text"
                            value={trav.trainSeats[col] ?? ""}
                            onChange={(e) =>
                              handleSeatChange(
                                trav.id,
                                "train",
                                col,
                                e.target.value
                              )
                            }
                            className="w-14 sm:w-16 lg:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm text-center touch-manipulation"
                            aria-label={`Train seat for ${col}`}
                          />
                        </td>
                      ))}
                      {tableData.flightColumns.map((col, i) => (
                        <td
                          key={i}
                          className="p-2 sm:p-3 border border-gray-200 text-center"
                        >
                          <input
                            type="text"
                            value={trav.flightSeats[col] ?? ""}
                            onChange={(e) =>
                              handleSeatChange(
                                trav.id,
                                "flight",
                                col,
                                e.target.value
                              )
                            }
                            className="w-14 sm:w-16 lg:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm text-center touch-manipulation"
                            aria-label={`Flight seat for ${col}`}
                          />
                        </td>
                      ))}
                      <td className="p-2 sm:p-3 border border-gray-200 text-center">
                        <button
                          onClick={() => handleSaveSingleTraveller(trav)}
                          className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm min-w-[60px] sm:min-w-[80px] touch-manipulation"
                          aria-label={`Save details for ${trav.name}`}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              <div className="mb-4">
                {tableData.trainColumns.map((col, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) =>
                        handleColumnNameChangeGlobal("train", i, e.target.value)
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                      aria-label={`Train column ${i + 1} name`}
                    />
                    {tableData.trainColumns.length > 1 && (
                      <button
                        onClick={() => handleRemoveGlobalColumn("train", i)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                        aria-label={`Remove train column ${col}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {tableData.flightColumns.map((col, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) =>
                        handleColumnNameChangeGlobal(
                          "flight",
                          i,
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                      aria-label={`Flight column ${i + 1} name`}
                    />
                    {tableData.flightColumns.length > 1 && (
                      <button
                        onClick={() => handleRemoveGlobalColumn("flight", i)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs touch-manipulation"
                        aria-label={`Remove flight column ${col}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {filteredTravellers.map((trav, idx) => (
                <div
                  key={trav.id}
                  className="bg-white border rounded-lg p-3 shadow-sm"
                >
                  <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                    <div>
                      <span className="font-semibold">SL NO: </span>
                      {String(idx + 1).padStart(2, "0")}.
                    </div>
                    <div>
                      <span className="font-semibold">Name: </span>
                      {trav.name}
                    </div>
                    <div>
                      <span className="font-semibold">Age: </span>
                      {trav.age}
                    </div>
                    <div>
                      <span className="font-semibold">Gender: </span>
                      {getDisplayGender(
                        trav.age,
                        trav.gender,
                        trav.sharingType
                      )}
                    </div>
                    <div>
                      <span className="font-semibold">Mobile: </span>
                      {trav.mobile || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Boarding Point: </span>
                      {trav.boardingPoint || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Deboarding Point: </span>
                      {trav.deboardingPoint || "—"}
                    </div>
                    {tableData.trainColumns.map((col, i) => (
                      <div key={i}>
                        <span className="font-semibold">{col}: </span>
                        <input
                          type="text"
                          value={trav.trainSeats[col] ?? ""}
                          onChange={(e) =>
                            handleSeatChange(
                              trav.id,
                              "train",
                              col,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                          aria-label={`Train seat for ${col}`}
                        />
                      </div>
                    ))}
                    {tableData.flightColumns.map((col, i) => (
                      <div key={i}>
                        <span className="font-semibold">{col}: </span>
                        <input
                          type="text"
                          value={trav.flightSeats[col] ?? ""}
                          onChange={(e) =>
                            handleSeatChange(
                              trav.id,
                              "flight",
                              col,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm touch-manipulation"
                          aria-label={`Flight seat for ${col}`}
                        />
                      </div>
                    ))}
                    <div className="text-center">
                      <button
                        onClick={() => handleSaveSingleTraveller(trav)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm w-full touch-manipulation"
                        aria-label={`Save details for ${trav.name}`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <p className="text-center text-gray-500 text-xs sm:text-sm lg:text-base">
          Please select a tour to view the traveller list.
        </p>
      )}
    </div>
  );
};

export default TourNameList;
