// import React, { useState, useContext } from "react";
// import axios from "axios";
// import { AdminContext } from "../../context/AdminContext";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { TourAdminContext } from "../../context/TourAdminContext";

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

//   const initialForm = {
//     title: "",
//     email: "",
//     password: "",
//     batch: "",
//     duration: { days: "", nights: "" },
//     price: { doubleSharing: "", tripleSharing: "" },
//     advanceAmount: "",
//     destination: [""],
//     sightseeing: [""],
//     itinerary: [""],
//     includes: [""],
//     excludes: [""],
//     trainDetails: [defaultTrain],
//     flightDetails: [defaultFlight],
//     lastBookingDate: "",
//     completedTripsCount: "",
//     addons: [{ name: "", amount: "" }], // NEW
//   };

//   const [formData, setFormData] = useState(initialForm);
//   const [images, setImages] = useState({
//     titleImage: null,
//     mapImage: null,
//     galleryImages: [],
//   });

//   const handleChange = (
//     e,
//     field,
//     nestedField = null,
//     index = null,
//     subField = null
//   ) => {
//     const value = e.target.value;
//     if (nestedField && index !== null) {
//       setFormData((prev) => {
//         const updated = [...prev[nestedField]];
//         updated[index][subField] = value;
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
//   const handleAddonChange = (e, index, field) => {
//     const value = e.target.value;
//     setFormData((prev) => {
//       const updated = [...prev.addons];
//       updated[index][field] = value;
//       return { ...prev, addons: updated };
//     });
//   };

//   const addAddonField = () => {
//     setFormData((prev) => ({
//       ...prev,
//       addons: [...prev.addons, { name: "", amount: "" }],
//     }));
//   };

//   const handleArrayChange = (e, index, field) => {
//     const value = e.target.value;
//     setFormData((prev) => {
//       const updated = [...prev[field]];
//       updated[index] = value;
//       return { ...prev, [field]: updated };
//     });
//   };

//   const addField = (field, template = "") => {
//     setFormData((prev) => ({ ...prev, [field]: [...prev[field], template] }));
//   };

//   const addTransportDetail = (field, template) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: [...prev[field], { ...template }],
//     }));
//   };

//   const handleImageChange = (e, field) => {
//     if (field === "galleryImages") {
//       setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
//     } else {
//       setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const data = new FormData();

//       data.append("title", formData.title);
//       data.append("email", formData.email);
//       data.append("password", formData.password);
//       data.append("batch", formData.batch);

//       data.append("duration", JSON.stringify(formData.duration));
//       data.append("price", JSON.stringify(formData.price));
//       data.append("advanceAmount", formData.advanceAmount);
//       data.append("destination", JSON.stringify(formData.destination));
//       data.append("sightseeing", JSON.stringify(formData.sightseeing));
//       data.append("itinerary", JSON.stringify(formData.itinerary));
//       data.append("includes", JSON.stringify(formData.includes));
//       data.append("excludes", JSON.stringify(formData.excludes));
//       data.append("trainDetails", JSON.stringify(formData.trainDetails));
//       data.append("flightDetails", JSON.stringify(formData.flightDetails));
//       data.append("lastBookingDate", formData.lastBookingDate);
//       data.append("completedTripsCount", formData.completedTripsCount);
//       data.append("addons", JSON.stringify(formData.addons));

//       if (images.titleImage) data.append("titleImage", images.titleImage);
//       if (images.mapImage) data.append("mapImage", images.mapImage);
//       images.galleryImages.forEach((img) => data.append("galleryImages", img));

//       const res = await axios.post(
//         `${backendUrl}/api/touradmin/add-tour`,
//         data,
//         {
//           headers: {
//             aToken,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       if (res.data.success) {
//         toast.success("Tour added successfully!");
//         setFormData(initialForm);
//         setImages({ titleImage: null, mapImage: null, galleryImages: [] });
//       } else {
//         toast.error("Failed to add tour: " + res.data.message);
//       }
//     } catch (error) {
//       console.error("Submission Error:", error);
//       toast.error("Something went wrong while submitting the tour.");
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <ToastContainer position="top-right" autoClose={9200} />
//       <h1 className="text-2xl font-bold mb-6">Add New Tour</h1>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <input
//           type="text"
//           placeholder="Title"
//           className="w-full p-3 border"
//           value={formData.title}
//           onChange={(e) => handleChange(e, "title")}
//         />
//         <input
//           type="email"
//           placeholder="Tour Login Email"
//           className="w-full p-3 border"
//           value={formData.email}
//           onChange={(e) => handleChange(e, "email")}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full p-3 border"
//           value={formData.password}
//           onChange={(e) => handleChange(e, "password")}
//         />

