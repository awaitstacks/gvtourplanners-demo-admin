// import React, { useState, useContext, useEffect, useCallback } from "react";
// import axios from "axios";
// import { TourContext } from "../../context/TourContext";
// import { toast } from "react-toastify";

// const TourProfile = () => {
//   const {
//     backendUrl,
//     ttoken,
//     tourList,
//     getTourList,
//     profileData,
//     getProfileData,
//   } = useContext(TourContext);

//   const defaultTrain = {
//     trainNo: "",
//     trainName: "",
//     fromCode: "",
//     fromStation: "",
//     toCode: "",
//     toStation: "",
//     class: "",
//     departureTime: "",
//     arrivalTime: "",
//     ticketOpenDate: "",
//   };

//   const defaultFlight = {
//     airline: "",
//     flightNo: "",
//     fromCode: "",
//     fromAirport: "",
//     toCode: "",
//     toAirport: "",
//     class: "",
//     departureTime: "",
//     arrivalTime: "",
//   };

//   const defaultBoardingPoint = { stationCode: "", stationName: "" };

//   const initialForm = {
//     title: "",
//     batch: "",
//     duration: { days: "", nights: "" },
//     price: {
//       doubleSharing: "",
//       tripleSharing: "",
//       childWithBerth: "",
//       childWithoutBerth: "",
//     },
//     advanceAmount: {
//       adult: "",
//       child: "",
//     },
//     destination: [""],
//     sightseeing: [""],
//     itinerary: [""],
//     includes: [""],
//     excludes: [""],
//     trainDetails: [defaultTrain],
//     flightDetails: [defaultFlight],
//     lastBookingDate: "",
//     completedTripsCount: "",
//     addons: [{ name: "", amount: "" }],
//     boardingPoints: [defaultBoardingPoint],
//     deboardingPoints: [defaultBoardingPoint],
//     remarks: "",
//   };

//   const [formData, setFormData] = useState(initialForm);
//   const [images, setImages] = useState({
//     titleImage: null,
//     mapImage: null,
//     galleryImages: [],
//   });

//   const [balances, setBalances] = useState({
//     balanceDouble: "",
//     balanceTriple: "",
//     balanceChildWithBerth: "",
//     balanceChildWithoutBerth: "",
//   });

//   const [selectedTourId, setSelectedTourId] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [fetchCount, setFetchCount] = useState(0); // Debug: Track fetch calls

//   // Fetch tours for dropdown (run once on mount)
//   useEffect(() => {
//     console.log(
//       "Fetching tour list at",
//       new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//     );
//     setIsLoading(true);
//     getTourList()
//       .then(() => {
//         console.log("Tour list fetched, count:", fetchCount + 1);
//         setFetchCount((prev) => prev + 1);
//       })
//       .catch((error) => {
//         console.error("Tour list fetch error:", error);
//       })
//       .finally(() => setIsLoading(false));
//   }, [getTourList]); // Ensure getTourList is stable from context

//   // Fetch profile on selection (only if profileData doesn't match)
//   useEffect(() => {
//     if (
//       selectedTourId &&
//       (!profileData || profileData._id !== selectedTourId)
//     ) {
//       console.log(
//         "Fetching profile for tourId:",
//         selectedTourId,
//         "at",
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//       );
//       setIsLoading(true);
//       getProfileData(selectedTourId)
//         .then(() => {
//           console.log(
//             "Profile data fetched for tourId:",
//             selectedTourId,
//             "count:",
//             fetchCount + 1
//           );
//           setFetchCount((prev) => prev + 1);
//         })
//         .catch((error) => {
//           console.error(
//             "Profile fetch error for tourId:",
//             selectedTourId,
//             error
//           );
//         })
//         .finally(() => setIsLoading(false));
//     }
//   }, [selectedTourId, getProfileData, profileData?._id]);

