import React, { useEffect, useState } from "react";
import { storage, db, auth } from "./firebase"; // Import the Firebase storage instance and auth
import VideoRecorder from "react-video-recorder/lib/video-recorder";
import Lottie from "react-lottie";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./VideoRecorderPage.css"; // Importing CSS
import { doc, updateDoc } from "firebase/firestore"; // Import required Firestore functions
import challengeAnimationData from "./challenge.json"; // Adjust the path as necessary
import ReactGA4 from "react-ga4";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const VideoRecorderPage3 = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const navigate = useNavigate();
  const ffmpeg = createFFmpeg({ log: true });
  ReactGA4.initialize("G-3M4KL5NDYG");

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        console.log("Attempting to load FFmpeg...");
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
          setFFmpegLoaded(true);
          console.log("FFmpeg loaded successfully.");
        }
      } catch (error) {
        console.error("Could not load FFmpeg:", error);
      }
    };
    loadFFmpeg();
  }, [ffmpeg]);

  const handleVideoRecording = async (videoBlob) => {
    if (!ffmpegLoaded) {
      console.error("FFmpeg is not loaded yet.");
      return;
    }
    setIsUploading(true);
    ffmpeg.FS("writeFile", "original.webm", await fetchFile(videoBlob));
    await ffmpeg.run(
      "-i",
      "original.webm",
      "-c:v",
      "libx264", // Using H.264 video codec
      "-crf",
      "28", // Constant Rate Factor for quality (lower is better)
      "-preset",
      "fast", // Speed/quality tradeoff (faster encoding with slightly lower quality)
      "-movflags",
      "+faststart", // Place the moov atom at the front of the file for quick start
      "output.mp4"
    );
    const compressedData = ffmpeg.FS("readFile", "output.mp4");
    const compressedBlob = new Blob([compressedData.buffer], {
      type: "video/mp4", // Ensure the Blob type is set correctly
    });
    setRecordedVideo(compressedBlob);
    setIsUploading(false);
  };

  const toggleVideo = (event) => {
    // Prevent the default anchor behavior of going to the link
    event.preventDefault();

    // Set the showVideo state to true to show the YouTubeEmbedQuestion1 component
    setShowVideo(!showVideo);
  };

  const uploadVideoToFirebase = async () => {
    if (recordedVideo && auth.currentUser) {
      try {
        setIsUploading(true); // Start uploading

        // Add TikTok tracking
        if (window.ttq) {
          window.ttq.track("CompleteRegistration", {
            content_id: "user_recorded_video",
            email: auth.currentUser.email,
            // Add other relevant parameters here
          });
        }

        const fileName = `user_recorded_video_${Date.now()}.mp4`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, recordedVideo);
        const downloadURL = await getDownloadURL(storageRef);

        // Update the user's document in Firestore
        const userEmail = auth.currentUser.email; // Get the logged-in user's email
        const userDocRef = doc(db, "drafted-accounts", userEmail);
        await updateDoc(userDocRef, {
          video3: downloadURL,
        });

        console.log("Video uploaded successfully and Firestore updated");

        ReactGA4.event({
          category: "Video Recording",
          action: "Saved Video",
          label: "Record Video 3",
        });

        navigate("/dashboard"); // Redirect to ProfileDashboard
      } catch (error) {
        console.error("Video upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  function YouTubeEmbedQuestion() {
    return (
      <div
        className="youtube-container"
        style={{ overflow: "hidden", borderRadius: "8px" }}
      >
        <iframe
          width="350"
          height="315"
          src="https://www.youtube.com/embed/W1vP__7BAEY?si=nktGyavw_DQlWOP7?autoplay=1&controls=0&modestbranding=1&rel=0"
          title="YouTube video player"
          frameborder="0"
          style={{ borderRadius: "14px" }} // Add border-radius here
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    );
  }

  const toggleProTips = () => {
    ReactGA4.event({
      category: "Video Recording",
      action: "See Pro Tips",
      label: "Record Video 3",
    });

    setShowProTips(!showProTips); // Toggle visibility of pro tips
  };

  const challengeDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: challengeAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="video-recorder-container">
      <Lottie options={challengeDefaultOptions} height={100} width={100} />
      <h1>Tell us about a time when you overcame a challenge</h1>
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
        <button onClick={uploadVideoToFirebase} disabled={isUploading}>
          {isUploading ? "Saving Video" : "Save Video"}
        </button>
        <button
          onClick={toggleProTips}
          style={{ color: "white", fontWeight: "bold" }}
        >
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
        <button onClick={() => navigate("/dashboard")}>Back to Profile</button>
      </div>
      {/* Add your tips and 'Click to watch question 1 explained' link here */}
    </div>
  );
};

export default VideoRecorderPage3;
