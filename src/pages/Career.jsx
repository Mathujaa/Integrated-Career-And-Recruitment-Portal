import { useEffect, useState } from "react";
import { 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  ExternalLink,
  Search,
  ArrowLeft,
  PlayCircle,
  Download,
  Share2,
  Star,
  Clock,
  Users,
  Zap,
  BarChart3,
  Lightbulb,
  Rocket,
  Globe,
  Code,
  Palette,
  Megaphone
} from "lucide-react";

export default function Career() {
  const [domain, setDomain] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerProgress, setCareerProgress] = useState({});
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const interviewLevels = [
    "LEVEL 1 — Aptitude & Logical Round",
    "LEVEL 2 — Technical (Coding & Domain)",
    "LEVEL 3 — HR & Behavioural Round",
  ];

  const domains = {
    "Web Development": {
      logo: "🌐",
      icon: <Code className="domain-icon" />,
      description: "Master frontend and backend skills to build interactive websites.",
      careers: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Web Designer",
        "DevOps Engineer",
      ],
      color: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    },
    "Data Science": {
      logo: "📊",
      icon: <BarChart3 className="domain-icon" />,
      description: "Learn data analysis, machine learning, and predictive modeling.",
      careers: [
        "Data Analyst",
        "Data Scientist",
        "ML Engineer",
        "AI Engineer",
        "Data Engineer",
      ],
      color: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    },
    "UI/UX Design": {
      logo: "🎨",
      icon: <Palette className="domain-icon" />,
      description: "Design intuitive interfaces and enhance user experience.",
      careers: [
        "UI Designer",
        "UX Researcher",
        "Product Designer",
        "Interaction Designer",
        "Design Strategist",
      ],
      color: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    },
    "Digital Marketing": {
      logo: "📱",
      icon: <Megaphone className="domain-icon" />,
      description: "Grow brands online using SEO, ads, and social media campaigns.",
      careers: [
        "SEO Specialist",
        "Content Strategist",
        "Social Media Manager",
        "PPC Specialist",
        "Email Marketer",
      ],
      color: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    },
  };

 
  const levelDetails = {
    "Frontend Developer": {
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Quantitative Aptitude, Logical Reasoning, Basic Computer Fundamentals (HTML/CSS)"],
          resources: [
            { name: "Indiabix (Aptitude)", link: "https://www.indiabix.com/" },
            { name: "RS Aggarwal - Quantitative Aptitude PDF", link: "https://www.pdfdrive.com/quantitative-aptitude-by-r-s-aggarwal-d18834153.html" },
          ],
        },
        {
          title: "Level 2 — Technical (Coding & Frontend)",
          topics: ["JavaScript ES6+, DOM, React (components, hooks), CSS Flex/Grid, mini projects"],
          resources: [
            { name: "JavaScript.info", link: "https://javascript.info/" },
            { name: "React Official Docs", link: "https://react.dev/" },
            { name: "Frontend Interview Handbook", link: "https://frontendinterviewhandbook.com/" },
            { name: "LeetCode Easy JS Problems", link: "https://leetcode.com/problemset/all/?difficulty=Easy&topicSlugs=javascript" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["STAR method, project walkthrough, teamwork, communication"],
          resources: [
            { name: "PrepInsta HR Q&A", link: "https://prepinsta.com/" },
            { name: "YouTube HR Interview Tips", link: "https://www.youtube.com/results?search_query=hr+interview+questions" },
          ],
        },
      ],
    },
    "Backend Developer": {
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Aptitude: quantitative & reasoning, DBMS & OS basics, OOP fundamentals"],
          resources: [
            { name: "RS Aggarwal - Quantitative Aptitude PDF", link: "https://www.pdfdrive.com/quantitative-aptitude-by-r-s-aggarwal-d18834153.html" },
            { name: "Indiabix (Aptitude)", link: "https://www.indiabix.com/" },
          ],
        },
        {
          title: "Level 2 — Technical (Backend)",
          topics: ["Java + Spring Boot or Node.js + Express, REST API design, DB optimization, deployment"],
          resources: [
            { name: "Spring Boot Guides", link: "https://spring.io/guides" },
            { name: "Node.js Official Docs", link: "https://nodejs.org/en/docs/" },
            { name: "PostgreSQL Tutorials", link: "https://www.postgresqltutorial.com/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Explain design decisions, past bugs resolved, team interactions"],
          resources: [
            { name: "PrepInsta HR", link: "https://prepinsta.com/" },
            { name: "YouTube HR Interview Tips", link: "https://www.youtube.com/results?search_query=hr+interview+questions" },
          ],
        },
      ],
    },
    "Full Stack Developer": {
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Basic web fundamentals, logical reasoning, basic DB concepts"],
          resources: [
            { name: "Indiabix (Aptitude)", link: "https://www.indiabix.com/" },
            { name: "RS Aggarwal - Quantitative Aptitude PDF", link: "https://www.pdfdrive.com/quantitative-aptitude-by-r-s-aggarwal-d18834153.html" },
          ],
        },
        {
          title: "Level 2 — Technical (Fullstack)",
          topics: ["React + Node/Java basics, API integration, deployment, CRUD project"],
          resources: [
            { name: "FreeCodeCamp Full Stack Tutorials", link: "https://www.freecodecamp.org/learn/" },
            { name: "React Official Docs", link: "https://react.dev/" },
            { name: "Node.js Official Docs", link: "https://nodejs.org/en/docs/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Project walkthrough, team-fit & conflict-resolution examples"],
          resources: [
            { name: "YouTube: HR Interviews", link: "https://www.youtube.com/results?search_query=HR+interview+tips" },
            { name: "PrepInsta HR", link: "https://prepinsta.com/" },
          ],
        },
      ],
    },
    "Web Designer": {
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Visual reasoning, color theory, design layouts"],
          resources: [
            { name: "Interaction Design Foundation - Design Basics", link: "https://www.interaction-design.org/courses/design-thinking" },
          ],
        },
        {
          title: "Level 2 — Technical (Design Tools)",
          topics: ["Figma/Adobe XD, wireframing, prototyping, responsive design"],
          resources: [
            { name: "Figma Learn", link: "https://www.figma.com/learn" },
            { name: "Adobe XD Tutorials", link: "https://helpx.adobe.com/xd/tutorials.html" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Presentation skills, defending design choices"],
          resources: [
            { name: "Design Case Studies", link: "https://www.behance.net/" },
          ],
        },
      ],
    },
    "DevOps Engineer": {
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Linux basics, shell logic, troubleshooting"],
          resources: [
            { name: "Linux Tutorials", link: "https://www.tutorialspoint.com/unix/index.htm" },
          ],
        },
        {
          title: "Level 2 — Technical (DevOps Tools)",
          topics: ["Git, Jenkins/GitHub Actions, Docker, Kubernetes, Cloud basics"],
          resources: [
            { name: "Git Docs", link: "https://git-scm.com/doc" },
            { name: "Jenkins Tutorials", link: "https://www.jenkins.io/doc/tutorials/" },
            { name: "Docker Docs", link: "https://docs.docker.com/" },
            { name: "Kubernetes Docs", link: "https://kubernetes.io/docs/home/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Incident handling, collaboration with devs & SREs"],
          resources: [
            { name: "DevOps Case Studies", link: "https://www.atlassian.com/devops/case-studies" },
          ],
        },
      ],
    },
    "Data Analyst": {
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Statistics basics, logical reasoning, Excel proficiency"],
          resources: [
            { name: "Khan Academy Statistics", link: "https://www.khanacademy.org/math/statistics-probability" },
            { name: "SQL Basics Tutorial", link: "https://www.w3schools.com/sql/" },
          ],
        },
        {
          title: "Level 2 — Technical (Data Analysis)",
          topics: ["Python (pandas, numpy), SQL queries, data cleaning, visualization (Tableau/PowerBI)"],
          resources: [
            { name: "Kaggle Learn (Python & Pandas)", link: "https://www.kaggle.com/learn/pandas" },
            { name: "Tableau Training", link: "https://www.tableau.com/learn/training" },
            { name: "Power BI Tutorials", link: "https://learn.microsoft.com/en-us/power-bi/guided-learning/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Present insights story, explain trade-offs, stakeholder communication"],
          resources: [
            { name: "Storytelling with Data", link: "https://www.storytellingwithdata.com/" },
          ],
        },
      ],
    },
  
  
    "Data Scientist": {
      goal: "Design, train and validate predictive models and communicate outcomes.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Probability, statistics, hypothesis testing"],
          resources: [
            { name: "Khan Academy Probability & Statistics", link: "https://www.khanacademy.org/math/statistics-probability" },
          ],
        },
        {
          title: "Level 2 — Technical (ML)",
          topics: ["ML algorithms, model selection, feature engineering, Python/Scikit-learn"],
          resources: [
            { name: "Coursera ML by Andrew Ng", link: "https://www.coursera.org/learn/machine-learning" },
            { name: "Scikit-learn Docs", link: "https://scikit-learn.org/stable/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Explain models in business terms, reproducibility, limitations"],
          resources: [
            { name: "Kaggle Competitions & Writeups", link: "https://www.kaggle.com/competitions" },
          ],
        },
      ],
    },
    "ML Engineer": {
      goal: "Take ML models to production — training, optimization, deployment.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Linear algebra basics, probability, debugging logic"],
          resources: [
            { name: "Khan Academy Linear Algebra", link: "https://www.khanacademy.org/math/linear-algebra" },
          ],
        },
        {
          title: "Level 2 — Technical (ML Engineering)",
          topics: ["TensorFlow/PyTorch basics, model optimization, deployment patterns"],
          resources: [
            { name: "TensorFlow Tutorials", link: "https://www.tensorflow.org/tutorials" },
            { name: "PyTorch Tutorials", link: "https://pytorch.org/tutorials/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Performance trade-offs, monitoring models, incident scenarios"],
          resources: [
            { name: "MLOps Resources", link: "https://ml-ops.org/" },
          ],
        },
      ],
    },
    "AI Engineer": {
      goal: "Build specialized AI solutions (NLP, CV) and integrate them to products.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Neural network intuition, logic reasoning"],
          resources: [
            { name: "AI For Everyone (Coursera)", link: "https://www.coursera.org/specializations/ai-for-everyone" },
          ],
        },
        {
          title: "Level 2 — Technical (AI Models)",
          topics: ["Deep learning architectures, transfer learning, frameworks"],
          resources: [
            { name: "Fast.ai", link: "https://www.fast.ai/" },
            { name: "DeepLearning.ai", link: "https://www.deeplearning.ai/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Ethics, trade-offs, deployment strategies"],
          resources: [
            { name: "AI Ethics Readings", link: "https://plato.stanford.edu/entries/ethics-ai/" },
          ],
        },
      ],
    },
    "Data Engineer": {
      goal: "Design & implement robust data pipelines and storage structures.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["SQL fundamentals, ETL logic, logical puzzles"],
          resources: [
            { name: "SQLZoo", link: "https://sqlzoo.net/" },
          ],
        },
        {
          title: "Level 2 — Technical (Data Engineering)",
          topics: ["ETL tools, Spark/Hadoop basics, workflow orchestration (Airflow)"],
          resources: [
            { name: "Apache Spark Docs", link: "https://spark.apache.org/docs/latest/" },
            { name: "Airflow Docs", link: "https://airflow.apache.org/docs/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Explain pipeline design choices, scalability considerations"],
          resources: [
            { name: "Data Engineering Podcast & Case Studies", link: "https://www.dataengineeringpodcast.com/" },
          ],
        },
      ],
    },
    "UI Designer": {
      goal: "Create visually consistent, accessible UI components & mockups.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Typography, color theory, layout reasoning"],
          resources: [
            { name: "Material Design Guidelines", link: "https://material.io/" },
            { name: "Khan Academy Art & Design Basics", link: "https://www.khanacademy.org/arts" },
          ],
        },
        {
          title: "Level 2 — Technical (UI Tools)",
          topics: ["Figma/Sketch, component libraries, responsive patterns"],
          resources: [
            { name: "Figma Learn", link: "https://www.figma.com/learn" },
            { name: "Sketch Tutorials", link: "https://www.sketch.com/docs/" },
            { name: "UI Design Patterns", link: "https://uidesigndaily.com/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Pitching designs, receiving feedback, iteration stories"],
          resources: [
            { name: "Design Presentation Tips", link: "https://www.interaction-design.org/courses/design-thinking" },
          ],
        },
      ],
    },
    "UX Researcher": {
      goal: "Conduct user research, translate data into UX improvements.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Research methodology, logic & sampling basics"],
          resources: [
            { name: "Interaction Design Foundation - UX Research", link: "https://www.interaction-design.org/literature/topics/ux-research" },
            { name: "Coursera UX Research Courses", link: "https://www.coursera.org/courses?query=ux%20research" },
          ],
        },
        {
          title: "Level 2 — Technical (UX Research)",
          topics: ["Interviewing, surveys, journey mapping, usability testing"],
          resources: [
            { name: "NNGroup Articles", link: "https://www.nngroup.com/articles/" },
            { name: "Usability.gov Research Methods", link: "https://www.usability.gov/how-to-and-tools/methods/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Presenting findings to stakeholders, synthesis stories"],
          resources: [
            { name: "UX Case Studies", link: "https://uxdesign.cc/" },
          ],
        },
      ],
    },
    "Product Designer": {
      goal: "Define product UX & UI to solve user problems end-to-end.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Design thinking, market reasoning, user empathy"],
          resources: [
            { name: "IDEO Design Thinking", link: "https://www.ideou.com/pages/design-thinking" },
          ],
        },
        {
          title: "Level 2 — Technical (Product Design)",
          topics: ["Personas, wireframes, high-fidelity prototypes"],
          resources: [
            { name: "Design Workshops & Tutorials", link: "https://uxdesign.cc/" },
            { name: "Figma Learn", link: "https://www.figma.com/learn" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Stakeholder negotiation, product roadmap stories"],
          resources: [
            { name: "Product Case Studies", link: "https://www.behance.net/" },
          ],
        },
      ],
    },
    "Interaction Designer": {
      goal: "Design micro-interactions and motion for delightful UX.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Motion logic, timing, spatial reasoning"],
          resources: [
            { name: "Interaction Design Foundation", link: "https://www.interaction-design.org/literature/topics/interaction-design" },
          ],
        },
        {
          title: "Level 2 — Technical (Interaction)",
          topics: ["Micro-interactions, prototyping with animation tools"],
          resources: [
            { name: "Principle / Framer Tutorials", link: "https://www.framer.com/learn/" },
            { name: "Motion Design School Tutorials", link: "https://motiondesign.school/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Explain interaction decisions & usability feedback"],
          resources: [
            { name: "Animation Case Studies", link: "https://uxdesign.cc/" },
          ],
        },
      ],
    },
    "Design Strategist": {
      goal: "Plan design systems and align them with business strategy.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Market reasoning, brand logic, competitor analysis"],
          resources: [
            { name: "HBR Strategy Articles", link: "https://hbr.org/" },
          ],
        },
        {
          title: "Level 2 — Technical (Strategy)",
          topics: ["Design systems, governance, cross-team alignment"],
          resources: [
            { name: "Design Systems Resources", link: "https://www.designsystems.com/" },
            { name: "Smashing Magazine Design Systems", link: "https://www.smashingmagazine.com/category/design-systems/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Presenting strategy decks, stakeholder persuasion"],
          resources: [
            { name: "Slideshare Presentations", link: "https://www.slideshare.net/" },
          ],
        },
      ],
    },
    "SEO Specialist": {
      goal: "Improve organic traffic through on-page & off-page SEO skills.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Analytical aptitude, keyword reasoning, basic marketing logic"],
          resources: [
            { name: "Google Search Central", link: "https://developers.google.com/search" },
          ],
        },
        {
          title: "Level 2 — Technical (SEO)",
          topics: ["Keyword research, on-page SEO, analytics"],
          resources: [
            { name: "Ahrefs Blog", link: "https://ahrefs.com/blog" },
            { name: "Moz Beginner's Guide to SEO", link: "https://moz.com/beginners-guide-to-seo" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Explain campaigns, ROI thinking, client interactions"],
          resources: [
            { name: "SEO Case Studies", link: "https://backlinko.com/seo-case-studies" },
          ],
        },
      ],
    },
    "Content Strategist": {
      goal: "Plan high-impact content & distribution strategies.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Content planning logic, storytelling basics"],
          resources: [
            { name: "Content Marketing Institute", link: "https://contentmarketinginstitute.com/" },
          ],
        },
        {
          title: "Level 2 — Technical (Content)",
          topics: ["SEO copywriting, editorial calendars, analytics"],
          resources: [
            { name: "Copyblogger", link: "https://copyblogger.com/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Campaign wins/losses, iteration stories"],
          resources: [
            { name: "Campaign Case Studies", link: "https://contently.com/resources/case-studies/" },
          ],
        },
      ],
    },
    "Social Media Manager": {
      goal: "Drive engagement & growth across social platforms.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Platform analytics basics, creative problem solving"],
          resources: [
            { name: "Sprout Social Insights", link: "https://sproutsocial.com/insights/social-media-analytics/" },
          ],
        },
        {
          title: "Level 2 — Technical (Social Ads)",
          topics: ["Ad campaign setup, content calendars, UTM tracking"],
          resources: [
            { name: "Facebook Blueprint", link: "https://www.facebook.com/business/learn" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Brand voice examples, crisis handling stories"],
          resources: [
            { name: "Social Media Case Studies", link: "https://www.socialmediaexaminer.com/case-studies/" },
          ],
        },
      ],
    },
    "PPC Specialist": {
      goal: "Run cost-efficient paid campaigns and measure ROI.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Analytical aptitude, understanding metrics (CPC, CTR) basics"],
          resources: [
            { name: "Google Ads Help", link: "https://support.google.com/google-ads" },
          ],
        },
        {
          title: "Level 2 — Technical (PPC)",
          topics: ["Bid strategies, A/B testing, optimization loops"],
          resources: [
            { name: "Google Skillshop", link: "https://skillshop.withgoogle.com/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Campaign post-mortem stories, budget trade-offs"],
          resources: [
            { name: "PPC Case Studies", link: "https://www.wordstream.com/blog/ws/2019/08/06/ppc-case-studies" },
          ],
        },
      ],
    },
    "Email Marketer": {
      goal: "Design automated, conversion-focused email flows.",
      levels: [
        {
          title: "Level 1 — Aptitude & Logical",
          topics: ["Segmentation logic, metrics (open, CTR) basics"],
          resources: [
            { name: "Mailchimp Guides", link: "https://mailchimp.com/resources/" },
          ],
        },
        {
          title: "Level 2 — Technical (Email Tools)",
          topics: ["Automation & workflows, A/B testing, deliverability"],
          resources: [
            { name: "Campaign Monitor Resources", link: "https://www.campaignmonitor.com/resources/" },
          ],
        },
        {
          title: "Level 3 — HR & Behavioural",
          topics: ["Campaign case studies, copy & design collaboration stories"],
          resources: [
            { name: "Email Campaign Case Studies", link: "https://www.campaignmonitor.com/resources/case-studies/" },
          ],
        },
      ],
    },
    // Add other careers similarly...
  };

 
