import React, { createContext, useContext, useState, useEffect } from "react";

const UploadingContext = createContext();

export const useUploadingContext = () => useContext(UploadingContext);

export const UploadingProvider = ({ children }) => {
  const [isUploadingVideo1, setIsUploadingVideo1] = useState(false);
  const [isUploadingVideo2, setIsUploadingVideo2] = useState(false);
  const [isUploadingVideo3, setIsUploadingVideo3] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || null);
  const [userPassword, setUserPassword] = useState(localStorage.getItem("userPassword") || null);

  useEffect(() => {
    // Store email and password in localStorage
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("userPassword", userPassword);
  }, [userEmail, userPassword]);

  const updateUserCredentials = (email, password) => {
    setUserEmail(email);
    setUserPassword(password);
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
        userPassword,
        updateUserCredentials,
      }}
    >
      {children}
    </UploadingContext.Provider>
  );
};
