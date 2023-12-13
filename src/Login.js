import React, { useState, useEffect } from "react";
import "./Login.css";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Function to get URL parameters
  const getUrlParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  // Login Component
  useEffect(() => {
    const emailParam = getUrlParam("email");
    const passwordParam = getUrlParam("password");

    // Optionally set the email and password in the form fields
    setEmail(emailParam || '');
    setPassword(passwordParam || '');

    if (emailParam && passwordParam) {
      signInWithEmailAndPassword(auth, emailParam, passwordParam)
        .then((userCredential) => {
          navigate('/dashboard'); // Redirect to the dashboard
        })
        .catch((error) => {
          console.error("Error signing in:", error);
          setErrorMessage("Failed to log in automatically.");
        });
    }
  }, [auth, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Simply attempt to sign in with the provided email and password
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
        return; // Prevent further actions or redirection
      }

      // Redirect to dashboard logic here...
    } catch (error) {
      console.error("Error signing in:", error);
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
