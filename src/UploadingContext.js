import React, { createContext, useContext, useState } from "react";

// UploadingContext.js

const UploadingContext = createContext();

export const useUploadingContext = () => useContext(UploadingContext);

export const UploadingProvider = ({ children }) => {
  const [isUploadingVideo1, setIsUploadingVideo1] = useState(false);
  const [isUploadingVideo2, setIsUploadingVideo2] = useState(false);
  const [isUploadingVideo3, setIsUploadingVideo3] = useState(false);

  return (
    <UploadingContext.Provider
      value={{
        isUploadingVideo1,
        setIsUploadingVideo1,
        isUploadingVideo2,
        setIsUploadingVideo2,
        isUploadingVideo3,
        setIsUploadingVideo3,
      }}
    >
      {children}
    </UploadingContext.Provider>
  );
};
