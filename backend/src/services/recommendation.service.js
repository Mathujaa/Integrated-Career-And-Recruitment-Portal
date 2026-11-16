/**
 * Recommendation Service
 * Provides dynamic, personalized career roadmaps, skill gap analysis,
 * and AI mentor guidance driven by real student profile data.
 */

export const CAREER_ROLES = [
  {
    name: 'Full Stack Software Engineer',
    category: 'Engineering',
    description: 'Builds end-to-end web applications across modern client interfaces, backend APIs, relational databases, and cloud infrastructure.',
    coreSkills: ['JavaScript', 'HTML5', 'CSS3', 'React', 'Node.js', 'Express', 'SQL', 'Git'],
    advancedSkills: ['TypeScript', 'MySQL', 'MongoDB', 'Docker', 'REST APIs', 'CI/CD', 'Redis', 'Jest'],
    projectIdea: 'Build a production-grade full stack SaaS portal with JWT authentication, role-based access, and MySQL relational schema.',
    interviewChecklist: [
      { id: 1, topic: 'JavaScript Asynchronous Execution, Promises & Event Loop', category: 'Core JavaScript', completed: false },
      { id: 2, topic: 'React Reconciliation, Hooks Lifecycle & State Optimization', category: 'Frontend Architecture', completed: false },
      { id: 3, topic: 'RESTful API Design Principles & Middleware Architecture in Node/Express', category: 'Backend Systems', completed: false },
      { id: 4, topic: 'Relational Database Indexing, Foreign Keys & ACID Transactions in MySQL', category: 'Database & Storage', completed: false },
      { id: 5, topic: 'JWT Token Security, Refresh Token Rotation & CORS Configuration', category: 'Security & Auth', completed: false },
      { id: 6, topic: 'Containerization with Docker & Automated CI/CD Deployments', category: 'DevOps & Cloud', completed: false }
    ]
  },
  {
    name: 'Frontend Developer',
    category: 'Frontend',
    description: 'Specializes in crafting responsive, accessible, high-performance web user experiences and scalable client architectures.',
    coreSkills: ['JavaScript', 'HTML5', 'CSS3', 'React', 'Git', 'Responsive Design'],
    advancedSkills: ['TypeScript', 'Redux', 'Tailwind CSS', 'Vite', 'Next.js', 'Web Vitals', 'Jest', 'Accessibility (a11y)'],
    projectIdea: 'Develop an interactive design system and dashboard utilizing React, TypeScript, CSS Grid, and client-side caching.',
    interviewChecklist: [
      { id: 1, topic: 'DOM Rendering Lifecycle, Virtual DOM & React Fiber Tree', category: 'Core Frontend', completed: false },
      { id: 2, topic: 'CSS Grid, Flexbox Layout Algorithms & Responsive Media Queries', category: 'CSS & Styling', completed: false },
      { id: 3, topic: 'Core Web Vitals Optimization (LCP, FID/INP, CLS)', category: 'Performance', completed: false },
      { id: 4, topic: 'Complex State Management & Context API Performance Pitfalls', category: 'React Patterns', completed: false },
      { id: 5, topic: 'Cross-Browser Compatibility, Semantic HTML & Accessibility Standards', category: 'Web Standards', completed: false }
    ]
  },
  {
    name: 'Backend Engineer',
    category: 'Backend',
    description: 'Designs reliable microservices, database schemas, distributed caching, and secure API infrastructure handling concurrent traffic.',
    coreSkills: ['Node.js', 'Express', 'SQL', 'REST APIs', 'Git', 'Data Structures'],
    advancedSkills: ['PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Microservices', 'Message Queues (RabbitMQ/Kafka)', 'System Design', 'Unit Testing'],
    projectIdea: 'Architect a high-throughput event-driven microservice system with Redis caching, rate limiting, and database connection pooling.',
    interviewChecklist: [
      { id: 1, topic: 'SQL Query Optimization, Explain Plans & B-Tree Indexing Strategies', category: 'Database Tuning', completed: false },
      { id: 2, topic: 'Designing Idempotent REST & RPC Endpoints', category: 'API Architecture', completed: false },
      { id: 3, topic: 'Caching Strategies (Cache-Aside, Write-Through) with Redis', category: 'Distributed Systems', completed: false },
      { id: 4, topic: 'Asynchronous Background Task Processing & Message Queues', category: 'Message Brokers', completed: false },
      { id: 5, topic: 'High-Concurrency Concurrency Locks & Connection Pooling', category: 'System Design', completed: false }
    ]
  },
  {
    name: 'Mobile App Developer',
    category: 'Mobile',
    description: 'Creates cross-platform or native mobile applications with smooth gesture navigation, offline data synchronization, and native device APIs.',
    coreSkills: ['JavaScript', 'React Native', 'Mobile UI/UX', 'REST APIs', 'Git'],
    advancedSkills: ['Flutter', 'Dart', 'TypeScript', 'SQLite', 'Redux', 'Push Notifications', 'App Store Publishing', 'Firebase'],
    projectIdea: 'Build an offline-first mobile task tracker featuring local SQLite storage, biometric authentication, and push alerts.',
    interviewChecklist: [
      { id: 1, topic: 'Native Bridge Architecture vs Flutter Skia/Impeller Engine', category: 'Mobile Architecture', completed: false },
      { id: 2, topic: 'Offline Data Synchronization & SQLite Storage Patterns', category: 'Data & Storage', completed: false },
      { id: 3, topic: 'Mobile Memory Management & Battery Optimization', category: 'Performance', completed: false },
      { id: 4, topic: 'App Permissions, Keychain Storage & Push Notification Services', category: 'Device APIs', completed: false }
    ]
  },
  {
    name: 'Data Scientist & AI Engineer',
    category: 'Data & AI',
    description: 'Extracts actionable predictive models and machine learning pipelines from complex datasets to automate decision-making.',
    coreSkills: ['Python', 'SQL', 'Statistics', 'Pandas', 'NumPy', 'Data Visualization', 'Git'],
    advancedSkills: ['Scikit-Learn', 'TensorFlow', 'PyTorch', 'Feature Engineering', 'NLP', 'Jupyter', 'Data Pipelines', 'Model Deployment'],
    projectIdea: 'Develop an end-to-end predictive machine learning model and deploy it via a FastAPI microservice with interactive dashboards.',
    interviewChecklist: [
      { id: 1, topic: 'Bias-Variance Tradeoff, Regularization (L1/L2) & Overfitting Mitigation', category: 'Machine Learning', completed: false },
      { id: 2, topic: 'Feature Selection, Missing Data Imputation & Standardization', category: 'Feature Engineering', completed: false },
      { id: 3, topic: 'Classification Metrics (Precision, Recall, ROC-AUC) vs Regression Metrics', category: 'Model Evaluation', completed: false },
      { id: 4, topic: 'SQL Window Functions, Aggregations & Complex Analytical Queries', category: 'Data Querying', completed: false },
      { id: 5, topic: 'Deploying ML Models as RESTful Inference Endpoints', category: 'MLOps', completed: false }
    ]
  },
  {
    name: 'Cloud & DevOps Engineer',
    category: 'Infrastructure',
    description: 'Automates deployment pipelines, cloud provisioning, container orchestration, and real-time infrastructure observability.',
    coreSkills: ['Linux', 'Git', 'Docker', 'Bash Scripting', 'Networking Fundamentals'],
    advancedSkills: ['Kubernetes', 'AWS', 'CI/CD Pipelines', 'Terraform', 'Prometheus', 'Grafana', 'Nginx', 'Infrastructure as Code'],
    projectIdea: 'Set up an automated GitHub Actions CI/CD pipeline deploying Dockerized containers to a cloud cluster with zero-downtime rollouts.',
    interviewChecklist: [
      { id: 1, topic: 'Linux Permissions, Process Signals, Sockets & Bash Scripting', category: 'Linux Fundamentals', completed: false },
      { id: 2, topic: 'Multi-Stage Docker Image Builds & Layer Caching Techniques', category: 'Containers', completed: false },
      { id: 3, topic: 'Kubernetes Pods, Services, Ingress Controllers & ConfigMaps', category: 'Orchestration', completed: false },
      { id: 4, topic: 'CI/CD Pipeline Security, Secrets Masking & Branch Strategies', category: 'Automation', completed: false },
      { id: 5, topic: 'Cloud Network Security Groups, VPCs & Load Balancer Topologies', category: 'Cloud Architecture', completed: false }
    ]
  },
  {
    name: 'QA Automation Engineer',
    category: 'Quality Assurance',
    description: 'Builds end-to-end automated testing suites, API test harnesses, and performance stress testing into deployment pipelines.',
    coreSkills: ['JavaScript', 'Test Automation', 'Manual Testing', 'Git', 'API Testing'],
    advancedSkills: ['Playwright', 'Cypress', 'Selenium', 'Postman', 'Jest', 'CI/CD Integration', 'JMeter', 'Bug Tracking'],
    projectIdea: 'Create an automated regression and API test framework integrated with GitHub Actions that runs on every pull request.',
    interviewChecklist: [
      { id: 1, topic: 'Page Object Model (POM) Design Pattern & Flaky Test Mitigation', category: 'Test Architecture', completed: false },
      { id: 2, topic: 'API Automation Testing & Schema Validation', category: 'API Testing', completed: false },
      { id: 3, topic: 'Test Automation Integration with CI/CD Pipelines', category: 'DevOps & QA', completed: false },
      { id: 4, topic: 'Performance Benchmarking & Load Testing Metrics', category: 'Performance', completed: false }
    ]
  },
  {
    name: 'Cybersecurity Analyst',
    category: 'Security',
    description: 'Protects enterprise systems by conducting vulnerability assessments, monitoring network intrusion, and applying defensive hardening.',
    coreSkills: ['Networking', 'Linux', 'Security Fundamentals', 'Git'],
    advancedSkills: ['OWASP Top 10', 'Penetration Testing', 'Wireshark', 'Cryptography', 'SIEM Tools', 'Vulnerability Assessment', 'Firewalls'],
    projectIdea: 'Audit a web application against OWASP Top 10 vulnerabilities and formulate remediation scripts for SQLi and XSS vulnerabilities.',
    interviewChecklist: [
      { id: 1, topic: 'OWASP Top 10 Vulnerabilities: Root Causes & Remediation Tactics', category: 'Web Security', completed: false },
      { id: 2, topic: 'TCP/IP Handshake, DNS Resolution & Packet Inspection via Wireshark', category: 'Network Security', completed: false },
      { id: 3, topic: 'Symmetric vs Asymmetric Encryption, TLS Handshake & PKI Certificates', category: 'Cryptography', completed: false },
      { id: 4, topic: 'Incident Response Procedures & Log Forensic Analysis', category: 'Security Operations', completed: false }
    ]
  }
];

