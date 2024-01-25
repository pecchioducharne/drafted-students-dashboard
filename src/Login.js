import React, { useState, useEffect } from "react";
import "./Login.css";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import step5Animation from "./step-5.json";
import astronautAnimation from "./astronaut.json";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

  // Function to get URL parameters
  const getUrlParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  // Login Component
  useEffect(() => {
    const emailParam = getUrlParam("email");
    const passwordParam = getUrlParam("password");

    setEmail(emailParam || "");
    setPassword(passwordParam || "");

    const signOutAndSignIn = async () => {
      if (emailParam && passwordParam) {
        setIsLoading(true);
        try {
          await signOut(auth); // Explicitly sign out before signing in
          await signInWithEmailAndPassword(auth, emailParam, passwordParam);
          navigate("/dashboard"); // Redirect to the dashboard
        } catch (error) {
          console.error("Error during sign in:", error);
          setErrorMessage("Failed to log in automatically.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    signOutAndSignIn();
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await signOut(auth); // Explicitly sign out before signing in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userProfileRef = doc(db, "drafted-accounts", user.email);
      const userProfileSnap = await getDoc(userProfileRef);

      if (!userProfileSnap.exists()) {
        setErrorMessage("Couldn't find account. Please sign up.");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);

      switch (error.code) {
        case "auth/wrong-password":
          setErrorMessage(
            "Wrong email or password. Try again or create an account."
          );
          break;
        case "auth/user-not-found":
          setErrorMessage("No user found with this email. Please sign up.");
          break;
        default:
          setErrorMessage("An error occurred during login.");
          break;
      }
    }
  };

  if (isLoading) {
    return (
      <div>
        <Lottie options={defaultOptions5} height={100} width={100} />
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
      </form>
    </div>
  );
};

export default Login;