// Restore progress
useEffect(() => {
  const saved = localStorage.getItem("careerProgress_v1");
  if (saved) {
    try {
      setCareerProgress(JSON.parse(saved));
    } catch {}
  }
}, []);

// Save progress
useEffect(() => {
  localStorage.setItem("careerProgress_v1", JSON.stringify(careerProgress));
}, [careerProgress]);

useEffect(() => {
  // Initial theme load
  const savedTheme = localStorage.getItem("theme") || "light";
  setIsDarkMode(savedTheme === "dark");

  // Listen for theme changes from account settings
  const handleThemeChange = () => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setIsDarkMode(currentTheme === "dark");
  };

  // Add event listener for custom theme change events
  window.addEventListener('themeChange', handleThemeChange);
  
  // Also check for changes periodically (fallback)
  const interval = setInterval(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    if ((currentTheme === "dark") !== isDarkMode) {
      setIsDarkMode(currentTheme === "dark");
    }
  }, 1000);

  return () => {
    window.removeEventListener('themeChange', handleThemeChange);
    clearInterval(interval);
  };
}, [isDarkMode]);

// Force component update when theme changes
useEffect(() => {
  // This will trigger a re-render when isDarkMode changes
}, [isDarkMode]);

const toggleCompletion = (career, levelIndex) => {
  const key = `${career}-L${levelIndex}`;
  setCareerProgress((prev) => ({ ...prev, [key]: !prev[key] }));
};

