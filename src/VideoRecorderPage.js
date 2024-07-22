import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { storage, db, auth } from "./firebase";
import VideoRecorder from "react-video-recorder/lib/video-recorder";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./VideoRecorderPage.css";
import { doc, updateDoc } from "firebase/firestore";
import ReactGA4 from "react-ga4";
import fireAnimationData from "./fire.json";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useUploadingContext } from "./UploadingContext"; // Adjust path as needed

const VideoRecorderPage = () => {
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const { userEmail, userPassword } = useUploadingContext(); // Use context to get userEmail and userPassword
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

  const navigateToNewTab = (url) => {
    window.open(url, '_blank'); // Opens the URL in a new tab or window
  };

  const handleNavigate = () => {
    navigateToNewTab('/dashboard'); // Example usage: open '/new-route' in a new tab
  };

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
      setRecordedVideo(videoBlob);
    }
  };

  const toggleVideo = (event) => {
    event.preventDefault();
    setShowVideo(!showVideo);
  };

  const uploadVideoToFirebase = async () => {
    handleNavigate();
    if (recordedVideo && auth.currentUser) {
      setIsUploading(true);
      console.info("Video has been recorded and we are signed in");

      try {
        const fileName = `user_recorded_video_${Date.now()}.mp4`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, recordedVideo);
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Generated downloadURL: " + downloadURL);

        if (ffmpegLoaded) {
          try {
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

            const userDocRef = doc(db, "drafted-accounts", userEmail);
            console.info("Updating doc!");
            await updateDoc(userDocRef, {
              video1: downloadURL,
              thumbnail: thumbnailURL,
            });
            console.info("Doc updated");
          } catch (error) {
            console.error(
              "Error generating thumbnail, uploading anyways:",
              error
            );
            console.info("Updating doc without thumbnail!");
            const userDocRef = doc(db, "drafted-accounts", userEmail);
            await updateDoc(userDocRef, {
              video1: downloadURL,
            });
            console.info("Doc updated without thumbnail");
          }
        } else {
          console.info("Updating doc without compression!");
          const userDocRef = doc(db, "drafted-accounts", userEmail);
          await updateDoc(userDocRef, {
            video1: downloadURL,
          });
          console.info("Doc updated without compression nor thumbnail");
        }

        ReactGA4.event({
          category: "Video Recording",
          action: "Saved Video",
          label: "Record Video 1",
        });

        navigate("/dashboard"); // Redirect to dashboard after successful upload

        setIsUploading(false);

        if (callback) callback(); // Invoke callback function to toggle uploading state
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
    setIsUploadingVideo1(true); // Set uploading state for Video 1
    navigate("/dashboard"); // Redirect to dashboard immediately
    uploadVideoToFirebase(() => setIsUploadingVideo1(false)); // Pass callback to toggle uploading state
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

  const toggleProTips = () => {
    ReactGA4.event({
      category: "Video Recording",
      action: "See Pro Tips",
      label: "Record Video 1",
    });
    setShowProTips(!showProTips);
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
          onClick={handleSaveVideoClick}
          disabled={isUploading || isRecording}
        >
          Save Video
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
    </div>
  );
};

export default VideoRecorderPage;