//         <div>
//           <div className="flex-1 flex flex-col gap-1">
//             <p>Speciality</p>
//             <select
//               onChange={(e) => handleChange(e, "batch")} // Corrected line
//               value={formData.batch}
//               className="border rounded px-3 py-2"
//               name=""
//               id=""
//             >
//               <option value="Spritual Plus Sightseeing">
//                 Select tour category
//               </option>
//               <option value="Devotional">Devotional</option>
//               <option value="Religious ">Relegious</option>
//               <option value="Honeymoon">Honeymoon</option>
//               <option value="Jolly">Jolly</option>
//               <option value="Spritual">Spritual</option>
//               <option value="Spritual+Sightseeing">
//                 Spritual + Sightseeing
//               </option>
//             </select>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <input
//             type="number"
//             placeholder="Days"
//             className="p-3 border"
//             value={formData.duration.days}
//             onChange={(e) => handleChange(e, { main: "duration", sub: "days" })}
//           />
//           <input
//             type="number"
//             placeholder="Nights"
//             className="p-3 border"
//             value={formData.duration.nights}
//             onChange={(e) =>
//               handleChange(e, { main: "duration", sub: "nights" })
//             }
//           />
//         </div>

//         <div className="grid grid-cols-3 gap-4">
//           <input
//             type="number"
//             placeholder="Advance Amount"
//             className="p-3 border"
//             value={formData.advanceAmount}
//             onChange={(e) => handleChange(e, "advanceAmount")}
//           />
//           <input
//             type="number"
//             placeholder="Double Sharing Price"
//             className="p-3 border"
//             value={formData.price.doubleSharing}
//             onChange={(e) =>
//               handleChange(e, { main: "price", sub: "doubleSharing" })
//             }
//           />
//           <input
//             type="number"
//             placeholder="Triple Sharing Price"
//             className="p-3 border"
//             value={formData.price.tripleSharing}
//             onChange={(e) =>
//               handleChange(e, { main: "price", sub: "tripleSharing" })
//             }
//           />
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
//             {formData[field].map((item, index) => (
//               <input
//                 key={index}
//                 value={item}
//                 placeholder={`${field} ${index + 1}`}
//                 className="w-full mb-2 p-3 border"
//                 onChange={(e) => handleArrayChange(e, index, field)}
//               />
//             ))}
//             <button
//               type="button"
//               className="bg-blue-500 text-white px-4 py-1 rounded"
//               onClick={() => addField(field, "")}
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
//             {formData[type].map((detail, index) => (
//               <div key={index} className="grid grid-cols-2 gap-3 mb-4">
//                 {Object.entries(detail).map(([key, value]) => (
//                   <input
//                     key={key}
//                     type={key.toLowerCase().includes("date") ? "date" : "text"}
//                     value={value}
//                     placeholder={key}
//                     className="p-3 border"
//                     onChange={(e) => handleChange(e, null, type, index, key)}
//                   />
//                 ))}
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
//             >
//               + Add {type === "trainDetails" ? "Train" : "Flight"}
//             </button>
//           </div>
//         ))}
//         <label className="block font-semibold mb-1">
//           Package Last booking date
//         </label>
//         <input
//           type="date"
//           className="w-full p-3 border"
//           value={formData.lastBookingDate}
//           onChange={(e) => handleChange(e, "lastBookingDate")}
//         />
//         <input
//           type="number"
//           className="w-full p-3 border"
//           placeholder="Completed Trips Count"
//           value={formData.completedTripsCount}
//           onChange={(e) => handleChange(e, "completedTripsCount")}
//         />

//         <div className="space-y-4">
//           {/* Title Image */}
//           <div>
//             <label className="block font-semibold mb-1">Title Image</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, "titleImage")}
//               className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//             />
//             {images.titleImage && (
//               <p className="text-green-600 mt-1">
//                 Selected: {images.titleImage.name}
//               </p>
//             )}
//           </div>

