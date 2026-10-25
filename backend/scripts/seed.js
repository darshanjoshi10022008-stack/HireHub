require("dns").setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const CandidateProfile = require("../models/CandidateProfile");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed or find Admin
    let admin = await User.findOne({ email: "admin@hirehub.com" });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash("AdminPass123!", 12);
      admin = await User.create({
        name: "HireHub Administrator",
        email: "admin@hirehub.com",
        password: hashedAdminPassword,
        role: "admin",
        isEmailVerified: true,
        status: "active",
      });
      console.log("Created Admin account: admin@hirehub.com (Password: AdminPass123!)");
    }

    // 2. Seed or find Recruiter
    let recruiter = await User.findOne({ email: "recruiter@hirehub.com" });
    if (!recruiter) {
      const hashedRecruiterPassword = await bcrypt.hash("RecruiterPass123!", 12);
      recruiter = await User.create({
        name: "Sarah Jenkins",
        email: "recruiter@hirehub.com",
        password: hashedRecruiterPassword,
        role: "recruiter",
        isEmailVerified: true,
        status: "active",
      });
      console.log("Created Recruiter account: recruiter@hirehub.com (Password: RecruiterPass123!)");
    }

    // 3. Ensure existing candidates have CandidateProfile records
    const candidates = await User.find({ role: { $in: ["student", "candidate"] } });
    for (const cand of candidates) {
      const prof = await CandidateProfile.findOne({ user: cand._id });
      if (!prof) {
        await CandidateProfile.create({
          user: cand._id,
          headline: "Aspiring Software Engineer",
          bio: "Passionate developer eager to contribute to innovative software solutions.",
          skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
        });
      }
    }

    // 4. Seed companies if none exist
    const companyCount = await Company.countDocuments();
    let companies = [];

    if (companyCount === 0) {
      const companyData = [
        {
          name: "CloudScale Labs",
          owner: recruiter._id,
          industry: "Cloud & Infrastructure",
          website: "https://cloudscalelabs.io",
          companySize: "51-200",
          location: "San Francisco, CA (Hybrid)",
          about:
            "CloudScale Labs powers modern enterprise cloud platforms with automated orchestration, observability, and serverless architectures.",
          isVerified: true,
        },
        {
          name: "TechNova Solutions",
          owner: recruiter._id,
          industry: "Software Engineering",
          website: "https://technova.dev",
          companySize: "201-500",
          location: "New York, NY (Remote friendly)",
          about:
            "TechNova delivers high-throughput SaaS applications and AI-driven workflow engines to Fortune 500 organizations worldwide.",
          isVerified: true,
        },
        {
          name: "Apex Digital Design",
          owner: recruiter._id,
          industry: "Product & Design",
          website: "https://apexdigital.design",
          companySize: "11-50",
          location: "Austin, TX (Remote)",
          about:
            "Apex Digital is a product design consultancy crafting human-centered digital experiences, brand identities, and high-impact web apps.",
          isVerified: true,
        },
        {
          name: "CyberShield Security",
          owner: recruiter._id,
          industry: "Cybersecurity",
          website: "https://cybershieldsec.com",
          companySize: "51-200",
          location: "Boston, MA (On-site)",
          about:
            "CyberShield specializes in zero-trust architecture, automated threat detection, and next-generation application vulnerability defense.",
          isVerified: true,
        },
      ];

      companies = await Company.insertMany(companyData);
      console.log(`Seeded ${companies.length} companies.`);
    } else {
      companies = await Company.find();
    }

    // 5. Seed jobs if none exist
    const jobCount = await Job.countDocuments();

    if (jobCount === 0) {
      const c1 = companies[0]._id;
      const c2 = companies[1] ? companies[1]._id : c1;
      const c3 = companies[2] ? companies[2]._id : c1;
      const c4 = companies[3] ? companies[3]._id : c1;

      const jobsData = [
        {
          title: "Senior Full Stack Engineer (MERN)",
          recruiter: recruiter._id,
          company: c1,
          category: "Technology & IT",
          jobType: "Full-time",
          workMode: "Hybrid",
          location: "San Francisco, CA",
          experienceLevel: "Senior Level",
          salary: { min: 130000, max: 165000, currency: "USD", period: "yr", isNegotiable: true },
          description:
            "We are seeking an experienced Full Stack Engineer to spearhead feature development across our core web applications. You will collaborate closely with product managers, UX designers, and cloud architects to build performant, scalable, and resilient cloud services.",
          requirements: [
            "At least 4+ years building production applications using React, Node.js, and MongoDB",
            "Strong understanding of RESTful API design, authentication protocols (JWT, OAuth), and database optimization",
            "Proficiency in modern TypeScript or ES6+ JavaScript and asynchronous programming patterns",
            "Experience with containerization (Docker) and CI/CD pipelines is a plus",
          ],
          responsibilities: [
            "Architect and maintain scalable frontend components and Express backend APIs",
            "Optimize database queries and indexing strategies for MongoDB",
            "Write comprehensive unit and integration tests to ensure reliable releases",
            "Mentor junior engineers and participate in regular code reviews",
          ],
          skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "REST APIs"],
          status: "published",
          viewsCount: 142,
        },
        {
          title: "Frontend React Developer",
          recruiter: recruiter._id,
          company: c2,
          category: "Software Engineering",
          jobType: "Full-time",
          workMode: "Remote",
          location: "New York, NY",
          experienceLevel: "Mid Level",
          salary: { min: 95000, max: 125000, currency: "USD", period: "yr", isNegotiable: false },
          description:
            "TechNova Solutions is looking for a thoughtful Frontend Developer to craft intuitive, accessible, and fast web experiences for our analytics dashboard products.",
          requirements: [
            "2+ years of professional web development with React and modern CSS",
            "Strong grasp of React Hooks, context state management, and component modularity",
            "Deep respect for semantic HTML, accessibility (WCAG), and responsive design principles",
            "Experience integrating with REST and GraphQL backend services",
          ],
          responsibilities: [
            "Build responsive, high-performance UI components in React",
            "Collaborate with UX designers to refine interface usability and interaction design",
            "Diagnose and optimize client-side rendering bottlenecks and bundle sizes",
          ],
          skills: ["React", "JavaScript", "HTML5", "CSS3", "Vite", "Git"],
          status: "published",
          viewsCount: 98,
        },
        {
          title: "Senior Product Designer (UI/UX)",
          recruiter: recruiter._id,
          company: c3,
          category: "Product & Design",
          jobType: "Full-time",
          workMode: "Remote",
          location: "Austin, TX",
          experienceLevel: "Senior Level",
          salary: { min: 110000, max: 145000, currency: "USD", period: "yr", isNegotiable: true },
          description:
            "Join Apex Digital to shape next-generation digital products. You will lead design sprints, conduct customer interviews, and define design system specifications from prototype to launch.",
          requirements: [
            "4+ years of UI/UX design experience for SaaS web or mobile products",
            "Portfolio showcasing user research, wireframes, high-fidelity prototypes, and design systems",
            "Expertise in Figma, component tokens, and interactive design prototypes",
            "Strong communication skills to articulate design decisions to engineers and stakeholders",
          ],
          responsibilities: [
            "Design user flows, wireframes, and production-ready interface mockups",
            "Maintain and evolve our comprehensive design tokens and component library",
            "Partner with frontend engineers to ensure high-fidelity implementation",
          ],
          skills: ["Figma", "UI/UX", "User Research", "Design Systems", "Prototyping"],
          status: "published",
          viewsCount: 65,
        },
        {
          title: "DevOps & Cloud Infrastructure Engineer",
          recruiter: recruiter._id,
          company: c1,
          category: "Technology & IT",
          jobType: "Full-time",
          workMode: "On-site",
          location: "San Francisco, CA",
          experienceLevel: "Senior Level",
          salary: { min: 140000, max: 175000, currency: "USD", period: "yr", isNegotiable: true },
          description:
            "CloudScale Labs is expanding its platform infrastructure team. In this role, you will architect reliable Kubernetes clusters, automate deployment workflows, and guarantee high platform uptime.",
          requirements: [
            "3+ years managing AWS or GCP cloud environments and Kubernetes clusters",
            "Solid experience with Terraform or infrastructure-as-code tooling",
            "Familiarity with Prometheus, Grafana, and cloud log aggregation",
            "Solid scripting skills in Bash or Python",
          ],
          responsibilities: [
            "Provision and maintain multi-region cloud infrastructure",
            "Improve deployment automation and zero-downtime release pipelines",
            "Monitor system performance and respond to platform health alarms",
          ],
          skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux"],
          status: "published",
          viewsCount: 112,
        },
        {
          title: "Junior Backend Developer (Node.js & MongoDB)",
          recruiter: recruiter._id,
          company: c2,
          category: "Software Engineering",
          jobType: "Internship",
          workMode: "Remote",
          location: "Remote",
          experienceLevel: "Entry Level",
          salary: { min: 45000, max: 60000, currency: "USD", period: "yr", isNegotiable: false },
          description:
            "An exciting role for aspiring backend engineers to learn from senior mentors while building real API endpoints, database schemas, and background task pipelines.",
          requirements: [
            "Solid understanding of JavaScript/Node.js, Express, and MongoDB basics",
            "Understanding of HTTP status codes, JSON, and REST API conventions",
            "Eager to learn best practices in automated testing and secure coding",
            "Degree in Computer Science or equivalent hands-on project experience",
          ],
          responsibilities: [
            "Assist in developing and documenting RESTful API endpoints",
            "Write database queries and seed data fixtures for test environments",
            "Participate in agile sprint planning and standups",
          ],
          skills: ["Node.js", "Express", "MongoDB", "JavaScript", "Git"],
          status: "published",
          viewsCount: 184,
        },
        {
          title: "Cybersecurity Analyst",
          recruiter: recruiter._id,
          company: c4,
          category: "Technology & IT",
          jobType: "Full-time",
          workMode: "On-site",
          location: "Boston, MA",
          experienceLevel: "Mid Level",
          salary: { min: 105000, max: 135000, currency: "USD", period: "yr", isNegotiable: true },
          description:
            "CyberShield Security is looking for an analyst to monitor security events, conduct vulnerability assessments, and implement security baseline policies.",
          requirements: [
            "2+ years in security operations (SOC), threat monitoring, or compliance",
            "Knowledge of OWASP Top 10 web vulnerabilities and mitigation strategies",
            "Relevant security certifications (Security+, CEH, or CySA+) preferred",
          ],
          responsibilities: [
            "Perform vulnerability scans and penetration test coordination",
            "Audit access logs and investigate potential anomalies",
            "Draft incident response documentation and security guidelines",
          ],
          skills: ["Cybersecurity", "Network Security", "Vulnerability Assessment", "SOC", "SIEM"],
          status: "published",
          viewsCount: 77,
        },
      ];

      const seededJobs = await Job.insertMany(jobsData);
      console.log(`Seeded ${seededJobs.length} live job listings.`);
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
