import React, { useState, useEffect } from "react";
import { db, storage, auth } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./ProfileDashboard.css";
import SignOutButton from "./SignOutButton";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import recordGif from "./record.gif"; // Adjust the path if necessary
import logoAmazon from "./logo-amazon.png";
import logoGotu from "./logo-gotu.png";
import logoJPMorgan from "./logo-jpmorgan.png";
import logoLula from "./logo-lula.png";
import getDraftedScreenshot from "./get-drafted.png";
import speechBubble from "./speech-bubble.png";
import linkedInIcon from "./linkedin.svg";
import profileGif from "./profile.gif";
import {
  BarLoader,
  DoubleBubble,
  SlidingPebbles,
  DoubleOrbit,
} from "react-spinner-animated";
import ReactGA4 from "react-ga4";
import Lottie from "react-lottie";
import animationData from "./profile-lottie.json"; // Adjust the path as necessary
import fireAnimationData from "./fire.json"; // Adjust the path as necessary
import bottleAnimationData from "./bottle.json"; // Adjust the path as necessary
import challengeAnimationData from "./challenge.json"; // Adjust the path as necessary

const ProfileDashboard = ({
  firstName,
  lastName,
  university,
  major,
  graduationMonth,
  graduationYear,
  email,
  linkedInURL,
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoUrl2, setVideoUrl2] = useState("");
  const [videoUrl3, setVideoUrl3] = useState("");
  const [resumeUrl, setResumeUrl] = useState(""); // State to store the URL of the resume
  const [showPopup, setShowPopup] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false); // Add a state for sign out loading
  const [showFoundersMessage, setShowFoundersMessage] = useState(false); // State to control the visibility of the founders' message
  const [showFoundersPopup, setShowFoundersPopup] = useState(false); // State for founders' popup
  const navigate = useNavigate();
  ReactGA4.initialize("G-3M4KL5NDYG");

  // Popup Modal Component
  const PopupModal = () => {
    if (!showPopup) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button onClick={() => setShowPopup(false)}>Close</button>
          <h2>🚀 Why Record Video Resumes?</h2>
          <h3>In three quick questions, you can create your video resume and grab
            the attention of employers.</h3>
          <h3>Get connected to startups and brand-name companies</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <img
              src={logoLula}
              alt="Lula"
              style={{ maxWidth: "100px", height: "auto" }}
            />
            {/* <img
                      src={logoAmazon}
                      alt="Amazon"
                      style={{ maxWidth: "100px", height: "auto" }}
                    /> */}
            <img
              src={logoGotu}
              alt="Gotu"
              style={{ maxWidth: "100px", height: "auto" }}
            />
            <img
              src={logoJPMorgan}
              alt="JPMorgan"
              style={{ maxWidth: "100px", height: "auto" }}
            />
          </div>
          <h3>
            With a single video resume, you'll be visible to every employer on
            Drafted
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <img
              src={getDraftedScreenshot}
              alt="Lula"
              style={{ maxWidth: "200px", height: "auto" }}
            />
          </div>
          <p>
            <h4>Each question gives you up to a minute to show off your skills and
            personality.</h4>
            <h4>Don't fret about the pressure – you can redo each answer until you
            feel confident in your responses.</h4>
          </p>
          <br />
        </div>
      </div>
    );
  };

  // Founders Message Popup Modal Component
  const FoundersMessagePopup = () => {
    if (!showFoundersPopup) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button onClick={() => setShowFoundersPopup(false)}>Close</button>
          <h1>Hey {firstName}, welcome to Drafted! 😊</h1>
          <p>
            <strong>Our mission is to prove job searching can be fun,</strong>{" "}
            and much like the draft for a professional sports league, we believe
            top employers should compete for the best graduates of each class.
            Rather than having job seekers apply to roles for months on end.
          </p>
          <p>
            <strong>
              Create your video resume by completing the questions below to get
              seen by all employers hiring for your dream job.
            </strong>{" "}
            This isn’t your normal job application for one position, this equals
            hundreds of job applications, instantly.
          </p>
          <p>
            Just be yourself, showcase your skills, and watch recruiters come to
            YOU.
          </p>
          <p>Let’s get you Drafted!</p>
          <p>
            <i>— Andrew and Rodrigo</i>
          </p>
        </div>
      </div>
    );
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fireDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: fireAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const bottleDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: bottleAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const challengeDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: challengeAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // To edit profile fields
  const [editMode, setEditMode] = useState({
    university: false,
    major: false,
    graduationYear: false,
    email: false,
    linkedIn: false,
  });

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const toggleFoundersMessage = () => {
    setShowFoundersMessage(!showFoundersMessage);
  };

  const [editMajor, setMajor] = useState(major);
  const [editEmail, setEmail] = useState(email);
  const [editLinkedInURL, setLinkedInURL] = useState(linkedInURL);
  const [editGraduationMonth, setGraduationMonth] = useState(graduationMonth); // State for graduationMonth
  const [editGraduationYear, setGraduationYear] = useState(graduationYear); // State for graduationYear

  // Handler to toggle edit mode
  const toggleEditMode = (field) => {
    if (field === "graduationYear" && editGraduationYear !== graduationYear) {
      // Update Firebase graduationYear
      const userDocRef = doc(db, "drafted-accounts", email);
      updateDoc(userDocRef, { graduationYear: editGraduationYear });
    }

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
        case "linkedInURL":
          setLinkedInURL(newValue);
          break;
        case "graduationYear": // Update editGraduationYear state
          setGraduationYear(newValue);
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

  const handleSignOut = () => {
    setIsSigningOut(true);
    // Perform Firebase sign out logic
    signOut(auth)
      .then(() => {
        console.log("Signed out");
        // Redirect to the Login page
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        // Handle any sign out errors here
        navigate("/login");
      });
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

    const fetchData = async () => {
      if (email) {
        const userDocRef = doc(db, "drafted-accounts", email);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setMajor(userData.major || major); // Set major from DB or prop
          setLinkedInURL(userData.linkedInURL || linkedInURL); // Set LinkedIn URL from DB or prop
          setGraduationYear(userData.graduationYear || graduationYear); // Set editGraduationYear from DB or prop
          // ... set other user data ...
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchData();
    fetchVideoUrl();
    fetchResumeUrl();
  }, [email, major, linkedInURL]);

  const handleRecordClick = () => {
    ReactGA4.event({
      category: "Video Resume",
      action: "Clicked to Record Video 1",
      label: "Record Video 1",
    });
    navigate("/video-recorder");
  };

  const handleRecordClick2 = () => {
    ReactGA4.event({
      category: "Video Resume",
      action: "Clicked to Record Video 2",
      label: "Record Video 2",
    });
    navigate("/video-recorder2");
  };

  const handleRecordClick3 = () => {
    ReactGA4.event({
      category: "Video Resume",
      action: "Clicked to Record Video 3",
      label: "Record Video 3",
    });
    navigate("/video-recorder3");
  };

  const VideoPlayer = ({ url }) => {
    const containerClass = url
      ? "video-container"
      : "video-container default-video";

    return (
      <div className={containerClass}>
        {url ? (
          <video
            src={url}
            controls
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={recordGif}
            alt="Default GIF"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
            }}
          />
        )}
      </div>
    );
  };

  console.log(firstName);
  if (firstName == undefined || lastName == undefined) {
    return (
      <div>
        <DoubleBubble
          text={"Loading..."}
          bgColor={"#fff"}
          center={true}
          width={"150px"}
          height={"150px"}
          color="#53ad7a" // Adjust color as needed
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
            <strong>🎒 Major</strong>
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
          <strong>📧 Email</strong>
          <br></br>
          <p>{email}</p>
        </div>
        <div className="profile-field">
          <div className="field-label">
            <img src={linkedInIcon} alt="LinkedIn" className="icon" />{" "}
            {/* LinkedIn icon */}
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
              value={editLinkedInURL}
              onChange={(e) => setLinkedInURL(e.target.value)}
              onBlur={() => updateField("linkedInURL", editLinkedInURL)}
            />
          ) : (
            <p>
              <a
                href={editLinkedInURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {editLinkedInURL}
              </a>
            </p>
          )}
        </div>
        <div className="profile-field">
          <div className="field-label">
            <strong>🎓 Graduation</strong>
            <button
              className="edit-button"
              onClick={() => toggleEditMode("graduationYear")}
            >
              {editMode.graduationYear ? "Save" : "Edit"}
            </button>
          </div>
          {editMode.graduationYear ? (
            <div>
              <input
                type="text"
                placeholder="Year"
                value={editGraduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                onBlur={() => updateField("graduationYear", editGraduationYear)}
              />
            </div>
          ) : (
            <p>{graduationYear}</p>
          )}
        </div>
      </div>
      <br></br>
      <div className="resume-section">
        <div className="resume-header">
          <strong>📄 Resume</strong>
          <button
            onClick={() => document.getElementById("resume-upload").click()}
            className="edit-button"
          >
            {resumeUrl ? "Re-upload Resume" : "Upload Resume"}
          </button>
          <input
            type="file"
            id="resume-upload"
            style={{ display: "none" }}
            onChange={handleResumeUpload}
          />
        </div>
        <a
          href={resumeUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="view-resume-link"
          onClick={handleViewResumeClick}
        >
          <strong>View Resume</strong>
        </a>
      </div>

      <div className="profile-dashboard">
        <div className="founders-message-header">
          <strong>Message from Founders</strong>
          <button
            className="speech-bubble-button"
            onClick={() => setShowFoundersPopup(true)}
          >
            💬
          </button>
        </div>
        <hr />
      </div>
      <div className="video-resumes">
        <Lottie
          options={defaultOptions}
          height={40} // Adjust size as necessary
          width={40} // Adjust size as necessary
          style={{ display: "inline-block", verticalAlign: "middle" }}
        />
        <strong style={{ verticalAlign: "middle", marginLeft: "0px" }}>
          Let's Create Your Video Resume
        </strong>
        <span style={{}}>
          <a
            href="#"
            onClick={() => setShowPopup(true)}
            style={{
              color: "#00BF63",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            Why Video Resume?
          </a>
        </span>
        <hr />
        <div className="video-section">
          <Lottie options={fireDefaultOptions} height={60} width={60} />
          <h3 style={{ textAlign: 'center' }}>Tell us your story</h3>
          <div>
            <br></br>
          </div>
          <br></br>
          <VideoPlayer url={videoUrl} />
          <button className="record-button" onClick={handleRecordClick}>
            {videoUrl ? "Re-record" : "Record"}
          </button>
        </div>
        <div className="video-section">
          <Lottie options={bottleDefaultOptions} height={60} width={60} />
          <h3 style={{ textAlign: 'center' }}>What makes you stand out amongst other candidates?</h3>
          <br></br>
          <div>
            <br></br>
          </div>
          <VideoPlayer url={videoUrl2} />
          <button className="record-button" onClick={handleRecordClick}>
            {videoUrl2 ? "Re-record" : "Record"}
          </button>
        </div>
        <div className="video-section">
          <Lottie options={challengeDefaultOptions} height={60} width={60} />
          <h3 style={{ textAlign: 'center' }}>Tell us about a time when you overcame a challenge</h3>
          <br></br>
          <div>
            <br></br>
          </div>
          <VideoPlayer url={videoUrl3} />
          <button className="record-button" onClick={handleRecordClick}>
            {videoUrl3 ? "Re-record" : "Record"}
          </button>
        </div>
      </div>
      <FoundersMessagePopup />
      <PopupModal />
      <div className="sign-out-button-container">
        <button onClick={handleSignOut} className="sign-out-button">
          {isSigningOut ? (
            <>
              <DoubleBubble
                text={"Signing out..."}
                bgColor={"#fff"}
                center={true}
                width={"18px"}
                height={"18px"}
              />
              Signing out...
            </>
          ) : (
            "Sign Out"
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileDashboard;
