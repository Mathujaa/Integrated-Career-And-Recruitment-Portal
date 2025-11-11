import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/LoginImage.png";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";


// 🌍 Country options
const countryOptions = [
  { value: "+91", flag: "https://flagcdn.com/w40/in.png" },
  { value: "+1", flag: "https://flagcdn.com/w40/us.png" },
  { value: "+44", flag: "https://flagcdn.com/w40/gb.png" },
  { value: "+61", flag: "https://flagcdn.com/w40/au.png" },
  { value: "+81", flag: "https://flagcdn.com/w40/jp.png" },
  { value: "+49", flag: "https://flagcdn.com/w40/de.png" },
  { value: "+33", flag: "https://flagcdn.com/w40/fr.png" },
  { value: "+55", flag: "https://flagcdn.com/w40/br.png" },
  { value: "+7", flag: "https://flagcdn.com/w40/ru.png" },
  { value: "+39", flag: "https://flagcdn.com/w40/it.png" },
  { value: "+86", flag: "https://flagcdn.com/w40/cn.png" },
  { value: "+27", flag: "https://flagcdn.com/w40/za.png" },
  { value: "+82", flag: "https://flagcdn.com/w40/kr.png" },
];

const formatOptionLabel = ({ label, value, flag }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <img src={flag} alt={label} style={{ width: "24px", height: "16px", marginRight: 8, objectFit: "cover" }} />
    <span>{label} ({value})</span>
  </div>
);

const API = "http://localhost:5000";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "", phone: "" });
  const [countryCode, setCountryCode] = useState("+91");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

