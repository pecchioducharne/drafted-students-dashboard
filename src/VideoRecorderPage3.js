import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { storage, db, auth } from "./firebase";
import VideoRecorder from "react-video-recorder/lib/video-recorder";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./VideoRecorderPage.css";
import { doc, updateDoc } from "firebase/firestore";
import ReactGA4 from "react-ga4";
import challengeAnimationData from "./challenge.json";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useUploadingContext } from "./UploadingContext";

const VideoRecorderPage3 = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { setIsUploadingVideo3 } = useUploadingContext();
  const { setIsUploadingVideo2, userEmail } = useUploadingContext(); // Access userEmail from context
  const [isUploadingVideo3] = useState(false); // Updated state for video 3 upload
  const [isRecording, setIsRecording] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const navigate = useNavigate();
  const ffmpeg = createFFmpeg({ log: true });

  ReactGA4.initialize("G-3M4KL5NDYG");

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
    setIsRecording(false);
    if (!ffmpegLoaded) {
      console.error("FFmpeg is not loaded yet. Skipping compression.");
      setRecordedVideo(videoBlob);
      return;
    }
    try {
      console.log("Compressing video");
      ffmpeg.FS("writeFile", "original.webm", await fetchFile(videoBlob));
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
      console.info("Compressed video");
      setRecordedVideo(compressedBlob);
    } catch (error) {
      console.error("Error compressing video:", error);
      setRecordedVideo(videoBlob);
    }
  };

  const toggleVideo = (event) => {
    event.preventDefault();
    setShowVideo(!showVideo);
  };

  const uploadVideoToFirebase = async (callback) => {
    console.info("Upload to Firebase triggered!");

    // Function to retry authentication check with a delay
    const waitForAuth = async (maxAttempts, delay) => {
      let attempts = 0;
      while (attempts < maxAttempts) {
        if (auth.currentUser) {
          return true; // Authentication succeeded
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempts++;
      }
      return false; // Authentication failed after maxAttempts
    };

    // Check authentication with retries
    const isAuthenticated = await waitForAuth(5, 1000); // Retry 5 times with 1 second delay

    if (recordedVideo && isAuthenticated) {
      setIsUploading(true);
      console.info("Video has been recorded and we are signed in");

      try {
        const fileName = `user_recorded_video_${Date.now()}.mp4`;
        const storageRef = ref(storage, fileName);
        console.log("Have fileName: " + fileName);
        await uploadBytes(storageRef, recordedVideo);
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Generated downloadURL: " + downloadURL);

        const userEmail = auth.currentUser.email;
        console.log("Retrieved user email: " + userEmail);
        const userDocRef = doc(db, "drafted-accounts", userEmail);
        console.log("Was able to get userDocRef: " + userDocRef);

        console.info("Updating doc...");
        await updateDoc(userDocRef, {
          video3: downloadURL,
        });
        console.info("Updated doc! Video 3: " + downloadURL);

        ReactGA4.event({
          category: "Video Recording",
          action: "Saved Video",
          label: "Record Video 3",
        });
        setIsUploading(false);
        setIsUploadingVideo3(false); // Reset uploading state for Video 3
        if (callback) callback(); // Invoke callback function
      } catch (error) {
        console.error("Error uploading video:", error);
        setIsUploading(false);
        setIsUploadingVideo3(false); // Reset uploading state for Video 3 on error
      }
    } else {
      console.info("Didn't catch recorded video or authentication!");
      console.info("Recorded video: " + recordedVideo);
      console.info("Authenticated: " + auth.currentUser);
    }
  };

  const handleSaveVideoClick = () => {
    setIsUploadingVideo3(true); // Set uploading state for Video 3
    navigate("/dashboard"); // Redirect to dashboard immediately
    uploadVideoToFirebase(() => setIsUploadingVideo3(false)); // Pass callback to toggle uploading state
  };

  const YouTubeEmbedQuestion = () => (
    <div className="youtube-container">
      <iframe
        width="350"
        height="315"
        src="https://www.youtube.com/embed/IshJHdFFtcg?si=dOJl_w_f62enHHSN?autoplay=1&controls=1&modestbranding=1&rel=0"
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
          key={3}
          isOnInitially
          timeLimit={90000}
          showReplayControls
          onRecordingComplete={handleVideoRecording}
        />
      </div>
      <div className="button-group">
        <button
          onClick={handleSaveVideoClick}
          disabled={isUploading || isRecording}
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
    </div>
  );
};

export default VideoRecorderPage3;