//           {/* Map Image */}
//           <div>
//             <label className="block font-semibold mb-1">Map Image</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => handleImageChange(e, "mapImage")}
//               className="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
//             />
//             {images.mapImage && (
//               <p className="text-green-600 mt-1">
//                 Selected: {images.mapImage.name}
//               </p>
//             )}
//           </div>

//           {/* Gallery Images */}
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
//           <label className="block font-semibold capitalize mb-1">Add-ons</label>
//           {formData.addons.map((addon, index) => (
//             <div key={index} className="grid grid-cols-2 gap-3 mb-2">
//               <input
//                 type="text"
//                 placeholder="Addon Name"
//                 value={addon.name}
//                 className="p-3 border"
//                 onChange={(e) => handleAddonChange(e, index, "name")}
//               />
//               <input
//                 type="number"
//                 placeholder="Addon Amount"
//                 value={addon.amount}
//                 className="p-3 border"
//                 onChange={(e) => handleAddonChange(e, index, "amount")}
//               />
//             </div>
//           ))}
//           <button
//             type="button"
//             className="bg-blue-500 text-white px-4 py-1 rounded"
//             onClick={addAddonField}
//           >
//             + Add Add-on
//           </button>
//         </div>

//         <button
//           type="submit"
//           className="bg-green-600 text-white px-6 py-2 rounded shadow"
//         >
//           Submit Tour
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddTour;

import React, { useState, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TourAdminContext } from "../../context/TourAdminContext";