const getProgress = (career) => {
  const total = interviewLevels.length;
  let completed = 0;
  for (let i = 0; i < total; i++) {
    if (careerProgress[`${career}-L${i}`]) completed++;
  }
  return Math.round((completed / total) * 100);
};

const markAll = (career) => {
  const updates = {};
  for (let i = 0; i < interviewLevels.length; i++) {
    updates[`${career}-L${i}`] = true;
  }
  setCareerProgress((prev) => ({ ...prev, ...updates }));
};

const resetProgress = (career) => {
  const updates = {};
  for (let i = 0; i < interviewLevels.length; i++) {
    updates[`${career}-L${i}`] = false;
  }
  setCareerProgress((prev) => ({ ...prev, ...updates }));
};

const toggleExpand = (levelIndex) => {
  setExpandedLevel(expandedLevel === levelIndex ? null : levelIndex);
};

const filteredCareers = domain ? domains[domain].careers.filter(career => 
  career.toLowerCase().includes(searchTerm.toLowerCase())
) : [];

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Beginner": return "#10b981";
    case "Intermediate": return "#f59e0b";
    case "Advanced": return "#ef4444";
    default: return "#6b7280";
  }
};

const getResourceTypeColor = (type) => {
  switch (type) {
    case "Practice": return "#3b82f6";
    case "Book": return "#8b5cf6";
    case "Tutorial": return "#10b981";
    case "Documentation": return "#f59e0b";
    case "Guide": return "#ef4444";
    case "Video": return "#ec4899";
    case "Case Study": return "#8b5cf6";
    default: return "#6b7280";
  }
};