//   // Update form data and balances when profileData changes
//   useEffect(() => {
//     if (profileData && selectedTourId) {
//       console.log(
//         "Updating formData with profileData:",
//         profileData,
//         "at",
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//       );
//       const shouldUpdate = !formData._id || formData._id !== profileData._id;
//       if (shouldUpdate) {
//         setFormData((prev) => ({
//           ...initialForm,
//           ...profileData,
//           duration: profileData.duration || initialForm.duration,
//           price: profileData.price || initialForm.price,
//           advanceAmount: profileData.advanceAmount || initialForm.advanceAmount,
//           addons: profileData.addons?.length
//             ? profileData.addons
//             : initialForm.addons,
//           boardingPoints: profileData.boardingPoints?.length
//             ? profileData.boardingPoints
//             : initialForm.boardingPoints,
//           deboardingPoints: profileData.deboardingPoints?.length
//             ? profileData.deboardingPoints
//             : initialForm.deboardingPoints,
//           remarks: profileData.remarks || initialForm.remarks,
//         }));
//         setBalances({
//           balanceDouble: profileData.balanceDouble || "",
//           balanceTriple: profileData.balanceTriple || "",
//           balanceChildWithBerth: profileData.balanceChildWithBerth || "",
//           balanceChildWithoutBerth: profileData.balanceChildWithoutBerth || "",
//         });
//       }
//     }
//   }, [profileData, selectedTourId]);

//   // Recalculate balances when prices or advances change
//   useEffect(() => {
//     const { price, advanceAmount } = formData;
//     if (price && advanceAmount) {
//       const adultAdvance = Number(advanceAmount.adult) || 0;
//       const childAdvance = Number(advanceAmount.child) || 0;
//       setBalances({
//         balanceDouble: Number(price.doubleSharing) - adultAdvance || "",
//         balanceTriple: Number(price.tripleSharing) - adultAdvance || "",
//         balanceChildWithBerth:
//           Number(price.childWithBerth) - childAdvance || "",
//         balanceChildWithoutBerth:
//           Number(price.childWithoutBerth) - childAdvance || "",
//       });
//     }
//   }, [formData.price, formData.advanceAmount]);

//   const handleChange = useCallback(
//     (e, field, nestedField = null, index = null, subField = null) => {
//       const value = e.target.value;
//       if (nestedField && index !== null) {
//         setFormData((prev) => {
//           const updated = [...prev[nestedField]];
//           updated[index] = { ...updated[index], [subField]: value };
//           return { ...prev, [nestedField]: updated };
//         });
//       } else if (typeof field === "object") {
//         setFormData((prev) => ({
//           ...prev,
//           [field.main]: {
//             ...prev[field.main],
//             [field.sub]: value,
//           },
//         }));
//       } else if (index !== null) {
//         setFormData((prev) => {
//           const updated = [...prev[field]];
//           updated[index] = value;
//           return { ...prev, [field]: updated };
//         });
//       } else {
//         setFormData((prev) => ({ ...prev, [field]: value }));
//       }
//     },
//     []
//   );

//   const addField = useCallback((field, template = "") => {
//     setFormData((prev) => ({ ...prev, [field]: [...prev[field], template] }));
//   }, []);

//   const removeField = useCallback((field, index) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index),
//     }));
//   }, []);

//   const addTransportDetail = useCallback((field, template) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: [...prev[field], { ...template }],
//     }));
//   }, []);

//   const removeTransportDetail = useCallback((field, index) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index),
//     }));
//   }, []);

//   const handleImageChange = (e, field) => {
//     if (field === "galleryImages") {
//       setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
//     } else {
//       setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
//     }
//   };

//   const validateFormData = () => {
//     const numberFields = {
//       "price.doubleSharing": formData.price.doubleSharing,
//       "price.tripleSharing": formData.price.tripleSharing,
//       "price.childWithBerth": formData.price.childWithBerth,
//       "price.childWithoutBerth": formData.price.childWithoutBerth,
//       "advanceAmount.adult": formData.advanceAmount.adult,
//       "advanceAmount.child": formData.advanceAmount.child,
//       completedTripsCount: formData.completedTripsCount,
//     };

//     for (const [key, value] of Object.entries(numberFields)) {
//       if (value && isNaN(Number(value))) {
//         toast.error(
//           `${key
//             .replace(".", " ")
//             .replace(/\b\w/g, (c) => c.toUpperCase())} must be a number.`
//         );
//         return false;
//       }
//     }

//     if (images.galleryImages.length > 0 && images.galleryImages.length !== 3) {
//       toast.error("Please upload exactly 3 gallery images.");
//       return false;
//     }
//     return true;
//   };

//   const resetForm = () => {
//     setSelectedTourId("");
//     setFormData(initialForm);
//     setImages({ titleImage: null, mapImage: null, galleryImages: [] });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedTourId) {
//       toast.error("Please select a tour to update.");
//       return;
//     }
//     if (!validateFormData()) return;

//     setIsLoading(true);
//     try {
//       const data = new FormData();
//       data.append("tourId", selectedTourId);