const handleGoogleLoginSuccess = async (credentialResponse) => {
  try {
    const token = credentialResponse.credential;
    console.log("🟢 Google credential:", token); // check we received token

    const res = await axios.post(`${API}/api/google-login`, { token });
    console.log("🟢 Server response:", res.data); // check backend reply

    if (res.data.success) {
      const user = res.data.user;
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", user.email);
      localStorage.setItem("username", user.name);
      localStorage.setItem("role", user.role);

      if (user.email.toLowerCase().includes("emp")) {
        navigate("/dashboard/EmployerJobs");
      } else {
        navigate("/dashboard/StudentJobs");
      }
    } else {
      setMessage("Login failed. Please try again.");
    }
  } catch (error) {
    console.error("❌ Google Login error (frontend):", error);
    setMessage("Google login failed. Please try again.");
  }
};



  const handleGoogleLoginError = () => {
    setMessage("Google login failed. Please try again.");
  };
  // ---------------- VALIDATION ----------------
  const validateUsername = (username) => /^[A-Za-z]+$/.test(username);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/.test(password);
  const validatePhone = (phone, code) => {
    if (code === "+91") return /^[6-9]\d{9}$/.test(phone);
    if (code === "+1") return /^\d{10}$/.test(phone);
    if (code === "+44") return /^\d{10,11}$/.test(phone);
    return true;
  };
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // ✅ ADMIN LOGIN
    if (loginData.email === "admin" && loginData.password === "Admin@123") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("token", "admin-token");
      localStorage.setItem("username", "admin");
      localStorage.setItem("email", "admin@example.com");
      setMessage("✅ Admin logged in successfully!");
      setMessageType("success");
      navigate("/dashboard");
      return;
    }

    if (!validateEmail(loginData.email)) {
      setErrors({ email: "Invalid email format." });
      return;
    }

    try {
      // ✅ EMPLOYER LOGIN DETECTION
      if (loginData.email.toLowerCase().includes("emp")) {
        console.log("🔐 Logging in as employer:", loginData.email);
        const res = await axios.post(`${API}/login/employer`, loginData, {
          headers: { "Content-Type": "application/json" },
        });

        const { token, role, id, username, email } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role || "employer");
        localStorage.setItem("user_id", id);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);

        setMessage("✅ Employer logged in successfully!");
        setMessageType("success");

        // ✅ FIX: Navigate correctly to employer dashboard
        setTimeout(() => {
          navigate("/dashboard"); // or "/employer-dashboard" if that’s your route
        }, 400);
        return;
      }

      // ✅ STUDENT LOGIN (default)
      console.log("🔐 Logging in as student:", loginData.email);
      const res = await axios.post(`${API}/login/student`, loginData, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, role, id, username, email } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "student");
      localStorage.setItem("user_id", id);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);

      setMessage("✅ Student logged in successfully!");
      setMessageType("success");

      setTimeout(() => navigate("/dashboard"), 400);
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err);
      setMessage(err.response?.data?.error || "Login failed.");
      setMessageType("error");
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!validateUsername(signupData.username)) {
      setErrors({ username: "Username must contain only letters." });
      return;
    }
    if (!validateEmail(signupData.email)) {
      setErrors({ email: "Invalid email format." });
      return;
    }
    if (!validatePassword(signupData.password)) {
      setErrors({
        password:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      });
      return;
    }
    if (!validatePhone(signupData.phone, countryCode)) {
      setErrors({ phone: "Phone number is invalid for selected country." });
      return;
    }

    try {
      const finalSignupData = {
        ...signupData,
        phone: `${countryCode}${signupData.phone}`,
      };

      // 👇 if email includes 'emp', register as employer
      if (signupData.email.toLowerCase().includes("emp")) {
        console.log("📝 Signing up employer:", finalSignupData.email);
        const res = await axios.post(`${API}/signup/employer`, finalSignupData, {
          headers: { "Content-Type": "application/json" },
        });
        setMessage(res.data.message || "✅ Employer registered successfully!");
        setMessageType("success");
      } else {
        console.log("📝 Signing up student:", finalSignupData.email);
        const res = await axios.post(`${API}/signup/student`, finalSignupData, {
          headers: { "Content-Type": "application/json" },
        });
        setMessage(res.data.message || "✅ Student registered successfully!");
        setMessageType("success");
      }

      // Auto-fill login form after signup
      setLoginData({ email: signupData.email, password: signupData.password });
      setSignupData({ username: "", email: "", password: "", phone: "" });
      setCountryCode("+91");
      setActiveTab("login");
      setErrors({});
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data || err);
      setMessage(err.response?.data?.error || "Signup failed.");
      setMessageType("error");
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!forgotEmail) {
      setMessage("❌ Please enter your email");
      setMessageType("error");
      return;
    }

    try {
      await axios.post(`${API}/forgot`, { email: forgotEmail });
      setMessage("✅ If this email exists, a reset link has been sent!");
      setMessageType("success");
      setForgotEmail("");
      setForgotMode(false);
    } catch {
      setMessage("✅ If this email exists, a reset link has been sent!");
      setMessageType("success");
      setForgotEmail("");
      setForgotMode(false);
    }
  };

  // ---------------- STYLES + JSX ----------------
  return (
    <>
      <style>{`
        body, html { height: 70%; margin: 0; font-family: Arial, sans-serif; }
        .login-page {
          background: url(${bgImage}) no-repeat;
          background-size: cover;
          height: 100vh;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding: 200px 750px 20px 50px;
        }
        .login-heading {
          font-weight: bold;
          font-size: 24px;
          color: #3f51b5;
          margin-bottom: 30px;
          text-align: center;
          margin-left: 125px;
          width: 100%;
        }
        .login-container {
          min-width: 300px;
          max-width: 350px;
          width: 350px;
          background: white;
          padding: 20px 18px;
          border-radius: 8px;
          box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
          margin-left: 125px;
          margin-top:50px;
          text-align: center;
        }
        .tabs {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
        }
        .tabs button {
          background: transparent;
          border: none;
          padding: 10px 15px;
          font-size: 16px;
          cursor: pointer;
          color: #555;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }
        .tabs button.active {
          color: #3f51b5;
          border-color: #3f51b5;
          font-weight: 700;
        }
        .form {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .form input, .form textarea, select {
          margin-bottom: 12px;
          padding: 8px 12px;
          font-size: 14px;
          border: 1.2px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          outline-color: #3f51b5;
        }
        .form button {
          background-color: #3f51b5;
          color: white;
          border: none;
          padding: 9px 0;
          border-radius: 4px;
          font-size: 15px;
          cursor: pointer;
          margin-top: 8px;
        }
         .google-login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #dadce0;
  border-radius: 24px; /* Pill shape */
  background-color: #fff;
  color: #3c4043;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  box-shadow: none;
  transition: none; /* No hover animation */
}

.google-login-btn:hover {
  background-color: #fff;     /* No change on hover */
  box-shadow: none;
  color: #3c4043;
  border-color: #dadce0;
}

.google-icon {
  width: 18px;
  height: 18px;
}
  .error-text {
  color: #d32f2f;
  font-size: 13px;
  margin-top: -6px;
  margin-bottom: 10px;
  text-align: left;
}




        .password-field { position: relative; display: flex; align-items: center; }
        .password-field input { flex: 1; padding-right: 40px; box-sizing: border-box; }
        .eye-icon { position: absolute; right: 10px; cursor: pointer; color: #555; }
        .message { margin-top: 15px; text-align: center; font-weight: 600; }
        .message.success { color: green; }
        .message.error { color: #d32f2f; }
        .forgot-link { margin-top: 10px; text-align: center; color: #3f51b5; cursor: pointer; font-size: 14px; }
        .error-text { color: #d32f2f; font-size: 13px; margin-top: -10px; margin-bottom: 10px; text-align: left; }
        .phone-input-wrapper { display: flex; gap: 8px; margin-bottom: 15px; }
        .country-select { flex: 0 0 39%; }
        .phone-input { flex: 1; }
      `}</style>

      <div className="login-page">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <h1 className="login-heading">
                        𝐈𝐍𝐓𝐄𝐆𝐑𝐀𝐓𝐄𝐃 𝐂𝐀𝐑𝐄𝐄𝐑 𝐀𝐍𝐃<br/> 𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐌𝐄𝐍𝐓 𝐏𝐎𝐑𝐓𝐀𝐋
          </h1>

          <div className="login-container">
            {!forgotMode && (
              <div className="tabs">
                <button className={activeTab === "login" ? "active" : ""} onClick={() => setActiveTab("login")}>
                  Login
                </button>
                <button className={activeTab === "signup" ? "active" : ""} onClick={() => setActiveTab("signup")}>
                  Signup
                </button>
              </div>
            )}

{/* LOGIN */}
{activeTab === "login" && !forgotMode && (
  <form className="form" onSubmit={handleLogin} noValidate>
    <input
      type="text"
      placeholder="Email"
      value={loginData.email}
      onChange={(e) => {
        const value = e.target.value;
        setLoginData({ ...loginData, email: value });
        if (!validateEmail(value)) {
          setErrors((prev) => ({ ...prev, loginEmail: "Invalid email format." }));
        } else {
          setErrors((prev) => ({ ...prev, loginEmail: "" }));
        }
      }}
      required
    />
    {errors.loginEmail && <p className="error-text">{errors.loginEmail}</p>}

    <div className="password-field">
      <input
        type={showLoginPassword ? "text" : "password"}
        placeholder="Password"
        value={loginData.password}
        onChange={(e) => {
          const value = e.target.value;
          setLoginData({ ...loginData, password: value });
          if (value.length < 6) {
            setErrors((prev) => ({ ...prev, loginPassword: "Password must be at least 6 characters." }));
          } else {
            setErrors((prev) => ({ ...prev, loginPassword: "" }));
          }
        }}
        required
      />
      <div className="eye-icon" onClick={() => setShowLoginPassword(!showLoginPassword)}></div>
    </div>
    {errors.loginPassword && <p className="error-text">{errors.loginPassword}</p>}

    <button type="submit">Login</button>

    {/* 🔹 Centered Google Button */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "15px",
        marginBottom: "10px",
      }}
    >
      <div style={{ width: "240px" }}>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
          useOneTap
          text="continue_with"
          size="medium"
          shape="pill"
          width="100%"
        />
      </div>
    </div>

    <div
      className="forgot-link"
      style={{ textAlign: "center", marginTop: "10px", cursor: "pointer" }}
      onClick={() => setForgotMode(true)}
    >
      Forgot password?
    </div>
  </form>
)}

