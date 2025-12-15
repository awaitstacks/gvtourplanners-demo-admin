import React, { useContext, useEffect, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const CHUNK_SIZE = 8;

const TourRoomList = () => {
  const {
    tourList,
    getTourList,
    getRoomAllocation,
    roomAllocation,
    roomAllocationLoading,
    roomAllocationError,
  } = useContext(TourContext);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (tourList.length === 0) getTourList();
  }, [getTourList, tourList.length]);

  useEffect(() => {
    if (selectedTourId) getRoomAllocation(selectedTourId);
  }, [selectedTourId, getRoomAllocation]);

  const selectedTour = tourList.find((t) => t._id === selectedTourId);

  /* ---------------- HELPERS ---------------- */

  const chunkArray = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) {
      out.push(arr.slice(i, i + size));
    }
    return out;
  };

  const getSharingLabel = (count) => {
    if (count === 1) return "SINGLE";
    if (count === 2) return "DOUBLE";
    if (count === 3) return "TRIPLE";
    return "QUAD";
  };

  /* ---------------- ROOM STATS ---------------- */

  const getRoomStats = () => {
    const stats = { total: 0, single: 0, double: 0, triple: 0, quad: 0 };
    if (!roomAllocation?.groupedByMobile) return stats;

    roomAllocation.groupedByMobile.forEach((group) => {
      group.rooms.forEach((room) => {
        stats.total++;
        const c = room.occupants?.length || 0;
        if (c === 1) stats.single++;
        else if (c === 2) stats.double++;
        else if (c === 3) stats.triple++;
        else if (c >= 4) stats.quad++;
      });
    });

    return stats;
  };

  /* ---------------- GROUP LABELS (FROM groupedByMobile) ---------------- */
  // Maps contactMobile to Group Label (F1, F2, F3...)
  const getMobileGroupLabels = () => {
    const mobileToGroupMap = {};
    let counter = 1;

    if (!roomAllocation?.groupedByMobile) {
      return { groupMap: mobileToGroupMap, hasGroups: false };
    }

    roomAllocation.groupedByMobile.forEach((group) => {
      const label = `F${counter++}`;
      mobileToGroupMap[group.contactMobile] = label;
    });

    return { groupMap: mobileToGroupMap, hasGroups: counter > 1 };
  };

  /* ---------------- FLATTEN + SORT ROOMS (BY GROUP AND ROOM NUMBER) ---------------- */

  const getAllRooms = (familyLabels) => {
    if (!roomAllocation?.groupedByMobile) return [];

    const rooms = [];

    roomAllocation.groupedByMobile.forEach((group) => {
      const groupLabel = familyLabels[group.contactMobile]; // Get the F-label

      group.rooms.forEach((room) => {
        rooms.push({
          ...room,
          roomNumber: room.roomNumber,
          contactMobile: group.contactMobile,
          groupLabel: groupLabel, // Store the F-label for sorting
        });
      });
    });

    // Sort by Group Label (F1 < F2 < F3) first, then by Physical Room Number
    rooms.sort((a, b) => {
      // 1. Extract the numeric part (e.g., 'F2' -> 2)
      const labelA = parseInt(a.groupLabel.substring(1));
      const labelB = parseInt(b.groupLabel.substring(1));

      // Primary sort: Group Label
      if (labelA !== labelB) {
        return labelA - labelB;
      }

      // Secondary sort: Physical Room Number (to keep rooms within the same group ordered)
      return a.roomNumber - b.roomNumber;
    });

    return rooms;
  };

  const { groupMap: familyLabels, hasGroups: hasFamilies } =
    getMobileGroupLabels();

  // Pass familyLabels to getAllRooms to enable group sorting
  const allRooms = getAllRooms(familyLabels);

  const roomStats = getRoomStats();
  const roomChunks = chunkArray(allRooms, CHUNK_SIZE);

  /* ---------------- PDF EXPORT ---------------- */

  const exportToPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    // Select the hidden, off-screen PDF pages
    const pages = document.querySelectorAll(".pdf-page");
    const pdf = new jsPDF("l", "mm", "a4");

    try {
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });
        const img = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "PNG", 0, 0, 297, 210);
      }

      const fileName =
        (selectedTour?.title || "Room_Allocation")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 40) + ".pdf";

      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        Tour Room Allocation
      </h1>

      <select
        className="border p-3 rounded w-full max-w-md mx-auto block mb-8"
        value={selectedTourId}
        onChange={(e) => setSelectedTourId(e.target.value)}
      >
        <option value="">-- Select Tour --</option>
        {tourList.map((t) => (
          <option key={t._id} value={t._id}>
            {t.title}
          </option>
        ))}
      </select>

      {roomAllocationLoading && (
        <div className="text-center text-blue-600 text-xl">
          Loading room allocation...
        </div>
      )}

      {roomAllocationError && (
        <div className="text-center text-red-600 text-xl">
          {roomAllocationError}
        </div>
      )}

      {/* NEW: Handle case where tour is selected but no rooms are allocated */}
      {selectedTourId &&
        !roomAllocationLoading &&
        !roomAllocationError &&
        allRooms.length === 0 && (
          <div className="text-center text-gray-500 text-xl mt-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
            No room allocations found for this tour.
          </div>
        )}

      {allRooms.length > 0 && (
        <>
          <div className="text-center mb-8">
            <button
              onClick={exportToPDF}
              disabled={isGeneratingPDF}
              className="bg-blue-600 text-white px-10 py-4 rounded-lg text-lg font-semibold"
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>

          {/* ================= VISIBLE UI DISPLAY ================= */}
          <div className="bg-white p-4 shadow-lg rounded-lg mb-10">
            <h2 className="text-2xl font-bold text-center mb-4">
              {selectedTour?.title}
            </h2>

            {hasFamilies && (
              <p className="text-center text-red-600 italic mb-4">
                * Rooms are grouped by contact mobile number (F1, F2, F3, etc.)
              </p>
            )}

            {/* UI STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Stat label="Total" value={roomStats.total} isUI={true} />
              <Stat label="Single" value={roomStats.single} isUI={true} />
              <Stat label="Double" value={roomStats.double} isUI={true} />
              <Stat label="Triple" value={roomStats.triple} isUI={true} />
              <Stat label="Quad" value={roomStats.quad} isUI={true} />
            </div>

            <h3 className="text-xl font-semibold mb-4 border-b pb-2">
              Room Details
            </h3>

            {/* UI ROOMS GRID (Sorted by F-Group) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRooms.map((room, idx) => {
                const family = familyLabels[room.contactMobile];
                const runningRoomIndex = idx + 1; // Sequential index

                return (
                  <div
                    key={idx}
                    className="border-2 border-gray-300 rounded-lg p-4 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-lg font-bold text-center mb-2">
                        Room {runningRoomIndex}
                        {family && (
                          <span className="text-red-600 font-bold ml-2">
                            ({family})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 text-center mb-2">
                        Mob: {room.contactMobile}
                      </div>
                      <div className="text-sm font-semibold text-center uppercase mb-3">
                        {getSharingLabel(room.occupants.length)} SHARING
                      </div>
                    </div>

                    <div className="space-y-1">
                      {room.occupants.map((p, i) => (
                        <div className="text-xs" key={i}>
                          {p.firstName} {p.lastName} ({p.gender})
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-gray-400 mt-3 pt-2 text-xs text-center text-gray-500">
                      Physical Room No:
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* ================= END VISIBLE UI DISPLAY ================= */}

          {/* ================= OFFSCREEN PDF RENDER (HIDDEN) ================= */}
          <div
            style={{ position: "absolute", left: "-9999px", width: "297mm" }}
          >
            <style>
              {`
              .pdf-page { width:297mm;height:210mm;padding:12mm;background:white; }
              .room-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10mm; }
              .room-card { border:2px solid #333;border-radius:8px;padding:10mm;height:85mm;display:flex;flex-direction:column;justify-content:space-between; }
              .room-title { font-size:15pt;font-weight:bold;text-align:center; }
              .family-badge { color:#d32f2f;font-weight:bold;margin-left:6mm; }
              .mobile { text-align:center;font-size:10pt;margin:4mm 0;color:#1976d2; }
              .sharing { text-align:center;font-size:10pt;font-weight:bold; }
              .guest { font-size:10pt;margin-bottom:2mm; }
            `}
            </style>

            {/* Title Page / Stats Page (First Page) */}
            <div className="pdf-page">
              <h1 style={{ textAlign: "center", fontSize: "28pt" }}>
                Room Allocation Report
              </h1>
              {/* 1. INCREASE TOUR TITLE SIZE */}
              <h2
                style={{
                  textAlign: "center",
                  marginTop: "10mm",
                  fontSize: "22pt",
                  fontWeight: "bold",
                }}
              >
                {selectedTour?.title}
              </h2>

              {/* 2. RESTRUCTURE HOTEL/DATE/PLACE FOR BETTER SPACING */}
              <div
                style={{
                  marginTop: "15mm",
                  marginBottom: "10mm",
                  lineHeight: "1.2", // Tighten line height for grouping
                  fontSize: "14pt",
                  fontWeight: "bold",
                }}
              >
                {/* FIRST LINE: Hotel Name (Left) and Check-in Date (Right) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5mm",
                  }}
                >
                  {/* Hotel Name */}
                  <div style={{ width: "55%" }}>Hotel Name: </div>

                  {/* Check-in Date */}
                  <div style={{ width: "40%" }}>Check-in Date: </div>
                </div>

                {/* SECOND LINE: Place (Full width) */}
                <div style={{ width: "100%", marginTop: "5mm" }}>Place: </div>
              </div>

              {hasFamilies && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#d32f2f",
                    fontStyle: "italic",
                    marginTop: "15mm", // Added extra spacing after hotel details
                  }}
                >
                  * Rooms are grouped by contact mobile number (F1, F2, F3,
                  etc.)
                </p>
              )}

              {/* PDF STATS GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "10mm",
                  marginTop: "15mm", // Added extra spacing before stats
                }}
              >
                <Stat label="Total" value={roomStats.total} isPDF={true} />
                <Stat label="Single" value={roomStats.single} isPDF={true} />
                <Stat label="Double" value={roomStats.double} isPDF={true} />
                <Stat label="Triple" value={roomStats.triple} isPDF={true} />
                <Stat label="Quad" value={roomStats.quad} isPDF={true} />
              </div>
            </div>

            {/* Room Detail Pages */}
            {roomChunks.map((chunk, pageIndex) => (
              <div className="pdf-page" key={pageIndex}>
                <div className="room-grid">
                  {chunk.map((room, idx) => {
                    // Retrieve the correct group label using the contactMobile
                    const family = familyLabels[room.contactMobile];

                    // Sequential Room Count (Room 1, Room 2...)
                    const runningRoomIndex = pageIndex * CHUNK_SIZE + idx + 1;

                    return (
                      <div className="room-card" key={idx}>
                        <div>
                          <div className="room-title">
                            {/* Display sequential room index and family label (Room 1 (F1)) */}
                            Room {runningRoomIndex}
                            {family && (
                              <span className="family-badge">({family})</span>
                            )}
                          </div>
                          <div className="mobile">
                            Mob: {room.contactMobile}
                          </div>
                          <div className="sharing">
                            {getSharingLabel(room.occupants.length)} SHARING
                          </div>
                        </div>

                        <div>
                          {room.occupants.map((p, i) => (
                            <div className="guest" key={i}>
                              {p.firstName} {p.lastName} ({p.gender})
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            borderTop: "1px dashed #333",
                            textAlign: "center",
                            fontSize: "9pt",
                            paddingTop: "2mm",
                          }}
                        >
                          Physical Room No:
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value, isUI, isPDF }) => {
  // Styles for PDF (large, spaced out)
  if (isPDF) {
    return (
      <div
        style={{
          border: "2px solid #333",
          borderRadius: "8px",
          padding: "10mm",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24pt", fontWeight: "bold" }}>{value}</div>
        <div style={{ fontSize: "12pt" }}>{label}</div>
      </div>
    );
  }

  // Styles for UI (compact, Tailwind)
  if (isUI) {
    return (
      <div className="border border-gray-400 rounded-lg p-3 text-center">
        <div className="text-xl font-bold">{value}</div>
        <div className="text-sm">{label}</div>
      </div>
    );
  }

  return null;
};

export default TourRoomList;
