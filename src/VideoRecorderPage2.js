import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { storage, db, auth } from "./firebase";
import VideoRecorder from "react-video-recorder/lib/video-recorder";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./VideoRecorderPage.css";
import { doc, updateDoc } from "firebase/firestore";
import ReactGA4 from "react-ga4";
import bottleAnimationData from "./bottle.json";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useUploadingContext } from "./UploadingContext";

const VideoRecorderPage2 = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { setIsUploadingVideo2 } = useUploadingContext();
  const [isUploadingVideo2] = useState(false); // New state for video 2 upload
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const ffmpeg = createFFmpeg({ log: true });
  ReactGA4.initialize("G-3M4KL5NDYG");

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        await ffmpeg.load();
        setFFmpegLoaded(true);
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
      setRecordedVideo(compressedBlob);
    } catch (error) {
      console.error("Error compressing video:", error);
    }
  };

  const uploadVideoToFirebase = async (callback) => {
    console.info("Upload to firebase triggered!");
    if (recordedVideo && auth.currentUser) {
      setIsUploading(true);
      console.log("Video has been recorded and we are signed in")
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
          video2: downloadURL,
        });
        console.info("Updated doc! Video 2: " + downloadURL);
  
        ReactGA4.event({
          category: "Video Recording",
          action: "Saved Video",
          label: "Record Video 2",
        });
        setIsUploading(false);
        if (callback) callback(); // Invoke callback function
      } catch (error) {
        console.error("Error uploading video:", error);
        setIsUploading(false);
      }
    } else {
      console.info("Didn't catch recorded video or authentication!");
      console.info("Recorded video: " + recordedVideo);
      console.info("Authenticated: " + auth.currentUser);
    }
  };  

  const handleSaveVideoClick = () => {
    setIsUploadingVideo2(true); // Set uploading state for Video 2
    navigate("/dashboard"); // Redirect to dashboard immediately
    uploadVideoToFirebase(() => setIsUploadingVideo2(false)); // Pass callback to toggle uploading state
  };

  const toggleVideo = (event) => {
    event.preventDefault();
    setShowVideo(!showVideo);
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
      label: "Record Video 2",
    });
    setShowProTips(!showProTips);
  };

  const bottleDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: bottleAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="video-recorder-container">
      <div className="title-and-buttons-container">
        <Lottie options={bottleDefaultOptions} height={100} width={100} />
        <h1>What makes you stand out amongst other candidates?</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="back-to-profile-button"
        >
          Back to Profile
        </button>
      </div>
      <div className="video-recorder-wrapper">
        <VideoRecorder
          key={2} // Change the key to force re-mounting of VideoRecorder component
          isOnInitially
          timeLimit={90000}
          showReplayControls
          onRecordingComplete={handleVideoRecording}
          onStartRecording={() => setIsRecording(true)}
        />
      </div>
      <div className="button-group">
        <button
          onClick={handleSaveVideoClick}
          disabled={isUploading || isRecording}
        >
          {isUploadingVideo2 ? "Uploading..." : "Save Video"}
        </button>
        <button onClick={toggleProTips} className="see-pro-tips-button">
          See pro tips
        </button>
        {showProTips && (
          <>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                Don’t be modest — this is the time to be confident about your
                strengths and really sell yourself to employers.
              </span>{" "}
              Focus on your unique skills and experiences, and explain why these
              make you the ideal candidate.
            </li>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                Focus on your education, skills, and experiences that make you
                unique!
              </span>{" "}
              Tell employers how your unique skills will help the company
              succeed.
            </li>
            <li>
              <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                Employers ask this to identify reasons why hiring you is better
                than hiring a similarly qualified candidate.
              </span>{" "}
              Use specific examples to demonstrate your skills and achievements,
              and relate them back to the requirements of the job.
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

export default VideoRecorderPage2;
