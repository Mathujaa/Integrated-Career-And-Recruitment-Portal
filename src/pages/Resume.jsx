import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function Resume() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    summary: "",
    skills: "",
    education: "",
    experience: "",
    certifications: "",
    hobbies: "",
    languages: "",
    photo: null, // base64 string only
  });

  const [showResume, setShowResume] = useState(false);

  // ✅ sync dark mode + fontStyle with Layout/Settings
  const theme = localStorage.getItem("theme") || "light";
  const darkMode = theme === "dark";
  const fontStyle = localStorage.getItem("fontStyle") || "Arial";

  function handleChange(e) {
    const { id, value, files } = e.target;
    if (id === "photo" && files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(",")[1];
        setFormData((prev) => ({ ...prev, photo: base64Data }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setShowResume(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Resume saved to database!");
      } else {
        alert("Error saving resume: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      alert("Server error! Check backend logs.");
    }
  }

  function addBullets(text) {
    return text.split(",").map((item) => `• ${item.trim()}`);
  }

  function handleDownload() {
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 10;
    const pageWidth = 210;

    // --- HEADER ---
    pdf.setFillColor(63, 81, 181);
    pdf.rect(0, 0, pageWidth, 30, "F");
    pdf.setFontSize(22);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text(formData.name || "Your Name", margin + 50, 18);

    // --- PHOTO ---
    if (formData.photo) {
      pdf.addImage(
        "data:image/jpeg;base64," + formData.photo,
        "JPEG",
        margin,
        5,
        35,
        35,
        undefined,
        "FAST"
      );
    }

    // --- LEFT COLUMN ---
    let leftX = margin;
    let leftY = 45;
    const leftSections = ["Contact Info", "Certifications", "Hobbies", "Languages"];
    leftSections.forEach((section) => {
      let content = null;
      if (section === "Contact Info") {
        content = [
          formData.email && `Email: ${formData.email}`,
          formData.phone && `Phone: ${formData.phone}`,
          formData.address && `Address: ${formData.address}`,
          formData.linkedin && `LinkedIn: ${formData.linkedin}`,
          formData.github && `GitHub: ${formData.github}`,
        ].filter(Boolean);
      } else {
        content = formData[section.toLowerCase()]
          ? addBullets(formData[section.toLowerCase()])
          : null;
      }

      if (content && content.length > 0) {
        pdf.setFillColor(220, 220, 220);
        pdf.rect(leftX - 2, leftY - 5, 55, 7, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text(section, leftX, leftY);
        leftY += 7;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        content.forEach((line) => {
          const splitLines = pdf.splitTextToSize(line, 55);
          splitLines.forEach((l) => {
            pdf.text(l, leftX, leftY);
            leftY += 5;
          });
        });
        leftY += 5;
      }
    });

    // --- RIGHT COLUMN ---
    let rightX = 70;
    let rightY = 45;
    const rightSections = [
      { title: "Professional Summary", key: "summary" },
      { title: "Skills", key: "skills" },
      { title: "Education", key: "education" },
      { title: "Experience", key: "experience" },
    ];

    rightSections.forEach(({ title, key }) => {
      if (formData[key]) {
        pdf.setFillColor(200, 200, 200);
        pdf.rect(rightX - 2, rightY - 5, 130, 7, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(title, rightX, rightY);
        rightY += 7;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        if (key === "skills") {
          const skills = addBullets(formData.skills);
          skills.forEach((skill) => {
            const splitSkill = pdf.splitTextToSize(skill, 120);
            splitSkill.forEach((s) => {
              pdf.text(s, rightX, rightY);
              rightY += 5;
            });
          });
          rightY += 5;
        } else {
          const lines = pdf.splitTextToSize(formData[key], 120);
          lines.forEach((line) => {
            pdf.text(line, rightX, rightY);
            rightY += 5;
          });
          rightY += 5;
        }
      }
    });

    pdf.save(`${formData.name || "Resume"}_Resume.pdf`);
  }

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: fontStyle, // ✅ apply font style
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: darkMode ? "#121212" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ fontFamily: fontStyle, color: darkMode ? "#ffffff" : "#000000" }}>
        Build Your Resume
      </h2>
      <form id="resume-form" onSubmit={handleSubmit} style={{ fontFamily: fontStyle }}>
        <input
          type="file"
          id="photo"
          accept="image/*"
          onChange={handleChange}
          style={{
            marginBottom: "1rem",
            color: darkMode ? "#ffffff" : "#000000",
            fontFamily: fontStyle,
          }}
        />
        <input
          type="text"
          id="name"
          placeholder="Full Name"
          required
          value={formData.name}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <input
          type="text"
          id="phone"
          placeholder="Phone Number"
          required
          value={formData.phone}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <input
          type="text"
          id="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <input
          type="text"
          id="linkedin"
          placeholder="LinkedIn URL"
          value={formData.linkedin}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <input
          type="text"
          id="github"
          placeholder="GitHub URL"
          value={formData.github}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <textarea
          id="summary"
          placeholder="Professional Summary"
          rows="4"
          value={formData.summary}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <input
          type="text"
          id="skills"
          placeholder="Skills (comma separated)"
          value={formData.skills}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <textarea
          id="education"
          placeholder="Education Details"
          rows="3"
          value={formData.education}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <textarea
          id="experience"
          placeholder="Experience Details"
          rows="3"
          value={formData.experience}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <textarea
          id="certifications"
          placeholder="Certifications (comma separated)"
          rows="2"
          value={formData.certifications}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <textarea
          id="hobbies"
          placeholder="Hobbies (comma separated)"
          rows="2"
          value={formData.hobbies}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />
        <textarea
          id="languages"
          placeholder="Languages Known (comma separated)"
          rows="2"
          value={formData.languages}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            fontFamily: fontStyle,
          }}
        />

        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            backgroundColor: "#3f51b5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem",
            fontFamily: fontStyle,
          }}
        >
          Generate Resume
        </button>
        {showResume && (
          <button
            type="button"
            onClick={handleDownload}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: fontStyle,
            }}
          >
            Download PDF
          </button>
        )}
      </form>
    </div>
  );
}
