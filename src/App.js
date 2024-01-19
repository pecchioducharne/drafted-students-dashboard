import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import ProfileDashboard from "./ProfileDashboard";
import Login from "./Login";
import VideoRecorderPage from "./VideoRecorderPage";
import VideoRecorderPage2 from "./VideoRecorderPage2";
import VideoRecorderPage3 from "./VideoRecorderPage3";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  auth.onAuthStateChanged((user) => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUserProfile(null);
    }
  });

  useEffect(() => {
    if (isLoggedIn && auth.currentUser) {
      const fetchUserData = async () => {
        const uid = auth.currentUser.email;
        const userRef = doc(db, "drafted-accounts", uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserProfile(userData);
        } else {
          console.log("No such document!");
          setIsLoggedIn(false); // Log out the user
        }
      };

      fetchUserData();
    }
  }, [isLoggedIn]);

  return (
    <Router>
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
            path="/dashboard"
            element={<ProfileDashboard {...userProfile} />}
          />
          <Route path="*" element={<Login />} />{" "}
          {/* This will match any other URL */}
        </Routes>
        {!isLoggedIn && <Navigate to="/login" />}{" "}
        {/* Redirect if not logged in */}
      </div>
    </Router>
  );
}

export default App;
