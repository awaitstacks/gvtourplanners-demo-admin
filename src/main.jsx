import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

import TourApp from "./TourApp.jsx";

import TourAppContextProvider from "./context/TourAppContext.jsx";
import TourContextProvider from "./context/TourContext.jsx";
import TourAdminContextProvider from "./context/TourAdminContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <TourAdminContextProvider>
      <TourContextProvider>
        <TourAppContextProvider>
          <TourApp />
        </TourAppContextProvider>
      </TourContextProvider>
    </TourAdminContextProvider>
  </BrowserRouter>
);
