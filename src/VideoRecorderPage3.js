import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { storage, db, auth } from "./firebase";
import VideoRecorder from "react-video-recorder/lib/video-recorder";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./VideoRecorderPage.css";
import { doc, updateDoc } from "firebase/firestore";
import ReactGA4 from "react-ga4";
import step5Animation from "./step-5.json";
import challengeAnimationData from "./challenge.json";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const VideoRecorderPage3 = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const navigate = useNavigate();
  const ffmpeg = createFFmpeg({ log: true });

  ReactGA4.initialize("G-3M4KL5NDYG");

  const defaultOptions5 = {
    loop: true,
    autoplay: true,
    animationData: step5Animation,
  };

  const successLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: step5Animation,
  };

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
          setFFmpegLoaded(true);
        }
      } catch (error) {
        console.error("Could not load FFmpeg:", error);
      }
    };
    loadFFmpeg();
  }, [ffmpeg]);

  const handleVideoRecording = async (videoBlob) => {
    setRecordedVideo(videoBlob);
  };

  const toggleVideo = (event) => {
    event.preventDefault();
    setShowVideo(!showVideo);
  };

  const uploadVideoToFirebase = async () => {
    if (recordedVideo && auth.currentUser) {
      setShowSuccessPopup(true); // Show success popup
      setIsUploading(true);

      try {
        let downloadURL = "";

        if (ffmpegLoaded) {
          // Compress video using FFmpeg if loaded
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

          const fileName = `user_recorded_video_${Date.now()}.mp4`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, compressedBlob);
          downloadURL = await getDownloadURL(storageRef);
        } else {
          // Directly upload the recorded video if FFmpeg is not loaded
          const fileName = `user_recorded_video_${Date.now()}.webm`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, recordedVideo);
          downloadURL = await getDownloadURL(storageRef);
        }

        const userEmail = auth.currentUser.email;
        const userDocRef = doc(db, "drafted-accounts", userEmail);
        await updateDoc(userDocRef, {
          video3: downloadURL,
        });

        ReactGA4.event({
          category: "Video Recording",
          action: "Saved Video",
          label: "Record Video 3",
        });

        navigate("/dashboard");
      } catch (error) {
        console.error("Error uploading video:", error);
        setShowSuccessPopup(false);
        setShowErrorPopup(true); // Show error popup on upload failure
      } finally {
        setIsUploading(false); // Reset uploading state
      }
    } else {
      setShowSuccessPopup(false);
      setShowErrorPopup(true); // Show error popup on upload failure
    }
  };

  const YouTubeEmbedQuestion = () => (
    <div className="youtube-container">
      <iframe
        width="350"
        height="315"
        src="https://www.youtube.com/embed/IshJHdFFtcg?autoplay=1&controls=1&modestbranding=1&rel=0"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );

  const toggleProTips = () => {
    ReactGA4.event({
      category: "Video Recording",
      action: "See Pro Tips",
      label: "Record Video 3",
    });
    setShowProTips(!showProTips);
  };

  const challengeDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: challengeAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
    setShowErrorPopup(false);
  };

  return (
    <div className="video-recorder-container">
      <div className="title-and-buttons-container">
        <Lottie options={challengeDefaultOptions} height={100} width={100} />
        <h1>Tell us about a time when you overcame a challenge</h1>
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
                This is like your "highlight reel" moment. Show off!
              </span>{" "}
              Share specific examples where you exhibited problem-solving skills
              and the ability to overcome obstacles.
            </li>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                Pick one specific challenge in your studies, personal life, or
                work/internships.
              </span>{" "}
              Tell a story with a positive outcome and/or positive lesson
              learned that you can contribute to the workplace.
            </li>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                Emphasize key "soft skills".
              </span>{" "}
              Examples of soft skills include creativity, leadership,
              resilience, adaptability, quick decision-making, etc. Relate these
              to the specific challenge and outcome you are discussing.
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
            Whoa! Seems there was an issue uploading your video. Not to worry,
            shoot it over to us at{" "}
            <a
              href="mailto:appdrafted@gmail.com?subject=Video%203"
              style={{ color: "#53AD7A", fontWeight: "bold" }}
            >
              appdrafted@gmail.com
            </a>{" "}
            with subject "Video 3". Or just re-record. We'll update your
            dashboard in the next 1-2 days. Thanks!
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
                "mailto:appdrafted@gmail.com?subject=Video%203",
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

export default VideoRecorderPage3;
