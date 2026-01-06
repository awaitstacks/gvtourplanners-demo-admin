/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CancelRule = () => {
  const { updateCancelRule, getCancelRule, cancelRule, logout } =
    useContext(TourAdminContext);

  const [formData, setFormData] = useState({
    gv: {
      advancePaid: { tiers: [{ fromDays: "", toDays: "", percentage: "" }] },
      fullyPaid: { tiers: [{ fromDays: "", toDays: "", percentage: "" }] },
    },
    irctc: [{ classType: "", noOfDays: "", fixedAmount: "", percentage: "" }],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toastOptions = {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // === LOAD DATA ON MOUNT ===
  useEffect(() => {
    const loadData = async () => {
      if (!cancelRule) {
        setLoading(true);
        try {
          await getCancelRule();
        } catch (err) {
          toast.error("Failed to load cancellation rules", toastOptions);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCancelRule, cancelRule]);

  // === FILL FORM WHEN cancelRule CHANGES ===
  useEffect(() => {
    if (cancelRule) {
      const ensureArray = (arr) =>
        Array.isArray(arr) && arr.length > 0 ? arr : [];

      setFormData({
        gv: {
          advancePaid: {
            tiers: ensureArray(cancelRule.gv?.advancePaid?.tiers).map((t) => ({
              fromDays: t.fromDays ?? "",
              toDays: t.toDays ?? "",
              percentage: t.percentage ?? "",
            })),
          },
          fullyPaid: {
            tiers: ensureArray(cancelRule.gv?.fullyPaid?.tiers).map((t) => ({
              fromDays: t.fromDays ?? "",
              toDays: t.toDays ?? "",
              percentage: t.percentage ?? "",
            })),
          },
        },
        irctc: ensureArray(cancelRule.irctc).map((i) => ({
          classType: i.classType ?? "",
          noOfDays: i.noOfDays ?? "",
          fixedAmount: i.fixedAmount ?? "",
          percentage: i.percentage ?? "",
        })),
      });
    }
  }, [cancelRule]);

  // === VALIDATION ===
  const validateForm = () => {
    const newErrors = {};

    ["advancePaid", "fullyPaid"].forEach((section) => {
      formData.gv[section].tiers.forEach((tier, idx) => {
        if (
          (tier.fromDays !== "" && tier.fromDays < 0) ||
          (tier.toDays !== "" && tier.toDays < 0) ||
          (tier.percentage !== "" &&
            (tier.percentage < 0 || tier.percentage > 100))
        ) {
          newErrors[`gv_${section}_${idx}`] =
            "Values must be non-negative and percentage 0-100";
        }
      });
    });

    formData.irctc.forEach((item, idx) => {
      if (
        (item.noOfDays !== "" && item.noOfDays < 0) ||
        (item.fixedAmount !== "" && item.fixedAmount < 0) ||
        (item.percentage !== "" &&
          (item.percentage < 0 || item.percentage > 100))
      ) {
        newErrors[`irctc_${idx}`] =
          "Values must be non-negative and percentage 0-100";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // === HANDLERS ===
  const handleGVChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.gv[section].tiers[index][field] = value;
      return updated;
    });
  };

  const handleAddGVTier = (section) => {
    setFormData((prev) => ({
      ...prev,
      gv: {
        ...prev.gv,
        [section]: {
          tiers: [
            ...prev.gv[section].tiers,
            { fromDays: "", toDays: "", percentage: "" },
          ],
        },
      },
    }));
  };

  const handleRemoveGVTier = (section, index) => {
    if (formData.gv[section].tiers.length > 1) {
      setFormData((prev) => {
        const updated = { ...prev };
        updated.gv[section].tiers.splice(index, 1);
        return updated;
      });
      toast.success("Tier removed", toastOptions);
    } else {
      toast.error("At least one tier must remain.", toastOptions);
    }
  };

  const handleIRCTCChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.irctc[index][field] = value;
      return updated;
    });
  };

  const handleAddIRCTCRow = () => {
    setFormData((prev) => ({
      ...prev,
      irctc: [
        ...prev.irctc,
        { classType: "", noOfDays: "", fixedAmount: "", percentage: "" },
      ],
    }));
  };

  const handleRemoveIRCTCRow = (index) => {
    if (formData.irctc.length > 1) {
      setFormData((prev) => {
        const updated = { ...prev };
        updated.irctc.splice(index, 1);
        return updated;
      });
      toast.success("Row removed", toastOptions);
    } else {
      toast.error("At least one row must remain.", toastOptions);
    }
  };

  // === SUBMIT ===
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors", toastOptions);
      return;
    }

    setLoading(true);
    try {
      await updateCancelRule(formData);
      toast.success("Cancellation chart updated successfully!", toastOptions);
    } catch (err) {
      if (
        err?.response?.data?.message === "Not authorized login again" &&
        logout
      ) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // === RENDER ===
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center sm:text-4xl">
          Update Cancellation Chart
        </h1>

        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* GV SECTIONS */}
        {["advancePaid", "fullyPaid"].map((section) => (
          <div key={section} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize sm:text-2xl">
              {section.replace(/([A-Z])/g, " $1")} Rules
            </h2>

            {/* Mobile View */}
            <div className="sm:hidden space-y-4">
              {formData.gv[section].tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 bg-gray-50 shadow-sm"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        From Days
                      </label>
                      <input
                        type="number"
                        value={tier.fromDays}
                        onChange={(e) =>
                          handleGVChange(
                            section,
                            idx,
                            "fromDays",
                            e.target.value
                          )
                        }
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`gv_${section}_${idx}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g. 30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        To Days
                      </label>
                      <input
                        type="number"
                        value={tier.toDays}
                        onChange={(e) =>
                          handleGVChange(section, idx, "toDays", e.target.value)
                        }
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`gv_${section}_${idx}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g. 15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={tier.percentage}
                        onChange={(e) =>
                          handleGVChange(
                            section,
                            idx,
                            "percentage",
                            e.target.value
                          )
                        }
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`gv_${section}_${idx}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g. 20"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveGVTier(section, idx)}
                      className="w-full mt-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Remove Tier
                    </button>
                  </div>
                  {errors[`gv_${section}_${idx}`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`gv_${section}_${idx}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <table className="hidden sm:table w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">From Days</th>
                  <th className="p-3 text-left">To Days</th>
                  <th className="p-3 text-left">Percentage (%)</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.gv[section].tiers.map((tier, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">
                      <input
                        type="number"
                        value={tier.fromDays}
                        onChange={(e) =>
                          handleGVChange(
                            section,
                            idx,
                            "fromDays",
                            e.target.value
                          )
                        }
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`gv_${section}_${idx}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="30"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={tier.toDays}
                        onChange={(e) =>
                          handleGVChange(section, idx, "toDays", e.target.value)
                        }
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`gv_${section}_${idx}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="15"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={tier.percentage}
                        onChange={(e) =>
                          handleGVChange(
                            section,
                            idx,
                            "percentage",
                            e.target.value
                          )
                        }
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`gv_${section}_${idx}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="20"
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRemoveGVTier(section, idx)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => handleAddGVTier(section)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
            >
              + Add Tier
            </button>
          </div>
        ))}

        {/* IRCTC SECTION */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 sm:text-2xl">
            IRCTC Cancellation Rules
          </h2>

          {/* Mobile View */}
          <div className="sm:hidden space-y-4">
            {formData.irctc.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-3 bg-gray-50 shadow-sm"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Class Type
                    </label>
                    <input
                      type="text"
                      value={item.classType}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "classType", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g. SL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Days Before
                    </label>
                    <input
                      type="number"
                      value={item.noOfDays}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "noOfDays", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g. 7"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fixed Amount (INR)
                    </label>
                    <input
                      type="number"
                      value={item.fixedAmount}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "fixedAmount", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g. 60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={item.percentage}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "percentage", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveIRCTCRow(idx)}
                    className="w-full mt-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Remove Row
                  </button>
                </div>
                {errors[`irctc_${idx}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`irctc_${idx}`]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Class Type</th>
                <th className="p-3 text-left">Days Before</th>
                <th className="p-3 text-left">Fixed Amount (INR)</th>
                <th className="p-3 text-left">Percentage (%)</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.irctc.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.classType}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "classType", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="SL"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.noOfDays}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "noOfDays", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="7"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.fixedAmount}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "fixedAmount", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="60"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.percentage}
                      onChange={(e) =>
                        handleIRCTCChange(idx, "percentage", e.target.value)
                      }
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors[`irctc_${idx}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="50"
                    />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleRemoveIRCTCRow(idx)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleAddIRCTCRow}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            + Add Class Rule
          </button>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 rounded-lg text-white font-semibold transition duration-200 text-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } w-full sm:w-auto`}
          >
            {loading ? "Updating..." : "Update Cancellation Chart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRule;
