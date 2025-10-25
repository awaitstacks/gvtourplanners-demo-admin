import React, { useContext, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CancelRule = () => {
  const { updateCancelRule, backendUrl, aToken, logout } =
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

  // Toast configuration
  const toastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate GV sections
    ["advancePaid", "fullyPaid"].forEach((section) => {
      formData.gv[section].tiers.forEach((tier, index) => {
        if (
          (tier.fromDays !== "" && tier.fromDays < 0) ||
          (tier.toDays !== "" && tier.toDays < 0) ||
          (tier.percentage !== "" &&
            (tier.percentage < 0 || tier.percentage > 100))
        ) {
          newErrors[`gv_${section}_${index}`] =
            "Values must be non-negative and percentage must be 0-100";
        }
      });
    });

    // Validate IRCTC section
    formData.irctc.forEach((item, index) => {
      if (
        (item.noOfDays !== "" && item.noOfDays < 0) ||
        (item.fixedAmount !== "" && item.fixedAmount < 0) ||
        (item.percentage !== "" &&
          (item.percentage < 0 || item.percentage > 100))
      ) {
        newErrors[`irctc_${index}`] =
          "Values must be non-negative and percentage must be 0-100";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle GV input changes
  const handleGVChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.gv[section].tiers[index][field] = value;
      return updated;
    });
  };

  // Add new GV tier
  const handleAddGVTier = (section) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.gv[section].tiers.push({
        fromDays: "",
        toDays: "",
        percentage: "",
      });
      return updated;
    });
  };

  // Remove GV tier
  const handleRemoveGVTier = (section, index) => {
    if (formData.gv[section].tiers.length > 1) {
      setFormData((prev) => {
        const updated = { ...prev };
        updated.gv[section].tiers.splice(index, 1);
        return updated;
      });
      toast.success("Tier removed successfully!", toastOptions);
    } else {
      toast.error("At least one tier must remain.", toastOptions);
    }
  };

  // Handle IRCTC input changes
  const handleIRCTCChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.irctc[index][field] = value;
      return updated;
    });
  };

  // Add new IRCTC row
  const handleAddIRCTCRow = () => {
    setFormData((prev) => ({
      ...prev,
      irctc: [
        ...prev.irctc,
        { classType: "", noOfDays: "", fixedAmount: "", percentage: "" },
      ],
    }));
  };

  // Remove IRCTC row
  const handleRemoveIRCTCRow = (index) => {
    if (formData.irctc.length > 1) {
      setFormData((prev) => {
        const updated = { ...prev };
        updated.irctc.splice(index, 1);
        return updated;
      });
      toast.success("Row removed successfully!", toastOptions);
    } else {
      toast.error("At least one row must remain.", toastOptions);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors before submitting", toastOptions);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${backendUrl}/api/touradmin/touradmincancelrule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            atoken: aToken, // ✅ Match middleware
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Cancellation Chart Updated Successfully!", toastOptions);
      } else {
        toast.error(
          data.message || "Failed to update cancellation chart",
          toastOptions
        );
        if (data.message === "Not authorized login again" && logout) logout();
      }
    } catch (error) {
      console.error("Error updating cancellation rules:", error);
      toast.error(
        error.message || "Failed to update cancellation chart",
        toastOptions
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center sm:text-4xl">
          Update Cancellation Chart
        </h1>

        {/* GV Section */}
        {["advancePaid", "fullyPaid"].map((section) => (
          <div key={section} className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize sm:text-2xl">
              {section.replace(/([A-Z])/g, " $1")} Cancellation Rules
            </h2>
            <div className="sm:overflow-x-auto">
              <div className="sm:hidden space-y-4">
                {formData.gv[section].tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-2 sm:p-4 bg-white shadow-sm"
                  >
                    <div className="space-y-2">
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
                              index,
                              "fromDays",
                              e.target.value
                            )
                          }
                          className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`gv_${section}_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter days (optional)"
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
                            handleGVChange(
                              section,
                              index,
                              "toDays",
                              e.target.value
                            )
                          }
                          className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`gv_${section}_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter days (optional)"
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
                              index,
                              "percentage",
                              e.target.value
                            )
                          }
                          className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`gv_${section}_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="0-100 (optional)"
                        />
                      </div>
                      <div>
                        <button
                          onClick={() => handleRemoveGVTier(section, index)}
                          className="w-full sm:w-auto px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {errors[`gv_${section}_0`] && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors[`gv_${section}_0`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <table className="hidden sm:table w-full text-sm sm:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 sm:p-3 text-left">From Days</th>
                    <th className="p-2 sm:p-3 text-left">To Days</th>
                    <th className="p-2 sm:p-3 text-left">Percentage (%)</th>
                    <th className="p-2 sm:p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.gv[section].tiers.map((tier, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 sm:p-3">
                        <input
                          type="number"
                          value={tier.fromDays}
                          onChange={(e) =>
                            handleGVChange(
                              section,
                              index,
                              "fromDays",
                              e.target.value
                            )
                          }
                          className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`gv_${section}_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter days (optional)"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <input
                          type="number"
                          value={tier.toDays}
                          onChange={(e) =>
                            handleGVChange(
                              section,
                              index,
                              "toDays",
                              e.target.value
                            )
                          }
                          className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`gv_${section}_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter days (optional)"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <input
                          type="number"
                          value={tier.percentage}
                          onChange={(e) =>
                            handleGVChange(
                              section,
                              index,
                              "percentage",
                              e.target.value
                            )
                          }
                          className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`gv_${section}_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="0-100 (optional)"
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <button
                          onClick={() => handleRemoveGVTier(section, index)}
                          className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-xs sm:text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {errors[`gv_${section}_0`] && (
                <p className="text-red-500 text-sm mt-2 px-2 sm:px-3">
                  {errors[`gv_${section}_0`]}
                </p>
              )}
              <button
                onClick={() => handleAddGVTier(section)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
              >
                + Add Tier
              </button>
            </div>
          </div>
        ))}

        {/* IRCTC Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 sm:text-2xl">
            IRCTC Cancellation Rules
          </h2>
          <div className="sm:overflow-x-auto">
            <div className="sm:hidden space-y-4">
              {formData.irctc.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-2 sm:p-4 bg-white shadow-sm"
                >
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Class Type
                      </label>
                      <input
                        type="text"
                        value={item.classType}
                        onChange={(e) =>
                          handleIRCTCChange(index, "classType", e.target.value)
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g. SL / 3A (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Days Before Departure
                      </label>
                      <input
                        type="number"
                        value={item.noOfDays}
                        onChange={(e) =>
                          handleIRCTCChange(index, "noOfDays", e.target.value)
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter days (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fixed Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={item.fixedAmount}
                        onChange={(e) =>
                          handleIRCTCChange(
                            index,
                            "fixedAmount",
                            e.target.value
                          )
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter amount (optional)"
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
                          handleIRCTCChange(index, "percentage", e.target.value)
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="0-100 (optional)"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => handleRemoveIRCTCRow(index)}
                        className="w-full sm:w-auto px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {errors[`irctc_0`] && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors[`irctc_0`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <table className="hidden sm:table w-full text-sm sm:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 sm:p-3 text-left">Class Type</th>
                  <th className="p-2 sm:p-3 text-left">
                    Days Before Departure
                  </th>
                  <th className="p-2 sm:p-3 text-left">Fixed Amount (₹)</th>
                  <th className="p-2 sm:p-3 text-left">Percentage (%)</th>
                  <th className="p-2 sm:p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.irctc.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 sm:p-3">
                      <input
                        type="text"
                        value={item.classType}
                        onChange={(e) =>
                          handleIRCTCChange(index, "classType", e.target.value)
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g. SL / 3A (optional)"
                      />
                    </td>
                    <td className="p-2 sm:p-3">
                      <input
                        type="number"
                        value={item.noOfDays}
                        onChange={(e) =>
                          handleIRCTCChange(index, "noOfDays", e.target.value)
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter days (optional)"
                      />
                    </td>
                    <td className="p-2 sm:p-3">
                      <input
                        type="number"
                        value={item.fixedAmount}
                        onChange={(e) =>
                          handleIRCTCChange(
                            index,
                            "fixedAmount",
                            e.target.value
                          )
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter amount (optional)"
                      />
                    </td>
                    <td className="p-2 sm:p-3">
                      <input
                        type="number"
                        value={item.percentage}
                        onChange={(e) =>
                          handleIRCTCChange(index, "percentage", e.target.value)
                        }
                        className={`w-full p-1 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`irctc_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="0-100 (optional)"
                      />
                    </td>
                    <td className="p-2 sm:p-3">
                      <button
                        onClick={() => handleRemoveIRCTCRow(index)}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-xs sm:text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors[`irctc_0`] && (
              <p className="text-red-500 text-sm mt-2 px-2 sm:px-3">
                {errors[`irctc_0`]}
              </p>
            )}
            <button
              onClick={handleAddIRCTCRow}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
            >
              + Add Class Rule
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 rounded-lg text-white font-semibold transition duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-blue-700"
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