//       const fieldsToAppend = {
//         title: formData.title,
//         batch: formData.batch,
//         lastBookingDate: formData.lastBookingDate,
//         completedTripsCount: formData.completedTripsCount,
//         remarks: formData.remarks,
//       };
//       for (const [key, value] of Object.entries(fieldsToAppend)) {
//         if (value !== null && value !== undefined && value.toString().trim()) {
//           data.append(key, value);
//         }
//       }

//       const objectsToAppend = {
//         duration: formData.duration,
//         price: formData.price,
//         advanceAmount: formData.advanceAmount,
//       };
//       for (const [key, value] of Object.entries(objectsToAppend)) {
//         data.append(key, JSON.stringify(value));
//       }

//       if (!isNaN(balances.balanceDouble))
//         data.append("balanceDouble", balances.balanceDouble);
//       if (!isNaN(balances.balanceTriple))
//         data.append("balanceTriple", balances.balanceTriple);
//       if (!isNaN(balances.balanceChildWithBerth))
//         data.append("balanceChildWithBerth", balances.balanceChildWithBerth);
//       if (!isNaN(balances.balanceChildWithoutBerth))
//         data.append(
//           "balanceChildWithoutBerth",
//           balances.balanceChildWithoutBerth
//         );

//       const arraysToAppend = {
//         destination: formData.destination,
//         sightseeing: formData.sightseeing,
//         itinerary: formData.itinerary,
//         includes: formData.includes,
//         excludes: formData.excludes,
//         trainDetails: formData.trainDetails,
//         flightDetails: formData.flightDetails,
//         addons: formData.addons,
//         boardingPoints: formData.boardingPoints,
//         deboardingPoints: formData.deboardingPoints,
//       };

//       for (const [key, value] of Object.entries(arraysToAppend)) {
//         data.append(key, JSON.stringify(value));
//       }

//       if (images.titleImage) data.append("titleImage", images.titleImage);
//       if (images.mapImage) data.append("mapImage", images.mapImage);
//       if (images.galleryImages.length > 0) {
//         images.galleryImages.forEach((img) =>
//           data.append("galleryImages", img)
//         );
//       }

