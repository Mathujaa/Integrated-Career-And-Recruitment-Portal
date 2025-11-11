import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    resume: null,
    linkedin: "",
    github: "",
    graduationYear: "",
    skills: "",
    domain: "",
    duration: "",
  });

  const token = localStorage.getItem("token");

  // ✅ Track theme
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem("theme") || "light");
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);
  const isDark = theme === "dark";

  // Fetch all jobs
  useEffect(() => {
    if (!token) return;

    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        alert("❌ Failed to fetch jobs. Please login as a student.");
      }
    };

    fetchJobs();
  }, [token]);

  // Fetch applied jobs
  useEffect(() => {
    if (!token) return;

    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/applied-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppliedJobs(res.data.map((job) => job.job_id || job.id));
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
      }
    };

    fetchAppliedJobs();
  }, [token]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  // Open application modal
  const handleApply = (job) => {
    setSelectedJob(job);
    setFormData((prev) => ({
      ...prev,
      domain: job.domain || "",
      duration: job.duration || "",
    }));
    setShowForm(true);
  };

  // Form input change handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData((prev) => ({ ...prev, resume: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit job application
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) data.append(key, value);
    });

    try {
      const res = await axios.post(
        `http://localhost:5000/apply/${selectedJob.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAppliedJobs((prev) => [...prev, selectedJob.id]);
      alert(res.data.message || "✅ Application submitted!");
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        college: "",
        resume: null,
        linkedin: "",
        github: "",
        graduationYear: "",
        skills: "",
        domain: "",
        duration: "",
      });
    } catch (err) {
      console.error("Error applying:", err);
      alert(err.response?.data?.error || "❌ Failed to apply.");
    }
  };

  // Filter jobs based on domain
  const filteredJobs =
    selectedDomain === "all"
      ? jobs
      : jobs.filter((job) =>
          job.domain.toLowerCase().includes(selectedDomain.toLowerCase())
        );

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        marginLeft: "50px",
        padding: "20px",
        backgroundColor: isDark ? "#1a202c" : "#ffffff",
        color: isDark ? "#ffffff" : "#111827",
        minHeight: "100vh",
      }}
    >
      <h2>Available Internships</h2>

      {/* Domain Filter */}
      <label htmlFor="domain-select">Choose a domain:</label>
      <br />
      <select
        id="domain-select"
        value={selectedDomain}
        onChange={(e) => setSelectedDomain(e.target.value)}
        style={{
          padding: "0.5rem 1rem",
          marginTop: "0.5rem",
          marginBottom: "1rem",
          backgroundColor: isDark ? "#2d3748" : "#ffffff",
          color: isDark ? "#ffffff" : "#111827",
          border: "1px solid #ccc",
        }}
      >
        <option value="all">All</option>
        <option value="web">Web Development</option>
        <option value="data">Data Science</option>
        <option value="design">UI/UX Design</option>
        <option value="marketing">Digital Marketing</option>
      </select>

      {/* Jobs List */}
      <div id="job-list">
        {filteredJobs.length === 0 ? (
          <p>No jobs available for the selected domain.</p>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              style={{
                backgroundColor: isDark ? "#2d3748" : "white",
                color: isDark ? "#ffffff" : "#111827",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              }}
            >
              <h3>{job.title}</h3>
              <p>
                Domain: {job.domain} <br />
                Location: {job.location} | Duration: {job.duration}
              </p>
              <p>{job.description}</p>
              <p>
                <em>Posted by: {job.employer_name}</em>
              </p>
              <button
                disabled={appliedJobs.includes(job.id)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: appliedJobs.includes(job.id)
                    ? "gray"
                    : "#3f51b5",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: appliedJobs.includes(job.id)
                    ? "not-allowed"
                    : "pointer",
                }}
                onClick={() => handleApply(job)}
              >
                {appliedJobs.includes(job.id) ? "Applied ✅" : "Apply Now"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Application Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              background: isDark ? "#2d3748" : "white",
              color: isDark ? "#ffffff" : "#111827",
              padding: "30px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                marginBottom: "25px",
                color: isDark ? "#90cdf4" : "#3f51b5",
                textAlign: "center",
              }}
            >
              Apply for {selectedJob?.title}
            </h2>

            <label>Full Name *</label>
            <input
              name="name"
              onChange={handleChange}
              required
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: isDark ? "#4a5568" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>Email *</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: isDark ? "#4a5568" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>College *</label>
            <input
              name="college"
              onChange={handleChange}
              required
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: isDark ? "#4a5568" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>Upload Resume (PDF) *</label>
            <input
              type="file"
              name="resume"
              accept="application/pdf"
              onChange={handleChange}
              required
              style={{ marginBottom: "20px" }}
            />

            <label>LinkedIn Profile</label>
            <input
              name="linkedin"
              onChange={handleChange}
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: isDark ? "#4a5568" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>GitHub Profile</label>
            <input
              name="github"
              onChange={handleChange}
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: isDark ? "#4a5568" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>Year of Graduation *</label>
            <input
              name="graduationYear"
              onChange={handleChange}
              required
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: isDark ? "#4a5568" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>Known Skills *</label>
            <textarea
              name="skills"
              onChange={handleChange}
              required
              style={{
                marginBottom: "20px",
                padding: "12px",
                minHeight: "100px",
                background: isDark ? "#4a5568" : "#ffffff",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>Domain</label>
            <input
              value={formData.domain}
              readOnly
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: isDark ? "#2d3748" : "#f5f5f5",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <label>Duration</label>
            <input
              value={formData.duration}
              readOnly
              style={{
                marginBottom: "25px",
                padding: "12px",
                background: isDark ? "#2d3748" : "#f5f5f5",
                color: isDark ? "#ffffff" : "#111827",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "12px 20px",
                  background: "#3f51b5",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Submit Application
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "12px 20px",
                  background: "gray",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
