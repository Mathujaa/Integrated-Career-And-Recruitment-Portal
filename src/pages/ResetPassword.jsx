// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import bgImage from "../assets/LoginImage.png";
import { Eye, EyeOff } from "lucide-react";

const API = "http://localhost:5000";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [validLink, setValidLink] = useState(true);
  const [errors, setErrors] = useState({});

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/.test(password);

  useEffect(() => {
    if (!token) {
      setValidLink(false);
      setMessage("❌ Invalid or expired reset link");
      setMessageType("error");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    let validationErrors = {};

    if (!validatePassword(newPassword)) {
      validationErrors.newPassword =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }

    if (confirmPassword !== newPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const res = await axios.post(`${API}/reset-password`, {
        token,
        password: newPassword,
      });
      setMessage(res.data.message || "✅ Password reset successful!");
      setMessageType("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Invalid or expired token");
      setMessageType("error");
    }
  };

  if (!validLink) {
    return (
      <div className="reset-page" style={{ position: "relative" }}>
        <div className="message error">{message}</div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          body, html { height: 70%; margin: 0; font-family: Arial, sans-serif; }
          .reset-page {
            background: url(${bgImage}) no-repeat;
            background-size: cover;
            height: 100vh;
            padding: 200px 750px 20px 50px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
          }
          .reset-container {
            max-width: 350px;
            width: 100%;
            background: white;
            padding: 30px 25px;
            border-radius: 8px;
            box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
            margin-left: 120px;
            text-align: center;
          }
          .form {
            display: flex;
            flex-direction: column;
          }
          .form input {
            margin-bottom: 12px;
            padding: 12px 15px;
            font-size: 16px;
            border: 1.5px solid #ccc;
            border-radius: 4px;
            outline-color: #3f51b5;
          }
          .password-field {
            position: relative;
            display: flex;
            align-items: center;
          }
          .password-field input {
            flex: 1;
            padding-right: 40px;
          }
          .eye-icon {
            position: absolute;
            right: 10px;
            cursor: pointer;
            color: #555;
          }
          .form button {
            background-color: #3f51b5;
            color: white;
            border: none;
            padding: 12px 0;
            border-radius: 4px;
            font-size: 18px;
            cursor: pointer;
            margin-top: 8px;
          }
          .message {
            margin-top: 15px;
            text-align: center;
            font-weight: 600;
          }
          .message.success {
            color: green;
          }
          .message.error {
            color: #d32f2f;
          }
          .error-text {
            color: #d32f2f;
            font-size: 13px;
            min-height: 18px;
            line-height: 18px;
            margin-top: -8px;
            margin-bottom: 10px;
            text-align: left;
          }
        `}
      </style>

      <div className="reset-page">
        <div className="reset-container">
          <h2 className="page-title">🔐 Reset Password</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="password-field">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewPassword(val);
                  if (!validatePassword(val)) {
                    setErrors((prev) => ({
                      ...prev,
                      newPassword:
                        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, newPassword: "" }));
                  }
                }}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            <div className="error-text">{errors.newPassword || "\u00A0"}</div>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfirmPassword(val);
                  if (val !== newPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: "Passwords do not match.",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }
                }}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            <div className="error-text">{errors.confirmPassword || "\u00A0"}</div>

            <button type="submit">Reset Password</button>
          </form>
          {message && <p className={`message ${messageType}`}>{message}</p>}
        </div>
      </div>
    </>
  );
}
