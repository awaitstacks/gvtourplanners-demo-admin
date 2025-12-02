/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { TourContext } from "../../context/TourContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || "Unknown error occurred"}</p>
          <p>Please refresh the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const TourProfile = () => {
  const {
    backendUrl,
    ttoken,
    tourList,
    getTourList,
    profileData,
    getProfileData,
  } = useContext(TourContext);
  const location = useLocation();

  const defaultTrain = {
    trainNo: "",
    trainName: "",
    fromCode: "",
    fromStation: "",
    toCode: "",
    toStation: "",
    class: "",
    departureTime: "",
    arrivalTime: "",
    ticketOpenDate: "",
  };

  const defaultFlight = {
    airline: "",
    flightNo: "",
    fromCode: "",
    fromAirport: "",
    toCode: "",
    toAirport: "",
    class: "",
    departureTime: "",
    arrivalTime: "",
  };

  const defaultStationPoint = { stationCode: "", stationName: "" };

  const defaultVariantPackage = {
    duration: { days: "", nights: "" },
    price: {
      doubleSharing: "",
      tripleSharing: "",
      childWithBerth: "",
      childWithoutBerth: "",
    },
    advanceAmount: { adult: "", child: "" },
    destination: [""],
    sightseeing: [""],
    itinerary: [""],
    includes: [""],
    excludes: [""],
    trainDetails: [defaultTrain],
    flightDetails: [defaultFlight],
    addons: [{ name: "", amount: "" }],
    remarks: "",
    boardingPoints: [defaultStationPoint],
    deboardingPoints: [defaultStationPoint],
    lastBookingDate: "",
  };

  const initialForm = {
    title: "",
    batch: "",
    duration: { days: "", nights: "" },
    price: {
      doubleSharing: "",
      tripleSharing: "",
      childWithBerth: "",
      childWithoutBerth: "",
    },
    advanceAmount: {
      adult: "",
      child: "",
    },
    destination: [""],
    sightseeing: [""],
    itinerary: [""],
    includes: [""],
    excludes: [""],
    trainDetails: [defaultTrain],
    flightDetails: [defaultFlight],
    lastBookingDate: "",
    completedTripsCount: "",
    addons: [{ name: "", amount: "" }],
    boardingPoints: [defaultStationPoint],
    deboardingPoints: [defaultStationPoint],
    remarks: "",
    variantPackage: [],
  };

  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState({
    titleImage: null,
    mapImage: null,
    galleryImages: [],
  });
  const [balances, setBalances] = useState({
    balanceDouble: "",
    balanceTriple: "",
    balanceChildWithBerth: "",
    balanceChildWithoutBerth: "",
  });
  const [variantBalances, setVariantBalances] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addingTransport, setAddingTransport] = useState({});
  const [fetchCount, setFetchCount] = useState(0);

  // Clear toasts on route change
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, [location]);

  // Handle API responses
  const handleApiResponse = useCallback(
    (response, successMessage, errorMessage) => {
      console.log("API Response:", response);
      if (response && typeof response === "object" && "success" in response) {
        if (response.success) {
          toast.success(successMessage || "Operation completed successfully");
          return true;
        } else {
          toast.error(response.message || errorMessage || "Operation failed");
          return false;
        }
      } else {
        toast.error("Invalid response from server");
        return false;
      }
    },
    []
  );

  // Fetch tours for dropdown
  useEffect(() => {
    console.log(
      "Fetching tour list at",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );
    setIsLoading(true);
    getTourList()
      .then((response) => {
        handleApiResponse(
          response,
          "Tour list fetched successfully",
          "Failed to fetch tour list"
        );
        console.log("Tour list fetched, count:", fetchCount + 1);
        setFetchCount((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Tour list fetch error:", error);
        toast.error("Failed to fetch tour list: " + error.message);
      })
      .finally(() => setIsLoading(false));
  }, [getTourList, handleApiResponse]);

  // Fetch profile on selection
  useEffect(() => {
    if (
      selectedTourId &&
      (!profileData || profileData._id !== selectedTourId)
    ) {
      console.log(
        "Fetching profile for tourId:",
        selectedTourId,
        "at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      setIsLoading(true);
      getProfileData(selectedTourId)
        .then((response) => {
          handleApiResponse(
            response,
            "Profile data fetched successfully",
            "Failed to fetch profile data"
          );
          console.log(
            "Profile data fetched for tourId:",
            selectedTourId,
            "count:",
            fetchCount + 1
          );
          setFetchCount((prev) => prev + 1);
        })
        .catch((error) => {
          console.error(
            "Profile fetch error for tourId:",
            selectedTourId,
            error
          );
          toast.error("Failed to fetch profile data: " + error.message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedTourId, getProfileData, profileData?._id, handleApiResponse]);

  // Update form data and balances when profileData changes
  useEffect(() => {
    if (profileData && selectedTourId) {
      console.log(
        "Updating formData with profileData:",
        profileData,
        "at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );
      const shouldUpdate = !formData._id || formData._id !== profileData._id;
      if (shouldUpdate) {
        setFormData((prev) => ({
          ...prev,
          ...profileData,
          _id: profileData._id,
          duration: profileData.duration || prev.duration,
          price: profileData.price || prev.price,
          advanceAmount: profileData.advanceAmount || prev.advanceAmount,
          destination: profileData.destination?.length
            ? profileData.destination
            : prev.destination,
          sightseeing: profileData.sightseeing?.length
            ? profileData.sightseeing
            : prev.sightseeing,
          itinerary: profileData.itinerary?.length
            ? profileData.itinerary
            : prev.itinerary,
          includes: profileData.includes?.length
            ? profileData.includes
            : prev.includes,
          excludes: profileData.excludes?.length
            ? profileData.excludes
            : prev.excludes,
          trainDetails: profileData.trainDetails?.length
            ? profileData.trainDetails
            : prev.trainDetails,
          flightDetails: profileData.flightDetails?.length
            ? profileData.flightDetails
            : prev.flightDetails,
          addons: profileData.addons?.length ? profileData.addons : prev.addons,
          boardingPoints: profileData.boardingPoints?.length
            ? profileData.boardingPoints
            : prev.boardingPoints,
          deboardingPoints: profileData.deboardingPoints?.length
            ? profileData.deboardingPoints
            : prev.deboardingPoints,
          remarks: profileData.remarks || prev.remarks,
          variantPackage: profileData.variantPackage?.length
            ? profileData.variantPackage
            : prev.variantPackage,
        }));
        setBalances({
          balanceDouble: profileData.balanceDouble || "",
          balanceTriple: profileData.balanceTriple || "",
          balanceChildWithBerth: profileData.balanceChildWithBerth || "",
          balanceChildWithoutBerth: profileData.balanceChildWithoutBerth || "",
        });
        setVariantBalances(
          profileData.variantPackage?.map((variant) => ({
            balanceDouble: variant.balanceDouble || "",
            balanceTriple: variant.balanceTriple || "",
            balanceChildWithBerth: variant.balanceChildWithBerth || "",
            balanceChildWithoutBerth: variant.balanceChildWithoutBerth || "",
          })) || []
        );
      }
    }
  }, [profileData, selectedTourId]);

  // Recalculate balances for main tour
  useEffect(() => {
    const { price, advanceAmount } = formData;
    if (price && advanceAmount) {
      const adultAdvance = Number(advanceAmount.adult) || 0;
      const childAdvance = Number(advanceAmount.child) || 0;
      setBalances({
        balanceDouble: Number(price.doubleSharing) - adultAdvance || "",
        balanceTriple: Number(price.tripleSharing) - adultAdvance || "",
        balanceChildWithBerth:
          Number(price.childWithBerth || 0) - childAdvance || "",
        balanceChildWithoutBerth:
          Number(price.childWithoutBerth || 0) - childAdvance || "",
      });
    }
  }, [formData.price, formData.advanceAmount]);

  // Recalculate balances for variant packages
  useEffect(() => {
    setVariantBalances(
      formData.variantPackage.map((variant) => {
        const adultAdvance = Number(variant.advanceAmount?.adult) || 0;
        const childAdvance = Number(variant.advanceAmount?.child) || 0;
        return {
          balanceDouble:
            Number(variant.price?.doubleSharing || 0) - adultAdvance || "",
          balanceTriple:
            Number(variant.price?.tripleSharing || 0) - adultAdvance || "",
          balanceChildWithBerth:
            Number(variant.price?.childWithBerth || 0) - childAdvance || "",
          balanceChildWithoutBerth:
            Number(variant.price?.childWithoutBerth || 0) - childAdvance || "",
        };
      })
    );
  }, [formData.variantPackage]);

  const handleChange = useCallback(
    (
      e,
      field,
      nestedField = null,
      index = null,
      subField = null,
      variantIndex = null
    ) => {
      const value = e.target.value;
      console.log("Changing field:", {
        field,
        nestedField,
        index,
        subField,
        variantIndex,
        value,
      });
      if (variantIndex !== null) {
        if (nestedField && index !== null) {
          setFormData((prev) => {
            const updatedVariants = [...(prev.variantPackage || [])];
            if (!updatedVariants[variantIndex]) return prev;
            const updated = [
              ...(updatedVariants[variantIndex][nestedField] || []),
            ];
            updated[index] = { ...updated[index], [subField]: value };
            updatedVariants[variantIndex] = {
              ...updatedVariants[variantIndex],
              [nestedField]: updated,
            };
            return { ...prev, variantPackage: updatedVariants };
          });
        } else if (typeof field === "object") {
          setFormData((prev) => {
            const updatedVariants = [...(prev.variantPackage || [])];
            if (!updatedVariants[variantIndex]) return prev;
            updatedVariants[variantIndex] = {
              ...updatedVariants[variantIndex],
              [field.main]: {
                ...updatedVariants[variantIndex][field.main],
                [field.sub]: value,
              },
            };
            return { ...prev, variantPackage: updatedVariants };
          });
        } else if (index !== null) {
          setFormData((prev) => {
            const updatedVariants = [...(prev.variantPackage || [])];
            if (!updatedVariants[variantIndex]) return prev;
            const updated = [...(updatedVariants[variantIndex][field] || [])];
            updated[index] = value;
            updatedVariants[variantIndex] = {
              ...updatedVariants[variantIndex],
              [field]: updated,
            };
            return { ...prev, variantPackage: updatedVariants };
          });
        } else {
          setFormData((prev) => {
            const updatedVariants = [...(prev.variantPackage || [])];
            if (!updatedVariants[variantIndex]) return prev;
            updatedVariants[variantIndex] = {
              ...updatedVariants[variantIndex],
              [field]: value,
            };
            return { ...prev, variantPackage: updatedVariants };
          });
        }
      } else if (nestedField && index !== null) {
        setFormData((prev) => {
          const updated = [...(prev[nestedField] || [])];
          updated[index] = { ...updated[index], [subField]: value };
          return { ...prev, [nestedField]: updated };
        });
      } else if (typeof field === "object") {
        setFormData((prev) => ({
          ...prev,
          [field.main]: {
            ...prev[field.main],
            [field.sub]: value,
          },
        }));
      } else if (index !== null) {
        setFormData((prev) => {
          const updated = [...(prev[field] || [])];
          updated[index] = value;
          return { ...prev, [field]: updated };
        });
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    },
    []
  );

  const addField = useCallback((field, template = "", variantIndex = null) => {
    if (variantIndex !== null) {
      setFormData((prev) => {
        const updatedVariants = [...(prev.variantPackage || [])];
        if (!updatedVariants[variantIndex]) return prev;
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          [field]: [...(updatedVariants[variantIndex][field] || []), template],
        };
        return { ...prev, variantPackage: updatedVariants };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), template],
      }));
    }
  }, []);

  const removeField = useCallback((field, index, variantIndex = null) => {
    if (variantIndex !== null) {
      setFormData((prev) => {
        const updatedVariants = [...(prev.variantPackage || [])];
        if (!updatedVariants[variantIndex]) return prev;
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          [field]: (updatedVariants[variantIndex][field] || []).filter(
            (_, i) => i !== index
          ),
        };
        return { ...prev, variantPackage: updatedVariants };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: (prev[field] || []).filter((_, i) => i !== index),
      }));
    }
  }, []);

  const addTransportDetail = useCallback(
    (field, template, variantIndex = null) => {
      if (variantIndex !== null) {
        setAddingTransport((prev) => ({
          ...prev,
          [variantIndex]: field,
        }));
        setFormData((prev) => {
          const updatedVariants = [...(prev.variantPackage || [])];
          if (!updatedVariants[variantIndex]) return prev;
          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            [field]: [
              ...(updatedVariants[variantIndex][field] || []),
              { ...template },
            ],
          };
          console.log(
            `Added ${field} to variant ${variantIndex}:`,
            updatedVariants[variantIndex][field]
          );
          return { ...prev, variantPackage: updatedVariants };
        });
        setTimeout(() => {
          setAddingTransport((prev) => ({
            ...prev,
            [variantIndex]: null,
          }));
        }, 500);
      } else {
        setAddingTransport((prev) => ({
          ...prev,
          main: field,
        }));
        setFormData((prev) => ({
          ...prev,
          [field]: [...(prev[field] || []), { ...template }],
        }));
        setTimeout(() => {
          setAddingTransport((prev) => ({
            ...prev,
            main: null,
          }));
        }, 500);
      }
    },
    []
  );

  const removeTransportDetail = useCallback(
    (field, index, variantIndex = null) => {
      if (variantIndex !== null) {
        setFormData((prev) => {
          const updatedVariants = [...(prev.variantPackage || [])];
          if (!updatedVariants[variantIndex]) return prev;
          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            [field]: (updatedVariants[variantIndex][field] || []).filter(
              (_, i) => i !== index
            ),
          };
          console.log(
            `Removed ${field} at index ${index} from variant ${variantIndex}:`,
            updatedVariants[variantIndex][field]
          );
          return { ...prev, variantPackage: updatedVariants };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: (prev[field] || []).filter((_, i) => i !== index),
        }));
      }
    },
    []
  );

  const handleImageChange = useCallback((e, field) => {
    if (field === "galleryImages") {
      setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
    } else {
      setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  }, []);

  const addVariantPackage = useCallback(() => {
    setFormData((prev) => {
      const newVariant = { ...defaultVariantPackage };
      console.log("Adding new variant package:", newVariant);
      return {
        ...prev,
        variantPackage: [...(prev.variantPackage || []), newVariant],
      };
    });
    setVariantBalances((prev) => [
      ...prev,
      {
        balanceDouble: "",
        balanceTriple: "",
        balanceChildWithBerth: "",
        balanceChildWithoutBerth: "",
      },
    ]);
  }, []);

  const removeVariantPackage = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      variantPackage: (prev.variantPackage || []).filter((_, i) => i !== index),
    }));
    setAddingTransport((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setVariantBalances((prev) => prev.filter((_, i) => i !== index));
    console.log("Removed variant package at index:", index);
  }, []);

  const validateFormData = useCallback(() => {
    toast.dismiss();
    const numberFields = {
      "price.doubleSharing": formData.price.doubleSharing,
      "price.tripleSharing": formData.price.tripleSharing,
      "price.childWithBerth": formData.price.childWithBerth,
      "price.childWithoutBerth": formData.price.childWithoutBerth,
      "advanceAmount.adult": formData.advanceAmount.adult,
      "advanceAmount.child": formData.advanceAmount.child,
      completedTripsCount: formData.completedTripsCount,
    };

    for (const [key, value] of Object.entries(numberFields)) {
      if (value && isNaN(Number(value))) {
        toast.error(
          `${key
            .replace(".", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} must be a number`
        );
        return false;
      }
    }

    for (let i = 0; i < formData.variantPackage.length; i++) {
      const variant = formData.variantPackage[i];
      const variantNumberFields = {
        [`variantPackage[${i}].price.doubleSharing`]:
          variant.price?.doubleSharing,
        [`variantPackage[${i}].price.tripleSharing`]:
          variant.price?.tripleSharing,
        [`variantPackage[${i}].price.childWithBerth`]:
          variant.price?.childWithBerth,
        [`variantPackage[${i}].price.childWithoutBerth`]:
          variant.price?.childWithoutBerth,
        [`variantPackage[${i}].advanceAmount.adult`]:
          variant.advanceAmount?.adult,
        [`variantPackage[${i}].advanceAmount.child`]:
          variant.advanceAmount?.child,
        [`variantPackage[${i}].duration.days`]: variant.duration?.days,
        [`variantPackage[${i}].duration.nights`]: variant.duration?.nights,
      };
      for (const [key, value] of Object.entries(variantNumberFields)) {
        if (value && isNaN(Number(value))) {
          toast.error(
            `${key
              .replace(".", " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())} must be a number`
          );
          return false;
        }
      }
    }

    if (images.galleryImages.length > 0 && images.galleryImages.length !== 3) {
      toast.error("Please upload exactly 3 gallery images");
      return false;
    }
    return true;
  }, [formData, images]);

  const resetForm = useCallback(() => {
    setSelectedTourId("");
    setFormData(initialForm);
    setImages({ titleImage: null, mapImage: null, galleryImages: [] });
    setBalances({
      balanceDouble: "",
      balanceTriple: "",
      balanceChildWithBerth: "",
      balanceChildWithoutBerth: "",
    });
    setVariantBalances([]);
    setAddingTransport({});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTourId) {
      toast.dismiss();
      toast.error("Please select a tour to update");
      return;
    }
    if (!validateFormData()) return;

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("tourId", selectedTourId);

      const fieldsToAppend = {
        title: formData.title,
        batch: formData.batch,
        lastBookingDate: formData.lastBookingDate,
        completedTripsCount: formData.completedTripsCount,
        remarks: formData.remarks || "", // Ensure remarks is sent even if empty
      };
      for (const [key, value] of Object.entries(fieldsToAppend)) {
        data.append(key, value || "");
      }

      const objectsToAppend = {
        duration: formData.duration,
        price: formData.price,
        advanceAmount: formData.advanceAmount,
        variantPackage: formData.variantPackage,
      };
      for (const [key, value] of Object.entries(objectsToAppend)) {
        data.append(key, JSON.stringify(value));
      }

      if (!isNaN(balances.balanceDouble))
        data.append("balanceDouble", balances.balanceDouble);
      if (!isNaN(balances.balanceTriple))
        data.append("balanceTriple", balances.balanceTriple);
      if (!isNaN(balances.balanceChildWithBerth))
        data.append("balanceChildWithBerth", balances.balanceChildWithBerth);
      if (!isNaN(balances.balanceChildWithoutBerth))
        data.append(
          "balanceChildWithoutBerth",
          balances.balanceChildWithoutBerth
        );

      const arraysToAppend = {
        destination: formData.destination,
        sightseeing: formData.sightseeing,
        itinerary: formData.itinerary,
        includes: formData.includes,
        excludes: formData.excludes,
        trainDetails: formData.trainDetails,
        flightDetails: formData.flightDetails,
        addons: formData.addons,
        boardingPoints: formData.boardingPoints,
        deboardingPoints: formData.deboardingPoints,
      };
      for (const [key, value] of Object.entries(arraysToAppend)) {
        data.append(key, JSON.stringify(value));
      }

      if (images.titleImage) data.append("titleImage", images.titleImage);
      if (images.mapImage) data.append("mapImage", images.mapImage);
      if (images.galleryImages.length > 0) {
        images.galleryImages.forEach((img) =>
          data.append("galleryImages", img)
        );
      }

      console.log("FormData being sent:", Object.fromEntries(data));

      const res = await axios.put(
        `${backendUrl}/api/tour/update-tourprofile`,
        data,
        {
          headers: {
            ttoken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Update tour profile response:", res.data);
      toast.dismiss();
      if (handleApiResponse(res.data, "Tour profile updated successfully")) {
        resetForm();
        getTourList();
        // Re-fetch profile data to reflect updates
        if (selectedTourId) {
          getProfileData(selectedTourId);
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error(
        "Update Error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while updating profile";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
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
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-6 text-gray-800">
          Update Tour Profile
        </h1>
        <div className="mb-6">
          <label className="block font-semibold mb-1">
            Select a Tour to Edit
          </label>
          <select
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="w-full p-3 border"
            disabled={isLoading}
          >
            <option value="">-- Please Select a Tour --</option>
            {tourList.map((tour) => (
              <option key={tour._id} value={tour._id}>
                {tour.title}
              </option>
            ))}
          </select>
          {isLoading && <p className="text-gray-500 mt-2">Loading...</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              placeholder="Title"
              className="w-full p-3 border"
              value={formData.title || ""}
              onChange={(e) => handleChange(e, "title")}
              disabled={isLoading}
            />
          </div>

          {/* Batch */}
          <div>
            <label className="block font-semibold mb-1">Speciality</label>
            <select
              onChange={(e) => handleChange(e, "batch")}
              value={formData.batch || ""}
              className="border rounded px-3 py-2 w-full"
              disabled={isLoading}
            >
              <option value="">Select tour category</option>
              <option value="Devotional">Devotional</option>
              <option value="Religious">Religious</option>
              <option value="Honeymoon">Honeymoon</option>
              <option value="Jolly">Jolly</option>
              <option value="Spritual">Spritual</option>
              <option value="Spritual+Sightseeing">
                Spritual + Sightseeing
              </option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-semibold mb-1">Duration</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Days"
                className="p-3 border w-full"
                value={formData.duration?.days || ""}
                onChange={(e) =>
                  handleChange(e, { main: "duration", sub: "days" })
                }
                disabled={isLoading}
              />
              <input
                type="number"
                placeholder="Nights"
                className="p-3 border w-full"
                value={formData.duration?.nights || ""}
                onChange={(e) =>
                  handleChange(e, { main: "duration", sub: "nights" })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Advance Amounts and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Advance Amounts</h2>
              <div className="space-y-2">
                <label className="block">
                  Adult Advance
                  <input
                    type="number"
                    placeholder="Adult Advance"
                    className="p-3 border w-full"
                    value={formData.advanceAmount?.adult || ""}
                    onChange={(e) =>
                      handleChange(e, { main: "advanceAmount", sub: "adult" })
                    }
                    disabled={isLoading}
                  />
                </label>
                <label className="block">
                  Child Advance
                  <input
                    type="number"
                    placeholder="Child Advance"
                    className="p-3 border w-full"
                    value={formData.advanceAmount?.child || ""}
                    onChange={(e) =>
                      handleChange(e, { main: "advanceAmount", sub: "child" })
                    }
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Pricing</h2>
              <div className="space-y-2">
                <label className="block">
                  Double Sharing Price
                  <input
                    type="number"
                    placeholder="Double Sharing Price"
                    className="p-3 border w-full"
                    value={formData.price?.doubleSharing || ""}
                    onChange={(e) =>
                      handleChange(e, { main: "price", sub: "doubleSharing" })
                    }
                    disabled={isLoading}
                  />
                </label>
                <label className="block">
                  Triple Sharing Price
                  <input
                    type="number"
                    placeholder="Triple Sharing Price"
                    className="p-3 border w-full"
                    value={formData.price?.tripleSharing || ""}
                    onChange={(e) =>
                      handleChange(e, { main: "price", sub: "tripleSharing" })
                    }
                    disabled={isLoading}
                  />
                </label>
                <label className="block">
                  Child with Berth Price
                  <input
                    type="number"
                    placeholder="Child with Berth Price"
                    className="p-3 border w-full"
                    value={formData.price?.childWithBerth || ""}
                    onChange={(e) =>
                      handleChange(e, { main: "price", sub: "childWithBerth" })
                    }
                    disabled={isLoading}
                  />
                </label>
                <label className="block">
                  Child without Berth Price
                  <input
                    type="number"
                    placeholder="Child without Berth Price"
                    className="p-3 border w-full"
                    value={formData.price?.childWithoutBerth || ""}
                    onChange={(e) =>
                      handleChange(e, {
                        main: "price",
                        sub: "childWithoutBerth",
                      })
                    }
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Calculated Balances */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Calculated Balances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                Double Sharing Balance
                <input
                  type="text"
                  readOnly
                  className="p-3 border w-full bg-gray-100"
                  value={
                    isNaN(balances.balanceDouble)
                      ? "N/A"
                      : balances.balanceDouble
                  }
                  disabled
                />
              </label>
              <label className="block">
                Triple Sharing Balance
                <input
                  type="text"
                  readOnly
                  className="p-3 border w-full bg-gray-100"
                  value={
                    isNaN(balances.balanceTriple)
                      ? "N/A"
                      : balances.balanceTriple
                  }
                  disabled
                />
              </label>
              <label className="block">
                Child with Berth Balance
                <input
                  type="text"
                  readOnly
                  className="p-3 border w-full bg-gray-100"
                  value={
                    isNaN(balances.balanceChildWithBerth)
                      ? "N/A"
                      : balances.balanceChildWithBerth
                  }
                  disabled
                />
              </label>
              <label className="block">
                Child without Berth Balance
                <input
                  type="text"
                  readOnly
                  className="p-3 border w-full bg-gray-100"
                  value={
                    isNaN(balances.balanceChildWithoutBerth)
                      ? "N/A"
                      : balances.balanceChildWithoutBerth
                  }
                  disabled
                />
              </label>
            </div>
          </div>

          {/* Dynamic Arrays */}
          {[
            "destination",
            "sightseeing",
            "includes",
            "excludes",
            "itinerary",
          ].map((field) => (
            <div key={field}>
              <label className="block font-semibold capitalize mb-1">
                {field}
              </label>
              {(formData[field] || []).map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 items-center mb-2"
                >
                  <input
                    value={item || ""}
                    placeholder={`${field} ${index + 1}`}
                    className="w-full p-3 border"
                    onChange={(e) => handleChange(e, field, null, index, null)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
                    onClick={() => removeField(field, index)}
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-1 rounded"
                onClick={() => addField(field, "")}
                disabled={isLoading}
              >
                + Add {field}
              </button>
            </div>
          ))}

          {/* Train and Flight Details */}
          {["trainDetails", "flightDetails"].map((type) => (
            <div key={type}>
              <label className="block font-semibold mb-1 capitalize">
                {type}
              </label>
              {(formData[type] || []).map((detail, index) => (
                <div key={index} className="border p-4 rounded mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(detail).map(
                      ([key, value]) =>
                        key !== "_id" && (
                          <label key={key} className="block">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                            <input
                              type={
                                key.toLowerCase().includes("date")
                                  ? "date"
                                  : "text"
                              }
                              value={value || ""}
                              placeholder={key}
                              className="p-3 border w-full"
                              onChange={(e) =>
                                handleChange(e, null, type, index, key)
                              }
                              disabled={isLoading}
                            />
                          </label>
                        )
                    )}
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm mt-2 w-full sm:w-auto"
                    onClick={() => removeTransportDetail(type, index)}
                    disabled={isLoading}
                  >
                    Remove {type === "trainDetails" ? "Train" : "Flight"}{" "}
                    Details
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-1 rounded"
                onClick={() =>
                  addTransportDetail(
                    type,
                    type === "trainDetails" ? defaultTrain : defaultFlight
                  )
                }
                disabled={isLoading}
              >
                + Add {type === "trainDetails" ? "Train" : "Flight"} Details
              </button>
            </div>
          ))}

          {/* Boarding Points */}
          <div>
            <label className="block font-semibold mb-1">Boarding Points</label>
            {(formData.boardingPoints || []).map((bp, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-center mb-2"
              >
                <input
                  type="text"
                  placeholder="Station code (e.g., MAS)"
                  value={bp.stationCode || ""}
                  className="p-3 border w-full sm:flex-1"
                  onChange={(e) =>
                    handleChange(
                      e,
                      null,
                      "boardingPoints",
                      index,
                      "stationCode"
                    )
                  }
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Station name (e.g., MGR Chennai Central)"
                  value={bp.stationName || ""}
                  className="p-3 border w-full sm:flex-1"
                  onChange={(e) =>
                    handleChange(
                      e,
                      null,
                      "boardingPoints",
                      index,
                      "stationName"
                    )
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
                  onClick={() => removeTransportDetail("boardingPoints", index)}
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="relative">
              <button
                type="button"
                className={`bg-blue-500 text-white px-4 py-1 rounded ${
                  addingTransport.main === "boardingPoints"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  addTransportDetail("boardingPoints", defaultStationPoint)
                }
                disabled={addingTransport.main === "boardingPoints"}
              >
                {addingTransport.main === "boardingPoints"
                  ? "Adding Boarding Point..."
                  : "+ Add Boarding Point"}
              </button>
              {addingTransport.main === "boardingPoints" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Deboarding Points */}
          <div>
            <label className="block font-semibold mb-1">
              Deboarding Points
            </label>
            {(formData.deboardingPoints || []).map((dp, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-center mb-2"
              >
                <input
                  type="text"
                  placeholder="Station code (e.g., MAS)"
                  value={dp.stationCode || ""}
                  className="p-3 border w-full sm:flex-1"
                  onChange={(e) =>
                    handleChange(
                      e,
                      null,
                      "deboardingPoints",
                      index,
                      "stationCode"
                    )
                  }
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Station name (e.g., MGR Chennai Central)"
                  value={dp.stationName || ""}
                  className="p-3 border w-full sm:flex-1"
                  onChange={(e) =>
                    handleChange(
                      e,
                      null,
                      "deboardingPoints",
                      index,
                      "stationName"
                    )
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
                  onClick={() =>
                    removeTransportDetail("deboardingPoints", index)
                  }
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="relative">
              <button
                type="button"
                className={`bg-blue-500 text-white px-4 py-1 rounded ${
                  addingTransport.main === "deboardingPoints"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  addTransportDetail("deboardingPoints", defaultStationPoint)
                }
                disabled={addingTransport.main === "deboardingPoints"}
              >
                {addingTransport.main === "deboardingPoints"
                  ? "Adding Deboarding Point..."
                  : "+ Add Deboarding Point"}
              </button>
              {addingTransport.main === "deboardingPoints" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label className="block font-semibold capitalize mb-1">
              Add-ons
            </label>
            {(formData.addons || []).map((addon, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-center mb-2"
              >
                <input
                  type="text"
                  placeholder="Addon Name"
                  value={addon.name || ""}
                  className="p-3 border w-full sm:flex-1"
                  onChange={(e) =>
                    handleChange(e, null, "addons", index, "name")
                  }
                  disabled={isLoading}
                />
                <input
                  type="number"
                  placeholder="Addon Amount"
                  value={addon.amount || ""}
                  className="p-3 border w-full sm:flex-1"
                  onChange={(e) =>
                    handleChange(e, null, "addons", index, "amount")
                  }
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
                  onClick={() => removeTransportDetail("addons", index)}
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-1 rounded"
              onClick={() =>
                addTransportDetail("addons", { name: "", amount: "" })
              }
              disabled={isLoading}
            >
              + Add Add-on
            </button>
          </div>

          {/* Last Booking Date and Completed Trips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">
                Tour start Date
              </label>
              <input
                type="date"
                className="w-full p-3 border"
                value={formData.lastBookingDate || ""}
                onChange={(e) => handleChange(e, "lastBookingDate")}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Completed Trips Count
              </label>
              <input
                type="number"
                className="w-full p-3 border"
                placeholder="Completed Trips Count"
                value={formData.completedTripsCount || ""}
                onChange={(e) => handleChange(e, "completedTripsCount")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Title Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "titleImage")}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
                disabled={isLoading}
              />
              {images.titleImage && (
                <p className="text-green-600 mt-1">
                  Selected: {images.titleImage.name}
                </p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Map Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "mapImage")}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
                disabled={isLoading}
              />
              {images.mapImage && (
                <p className="text-green-600 mt-1">
                  Selected: {images.mapImage.name}
                </p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Gallery Images (Up to 3 images)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e, "galleryImages")}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
                disabled={isLoading}
              />
              {images.galleryImages.length > 0 && (
                <ul className="text-green-600 mt-1 list-disc pl-5">
                  {images.galleryImages.map((img, idx) => (
                    <li key={idx}>{img.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold mb-1">Remarks</label>
            <textarea
              className="w-full p-3 border"
              placeholder="Enter any notes or special information"
              value={formData.remarks || ""}
              onChange={(e) => handleChange(e, "remarks")}
              disabled={isLoading}
            />
          </div>

          {/* Variant Packages */}
          <div>
            <label className="block font-semibold mb-1">Variant Packages</label>
            {(formData.variantPackage || []).map((variant, variantIndex) => {
              if (!variant) {
                console.error(`Variant at index ${variantIndex} is undefined`);
                return null;
              }
              console.log(
                `Rendering variant ${variantIndex} boardingPoints:`,
                variant.boardingPoints
              );
              return (
                <div key={variantIndex} className="border p-4 rounded mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Variant Package {variantIndex + 1}
                  </h3>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm mb-4"
                    onClick={() => removeVariantPackage(variantIndex)}
                    disabled={isLoading}
                  >
                    Remove Variant Package
                  </button>

                  {/* Variant Duration */}
                  <div>
                    <label className="block font-semibold mb-1">Duration</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Days"
                        className="p-3 border w-full"
                        value={variant.duration?.days || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "duration", sub: "days" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                      <input
                        type="number"
                        placeholder="Nights"
                        className="p-3 border w-full"
                        value={variant.duration?.nights || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "duration", sub: "nights" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Variant Prices */}
                  <div>
                    <label className="block font-semibold mb-1">Prices</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <input
                        type="number"
                        placeholder="Double Sharing Price"
                        className="p-3 border w-full"
                        value={variant.price?.doubleSharing || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "price", sub: "doubleSharing" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                      <input
                        type="number"
                        placeholder="Triple Sharing Price"
                        className="p-3 border w-full"
                        value={variant.price?.tripleSharing || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "price", sub: "tripleSharing" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                      <input
                        type="number"
                        placeholder="Child With Berth Price"
                        className="p-3 border w-full"
                        value={variant.price?.childWithBerth || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "price", sub: "childWithBerth" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                      <input
                        type="number"
                        placeholder="Child Without Berth Price"
                        className="p-3 border w-full"
                        value={variant.price?.childWithoutBerth || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "price", sub: "childWithoutBerth" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Variant Advance Amount */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Advance Amount
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Adult Advance Amount"
                        className="p-3 border w-full"
                        value={variant.advanceAmount?.adult || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "advanceAmount", sub: "adult" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                      <input
                        type="number"
                        placeholder="Child Advance Amount"
                        className="p-3 border w-full"
                        value={variant.advanceAmount?.child || ""}
                        onChange={(e) =>
                          handleChange(
                            e,
                            { main: "advanceAmount", sub: "child" },
                            null,
                            null,
                            null,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Variant Calculated Balances */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Calculated Balances
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <label className="block">
                        Double Sharing Balance
                        <input
                          type="text"
                          readOnly
                          className="p-3 border w-full bg-gray-100"
                          value={
                            isNaN(variantBalances[variantIndex]?.balanceDouble)
                              ? "N/A"
                              : variantBalances[variantIndex]?.balanceDouble
                          }
                          disabled
                        />
                      </label>
                      <label className="block">
                        Triple Sharing Balance
                        <input
                          type="text"
                          readOnly
                          className="p-3 border w-full bg-gray-100"
                          value={
                            isNaN(variantBalances[variantIndex]?.balanceTriple)
                              ? "N/A"
                              : variantBalances[variantIndex]?.balanceTriple
                          }
                          disabled
                        />
                      </label>
                      <label className="block">
                        Child with Berth Balance
                        <input
                          type="text"
                          readOnly
                          className="p-3 border w-full bg-gray-100"
                          value={
                            isNaN(
                              variantBalances[variantIndex]
                                ?.balanceChildWithBerth
                            )
                              ? "N/A"
                              : variantBalances[variantIndex]
                                  ?.balanceChildWithBerth
                          }
                          disabled
                        />
                      </label>
                      <label className="block">
                        Child without Berth Balance
                        <input
                          type="text"
                          readOnly
                          className="p-3 border w-full bg-gray-100"
                          value={
                            isNaN(
                              variantBalances[variantIndex]
                                ?.balanceChildWithoutBerth
                            )
                              ? "N/A"
                              : variantBalances[variantIndex]
                                  ?.balanceChildWithoutBerth
                          }
                          disabled
                        />
                      </label>
                    </div>
                  </div>

                  {/* Variant Dynamic Arrays */}
                  {[
                    "destination",
                    "sightseeing",
                    "includes",
                    "excludes",
                    "itinerary",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block font-semibold capitalize mb-1">
                        {field}
                      </label>
                      {(variant[field] || []).map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-center gap-2 mb-2"
                        >
                          <input
                            value={item || ""}
                            placeholder={`${field} ${index + 1}`}
                            className="w-full p-3 border"
                            onChange={(e) =>
                              handleChange(
                                e,
                                field,
                                null,
                                index,
                                null,
                                variantIndex
                              )
                            }
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
                            onClick={() =>
                              removeField(field, index, variantIndex)
                            }
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => addField(field, "", variantIndex)}
                        disabled={isLoading}
                      >
                        + Add {field}
                      </button>
                    </div>
                  ))}

                  {/* Variant Train and Flight Details */}
                  {["trainDetails", "flightDetails"].map((type) => (
                    <div key={type}>
                      <label className="block font-semibold mb-1 capitalize">
                        {type}
                      </label>
                      {(variant[type] || []).map((detail, index) => (
                        <div key={index} className="mb-4 border p-3 rounded">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(detail).map(
                              ([key, value]) =>
                                key !== "_id" && (
                                  <input
                                    key={key}
                                    type={
                                      key.toLowerCase().includes("date")
                                        ? "date"
                                        : "text"
                                    }
                                    value={value || ""}
                                    placeholder={key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      )}
                                    className="p-3 border w-full"
                                    onChange={(e) =>
                                      handleChange(
                                        e,
                                        null,
                                        type,
                                        index,
                                        key,
                                        variantIndex
                                      )
                                    }
                                    disabled={isLoading}
                                  />
                                )
                            )}
                          </div>
                          <button
                            type="button"
                            className="bg-red-500 text-white px-3 py-2 mt-2 rounded text-sm w-full sm:w-auto"
                            onClick={() =>
                              removeTransportDetail(type, index, variantIndex)
                            }
                            disabled={isLoading}
                          >
                            Remove{" "}
                            {type === "trainDetails" ? "Train" : "Flight"}
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() =>
                          addTransportDetail(
                            type,
                            type === "trainDetails"
                              ? defaultTrain
                              : defaultFlight,
                            variantIndex
                          )
                        }
                        disabled={isLoading}
                      >
                        + Add {type === "trainDetails" ? "Train" : "Flight"}
                      </button>
                    </div>
                  ))}

                  {/* Variant Boarding Points */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Boarding Points
                    </label>
                    {(variant.boardingPoints || []).map((bp, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-center gap-2 mb-2"
                      >
                        <input
                          type="text"
                          placeholder="Station code (e.g., MAS)"
                          value={bp.stationCode || ""}
                          className="p-3 border w-full sm:flex-1"
                          onChange={(e) =>
                            handleChange(
                              e,
                              null,
                              "boardingPoints",
                              index,
                              "stationCode",
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          placeholder="Station name (e.g., MGR Chennai Central)"
                          value={bp.stationName || ""}
                          className="p-3 border w-full sm:flex-1"
                          onChange={(e) =>
                            handleChange(
                              e,
                              null,
                              "boardingPoints",
                              index,
                              "stationName",
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
                          onClick={() =>
                            removeTransportDetail(
                              "boardingPoints",
                              index,
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="relative">
                      <button
                        type="button"
                        className={`bg-blue-500 text-white px-4 py-2 rounded ${
                          addingTransport[variantIndex] === "boardingPoints"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() =>
                          addTransportDetail(
                            "boardingPoints",
                            defaultStationPoint,
                            variantIndex
                          )
                        }
                        disabled={
                          addingTransport[variantIndex] === "boardingPoints"
                        }
                      >
                        {addingTransport[variantIndex] === "boardingPoints"
                          ? "Adding Boarding Point..."
                          : "+ Add Boarding Point"}
                      </button>
                      {addingTransport[variantIndex] === "boardingPoints" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant Deboarding Points */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Deboarding Points
                    </label>
                    {(variant.deboardingPoints || []).map((dp, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-center gap-2 mb-2"
                      >
                        <input
                          type="text"
                          placeholder="Station code (e.g., MAS)"
                          value={dp.stationCode || ""}
                          className="p-3 border w-full sm:flex-1"
                          onChange={(e) =>
                            handleChange(
                              e,
                              null,
                              "deboardingPoints",
                              index,
                              "stationCode",
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          placeholder="Station name (e.g., MGR Chennai Central)"
                          value={dp.stationName || ""}
                          className="p-3 border w-full sm:flex-1"
                          onChange={(e) =>
                            handleChange(
                              e,
                              null,
                              "deboardingPoints",
                              index,
                              "stationName",
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
                          onClick={() =>
                            removeTransportDetail(
                              "deboardingPoints",
                              index,
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="relative">
                      <button
                        type="button"
                        className={`bg-blue-500 text-white px-4 py-2 rounded ${
                          addingTransport[variantIndex] === "deboardingPoints"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() =>
                          addTransportDetail(
                            "deboardingPoints",
                            defaultStationPoint,
                            variantIndex
                          )
                        }
                        disabled={
                          addingTransport[variantIndex] === "deboardingPoints"
                        }
                      >
                        {addingTransport[variantIndex] === "deboardingPoints"
                          ? "Adding Deboarding Point..."
                          : "+ Add Deboarding Point"}
                      </button>
                      {addingTransport[variantIndex] === "deboardingPoints" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant Add-ons */}
                  <div>
                    <label className="block font-semibold mb-1">Add-ons</label>
                    {(variant.addons || []).map((addon, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-center gap-2 mb-2"
                      >
                        <input
                          type="text"
                          placeholder="Addon Name"
                          value={addon.name || ""}
                          className="p-3 border w-full sm:flex-1"
                          onChange={(e) =>
                            handleChange(
                              e,
                              null,
                              "addons",
                              index,
                              "name",
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        />
                        <input
                          type="number"
                          placeholder="Addon Amount"
                          value={addon.amount || ""}
                          className="p-3 border w-full sm:flex-1"
                          onChange={(e) =>
                            handleChange(
                              e,
                              null,
                              "addons",
                              index,
                              "amount",
                              variantIndex
                            )
                          }
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-3 py-2 mt-2 sm:mt-0 rounded text-sm w-full sm:w-auto"
                          onClick={() =>
                            removeTransportDetail("addons", index, variantIndex)
                          }
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() =>
                        addTransportDetail(
                          "addons",
                          { name: "", amount: "" },
                          variantIndex
                        )
                      }
                      disabled={isLoading}
                    >
                      + Add Add-on
                    </button>
                  </div>

                  {/* Variant Remarks */}
                  <div>
                    <label className="block font-semibold mb-1">Remarks</label>
                    <textarea
                      className="w-full p-3 border"
                      placeholder="Enter remarks..."
                      value={variant.remarks || ""}
                      onChange={(e) =>
                        handleChange(
                          e,
                          "remarks",
                          null,
                          null,
                          null,
                          variantIndex
                        )
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {/* Variant Last Booking Date */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Tour start Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border"
                      value={variant.lastBookingDate || ""}
                      onChange={(e) =>
                        handleChange(
                          e,
                          "lastBookingDate",
                          null,
                          null,
                          null,
                          variantIndex
                        )
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={addVariantPackage}
              disabled={isLoading}
            >
              + Add Variant Package
            </button>
          </div>

          {/* Submit Button */}
          <div className="relative">
            <button
              type="submit"
              className={`bg-green-600 text-white px-6 py-2 rounded shadow w-full ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default TourProfile;
