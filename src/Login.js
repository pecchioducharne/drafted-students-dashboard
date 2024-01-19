import React, { useState, useEffect } from "react";
import "./Login.css";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  BarLoader,
  DoubleBubble,
  SlidingPebbles,
  DoubleOrbit,
} from "react-spinner-animated";

import "react-spinner-animated/dist/index.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to get URL parameters
  const getUrlParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  // Login Component
  useEffect(() => {
    // setIsLoading(true);
    const emailParam = getUrlParam("email");
    const passwordParam = getUrlParam("password");

    // Optionally set the email and password in the form fields
    setEmail(emailParam || "");
    setPassword(passwordParam || "");

    if (emailParam && passwordParam) {
      setIsLoading(true);
      signInWithEmailAndPassword(auth, emailParam, passwordParam)
        .then((userCredential) => {
          navigate("/dashboard"); // Redirect to the dashboard
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error signing in:", error);
          setErrorMessage("Failed to log in automatically.");
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Set isLoading to true while attempting login

    try {
      // Attempt to sign in with the provided email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user profile from Firestore
      const userProfileRef = doc(db, "drafted-accounts", user.email);
      const userProfileSnap = await getDoc(userProfileRef);

      if (!userProfileSnap.exists()) {
        setErrorMessage("Couldn't find account. Please sign up.");
      } else {
        // Redirect to the dashboard if login is successful
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false); // Set isLoading to false on error

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
        <DoubleOrbit
          text={"Loading..."}
          bgColor={"#fff"}
          center={true}
          width={"150px"}
          height={"150px"}
        />
      </div>
    );
  }
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
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
