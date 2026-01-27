// import React, { useState, useContext } from "react";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { TourAdminContext } from "../../context/TourAdminContext";

// // Error Boundary Component
// class ErrorBoundary extends React.Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="p-4 text-red-600">
//           <h2>Something went wrong.</h2>
//           <p>{this.state.error?.message || "Unknown error occurred"}</p>
//           <p>Please refresh the page or contact support.</p>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const AddTour = () => {
//   const { backendUrl, aToken } = useContext(TourAdminContext);

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

//   const defaultStationPoint = { stationCode: "", stationName: "" };

//   const defaultVariantPackage = {
//     duration: { days: "", nights: "" },
//     price: {
//       doubleSharing: "",
//       tripleSharing: "",
//       childWithBerth: "",
//       childWithoutBerth: "",
//     },
//     advanceAmount: { adult: "", child: "" },
//     destination: [""],
//     sightseeing: [""],
//     itinerary: [""],
//     includes: [""],
//     excludes: [""],
//     trainDetails: [defaultTrain],
//     flightDetails: [defaultFlight],
//     addons: [{ name: "", amount: "" }],
//     remarks: "",
//     boardingPoints: [defaultStationPoint],
//     deboardingPoints: [defaultStationPoint],
//     lastBookingDate: "",
//   };

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
//     advanceAmount: { adult: "", child: "" },
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
//     boardingPoints: [defaultStationPoint],
//     deboardingPoints: [defaultStationPoint],
//     remarks: "",
//     variantPackage: [],
//   };

//   const [formData, setFormData] = useState(initialForm);
//   const [images, setImages] = useState({
//     titleImage: null,
//     mapImage: null,
//     galleryImages: [],
//   });
//   const [loading, setLoading] = useState(false);
//   const [addingTransport, setAddingTransport] = useState({}); // Track loading for boarding/deboarding per variantIndex

//   const handleChange = (
//     e,
//     field,
//     nestedField = null,
//     index = null,
//     subField = null,
//     variantIndex = null
//   ) => {
//     const value = e.target.value;

