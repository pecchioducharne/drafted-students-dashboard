import React, { useState } from "react";
import "./Login.css"; // Make sure to create this CSS file
import { auth } from "./firebase"; // Import Firebase auth from your firebase.js file
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      ); // Include auth as the first argument
      const user = userCredential.user;
      // User is signed in, you can redirect to the dashboard or handle it as needed
    } catch (error) {
      console.error("Error signing in:", error);

      // Handle authentication errors and set appropriate error messages
      switch (error.code) {
        case "auth/wrong-password":
          setErrorMessage(
            "Wrong email or password. Try again or create an account."
          );
          break;
        case "auth/email-already-in-use":
          setErrorMessage(
            "Email is already in use. Please use a different email or reset your password."
          );
          break;
        // Add more cases for other error codes and display appropriate messages
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