//       const res = await axios.put(
//         `${backendUrl}/api/tour/update-tourprofile`,
//         data,
//         {
//           headers: {
//             ttoken,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       toast.dismiss();
//       if (res.data.success) {
//         toast.success("Tour profile updated successfully!");
//         resetForm();
//         getTourList();
//       } else {
//         toast.error("Failed to update profile: " + res.data.message);
//       }
//     } catch (error) {
//       toast.dismiss();
//       console.error(
//         "Update Error at",
//         new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
//         error
//       );
//       toast.error("Something went wrong while updating profile.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
//       <h1 className="text-xl sm:text-2xl font-bold mb-6">
//         Update Tour Profile
//       </h1>
//       <div className="mb-6">
//         <label className="block font-semibold mb-1">
//           Select a Tour to Edit
//         </label>
//         <select
//           value={selectedTourId}
//           onChange={(e) => setSelectedTourId(e.target.value)}
//           className="w-full p-3 border"
//           disabled={isLoading}
//         >
//           <option value="">-- Please Select a Tour --</option>
//           {tourList.map((tour) => (
//             <option key={tour._id} value={tour._id}>
//               {tour.title}
//             </option>
//           ))}
//         </select>
//         {isLoading && <p className="text-gray-500 mt-2">Loading...</p>}
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <input
//           type="text"
//           placeholder="Title"
//           className="w-full p-3 border"
//           value={formData.title}
//           onChange={(e) => handleChange(e, "title")}
//           disabled={isLoading}
//         />
//         <div>
//           <div className="flex-1 flex flex-col gap-1">
//             <p>Speciality</p>
//             <select
//               onChange={(e) => handleChange(e, "batch")}
//               value={formData.batch}
//               className="border rounded px-3 py-2"
//               disabled={isLoading}
//             >
//               <option value="">Select tour category</option>
//               <option value="Devotional">Devotional</option>
//               <option value="Religious">Religious</option>
//               <option value="Honeymoon">Honeymoon</option>
//               <option value="Jolly">Jolly</option>
//               <option value="Spritual">Spritual</option>
//               <option value="Spritual+Sightseeing">
//                 Spritual + Sightseeing
//               </option>
//             </select>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <label className="block">
//             Days
//             <input
//               type="number"
//               placeholder="Days"
//               className="p-3 border w-full"
//               value={formData.duration.days}
//               onChange={(e) =>
//                 handleChange(e, { main: "duration", sub: "days" })
//               }
//               disabled={isLoading}
//             />
//           </label>
//           <label className="block">
//             Nights
//             <input
//               type="number"
//               placeholder="Nights"
//               className="p-3 border w-full"
//               value={formData.duration.nights}
//               onChange={(e) =>
//                 handleChange(e, { main: "duration", sub: "nights" })
//               }
//               disabled={isLoading}
//             />
//           </label>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <h2 className="text-lg font-semibold mb-2">Advance Amounts</h2>
//             <div className="space-y-2">
//               <label className="block">
//                 Adult Advance
//                 <input
//                   type="number"
//                   placeholder="Adult Advance"
//                   className="p-3 border w-full"
//                   value={formData.advanceAmount.adult}
//                   onChange={(e) =>
//                     handleChange(e, { main: "advanceAmount", sub: "adult" })
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//               <label className="block">
//                 Child Advance
//                 <input
//                   type="number"
//                   placeholder="Child Advance"
//                   className="p-3 border w-full"
//                   value={formData.advanceAmount.child}
//                   onChange={(e) =>
//                     handleChange(e, { main: "advanceAmount", sub: "child" })
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//             </div>
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold mb-2">Pricing</h2>
//             <div className="space-y-2">
//               <label className="block">
//                 Double Sharing Price
//                 <input
//                   type="number"
//                   placeholder="Double Sharing Price"
//                   className="p-3 border w-full"
//                   value={formData.price.doubleSharing}
//                   onChange={(e) =>
//                     handleChange(e, { main: "price", sub: "doubleSharing" })
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//               <label className="block">
//                 Triple Sharing Price
//                 <input
//                   type="number"
//                   placeholder="Triple Sharing Price"
//                   className="p-3 border w-full"
//                   value={formData.price.tripleSharing}
//                   onChange={(e) =>
//                     handleChange(e, { main: "price", sub: "tripleSharing" })
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//               <label className="block">
//                 Child with Berth Price
//                 <input
//                   type="number"
//                   placeholder="Child with Berth Price"
//                   className="p-3 border w-full"
//                   value={formData.price.childWithBerth}
//                   onChange={(e) =>
//                     handleChange(e, { main: "price", sub: "childWithBerth" })
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//               <label className="block">
//                 Child without Berth Price
//                 <input
//                   type="number"
//                   placeholder="Child without Berth Price"
//                   className="p-3 border w-full"
//                   value={formData.price.childWithoutBerth}
//                   onChange={(e) =>
//                     handleChange(e, { main: "price", sub: "childWithoutBerth" })
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <h2 className="text-lg font-semibold mb-2">Calculated Balances</h2>
//             <div className="space-y-2">
//               <label className="block">
//                 Double Sharing Balance
//                 <input
//                   type="text"
//                   readOnly
//                   className="p-3 border w-full bg-gray-100"
//                   value={
//                     isNaN(balances.balanceDouble)
//                       ? "N/A"
//                       : balances.balanceDouble
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//               <label className="block">
//                 Triple Sharing Balance
//                 <input
//                   type="text"
//                   readOnly
//                   className="p-3 border w-full bg-gray-100"
//                   value={
//                     isNaN(balances.balanceTriple)
//                       ? "N/A"
//                       : balances.balanceTriple
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//               <label className="block">
//                 Child with Berth Balance
//                 <input
//                   type="text"
//                   readOnly
//                   className="p-3 border w-full bg-gray-100"
//                   value={
//                     isNaN(balances.balanceChildWithBerth)
//                       ? "N/A"
//                       : balances.balanceChildWithBerth
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//               <label className="block">
//                 Child without Berth Balance
//                 <input
//                   type="text"
//                   readOnly
//                   className="p-3 border w-full bg-gray-100"
//                   value={
//                     isNaN(balances.balanceChildWithoutBerth)
//                       ? "N/A"
//                       : balances.balanceChildWithoutBerth
//                   }
//                   disabled={isLoading}
//                 />
//               </label>
//             </div>
//           </div>
//         </div>

