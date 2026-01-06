/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { createContext } from "react";
export const TourAppContext = createContext();
const TourAppContextProvider = (props) => {
  const currency = "₹";

  const value = {
    currency,
  };
  return (
    <TourAppContext.Provider value={value}>
      {props.children}
    </TourAppContext.Provider>
  );
};

export default TourAppContextProvider;
