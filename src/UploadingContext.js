import React, { createContext, useContext, useState } from "react";

const UploadingContext = createContext();

export const useUploadingContext = () => useContext(UploadingContext);

export const UploadingProvider = ({ children }) => {
  const [isUploadingVideo1, setIsUploadingVideo1] = useState(false);
  const [isUploadingVideo2, setIsUploadingVideo2] = useState(false);
  const [isUploadingVideo3, setIsUploadingVideo3] = useState(false);
  const [userEmail, setUserEmail] = useState(null); // State to store user's email

  const updateUserEmail = (email) => {
    setUserEmail(email);
  };

  return (
    <UploadingContext.Provider
      value={{
        isUploadingVideo1,
        setIsUploadingVideo1,
        isUploadingVideo2,
        setIsUploadingVideo2,
        isUploadingVideo3,
        setIsUploadingVideo3,
        userEmail,
        updateUserEmail,
      }}
    >
      {children}
    </UploadingContext.Provider>
  );
};
