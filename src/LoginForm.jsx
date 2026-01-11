import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.js";

const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 10px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "white",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "30px",
    fontSize: "24px",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
    "&:focus": {
      outline: "none",
      borderColor: "#4a90e2",
    },
  },
  submitButton: {
    backgroundColor: "#4a90e2",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#357abd",
    },
  },
  rememberMe: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "1px"
  },
  forgotPassword: {
    textAlign: "center",
    marginBottom: "1px",
  },
  forgotPasswordButton: {
    boxSizing: "border-box",
    padding: "0",
    margin: "0",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
    backgroundColor: "transparent",
    color: "red",
  },
  checkbox: {
    margin: "0",
    cursor: "pointer",
  },
  checkboxLabel: {
    cursor: "pointer",
    userSelect: "none",
  },
  toggleContainer: {
    textAlign: "center",
    marginTop: "20px",
  },
  toggleButton: {
    background: "none",
    border: "none",
    color: "#4a90e2",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0",
    marginLeft: "5px",
    textDecoration: "underline",
    "&:hover": {
      opacity: "0.8"
    },
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#666',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      color: '#333',
    },
  },
};

export const LoginForm = ({onLogin, isDarkMode}) => {
  const [email, setEmail] = useState(() => {
    // Try to get saved email from localStorage on component mount
    return localStorage.getItem('rememberedEmail') || "";
  });
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if we have a saved email
    return !!localStorage.getItem('rememberedEmail');
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending password reset:", error);
      if (error.code === "auth/user-not-found") {
        alert("No account found with this email address.");
      } else {
        alert(`Error sending reset email: ${error.message}`);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      if (isSignUp) {
        // Sign up logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up:", userCredential.user);
        alert("Account created successfully! You can now log in.");
        setIsSignUp(false);
      } else {
        // Set persistence before signing in
        if (rememberMe) {
          await setPersistence(auth, browserLocalPersistence);
          // Save email to localStorage
          localStorage.setItem('rememberedEmail', email);
        } else {
          await setPersistence(auth, browserSessionPersistence);
          // Remove email from localStorage
          localStorage.removeItem('rememberedEmail');
        }
        // Sign in logic
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(); // Notify parent of successful login
      }
    } catch (error) {
      console.error("Error code:", error.code);
      console.error("Full error:", error);
  
      switch (error.code) {
        case "auth/invalid-email":
          alert("Invalid email format. Please enter a valid email.");
          break;
        case "auth/user-not-found":
          alert("No user found with this email.");
          break;
        case "auth/wrong-password":
          alert("Incorrect password. Please try again.");
          break;
        case "auth/email-already-in-use":
          alert("This email is already registered. Please log in.");
          break;
        case "auth/invalid-credential":
          alert("Invalid email or password. Please try again.");
          break;
        default:
          alert(`An error occurred: ${error.message}`);
      }
    }
  };
  

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw' }}>
      <div 
        style={{
          ...styles.container,
          backgroundColor: isDarkMode ? 'var(--flashcard-bg-color)' : 'white',
        }}
        className={isDarkMode ? 'dark-mode' : ''}
      >
        <h2 style={{
          ...styles.title,
          color: isDarkMode ? 'var(--text-color)' : '#333',
        }}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{
            ...styles.input,
            backgroundColor: isDarkMode ? 'var(--input-bg-color)' : 'white',
            color: isDarkMode ? 'var(--input-text-color)' : '#000',
            borderColor: isDarkMode ? '#57728e' : '#ddd',
          }}
        />
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              ...styles.input,
              backgroundColor: isDarkMode ? 'var(--input-bg-color)' : 'white',
              color: isDarkMode ? 'var(--input-text-color)' : '#000',
              borderColor: isDarkMode ? '#57728e' : '#ddd',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            tabIndex="-1"
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
        <div style={styles.rememberMe}>
          <input 
            type="checkbox" 
            id="rememberMe" 
            style={styles.checkbox}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" style={{
            ...styles.checkboxLabel,
            color: isDarkMode ? 'var(--text-color)' : '#333',
          }}>
            Remember me
          </label>
        </div>
        <div style={styles.forgotPassword}>
          <button type="button" style={styles.forgotPasswordButton} onClick={handleForgotPassword}>
            Forgot Password
          </button>
        </div>
        <button type="submit" className="login-submit-button" style={styles.submitButton}>
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>
      <div style={styles.toggleContainer}>
        <span style={{ color: isDarkMode ? 'var(--text-color)' : '#333' }}>
          {isSignUp ? "Already have an account? " : "Don't have an account yet? "}
        </span>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            ...styles.toggleButton,
            color: isDarkMode ? '#4a90e2' : '#4a90e2',
          }}
        >
          {isSignUp ? "Log In" : "Sign Up"}
        </button>
      </div>
      </div>
    </div>
  );
};
