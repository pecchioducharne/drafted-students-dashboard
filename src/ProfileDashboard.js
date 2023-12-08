import React, { useState, useEffect } from "react";
import { db } from "./firebase"; // Assuming db is your Firestore instance
import { doc, getDoc } from "firebase/firestore";
import "./ProfileDashboard.css"; // Importing CSS
import SignOutButton from './SignOutButton'; // Import the SignOutButton component
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ProfileDashboard = ({
  firstName, // Receive firstName
  lastName, // Receive lastName
  university,
  major,
  graduationYear,
  email,
  linkedIn,
}) => {
  const [videoUrl, setVideoUrl] = useState(""); // State to hold the video URL
  const [videoUrl2, setVideoUrl2] = useState(""); // State to hold the video URL
  const [videoUrl3, setVideoUrl3] = useState(""); // State to hold the video URL

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (email) {
        const userDocRef = doc(db, "drafted-accounts", email);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setVideoUrl(userData.video1); // Update state with the fetched video URL
          setVideoUrl2(userData.video2); // Update state with the fetched video URL
          setVideoUrl3(userData.video3); // Update state with the fetched video URL
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchVideoUrl();
  }, [email]); // Re-run when email changes

  const handleRecordClick = () => {
    console.log("Navigating to recorder 1");
    navigate("/video-recorder");
  }

  const handleRecordClick2 = () => {
    console.log("Navigating to recorder 2");
    navigate("/video-recorder2");
  }

  const handleRecordClick3 = () => {
    console.log("Navigating to recorder 3");
    navigate("/video-recorder3");
  }

  const VimeoEmbed = ({ url }) => {
    return (
      <div className="video-container">
        <iframe
          src={url || "https://player.vimeo.com/video/866056413"} // Fallback URL if no videoUrl is available
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
          style={{ width: "100%", height: "100%", borderRadius: "8px" }}
        ></iframe>
      </div>
    );
  };

  return (
    <div className="profile-dashboard">
      <div className="header-section">
        <h1 className="name">{`${firstName} ${lastName}`}</h1>{" "}
        <div className="university">{university}</div>
      </div>
      <div className="info-section">
        <div className="profile-field">
          <strong>Major</strong>
          <p>{major}</p>
        </div>
        <div className="profile-field">
          <strong>Graduation Year</strong>
          <p>{graduationYear}</p>
        </div>
        <div className="profile-field">
          <strong>Email</strong>
          <p>{email}</p>
        </div>
        <div className="profile-field">
          <strong>LinkedIn</strong>
          <p>
            <a href={linkedIn} target="_blank" rel="noopener noreferrer">
              {linkedIn}
            </a>{" "}
            {/* Make LinkedIn URL clickable */}
          </p>
        </div>
      </div>
      <strong>Message from Founders</strong>
      <hr />
      <h3>Hi {firstName}, welcome to Drafted! 😊</h3>
      <h4>Talk to us as if we were a friend, and we'll land you jobs. Simple as that.</h4>
      <h4>Our mission is to prove job searching can be fun, and have recruiters come to you.</h4>
      <h4>Take a breath, be yourself.</h4>
      <h4>Happy Drafting!</h4>
      <h4>— Andrew and Rodrigo</h4>
      <div className="video-resumes">
        <strong>Video Resume</strong>
        <hr />

        <div className="video-section">
          <h3>🗺 Tell us your story</h3>
          <VimeoEmbed url={videoUrl} />
          <button className="record-button" onClick={handleRecordClick}>Record</button>
        </div>

        <div className="video-section">
          <h3>
            🪄 What makes you stand out amongst other candidates?
          </h3>
          <VimeoEmbed url={videoUrl2} />
          <button className="record-button" onClick={handleRecordClick2}>Record</button>
        </div>

        <div className="video-section">
          <h3>
            🧗 Tell us about a time when you overcame a challenge
          </h3>
          <VimeoEmbed url={videoUrl3} />
          <button className="record-button" onClick={handleRecordClick3}>Record</button>
        </div>
      </div>
      <SignOutButton />
    </div>
  );
};

export default ProfileDashboard;