//     if (variantIndex !== null && nestedField && index !== null) {
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         const updated = [...(updatedVariants[variantIndex][nestedField] || [])];
//         updated[index] = { ...updated[index], [subField]: value };
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [nestedField]: updated,
//         };
//         return { ...prev, variantPackage: updatedVariants };
//       });
//     } else if (variantIndex !== null && typeof field === "object") {
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [field.main]: {
//             ...updatedVariants[variantIndex][field.main],
//             [field.sub]: value,
//           },
//         };
//         return { ...prev, variantPackage: updatedVariants };
//       });
//     } else if (variantIndex !== null) {
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [field]: value,
//         };
//         return { ...prev, variantPackage: updatedVariants };
//       });
//     } else if (nestedField && index !== null) {
//       setFormData((prev) => {
//         const updated = [...(prev[nestedField] || [])];
//         updated[index] = { ...updated[index], [subField]: value };
//         return { ...prev, [nestedField]: updated };
//       });
//     } else if (typeof field === "object") {
//       setFormData((prev) => ({
//         ...prev,
//         [field.main]: {
//           ...prev[field.main],
//           [field.sub]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [field]: value }));
//     }
//   };

//   const handleArrayChange = (e, index, field, variantIndex = null) => {
//     const value = e.target.value;
//     if (variantIndex !== null) {
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         const updated = [...(updatedVariants[variantIndex][field] || [])];
//         updated[index] = value;
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [field]: updated,
//         };
//         return { ...prev, variantPackage: updatedVariants };
//       });
//     } else {
//       setFormData((prev) => {
//         const updated = [...(prev[field] || [])];
//         updated[index] = value;
//         return { ...prev, [field]: updated };
//       });
//     }
//   };

//   const addField = (field, template = "", variantIndex = null) => {
//     if (variantIndex !== null) {
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [field]: [...(updatedVariants[variantIndex][field] || []), template],
//         };
//         return { ...prev, variantPackage: updatedVariants };
//       });
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: [...(prev[field] || []), template],
//       }));
//     }
//   };

//   const removeField = (field, index, variantIndex = null) => {
//     if (variantIndex !== null) {
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [field]: (updatedVariants[variantIndex][field] || []).filter(
//             (_, i) => i !== index
//           ),
//         };
//         return { ...prev, variantPackage: updatedVariants };
//       });
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: (prev[field] || []).filter((_, i) => i !== index),
//       }));
//     }
//   };

//   const addTransportDetail = (field, template, variantIndex = null) => {
//     if (variantIndex !== null) {
//       setAddingTransport((prev) => ({
//         ...prev,
//         [variantIndex]: field,
//       }));
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [field]: [
//             ...(updatedVariants[variantIndex][field] || []),
//             { ...template },
//           ],
//         };
//         console.log(
//           `Added ${field} to variant ${variantIndex}:`,
//           updatedVariants[variantIndex][field]
//         );
//         return { ...prev, variantPackage: updatedVariants };
//       });
//       setTimeout(() => {
//         setAddingTransport((prev) => ({
//           ...prev,
//           [variantIndex]: null,
//         }));
//       }, 500); // Increased to 500ms
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: [...(prev[field] || []), { ...template }],
//       }));
//     }
//   };

//   const removeTransportDetail = (field, index, variantIndex = null) => {
//     if (variantIndex !== null) {
//       setFormData((prev) => {
//         const updatedVariants = [...(prev.variantPackage || [])];
//         if (!updatedVariants[variantIndex]) return prev;
//         updatedVariants[variantIndex] = {
//           ...updatedVariants[variantIndex],
//           [field]: (updatedVariants[variantIndex][field] || []).filter(
//             (_, i) => i !== index
//           ),
//         };
//         console.log(
//           `Removed ${field} at index ${index} from variant ${variantIndex}:`,
//           updatedVariants[variantIndex][field]
//         );
//         return { ...prev, variantPackage: updatedVariants };
//       });
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: (prev[field] || []).filter((_, i) => i !== index),
//       }));
//     }
//   };

//   const handleImageChange = (e, field) => {
//     if (field === "galleryImages") {
//       setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
//     } else {
//       setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
//     }
//   };

//   const handleBoardingChange = (e, index, subField, variantIndex = null) => {
//     handleChange(e, null, "boardingPoints", index, subField, variantIndex);
//   };

//   const addBoardingField = (variantIndex = null) => {
//     addTransportDetail("boardingPoints", defaultStationPoint, variantIndex);
//   };

//   const removeBoardingField = (index, variantIndex = null) => {
//     removeTransportDetail("boardingPoints", index, variantIndex);
//   };

//   const handleDeboardingChange = (e, index, subField, variantIndex = null) => {
//     handleChange(e, null, "deboardingPoints", index, subField, variantIndex);
//   };

//   const addDeboardingField = (variantIndex = null) => {
//     addTransportDetail("deboardingPoints", defaultStationPoint, variantIndex);
//   };

//   const removeDeboardingField = (index, variantIndex = null) => {
//     removeTransportDetail("deboardingPoints", index, variantIndex);
//   };

//   const addVariantPackage = () => {
//     setFormData((prev) => {
//       const newVariant = { ...defaultVariantPackage };
//       console.log("Adding new variant package:", newVariant);
//       return {
//         ...prev,
//         variantPackage: [...(prev.variantPackage || []), newVariant],
//       };
//     });
//   };

//   const removeVariantPackage = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       variantPackage: (prev.variantPackage || []).filter((_, i) => i !== index),
//     }));
//     setAddingTransport((prev) => {
//       const newState = { ...prev };
//       delete newState[index];
//       return newState;
//     });
//     console.log("Removed variant package at index:", index);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const data = new FormData();

//       Object.entries({
//         title: formData.title,
//         batch: formData.batch,
//         duration: JSON.stringify(formData.duration),
//         price: JSON.stringify(formData.price),
//         advanceAmount: JSON.stringify(formData.advanceAmount),
//         destination: JSON.stringify(formData.destination),
//         sightseeing: JSON.stringify(formData.sightseeing),
//         itinerary: JSON.stringify(formData.itinerary),
//         includes: JSON.stringify(formData.includes),
//         excludes: JSON.stringify(formData.excludes),
//         trainDetails: JSON.stringify(formData.trainDetails),
//         flightDetails: JSON.stringify(formData.flightDetails),
//         lastBookingDate: formData.lastBookingDate,
//         completedTripsCount: formData.completedTripsCount,
//         addons: JSON.stringify(formData.addons),
//         boardingPoints: JSON.stringify(formData.boardingPoints),
//         deboardingPoints: JSON.stringify(formData.deboardingPoints),
//         remarks: formData.remarks,
//         variantPackage: JSON.stringify(formData.variantPackage),
//       }).forEach(([key, value]) => data.append(key, value));

//       if (images.titleImage) data.append("titleImage", images.titleImage);
//       if (images.mapImage) data.append("mapImage", images.mapImage);
//       images.galleryImages.forEach((img) => data.append("galleryImages", img));

//       console.log("FormData being sent:", Object.fromEntries(data));

//       const res = await axios.post(
//         `${backendUrl}/api/touradmin/add-tour`,
//         data,
//         { headers: { aToken, "Content-Type": "multipart/form-data" } }
//       );

//       if (res.data.success) {
//         toast.success("Tour added successfully!");
//         setFormData(initialForm);
//         setImages({ titleImage: null, mapImage: null, galleryImages: [] });
//         setAddingTransport({});
//       } else {
//         toast.error("Failed to add tour: " + res.data.message);
//       }
//     } catch (error) {
//       console.error("Submission Error:", error);
//       toast.error("Something went wrong while submitting the tour.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ErrorBoundary>
//       <div className="p-4 sm:p-6 max-w-4xl mx-auto">
//         <ToastContainer position="top-right" autoClose={5000} />
//         <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center sm:text-left px-10 sm:px-0">
//           Add New Tour
//         </h1>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* BASIC DETAILS */}
//           <div>
//             <label className="block font-semibold mb-1">Title</label>
//             <input
//               type="text"
//               placeholder="Title"
//               className="w-full p-3 border"
//               value={formData.title}
//               onChange={(e) => handleChange(e, "title")}
//               autoComplete="off"
//               required
//             />
//           </div>

//           <div>
//             <label className="block font-semibold mb-1">
//               Tour Category (Batch)
//             </label>
//             <select
//               className="w-full p-3 border"
//               value={formData.batch}
//               onChange={(e) => handleChange(e, "batch")}
//               required
//               autoComplete="off"
//             >
//               <option value="">Select tour category</option>
//               <option value="Historical">Historical</option>
//               <option value="Jolly">Jolly</option>
//               <option value="Spiritual">Spiritual</option>
//               <option value="Spiritual+Sightseeing">
//                 Spiritual + Sightseeing
//               </option>
//               <option value="International">International</option>
//             </select>
//           </div>

//           {/* DURATION */}
//           <div>
//             <label className="block font-semibold mb-1">Duration</label>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <input
//                 type="number"
//                 placeholder="Days"
//                 className="p-3 border w-full"
//                 value={formData.duration.days}
//                 onChange={(e) =>
//                   handleChange(e, { main: "duration", sub: "days" })
//                 }
//                 autoComplete="off"
//                 required
//               />
//               <input
//                 type="number"
//                 placeholder="Nights"
//                 className="p-3 border w-full"
//                 value={formData.duration.nights}
//                 onChange={(e) =>
//                   handleChange(e, { main: "duration", sub: "nights" })
//                 }
//                 autoComplete="off"
//                 required
//               />
//             </div>
//           </div>

//           {/* ADVANCE AMOUNT */}
//           <div>
//             <label className="block font-semibold mb-1">Advance Amount</label>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <input
//                 type="number"
//                 placeholder="Adult Advance Amount"
//                 className="p-3 border w-full"
//                 value={formData.advanceAmount.adult}
//                 onChange={(e) =>
//                   handleChange(e, { main: "advanceAmount", sub: "adult" })
//                 }
//                 autoComplete="off"
//                 required
//               />
//               <input
//                 type="number"
//                 placeholder="Child Advance Amount"
//                 className="p-3 border w-full"
//                 value={formData.advanceAmount.child}
//                 onChange={(e) =>
//                   handleChange(e, { main: "advanceAmount", sub: "child" })
//                 }
//                 autoComplete="off"
//               />
//             </div>
//           </div>

//           {/* PRICES */}
//           <div>
//             <label className="block font-semibold mb-1">Prices</label>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <input
//                 type="number"
//                 placeholder="Double Sharing Price"
//                 className="p-3 border w-full"
//                 value={formData.price.doubleSharing}
//                 onChange={(e) =>
//                   handleChange(e, { main: "price", sub: "doubleSharing" })
//                 }
//                 autoComplete="off"
//                 required
//               />
//               <input
//                 type="number"
//                 placeholder="Triple Sharing Price"
//                 className="p-3 border w-full"
//                 value={formData.price.tripleSharing}
//                 onChange={(e) =>
//                   handleChange(e, { main: "price", sub: "tripleSharing" })
//                 }
//                 autoComplete="off"
//                 required
//               />
//               <input
//                 type="number"
//                 placeholder="Child With Berth Price"
//                 className="p-3 border w-full"
//                 value={formData.price.childWithBerth}
//                 onChange={(e) =>
//                   handleChange(e, { main: "price", sub: "childWithBerth" })
//                 }
//                 autoComplete="off"
//               />
//               <input
//                 type="number"
//                 placeholder="Child Without Berth Price"
//                 className="p-3 border w-full"
//                 value={formData.price.childWithoutBerth}
//                 onChange={(e) =>
//                   handleChange(e, { main: "price", sub: "childWithoutBerth" })
//                 }
//                 autoComplete="off"
//               />
//             </div>
//           </div>

//           {/* DYNAMIC ARRAYS */}
//           {[
//             "destination",
//             "sightseeing",
//             "includes",
//             "excludes",
//             "itinerary",
//           ].map((field) => (
//             <div key={field}>
//               <label className="block font-semibold capitalize mb-1">
//                 {field}
//               </label>
//               {(formData[field] || []).map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//                 >
//                   <input
//                     value={item}
//                     placeholder={`${field} ${index + 1}`}
//                     className="w-full p-3 border"
//                     onChange={(e) => handleArrayChange(e, index, field)}
//                     autoComplete="off"
//                     required={field !== "itinerary"}
//                   />
//                   <button
//                     type="button"
//                     className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
//                     onClick={() => removeField(field, index)}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="bg-blue-500 text-white px-4 py-2 rounded"
//                 onClick={() => addField(field)}
//               >
//                 + Add {field}
//               </button>
//             </div>
//           ))}

//           {/* TRAIN & FLIGHT DETAILS */}
//           {["trainDetails", "flightDetails"].map((type) => (
//             <div key={type}>
//               <label className="block font-semibold mb-1 capitalize">
//                 {type}
//               </label>
//               {(formData[type] || []).map((detail, index) => (
//                 <div key={index} className="mb-4 border p-3 rounded">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {Object.entries(detail).map(([key, value]) => (
//                       <input
//                         key={key}
//                         type={
//                           key.toLowerCase().includes("date") ? "date" : "text"
//                         }
//                         value={value}
//                         placeholder={key
//                           .replace(/([A-Z])/g, " $1")
//                           .replace(/^./, (str) => str.toUpperCase())}
//                         className="p-3 border w-full"
//                         onChange={(e) =>
//                           handleChange(e, null, type, index, key)
//                         }
//                         autoComplete="off"
//                       />
//                     ))}
//                   </div>
//                   <button
//                     type="button"
//                     className="bg-red-500 text-white px-3 py-2 mt-2 rounded text-sm w-full sm:w-auto"
//                     onClick={() => removeTransportDetail(type, index)}
//                   >
//                     Remove {type === "trainDetails" ? "Train" : "Flight"}
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="bg-blue-500 text-white px-4 py-2 rounded"
//                 onClick={() =>
//                   addTransportDetail(
//                     type,
//                     type === "trainDetails" ? defaultTrain : defaultFlight
//                   )
//                 }
//               >
//                 + Add {type === "trainDetails" ? "Train" : "Flight"}
//               </button>
//             </div>
//           ))}

//           {/* BOARDING POINTS */}
//           <div>
//             <label className="block font-semibold mb-1">Boarding Points</label>
//             {(formData.boardingPoints || []).map((bp, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//               >
//                 <input
//                   type="text"
//                   placeholder="Station code (e.g., MAS)"
//                   value={bp.stationCode}
//                   className="p-3 border w-full sm:flex-1"
//                   onChange={(e) =>
//                     handleBoardingChange(e, index, "stationCode")
//                   }
//                   autoComplete="off"
//                   required
//                 />
//                 <input
//                   type="text"
//                   placeholder="Station name (e.g., MGR Chennai Central)"
//                   value={bp.stationName}
//                   className="p-3 border w-full sm:flex-1"
//                   onChange={(e) =>
//                     handleBoardingChange(e, index, "stationName")
//                   }
//                   autoComplete="off"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
//                   onClick={() => removeBoardingField(index)}
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <div className="relative">
//               <button
//                 type="button"
//                 className={`bg-blue-500 text-white px-4 py-2 rounded ${
//                   addingTransport.main ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//                 onClick={() => addBoardingField()}
//                 disabled={addingTransport.main}
//               >
//                 {addingTransport.main === "boardingPoints"
//                   ? "Adding Boarding Point..."
//                   : "+ Add Boarding Point"}
//               </button>
//               {addingTransport.main === "boardingPoints" && (
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <svg
//                     className="animate-spin h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* DEBOARDING POINTS */}
//           <div>
//             <label className="block font-semibold mb-1">
//               Deboarding Points
//             </label>
//             {(formData.deboardingPoints || []).map((dp, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//               >
//                 <input
//                   type="text"
//                   placeholder="Station code (e.g., MAS)"
//                   value={dp.stationCode}
//                   className="p-3 border w-full sm:flex-1"
//                   onChange={(e) =>
//                     handleDeboardingChange(e, index, "stationCode")
//                   }
//                   autoComplete="off"
//                   required
//                 />
//                 <input
//                   type="text"
//                   placeholder="Station name (e.g., MGR Chennai Central)"
//                   value={dp.stationName}
//                   className="p-3 border w-full sm:flex-1"
//                   onChange={(e) =>
//                     handleDeboardingChange(e, index, "stationName")
//                   }
//                   autoComplete="off"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
//                   onClick={() => removeDeboardingField(index)}
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <div className="relative">
//               <button
//                 type="button"
//                 className={`bg-blue-500 text-white px-4 py-2 rounded ${
//                   addingTransport.main ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//                 onClick={() => addDeboardingField()}
//                 disabled={addingTransport.main}
//               >
//                 {addingTransport.main === "deboardingPoints"
//                   ? "Adding Deboarding Point..."
//                   : "+ Add Deboarding Point"}
//               </button>
//               {addingTransport.main === "deboardingPoints" && (
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <svg
//                     className="animate-spin h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* REMARKS */}
//           <div>
//             <label className="block font-semibold mb-1">Remarks</label>
//             <textarea
//               className="w-full p-3 border"
//               placeholder="Enter remarks..."
//               value={formData.remarks}
//               onChange={(e) => handleChange(e, "remarks")}
//               autoComplete="off"
//             />
//           </div>

//           {/* IMAGES */}
//           <div className="space-y-4">
//             <div>
//               <label className="block font-semibold mb-1">Title Image</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleImageChange(e, "titleImage")}
//                 className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//                 autoComplete="off"
//                 required
//               />
//               {images.titleImage && (
//                 <p className="text-green-600 mt-1">
//                   Selected: {images.titleImage.name}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Map Image</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => handleImageChange(e, "mapImage")}
//                 className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//                 autoComplete="off"
//                 required
//               />
//               {images.mapImage && (
//                 <p className="text-green-600 mt-1">
//                   Selected: {images.mapImage.name}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">
//                 Gallery Images (Up to 3 images)
//               </label>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) => handleImageChange(e, "galleryImages")}
//                 className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//                 autoComplete="off"
//                 required
//               />
//               {images.galleryImages?.length > 0 && (
//                 <ul className="text-green-600 mt-1 list-disc pl-5">
//                   {images.galleryImages.map((img, idx) => (
//                     <li key={idx}>{img.name}</li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>

//           {/* ADDONS */}
//           <div>
//             <label className="block font-semibold mb-1">Add-ons</label>
//             {(formData.addons || []).map((addon, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//               >
//                 <input
//                   type="text"
//                   placeholder="Addon Name"
//                   value={addon.name}
//                   className="p-3 border w-full sm:flex-1"
//                   onChange={(e) =>
//                     handleChange(e, null, "addons", index, "name")
//                   }
//                   autoComplete="off"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Addon Amount"
//                   value={addon.amount}
//                   className="p-3 border w-full sm:flex-1"
//                   onChange={(e) =>
//                     handleChange(e, null, "addons", index, "amount")
//                   }
//                   autoComplete="off"
//                 />
//                 <button
//                   type="button"
//                   className="bg-red-500 text-white px-3 py-2 mt-2 sm:mt-0 rounded text-sm w-full sm:w-auto"
//                   onClick={() => removeTransportDetail("addons", index)}
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               className="bg-blue-500 text-white px-4 py-2 rounded"
//               onClick={() =>
//                 addTransportDetail("addons", { name: "", amount: "" })
//               }
//             >
//               + Add Add-on
//             </button>
//           </div>

//           {/* LAST BOOKING DATE & COMPLETED TRIPS */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block font-semibold mb-1">
//                 Tour start Date
//               </label>
//               <input
//                 type="date"
//                 className="w-full p-3 border"
//                 value={formData.lastBookingDate}
//                 onChange={(e) => handleChange(e, "lastBookingDate")}
//                 autoComplete="off"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block font-semibold mb-1">
//                 Completed Trips Count
//               </label>
//               <input
//                 type="number"
//                 className="w-full p-3 border"
//                 placeholder="Enter number of completed trips"
//                 value={formData.completedTripsCount}
//                 onChange={(e) => handleChange(e, "completedTripsCount")}
//                 autoComplete="off"
//               />
//             </div>
//           </div>

//           {/* VARIANT PACKAGES */}
//           <div>
//             <label className="block font-semibold mb-1">Variant Packages</label>
//             {(formData.variantPackage || []).map((variant, variantIndex) => {
//               if (!variant) {
//                 console.error(`Variant at index ${variantIndex} is undefined`);
//                 return null;
//               }
//               console.log(
//                 `Rendering variant ${variantIndex} boardingPoints:`,
//                 variant.boardingPoints
//               );
//               return (
//                 <div key={variantIndex} className="border p-4 rounded mb-4">
//                   <h3 className="text-lg font-semibold mb-2">
//                     Variant Package {variantIndex + 1}
//                   </h3>
//                   <button
//                     type="button"
//                     className="bg-red-500 text-white px-3 py-2 rounded text-sm mb-4"
//                     onClick={() => removeVariantPackage(variantIndex)}
//                   >
//                     Remove Variant Package
//                   </button>

//                   {/* Variant Duration */}
//                   <div>
//                     <label className="block font-semibold mb-1">Duration</label>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <input
//                         type="number"
//                         placeholder="Days"
//                         className="p-3 border w-full"
//                         value={variant.duration?.days || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "duration", sub: "days" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Nights"
//                         className="p-3 border w-full"
//                         value={variant.duration?.nights || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "duration", sub: "nights" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                     </div>
//                   </div>

//                   {/* Variant Prices */}
//                   <div>
//                     <label className="block font-semibold mb-1">Prices</label>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                       <input
//                         type="number"
//                         placeholder="Double Sharing Price"
//                         className="p-3 border w-full"
//                         value={variant.price?.doubleSharing || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "price", sub: "doubleSharing" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Triple Sharing Price"
//                         className="p-3 border w-full"
//                         value={variant.price?.tripleSharing || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "price", sub: "tripleSharing" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Child With Berth Price"
//                         className="p-3 border w-full"
//                         value={variant.price?.childWithBerth || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "price", sub: "childWithBerth" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Child Without Berth Price"
//                         className="p-3 border w-full"
//                         value={variant.price?.childWithoutBerth || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "price", sub: "childWithoutBerth" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                     </div>
//                   </div>

//                   {/* Variant Advance Amount */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Advance Amount
//                     </label>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <input
//                         type="number"
//                         placeholder="Adult Advance Amount"
//                         className="p-3 border w-full"
//                         value={variant.advanceAmount?.adult || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "advanceAmount", sub: "adult" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Child Advance Amount"
//                         className="p-3 border w-full"
//                         value={variant.advanceAmount?.child || ""}
//                         onChange={(e) =>
//                           handleChange(
//                             e,
//                             { main: "advanceAmount", sub: "child" },
//                             null,
//                             null,
//                             null,
//                             variantIndex
//                           )
//                         }
//                         autoComplete="off"
//                       />
//                     </div>
//                   </div>

//                   {/* Variant Dynamic Arrays */}
//                   {[
//                     "destination",
//                     "sightseeing",
//                     "includes",
//                     "excludes",
//                     "itinerary",
//                   ].map((field) => (
//                     <div key={field}>
//                       <label className="block font-semibold capitalize mb-1">
//                         {field}
//                       </label>
//                       {(variant[field] || []).map((item, index) => (
//                         <div
//                           key={index}
//                           className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//                         >
//                           <input
//                             value={item}
//                             placeholder={`${field} ${index + 1}`}
//                             className="w-full p-3 border"
//                             onChange={(e) =>
//                               handleArrayChange(e, index, field, variantIndex)
//                             }
//                             autoComplete="off"
//                           />
//                           <button
//                             type="button"
//                             className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
//                             onClick={() =>
//                               removeField(field, index, variantIndex)
//                             }
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         className="bg-blue-500 text-white px-4 py-2 rounded"
//                         onClick={() => addField(field, "", variantIndex)}
//                       >
//                         + Add {field}
//                       </button>
//                     </div>
//                   ))}

//                   {/* Variant Train & Flight Details */}
//                   {["trainDetails", "flightDetails"].map((type) => (
//                     <div key={type}>
//                       <label className="block font-semibold mb-1 capitalize">
//                         {type}
//                       </label>
//                       {(variant[type] || []).map((detail, index) => (
//                         <div key={index} className="mb-4 border p-3 rounded">
//                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                             {Object.entries(detail).map(([key, value]) => (
//                               <input
//                                 key={key}
//                                 type={
//                                   key.toLowerCase().includes("date")
//                                     ? "date"
//                                     : "text"
//                                 }
//                                 value={value}
//                                 placeholder={key
//                                   .replace(/([A-Z])/g, " $1")
//                                   .replace(/^./, (str) => str.toUpperCase())}
//                                 className="p-3 border w-full"
//                                 onChange={(e) =>
//                                   handleChange(
//                                     e,
//                                     null,
//                                     type,
//                                     index,
//                                     key,
//                                     variantIndex
//                                   )
//                                 }
//                                 autoComplete="off"
//                               />
//                             ))}
//                           </div>
//                           <button
//                             type="button"
//                             className="bg-red-500 text-white px-3 py-2 mt-2 rounded text-sm w-full sm:w-auto"
//                             onClick={() =>
//                               removeTransportDetail(type, index, variantIndex)
//                             }
//                           >
//                             Remove{" "}
//                             {type === "trainDetails" ? "Train" : "Flight"}
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         type="button"
//                         className="bg-blue-500 text-white px-4 py-2 rounded"
//                         onClick={() =>
//                           addTransportDetail(
//                             type,
//                             type === "trainDetails"
//                               ? defaultTrain
//                               : defaultFlight,
//                             variantIndex
//                           )
//                         }
//                       >
//                         + Add {type === "trainDetails" ? "Train" : "Flight"}
//                       </button>
//                     </div>
//                   ))}

//                   {/* Variant Boarding Points */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Boarding Points
//                     </label>
//                     {(variant.boardingPoints || []).map((bp, index) => (
//                       <div
//                         key={index}
//                         className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//                       >
//                         <input
//                           type="text"
//                           placeholder="Station code (e.g., MAS)"
//                           value={bp.stationCode || ""}
//                           className="p-3 border w-full sm:flex-1"
//                           onChange={(e) =>
//                             handleBoardingChange(
//                               e,
//                               index,
//                               "stationCode",
//                               variantIndex
//                             )
//                           }
//                           autoComplete="off"
//                         />
//                         <input
//                           type="text"
//                           placeholder="Station name (e.g., MGR Chennai Central)"
//                           value={bp.stationName || ""}
//                           className="p-3 border w-full sm:flex-1"
//                           onChange={(e) =>
//                             handleBoardingChange(
//                               e,
//                               index,
//                               "stationName",
//                               variantIndex
//                             )
//                           }
//                           autoComplete="off"
//                         />
//                         <button
//                           type="button"
//                           className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
//                           onClick={() =>
//                             removeBoardingField(index, variantIndex)
//                           }
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     ))}
//                     <div className="relative">
//                       <button
//                         type="button"
//                         className={`bg-blue-500 text-white px-4 py-2 rounded ${
//                           addingTransport[variantIndex] === "boardingPoints"
//                             ? "opacity-50 cursor-not-allowed"
//                             : ""
//                         }`}
//                         onClick={() => addBoardingField(variantIndex)}
//                         disabled={
//                           addingTransport[variantIndex] === "boardingPoints"
//                         }
//                       >
//                         {addingTransport[variantIndex] === "boardingPoints"
//                           ? "Adding Boarding Point..."
//                           : "+ Add Boarding Point"}
//                       </button>
//                       {addingTransport[variantIndex] === "boardingPoints" && (
//                         <div className="absolute inset-0 flex items-center justify-center">
//                           <svg
//                             className="animate-spin h-5 w-5 text-white"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                             ></path>
//                           </svg>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Variant Deboarding Points */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Deboarding Points
//                     </label>
//                     {(variant.deboardingPoints || []).map((dp, index) => (
//                       <div
//                         key={index}
//                         className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//                       >
//                         <input
//                           type="text"
//                           placeholder="Station code (e.g., MAS)"
//                           value={dp.stationCode || ""}
//                           className="p-3 border w-full sm:flex-1"
//                           onChange={(e) =>
//                             handleDeboardingChange(
//                               e,
//                               index,
//                               "stationCode",
//                               variantIndex
//                             )
//                           }
//                           autoComplete="off"
//                         />
//                         <input
//                           type="text"
//                           placeholder="Station name (e.g., MGR Chennai Central)"
//                           value={dp.stationName || ""}
//                           className="p-3 border w-full sm:flex-1"
//                           onChange={(e) =>
//                             handleDeboardingChange(
//                               e,
//                               index,
//                               "stationName",
//                               variantIndex
//                             )
//                           }
//                           autoComplete="off"
//                         />
//                         <button
//                           type="button"
//                           className="bg-red-500 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
//                           onClick={() =>
//                             removeDeboardingField(index, variantIndex)
//                           }
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     ))}
//                     <div className="relative">
//                       <button
//                         type="button"
//                         className={`bg-blue-500 text-white px-4 py-2 rounded ${
//                           addingTransport[variantIndex] === "deboardingPoints"
//                             ? "opacity-50 cursor-not-allowed"
//                             : ""
//                         }`}
//                         onClick={() => addDeboardingField(variantIndex)}
//                         disabled={
//                           addingTransport[variantIndex] === "deboardingPoints"
//                         }
//                       >
//                         {addingTransport[variantIndex] === "deboardingPoints"
//                           ? "Adding Deboarding Point..."
//                           : "+ Add Deboarding Point"}
//                       </button>
//                       {addingTransport[variantIndex] === "deboardingPoints" && (
//                         <div className="absolute inset-0 flex items-center justify-center">
//                           <svg
//                             className="animate-spin h-5 w-5 text-white"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                             ></path>
//                           </svg>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Variant Add-ons */}
//                   <div>
//                     <label className="block font-semibold mb-1">Add-ons</label>
//                     {(variant.addons || []).map((addon, index) => (
//                       <div
//                         key={index}
//                         className="flex flex-col sm:flex-row items-center gap-2 mb-2"
//                       >
//                         <input
//                           type="text"
//                           placeholder="Addon Name"
//                           value={addon.name || ""}
//                           className="p-3 border w-full sm:flex-1"
//                           onChange={(e) =>
//                             handleChange(
//                               e,
//                               null,
//                               "addons",
//                               index,
//                               "name",
//                               variantIndex
//                             )
//                           }
//                           autoComplete="off"
//                         />
//                         <input
//                           type="number"
//                           placeholder="Addon Amount"
//                           value={addon.amount || ""}
//                           className="p-3 border w-full sm:flex-1"
//                           onChange={(e) =>
//                             handleChange(
//                               e,
//                               null,
//                               "addons",
//                               index,
//                               "amount",
//                               variantIndex
//                             )
//                           }
//                           autoComplete="off"
//                         />
//                         <button
//                           type="button"
//                           className="bg-red-500 text-white px-3 py-2 mt-2 sm:mt-0 rounded text-sm w-full sm:w-auto"
//                           onClick={() =>
//                             removeTransportDetail("addons", index, variantIndex)
//                           }
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     ))}
//                     <button
//                       type="button"
//                       className="bg-blue-500 text-white px-4 py-2 rounded"
//                       onClick={() =>
//                         addTransportDetail(
//                           "addons",
//                           { name: "", amount: "" },
//                           variantIndex
//                         )
//                       }
//                     >
//                       + Add Add-on
//                     </button>
//                   </div>