{/* SIGNUP */}
{activeTab === "signup" && !forgotMode && (
  <form className="form" onSubmit={handleSignup} noValidate>
    <input
      type="text"
      placeholder="Username"
      value={signupData.username}
      onChange={(e) => {
        const value = e.target.value;
        setSignupData({ ...signupData, username: value });
        if (!validateUsername(value)) {
          setErrors((prev) => ({ ...prev, username: "Username must contain only letters." }));
        } else {
          setErrors((prev) => ({ ...prev, username: "" }));
        }
      }}
      required
    />
    {errors.username && <p className="error-text">{errors.username}</p>}

    <input
      type="email"
      placeholder="Email"
      value={signupData.email}
      onChange={(e) => {
        const value = e.target.value;
        setSignupData({ ...signupData, email: value });
        if (!validateEmail(value)) {
          setErrors((prev) => ({ ...prev, email: "Invalid email format." }));
        } else {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      }}
      required
    />
    {errors.email && <p className="error-text">{errors.email}</p>}

    <div className="password-field">
      <input
        type={showSignupPassword ? "text" : "password"}
        placeholder="Password"
        value={signupData.password}
        onChange={(e) => {
          const value = e.target.value;
          setSignupData({ ...signupData, password: value });
          if (!validatePassword(value)) {
            setErrors((prev) => ({
              ...prev,
              password:
                "Password must include uppercase, lowercase, number, and special character.",
            }));
          } else {
            setErrors((prev) => ({ ...prev, password: "" }));
          }
        }}
        required
      />
      <div className="eye-icon" onClick={() => setShowSignupPassword(!showSignupPassword)}></div>
    </div>
    {errors.password && <p className="error-text">{errors.password}</p>}

    <div className="phone-input-wrapper">
      <Select
        options={countryOptions}
        formatOptionLabel={formatOptionLabel}
        value={countryOptions.find((c) => c.value === countryCode) || countryOptions[0]}
        onChange={(selected) => setCountryCode(selected.value)}
        isSearchable
        className="country-select"
      />
      <input
        type="tel"
        className="phone-input"
        placeholder="Phone Number"
        value={signupData.phone}
        onChange={(e) => {
          const value = e.target.value;
          setSignupData({ ...signupData, phone: value });
          if (!validatePhone(value, countryCode)) {
            setErrors((prev) => ({ ...prev, phone: "Invalid phone number for country." }));
          } else {
            setErrors((prev) => ({ ...prev, phone: "" }));
          }
        }}
        required
      />
    </div>
    {errors.phone && <p className="error-text">{errors.phone}</p>}

    <button type="submit">Signup</button>
  </form>
)}


            {/* FORGOT PASSWORD */}
            {forgotMode && (
              <form className="form" onSubmit={handleForgotPassword} noValidate>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <button type="submit">Send Reset Link</button>
                <div className="forgot-link" onClick={() => setForgotMode(false)}>
                  Back to Login
                </div>
              </form>
            )}

            {message && <div className={`message ${messageType}`}>{message}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
 