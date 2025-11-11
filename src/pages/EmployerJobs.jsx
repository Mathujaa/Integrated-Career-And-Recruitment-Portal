import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    domain: "",
    location: "",
    duration: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  // ✅ theme state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const darkMode = theme === "dark";

  // ✅ listen for theme changes
  useEffect(() => {
    const updateTheme = () => {
      setTheme(localStorage.getItem("theme") || "light");
    };
    window.addEventListener("themeChange", updateTheme);
    return () => window.removeEventListener("themeChange", updateTheme);
  }, []);

  const fetchJobs = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          "❌ Failed to fetch jobs. Please login as Employer."
      );
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/employer/jobs",
        newJob,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message || "✅ Job posted successfully!");
      fetchJobs();
      setNewJob({
        title: "",
        domain: "",
        location: "",
        duration: "",
        description: "",
      });
    } catch (err) {
      console.error("Error posting job:", err.response?.data || err.message);
      alert(
        err.response?.data?.error ||
          "❌ Failed to post job. Please login as Employer."
      );
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await axios.delete(`http://localhost:5000/employer/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      alert("🗑️ Job deleted successfully!");
    } catch (err) {
      console.error("Error deleting job:", err.response?.data || err.message);
      alert(err.response?.data?.error || "❌ Failed to delete job.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: darkMode ? "#121212" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        transition: "all 0.3s ease",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        Post a Job/Internship
      </h2>

      {/* Post Job Form */}
      <form
        onSubmit={handlePost}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "600px",
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
          color: darkMode ? "#ffffff" : "#000000",
          padding: "1.5rem",
          borderRadius: "10px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
          marginBottom: "3rem",
        }}
      >
        <input
          name="title"
          placeholder="Job Title"
          value={newJob.title}
          onChange={handleChange}
          required
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />

        <select
          name="domain"
          value={newJob.domain}
          onChange={handleChange}
          required
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        >
          <option value="">Select Domain</option>
          <option value="web">Web Development</option>
          <option value="data">Data Science</option>
          <option value="design">UI/UX Design</option>
          <option value="marketing">Digital Marketing</option>
        </select>

        <input
          name="location"
          placeholder="Location"
          value={newJob.location}
          onChange={handleChange}
          required
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />

        <input
          name="duration"
          placeholder="Duration"
          value={newJob.duration}
          onChange={handleChange}
          required
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={newJob.description}
          onChange={handleChange}
          required
          rows={4}
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            backgroundColor: "#3f51b5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ Post Job
        </button>
      </form>

      {/* Posted Jobs */}
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Your Posted Jobs
      </h3>
      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                backgroundColor: darkMode ? "#1e1e1e" : "#fff",
                color: darkMode ? "#fff" : "#000",
                padding: "1.2rem",
                borderRadius: "10px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>{job.title}</h3>
              <p style={{ margin: 0 }}>
                <strong>Domain:</strong> {job.domain} <br />
                <strong>Location:</strong> {job.location} <br />
                <strong>Duration:</strong> {job.duration}
              </p>
              <p style={{ marginTop: "0.75rem" }}>{job.description}</p>
              <button
                onClick={() => handleDelete(job.id)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#e53935",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