//         {[
//           "destination",
//           "sightseeing",
//           "includes",
//           "excludes",
//           "itinerary",
//         ].map((field) => (
//           <div key={field}>
//             <label className="block font-semibold capitalize mb-1">
//               {field}
//             </label>
//             {formData[field]?.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col sm:flex-row gap-2 items-center mb-2"
//               >
//                 <input
//                   value={item}
//                   placeholder={`${field} ${index + 1}`}
//                   className="w-full p-3 border"
//                   onChange={(e) => handleChange(e, field, null, index, null)}
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="button"
//                   className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
//                   onClick={() => removeField(field, index)}
//                   disabled={isLoading}
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="bg-blue-500 text-white px-4 py-1 rounded"
//               onClick={() => addField(field, "")}
//               disabled={isLoading}
//             >
//               + Add {field}
//             </button>
//           </div>
//         ))}

//         {["trainDetails", "flightDetails"].map((type) => (
//           <div key={type}>
//             <label className="block font-semibold mb-1 capitalize">
//               {type}
//             </label>
//             {formData[type]?.map((detail, index) => (
//               <div key={index} className="border p-4 rounded mb-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   {Object.entries(detail).map(([key, value]) =>
//                     key === "_id" ? null : (
//                       <label key={key} className="block">
//                         {key
//                           .replace(/([A-Z])/g, " $1")
//                           .replace(/^./, (str) => str.toUpperCase())}
//                         <input
//                           type={
//                             key.toLowerCase().includes("date") ? "date" : "text"
//                           }
//                           value={value}
//                           placeholder={key}
//                           className="p-3 border w-full"
//                           onChange={(e) =>
//                             handleChange(e, null, type, index, key)
//                           }
//                           disabled={isLoading}
//                         />
//                       </label>
//                     )
//                   )}
//                 </div>
//                 <button
//                   type="button"
//                   className="bg-red-500 text-white px-2 py-1 rounded text-sm mt-2 w-full sm:w-auto"
//                   onClick={() => removeTransportDetail(type, index)}
//                   disabled={isLoading}
//                 >
//                   Remove {type === "trainDetails" ? "Train" : "Flight"} Details
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="bg-blue-500 text-white px-4 py-1 rounded"
//               onClick={() =>
//                 addTransportDetail(
//                   type,
//                   type === "trainDetails" ? defaultTrain : defaultFlight
//                 )
//               }
//               disabled={isLoading}
//             >
//               + Add {type === "trainDetails" ? "Train" : "Flight"} Details
//             </button>
//           </div>
//         ))}

//         <label className="block font-semibold mb-1">
//           Last booking date
//           <input
//             type="date"
//             className="w-full p-3 border"
//             value={formData.lastBookingDate}
//             onChange={(e) => handleChange(e, "lastBookingDate")}
//             disabled={isLoading}
//           />
//         </label>

//         <label className="block font-semibold mb-1">
//           Completed Trips Count
//           <input
//             type="number"
//             className="w-full p-3 border"
//             placeholder="Completed Trips Count"
//             value={formData.completedTripsCount}
//             onChange={(e) => handleChange(e, "completedTripsCount")}
//             disabled={isLoading}
//           />
//         </label>

