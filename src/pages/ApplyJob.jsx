// src/pages/ApplyJob.jsx
import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000"; // backend URL

export default function ApplyJob({ jobId, token }) {
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    email: "",
    linkedin: "",
    github: "",
    graduation_year: "",
    skills: "",
    domain: "",
    duration: "",
    resume: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) {
      setMessage("❌ Please upload your resume");
      return;
    }

    const data = new FormData();
    for (let key in formData) data.append(key, formData[key]);
    data.append("job_id", jobId);

    try {
      const res = await axios.post(`${API}/apply`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to apply");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Apply for Job</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="college"
          placeholder="College"
          value={formData.college}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="linkedin"
          placeholder="LinkedIn URL"
          value={formData.linkedin}
          onChange={handleChange}
        />
        <input
          type="text"
          name="github"
          placeholder="GitHub URL"
          value={formData.github}
          onChange={handleChange}
        />
        <input
          type="text"
          name="graduation_year"
          placeholder="Graduation Year"
          value={formData.graduation_year}
          onChange={handleChange}
          required
        />
        <textarea
          name="skills"
          placeholder="Skills"
          value={formData.skills}
          onChange={handleChange}
          required
        ></textarea>
        <input
          type="text"
          name="domain"
          placeholder="Domain"
          value={formData.domain}
          onChange={handleChange}
        />
        <input
          type="text"
          name="duration"
          placeholder="Duration"
          value={formData.duration}
          onChange={handleChange}
        />
        <input type="file" name="resume" onChange={handleChange} accept=".pdf,.doc,.docx" required />
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}
