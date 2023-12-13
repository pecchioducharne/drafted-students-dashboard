import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import "./ProfileDashboard.css";
import SignOutButton from "./SignOutButton";
import { useNavigate } from "react-router-dom";

const ProfileDashboard = ({
  firstName,
  lastName,
  university,
  major,
  graduationYear,
  email,
  linkedIn,
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoUrl2, setVideoUrl2] = useState("");
  const [videoUrl3, setVideoUrl3] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (email) {
        const userDocRef = doc(db, "drafted-accounts", email);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setVideoUrl(userData.video1);
          setVideoUrl2(userData.video2);
          setVideoUrl3(userData.video3);
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchVideoUrl();
  }, [email]);

  const handleRecordClick = () => {
    navigate("/video-recorder");
  };

  const handleRecordClick2 = () => {
    navigate("/video-recorder2");
  };

  const handleRecordClick3 = () => {
    navigate("/video-recorder3");
  };

  const VideoPlayer = ({ url }) => {
    return (
      <div className="video-container">
        <iframe
          src={
            url ||
            "https://www.youtube.com/embed/67jbwmPQyxg?autoplay=1&controls=0&showinfo=0&autohide=1&mute=1"
          }
          frameBorder="0"
          allow="fullscreen"
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "8px",
          }}
        ></iframe>
      </div>
    );
  };

  return (
    <div className="profile-dashboard">
      <div className="header-section">
        <h1 className="name">{`${firstName} ${lastName}`}</h1>
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
            </a>
          </p>
        </div>
      </div>
      <strong>Message from Founders</strong>
      <hr />
      <h3>Hi {firstName}, welcome to Drafted! 😊</h3>
      <h4>
        Talk to us as if we were a friend, and we'll land you jobs. Simple as
        that.
      </h4>
      <h4>
        Our mission is to prove job searching can be fun, and have recruiters
        come to you.
      </h4>
      <h4>Take a breath, be yourself.</h4>
      <h4>Happy Drafting!</h4>
      <h4>— Andrew and Rodrigo</h4>
      <div className="video-resumes">
        <strong>Video Resume</strong>
        <hr />
        <div className="video-section">
          <h3>🗺 Tell us your story</h3>
          <VideoPlayer url={videoUrl} />
          <button className="record-button" onClick={handleRecordClick}>
            Record
          </button>
        </div>
        <div className="video-section">
          <h3>🪄 What makes you stand out amongst other candidates?</h3>
          <VideoPlayer url={videoUrl2} />
          <button className="record-button" onClick={handleRecordClick2}>
            Record
          </button>
        </div>
        <div className="video-section">
          <h3>🧗 Tell us about a time when you overcame a challenge</h3>
          <VideoPlayer url={videoUrl3} />
          <button className="record-button" onClick={handleRecordClick3}>
            Record
          </button>
        </div>
      </div>
      <div className="sign-out-button-container">
        <SignOutButton />
      </div>
    </div>
  );
};

export default ProfileDashboard;