const AddTour = () => {
  const { backendUrl, aToken } = useContext(TourAdminContext);

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
    email: "",
    password: "",
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
    boardingPoints: [defaultBoardingPoint],
    remarks: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState({
    titleImage: null,
    mapImage: null,
    galleryImages: [],
  });

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
  const removeAddonField = (index) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
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
  const removeBoardingField = (index) => {
    setFormData((prev) => ({
      ...prev,
      boardingPoints: prev.boardingPoints.filter((_, i) => i !== index),
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
  const removeField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addTransportDetail = (field, template) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { ...template }],
    }));
  };
  const removeTransportDetail = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e, field) => {
    if (field === "galleryImages") {
      setImages((prev) => ({ ...prev, [field]: [...e.target.files] }));
    } else {
      setImages((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      Object.entries({
        title: formData.title,
        email: formData.email,
        password: formData.password,
        batch: formData.batch,
        duration: JSON.stringify(formData.duration),
        price: JSON.stringify(formData.price),
        advanceAmount: formData.advanceAmount,
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
        remarks: formData.remarks,
      }).forEach(([key, value]) => data.append(key, value));

      if (images.titleImage) data.append("titleImage", images.titleImage);
      if (images.mapImage) data.append("mapImage", images.mapImage);
      images.galleryImages.forEach((img) => data.append("galleryImages", img));

      console.log("FormData being sent:", formData);

      const res = await axios.post(
        `${backendUrl}/api/touradmin/add-tour`,
        data,
        { headers: { aToken, "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        toast.success("Tour added successfully!");
        setFormData(initialForm);
        setImages({ titleImage: null, mapImage: null, galleryImages: [] });
      } else {
        toast.error("Failed to add tour: " + res.data.message);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Something went wrong while submitting the tour.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer position="top-right" autoClose={9200} />
      <h1 className="text-2xl font-bold mb-6">Add New Tour</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC DETAILS */}
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 border"
          value={formData.title}
          onChange={(e) => handleChange(e, "title")}
        />
        <input
          type="email"
          placeholder="Tour Login Email"
          className="w-full p-3 border"
          value={formData.email}
          onChange={(e) => handleChange(e, "email")}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border"
          value={formData.password}
          onChange={(e) => handleChange(e, "password")}
        />
        <div>
          <label className="block font-semibold mb-1">
            Tour Category (Batch)
          </label>
          <select
            className="w-full p-3 border"
            value={formData.batch}
            onChange={(e) => handleChange(e, "batch")}
            required
          >
            <option value="">Select tour category</option>
            <option value="Devotional">Devotional</option>
            <option value="Religious">Religious</option>
            <option value="Honeymoon">Honeymoon</option>
            <option value="Jolly">Jolly</option>
            <option value="Spritual">Spritual</option>
            <option value="Spritual+Sightseeing">Spritual + Sightseeing</option>
          </select>
        </div>
        {/* DURATION & PRICE */}
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

        {/* DYNAMIC ARRAYS */}
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
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  value={item}
                  placeholder={`${field} ${index + 1}`}
                  className="w-full p-3 border"
                  onChange={(e) => handleArrayChange(e, index, field)}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 rounded"
                  onClick={() => removeField(field, index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-1 rounded"
              onClick={() => addField(field)}
            >
              + Add {field}
            </button>
          </div>
        ))}

        {/* TRAIN & FLIGHT DETAILS */}
        {["trainDetails", "flightDetails"].map((type) => (
          <div key={type}>
            <label className="block font-semibold mb-1 capitalize">
              {type}
            </label>
            {formData[type].map((detail, index) => (
              <div key={index} className="mb-4 border p-3 rounded">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(detail).map(([key, value]) => (
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
                  ))}
                </div>
                <button
                  type="button"
                  className="bg-red-500 text-white px-3 mt-2 rounded"
                  onClick={() => removeTransportDetail(type, index)}
                >
                  Remove {type === "trainDetails" ? "Train" : "Flight"}
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
            >
              + Add {type === "trainDetails" ? "Train" : "Flight"}
            </button>
          </div>
        ))}

        {/* BOARDING POINTS */}
        <div>
          <label className="block font-semibold mb-1">Boarding Points</label>
          {formData.boardingPoints.map((bp, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                placeholder="Station code (eg., MAS)"
                value={bp.stationCode}
                className="p-3 border"
                onChange={(e) => handleBoardingChange(e, index, "stationCode")}
              />
              <input
                type="text"
                placeholder="Station name (eg., MGR Chennai central)"
                value={bp.stationName}
                className="p-3 border"
                onChange={(e) => handleBoardingChange(e, index, "stationName")}
              />
              <button
                type="button"
                className="bg-red-500 text-white px-3 mt-2 rounded"
                onClick={() => removeBoardingField(index)}
              >
                Remove
              </button>
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

        {/* REMARKS */}
        <div>
          <label className="block font-semibold mb-1">Remarks</label>
          <textarea
            className="w-full p-3 border"
            placeholder="Enter remarks..."
            value={formData.remarks}
            onChange={(e) => handleChange(e, "remarks")}
          />
        </div>

        {/* IMAGES */}
        {/* <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Title Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "titleImage")}
              className="block w-full text-sm text-gray-700 border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Map Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "mapImage")}
              className="block w-full text-sm text-gray-700 border rounded p-2"
            />
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
              className="block w-full text-sm text-gray-700 border rounded p-2"
            />
          </div>
        </div> */}

        {/* IMAGES */}
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
              <ul className="text-green-600 mt-1 list-disc pl-5">
                <li>{images.titleImage.name}</li>
              </ul>
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
              <ul className="text-green-600 mt-1 list-disc pl-5">
                <li>{images.mapImage.name}</li>
              </ul>
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
            {images.galleryImages?.length > 0 && (
              <ul className="text-green-600 mt-1 list-disc pl-5">
                {images.galleryImages.map((img, idx) => (
                  <li key={idx}>{img.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ADDONS */}
        <div>
          <label className="block font-semibold mb-1">Add-ons</label>
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
              <button
                type="button"
                className="bg-red-500 text-white px-3 mt-2 rounded"
                onClick={() => removeAddonField(index)}
              >
                Remove
              </button>
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

        {/* LAST BOOKING DATE */}
        <div>
          <label className="block font-semibold mb-1">Last Booking Date</label>
          <input
            type="date"
            className="w-full p-3 border"
            value={formData.lastBookingDate}
            onChange={(e) => handleChange(e, "lastBookingDate")}
          />
        </div>

        {/* COMPLETED TRIPS COUNT */}
        <div>
          <label className="block font-semibold mb-1">
            Completed Trips Count
          </label>
          <input
            type="number"
            className="w-full p-3 border"
            placeholder="Enter number of completed trips"
            value={formData.completedTripsCount}
            onChange={(e) => handleChange(e, "completedTripsCount")}
          />
        </div>

        {/* Remaining form stays same... */}
        {/* Include your existing DURATION, PRICE, DESTINATION, TRAIN/FLIGHT, BOARDING, REMARKS, IMAGES, ADDONS sections here */}

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded shadow"
        >
          Submit Tour
        </button>
      </form>
    </div>
  );
};

export default AddTour;
