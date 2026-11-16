# 🎓 Integrated Career & Recruitment Portal

A full-stack **Career & Recruitment Portal** designed to streamline the campus placement process by connecting Students, Recruiters, and Administrators on a single platform.

The platform provides dedicated dashboards and integrated tools to manage recruitment activities, including job postings, applications, assessments, interviews, project reviews, offer management, career development, and placement analytics.

---

## 📌 Project Overview

The Integrated Career & Recruitment Portal digitizes the campus recruitment workflow followed by educational institutions.

- **Students** can create professional profiles, build resumes, explore job opportunities, apply for positions, attend assessments, track applications, and receive personalized career guidance.
- **Recruiters** can publish job opportunities, create assessments, review candidates, shortlist applicants, schedule interviews, and manage placement offers.
- **Administrators** can manage platform activities, approve recruiters, monitor recruitment progress, and access placement analytics.

---

## ✨ Key Features

### 👨‍🎓 Student Portal

- Student Registration and Login
- Google Authentication (when configured)
- Professional Profile Management
- Profile Picture Upload and Customization
- Resume Upload and Resume Builder
- Customizable Resume Templates
- Option to Include or Exclude Profile Picture in Resumes
- Skills, Certifications, and Educational Details
- Project Portfolio Management
- Browse and Search Job Opportunities
- Apply for Jobs
- Track Application Status
- Attend Recruiter Assessments
- View Assessment Results
- Track Interview Schedules
- Manage Placement Offers
- AI Resume Scanner
- ATS Compatibility Analysis
- AI Career Mentor
- Personalized Skill Gap Analysis
- Dynamic Career Goals and Learning Roadmaps
- Placement Progress Tracking
- Notification Bell

### 🏢 Recruiter Portal

- Recruiter Registration
- Admin Approval Workflow
- Company Dashboard
- Publish Job Opportunities
- Manage Job Listings
- Create Technical Assessments
- Review Candidate Assessment Scores
- Review Student Projects
- Rate Student Projects
- Provide Rejection Feedback
- Shortlist Candidates
- Schedule Interviews
- Extend Offer Letters
- View Hiring Analytics
- Notification Management

### 🛡️ Admin Portal

- Secure Admin Login
- Recruiter Approval and Suspension
- Student Management
- Recruiter Management
- Job Moderation
- Assessment Monitoring
- Interview Management
- Placement Offer Tracking
- Analytics Dashboard
- Audit Logs
- Report Generation
- CSV Export
- Notification Management
- System Settings

---

## 📊 Dashboards

### Student Dashboard
- Placement Progress
- Applied Jobs
- Upcoming Assessments
- Latest Application Status
- ATS Compatibility Score
- Career Development Tracking

### Recruiter Dashboard
- Total Jobs
- Active Jobs
- Applications Received
- Published Assessments
- Shortlisted Candidates
- Hiring Pipeline
- Offer Acceptance Rate

### Admin Dashboard
- Total Students
- Total Recruiters
- Active Jobs
- Total Applications
- Placement Statistics
- Interview Statistics
- Offer Statistics
- Placement Analytics

---

## 🤖 AI-Powered Features

### AI Resume Scanner
Analyzes uploaded resumes and provides ATS compatibility insights to help candidates improve their resumes.

### AI Career Mentor
Provides personalized career guidance based on candidate profiles, skills, education, projects, and target placement roles.

### Career Goals and Learning Roadmap
Generates personalized learning milestones, identifies missing skills, and tracks progress toward the selected career goal.

### Skill Gap Analysis
Compares candidate skills with target role requirements and highlights areas that need improvement.

---

## 📈 Placement Analytics

The portal provides interactive analytics using Recharts.

- Monthly Applications
- Company-wise Placements
- Department-wise Placements
- Highest Package
- Average Package
- Offer Acceptance Rate
- Assessment Completion Statistics

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- HTML5
- CSS3
- Recharts

### Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt
- Multer
- Nodemailer

### Database
- MySQL

---

## 📂 Project Structure

```text
Integrated-Career-And-Recruitment-Portal/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
├── architecture_design.md
├── database_design.md
└── README.md
```

---

## 🔐 Authentication and Authorization

The platform supports three user roles with role-based access.

**Student**
- Register and Login
- Manage Profile
- Apply for Jobs
- Attend Assessments
- Track Applications

**Recruiter**
- Register
- Wait for Admin Approval
- Login after Approval
- Manage Recruitment Activities

**Administrator**
- Secure Login
- Manage Students and Recruiters
- Approve Recruiters
- Monitor Platform Activities

Authentication methods and access permissions depend on the application's configured environment.

---

## 🚀 Installation and Setup

### Prerequisites

- Node.js
- npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Mathujaa/Integrated-Career-And-Recruitment-Portal.git
```

```bash
cd Integrated-Career-And-Recruitment-Portal
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder.

### 3. Environment Variables

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=career_portal

JWT_SECRET=your_secret_key
```

Configure any additional environment variables required by your application.

### 4. Start Backend

```bash
npm run dev
```

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at the local development URL provided by Vite, typically:

```text
http://localhost:5173
```

---

## 📸 Application Screenshots

Screenshots of the major application modules can be added here.

Suggested screenshots:

1. Login and Registration
2. Student Dashboard
3. Student Profile
4. Resume Builder
5. AI Resume Scanner
6. AI Career Mentor
7. Career Goals and Learning Roadmap
8. Job Search and Applications
9. Recruiter Dashboard
10. Admin Dashboard
11. Assessment Module
12. Interview Management
13. Placement Analytics

---

## 🔮 Future Enhancements

- AI Interview Assistant
- Advanced Resume PDF Customization
- Company Chat System
- Video Interview Integration
- Email OTP Authentication
- Two-Factor Authentication
- Mobile Application

---

## 👩‍💻 Author

**Mathujaa P M**

Computer Science and Engineering Student

- GitHub: https://github.com/Mathujaa

---

## ⭐ Support

If you find this project interesting, consider giving the repository a ⭐ on GitHub!

Your support is appreciated.