class RecommendationService {
  normalizeSkill(skill) {
    if (!skill || typeof skill !== 'string') return '';
    const s = skill.trim().toLowerCase();
    // Normalize aliases
    if (s === 'js' || s === 'javascript' || s === 'es6' || s === 'es6+') return 'javascript';
    if (s === 'ts' || s === 'typescript') return 'typescript';
    if (s === 'react' || s === 'reactjs' || s === 'react.js') return 'react';
    if (s === 'node' || s === 'nodejs' || s === 'node.js') return 'node.js';
    if (s === 'express' || s === 'expressjs') return 'express';
    if (s === 'postgres' || s === 'postgresql') return 'postgresql';
    if (s === 'mongo' || s === 'mongodb') return 'mongodb';
    if (s === 'html' || s === 'html5') return 'html5';
    if (s === 'css' || s === 'css3') return 'css3';
    return s;
  }

  findRoleDefinition(roleName) {
    if (!roleName) return CAREER_ROLES[0];
    const match = CAREER_ROLES.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (match) return match;
    // Fallback: match partial
    const partial = CAREER_ROLES.find(r => roleName.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(roleName.toLowerCase()));
    return partial || CAREER_ROLES[0];
  }

  analyzeSkillGaps(profile, roleName) {
    const roleDef = this.findRoleDefinition(roleName);
    const rawSkills = profile?.skills || [];
    const studentSkillNames = rawSkills.map(s => (typeof s === 'string' ? s : s.name));
    const normalizedStudentSkills = new Set(studentSkillNames.map(s => this.normalizeSkill(s)));

    const allRoleSkills = [...roleDef.coreSkills, ...roleDef.advancedSkills];
    const acquiredSkills = [];
    const missingSkills = [];

    allRoleSkills.forEach(skill => {
      const norm = this.normalizeSkill(skill);
      let found = false;
      for (const stSkill of normalizedStudentSkills) {
        if (stSkill === norm || norm.includes(stSkill) || stSkill.includes(norm)) {
          found = true;
          break;
        }
      }
      if (found) {
        acquiredSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const totalRequired = allRoleSkills.length;
    const matchScore = totalRequired > 0 ? Math.round((acquiredSkills.length / totalRequired) * 100) : 0;

    return {
      roleName: roleDef.name,
      acquiredSkills,
      missingSkills,
      recommendedNextSkills: missingSkills.slice(0, 4),
      matchScore
    };
  }

  generatePersonalizedRoadmap(profile, roleName, existingRoadmap = null) {
    const roleDef = this.findRoleDefinition(roleName);
    const gapAnalysis = this.analyzeSkillGaps(profile, roleDef.name);
    
    // Check previous progress preservation
    const previousCompletedIds = new Set();
    if (existingRoadmap && Array.isArray(existingRoadmap.roadmap_data)) {
      existingRoadmap.roadmap_data.forEach(step => {
        if (step.completed) previousCompletedIds.add(step.id);
      });
    }

    const projects = profile?.projects || [];
    const educations = profile?.educations || [];
    const candidateName = profile?.first_name || 'Candidate';
    const hasExistingProjects = projects.length > 0;
    const existingProjectTitle = hasExistingProjects ? projects[0].title : null;

    // Split missing skills into early and advanced
    const coreMissing = roleDef.coreSkills.filter(s => gapAnalysis.missingSkills.includes(s));
    const advMissing = roleDef.advancedSkills.filter(s => gapAnalysis.missingSkills.includes(s));

    // Construct 5 tailored milestones
    const milestones = [
      {
        id: 1,
        title: coreMissing.length > 0 ? `Core Foundations & ${coreMissing.slice(0, 2).join(' / ')} Mastery` : `${roleDef.name} Fundamentals Verification`,
        desc: coreMissing.length > 0 
          ? `Solidify primary essentials: Deepen hands-on competency in ${coreMissing.join(', ')}. Complete coding exercises and build small foundational scripts.`
          : `You already demonstrate strong foundations in ${roleDef.coreSkills.slice(0, 3).join(', ')}. Review advanced syntax quirks, performance edge-cases, and modern standards.`,
        target_skills: coreMissing.length > 0 ? coreMissing.slice(0, 3) : roleDef.coreSkills.slice(0, 3),
        resources: 'MDN Web Docs, Official Documentation & Interactive Katas',
        estimated_duration: coreMissing.length > 0 ? '2-3 weeks' : '1 week',
        completed: previousCompletedIds.has(1)
      },
      {
        id: 2,
        title: `Architecture & Framework Deep-Dive`,
        desc: advMissing.length > 0 
          ? `Learn and integrate key framework tools required for ${roleDef.name}: Focus on ${advMissing.slice(0, 3).join(', ')}. Practice structured design patterns and modular component organization.`
          : `Advance your proficiency in ${roleDef.advancedSkills.slice(0, 3).join(', ')} with production-grade architecture and state synchronization.`,
        target_skills: advMissing.length > 0 ? advMissing.slice(0, 3) : roleDef.advancedSkills.slice(0, 3),
        resources: 'Official Framework Guides, GitHub Architecture Boilerplates',
        estimated_duration: '3-4 weeks',
        completed: previousCompletedIds.has(2)
      },
      {
        id: 3,
        title: `End-to-End Portfolio Project Implementation`,
        desc: hasExistingProjects
          ? `Enhance your project "${existingProjectTitle}" or construct a flagship application: ${roleDef.projectIdea}. Incorporate real API authentication and robust error handling.`
          : `Build a standout portfolio centerpiece: ${roleDef.projectIdea}. Focus on clean commits, documentation, and live demo deployment.`,
        target_skills: [roleDef.coreSkills[0], roleDef.advancedSkills[0], 'Git'].filter(Boolean),
        resources: 'Open Source Reference Repositories, Full-Stack Architecture Blueprints',
        estimated_duration: '3-5 weeks',
        completed: previousCompletedIds.has(3)
      },
      {
        id: 4,
        title: `Database Modeling, Cloud & DevOps Infrastructure`,
        desc: `Bridge production deployment requirements: Implement structured schemas, transactions, caching, and containerized deployment with automated testing pipelines.`,
        target_skills: roleDef.advancedSkills.filter(s => ['Docker', 'SQL', 'MySQL', 'PostgreSQL', 'Redis', 'CI/CD', 'AWS', 'Kubernetes'].includes(s)),
        resources: 'Docker Documentation, Cloud Provider Free Tiers, SQL Query Optimization Guides',
        estimated_duration: '2-3 weeks',
        completed: previousCompletedIds.has(4)
      },
      {
        id: 5,
        title: `Production Readiness & Interview Technical Defense`,
        desc: `Perform end-to-end security audits, testing coverage, and prepare to defend your architectural decisions in technical whiteboard and system design rounds.`,
        target_skills: ['System Design', 'Testing', 'Security', 'Performance Optimization'],
        resources: 'System Design Primer, Role-Specific Mock Interview Rubrics',
        estimated_duration: '2 weeks',
        completed: previousCompletedIds.has(5)
      }
    ];

    // Compute dynamic progress
    const completedCount = milestones.filter(m => m.completed).length;
    const progress_percent = Math.round((completedCount / milestones.length) * 100);

    // Merge or initialize interview checklist
    let interviewChecklist = roleDef.interviewChecklist.map(item => ({ ...item }));
    if (existingRoadmap?.roadmap_data?.interviewChecklist && Array.isArray(existingRoadmap.roadmap_data.interviewChecklist)) {
      const savedChecklist = existingRoadmap.roadmap_data.interviewChecklist;
      interviewChecklist = interviewChecklist.map(item => {
        const found = savedChecklist.find(s => s.id === item.id || s.topic === item.topic);
        return found ? { ...item, completed: Boolean(found.completed) } : item;
      });
    }

    return {
      career_goal: roleDef.name,
      progress_percent,
      roadmap_data: {
        milestones,
        interviewChecklist,
        gapAnalysis,
        lastGeneratedAt: new Date().toISOString()
      }
    };
  }

  generateMentorAdvice(profile, roleName, roadmap) {
    const roleDef = this.findRoleDefinition(roleName);
    const gapAnalysis = this.analyzeSkillGaps(profile, roleDef.name);
    const candidateName = profile?.first_name || 'Candidate';
    const skillsCount = profile?.skills?.length || 0;
    const projectsCount = profile?.projects?.length || 0;
    const educations = profile?.educations || [];
    const degreeName = educations[0]?.degree ? `${educations[0].degree} in ${educations[0].field_of_study || 'Engineering'}` : null;

    const suggestions = [];

    if (degreeName) {
      suggestions.push(`Academic Alignment: Leverage your degree in ${degreeName} by linking system theory directly with code implementations for ${roleDef.name}.`);
    } else {
      suggestions.push(`Placement Track: Target placement role is ${roleDef.name}. Focus on building verifiable, production-grade applications that demonstrate senior-level engineering practices.`);
    }

    if (gapAnalysis.missingSkills.length > 0) {
      const topMissing = gapAnalysis.missingSkills.slice(0, 3).join(', ');
      suggestions.push(`High-Impact Skill Gaps: Recruiter screenings for ${roleDef.name} heavily prioritize candidates with verified experience in ${topMissing}.`);
    } else {
      suggestions.push(`Strong Profile Readiness: You demonstrate high coverage across core requirements for ${roleDef.name}. Prioritize architecture trade-offs and live problem-solving.`);
    }

    if (projectsCount === 0) {
      suggestions.push(`Project Action Item: You currently do not have projects linked in your profile. Create and link at least 1 repository showcasing full CRUD, authentication, and database indexing.`);
    } else {
      suggestions.push(`Portfolio Refinement: You have ${projectsCount} project(s) on file. Add live production deployment links, automated test badges, and comprehensive README documentation.`);
    }

    suggestions.push(`Interview Strategy: In technical rounds for ${roleDef.name}, be prepared to explain database query optimization, security safeguards (JWT/CORS), and performance trade-offs.`);

    // 1. Next Best Learning Activity (prioritized action step based on pending milestone or top missing skill)
    const milestones = roadmap?.roadmap_data?.milestones || [];
    const firstPendingMilestone = milestones.find(m => !m.completed);
    const topMissingSkill = gapAnalysis.missingSkills[0] || roleDef.coreSkills[0];
    
    let nextBestActivity;
    if (firstPendingMilestone) {
      nextBestActivity = {
        title: `Complete Milestone: ${firstPendingMilestone.title}`,
        category: 'Roadmap Progression',
        reason: `Progressing through your active Career Goal roadmap increases your calculated placement readiness (${roadmap.progress_percent || 0}%).`,
        estimatedEffort: firstPendingMilestone.estimated_duration || '1-2 weeks',
        actionSteps: [
          `Target skills: ${Array.isArray(firstPendingMilestone.target_skills) ? firstPendingMilestone.target_skills.join(', ') : topMissingSkill}.`,
          firstPendingMilestone.desc,
          `Review curated resources: ${firstPendingMilestone.resources}.`
        ],
        targetSkill: topMissingSkill
      };
    } else {
      nextBestActivity = {
        title: `Master High-Priority Skill: ${topMissingSkill}`,
        category: 'Skill Gap Remediation',
        reason: `${topMissingSkill} is a key differentiator required for ${roleDef.name} positions.`,
        estimatedEffort: '1 week',
        actionSteps: [
          `Review official documentation and interactive cheat sheets for ${topMissingSkill}.`,
          `Implement a working module using ${topMissingSkill} in one of your portfolio projects.`,
          `Validate your knowledge with technical interview practice questions.`
        ],
        targetSkill: topMissingSkill
      };
    }

    // 2. Curated Learning Resources tailored to student's skill gaps
    const resourceMap = {
      'react': { title: 'React Official Documentation & Interactive Katas', type: 'Official Docs & Sandbox', skill: 'React', description: 'Deep-dive into Hooks, reconciliation, concurrent features, and suspense.' },
      'node.js': { title: 'Node.js Core Design Patterns & Event Loop Architecture', type: 'Engineering Guide', skill: 'Node.js', description: 'Master asynchronous streams, process clustering, and non-blocking I/O.' },
      'express': { title: 'Express.js Production Best Practices & Router Middleware', type: 'Documentation', skill: 'Express', description: 'Learn robust error handling, security headers, rate limiting, and RESTful routing.' },
      'sql': { title: 'Use The Index, Luke: A Guide to Database Performance', type: 'Interactive Book', skill: 'SQL', description: 'Understand B-tree indexes, execution plans, and multi-column join optimization.' },
      'mysql': { title: 'MySQL 8.0 Reference Manual & InnoDB Transaction Management', type: 'Technical Docs', skill: 'MySQL', description: 'Acid transactions, isolation levels, foreign keys, and indexing best practices.' },
      'docker': { title: 'Docker Official Get-Started Curriculum & Container Architecture', type: 'Hands-on Tutorial', skill: 'Docker', description: 'Multi-stage Dockerfiles, volume binding, network bridges, and docker-compose.' },
      'typescript': { title: 'TypeScript Deep Dive & Advanced Utility Types', type: 'Handbook', skill: 'TypeScript', description: 'Generics, conditional types, mapped types, and strict mode migration.' },
      'redis': { title: 'Redis University: Caching Patterns & In-Memory Data Structures', type: 'Free Certification Course', skill: 'Redis', description: 'Cache-aside patterns, TTL expiration, Pub/Sub channels, and distributed locks.' },
      'git': { title: 'Pro Git Book (Free Creative Commons Edition)', type: 'Book & Reference', skill: 'Git', description: 'Branching strategies, rebase vs merge, bisect debugging, and commit hygiene.' },
      'rest apis': { title: 'RESTful API Architectural Constraints & OpenAPI Specs', type: 'Architecture Spec', skill: 'REST APIs', description: 'HTTP status codes, idempotent endpoints, pagination, and API versioning.' },
      'ci/cd': { title: 'GitHub Actions Continuous Integration & Automated Delivery', type: 'Interactive Lab', skill: 'CI/CD', description: 'Automate linting, unit testing, docker build, and cloud artifact publishing.' },
      'python': { title: 'Python Official 3.12 Tutorial & Standard Library Reference', type: 'Documentation', skill: 'Python', description: 'Data structures, list comprehensions, generators, and async programming in Python.' },
      'linux': { title: 'Linux Journey: Terminal Fundamentals, Permissions & Bash', type: 'Interactive Course', skill: 'Linux', description: 'Process monitoring, systemd services, SSH keypairs, and file permissions.' }
    };

    const recommendedResources = [];
    const skillsToCover = gapAnalysis.missingSkills.length > 0 ? gapAnalysis.missingSkills : roleDef.advancedSkills;
    skillsToCover.slice(0, 5).forEach(s => {
      const norm = this.normalizeSkill(s);
      if (resourceMap[norm]) {
        recommendedResources.push(resourceMap[norm]);
      } else {
        recommendedResources.push({
          title: `${s} Official Documentation & Developer Guides`,
          type: 'Technical Docs',
          skill: s,
          description: `Comprehensive reference guides, tutorials, and practical examples for ${s}.`
        });
      }
    });

    // 3. Tailored Project Suggestions addressing skill gaps
    const suggestedProjects = [
      {
        title: `${roleDef.name} Enterprise Microservices & Auth Hub`,
        difficulty: 'Advanced',
        techStack: [roleDef.coreSkills[0], roleDef.coreSkills[3] || 'Node.js', gapAnalysis.missingSkills[0] || 'Docker', 'MySQL'].filter(Boolean),
        description: `Build a production-grade multi-tenant web application featuring JWT authentication, refresh token rotation, relational schema with indexing, and Dockerized service deployment.`,
        keyFeatures: [
          'Role-based access control (Student, Recruiter, Admin)',
          'High-performance SQL queries with indexes and foreign keys',
          'Automated error handling middleware and activity logging',
          'Containerized with docker-compose for zero-configuration startup'
        ]
      },
      {
        title: `Real-Time Data Dashboard & Analytics Engine`,
        difficulty: 'Intermediate',
        techStack: [roleDef.coreSkills[1] || 'React', gapAnalysis.missingSkills[1] || 'TypeScript', 'REST APIs', 'Charts'].filter(Boolean),
        description: `Construct an interactive analytics dashboard presenting KPI counters, distribution charts, and filterable data tables with responsive CSS Grid layouts.`,
        keyFeatures: [
          'Dynamic state management with custom React hooks',
          'Responsive design across desktop, tablet, and mobile',
          'Theme switching (light / dark mode) with CSS variables',
          'Client-side search, sorting, and pagination'
        ]
      }
    ];

    // 4. Role-Specific Interview Questions with Guidance
    const interviewQuestions = [
      {
        question: `How do you approach database schema design and query optimization for high-traffic relational tables in ${roleDef.name} systems?`,
        category: 'System Architecture & Database',
        difficulty: 'Senior / Intermediate',
        guidance: 'Discuss indexing strategies (B-Tree), query EXPLAIN plans, foreign keys, normalization vs denormalization trade-offs, and connection pooling.'
      },
      {
        question: `Explain how you handle asynchronous execution, error boundaries, and state synchronization across frontend and backend services.`,
        category: 'Core Engineering',
        difficulty: 'Intermediate',
        guidance: 'Detail Promises, async/await error handling, centralized middleware error responders, and optimistic UI updates.'
      },
      {
        question: `What security safeguards do you integrate to protect APIs against common vulnerabilities like SQL injection, CSRF, and token theft?`,
        category: 'Security & Auth',
        difficulty: 'Intermediate',
        guidance: 'Mention parameterized SQL queries, CORS origin whitelisting, HTTP-only cookie storage for refresh tokens, and rate limiting.'
      },
      {
        question: `Describe a challenging bug you encountered in a recent project and how you systematically diagnosed and resolved it.`,
        category: 'Behavioral & Problem Solving',
        difficulty: 'All Levels',
        guidance: 'Use the STAR method (Situation, Task, Action, Result). Highlight structured debugging with log tracing, root-cause identification, and unit testing.'
      }
    ];

    // Checklist from roadmap or role
    const checklist = roadmap?.roadmap_data?.interviewChecklist || roleDef.interviewChecklist;

    return {
      targetRole: roleDef.name,
      candidateName,
      matchScore: gapAnalysis.matchScore,
      suggestions,
      skillGap: gapAnalysis.missingSkills,
      acquiredSkills: gapAnalysis.acquiredSkills,
      nextBestActivity,
      recommendedResources,
      suggestedProjects,
      interviewQuestions,
      interviewChecklist: checklist,
      interviewTips: [
        `Prepare clear explanations of architectural decisions and trade-offs in your recent projects.`,
        `Review role-specific fundamentals: ${roleDef.coreSkills.slice(0, 4).join(', ')}.`,
        `Practice writing clean, modular code with error handling under timed conditions.`
      ]
    };
  }
}

export default new RecommendationService();