//         <div className="space-y-4">
//           <div>
//             <label className="block font-semibold mb-1">Title Image</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, "titleImage")}
//               className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//               disabled={isLoading}
//             />
//             {images.titleImage && (
//               <p className="text-green-600 mt-1">
//                 Selected: {images.titleImage.name}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">Map Image</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, "mapImage")}
//               className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//               disabled={isLoading}
//             />
//             {images.mapImage && (
//               <p className="text-green-600 mt-1">
//                 Selected: {images.mapImage.name}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">
//               Gallery Images (Up to 3 images)
//             </label>
//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, "galleryImages")}
//               className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//               disabled={isLoading}
//             />
//             {images.galleryImages.length > 0 && (
//               <ul className="text-green-600 mt-1 list-disc pl-5">
//                 {images.galleryImages.map((img, idx) => (
//                   <li key={idx}>{img.name}</li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">Remarks</label>
//           <textarea
//             className="w-full p-3 border"
//             placeholder="Enter any notes or special information"
//             value={formData.remarks}
//             onChange={(e) => handleChange(e, "remarks")}
//             disabled={isLoading}
//           />
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">Boarding Points</label>
//           {formData.boardingPoints?.map((bp, index) => (
//             <div
//               key={index}
//               className="flex flex-col sm:flex-row gap-2 items-center mb-2"
//             >
//               <input
//                 type="text"
//                 placeholder="Station code (e.g., MAS)"
//                 value={bp.stationCode}
//                 className="p-3 border w-full sm:flex-1"
//                 onChange={(e) =>
//                   handleChange(e, null, "boardingPoints", index, "stationCode")
//                 }
//                 disabled={isLoading}
//               />
//               <input
//                 type="text"
//                 placeholder="Station name (e.g., MGR Chennai Central)"
//                 value={bp.stationName}
//                 className="p-3 border w-full sm:flex-1"
//                 onChange={(e) =>
//                   handleChange(e, null, "boardingPoints", index, "stationName")
//                 }
//                 disabled={isLoading}
//               />
//               <button
//                 type="button"
//                 className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
//                 onClick={() => removeTransportDetail("boardingPoints", index)}
//                 disabled={isLoading}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="bg-blue-500 text-white px-4 py-1 rounded"
//             onClick={() =>
//               addTransportDetail("boardingPoints", defaultBoardingPoint)
//             }
//             disabled={isLoading}
//           >
//             + Add Boarding Point
//           </button>
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">Deboarding Points</label>
//           {formData.deboardingPoints?.map((bp, index) => (
//             <div
//               key={index}
//               className="flex flex-col sm:flex-row gap-2 items-center mb-2"
//             >
//               <input
//                 type="text"
//                 placeholder="Station code (e.g., MAS)"
//                 value={bp.stationCode}
//                 className="p-3 border w-full sm:flex-1"
//                 onChange={(e) =>
//                   handleChange(
//                     e,
//                     null,
//                     "deboardingPoints",
//                     index,
//                     "stationCode"
//                   )
//                 }
//                 disabled={isLoading}
//               />
//               <input
//                 type="text"
//                 placeholder="Station name (e.g., MGR Chennai Central)"
//                 value={bp.stationName}
//                 className="p-3 border w-full sm:flex-1"
//                 onChange={(e) =>
//                   handleChange(
//                     e,
//                     null,
//                     "deboardingPoints",
//                     index,
//                     "stationName"
//                   )
//                 }
//                 disabled={isLoading}
//               />
//               <button
//                 type="button"
//                 className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
//                 onClick={() => removeTransportDetail("deboardingPoints", index)}
//                 disabled={isLoading}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="bg-blue-500 text-white px-4 py-1 rounded"
//             onClick={() =>
//               addTransportDetail("deboardingPoints", defaultBoardingPoint)
//             }
//             disabled={isLoading}
//           >
//             + Add Deboarding Point
//           </button>
//         </div>

//         <div>
//           <label className="block font-semibold capitalize mb-1">Add-ons</label>
//           {formData.addons?.map((addon, index) => (
//             <div
//               key={index}
//               className="flex flex-col sm:flex-row gap-2 items-center mb-2"
//             >
//               <input
//                 type="text"
//                 placeholder="Addon Name"
//                 value={addon.name}
//                 className="p-3 border w-full sm:flex-1"
//                 onChange={(e) => handleChange(e, null, "addons", index, "name")}
//                 disabled={isLoading}
//               />
//               <input
//                 type="number"
//                 placeholder="Addon Amount"
//                 value={addon.amount}
//                 className="p-3 border w-full sm:flex-1"
//                 onChange={(e) =>
//                   handleChange(e, null, "addons", index, "amount")
//                 }
//                 disabled={isLoading}
//               />
//               <button
//                 type="button"
//                 className="bg-red-500 text-white px-2 py-1 rounded text-sm w-full sm:w-auto"
//                 onClick={() => removeTransportDetail("addons", index)}
//                 disabled={isLoading}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="bg-blue-500 text-white px-4 py-1 rounded"
//             onClick={() =>
//               addTransportDetail("addons", { name: "", amount: "" })
//             }
//             disabled={isLoading}
//           >
//             + Add Add-on
//           </button>
//         </div>

//         <button
//           type="submit"
//           className="bg-green-600 text-white px-6 py-2 rounded shadow"
//           disabled={isLoading}
//         >
//           {isLoading ? "Saving..." : "Save Changes"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default TourProfile;
//Crictical copy above do not delete

