import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import ProfileDashboard from "./ProfileDashboard";
import Login from "./Login";
import VideoRecorderPage from "./VideoRecorderPage";
import VideoRecorderPage2 from "./VideoRecorderPage2";
import VideoRecorderPage3 from "./VideoRecorderPage3";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { UploadingProvider } from "./UploadingContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is logged in
        setIsLoggedIn(true);
        await fetchUserData(user.email);
      } else {
        // User is not logged in
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (email) => {
    const userRef = doc(db, "drafted-accounts", email);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUserProfile(userData);
    } else {
      console.log("No such document!");
      setIsLoggedIn(false); // Set isLoggedIn to false if user document doesn't exist
    }
  };

  return (
    <Router>
      <div className="App">
        <UploadingProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/video-recorder1" element={<VideoRecorderPage />} />
            <Route path="/video-recorder2" element={<VideoRecorderPage2 />} />
            <Route path="/video-recorder3" element={<VideoRecorderPage3 />} />
            <Route
              path="/dashboard"
              element={<ProfileDashboard {...userProfile} />}
            />
            <Route
              path="*"
              element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </UploadingProvider>
      </div>
    </Router>
  );
}

export default App;
