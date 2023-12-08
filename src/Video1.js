import React, { useState } from "react";
import VideoRecorder from "./VideoRecorder"; // Import the VideoRecorder component here

const Video1 = ({ handleUpload, setAndPersistStep }) => {
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);

  // Define any other necessary state variables here

  const uploadVideoButtonStyles = {
    // Define your styles for the upload button
    // ...
  };

  const previousButtonStyles = {
    // Define your styles for the previous button
    // ...
  };

  const buttonStyles = {
    // Define your styles for the button
    // ...
  };

  const inactiveButtonStyles = {
    // Define your styles for the inactive button
    // ...
  };

  const toggleVideo1 = () => {
    // Define your toggleVideo1 function here
    // ...
  };

  const YouTubeEmbedQuestion1 = () => {
    // Define your YouTubeEmbedQuestion1 component here
    // ...
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        marginTop: "-50px",
      }}
    >
      <div style={{ display: "flex", width: "800px" }}>
        <div style={{ flex: 1, marginRight: "10px" }}>
          <div
            style={{
              backgroundcolor: "white",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <h2>Question 1 of 3</h2>
            <h3>🗺️ Tell us your story</h3>
            <p>
              <ul>
                <li>
                  <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                    This is the typical "walk me through your resume" question.
                  </span>{" "}
                  Talk about what you majored in and why. What internships or
                  experiences you've had, and what have you learned from them?
                  What skills will you bring to the hiring company?
                </li>
                <li>
                  <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                    Show why you're the best candidate to get an opportunity,
                  </span>{" "}
                  in terms of degree, internships, and experience as well as
                  soft skills which truly set you apart. Talk about what you are
                  passionate about, and what you hope to explore in your first
                  role.
                </li>
                <li>
                  <span style={{ fontWeight: "bold", color: "#53AD7A" }}>
                    Demonstrate that you can communicate clearly and
                    effectively,
                  </span>{" "}
                  present yourself professionally, and most importantly have fun
                  and show your enthusiasm to go pro and put that degree to
                  work!
                </li>
              </ul>
            </p>
            <div>
              <a
                href="https://youtu.be/T9Dym8dDLzM?si=bfF-HDKHnuTAcRdq"
                onClick={toggleVideo1}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#53AD7A", fontWeight: "bold" }}
              >
                Click to watch Question 1 Explained
              </a>
              <br />
              <br />
              {showVideo1 && <YouTubeEmbedQuestion1 />}
            </div>
            <div style={{ marginBottom: "20px" }}></div>
          </div>
        </div>
        <div style={{ flex: 1, marginLeft: "10px" }}>
          <div
            style={{
              backgroundcolor: "white",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <div
              className="video-recorder-wrapper"
              style={{ borderRadius: "14px", overflow: "hidden" }}
            >
              <VideoRecorder
                key={1}
                isOnInitially
                timeLimit={60000}
                showReplayControls
                onRecordingComplete={(videoBlobOrFile) => {
                  console.log("Video blob:", videoBlobOrFile);
                  setVideoRecorded(true);
                }}
              />
            </div>
            <div className="video-frame"></div>
            <br></br>
            <span style={{ fontWeight: "bold", color: "black" }}>or</span>
            <br></br>
            <br></br>
            <label htmlFor="file" style={uploadVideoButtonStyles}>
              Upload Question 1
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="video/*" // Accepts only video files
              onChange={async (event) => {
                const file = event.currentTarget.files[0];
                if (file) {
                  setIsLoading(true); // Start loading stage
                  try {
                    await handleUpload(file, "1");
                    // If upload is successful, setVideoUploaded(true);
                  } catch (err) {
                    console.error("Error uploading video: ", err);
                  } finally {
                    setIsLoading(false); // End loading stage
                  }
                }
              }}
            />
            <p className="video-info">Video Response: 1 min time limit</p>
            <p className="video-info">Unlimited retries</p>
            <button
              type="button"
              onClick={() => setAndPersistStep(5)}
              style={previousButtonStyles}
            >
              Back
            </button>
            <button
              type="button"
              style={
                videoRecorded || videoUploaded
                  ? buttonStyles
                  : inactiveButtonStyles
              }
            >
              Submit and Next
            </button>
            {isLoading && (
              <img
                src={loadingGif}
                alt="Loading..."
                style={{
                  width: "24px",
                  height: "24px",
                  marginLeft: "10px",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecordingComponent;
