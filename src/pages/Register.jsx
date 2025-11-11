import React from "react";

export default function Register() {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
      className="auth-body"
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "320px",
          textAlign: "center",
        }}
        className="auth-container"
      >
        <h2>Student Register</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // You can add registration logic here or routing logic
            window.location.href = "/dashboard";
          }}
        >
          <input
            type="text"
            placeholder="Full Name"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              margin: "0.5rem 0",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="email"
            placeholder="Email"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              margin: "0.5rem 0",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              margin: "0.5rem 0 1rem 0",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              backgroundColor: "#3f51b5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>
        <p style={{ marginTop: "1rem" }}>
          Already have an account?{" "}
          <a href="/" style={{ color: "#3f51b5", textDecoration: "none" }}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
