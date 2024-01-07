import React, { useState, useEffect } from "react";
import { db, storage } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./ProfileDashboard.css";
import SignOutButton from "./SignOutButton";
import { useNavigate } from "react-router-dom";
import recordGif from "./record.gif"; // Adjust the path if necessary
import {
  BarLoader,
  DoubleBubble,
  SlidingPebbles,
  DoubleOrbit
} from "react-spinner-animated";

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
  const [resumeUrl, setResumeUrl] = useState(""); // State to store the URL of the resume
  const navigate = useNavigate();

  // To edit profile fields
  const [editMode, setEditMode] = useState({
    university: false,
    major: false,
    graduationYear: false,
    email: false,
    linkedIn: false,
  });

  const [editMajor, setMajor] = useState(major);
  const [editEmail, setEmail] = useState(email);
  const [editLinkedIn, setLinkedIn] = useState(linkedIn);

  // Handler to toggle edit mode
  const toggleEditMode = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  // Update fields in Firebase and local state
  const updateField = async (field, newValue) => {
    if (field !== "email") {
      // Prevent updating email
      const userDocRef = doc(db, "drafted-accounts", email);
      await updateDoc(userDocRef, { [field]: newValue });

      // Update local state
      switch (field) {
        case "major":
          setMajor(newValue);
          break;
        case "linkedIn":
          setLinkedIn(newValue);
          break;
        // ... handle other fields if necessary
      }

      toggleEditMode(field);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const storageRef = ref(storage, `resumes/${email}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const userDocRef = doc(db, "drafted-accounts", email);
        await updateDoc(userDocRef, { resume: downloadURL });

        setResumeUrl(downloadURL); // Update state with new resume URL
        console.log("Resume uploaded and Firestore updated.");
      } catch (error) {
        console.error("Error uploading resume:", error);
      }
    }
  };

  const handleViewResumeClick = (event) => {
    if (!resumeUrl) {
      // If resumeUrl is empty, display the message and prevent the default behavior
      event.preventDefault();
      alert("Upload resume first to view");
    }
  };

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

    const fetchResumeUrl = async () => {
      if (email) {
        const userDocRef = doc(db, "drafted-accounts", email);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().resume) {
          setResumeUrl(docSnap.data().resume);
        }
      }
    };

    fetchVideoUrl();
    fetchResumeUrl();
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
    const containerClass = url
      ? "video-container iframe-container"
      : "video-container";

    return (
      <div className={containerClass}>
        {url ? (
          <iframe
            src={url}
            frameBorder="0"
            allow="fullscreen"
            allowFullScreen
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              borderRadius: "8px",
            }}
          ></iframe>
        ) : (
          <img
            src={recordGif}
            alt="Default GIF"
            style={{
              width: "100%",
              height: "auto", // Adjust height automatically
              borderRadius: "8px",
            }}
          />
        )}
      </div>
    );
  };
  console.log(firstName);
  if(firstName == undefined || lastName == undefined){
   
      return (
        <div>
          <DoubleOrbit
            text={"Loading..."}
            bgColor={"#fff"}
            
            center={true}
            width={"150px"}
            height={"150px"}
          />
        </div>
      );
    
  }
  return (
    <div className="profile-dashboard">
      <div className="header-section">
        <h1 className="name">{`${firstName} ${lastName}`}</h1>
        <div className="university">{university}</div>
      </div>
      <div className="info-section">
        <div className="profile-field">
          <div className="field-label">
            <strong>Major</strong>
            <button
              className="edit-button"
              onClick={() => toggleEditMode("major")}
            >
              {editMode.major ? "Save" : "Edit"}
            </button>
          </div>
          {editMode.major ? (
            <input
              type="text"
              value={editMajor}
              onChange={(e) => setMajor(e.target.value)}
              onBlur={() => updateField("major", editMajor)}
            />
          ) : (
            <p>{editMajor}</p>
          )}
        </div>
        <div className="profile-field">
          <strong>Email</strong>
          <br></br>
          <p>{email}</p>
        </div>
        <div className="profile-field">
          <div className="field-label">
            <strong>LinkedIn</strong>
            <button
              className="edit-button"
              onClick={() => toggleEditMode("linkedIn")}
            >
              {editMode.linkedIn ? "Save" : "Edit"}
            </button>
          </div>
          {editMode.linkedIn ? (
            <input
              type="text"
              value={editLinkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              onBlur={() => updateField("linkedIn", editLinkedIn)}
            />
          ) : (
            <p>
              <a href={editLinkedIn} target="_blank" rel="noopener noreferrer">
                {editLinkedIn}
              </a>
            </p>
          )}
        </div>
      </div>
      <br></br>
      <div className="resume-section">
        <strong>Resume</strong>
        <div className="resume-actions">
          <a
            href={resumeUrl || "#"} // Use "#" if resumeUrl is empty
            target="_blank"
            rel="noopener noreferrer"
            className="view-resume-link"
            onClick={handleViewResumeClick} // Attach the click handler
          >
            View Resume {/* Always keep the link text as "View Resume" */}
          </a>
          <input
            type="file"
            id="resume-upload"
            style={{ display: "none" }}
            onChange={handleResumeUpload}
          />
          <button
            onClick={() => document.getElementById("resume-upload").click()}
            className="edit-button"
          >
            {resumeUrl ? "Edit Resume" : "Upload Resume"}{" "}
            {/* Conditional button label */}
          </button>
        </div>
      </div>
      <strong>Message from Founders</strong>
      <hr />
      <p>Hi {firstName}, welcome to Drafted! 😊</p>
      <p>
        Talk to us as if we were a friend, and we'll land you jobs. Simple as
        that.
      </p>
      <p>
        Our mission is to prove job searching can be fun, and have recruiters
        come to you.
      </p>
      <p>Take a breath, be yourself.</p>
      <p>Happy Drafting!</p>
      <p>
        <i>— Andrew and Rodrigo</i>
      </p>
      <div className="video-resumes">
        <strong>Video Resume</strong>
        <hr />
        <div className="video-section">
          <h3>🗺 Tell us your story</h3>
          <div>
            <br></br>
          </div>
          <br></br>
          <VideoPlayer url={videoUrl} />
          <button className="record-button" onClick={handleRecordClick}>
            Record
          </button>
        </div>
        <div className="video-section">
          <h3>🪄 What makes you stand out amongst other candidates?</h3>
          <br></br>
          <div>
            <br></br>
          </div>
          <VideoPlayer url={videoUrl2} />
          <button className="record-button" onClick={handleRecordClick2}>
            Record
          </button>
        </div>
        <div className="video-section">
          <h3>🧗 Tell us about a time when you overcame a challenge</h3>
          <br></br>
          <div>
            <br></br>
          </div>
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
