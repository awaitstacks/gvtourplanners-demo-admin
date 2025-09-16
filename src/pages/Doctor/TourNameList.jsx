import React, { useState, useContext, useEffect } from "react";
import { TourContext } from "../../context/TourContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TourNameList = () => {
  const { bookings, getBookings, updateTravellerDetails } =
    useContext(TourContext);

  const [initialized, setInitialized] = useState(false);
  const [tableData, setTableData] = useState({
    trainColumns: [],
    flightColumns: [],
    travellers: [],
  });

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  // Initialize merged table
  useEffect(() => {
    if (!initialized && bookings.length > 0) {
      const trainSet = new Set();
      const flightSet = new Set();
      const travellersList = [];

      bookings.forEach((booking) => {
        booking.travellers.forEach((trav) => {
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
        });
      });

      const trainColumns =
        trainSet.size > 0 ? Array.from(trainSet) : ["Train 1"];
      const flightColumns =
        flightSet.size > 0 ? Array.from(flightSet) : ["Flight 1"];

      bookings.forEach((booking) => {
        booking.travellers.forEach((trav) => {
          const trainSeatsMap = {};
          const flightSeatsMap = {};

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
            mobile: booking.contact?.mobile ?? trav.phone ?? "",
            trainSeats: trainSeatsMap,
            flightSeats: flightSeatsMap,
            remarks: trav.staffRemarks ?? trav.remarks ?? "",
          });
        });
      });

      setTableData({
        trainColumns,
        flightColumns,
        travellers: travellersList,
      });
      setInitialized(true);
    }
  }, [bookings, initialized]);

  const cloneState = (s) => JSON.parse(JSON.stringify(s));

  // ------------------ PDF Export ------------------
  const exportToPDF = () => {
    const doc = new jsPDF("landscape", "pt", "a4");
    const tourTitle = bookings[0]?.tourData?.title || "Tour Traveller List";

    doc.setFontSize(18);
    doc.text(tourTitle, doc.internal.pageSize.getWidth() / 2, 40, {
      align: "center",
    });

    // Table headers
    const head = [
      [
        "SL NO",
        "NAME",
        "AGE",
        "MOBILE",
        ...tableData.trainColumns,
        ...tableData.flightColumns,
        "Remarks",
      ],
    ];

    // Table rows
    const body = tableData.travellers.map((trav, idx) => [
      String(idx + 1).padStart(2, "0"),
      trav.name,
      trav.age,
      trav.mobile || "—",
      ...tableData.trainColumns.map((c) => trav.trainSeats[c] ?? ""),
      ...tableData.flightColumns.map((c) => trav.flightSeats[c] ?? ""),
      trav.remarks ?? "",
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
  };

  // ------------------------------------------------

  // Add train/flight column
  const handleAddGlobalColumn = (type) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      if (type === "train") {
        let newName = `Train ${updated.trainColumns.length + 1}`;
        updated.trainColumns.push(newName);
        updated.travellers.forEach((t) => (t.trainSeats[newName] = ""));
      } else {
        let newName = `Flight ${updated.flightColumns.length + 1}`;
        updated.flightColumns.push(newName);
        updated.travellers.forEach((t) => (t.flightSeats[newName] = ""));
      }
      return updated;
    });
  };

  // Rename column
  const handleColumnNameChangeGlobal = (type, index, newName) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      if (type === "train") {
        const oldName = updated.trainColumns[index];
        updated.trainColumns[index] = newName;
        updated.travellers.forEach((t) => {
          t.trainSeats[newName] = t.trainSeats[oldName] ?? "";
          if (oldName !== newName) delete t.trainSeats[oldName];
        });
      } else {
        const oldName = updated.flightColumns[index];
        updated.flightColumns[index] = newName;
        updated.travellers.forEach((t) => {
          t.flightSeats[newName] = t.flightSeats[oldName] ?? "";
          if (oldName !== newName) delete t.flightSeats[oldName];
        });
      }
      return updated;
    });
  };

  // Remove column
  const handleRemoveGlobalColumn = async (type, index) => {
    let removed;
    setTableData((prev) => {
      const updated = cloneState(prev);
      if (type === "train") {
        if (updated.trainColumns.length <= 1) return prev;
        removed = updated.trainColumns.splice(index, 1)[0];
        updated.travellers.forEach((t) => delete t.trainSeats[removed]);
      } else {
        if (updated.flightColumns.length <= 1) return prev;
        removed = updated.flightColumns.splice(index, 1)[0];
        updated.travellers.forEach((t) => delete t.flightSeats[removed]);
      }
      return updated;
    });

    // persist changes
    for (const traveller of tableData.travellers) {
      await handleSaveSingleTraveller(traveller);
    }
  };

  // Traveller edits
  const handleSeatChange = (travellerId, type, column, value) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      const traveller = updated.travellers.find((t) => t.id === travellerId);
      if (!traveller) return prev;
      if (type === "train") traveller.trainSeats[column] = value;
      else traveller.flightSeats[column] = value;
      return updated;
    });
  };

  const handleRemarksChange = (travellerId, value) => {
    setTableData((prev) => {
      const updated = cloneState(prev);
      const traveller = updated.travellers.find((t) => t.id === travellerId);
      if (!traveller) return prev;
      traveller.remarks = value;
      return updated;
    });
  };

  // Save one traveller
  const handleSaveSingleTraveller = async (traveller) => {
    const trainSeatsArr = Object.entries(traveller.trainSeats).map(
      ([trainName, seatNo]) => ({ trainName, seatNo })
    );
    const flightSeatsArr = Object.entries(traveller.flightSeats).map(
      ([flightName, seatNo]) => ({ flightName, seatNo })
    );

    const payload = {
      trainSeats: trainSeatsArr,
      flightSeats: flightSeatsArr,
      staffRemarks: traveller.remarks ?? "",
    };

    const booking = bookings.find((b) =>
      b.travellers.some((t) => t._id === traveller.id)
    );
    if (!booking) return;

    await updateTravellerDetails(booking._id, traveller.id, payload);
    getBookings();
  };

  // Save ALL travellers
  const handleSaveAllTravellers = async () => {
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
        staffRemarks: traveller.remarks ?? "",
      };

      const booking = bookings.find((b) =>
        b.travellers.some((t) => t._id === traveller.id)
      );
      if (!booking) return null;

      return updateTravellerDetails(booking._id, traveller.id, payload);
    });

    await Promise.all(promises);
    getBookings();
    alert("All traveller details saved successfully!");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "100%", overflowX: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "18px" }}>
        Traveller Name List
      </h2>

      {/* Export Button at Top */}
      <div style={{ textAlign: "right", marginBottom: "16px" }}>
        <button onClick={exportToPDF} style={pdfBtn}>
          📄 Export to PDF
        </button>
      </div>

      {tableData.travellers.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          No travellers found.
        </p>
      ) : (
        <>
          <div style={{ marginBottom: 12, display: "flex", gap: 12 }}>
            <button
              onClick={() => handleAddGlobalColumn("train")}
              style={addBtn}
            >
              + Add Train
            </button>
            <button
              onClick={() => handleAddGlobalColumn("flight")}
              style={{ ...addBtn, background: "#17a2b8" }}
            >
              + Add Flight
            </button>
            <button
              onClick={handleSaveAllTravellers}
              style={{ ...addBtn, background: "#6f42c1" }}
            >
              💾 Save All
            </button>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1200px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th style={thStyle}>SL NO</th>
                <th style={thStyle}>NAME</th>
                <th style={thStyle}>AGE</th>
                <th style={thStyle}>MOBILE</th>

                {tableData.trainColumns.map((col, i) => (
                  <th key={i} style={thStyle}>
                    <div style={headerFlex}>
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
                        style={headerInput}
                      />
                      {tableData.trainColumns.length > 1 && (
                        <button
                          onClick={() => handleRemoveGlobalColumn("train", i)}
                          style={removeBtn}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}

                {tableData.flightColumns.map((col, i) => (
                  <th key={i} style={thStyle}>
                    <div style={headerFlex}>
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
                        style={headerInput}
                      />
                      {tableData.flightColumns.length > 1 && (
                        <button
                          onClick={() => handleRemoveGlobalColumn("flight", i)}
                          style={removeBtn}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </th>
                ))}

                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tableData.travellers.map((trav, idx) => (
                <tr key={trav.id}>
                  <td style={tdCenter}>{String(idx + 1).padStart(2, "0")}.</td>
                  <td style={tdStyle}>{trav.name}</td>
                  <td style={tdCenter}>{trav.age}</td>
                  <td style={tdCenter}>{trav.mobile || "—"}</td>

                  {tableData.trainColumns.map((col, i) => (
                    <td key={i} style={tdStyle}>
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
                        style={inputStyle}
                      />
                    </td>
                  ))}

                  {tableData.flightColumns.map((col, i) => (
                    <td key={i} style={tdStyle}>
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
                        style={inputStyle}
                      />
                    </td>
                  ))}

                  <td style={tdStyle}>
                    <textarea
                      value={trav.remarks ?? ""}
                      onChange={(e) =>
                        handleRemarksChange(trav.id, e.target.value)
                      }
                      style={textareaStyle}
                    />
                  </td>

                  <td style={tdCenter}>
                    <button
                      onClick={() => handleSaveSingleTraveller(trav)}
                      style={saveBtn}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

// Styles
const thStyle = {
  padding: "8px",
  border: "1px solid #e0e0e0",
  textAlign: "center",
  verticalAlign: "middle",
};
const tdStyle = {
  padding: "6px",
  border: "1px solid #e9e9e9",
  verticalAlign: "top",
};
const tdCenter = { ...tdStyle, textAlign: "center" };
const inputStyle = {
  width: "100%",
  padding: "6px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};
const headerInput = {
  width: "120px",
  padding: "6px",
  border: "1px solid #bbb",
  borderRadius: "6px",
  fontWeight: "700",
  textAlign: "center",
  background: "#fff",
};
const addBtn = {
  padding: "8px 14px",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
const pdfBtn = {
  padding: "8px 14px",
  background: "#dc3545",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
const removeBtn = {
  padding: "6px 8px",
  background: "red",
  color: "white",
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  marginLeft: 8,
};
const saveBtn = {
  padding: "6px 12px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const textareaStyle = {
  width: "100%",
  minHeight: "48px",
  padding: "6px",
  borderRadius: 4,
  border: "1px solid #ccc",
};
const headerFlex = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  justifyContent: "center",
};

export default TourNameList;
