import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Upcoming"); // default view
  const [now, setNow] = useState(new Date());

  const token = localStorage.getItem("token");
  const theme = localStorage.getItem("theme") || "light";
  const darkMode = theme === "dark";

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/student/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data || []);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "❌ Failed to fetch applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token]);

  // Live update time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading applications...</p>;
  if (!applications.length) return <p>No applications submitted yet.</p>;

  // Compute start & end dates based on job duration
  const computeDates = (app) => {
    const applied = new Date(app.applied_at);
    const durStr = (app.jobDuration || "").toLowerCase();
    const numMatch = durStr.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0], 10) : 1;

    let startDate = new Date(applied);
    let endDate = new Date(applied);

    if (durStr.includes("hour")) {
      endDate.setHours(endDate.getHours() + num);
    } else if (durStr.includes("day")) {
      startDate.setDate(startDate.getDate() + 1);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (num - 1));
    } else if (durStr.includes("month")) {
      startDate.setDate(startDate.getDate() + 1);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + num);
      endDate.setDate(endDate.getDate() - 1);
    } else {
      startDate.setDate(startDate.getDate() + 1);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
    }

    return { ...app, startDate, endDate };
  };

  const withDates = applications.map(computeDates);

  // Classification
  const ongoing = withDates.filter((a) => now >= a.startDate && now <= a.endDate);
  const upcoming = withDates.filter((a) => a.startDate > now);
  const completed = withDates.filter((a) => a.endDate < now);

  let list = ongoing;
  if (filter === "Upcoming") list = upcoming;
  if (filter === "Completed") list = completed;

  const cardStyle = {
    backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    borderLeft: "5px solid #3f51b5",
    color: darkMode ? "#ffffff" : "#000000",
  };

  return (
    <div
      style={{
        paddingLeft: "50px",
        paddingTop: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: darkMode ? "#121212" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        📌 My Internships
      </h2>

      {/* Dropdown Filter */}
      <label style={{ display: "block", marginBottom: "1rem" }}>
        <strong>Show: </strong>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            marginLeft: "0.5rem",
            padding: "0.25rem 0.5rem",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="Ongoing">✅ Ongoing</option>
          <option value="Upcoming">⏳ Upcoming</option>
          <option value="Completed">⌛ Completed</option>
        </select>
      </label>

      {/* Rendered Applications */}
      {list.length === 0 ? (
        <p>No {filter} internships.</p>
      ) : (
        list.map((app) => (
          <div key={app.id} style={cardStyle}>
            <h3 style={{ margin: 0 }}>
              {app.jobTitle} {app.jobDuration ? `(${app.jobDuration})` : ""}
            </h3>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>Start:</strong> {app.startDate.toLocaleString()}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>End:</strong> {app.endDate.toLocaleString()}
            </p>
            <p style={{ margin: "0.25rem 0" }}>
              <strong>Employer:</strong> {app.employerName || "—"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
