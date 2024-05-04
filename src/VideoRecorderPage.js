import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { storage, db, auth } from "./firebase"; // Import the Firebase storage instance and auth
import VideoRecorder from "react-video-recorder/lib/video-recorder";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./VideoRecorderPage.css"; // Importing CSS
import { doc, updateDoc } from "firebase/firestore"; // Import required Firestore functions
import ReactGA4 from "react-ga4";
import fireAnimationData from "./fire.json"; // Adjust the path as necessary
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const VideoRecorderPage = () => {
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
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
          setFFmpegLoaded(true); // Set state only after successful load
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
    // Ensure duration metadata is set
    await ffmpeg.run(
      "-i",
      "original.webm",
      "-c",
      "copy",
      "-fflags",
      "+genpts",
      "output.mp4"
    );
    const compressedData = ffmpeg.FS("readFile", "output.mp4");
    const compressedBlob = new Blob([compressedData.buffer], {
      type: "video/mp4",
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
      setIsUploading(true);
      const fileName = `user_recorded_video_${Date.now()}.mp4`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, recordedVideo);
      const downloadURL = await getDownloadURL(storageRef);

      const userEmail = auth.currentUser.email;
      const userDocRef = doc(db, "drafted-accounts", userEmail);
      await updateDoc(userDocRef, { video1: downloadURL });
      console.log("Video uploaded successfully and Firestore updated");
      ReactGA4.event({
        category: "Video Recording",
        action: "Saved Video",
        label: "Record Video 1",
      });
      navigate("/dashboard");
      setIsUploading(false);
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
          src="https://www.youtube.com/embed/T9Dym8dDLzM?autoplay=1&controls=1&modestbranding=1&rel=0"
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
      label: "Record Video 1",
    });

    setShowProTips(!showProTips); // Toggle visibility of pro tips
  };

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
      <Lottie options={fireDefaultOptions} height={100} width={100} />
      <h1>Tell us your story</h1>
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
        <button onClick={() => navigate("/dashboard")}>Back to Profile</button>
      </div>
      {/* Add your tips and 'Click to watch question 1 explained' link here */}
    </div>
  );
};

export default VideoRecorderPage;