return (
  <>
    <style>
      {`
        .career-portal {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
          background: transparent;
          color: var(--text-color);
          transition: all 0.3s ease;
        }

        /* Light mode variables */
        .career-portal:not(.dark-mode) {
          --bg-color: transparent;
          --text-color: #1f2937;
          --card-bg: #ffffff;
          --border-color: #e5e7eb;
          --muted-text: #6b7280;
          --hover-bg: #f8fafc;
          --shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          --shadow-hover: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        /* Dark mode variables */
        .career-portal.dark-mode {
          --bg-color: transparent;
          --text-color: #f9fafb;
          --card-bg: #374151;
          --border-color: #4b5563;
          --muted-text: #9ca3af;
          --hover-bg: #4b5563;
          --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          --shadow-hover: 0 8px 20px rgba(0, 0, 0, 0.4);
        }

        /* Compact Domain Selection */
        .domain-selection {
          padding: 40px 20px;
          background: transparent;
          color: var(--text-color);
          border-radius: 0;
          margin-bottom: 40px;
        }

        .portal-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .portal-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--hover-bg);
          padding: 8px 16px;
          border-radius: 20px;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 0.8rem;
          color: var(--muted-text);
        }

        .portal-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-color);
          line-height: 1.2;
        }

        .portal-subtitle {
          font-size: 0.95rem;
          color: var(--muted-text);
          line-height: 1.5;
          font-weight: 400;
        }

        .domains-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          max-width: 100%;
          margin: 0 auto;
        }

        .domain-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }

        .domain-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: #3b82f6;
        }

        .domain-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-hover);
        }

        .domain-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .domain-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.4rem;
          transition: all 0.3s ease;
        }

        .domain-card:hover .domain-icon-wrapper {
          transform: scale(1.1);
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .domain-card h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
        }

        .domain-card p {
          color: var(--muted-text);
          margin-bottom: 24px;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .domain-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .career-count {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--muted-text);
          font-weight: 500;
          font-size: 0.85rem;
        }

        .explore-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #3b82f6;
          font-weight: 600;
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 20px;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }

        .domain-card:hover .explore-link {
          background: #3b82f6;
          color: white;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Career Selection */
        .career-selection {
          padding: 30px 20px;
          background: transparent;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          color: var(--text-color);
          transition: all 0.2s ease;
          margin-bottom: 24px;
          font-weight: 500;
          font-size: 0.85rem;
        }

        .back-button:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateX(-3px);
        }

        .career-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: var(--card-bg);
          padding: 20px;
          border-radius: 12px;
          box-shadow: var(--shadow);
        }

        .career-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .domain-avatar {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: var(--domain-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .career-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
        }

        .search-section {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 12px;
          min-width: 250px;
          transition: all 0.2s ease;
        }

        .search-box:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
          color: var(--text-color);
          background: transparent;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 6px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--card-bg);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.8rem;
          color: var(--text-color);
        }

        .filter-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .careers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .career-card {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }

        .career-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--domain-color);
        }

        .career-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }

        .career-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .career-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
          flex: 1;
        }

        .completion-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .progress-section {
          margin: 16px 0;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-text {
          font-weight: 600;
          color: var(--text-color);
          font-size: 0.85rem;
        }

        .progress-percent {
          font-weight: 700;
          color: var(--domain-color);
          font-size: 0.9rem;
        }

        .progress-bar {
          height: 6px;
          background: var(--border-color);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: var(--domain-gradient);
          border-radius: 6px;
          transition: width 0.8s ease-in-out;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          color: var(--muted-text);
          font-size: 0.8rem;
          font-weight: 500;
          margin-top: 8px;
        }

        .career-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .level-count {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--muted-text);
          font-weight: 500;
          font-size: 0.8rem;
        }

        .start-learning {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--domain-color);
          font-weight: 600;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .career-card:hover .start-learning {
          transform: translateX(3px);
        }

        /* Level Details */
        .level-details {
          padding: 30px 20px;
          background: transparent;
        }

        .level-header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .career-progress-card {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 20px;
          box-shadow: var(--shadow);
          margin-bottom: 24px;
        }

        .progress-overview {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .progress-circle {
          width: 80px;
          height: 80px;
          position: relative;
        }

        .circle-bg {
          fill: none;
          stroke: var(--border-color);
          stroke-width: 6;
        }

        .circle-progress {
          fill: none;
          stroke: var(--domain-color);
          stroke-width: 6;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
          transition: stroke-dashoffset 0.8s ease-in-out;
        }

        .progress-text-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .progress-percent-circle {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-color);
        }

        .progress-label {
          font-size: 0.7rem;
          color: var(--muted-text);
          font-weight: 500;
        }

        .progress-details {
          flex: 1;
        }

        .progress-details h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-color);
        }

        .progress-details p {
          color: var(--muted-text);
          margin-bottom: 16px;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
          font-size: 0.8rem;
        }

        .btn-primary {
          background: var(--domain-color);
          color: white;
          border-color: var(--domain-color);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-secondary {
          background: var(--card-bg);
          color: var(--text-color);
          border-color: var(--border-color);
        }

        .btn-secondary:hover {
          border-color: var(--muted-text);
          background: var(--hover-bg);
        }

        .levels-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .level-card {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .level-card.expanded {
          box-shadow: var(--shadow-hover);
        }

        .level-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .level-card-header:hover {
          background: var(--hover-bg);
        }

        .level-info {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .completion-indicator {
          margin-top: 2px;
        }

        .completed {
          color: #10b981;
        }

        .incomplete {
          color: var(--muted-text);
        }

        .level-content-main {
          flex: 1;
        }

        .level-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-color);
        }

        .level-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 6px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--muted-text);
          font-weight: 500;
        }

        .difficulty-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }

        .level-description {
          font-size: 0.8rem;
          color: var(--muted-text);
          margin: 0;
        }

        .expand-arrow {
          transition: transform 0.2s ease;
          color: var(--muted-text);
        }

        .expand-arrow.expanded {
          transform: rotate(90deg);
        }

        .level-card-content {
          padding: 0 20px 20px;
          border-top: 1px solid var(--border-color);
        }

        .topics-section, .resources-section {
          margin-bottom: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-color);
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }

        .topic-item {
          background: var(--hover-bg);
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid var(--domain-color);
          transition: all 0.2s ease;
          font-size: 0.8rem;
          color: var(--text-color);
        }

        .topic-item:hover {
          background: var(--border-color);
          transform: translateX(4px);
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .resource-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
        }

        .resource-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--domain-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .resource-card:hover {
          border-color: var(--domain-color);
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }

        .resource-card:hover::before {
          transform: scaleX(1);
        }

        .resource-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .resource-name {
          font-weight: 600;
          color: var(--text-color);
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .resource-type {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
        }

        .resource-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--domain-color);
          font-weight: 600;
          font-size: 0.8rem;
          margin-top: 12px;
          transition: all 0.2s ease;
        }

        .resource-card:hover .resource-link {
          transform: translateX(4px);
        }

        .level-actions {
          display: flex;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .toggle-btn {
          padding: 8px 16px;
          border: 1px solid;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .btn-complete {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .btn-complete:hover {
          background: #059669;
          border-color: #059669;
          transform: translateY(-1px);
        }

        .btn-incomplete {
          background: var(--card-bg);
          color: var(--text-color);
          border-color: var(--border-color);
        }

        .btn-incomplete:hover {
          border-color: var(--muted-text);
          background: var(--hover-bg);
          transform: translateY(-1px);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .domains-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .domain-selection {
            padding: 24px 16px;
            border-radius: 0;
          }

          .portal-header h1 {
            font-size: 1.5rem;
          }

          .domains-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .domain-card {
            padding: 20px;
          }

          .domain-icon-wrapper {
            width: 48px;
            height: 48px;
            font-size: 1.2rem;
          }

          .career-selection, .level-details {
            padding: 20px 16px;
          }

          .career-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .career-title {
            flex-direction: column;
            gap: 12px;
          }

          .search-section {
            flex-direction: column;
            width: 100%;
          }

          .search-box {
            min-width: auto;
          }

          .careers-grid {
            grid-template-columns: 1fr;
          }

          .progress-overview {
            flex-direction: column;
            text-align: center;
          }

          .action-buttons {
            flex-wrap: wrap;
            justify-content: center;
          }

          .resources-grid {
            grid-template-columns: 1fr;
          }
        }
      `}
    </style>

    <div className={`career-portal ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Domain Selection View */}
      {!domain && (
        <div className="domain-selection">
          <div className="portal-header">
            <div className="portal-badge">
              <Rocket size={14} />
              Career Interview Portal
            </div>
            <h1>Launch Your Dream Career</h1>
            <p className="portal-subtitle">
              Select your domain, choose a career path, and follow our comprehensive 3-level preparation roadmap. Your progress is automatically saved and tracked.
            </p>
          </div>

          <div className="domains-grid">
            {Object.entries(domains).map(([key, info]) => (
              <div 
                key={key} 
                className="domain-card"
                onClick={() => setDomain(key)}
                style={{
                  '--domain-color': info.color,
                  '--domain-gradient': info.gradient,
                }}
              >
                <div className="domain-header">
                  <div className="domain-icon-wrapper">
                    {info.icon}
                  </div>
                  <h3>{key}</h3>
                </div>
                <p>{info.description}</p>
                <div className="domain-footer">
                  <div className="career-count">
                    <Users size={14} />
                    {info.careers.length} career paths
                  </div>
                  <div className="explore-link">
                    <span>Explore careers</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career Selection View */}
      {domain && !selectedCareer && (
        <div className="career-selection">
          <button 
            className="back-button"
            onClick={() => setDomain(null)}
          >
            <ArrowLeft size={14} />
            Back to Domains
          </button>

          <div className="career-header">
            <div className="career-title">
              <div 
                className="domain-avatar"
                style={{ background: domains[domain].gradient }}
              >
                {domains[domain].logo}
              </div>
              <div>
                <h2>Career Paths in {domain}</h2>
                <p>Choose your specialization and start your journey</p>
              </div>
            </div>
            
            <div className="search-section">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={`Search ${domain} careers...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${activeFilter === 'inProgress' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('inProgress')}
                >
                  In Progress
                </button>
                <button 
                  className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          <div className="careers-grid">
            {filteredCareers.map((career) => {
              const progress = getProgress(career);
              const shouldShow = activeFilter === 'all' ||
                (activeFilter === 'inProgress' && progress > 0 && progress < 100) ||
                (activeFilter === 'completed' && progress === 100);

              if (!shouldShow) return null;

              return (
                <div 
                  key={career} 
                  className="career-card"
                  onClick={() => setSelectedCareer(career)}
                  style={{
                    '--domain-color': domains[domain].color,
                    '--domain-gradient': domains[domain].gradient,
                  }}
                >
                  <div className="career-card-header">
                    <h4>{career}</h4>
                    {progress === 100 && (
                      <div className="completion-badge">
                        <Award size={12} />
                        Complete
                      </div>
                    )}
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-text">Preparation Progress</span>
                      <span className="progress-percent">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span>{Math.round(progress/100 * 3)}/3 levels</span>
                      <span>{progress === 100 ? "Ready! 🎉" : "Keep going! 💪"}</span>
                    </div>
                  </div>

                  <div className="career-card-footer">
                    <div className="level-count">
                      <BookOpen size={12} />
                      {interviewLevels.length} Levels
                    </div>
                    <div className="start-learning">
                      <span>Start Learning</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Level Details View */}
      {selectedCareer && (
        <div className="level-details">
          <div className="level-header-actions">
            <button 
              className="back-button"
              onClick={() => setSelectedCareer(null)}
            >
              <ArrowLeft size={14} />
              Back to {domain}
            </button>
          </div>

          <div 
            className="career-progress-card"
            style={{
              '--domain-color': domains[domain].color,
              '--domain-gradient': domains[domain].gradient,
            }}
          >
            <div className="progress-overview">
              <div className="progress-circle">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle className="circle-bg" cx="40" cy="40" r="36" />
                  <circle 
                    className="circle-progress" 
                    cx="40" 
                    cy="40" 
                    r="36" 
                    strokeDasharray="226.194"
                    strokeDashoffset={226.194 * (1 - getProgress(selectedCareer) / 100)}
                  />
                </svg>
                <div className="progress-text-circle">
                  <div className="progress-percent-circle">{getProgress(selectedCareer)}%</div>
                  <div className="progress-label">Complete</div>
                </div>
              </div>
              <div className="progress-details">
                <h3>{selectedCareer}</h3>
                <p>
                  Follow this comprehensive roadmap to master your interview preparation. 
                  Complete all levels to become interview-ready.
                </p>
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={() => markAll(selectedCareer)}
                  >
                    <CheckCircle2 size={14} />
                    Mark All Complete
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => resetProgress(selectedCareer)}
                  >
                    Reset Progress
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="levels-container">
            {levelDetails[selectedCareer]?.levels?.map((level, index) => (
              <div 
                key={index} 
                className={`level-card ${expandedLevel === index ? 'expanded' : ''}`}
                style={{
                  '--domain-color': domains[domain].color,
                }}
              >
                <div 
                  className="level-card-header"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="level-info">
                    <div className="completion-indicator">
                      {careerProgress[`${selectedCareer}-L${index}`] ? (
                        <CheckCircle2 className="completed" size={18} />
                      ) : (
                        <Circle className="incomplete" size={18} />
                      )}
                    </div>
                    <div className="level-content-main">
                      <h3 className="level-title">{level.title}</h3>
                      <div className="level-meta">
                        <div className="meta-item">
                          <Clock size={12} />
                          {level.duration}
                        </div>
                        <div 
                          className="difficulty-badge"
                          style={{ background: getDifficultyColor(level.difficulty) }}
                        >
                          {level.difficulty}
                        </div>
                      </div>
                      <p className="level-description">
                        {expandedLevel === index ? 'Click to collapse details' : 'Click to expand details'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`expand-arrow ${expandedLevel === index ? 'expanded' : ''}`}
                    size={16}
                  />
                </div>

                {expandedLevel === index && (
                  <div className="level-card-content">
                    <div className="topics-section">
                      <h4 className="section-title">
                        <PlayCircle size={14} />
                        Topics & Focus Areas
                      </h4>
                      <div className="topics-grid">
                        {level.topics.map((topic, i) => (
                          <div key={i} className="topic-item">
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="resources-section">
                      <h4 className="section-title">
                        <ExternalLink size={14} />
                        Learning Resources
                      </h4>
                      <div className="resources-grid">
                        {level.resources.map((resource, i) => (
                          <a
                            key={i}
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-card"
                          >
                            <div className="resource-header">
                              <div className="resource-name">{resource.name}</div>
                              <div 
                                className="resource-type"
                                style={{ background: getResourceTypeColor(resource.type) }}
                              >
                                {resource.type}
                              </div>
                            </div>
                            <div className="resource-link">
                              <span>Open Resource</span>
                              <ExternalLink size={12} />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="level-actions">
                      <button
                        onClick={() => toggleCompletion(selectedCareer, index)}
                        className={`toggle-btn ${
                          careerProgress[`${selectedCareer}-L${index}`] ? 'btn-complete' : 'btn-incomplete'
                        }`}
                      >
                        {careerProgress[`${selectedCareer}-L${index}`] 
                          ? 'Mark Incomplete' 
                          : 'Mark Complete'
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </>
);
}