import React, { useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { TourContext } from "../../context/TourContext";
import { toast } from "react-toastify";

const TourProfile = () => {
  const {
    backendUrl,
    ttoken,
    tourList,
    getTourList,
    profileData,
    getProfileData,
  } = useContext(TourContext);

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
    boardingPoints: [defaultBoardingPoint],
    deboardingPoints: [defaultBoardingPoint],
    remarks: "",
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

  const [selectedTourId, setSelectedTourId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchCount, setFetchCount] = useState(0); // Debug: Track fetch calls

  // Fetch tours for dropdown (run once on mount)
  useEffect(() => {
    console.log(
      "Fetching tour list at",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );
    setIsLoading(true);
    getTourList()
      .then(() => {
        console.log("Tour list fetched, count:", fetchCount + 1);
        setFetchCount((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Tour list fetch error:", error);
      })
      .finally(() => setIsLoading(false));
  }, [getTourList]);

  // Fetch profile on selection (only if profileData doesn't match)
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
        .then(() => {
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
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedTourId, getProfileData, profileData?._id]);

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
          duration: profileData.duration || prev.duration,
          price: profileData.price || prev.price,
          advanceAmount: profileData.advanceAmount || prev.advanceAmount,
          addons: profileData.addons?.length ? profileData.addons : prev.addons,
          boardingPoints: profileData.boardingPoints?.length
            ? profileData.boardingPoints
            : prev.boardingPoints,
          deboardingPoints: profileData.deboardingPoints?.length
            ? profileData.deboardingPoints
            : prev.deboardingPoints,
          remarks: profileData.remarks || prev.remarks,
        }));
        setBalances({
          balanceDouble: profileData.balanceDouble || "",
          balanceTriple: profileData.balanceTriple || "",
          balanceChildWithBerth: profileData.balanceChildWithBerth || "",
          balanceChildWithoutBerth: profileData.balanceChildWithoutBerth || "",
        });
      }
    }
  }, [profileData, selectedTourId]);

  // Recalculate balances when prices or advances change
  useEffect(() => {
    const { price, advanceAmount } = formData;
    if (price && advanceAmount) {
      const adultAdvance = Number(advanceAmount.adult) || 0;
      const childAdvance = Number(advanceAmount.child) || 0;
      setBalances({
        balanceDouble: Number(price.doubleSharing) - adultAdvance || "",
        balanceTriple: Number(price.tripleSharing) - adultAdvance || "",
        balanceChildWithBerth:
          Number(price.childWithBerth) - childAdvance || "",
        balanceChildWithoutBerth:
          Number(price.childWithoutBerth) - childAdvance || "",
      });
    }
  }, [formData.price, formData.advanceAmount]);

  const handleChange = useCallback(
    (e, field, nestedField = null, index = null, subField = null) => {
      const value = e.target.value;
      console.log("Changing field:", field, "value:", value); // Debug log
      if (nestedField && index !== null) {
        setFormData((prev) => {
          const updated = [...prev[nestedField]];
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
          const updated = [...prev[field]];
          updated[index] = value;
          return { ...prev, [field]: updated };
        });
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    },
    []
  );

  const addField = useCallback((field, template = "") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], template] }));
  }, []);

  const removeField = useCallback((field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const addTransportDetail = useCallback((field, template) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { ...template }],
    }));
  }, []);

  const removeTransportDetail = useCallback((field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const handleImageChange = (e, field) => {
    if (field === "galleryImages") {
      setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
    } else {
      setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const validateFormData = () => {
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
            .replace(/\b\w/g, (c) => c.toUpperCase())} must be a number.`
        );
        return false;
      }
    }

    if (images.galleryImages.length > 0 && images.galleryImages.length !== 3) {
      toast.error("Please upload exactly 3 gallery images.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setSelectedTourId("");
    setFormData(initialForm);
    setImages({ titleImage: null, mapImage: null, galleryImages: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTourId) {
      toast.error("Please select a tour to update.");
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
        remarks: formData.remarks, // Always include remarks, even if empty
      };
      for (const [key, value] of Object.entries(fieldsToAppend)) {
        data.append(key, value || ""); // Always append, even if empty
      }

      const objectsToAppend = {
        duration: formData.duration,
        price: formData.price,
        advanceAmount: formData.advanceAmount,
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
        resetForm();
        getTourList();
      } else {
        toast.error("Failed to update profile: " + res.data.message);
      }
    } catch (error) {
      toast.dismiss();
      console.error(
        "Update Error at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        error
      );
      toast.error("Something went wrong while updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
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
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 border"
          value={formData.title}
          onChange={(e) => handleChange(e, "title")}
          disabled={isLoading}
        />
        <div>
          <div className="flex-1 flex flex-col gap-1">
            <p>Speciality</p>
            <select
              onChange={(e) => handleChange(e, "batch")}
              value={formData.batch}
              className="border rounded px-3 py-2"
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            Days
            <input
              type="number"
              placeholder="Days"
              className="p-3 border w-full"
              value={formData.duration.days}
              onChange={(e) =>
                handleChange(e, { main: "duration", sub: "days" })
              }
              disabled={isLoading}
            />
          </label>
          <label className="block">
            Nights
            <input
              type="number"
              placeholder="Nights"
              className="p-3 border w-full"
              value={formData.duration.nights}
              onChange={(e) =>
                handleChange(e, { main: "duration", sub: "nights" })
              }
              disabled={isLoading}
            />
          </label>
        </div>

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
                  value={formData.advanceAmount.adult}
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
                  value={formData.advanceAmount.child}
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
                  value={formData.price.doubleSharing}
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
                  value={formData.price.tripleSharing}
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
                  value={formData.price.childWithBerth}
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
                  value={formData.price.childWithoutBerth}
                  onChange={(e) =>
                    handleChange(e, { main: "price", sub: "childWithoutBerth" })
                  }
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Calculated Balances</h2>
            <div className="space-y-2">
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
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
            {formData[field]?.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-center mb-2"
              >
                <input
                  value={item}
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

        {["trainDetails", "flightDetails"].map((type) => (
          <div key={type}>
            <label className="block font-semibold mb-1 capitalize">
              {type}
            </label>
            {formData[type]?.map((detail, index) => (
              <div key={index} className="border p-4 rounded mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(detail).map(([key, value]) =>
                    key === "_id" ? null : (
                      <label key={key} className="block">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        <input
                          type={
                            key.toLowerCase().includes("date") ? "date" : "text"
                          }
                          value={value}
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
                  Remove {type === "trainDetails" ? "Train" : "Flight"} Details
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

        <label className="block font-semibold mb-1">
          Last booking date
          <input
            type="date"
            className="w-full p-3 border"
            value={formData.lastBookingDate}
            onChange={(e) => handleChange(e, "lastBookingDate")}
            disabled={isLoading}
          />
        </label>

        <label className="block font-semibold mb-1">
          Completed Trips Count
          <input
            type="number"
            className="w-full p-3 border"
            placeholder="Completed Trips Count"
            value={formData.completedTripsCount}
            onChange={(e) => handleChange(e, "completedTripsCount")}
            disabled={isLoading}
          />
        </label>

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

        <div>
          <label className="block font-semibold mb-1">Remarks</label>
          <textarea
            className="w-full p-3 border"
            placeholder="Enter any notes or special information"
            value={formData.remarks}
            onChange={(e) => handleChange(e, "remarks")}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Boarding Points</label>
          {formData.boardingPoints?.map((bp, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-2 items-center mb-2"
            >
              <input
                type="text"
                placeholder="Station code (e.g., MAS)"
                value={bp.stationCode}
                className="p-3 border w-full sm:flex-1"
                onChange={(e) =>
                  handleChange(e, null, "boardingPoints", index, "stationCode")
                }
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Station name (e.g., MGR Chennai Central)"
                value={bp.stationName}
                className="p-3 border w-full sm:flex-1"
                onChange={(e) =>
                  handleChange(e, null, "boardingPoints", index, "stationName")
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
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={() =>
              addTransportDetail("boardingPoints", defaultBoardingPoint)
            }
            disabled={isLoading}
          >
            + Add Boarding Point
          </button>
        </div>

        <div>
          <label className="block font-semibold mb-1">Deboarding Points</label>
          {formData.deboardingPoints?.map((bp, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-2 items-center mb-2"
            >
              <input
                type="text"
                placeholder="Station code (e.g., MAS)"
                value={bp.stationCode}
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
                value={bp.stationName}
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
                onClick={() => removeTransportDetail("deboardingPoints", index)}
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
              addTransportDetail("deboardingPoints", defaultBoardingPoint)
            }
            disabled={isLoading}
          >
            + Add Deboarding Point
          </button>
        </div>

        <div>
          <label className="block font-semibold capitalize mb-1">Add-ons</label>
          {formData.addons?.map((addon, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-2 items-center mb-2"
            >
              <input
                type="text"
                placeholder="Addon Name"
                value={addon.name}
                className="p-3 border w-full sm:flex-1"
                onChange={(e) => handleChange(e, null, "addons", index, "name")}
                disabled={isLoading}
              />
              <input
                type="number"
                placeholder="Addon Amount"
                value={addon.amount}
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

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded shadow"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default TourProfile;
