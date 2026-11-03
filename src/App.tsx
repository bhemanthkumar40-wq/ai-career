import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Compass,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  MessageSquare,
  User,
  Search,
  FileText,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  work_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  description: string;
  department: string;
  required_skills: string[];
  preferred_skills: string[];
  posted_date: string;
  is_sample: boolean;
  is_saved?: boolean;
  match_percentage?: number;
  match_reasons?: string[];
  missing_skills?: string[];
}

interface Application {
  id: number;
  company_name: string;
  job_title: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  applied_date: string;
  follow_up_date: string;
  notes: string;
}

interface LearningItem {
  id: number;
  skill_name: string;
  priority: 'critical' | 'high' | 'medium';
  estimated_hours: number;
  category: string;
  recommended_resource: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    title: 'Full Stack Engineer (Python & React)',
    company: 'Apex Cloud Systems',
    location: 'San Francisco, CA (Remote)',
    work_type: 'Remote',
    experience_level: 'Mid-Level',
    salary_min: 115000,
    salary_max: 145000,
    description: 'Apex Cloud is seeking a Full Stack Engineer to architect data-rich dashboards and scalable microservices. You will collaborate directly with product designers to ship responsive React frontends and high-throughput FastAPI backend endpoints.',
    department: 'Engineering',
    required_skills: ['Python', 'FastAPI', 'React', 'TypeScript', 'SQL'],
    preferred_skills: ['Docker', 'Tailwind CSS', 'Redis', 'Unit Testing'],
    posted_date: '2 days ago',
    is_sample: true,
    is_saved: false,
    match_percentage: 92,
    match_reasons: [
      'Matches 5 of 5 core required skills: Python, FastAPI, React, TypeScript, SQL',
      'Experience (2.5 yrs) aligns closely with Mid-Level requirements'
    ],
    missing_skills: ['Docker']
  },
  {
    id: 2,
    title: 'Backend API Developer',
    company: 'Horizon Financial Data',
    location: 'New York, NY (Hybrid)',
    work_type: 'Hybrid',
    experience_level: 'Mid-Level',
    salary_min: 120000,
    salary_max: 150000,
    description: 'Design and maintain resilient data ingestion pipelines and REST APIs serving institutional investors. Strong command of relational databases and asynchronous Python or Node.js required.',
    department: 'Core Infrastructure',
    required_skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST API', 'Git'],
    preferred_skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    posted_date: '3 days ago',
    is_sample: true,
    is_saved: false,
    match_percentage: 84,
    match_reasons: [
      'Strong match on Python, REST API, Git, and relational databases',
      'Bonus alignment on financial data workflow design'
    ],
    missing_skills: ['PostgreSQL', 'AWS']
  },
  {
    id: 3,
    title: 'Frontend Engineer (React & Modern UI)',
    company: 'Lumina Creative Studio',
    location: 'Austin, TX (Remote)',
    work_type: 'Remote',
    experience_level: 'Mid-Level',
    salary_min: 105000,
    salary_max: 135000,
    description: 'Craft pixel-perfect, accessible user interfaces for our design workflow platform. You will work closely with UX researchers to implement fluid animations, micro-interactions, and robust state machines.',
    department: 'Product Experience',
    required_skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'HTML', 'CSS'],
    preferred_skills: ['Next.js', 'Redux', 'Jest', 'Figma'],
    posted_date: 'Just now',
    is_sample: true,
    is_saved: true,
    match_percentage: 95,
    match_reasons: [
      'Complete coverage of React, TypeScript, and modern styling toolchain',
      'Preferred remote work alignment'
    ],
    missing_skills: []
  },
  {
    id: 4,
    title: 'Junior-to-Mid Software Engineer',
    company: 'Vanguard Health Tech',
    location: 'Boston, MA (On-site)',
    work_type: 'On-site',
    experience_level: 'Entry-Level',
    salary_min: 85000,
    salary_max: 110000,
    description: 'Join our collaborative engineering cohort building patient-care coordination software. Comprehensive mentorship provided with rotations across web frontend, data pipelines, and security compliance.',
    department: 'Clinical Systems',
    required_skills: ['Python', 'JavaScript', 'SQL', 'Git'],
    preferred_skills: ['FastAPI', 'React', 'Linux'],
    posted_date: '4 days ago',
    is_sample: true,
    is_saved: false,
    match_percentage: 88,
    match_reasons: [
      'Exceeds foundational skill requirements',
      'Strong candidate for accelerated promotion track'
    ],
    missing_skills: []
  },
  {
    id: 5,
    title: 'Machine Learning & Data Applications Engineer',
    company: 'Synthetix Intelligence',
    location: 'Seattle, WA (Remote)',
    work_type: 'Remote',
    experience_level: 'Senior',
    salary_min: 140000,
    salary_max: 180000,
    description: 'Deploy explainable machine learning models and LLM-assisted workflows to production. Build ETL pipelines using Pandas, scikit-learn, and vector indexing services.',
    department: 'AI Labs',
    required_skills: ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'SQL'],
    preferred_skills: ['FastAPI', 'Docker', 'PyTorch', 'Prompt Engineering'],
    posted_date: '5 days ago',
    is_sample: true,
    is_saved: false,
    match_percentage: 68,
    match_reasons: [
      'Solid Python baseline and API fundamentals',
      'Requires deeper focus on production ML pipelines'
    ],
    missing_skills: ['Scikit-Learn', 'Pandas', 'PyTorch']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'jobs' | 'readiness' | 'tracker' | 'learning' | 'assistant' | 'profile'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; isDemo: boolean } | null>(null);

  // Profile State
  const [profile, setProfile] = useState({
    headline: 'Full Stack Software Engineer | Python, React, FastAPI',
    education: 'B.S. in Computer Science - University of California',
    yearsExperience: 2.5,
    skills: ['Python', 'FastAPI', 'React', 'TypeScript', 'SQL', 'Git', 'Docker', 'REST API', 'Tailwind CSS'],
    preferredRoles: ['Full Stack Engineer', 'Backend Engineer'],
    location: 'San Francisco, CA (or Remote)',
    salaryMin: 110000,
    salaryMax: 145000,
    workPreference: 'Remote',
    resumeText: `Alex Morgan - Full Stack Software Engineer
Summary: Software Engineer with 2.5 years of experience building performant web applications using Python, FastAPI, and React.
Skills: Python, FastAPI, React, TypeScript, SQL, Docker, Git, REST API.
Experience: Software Engineer at CloudScale Tech (2024 - Present). Engineered 12+ RESTful microservices, built responsive React dashboards.`,
    completeness: 85
  });

  // Jobs State
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('all');
  const [filterSeniority, setFilterSeniority] = useState('all');
  const [selectedJobForModal, setSelectedJobForModal] = useState<Job | null>(null);

  // Applications Tracker State
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      company_name: 'Apex Cloud Systems',
      job_title: 'Full Stack Engineer (Python & React)',
      status: 'interview',
      applied_date: '2026-10-18',
      follow_up_date: '2026-11-06',
      notes: 'Completed technical take-home assignment. Architecture interview scheduled.'
    },
    {
      id: 2,
      company_name: 'Horizon Financial Data',
      job_title: 'Backend API Developer',
      status: 'applied',
      applied_date: '2026-10-25',
      follow_up_date: '2026-11-08',
      notes: 'Applied through direct team referral.'
    },
    {
      id: 3,
      company_name: 'Lumina Creative Studio',
      job_title: 'Frontend Engineer (React & Modern UI)',
      status: 'saved',
      applied_date: '',
      follow_up_date: '',
      notes: 'High match (95%). Reviewing portfolio links before submitting.'
    }
  ]);

  // Learning Plan State
  const [learningItems, setLearningItems] = useState<LearningItem[]>([
    {
      id: 1,
      skill_name: 'Docker Multi-Stage Builds & Container Networking',
      priority: 'critical',
      estimated_hours: 10,
      category: 'DevOps & Cloud',
      recommended_resource: 'Containerize an end-to-end FastAPI + React stack',
      status: 'in_progress'
    },
    {
      id: 2,
      skill_name: 'TypeScript Advanced Generics & Mapped Types',
      priority: 'high',
      estimated_hours: 6,
      category: 'Frontend Architecture',
      recommended_resource: 'Official TS Handbook: Conditional Types and Generics',
      status: 'completed'
    },
    {
      id: 3,
      skill_name: 'Redis Caching & Asynchronous Queue Architecture',
      priority: 'medium',
      estimated_hours: 8,
      category: 'Backend Architecture',
      recommended_resource: 'Designing Data-Intensive Applications (Chapters 4-5)',
      status: 'not_started'
    }
  ]);

  // Real-Time Job Description Matcher State
  const [customJD, setCustomJD] = useState('');
  const [jdAnalysis, setJdAnalysis] = useState<{
    score: number;
    matched: string[];
    missing: string[];
    actions: string[];
  } | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello Alex! I am your CareerPilot AI Advisor. I can analyze your resume bullets, run mock interview questions with the STAR method, or help you prioritize which skill to learn next. What would you like to explore?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);



  const handleDemoLogin = () => {
    setUser({
      name: 'Alex Morgan',
      email: 'demo@careerpilot.ai',
      isDemo: true
    });
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab('landing');
  };

  const toggleJobBookmark = (jobId: number) => {
    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, is_saved: !j.is_saved } : j))
    );
  };

  const moveApplicationStage = (appId: number, newStage: Application['status']) => {
    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: newStage } : a))
    );
  };

  const updateLearningStatus = (id: number, status: LearningItem['status']) => {
    setLearningItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleAnalyzeJD = () => {
    if (!customJD.trim()) return;
    const lower = customJD.toLowerCase();
    const commonSkills = ['Python', 'FastAPI', 'React', 'TypeScript', 'SQL', 'Docker', 'Git', 'PostgreSQL', 'AWS', 'Kubernetes', 'Redis'];
    const matched = commonSkills.filter(s => lower.includes(s.toLowerCase()) && profile.skills.includes(s));
    const missing = commonSkills.filter(s => lower.includes(s.toLowerCase()) && !profile.skills.includes(s));

    const totalDemanded = Math.max(1, matched.length + missing.length);
    const score = Math.min(95, Math.max(40, Math.round((matched.length / totalDemanded) * 75 + 20)));

    setJdAnalysis({
      score,
      matched: matched.length ? matched : ['Core Web Concepts', 'General Architecture'],
      missing: missing.length ? missing : ['No critical skill gaps detected!'],
      actions: missing.map(m => `Build a targeted mini-project demonstrating hands-on experience with ${m}.`).concat([
        'Highlight your 2.5 years of full stack delivery in your introductory summary.',
        'Format bullet points using the Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]).'
      ])
    });
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
          mode: 'general'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: 'assistant', text: data.response }]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Local fallback
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            text: "### 💡 Career Advisor Insight\n\nFocus on demonstrating measurable business outcomes in your resume bullets. For example: *'Engineered 12 RESTful FastAPI microservices handling 2M+ monthly requests, cutting latency by 35%'*.\n\nWould you like me to help you rewrite a specific bullet from your work experience?"
          }
        ]);
      }, 600);
    } finally {
      setIsTyping(false);
    }
  };

  const handleParseResume = () => {
    setProfile(prev => ({
      ...prev,
      headline: 'Full Stack Software Engineer | Python, React, FastAPI',
      yearsExperience: 2.5,
      completeness: 95
    }));
  };

  const filteredJobs = jobs.filter(j => {
    const matchesQuery = !searchQuery || j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase()) || j.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWork = filterWorkType === 'all' || j.work_type.toLowerCase() === filterWorkType.toLowerCase();
    const matchesExp = filterSeniority === 'all' || j.experience_level.toLowerCase() === filterSeniority.toLowerCase();
    return matchesQuery && matchesWork && matchesExp;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col font-sans">


      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#0B132B]/95 backdrop-blur border-b border-white/10 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div
            onClick={() => setActiveTab(isLoggedIn ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-purple-500/30 text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">CareerPilot AI</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md transition ${activeTab === 'dashboard' ? 'text-[#2DD4BF] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-3 py-1.5 rounded-md transition ${activeTab === 'jobs' ? 'text-[#2DD4BF] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  Discover Roles
                </button>
                <button
                  onClick={() => setActiveTab('readiness')}
                  className={`px-3 py-1.5 rounded-md transition ${activeTab === 'readiness' ? 'text-[#2DD4BF] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  Placement AI
                </button>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className={`px-3 py-1.5 rounded-md transition ${activeTab === 'tracker' ? 'text-[#2DD4BF] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  Applications
                </button>
                <button
                  onClick={() => setActiveTab('learning')}
                  className={`px-3 py-1.5 rounded-md transition ${activeTab === 'learning' ? 'text-[#2DD4BF] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  Learning Plan
                </button>
                <button
                  onClick={() => setActiveTab('assistant')}
                  className={`px-3 py-1.5 rounded-md transition ${activeTab === 'assistant' ? 'text-[#2DD4BF] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  AI Coach
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 rounded-md transition ${activeTab === 'profile' ? 'text-[#2DD4BF] bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                >
                  Profile
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('landing')}
                className="text-slate-300 hover:text-white px-3 py-1.5"
              >
                Overview
              </button>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Demo Candidate
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-xs border border-slate-600 hover:border-slate-400 rounded text-slate-300 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDemoLogin}
                  className="px-3.5 py-1.5 rounded-md bg-[#14B8A6] hover:bg-[#0D9488] text-white font-semibold text-xs sm:text-sm transition shadow-sm"
                >
                  Continue as Demo User
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">

        {/* 1. LANDING VIEW */}
        {activeTab === 'landing' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070D1F] via-[#0B132B] to-[#1C2541] text-white p-8 sm:p-14 shadow-2xl border border-white/5">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[#2DD4BF] text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Explainable AI Tech Placement Intelligence
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                    Navigate your tech career with{' '}
                    <span className="bg-gradient-to-r from-[#A78BFA] via-[#38BDF8] to-[#2DD4BF] bg-clip-text text-transparent">
                      transparent machine learning.
                    </span>
                  </h1>

                  <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                    CareerPilot AI evaluates your placement readiness with explainable scikit-learn models, identifies specific skill gaps, matches roles, and coaches you through technical interviews.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={handleDemoLogin}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>Build My Career Plan (Instant Demo)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="px-5 py-3.5 rounded-xl border border-slate-600 hover:border-slate-400 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4 text-[#2DD4BF]" />
                      Explore Available Roles
                    </button>
                  </div>
                </div>

                {/* Hero Readiness Preview Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl bg-[#1C2541]/90 border border-white/10 p-6 text-center shadow-xl space-y-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Sample Candidate Readiness
                    </span>

                    <div className="relative w-36 h-36 mx-auto flex items-center justify-center rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#14B8A6] p-1 shadow-lg shadow-purple-500/20">
                      <div className="w-full h-full bg-[#1C2541] rounded-full flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-white">85</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Score / 100</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-white">Market-Ready Candidate</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        High interview conversion probability (70–85%) on Full Stack & Backend roles.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-teal-500/20 text-teal-300 font-medium">Python & React</span>
                      <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-medium">FastAPI</span>
                      <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 font-medium">2.5 Yrs Exp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Explainable Scoring</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Transparent 4-factor scoring: Profile Completeness, Market Skill Alignment, Experience Fit, and Application Velocity. No mysterious black boxes.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Content Matching</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Discover roles matching your specific stack. Clear badges highlight required skills, preferred qualifications, and exact missing capabilities.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">AI Career Coach</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Practice STAR behavioral questions, rewrite resume bullets with the Google XYZ formula, and rehearse salary negotiations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Welcome back, Alex Morgan</h2>
                <p className="text-sm text-slate-600">{profile.headline}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition shadow-sm"
                >
                  Search Jobs
                </button>
              </div>
            </div>

            {/* Top Metrics Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Readiness Card */}
              <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#14B8A6] p-1 flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">85</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Readiness</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                    High Placement Readiness
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Strong skill overlap (92%) on Mid-Level Full Stack roles. 1 critical skill gap: Docker.
                  </p>
                  <button
                    onClick={() => setActiveTab('readiness')}
                    className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1"
                  >
                    View Explainable Factor Breakdown →
                  </button>
                </div>
              </div>

              {/* Profile Completeness Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Completeness</span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2">{profile.completeness}%</div>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: `${profile.completeness}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-500">Education & resume parsed</span>
                </div>
              </div>

              {/* Pipeline Activity Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Applications</span>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2">{applications.length}</div>
                </div>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className="w-full py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                >
                  View Kanban Tracker ({applications.filter(a => a.status === 'interview').length} Interview)
                </button>
              </div>
            </div>

            {/* Recommended Jobs Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900">Recommended Job Matches</h3>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="text-xs font-semibold text-[#7C3AED] hover:underline"
                >
                  Browse all {jobs.length} jobs →
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {jobs.slice(0, 3).map(job => (
                  <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {job.match_percentage}% Match
                        </span>
                        <button
                          onClick={() => toggleJobBookmark(job.id)}
                          className="text-slate-400 hover:text-amber-500 transition"
                        >
                          <Star className={`w-4 h-4 ${job.is_saved ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>

                      <h4 className="font-bold text-base text-slate-900 mt-2">{job.title}</h4>
                      <p className="text-xs text-slate-600 font-medium">{job.company} • {job.location}</p>

                      <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-700">${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k</span>
                      <button
                        onClick={() => setSelectedJobForModal(job)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                      >
                        Inspect Match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. DISCOVER ROLES VIEW */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Discover Tech Roles</h2>
              <p className="text-sm text-slate-600">
                Filter by work arrangement, seniority, or stack. Every card shows why you matched and what skills are missing.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by title, company, or keyword..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <select
                  value={filterWorkType}
                  onChange={e => setFilterWorkType(e.target.value)}
                  className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Work Types</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <select
                  value={filterSeniority}
                  onChange={e => setFilterSeniority(e.target.value)}
                  className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Seniority</option>
                  <option value="Entry-Level">Entry-Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {job.match_percentage}% Match
                      </span>
                      <button
                        onClick={() => toggleJobBookmark(job.id)}
                        className="text-slate-400 hover:text-amber-500 transition"
                      >
                        <Star className={`w-4 h-4 ${job.is_saved ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 mt-2">{job.title}</h4>
                    <p className="text-xs text-slate-600 font-medium">{job.company} • {job.location}</p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700">{job.work_type}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">{job.experience_level}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>

                    {job.missing_skills && job.missing_skills.length > 0 && (
                      <div className="mt-3 text-[11px] text-rose-600 font-medium">
                        Missing skill gap: {job.missing_skills.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-700">${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k</span>
                    <button
                      onClick={() => setSelectedJobForModal(job)}
                      className="px-2.5 py-1 rounded bg-[#7C3AED] hover:bg-[#6D28D9] font-semibold text-white transition"
                    >
                      Inspect Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PLACEMENT INTELLIGENCE & REAL-TIME JD MATCHER VIEW */}
        {activeTab === 'readiness' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Explainable Placement Intelligence</h2>
              <p className="text-sm text-slate-600">
                Understand the exact mathematical drivers behind your readiness score and analyze target job descriptions in real time.
              </p>
            </div>

            {/* 4-Factor Breakdown */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Profile Completeness</span>
                  <span className="text-purple-600">17 / 20 pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-[85%]" />
                </div>
                <p className="text-xs text-slate-600">85% complete. Headline, skills, and parsed resume are populated.</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Market Skill Coverage</span>
                  <span className="text-teal-600">31 / 35 pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full w-[88%]" />
                </div>
                <p className="text-xs text-slate-600">Strong command of high-demand Python and React web stacks.</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Experience Fit</span>
                  <span className="text-purple-600">21 / 25 pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-[84%]" />
                </div>
                <p className="text-xs text-slate-600">2.5 years documented experience matches typical Mid-Level criteria.</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Pipeline Momentum</span>
                  <span className="text-teal-600">16 / 20 pts</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full w-[80%]" />
                </div>
                <p className="text-xs text-slate-600">3 active applications and 1 ongoing interview cycle.</p>
              </div>
            </div>

            {/* Real-Time Job Description Matcher */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="font-extrabold text-lg text-slate-900">Real-Time Job Description Match Tool</h3>
              </div>
              <p className="text-sm text-slate-600">
                Paste any external job description to immediately extract required skills, analyze profile alignment, and receive actionable resume adjustments.
              </p>

              <textarea
                value={customJD}
                onChange={e => setCustomJD(e.target.value)}
                rows={4}
                placeholder="Paste job posting text here (e.g., 'We are seeking a Backend Engineer with Python, FastAPI, Docker, and Kubernetes experience...')"
                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleAnalyzeJD}
                  className="px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition shadow-sm"
                >
                  Analyze Alignment
                </button>
              </div>

              {jdAnalysis && (
                <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Analysis Breakdown</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      {jdAnalysis.score}% Match
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-emerald-700 block mb-1">Matched Qualifications:</span>
                      <div className="flex flex-wrap gap-1">
                        {jdAnalysis.matched.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-rose-700 block mb-1">Identified Gaps:</span>
                      <div className="flex flex-wrap gap-1">
                        {jdAnalysis.missing.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">Actionable Resume Adjustments:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {jdAnalysis.actions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. APPLICATION TRACKER (KANBAN) */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Application Pipeline</h2>
                <p className="text-sm text-slate-600">Track and advance job applications across stages.</p>
              </div>
              <button
                onClick={() => {
                  const company = prompt('Company Name:');
                  const title = prompt('Job Title:');
                  if (company && title) {
                    setApplications(prev => [
                      ...prev,
                      {
                        id: Date.now(),
                        company_name: company,
                        job_title: title,
                        status: 'applied',
                        applied_date: new Date().toISOString().split('T')[0],
                        follow_up_date: '',
                        notes: 'Added via quick entry'
                      }
                    ]);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm"
              >
                + Add Application
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              {(['saved', 'applied', 'interview', 'offer', 'rejected'] as const).map(stage => {
                const stageApps = applications.filter(a => a.status === stage);
                return (
                  <div key={stage} className="bg-slate-100 rounded-2xl p-3 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {stage}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                        {stageApps.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {stageApps.map(app => (
                        <div key={app.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
                          <div className="flex items-start justify-between">
                            <h5 className="font-bold text-xs text-slate-900">{app.company_name}</h5>
                            <select
                              value={app.status}
                              onChange={e => moveApplicationStage(app.id, e.target.value as any)}
                              className="text-[10px] border border-slate-200 rounded px-1 py-0.5"
                            >
                              <option value="saved">Saved</option>
                              <option value="applied">Applied</option>
                              <option value="interview">Interview</option>
                              <option value="offer">Offer</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <p className="text-xs text-slate-600">{app.job_title}</p>
                          {app.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                              "{app.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                      {stageApps.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                          No items
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. LEARNING PLAN VIEW */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Prioritized Learning Roadmap</h2>
              <p className="text-sm text-slate-600">
                Bridge skill gaps identified during market analysis to maximize your callback readiness.
              </p>
            </div>

            <div className="space-y-4">
              {learningItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-base text-slate-900 ${item.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                        {item.skill_name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.priority === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {item.estimated_hours} hrs
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{item.recommended_resource}</p>
                    <span className="text-[11px] text-slate-400">Category: {item.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={e => updateLearningStatus(item.id, e.target.value as any)}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CAREER ASSISTANT (CHAT) */}
        {activeTab === 'assistant' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Career Advisor & Coach</h2>
                <p className="text-sm text-slate-600">Practice STAR behavioral questions, rewrite resume bullets, or plan career moves.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                AI Coach Active
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSendMessage('How do I format my experience bullets using the Google XYZ formula?')}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-purple-400 transition"
              >
                📄 Resume XYZ Formula
              </button>
              <button
                onClick={() => handleSendMessage('Simulate a behavioral interview question for a Mid-Level Backend Engineer using the STAR method.')}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-purple-400 transition"
              >
                🎯 STAR Interview Practice
              </button>
              <button
                onClick={() => handleSendMessage('What are the key points to negotiate when reviewing a software engineer offer?')}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-purple-400 transition"
              >
                💼 Salary Negotiation
              </button>
            </div>

            {/* Chat Box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-xs text-slate-400 italic">Thinking and synthesizing advice...</div>
                )}
              </div>

              <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about resume bullets, STAR interview questions, or skill priorities..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. CAREER PROFILE & RESUME PARSER VIEW */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Career Profile</h2>
                <p className="text-sm text-slate-600">Update your background to recalibrate placement readiness.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                {profile.completeness}% Complete
              </span>
            </div>

            {/* Resume Text Parser Box */}
            <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-2xl p-5 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#7C3AED]" />
                  Resume Text Parser (Local Explainable)
                </h4>
                <button
                  onClick={handleParseResume}
                  className="px-3 py-1 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-semibold shadow-sm transition"
                >
                  ✨ Extract Details
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Paste your resume text below. Our explainable local parser extracts technical skills, degrees, and estimated years of experience.
              </p>
              <textarea
                value={profile.resumeText}
                onChange={e => setProfile({ ...profile, resumeText: e.target.value })}
                rows={3}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={e => setProfile({ ...profile, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Education</label>
                  <input
                    type="text"
                    value={profile.education}
                    onChange={e => setProfile({ ...profile, education: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    step="0.5"
                    value={profile.yearsExperience}
                    onChange={e => setProfile({ ...profile, yearsExperience: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={profile.skills.join(', ')}
                  onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Salary ($)</label>
                  <input
                    type="number"
                    step="5000"
                    value={profile.salaryMin}
                    onChange={e => setProfile({ ...profile, salaryMin: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Salary ($)</label>
                  <input
                    type="number"
                    step="5000"
                    value={profile.salaryMax}
                    onChange={e => setProfile({ ...profile, salaryMax: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Preference</label>
                  <select
                    value={profile.workPreference}
                    onChange={e => setProfile({ ...profile, workPreference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => alert('Profile changes saved successfully!')}
                  className="px-5 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs transition"
                >
                  Save Profile Updates
                </button>
              </div>
            </div>
          </div>
        )}



      </main>

      {/* JOB DETAIL / MATCH INSPECTION MODAL */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 bg-[#0B132B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{selectedJobForModal.title}</h3>
                <p className="text-xs text-slate-600">{selectedJobForModal.company} • {selectedJobForModal.location}</p>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                {selectedJobForModal.match_percentage}% Explainable Match
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Sample Listing
              </span>
            </div>

            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Why you matched:</h5>
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                {selectedJobForModal.match_reasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {selectedJobForModal.missing_skills && selectedJobForModal.missing_skills.length > 0 && (
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider">Missing Skill Gaps:</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedJobForModal.missing_skills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-rose-100 text-rose-800 font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Description:</h5>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedJobForModal.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setApplications(prev => [
                    ...prev,
                    {
                      id: Date.now(),
                      company_name: selectedJobForModal.company,
                      job_title: selectedJobForModal.title,
                      status: 'applied',
                      applied_date: new Date().toISOString().split('T')[0],
                      follow_up_date: '',
                      notes: `High match (${selectedJobForModal.match_percentage}%). Applied via CareerPilot.`
                    }
                  ]);
                  setSelectedJobForModal(null);
                  setActiveTab('tracker');
                }}
                className="px-4 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold"
              >
                Track in Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>CareerPilot AI — Transparent Career Discovery & Placement Readiness.</p>
        <p className="mt-1 text-slate-400">
          All metrics and sample jobs are simulated for career navigation demonstrations. No employment guarantee is implied.
        </p>
      </footer>
    </div>
  );
}
