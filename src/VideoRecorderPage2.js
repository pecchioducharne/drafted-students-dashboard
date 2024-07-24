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
import bottleAnimationData from "./bottle.json";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const VideoRecorderPage2 = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const navigate = useNavigate();
  const ffmpeg = createFFmpeg({ log: true });
  ReactGA4.initialize("G-3M4KL5NDYG");

  const defaultOptions5 = {
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
      navigate("/dashboard");

      setIsUploading(true); // Set uploading state immediately

      try {
        if (ffmpegLoaded) {
          ffmpeg.FS("writeFile", "video.mp4", await fetchFile(recordedVideo));
          await ffmpeg.run(
            "-i",
            "video.mp4",
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
          const downloadURL = await getDownloadURL(storageRef);

          const userEmail = auth.currentUser.email;
          const userDocRef = doc(db, "drafted-accounts", userEmail);
          await updateDoc(userDocRef, {
            video2: downloadURL,
          });
        } else {
          const fileName = `user_recorded_video_${Date.now()}.mp4`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, recordedVideo);
          const downloadURL = await getDownloadURL(storageRef);

          const userEmail = auth.currentUser.email;
          const userDocRef = doc(db, "drafted-accounts", userEmail);
          await updateDoc(userDocRef, {
            video2: downloadURL,
          });
        }

        ReactGA4.event({
          category: "Video Recording",
          action: "Saved Video",
          label: "Record Video 2",
        });

        navigate("/dashboard");
      } catch (error) {
        console.error("Error uploading video:", error);
      } finally {
        setIsUploading(false); // Reset uploading state
      }
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
          key={1}
          isOnInitially
          timeLimit={90000}
          showReplayControls
          onRecordingComplete={handleVideoRecording}
        />
      </div>
      <div className="button-group">
        <button onClick={uploadVideoToFirebase} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Save Video"}
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
