import React, { useState, useEffect } from "react";
import "./Login.css";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import step5Animation from "./step-5.json";
import astronautAnimation from "./astronaut.json";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const defaultOptions5 = {
    loop: true,
    autoplay: true,
    animationData: step5Animation,
  };

  const welcomeBack = {
    loop: false,
    autoplay: true,
    animationData: astronautAnimation,
  };

  useEffect(() => {
    const getUrlParam = (name) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    };

    const emailParam = getUrlParam("email");
    const passwordParam = getUrlParam("password");

    if (emailParam && passwordParam) {
      setIsLoading(true);
      signInWithEmailAndPassword(auth, emailParam, passwordParam)
        .then(() => {
          navigate("/dashboard");
        })
        .catch((error) => {
          console.error("Error during auto sign in:", error);
          setErrorMessage("Failed to log in automatically. Please log in manually.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing in:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setErrorMessage("Failed to send password reset email. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div>
        <Lottie options={defaultOptions5} height={100} width={100} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Welcome back.</h2>
        <Lottie options={welcomeBack} height={100} width={100} />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="input-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
        <br></br>
        <button type="button" className="reset-password-btn" onClick={handlePasswordReset}>Forgot Password?</button>
      </form>
    </div>
  );
};

export default Login;