//                   {/* Variant Remarks */}
//                   <div>
//                     <label className="block font-semibold mb-1">Remarks</label>
//                     <textarea
//                       className="w-full p-3 border"
//                       placeholder="Enter remarks..."
//                       value={variant.remarks || ""}
//                       onChange={(e) =>
//                         handleChange(
//                           e,
//                           "remarks",
//                           null,
//                           null,
//                           null,
//                           variantIndex
//                         )
//                       }
//                       autoComplete="off"
//                     />
//                   </div>

//                   {/* Variant Last Booking Date */}
//                   <div>
//                     <label className="block font-semibold mb-1">
//                       Last Booking Date
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full p-3 border"
//                       value={variant.lastBookingDate || ""}
//                       onChange={(e) =>
//                         handleChange(
//                           e,
//                           "lastBookingDate",
//                           null,
//                           null,
//                           null,
//                           variantIndex
//                         )
//                       }
//                       autoComplete="off"
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//             <button
//               type="button"
//               className="bg-blue-500 text-white px-4 py-2 rounded"
//               onClick={addVariantPackage}
//             >
//               + Add Variant Package
//             </button>
//           </div>

//           {/* Submit Button with Loading State */}
//           <div className="relative">
//             <button
//               type="submit"
//               className={`bg-green-600 text-white px-6 py-2 rounded shadow w-full ${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//               disabled={loading}
//             >
//               {loading ? "Creating Tour..." : "Submit Tour"}
//             </button>
//             {loading && (
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <svg
//                   className="animate-spin h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//               </div>
//             )}
//           </div>
//         </form>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default AddTour;

