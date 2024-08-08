import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { storage, db, auth } from "./firebase";
import VideoRecorder from "react-video-recorder/lib/video-recorder";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import ReactGA4 from "react-ga4";
import step5Animation from "./step-5.json";
import fireAnimationData from "./fire.json";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const VideoRecorderPage = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ffmpeg = createFFmpeg({ log: true });
  ReactGA4.initialize("G-3M4KL5NDYG");

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
      } catch (error) {
        console.error("Could not load FFmpeg:", error);
      }
    };
    loadFFmpeg();
  }, [ffmpeg]);

  const handleVideoRecording = async (videoBlob) => {
    setRecordedVideo(videoBlob); // Save the recorded video blob
  };

  const toggleProTips = () => {
    ReactGA4.event({
      category: "Video Recording",
      action: "See Pro Tips",
      label: "Record Video 1",
    });
    setShowProTips(!showProTips);
  };

  const successLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: step5Animation,
  };

  const toggleVideo = (event) => {
    event.preventDefault();
    setShowVideo(!showVideo);
  };

  const uploadVideoToFirebase = async () => {
    if (recordedVideo && auth.currentUser) {
      setShowSuccessPopup(true); // Show success popup
      setIsUploading(true); // Set uploading state immediately

      try {
        if (ffmpegLoaded) {
          // FFmpeg compression
          ffmpeg.FS(
            "writeFile",
            "original.webm",
            await fetchFile(recordedVideo)
          );
          await ffmpeg.run(
            "-i",
            "original.webm",
            "-c:v",
            "libx264",
            "-crf",
            "28",
            "-preset",
            "fast",
            "-movflags",
            "+faststart",
            "output.mp4"
          );
          const compressedData = ffmpeg.FS("readFile", "output.mp4");
          const compressedBlob = new Blob([compressedData.buffer], {
            type: "video/mp4",
          });
          setRecordedVideo(compressedBlob);
        }

        // Upload recordedVideo to Firebase Storage
        const fileName = `user_recorded_video_${Date.now()}.mp4`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, recordedVideo);
        const downloadURL = await getDownloadURL(storageRef);

        // Update Firestore with download URL
        const userEmail = auth.currentUser.email;
        const userDocRef = doc(db, "drafted-accounts", userEmail);
        const dataToUpdate = {
          video1: downloadURL,
        };

        if (ffmpegLoaded) {
          // Generate thumbnail if FFmpeg is loaded
          ffmpeg.FS("writeFile", "video.mp4", await fetchFile(recordedVideo));
          await ffmpeg.run(
            "-i",
            "video.mp4",
            "-ss",
            "00:00:01.000",
            "-vframes",
            "1",
            "thumbnail.jpg"
          );
          const thumbnailData = ffmpeg.FS("readFile", "thumbnail.jpg");
          const thumbnailBlob = new Blob([thumbnailData.buffer], {
            type: "image/jpeg",
          });
          const thumbnailFileName = `thumbnail_${Date.now()}.jpg`;
          const thumbnailRef = ref(storage, thumbnailFileName);
          await uploadBytes(thumbnailRef, thumbnailBlob);
          const thumbnailURL = await getDownloadURL(thumbnailRef);
          dataToUpdate.thumbnail = thumbnailURL;
        }

        await updateDoc(userDocRef, dataToUpdate);

        // Track event
        ReactGA4.event({
          category: "Video Recording",
          action: "Saved Video",
          label: "Record Video 1",
        });

        navigate("/dashboard");
      } catch (error) {
        console.error("Error uploading video:", error);
        setShowSuccessPopup(false);
        setShowErrorPopup(true); // Show error popup
      } finally {
        setIsUploading(false); // Reset uploading state
      }
    } else {
      setShowSuccessPopup(false);
      setShowErrorPopup(true); // Show error popup if conditions are not met
    }
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
    setShowErrorPopup(false);
  };

  const YouTubeEmbedQuestion = () => (
    <div className="youtube-container">
      <iframe
        width="350"
        height="315"
        src="https://www.youtube.com/embed/T9Dym8dDLzM?autoplay=1&controls=1&modestbranding=1&rel=0"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );

  const fireDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: fireAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="video-recorder-container">
      <div className="title-and-buttons-container">
        <Lottie options={fireDefaultOptions} height={100} width={100} />
        <h1>Tell us your story</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="back-to-profile-button"
        >
          Back to Profile
        </button>
      </div>
      <div className="video-recorder-wrapper">
        <VideoRecorder
          key={1}
          isOnInitially
          timeLimit={90000}
          showReplayControls
          onRecordingComplete={handleVideoRecording}
        />
      </div>
      <div className="button-group">
        <button
          onClick={uploadVideoToFirebase}
          disabled={isUploading || !recordedVideo}
        >
          {isUploading ? "Uploading..." : "Save Video"}
        </button>
        <button onClick={toggleProTips} className="see-pro-tips-button">
          See pro tips
        </button>
        {showProTips && (
          <>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                This is the typical "walk me through your resume" question.
              </span>{" "}
              Talk about what you majored in and why. What internships or
              experiences you've had, and what have you learned from them? What
              skills will you bring to the hiring company?
            </li>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                Show why you're the best candidate to get an opportunity,
              </span>{" "}
              in terms of degree, internships, and experience as well as soft
              skills which truly set you apart. Talk about what you are
              passionate about, and what you hope to explore in your first role.
            </li>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                Demonstrate that you can communicate clearly and effectively,
              </span>{" "}
              present yourself professionally, and most importantly have fun and
              show your enthusiasm to go pro and put that degree to work!
            </li>
            <div>
              <a
                href="https://youtu.be/T9Dym8dDLzM?si=bfF-HDKHnuTAcRdq"
                onClick={toggleVideo}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#53AD7A", fontWeight: "bold" }}
              >
                Click to Watch Question Explained
              </a>
              <br />
              <br />
              {showVideo && <YouTubeEmbedQuestion />}
            </div>
          </>
        )}
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="video-container-popup success-popup">
          <span className="close-button" onClick={closePopup}>
            &times;
          </span>
          <Lottie options={successLottieOptions} height={200} width={200} />
          <p>
            Success! Your video has been saved and is currently being uploaded.
            It may take a moment for your dashboard to update. In the meantime,
            feel free to proceed with completing the next video.
          </p>
          <br />
          <button
            className="back-to-dashboard-button"
            onClick={() => window.open("/dashboard", "_blank")}
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="video-container-popup error-popup">
          <span className="close-button" onClick={closePopup}>
            &times;
          </span>
          <p>
            Whoa! Seems there was an issue uploading your vid. Not to worry,
            shoot it over to us at{" "}
            <a
              href="mailto:appdrafted@gmail.com?subject=Video%201"
              style={{ color: "#53AD7A", fontWeight: "bold" }}
            >
              appdrafted@gmail.com
            </a>{" "}
            with subject "Video 1". Or just re-record. We'll update your
            dashboard in next 1-2 days. Thanks!
          </p>
          <br></br>
          <button
            className="back-to-dashboard-button"
            onClick={() => window.open("/dashboard", "_blank")}
          >
            Back to Dashboard
          </button>
          <br></br>

          <button
            className="send-video-button"
            onClick={() =>
              window.open(
                "mailto:appdrafted@gmail.com?subject=Video%201",
                "_self"
              )
            }
          >
            Send Video
          </button>
          <br></br>

          <button
            className="back-to-dashboard-button"
            onClick={() => setShowErrorPopup(false)}
          >
            Re-record
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoRecorderPage;
