import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { TourContext } from "../../context/TourContext";
import { toast } from "react-toastify";

const TourProfile = () => {
  const { backendUrl, ttoken, profileData, getProfileData } =
    useContext(TourContext);

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

  const defaultBoardingPoint = { stationCode: "", stationName: "" };

  const initialForm = {
    title: "",
    batch: "",
    duration: { days: "", nights: "" },
    price: { doubleSharing: "", tripleSharing: "" },
    advanceAmount: "",
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
    remarks: "",
    boardingPoints: [defaultBoardingPoint],
  };

  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState({
    titleImage: null,
    mapImage: null,
    galleryImages: [],
  });

  //fuly deletes all data and refurbish hile updating
  // useEffect(() => {
  //   if (profileData && Object.keys(formData).every((key) => !formData[key])) {
  //     setFormData({
  //       ...initialForm,
  //       ...profileData,
  //       duration: profileData.duration || initialForm.duration,
  //       price: profileData.price || initialForm.price,
  //       addons:
  //         profileData.addons?.length > 0
  //           ? profileData.addons
  //           : initialForm.addons,
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  const location = useLocation();
  useEffect(() => {
    // when the pathname matches this page
    if (location.pathname === "/tour-profile") {
      getProfileData();
    }
  }, [location.pathname]);
  useEffect(() => {
    if (profileData) {
      setFormData({
        ...initialForm,
        ...profileData,
        duration: profileData.duration || initialForm.duration,
        price: profileData.price || initialForm.price,
        addons: profileData.addons?.length
          ? profileData.addons
          : initialForm.addons,
        boardingPoints: profileData.boardingPoints?.length
          ? profileData.boardingPoints
          : initialForm.boardingPoints,
        remarks: profileData.remarks || initialForm.remarks,
      });
    }
  }, [profileData]);

  const handleChange = (
    e,
    field,
    nestedField = null,
    index = null,
    subField = null
  ) => {
    const value = e.target.value;
    if (nestedField && index !== null) {
      setFormData((prev) => {
        const updated = [...prev[nestedField]];
        updated[index][subField] = value;
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
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddonChange = (e, index, field) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = [...prev.addons];
      updated[index][field] = value;
      return { ...prev, addons: updated };
    });
  };

  const addAddonField = () => {
    setFormData((prev) => ({
      ...prev,
      addons: [...prev.addons, { name: "", amount: "" }],
    }));
  };

  const handleArrayChange = (e, index, field) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addField = (field, template = "") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], template] }));
  };

  const addTransportDetail = (field, template) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { ...template }],
    }));
  };

  const handleImageChange = (e, field) => {
    if (field === "galleryImages") {
      setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
    } else {
      setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const validateFormData = () => {
    // Example: only validate if the user actually provided the field
    if (formData.advanceAmount && isNaN(Number(formData.advanceAmount))) {
      toast.error("Advance amount must be a number.");
      return false;
    }

    if (
      formData.price?.doubleSharing &&
      isNaN(Number(formData.price.doubleSharing))
    ) {
      toast.error("Double sharing price must be a number.");
      return false;
    }

    if (
      formData.price?.tripleSharing &&
      isNaN(Number(formData.price.tripleSharing))
    ) {
      toast.error("Triple sharing price must be a number.");
      return false;
    }

    if (
      formData.completedTripsCount &&
      isNaN(Number(formData.completedTripsCount))
    ) {
      toast.error("Trips count must be a number.");
      return false;
    }

    // Only enforce gallery image count when user actually uploads them
    if (images.galleryImages.length > 0 && images.galleryImages.length !== 3) {
      toast.error("Please upload exactly 3 gallery images.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData(initialForm);
    setImages({ titleImage: null, mapImage: null, galleryImages: [] });
  };
  // ✅ Helper to check if array has any non-empty value
  const hasNonEmptyArray = (arr) => {
    if (!arr || arr.length === 0) return false;
    return arr.some((item) => {
      if (typeof item === "string") return item.trim() !== "";
      if (typeof item === "object") {
        return Object.values(item).some(
          (v) => v !== null && v !== undefined && v.toString().trim() !== ""
        );
      }
      return false;
    });
  };

  const handleBoardingChange = (e, index, field) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = [...prev.boardingPoints];
      updated[index][field] = value;
      return { ...prev, boardingPoints: updated };
    });
  };

  const addBoardingField = () => {
    setFormData((prev) => ({
      ...prev,
      boardingPoints: [
        ...prev.boardingPoints,
        { stationCode: "", stationName: "" },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormData()) return;

    try {
      const data = new FormData();

      // ✅ Strings
      if (formData.title?.trim()) data.append("title", formData.title);
      if (formData.batch?.trim()) data.append("batch", formData.batch);

      // ✅ Duration (only if has at least 1 value)
      if (formData.duration?.days || formData.duration?.nights) {
        data.append("duration", JSON.stringify(formData.duration));
      }

      // ✅ Price (only if has some value)
      if (formData.price?.doubleSharing || formData.price?.tripleSharing) {
        data.append("price", JSON.stringify(formData.price));
      }

      // ✅ Numbers
      if (formData.advanceAmount)
        data.append("advanceAmount", formData.advanceAmount);

      if (formData.completedTripsCount) {
        data.append("completedTripsCount", formData.completedTripsCount);
      }

      // ✅ Arrays/objects (skip empty)
      if (hasNonEmptyArray(formData.destination)) {
        data.append("destination", JSON.stringify(formData.destination));
      }
      if (hasNonEmptyArray(formData.sightseeing)) {
        data.append("sightseeing", JSON.stringify(formData.sightseeing));
      }
      if (hasNonEmptyArray(formData.itinerary)) {
        data.append("itinerary", JSON.stringify(formData.itinerary));
      }
      if (hasNonEmptyArray(formData.includes)) {
        data.append("includes", JSON.stringify(formData.includes));
      }
      if (hasNonEmptyArray(formData.excludes)) {
        data.append("excludes", JSON.stringify(formData.excludes));
      }
      if (hasNonEmptyArray(formData.trainDetails)) {
        data.append("trainDetails", JSON.stringify(formData.trainDetails));
      }
      if (hasNonEmptyArray(formData.flightDetails)) {
        data.append("flightDetails", JSON.stringify(formData.flightDetails));
      }
      if (hasNonEmptyArray(formData.addons)) {
        data.append("addons", JSON.stringify(formData.addons));
      }

      // ✅ Date
      if (formData.lastBookingDate) {
        data.append("lastBookingDate", formData.lastBookingDate);
      }

      // ✅ Images (only if selected)
      if (images.titleImage) data.append("titleImage", images.titleImage);
      if (images.mapImage) data.append("mapImage", images.mapImage);
      if (images.galleryImages.length > 0) {
        images.galleryImages.forEach((img) =>
          data.append("galleryImages", img)
        );
      }
      if (formData.remarks?.trim()) {
        data.append("remarks", formData.remarks);
      }

      if (hasNonEmptyArray(formData.boardingPoints)) {
        data.append("boardingPoints", JSON.stringify(formData.boardingPoints));
      }
      // 🔥 API call
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

      toast.dismiss();

      if (res.data.success) {
        toast.success("Tour profile updated successfully!");
        resetForm(); // clears UI
        getProfileData(); // refresh latest
      } else {
        toast.error("Failed to update profile: " + res.data.message);
      }
    } catch (error) {
      toast.dismiss();
      console.error("Update Error:", error);
      toast.error("Something went wrong while updating profile.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Tour Profile</h1>{" "}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 border"
          value={formData.title}
          onChange={(e) => handleChange(e, "title")}
        />
        <div>
          <div className="flex-1 flex flex-col gap-1">
            <p>Speciality</p>
            <select
              onChange={(e) => handleChange(e, "batch")} // Corrected line
              value={formData.batch}
              className="border rounded px-3 py-2"
              name=""
              id=""
            >
              <option value="Spritual Plus Sightseeing">
                Select tour category
              </option>
              <option value="Devotional">Devotional</option>
              <option value="Religious ">Relegious</option>
              <option value="Honeymoon">Honeymoon</option>
              <option value="Jolly">Jolly</option>
              <option value="Spritual">Spritual</option>
              <option value="Spritual+Sightseeing">
                Spritual + Sightseeing
              </option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Days"
            className="p-3 border"
            value={formData.duration.days}
            onChange={(e) => handleChange(e, { main: "duration", sub: "days" })}
          />
          <input
            type="number"
            placeholder="Nights"
            className="p-3 border"
            value={formData.duration.nights}
            onChange={(e) =>
              handleChange(e, { main: "duration", sub: "nights" })
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Advance Amount"
            className="p-3 border"
            value={formData.advanceAmount}
            onChange={(e) => handleChange(e, "advanceAmount")}
          />
          <input
            type="number"
            placeholder="Double Sharing Price"
            className="p-3 border"
            value={formData.price.doubleSharing}
            onChange={(e) =>
              handleChange(e, { main: "price", sub: "doubleSharing" })
            }
          />
          <input
            type="number"
            placeholder="Triple Sharing Price"
            className="p-3 border"
            value={formData.price.tripleSharing}
            onChange={(e) =>
              handleChange(e, { main: "price", sub: "tripleSharing" })
            }
          />
        </div>

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
            {formData[field].map((item, index) => (
              <input
                key={index}
                value={item}
                placeholder={`${field} ${index + 1}`}
                className="w-full mb-2 p-3 border"
                onChange={(e) => handleArrayChange(e, index, field)}
              />
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-1 rounded"
              onClick={() => addField(field, "")}
            >
              + Add {field}
            </button>
          </div>
        ))}

        {["trainDetails", "flightDetails"].map((type) => (
          <div key={type}>
            <label className="block font-semibold mb-1 capitalize">
              {type}
            </label>
            {formData[type].map((detail, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(detail).map(([key, value]) =>
                  key === "_id" ? null : (
                    <input
                      key={key}
                      type={
                        key.toLowerCase().includes("date") ? "date" : "text"
                      }
                      value={value}
                      placeholder={key}
                      className="p-3 border"
                      onChange={(e) => handleChange(e, null, type, index, key)}
                    />
                  )
                )}
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
            >
              + Add {type === "trainDetails" ? "Train" : "Flight"}
            </button>
          </div>
        ))}
        <label className="block font-semibold mb-1">
          Package Last booking date
        </label>
        <input
          type="date"
          className="w-full p-3 border"
          value={formData.lastBookingDate}
          onChange={(e) => handleChange(e, "lastBookingDate")}
        />
        <input
          type="number"
          className="w-full p-3 border"
          placeholder="Completed Trips Count"
          value={formData.completedTripsCount}
          onChange={(e) => handleChange(e, "completedTripsCount")}
        />

        <div className="space-y-4">
          {/* Title Image */}
          <div>
            <label className="block font-semibold mb-1">Title Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "titleImage")}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
            />
            {images.titleImage && (
              <p className="text-green-600 mt-1">
                Selected: {images.titleImage.name}
              </p>
            )}
          </div>

          {/* Map Image */}
          <div>
            <label className="block font-semibold mb-1">Map Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "mapImage")}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
            />
            {images.mapImage && (
              <p className="text-green-600 mt-1">
                Selected: {images.mapImage.name}
              </p>
            )}
          </div>

          {/* Gallery Images */}
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
            value={formData.remarks}
            onChange={(e) => handleChange(e, "remarks")}
          />
        </div>

        {/* Boarding Points */}
        <div>
          <label className="block font-semibold mb-1">Boarding Points</label>
          {formData.boardingPoints.map((bp, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                placeholder="Station code (e.g., MAS)"
                value={bp.stationCode}
                className="p-3 border"
                onChange={(e) => handleBoardingChange(e, index, "stationCode")}
              />
              <input
                type="text"
                placeholder="Station name (e.g., MGR Chennai Central)"
                value={bp.stationName}
                className="p-3 border"
                onChange={(e) => handleBoardingChange(e, index, "stationName")}
              />
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={addBoardingField}
          >
            + Add Boarding Point
          </button>
        </div>

        <div>
          <label className="block font-semibold capitalize mb-1">Add-ons</label>
          {formData.addons.map((addon, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                placeholder="Addon Name"
                value={addon.name}
                className="p-3 border"
                onChange={(e) => handleAddonChange(e, index, "name")}
              />
              <input
                type="number"
                placeholder="Addon Amount"
                value={addon.amount}
                className="p-3 border"
                onChange={(e) => handleAddonChange(e, index, "amount")}
              />
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={addAddonField}
          >
            + Add Add-on
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded shadow"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default TourProfile;
