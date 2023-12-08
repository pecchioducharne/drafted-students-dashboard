import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Firestore instance
import ProfileDashboard from "./ProfileDashboard";
import Login from "./Login"; // Assuming you've created this component
import { auth } from "./firebase"; // Import Firebase auth from your firebase.js file
import VideoRecorderPage from "./VideoRecorderPage"; // Import the VideoRecorderPage component
import VideoRecorderPage2 from "./VideoRecorderPage2"; // Import the VideoRecorderPage component
import VideoRecorderPage3 from "./VideoRecorderPage3"; // Import the VideoRecorderPage component
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import BrowserRouter, Route, and Switch from react-router-dom

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // State to hold user profile data

  // Firebase Authentication listener to check if the user is logged in
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is logged in
      setIsLoggedIn(true);
    } else {
      // User is not logged in
      setIsLoggedIn(false);
      setUserProfile(null); // Reset user profile when logged out
    }
  });

  useEffect(() => {
    if (isLoggedIn && auth.currentUser) {
      const fetchUserData = async () => {
        const uid = auth.currentUser.email; // Assuming email is the document ID
        const userRef = doc(db, "drafted-accounts", uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserProfile(userData); // Set state with user data
        } else {
          console.log("No such document!");
          setUserProfile(null); // Reset user profile if not found
        }
      };

      fetchUserData();
    }
  }, [isLoggedIn]);

  return (
    <Router>
      {/* Wrap your app with Router */}
      <div className="App">
        <h1
          style={{
            fontWeight: "2500",
            paddingLeft: "50px",
            marginLeft: "10px",
          }}
        >
          drafted<span style={{ color: "#53ad7a" }}> beta</span>
          <span style={{ color: "black" }}>.</span>
        </h1>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/video-recorder" element={<VideoRecorderPage />} />
          <Route path="/video-recorder2" element={<VideoRecorderPage2 />} />
          <Route path="/video-recorder3" element={<VideoRecorderPage3 />} />
          <Route 
            path="/" 
            element={
              isLoggedIn ? (
                userProfile ? (
                  <ProfileDashboard {...userProfile} />
                ) : (
                  <div>Loading user profile...</div>
                )
              ) : (
                <Login />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
