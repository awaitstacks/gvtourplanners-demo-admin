import React, { useContext, useEffect, useState } from "react";
import { TourContext } from "../../context/TourContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const CHUNK_SIZE = 8;

const COMPANY_NAME = "GV - Tour Planners LLP";
const COMPANY_ADDRESS = "15/4, Nehru Street, Jaihindpuram, Madurai - 625011";

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
  const [isGeneratingVendorPDF, setIsGeneratingVendorPDF] = useState(false);

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
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const getSharingLabel = (count) => {
    if (count === 1) return "SINGLE";
    if (count === 2) return "DOUBLE";
    if (count === 3) return "TRIPLE";
    return "QUAD";
  };

  const getSharingColor = (count) => {
    if (count === 1) return "bg-amber-100 text-amber-800";
    if (count === 2) return "bg-blue-100 text-blue-800";
    if (count === 3) return "bg-emerald-100 text-emerald-800";
    return "bg-purple-100 text-purple-800";
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

  /* ---------------- GROUP LABELS ---------------- */
  const getMobileGroupLabels = () => {
    const mobileToGroupMap = {};
    let counter = 1;
    if (!roomAllocation?.groupedByMobile)
      return { groupMap: mobileToGroupMap, hasGroups: false };

    roomAllocation.groupedByMobile.forEach((group) => {
      const label = `F${counter++}`;
      mobileToGroupMap[group.contactMobile] = label;
    });

    return { groupMap: mobileToGroupMap, hasGroups: counter > 1 };
  };

  /* ---------------- FLATTEN + SORT ROOMS ---------------- */
  const getAllRooms = (familyLabels) => {
    if (!roomAllocation?.groupedByMobile) return [];

    const rooms = [];
    roomAllocation.groupedByMobile.forEach((group) => {
      const groupLabel = familyLabels[group.contactMobile];
      group.rooms.forEach((room) => {
        rooms.push({
          ...room,
          roomNumber: room.roomNumber,
          contactMobile: group.contactMobile,
          groupLabel: groupLabel,
        });
      });
    });

    rooms.sort((a, b) => {
      const labelA = parseInt(a.groupLabel?.substring(1) || "999");
      const labelB = parseInt(b.groupLabel?.substring(1) || "999");
      if (labelA !== labelB) return labelA - labelB;
      return a.roomNumber - b.roomNumber;
    });

    return rooms;
  };

  const { groupMap: familyLabels, hasGroups: hasFamilies } =
    getMobileGroupLabels();
  const allRooms = getAllRooms(familyLabels);
  const roomStats = getRoomStats();
  const roomChunks = chunkArray(allRooms, CHUNK_SIZE);

  /* ---------------- PDF EXPORT ---------------- */
  const exportToPDF = async (isVendor = false) => {
    const generating = isVendor ? isGeneratingVendorPDF : isGeneratingPDF;
    if (generating) return;

    if (isVendor) setIsGeneratingVendorPDF(true);
    else setIsGeneratingPDF(true);

    const pages = document.querySelectorAll(
      isVendor ? ".vendor-pdf-page" : ".admin-pdf-page"
    );
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

      const suffix = isVendor ? "_Vendor" : "";
      const fileName =
        (selectedTour?.title || "Room_Allocation")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 40) +
        suffix +
        ".pdf";

      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    } finally {
      if (isVendor) setIsGeneratingVendorPDF(false);
      else setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
          Tour Room Allocation
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
          <select
            className="w-full max-w-lg mx-auto block border-2 border-gray-300 rounded-lg px-5 py-4 text-lg focus:border-blue-500 focus:outline-none transition"
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
        </div>

        {roomAllocationLoading && (
          <div className="text-center text-blue-600 text-xl font-medium">
            Loading room allocation...
          </div>
        )}

        {roomAllocationError && (
          <div className="text-center text-red-600 text-xl font-medium bg-red-50 py-4 rounded-lg">
            {roomAllocationError}
          </div>
        )}

        {selectedTourId &&
          !roomAllocationLoading &&
          !roomAllocationError &&
          allRooms.length === 0 && (
            <div className="text-center text-gray-600 text-xl bg-gray-100 py-10 rounded-xl">
              No room allocations found for this tour.
            </div>
          )}

        {allRooms.length > 0 && (
          <>
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button
                onClick={() => exportToPDF(false)}
                disabled={isGeneratingPDF}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
              >
                {isGeneratingPDF ? "Generating..." : "Download Full PDF"}
              </button>

              <button
                onClick={() => exportToPDF(true)}
                disabled={isGeneratingVendorPDF}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-105"
              >
                {isGeneratingVendorPDF
                  ? "Generating..."
                  : "Download Vendor File"}
              </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className=" bg-white-300 text-blue py-8 px-6">
                <h2 className="text-3xl font-bold text-center">
                  {selectedTour?.title}
                </h2>
                {hasFamilies && (
                  <p className="text-center mt-4 text-black-100 italic text-lg">
                    Rooms grouped by family (F1, F2, F3...)
                  </p>
                )}
              </div>

              <div className="p-6 lg:p-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                  <StatBox
                    label="Total Rooms"
                    value={roomStats.total}
                    color="blue"
                  />
                  <StatBox
                    label="Single"
                    value={roomStats.single}
                    color="amber"
                  />
                  <StatBox
                    label="Double"
                    value={roomStats.double}
                    color="emerald"
                  />
                  <StatBox
                    label="Triple"
                    value={roomStats.triple}
                    color="purple"
                  />
                  <StatBox label="Quad" value={roomStats.quad} color="rose" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center border-b-2 border-gray-200 pb-4">
                  Room Details
                </h3>

                {/* Responsive Room Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allRooms.map((room, idx) => {
                    const family = familyLabels[room.contactMobile];
                    const runningRoomIndex = idx + 1;

                    return (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="text-2xl font-bold text-gray-800">
                              Room {runningRoomIndex}
                            </div>
                            {family && (
                              <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                                {family}
                              </span>
                            )}
                          </div>

                          <div className="text-center text-gray-600 mb-4">
                            Mob: {room.contactMobile}
                          </div>

                          <div
                            className={`inline-block mx-auto px-6 py-2 rounded-full font-semibold text-sm ${getSharingColor(
                              room.occupants.length
                            )}`}
                          >
                            {room.occupants.length} SHARING
                          </div>
                        </div>

                        <div className="mt-6 space-y-2">
                          {room.occupants.map((p, i) => (
                            <div
                              key={i}
                              className="text-sm font-medium text-gray-700"
                            >
                              {p.firstName} {p.lastName}{" "}
                              <span className="text-gray-500">
                                ({p.gender})
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-dashed border-gray-300 mt-6 pt-4 text-center text-xs text-gray-500">
                          Physical Room No:
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= OFFSCREEN PDFs ================= */}
      <style>{pdfStyles}</style>

      {/* ADMIN PDF (WITH MOBILE) */}
      <div style={{ position: "absolute", left: "-9999px", width: "297mm" }}>
        {/* First Page - Admin (ONLY HERE company header) */}
        <div className="pdf-page admin-pdf-page">
          <div style={{ textAlign: "center", marginBottom: "8mm" }}>
            <div
              style={{ fontSize: "20pt", fontWeight: "bold", color: "#1e40af" }}
            >
              {COMPANY_NAME}
            </div>
            <div style={{ fontSize: "12pt", color: "#4b5563" }}>
              {COMPANY_ADDRESS}
            </div>
          </div>

          <h1
            style={{
              textAlign: "center",
              fontSize: "28pt",
              color: "#1e40af",
              margin: "10mm 0",
            }}
          >
            Room Allocation Report
          </h1>
          <h2
            style={{
              textAlign: "center",
              fontSize: "22pt",
              fontWeight: "bold",
            }}
          >
            {selectedTour?.title}
          </h2>

          <div
            style={{
              marginTop: "15mm",
              fontSize: "14pt",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "80mm",
                maxWidth: "240mm",
                margin: "0 auto",
              }}
            >
              <div>Hotel Name:</div>
              <div>Check-in Date:</div>
            </div>
            <div
              style={{
                width: "100%",
                marginTop: "5mm",
                textAlign: "left",
                maxWidth: "240mm",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Place:
            </div>
          </div>

          {hasFamilies && (
            <p
              style={{
                textAlign: "center",
                color: "#dc2626",
                fontStyle: "italic",
                marginTop: "15mm",
              }}
            >
              * Rooms are grouped by contact mobile number (F1, F2, F3, etc.)
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: "10mm",
              marginTop: "15mm",
            }}
          >
            <Stat label="Total" value={roomStats.total} isPDF />
            <Stat label="Single" value={roomStats.single} isPDF />
            <Stat label="Double" value={roomStats.double} isPDF />
            <Stat label="Triple" value={roomStats.triple} isPDF />
            <Stat label="Quad" value={roomStats.quad} isPDF />
          </div>
        </div>

        {/* Subsequent Room Pages - Admin (NO company header) */}
        {roomChunks.map((chunk, pageIndex) => (
          <div className="pdf-page admin-pdf-page" key={`admin-${pageIndex}`}>
            <div className="room-grid">
              {chunk.map((room, idx) => {
                const family = familyLabels[room.contactMobile];
                const runningRoomIndex = pageIndex * CHUNK_SIZE + idx + 1;
                return (
                  <div className="room-card" key={idx}>
                    <div>
                      <div className="room-title">
                        Room {runningRoomIndex}
                        {family && (
                          <span className="family-badge">({family})</span>
                        )}
                      </div>
                      <div className="mobile">Mob: {room.contactMobile}</div>
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

      {/* VENDOR PDF (NO MOBILE) */}
      <div style={{ position: "absolute", left: "-9999px", width: "297mm" }}>
        {/* First Page - Vendor (ONLY HERE company header) */}
        <div className="pdf-page vendor-pdf-page">
          <div style={{ textAlign: "center", marginBottom: "8mm" }}>
            <div
              style={{ fontSize: "20pt", fontWeight: "bold", color: "#059669" }}
            >
              {COMPANY_NAME}
            </div>
            <div style={{ fontSize: "12pt", color: "#4b5563" }}>
              {COMPANY_ADDRESS}
            </div>
          </div>

          <h1
            style={{
              textAlign: "center",
              fontSize: "28pt",
              color: "#059669",
              margin: "10mm 0",
            }}
          >
            Room Allocation - Vendor Copy
          </h1>
          <h2
            style={{
              textAlign: "center",
              fontSize: "22pt",
              fontWeight: "bold",
            }}
          >
            {selectedTour?.title}
          </h2>

          <div
            style={{
              marginTop: "15mm",
              fontSize: "14pt",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "80mm",
                maxWidth: "240mm",
                margin: "0 auto",
              }}
            >
              <div>Hotel Name:</div>
              <div>Check-in Date:</div>
            </div>
            <div
              style={{
                width: "100%",
                marginTop: "5mm",
                textAlign: "left",
                maxWidth: "240mm",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Place:
            </div>
          </div>
          {hasFamilies && (
            <p
              style={{
                textAlign: "center",
                color: "#dc2626",
                fontStyle: "italic",
                marginTop: "15mm",
              }}
            >
              * Rooms are grouped by family (F1, F2, F3, etc.)
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: "10mm",
              marginTop: "15mm",
            }}
          >
            <Stat label="Total" value={roomStats.total} isPDF />
            <Stat label="Single" value={roomStats.single} isPDF />
            <Stat label="Double" value={roomStats.double} isPDF />
            <Stat label="Triple" value={roomStats.triple} isPDF />
            <Stat label="Quad" value={roomStats.quad} isPDF />
          </div>
        </div>

        {/* Subsequent Room Pages - Vendor (NO company header) */}
        {roomChunks.map((chunk, pageIndex) => (
          <div className="pdf-page vendor-pdf-page" key={`vendor-${pageIndex}`}>
            <div className="room-grid">
              {chunk.map((room, idx) => {
                const family = familyLabels[room.contactMobile];
                const runningRoomIndex = pageIndex * CHUNK_SIZE + idx + 1;
                return (
                  <div className="room-card" key={idx}>
                    <div>
                      <div className="room-title">
                        Room {runningRoomIndex}
                        {family && (
                          <span className="family-badge">({family})</span>
                        )}
                      </div>
                      {/* Mobile hidden in vendor copy */}
                      <div className="sharing" style={{ marginTop: "8mm" }}>
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
    </div>
  );
};

/* Shared PDF Styles */
const pdfStyles = `
  .pdf-page { width:297mm;height:210mm;padding:12mm;background:white; }
  .room-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10mm; }
  .room-card { border:2px solid #333;border-radius:8px;padding:10mm;height:85mm;display:flex;flex-direction:column;justify-content:space-between; }
  .room-title { font-size:15pt;font-weight:bold;text-align:center; }
  .family-badge { color:#d32f2f;font-weight:bold;margin-left:6mm; }
  .mobile { text-align:center;font-size:10pt;margin:4mm 0;color:#1976d2; }
  .sharing { text-align:center;font-size:10pt;font-weight:bold; }
  .guest { font-size:10pt;margin-bottom:2mm; }
`;

/* Stat Components */
const StatBox = ({ label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div
      className={`border-2 ${colorClasses[color]} rounded-xl p-6 text-center shadow-sm`}
    >
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-2">{label}</div>
    </div>
  );
};

const Stat = ({ label, value, isPDF }) => {
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
  return null;
};

export default TourRoomList;