//POPUP

/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TourAdminContext } from "../../context/TourAdminContext";
import { useNavigate } from "react-router-dom";

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

const AddTour = () => {
  const { backendUrl, aToken } = useContext(TourAdminContext);
  const navigate = useNavigate();

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
    advanceAmount: { adult: "", child: "" },
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
  const [loading, setLoading] = useState(false);
  const [addingTransport, setAddingTransport] = useState({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // Detect unsaved changes
  useEffect(() => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialForm);
    const imagesChanged =
      images.titleImage !== null ||
      images.mapImage !== null ||
      images.galleryImages.length > 0;

    setFormIsDirty(formChanged || imagesChanged);
  }, [formData, images]);

  // Browser protection (refresh, back arrow, back swipe, tab close)
  useEffect(() => {
    if (!formIsDirty) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Unsaved changes இருக்கு. Sure ah leave பண்ணுறீங்களா?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formIsDirty]);

  // Custom back/swipe protection (push history to trap back action)
  useEffect(() => {
    if (!formIsDirty) return;

    // Create a history entry so back button triggers popstate
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      event.preventDefault();
      setShowBackConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [formIsDirty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const data = new FormData();

      Object.entries({
        title: formData.title,
        batch: formData.batch,
        duration: JSON.stringify(formData.duration),
        price: JSON.stringify(formData.price),
        advanceAmount: JSON.stringify(formData.advanceAmount),
        destination: JSON.stringify(formData.destination),
        sightseeing: JSON.stringify(formData.sightseeing),
        itinerary: JSON.stringify(formData.itinerary),
        includes: JSON.stringify(formData.includes),
        excludes: JSON.stringify(formData.excludes),
        trainDetails: JSON.stringify(formData.trainDetails),
        flightDetails: JSON.stringify(formData.flightDetails),
        lastBookingDate: formData.lastBookingDate,
        completedTripsCount: formData.completedTripsCount,
        addons: JSON.stringify(formData.addons),
        boardingPoints: JSON.stringify(formData.boardingPoints),
        deboardingPoints: JSON.stringify(formData.deboardingPoints),
        remarks: formData.remarks,
        variantPackage: JSON.stringify(formData.variantPackage),
      }).forEach(([key, value]) => data.append(key, value));

      if (images.titleImage) data.append("titleImage", images.titleImage);
      if (images.mapImage) data.append("mapImage", images.mapImage);
      images.galleryImages.forEach((img) => data.append("galleryImages", img));

      const res = await axios.post(
        `${backendUrl}/api/touradmin/add-tour`,
        data,
        { headers: { aToken, "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        toast.success("Tour added successfully!");
        setFormData(initialForm);
        setImages({ titleImage: null, mapImage: null, galleryImages: [] });
        setAddingTransport({});
        setFormIsDirty(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(res.data.message || "Failed to add tour");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Something went wrong while submitting the tour.");
    } finally {
      setLoading(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirm(false);
  };

  // ──────────────────────────────────────────────
  // Handlers (full original handlers)
  // ──────────────────────────────────────────────

  const handleChange = (
    e,
    field,
    nestedField = null,
    index = null,
    subField = null,
    variantIndex = null
  ) => {
    const value = e.target.value;

    if (variantIndex !== null && nestedField && index !== null) {
      setFormData((prev) => {
        const updatedVariants = [...(prev.variantPackage || [])];
        if (!updatedVariants[variantIndex]) return prev;
        const updated = [...(updatedVariants[variantIndex][nestedField] || [])];
        updated[index] = { ...updated[index], [subField]: value };
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          [nestedField]: updated,
        };
        return { ...prev, variantPackage: updatedVariants };
      });
    } else if (variantIndex !== null && typeof field === "object") {
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
    } else if (variantIndex !== null) {
      setFormData((prev) => {
        const updatedVariants = [...(prev.variantPackage || [])];
        if (!updatedVariants[variantIndex]) return prev;
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          [field]: value,
        };
        return { ...prev, variantPackage: updatedVariants };
      });
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
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (e, index, field, variantIndex = null) => {
    const value = e.target.value;
    if (variantIndex !== null) {
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
        const updated = [...(prev[field] || [])];
        updated[index] = value;
        return { ...prev, [field]: updated };
      });
    }
  };

  const addField = (field, template = "", variantIndex = null) => {
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
  };

  const removeField = (field, index, variantIndex = null) => {
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
  };

  const addTransportDetail = (field, template, variantIndex = null) => {
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
        return { ...prev, variantPackage: updatedVariants };
      });
      setTimeout(() => {
        setAddingTransport((prev) => ({
          ...prev,
          [variantIndex]: null,
        }));
      }, 500);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), { ...template }],
      }));
    }
  };

  const removeTransportDetail = (field, index, variantIndex = null) => {
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
  };

  const handleImageChange = (e, field) => {
    if (field === "galleryImages") {
      setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
    } else {
      setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const handleBoardingChange = (e, index, subField, variantIndex = null) => {
    handleChange(e, null, "boardingPoints", index, subField, variantIndex);
  };

  const addBoardingField = (variantIndex = null) => {
    addTransportDetail("boardingPoints", defaultStationPoint, variantIndex);
  };

  const removeBoardingField = (index, variantIndex = null) => {
    removeTransportDetail("boardingPoints", index, variantIndex);
  };

  const handleDeboardingChange = (e, index, subField, variantIndex = null) => {
    handleChange(e, null, "deboardingPoints", index, subField, variantIndex);
  };

  const addDeboardingField = (variantIndex = null) => {
    addTransportDetail("deboardingPoints", defaultStationPoint, variantIndex);
  };

  const removeDeboardingField = (index, variantIndex = null) => {
    removeTransportDetail("deboardingPoints", index, variantIndex);
  };

  const addVariantPackage = () => {
    setFormData((prev) => ({
      ...prev,
      variantPackage: [...(prev.variantPackage || []), { ...defaultVariantPackage }],
    }));
  };

  const removeVariantPackage = (index) => {
    setFormData((prev) => ({
      ...prev,
      variantPackage: (prev.variantPackage || []).filter((_, i) => i !== index),
    }));
    setAddingTransport((prev) => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <ToastContainer position="top-right" autoClose={5000} />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center sm:text-left px-10 sm:px-0">
          Add New Tour
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              placeholder="Title"
              className="w-full p-3 border rounded"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Batch / Category */}
          <div>
            <label className="block font-semibold mb-1">Tour Category (Batch)</label>
            <select
              className="w-full p-3 border rounded"
              value={formData.batch}
              onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              required
            >
              <option value="">Select tour category</option>
              <option value="Historical">Historical</option>
              <option value="Jolly">Jolly</option>
              <option value="Spiritual">Spiritual</option>
              <option value="Spiritual+Sightseeing">Spiritual + Sightseeing</option>
              <option value="International">International</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-semibold mb-1">Duration</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Days"
                className="p-3 border w-full rounded"
                value={formData.duration.days}
                onChange={(e) => setFormData({
                  ...formData,
                  duration: { ...formData.duration, days: e.target.value }
                })}
                required
              />
              <input
                type="number"
                placeholder="Nights"
                className="p-3 border w-full rounded"
                value={formData.duration.nights}
                onChange={(e) => setFormData({
                  ...formData,
                  duration: { ...formData.duration, nights: e.target.value }
                })}
                required
              />
            </div>
          </div>

          {/* Advance Amount */}
          <div>
            <label className="block font-semibold mb-1">Advance Amount</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Adult Advance Amount"
                className="p-3 border w-full rounded"
                value={formData.advanceAmount.adult}
                onChange={(e) => setFormData({
                  ...formData,
                  advanceAmount: { ...formData.advanceAmount, adult: e.target.value }
                })}
                required
              />
              <input
                type="number"
                placeholder="Child Advance Amount"
                className="p-3 border w-full rounded"
                value={formData.advanceAmount.child}
                onChange={(e) => setFormData({
                  ...formData,
                  advanceAmount: { ...formData.advanceAmount, child: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Prices */}
          <div>
            <label className="block font-semibold mb-1">Prices</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="number"
                placeholder="Double Sharing Price"
                className="p-3 border w-full rounded"
                value={formData.price.doubleSharing}
                onChange={(e) => setFormData({
                  ...formData,
                  price: { ...formData.price, doubleSharing: e.target.value }
                })}
                required
              />
              <input
                type="number"
                placeholder="Triple Sharing Price"
                className="p-3 border w-full rounded"
                value={formData.price.tripleSharing}
                onChange={(e) => setFormData({
                  ...formData,
                  price: { ...formData.price, tripleSharing: e.target.value }
                })}
                required
              />
              <input
                type="number"
                placeholder="Child With Berth Price"
                className="p-3 border w-full rounded"
                value={formData.price.childWithBerth}
                onChange={(e) => setFormData({
                  ...formData,
                  price: { ...formData.price, childWithBerth: e.target.value }
                })}
              />
              <input
                type="number"
                placeholder="Child Without Berth Price"
                className="p-3 border w-full rounded"
                value={formData.price.childWithoutBerth}
                onChange={(e) => setFormData({
                  ...formData,
                  price: { ...formData.price, childWithoutBerth: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Dynamic Arrays - Destination, Sightseeing, etc. */}
          {["destination", "sightseeing", "itinerary", "includes", "excludes"].map((field) => (
            <div key={field}>
              <label className="block font-semibold capitalize mb-1">{field}</label>
              {(formData[field] || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    value={item}
                    placeholder={`${field} ${index + 1}`}
                    className="w-full p-3 border rounded"
                    onChange={(e) => handleArrayChange(e, index, field)}
                  />
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                    onClick={() => removeField(field, index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => addField(field)}
              >
                + Add {field}
              </button>
            </div>
          ))}

          {/* Train & Flight Details */}
          {["trainDetails", "flightDetails"].map((type) => (
            <div key={type}>
              <label className="block font-semibold mb-1 capitalize">{type}</label>
              {(formData[type] || []).map((detail, index) => (
                <div key={index} className="mb-4 border p-3 rounded">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(detail).map(([key, value]) => (
                      <input
                        key={key}
                        type={key.toLowerCase().includes("date") ? "date" : "text"}
                        value={value}
                        placeholder={key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                        className="p-3 border w-full rounded"
                        onChange={(e) => handleChange(e, null, type, index, key)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-2 mt-2 rounded text-sm"
                    onClick={() => removeTransportDetail(type, index)}
                  >
                    Remove {type === "trainDetails" ? "Train" : "Flight"}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => addTransportDetail(type, type === "trainDetails" ? defaultTrain : defaultFlight)}
              >
                + Add {type === "trainDetails" ? "Train" : "Flight"}
              </button>
            </div>
          ))}

          {/* Boarding Points */}
          <div>
            <label className="block font-semibold mb-1">Boarding Points</label>
            {(formData.boardingPoints || []).map((bp, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Station code (e.g., MAS)"
                  value={bp.stationCode}
                  className="p-3 border w-1/3 rounded"
                  onChange={(e) => handleBoardingChange(e, index, "stationCode")}
                />
                <input
                  type="text"
                  placeholder="Station name (e.g., MGR Chennai Central)"
                  value={bp.stationName}
                  className="p-3 border flex-1 rounded"
                  onChange={(e) => handleBoardingChange(e, index, "stationName")}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                  onClick={() => removeBoardingField(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => addBoardingField()}
            >
              + Add Boarding Point
            </button>
          </div>

          {/* Deboarding Points */}
          <div>
            <label className="block font-semibold mb-1">Deboarding Points</label>
            {(formData.deboardingPoints || []).map((dp, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Station code (e.g., MAS)"
                  value={dp.stationCode}
                  className="p-3 border w-1/3 rounded"
                  onChange={(e) => handleDeboardingChange(e, index, "stationCode")}
                />
                <input
                  type="text"
                  placeholder="Station name (e.g., MGR Chennai Central)"
                  value={dp.stationName}
                  className="p-3 border flex-1 rounded"
                  onChange={(e) => handleDeboardingChange(e, index, "stationName")}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                  onClick={() => removeDeboardingField(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => addDeboardingField()}
            >
              + Add Deboarding Point
            </button>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold mb-1">Remarks</label>
            <textarea
              className="w-full p-3 border rounded"
              placeholder="Enter remarks..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
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
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Map Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "mapImage")}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Gallery Images (Up to 3)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e, "galleryImages")}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
                required
              />
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label className="block font-semibold mb-1">Add-ons</label>
            {(formData.addons || []).map((addon, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Addon Name"
                  value={addon.name}
                  className="p-3 border flex-1 rounded"
                  onChange={(e) => handleChange(e, null, "addons", index, "name")}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={addon.amount}
                  className="p-3 border w-32 rounded"
                  onChange={(e) => handleChange(e, null, "addons", index, "amount")}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                  onClick={() => removeTransportDetail("addons", index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => addTransportDetail("addons", { name: "", amount: "" })}
            >
              + Add Add-on
            </button>
          </div>

          {/* Last Booking Date & Completed Trips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Last Booking Date</label>
              <input
                type="date"
                className="w-full p-3 border rounded"
                value={formData.lastBookingDate}
                onChange={(e) => setFormData({ ...formData, lastBookingDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Completed Trips Count</label>
              <input
                type="number"
                className="w-full p-3 border rounded"
                placeholder="Enter number"
                value={formData.completedTripsCount}
                onChange={(e) => setFormData({ ...formData, completedTripsCount: e.target.value })}
              />
            </div>
          </div>

          {/* Variant Packages */}
          <div>
            <label className="block font-semibold mb-1">Variant Packages</label>
            {(formData.variantPackage || []).map((variant, variantIndex) => (
              <div key={variantIndex} className="border p-4 rounded mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Variant Package {variantIndex + 1}
                  </h3>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                    onClick={() => removeVariantPackage(variantIndex)}
                  >
                    Remove Variant
                  </button>
                </div>

                {/* Variant Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="number"
                    placeholder="Days"
                    value={variant.duration?.days || ""}
                    onChange={(e) => handleChange(e, { main: "duration", sub: "days" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Nights"
                    value={variant.duration?.nights || ""}
                    onChange={(e) => handleChange(e, { main: "duration", sub: "nights" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                </div>

                {/* Variant Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <input
                    type="number"
                    placeholder="Double Sharing Price"
                    value={variant.price?.doubleSharing || ""}
                    onChange={(e) => handleChange(e, { main: "price", sub: "doubleSharing" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Triple Sharing Price"
                    value={variant.price?.tripleSharing || ""}
                    onChange={(e) => handleChange(e, { main: "price", sub: "tripleSharing" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Child With Berth Price"
                    value={variant.price?.childWithBerth || ""}
                    onChange={(e) => handleChange(e, { main: "price", sub: "childWithBerth" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Child Without Berth Price"
                    value={variant.price?.childWithoutBerth || ""}
                    onChange={(e) => handleChange(e, { main: "price", sub: "childWithoutBerth" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                </div>

                {/* Variant Advance Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="number"
                    placeholder="Adult Advance Amount"
                    value={variant.advanceAmount?.adult || ""}
                    onChange={(e) => handleChange(e, { main: "advanceAmount", sub: "adult" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Child Advance Amount"
                    value={variant.advanceAmount?.child || ""}
                    onChange={(e) => handleChange(e, { main: "advanceAmount", sub: "child" }, null, null, null, variantIndex)}
                    className="p-3 border rounded"
                  />
                </div>

                {/* Variant Dynamic Arrays */}
                {["destination", "sightseeing", "includes", "excludes", "itinerary"].map((field) => (
                  <div key={field}>
                    <label className="block font-semibold capitalize mb-1">{field}</label>
                    {(variant[field] || []).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          value={item}
                          placeholder={`${field} ${index + 1}`}
                          className="w-full p-3 border rounded"
                          onChange={(e) => handleArrayChange(e, index, field, variantIndex)}
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                          onClick={() => removeField(field, index, variantIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() => addField(field, "", variantIndex)}
                    >
                      + Add {field}
                    </button>
                  </div>
                ))}

                {/* Variant Train & Flight */}
                {["trainDetails", "flightDetails"].map((type) => (
                  <div key={type}>
                    <label className="block font-semibold mb-1 capitalize">{type}</label>
                    {(variant[type] || []).map((detail, index) => (
                      <div key={index} className="mb-4 border p-3 rounded">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(detail).map(([key, value]) => (
                            <input
                              key={key}
                              type={key.toLowerCase().includes("date") ? "date" : "text"}
                              value={value}
                              placeholder={key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                              className="p-3 border w-full rounded"
                              onChange={(e) => handleChange(e, null, type, index, key, variantIndex)}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          className="bg-red-500 text-white px-3 py-2 mt-2 rounded text-sm"
                          onClick={() => removeTransportDetail(type, index, variantIndex)}
                        >
                          Remove {type === "trainDetails" ? "Train" : "Flight"}
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() => addTransportDetail(type, type === "trainDetails" ? defaultTrain : defaultFlight, variantIndex)}
                    >
                      + Add {type === "trainDetails" ? "Train" : "Flight"}
                    </button>
                  </div>
                ))}

                {/* Variant Boarding Points */}
                <div>
                  <label className="block font-semibold mb-1">Boarding Points</label>
                  {(variant.boardingPoints || []).map((bp, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Station code"
                        value={bp.stationCode || ""}
                        className="p-3 border w-1/3 rounded"
                        onChange={(e) => handleBoardingChange(e, index, "stationCode", variantIndex)}
                      />
                      <input
                        type="text"
                        placeholder="Station name"
                        value={bp.stationName || ""}
                        className="p-3 border flex-1 rounded"
                        onChange={(e) => handleBoardingChange(e, index, "stationName", variantIndex)}
                      />
                      <button
                        type="button"
                        className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                        onClick={() => removeBoardingField(index, variantIndex)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => addBoardingField(variantIndex)}
                  >
                    + Add Boarding Point
                  </button>
                </div>

                {/* Variant Deboarding Points */}
                <div>
                  <label className="block font-semibold mb-1">Deboarding Points</label>
                  {(variant.deboardingPoints || []).map((dp, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Station code"
                        value={dp.stationCode || ""}
                        className="p-3 border w-1/3 rounded"
                        onChange={(e) => handleDeboardingChange(e, index, "stationCode", variantIndex)}
                      />
                      <input
                        type="text"
                        placeholder="Station name"
                        value={dp.stationName || ""}
                        className="p-3 border flex-1 rounded"
                        onChange={(e) => handleDeboardingChange(e, index, "stationName", variantIndex)}
                      />
                      <button
                        type="button"
                        className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                        onClick={() => removeDeboardingField(index, variantIndex)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => addDeboardingField(variantIndex)}
                  >
                    + Add Deboarding Point
                  </button>
                </div>

                {/* Variant Add-ons */}
                <div>
                  <label className="block font-semibold mb-1">Add-ons</label>
                  {(variant.addons || []).map((addon, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Addon Name"
                        value={addon.name || ""}
                        className="p-3 border flex-1 rounded"
                        onChange={(e) => handleChange(e, null, "addons", index, "name", variantIndex)}
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={addon.amount || ""}
                        className="p-3 border w-32 rounded"
                        onChange={(e) => handleChange(e, null, "addons", index, "amount", variantIndex)}
                      />
                      <button
                        type="button"
                        className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                        onClick={() => removeTransportDetail("addons", index, variantIndex)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => addTransportDetail("addons", { name: "", amount: "" }, variantIndex)}
                  >
                    + Add Add-on
                  </button>
                </div>

                {/* Variant Remarks */}
                <div>
                  <label className="block font-semibold mb-1">Remarks</label>
                  <textarea
                    className="w-full p-3 border rounded"
                    placeholder="Enter remarks..."
                    value={variant.remarks || ""}
                    onChange={(e) => handleChange(e, "remarks", null, null, null, null, variantIndex)}
                  />
                </div>

                {/* Variant Last Booking Date */}
                <div>
                  <label className="block font-semibold mb-1">Last Booking Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded"
                    value={variant.lastBookingDate || ""}
                    onChange={(e) => handleChange(e, "lastBookingDate", null, null, null, variantIndex)}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
              onClick={addVariantPackage}
            >
              + Add Variant Package
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {loading ? "Creating Tour..." : "Save Changes"}
          </button>
        </form>

        {showBackConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Unsaved Changes
            </h2>
            <p className="text-gray-600 mb-6">
              You have unsaved changes.<br />
              Going back will reload the page and you will lose them.<br />
              Are you sure you want to go back?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setShowBackConfirm(false);
                  // Cancel → stay on page (push history again)
                  window.history.pushState(null, null, window.location.href);
                }}
                className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Cancel (Stay)
              </button>
              <button
                onClick={() => {
                  setShowBackConfirm(false);
                  // OK → allow back
                  history.back();
                }}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                OK (Go Back)
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Save Confirmation Popup */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                Confirm Save?
              </h2>

              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
                This will add a new tour.<br />
                Are you sure you want to continue?
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <button
                  onClick={cancelSubmit}
                  className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 active:bg-gray-400 transition text-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmSubmit}
                  disabled={loading}
                  className={`px-8 py-3 text-white rounded-xl font-medium text-lg transition-all ${loading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 active:bg-green-800"
                    }`}
                >
                  {loading ? "Saving..." : "Yes, Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AddTour;