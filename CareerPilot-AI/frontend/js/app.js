/**
 * CareerPilot AI - Frontend Application Controller
 * Handles SPA navigation, data fetching, forms, interactive modals, and chat assistant.
 */

import { api } from './api.js';
import { components } from './components.js';

class CareerPilotApp {
  constructor() {
    this.currentView = 'landing';
    this.currentUser = api.getUser();
    this.jobsCache = [];
    this.chatHistory = [];
    this.activeJobForModal = null;

    this.init();
  }

  async init() {
    this.bindGlobalEvents();
    
    // Check if user has active session
    if (api.getToken()) {
      try {
        const user = await api.getCurrentUser();
        this.currentUser = user;
        api.setUser(user);
        this.updateAuthNav(true);
        this.navigate('dashboard');
        return;
      } catch (err) {
        console.warn('Session expired:', err);
        api.logout();
        this.currentUser = null;
      }
    }

    this.updateAuthNav(false);
    this.navigate('landing');
  }

  updateAuthNav(isLoggedIn) {
    const navItems = document.querySelectorAll('.auth-required');
    const guestItems = document.querySelectorAll('.guest-only');
    const userBadge = document.getElementById('user-profile-badge');

    navItems.forEach(el => el.style.display = isLoggedIn ? 'flex' : 'none');
    guestItems.forEach(el => el.style.display = isLoggedIn ? 'none' : 'flex');

    if (userBadge) {
      if (isLoggedIn && this.currentUser) {
        userBadge.style.display = 'flex';
        document.getElementById('header-user-name').textContent = this.currentUser.full_name || this.currentUser.email;
        if (this.currentUser.is_demo) {
          document.getElementById('demo-pill').style.display = 'inline-block';
        } else {
          document.getElementById('demo-pill').style.display = 'none';
        }
      } else {
        userBadge.style.display = 'none';
      }
    }
  }

  bindGlobalEvents() {
    // Navigation buttons
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.nav;
        this.navigate(target);
      });
    });

    // Demo login buttons
    document.querySelectorAll('.btn-trigger-demo').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleDemoLogin();
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        api.logout();
        this.currentUser = null;
        this.updateAuthNav(false);
        components.renderToast('Logged out successfully', 'info');
        this.navigate('landing');
      });
    }

    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });
  }

  navigate(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.style.display = 'block';
    }

    const activeNav = document.querySelector(`[data-nav="${viewName}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load view specific data
    switch (viewName) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'jobs':
        this.loadJobs();
        break;
      case 'profile':
        this.loadProfile();
        break;
      case 'readiness':
        this.loadReadiness();
        break;
      case 'tracker':
        this.loadApplications();
        break;
      case 'learning':
        this.loadLearningPlan();
        break;
      case 'assistant':
        this.initAssistant();
        break;
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
  }

  async handleDemoLogin() {
    try {
      components.renderToast('Authenticating demo account...', 'info');
      const res = await api.demoLogin();
      this.currentUser = res.user;
      this.updateAuthNav(true);
      components.renderToast('Signed in as Alex Morgan (Demo Candidate)', 'success');
      this.navigate('dashboard');
    } catch (err) {
      components.renderToast(`Demo login error: ${err.message}`, 'error');
    }
  }

  // Dashboard Loader
  async loadDashboardData() {
    try {
      const [readiness, recs, profile, apps] = await Promise.all([
        api.getReadinessScore().catch(() => null),
        api.getRecommendations(3).catch(() => []),
        api.getProfile().catch(() => null),
        api.getApplications().catch(() => [])
      ]);

      if (readiness) {
        const gaugeEl = document.getElementById('dash-readiness-gauge');
        if (gaugeEl) {
          gaugeEl.innerHTML = components.renderGauge(readiness.overall_readiness_score, readiness.tier);
        }
        document.getElementById('dash-readiness-summary').textContent = readiness.summary;
        document.getElementById('dash-interview-prob').textContent = readiness.projected_interview_probability;
      }

      if (profile) {
        document.getElementById('dash-candidate-headline').textContent = profile.headline;
        document.getElementById('dash-profile-completeness').textContent = `${profile.completeness_score}%`;
        document.getElementById('dash-profile-progress-bar').style.width = `${profile.completeness_score}%`;
      }

      // Render top recommended jobs
      const recContainer = document.getElementById('dash-recommended-jobs');
      if (recContainer) {
        recContainer.innerHTML = '';
        if (recs && recs.length > 0) {
          recs.forEach(job => {
            const card = components.renderJobCard(
              job,
              () => this.toggleJobSave(job),
              () => this.openApplyModal(job),
              () => this.openJobDetailModal(job)
            );
            recContainer.appendChild(card);
          });
        } else {
          recContainer.innerHTML = '<p style="color:#64748B;">No matching jobs found yet. Update your skills in Career Profile.</p>';
        }
      }

      // App stats
      const totalApps = apps.length;
      const activeInterviews = apps.filter(a => a.status === 'interview').length;
      document.getElementById('dash-stat-total-apps').textContent = totalApps;
      document.getElementById('dash-stat-interviews').textContent = activeInterviews;

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }

  // Jobs Discovery Loader
  async loadJobs() {
    const q = document.getElementById('job-search-input')?.value || '';
    const workType = document.getElementById('filter-work-type')?.value || '';
    const exp = document.getElementById('filter-experience')?.value || '';
    const sort = document.getElementById('filter-sort-by')?.value || 'match';

    const container = document.getElementById('jobs-results-container');
    if (container) {
      container.innerHTML = '<div style="padding:2rem; text-align:center; color:#64748B;">Scanning jobs database and computing explainable match scores...</div>';
    }

    try {
      const jobs = await api.getJobs({
        q,
        work_type: workType,
        experience_level: exp,
        sort_by: sort
      });

      this.jobsCache = jobs;
      if (container) {
        container.innerHTML = '';
        if (jobs.length === 0) {
          container.innerHTML = `
            <div style="grid-column: 1/-1; padding:3rem; text-align:center; background:#FFF; border-radius:1rem; border:1px solid #E2E8F0;">
              <h4 style="font-size:1.1rem; color:#0F172A; margin-bottom:0.5rem;">No jobs match your filter criteria</h4>
              <p style="color:#64748B; font-size:0.9rem;">Try broadening your keywords or resetting filters.</p>
            </div>`;
          return;
        }

        jobs.forEach(job => {
          const card = components.renderJobCard(
            job,
            () => this.toggleJobSave(job),
            () => this.openApplyModal(job),
            () => this.openJobDetailModal(job)
          );
          container.appendChild(card);
        });
      }
    } catch (err) {
      if (container) {
        container.innerHTML = `<p style="color:#EF4444;">Failed to load jobs: ${err.message}</p>`;
      }
    }
  }

  async toggleJobSave(job) {
    try {
      const res = await api.toggleSaveJob(job.id);
      job.is_saved = res.is_saved;
      components.renderToast(res.message, 'success');
      this.loadJobs();
    } catch (err) {
      components.renderToast(`Save failed: ${err.message}`, 'error');
    }
  }

  openJobDetailModal(job) {
    this.activeJobForModal = job;
    const modal = document.getElementById('modal-job-detail');
    if (!modal) return;

    document.getElementById('modal-job-title').textContent = job.title;
    document.getElementById('modal-job-company').textContent = `${job.company} • ${job.location} • ${job.work_type}`;
    document.getElementById('modal-job-match-badge').textContent = `${job.match_percentage}% Explainable Match`;
    document.getElementById('modal-job-desc').textContent = job.description;

    const reasonsList = document.getElementById('modal-job-reasons');
    reasonsList.innerHTML = (job.match_reasons || [])
      .map(r => `<li style="margin-bottom:0.4rem; color:#334155;">✓ ${r}</li>`)
      .join('');

    const missingList = document.getElementById('modal-job-missing');
    if (job.missing_skills && job.missing_skills.length > 0) {
      missingList.innerHTML = job.missing_skills
        .map(s => `<span class="badge badge-rose" style="margin-right:0.3rem;">Missing: ${s}</span>`)
        .join('');
    } else {
      missingList.innerHTML = '<span class="badge badge-emerald">All required core skills covered!</span>';
    }

    modal.style.display = 'flex';
  }

  openApplyModal(job) {
    this.activeJobForModal = job;
    const modal = document.getElementById('modal-apply');
    if (!modal) return;

    document.getElementById('apply-company-name').value = job.company;
    document.getElementById('apply-job-title').value = job.title;
    modal.style.display = 'flex';
  }

  // Profile Loader & Resume Parser
  async loadProfile() {
    try {
      const profile = await api.getProfile();
      document.getElementById('profile-headline').value = profile.headline || '';
      document.getElementById('profile-education').value = profile.education || '';
      document.getElementById('profile-experience').value = profile.years_experience || 2.0;
      document.getElementById('profile-location').value = profile.preferred_location || '';
      document.getElementById('profile-salary-min').value = profile.salary_min || 90000;
      document.getElementById('profile-salary-max').value = profile.salary_max || 140000;
      document.getElementById('profile-work-pref').value = profile.work_preference || 'Remote';
      document.getElementById('profile-skills-input').value = (profile.skills || []).join(', ');
      document.getElementById('profile-roles-input').value = (profile.preferred_roles || []).join(', ');
      document.getElementById('profile-resume-text').value = profile.resume_text || '';
      document.getElementById('profile-completeness-banner').textContent = `Profile Completeness: ${profile.completeness_score}%`;
    } catch (err) {
      components.renderToast(`Failed to load profile: ${err.message}`, 'error');
    }
  }

  // Placement Readiness & Match Tool
  async loadReadiness() {
    const container = document.getElementById('readiness-factors-list');
    try {
      const data = await api.getReadinessScore();
      document.getElementById('readiness-score-display').innerHTML = components.renderGauge(data.overall_readiness_score, data.tier);
      document.getElementById('readiness-summary-text').textContent = data.summary;
      document.getElementById('readiness-interview-rate').textContent = data.projected_interview_probability;
      document.getElementById('readiness-disclaimer-box').textContent = `Disclaimer: ${data.disclaimer}`;

      if (container) {
        container.innerHTML = (data.factors || []).map(f => `
          <div class="card" style="margin-bottom:1rem; border-left:4px solid ${f.score >= 15 ? '#10B981' : '#F59E0B'};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <h4 style="font-size:1rem; font-weight:700; color:#0F172A;">${f.name}</h4>
              <span class="badge ${f.score >= 15 ? 'badge-emerald' : 'badge-sample'}">${f.score} / ${f.max_score} pts</span>
            </div>
            <p style="font-size:0.875rem; color:#475569;">${f.description}</p>
          </div>
        `).join('');
      }

      const driversList = document.getElementById('readiness-positive-drivers');
      if (driversList) {
        driversList.innerHTML = (data.positive_drivers || [])
          .map(d => `<li style="margin-bottom:0.4rem; color:#166534;">✓ ${d}</li>`)
          .join('');
      }

      const growthList = document.getElementById('readiness-growth-areas');
      if (growthList) {
        growthList.innerHTML = (data.growth_areas || [])
          .map(g => `<li style="margin-bottom:0.4rem; color:#9A3412;">⚡ ${g}</li>`)
          .join('');
      }

    } catch (err) {
      console.error(err);
    }
  }

  // Application Tracker
  async loadApplications() {
    const board = document.getElementById('applications-kanban-board');
    if (!board) return;

    try {
      const apps = await api.getApplications();
      const stages = ['saved', 'applied', 'interview', 'offer', 'rejected'];

      stages.forEach(stage => {
        const stageCol = document.getElementById(`kanban-col-${stage}`);
        const countBadge = document.getElementById(`kanban-count-${stage}`);
        if (!stageCol) return;

        const stageApps = apps.filter(a => a.status === stage);
        if (countBadge) countBadge.textContent = stageApps.length;

        stageCol.innerHTML = '';
        if (stageApps.length === 0) {
          stageCol.innerHTML = '<div style="padding:1rem; text-align:center; font-size:0.8rem; color:#94A3B8; border:1px dashed #CBD5E1; border-radius:0.5rem;">No applications in this stage</div>';
          return;
        }

        stageApps.forEach(app => {
          const card = document.createElement('div');
          card.className = 'kanban-card';
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.35rem;">
              <h5 style="font-weight:700; font-size:0.95rem; color:#0F172A;">${app.company_name}</h5>
              <select class="kanban-stage-selector" style="font-size:0.75rem; padding:0.15rem 0.35rem; border:1px solid #CBD5E1; border-radius:0.25rem;">
                ${stages.map(s => `<option value="${s}" ${s === stage ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
              </select>
            </div>
            <p style="font-size:0.85rem; color:#475569; font-weight:500; margin-bottom:0.4rem;">${app.job_title}</p>
            ${app.applied_date ? `<p style="font-size:0.75rem; color:#64748B;">Date: ${app.applied_date}</p>` : ''}
            ${app.notes ? `<p style="font-size:0.75rem; color:#64748B; font-style:italic; margin-top:0.3rem;">"${app.notes}"</p>` : ''}
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-outline-dark btn-sm btn-delete-app" style="padding:0.15rem 0.4rem; font-size:0.7rem; color:#EF4444;">Delete</button>
            </div>
          `;

          card.querySelector('.kanban-stage-selector').addEventListener('change', async (e) => {
            const newStage = e.target.value;
            await api.updateApplication(app.id, { status: newStage });
            components.renderToast(`Moved application to ${newStage}`, 'info');
            this.loadApplications();
          });

          card.querySelector('.btn-delete-app').addEventListener('click', async () => {
            if (confirm(`Remove application for ${app.company_name}?`)) {
              await api.deleteApplication(app.id);
              components.renderToast('Application removed', 'info');
              this.loadApplications();
            }
          });

          stageCol.appendChild(card);
        });
      });
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  }

  // Learning Plan
  async loadLearningPlan() {
    const list = document.getElementById('learning-plan-list');
    if (!list) return;

    try {
      const items = await api.getLearningPlan();
      list.innerHTML = '';
      if (items.length === 0) {
        list.innerHTML = '<p style="color:#64748B;">No skill gaps currently identified. Keep analyzing target roles to build your plan!</p>';
        return;
      }

      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'card';
        row.style.cssText = 'margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;';

        const priorityBadge = item.priority === 'critical' ? 'badge-rose' : item.priority === 'high' ? 'badge-sample' : 'badge-teal';
        const isDone = item.status === 'completed';

        row.innerHTML = `
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <h4 style="font-size:1.05rem; font-weight:700; color:#0F172A; ${isDone ? 'text-decoration:line-through; color:#94A3B8;' : ''}">
                ${item.skill_name}
              </h4>
              <span class="badge ${priorityBadge}">${item.priority.toUpperCase()}</span>
              <span class="badge badge-gray">${item.estimated_hours} hrs effort</span>
            </div>
            <p style="font-size:0.85rem; color:#475569; margin-bottom:0.25rem;">${item.recommended_resource}</p>
            <span style="font-size:0.75rem; color:#64748B;">Category: ${item.category}</span>
          </div>

          <div style="display:flex; gap:0.5rem; align-items:center;">
            <select class="form-select form-select-status" style="width:auto; font-size:0.8rem; padding:0.35rem 0.65rem;">
              <option value="not_started" ${item.status === 'not_started' ? 'selected' : ''}>Not Started</option>
              <option value="in_progress" ${item.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button class="btn btn-outline-dark btn-sm btn-delete-item" style="color:#EF4444;">✕</button>
          </div>
        `;

        row.querySelector('.form-select-status').addEventListener('change', async (e) => {
          await api.updateLearningItem(item.id, { status: e.target.value });
          components.renderToast('Learning item updated', 'success');
          this.loadLearningPlan();
        });

        row.querySelector('.btn-delete-item').addEventListener('click', async () => {
          await api.deleteLearningItem(item.id);
          components.renderToast('Item removed', 'info');
          this.loadLearningPlan();
        });

        list.appendChild(row);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Career Assistant
  initAssistant() {
    if (this.chatHistory.length === 0) {
      this.chatHistory = [
        {
          role: 'assistant',
          content: 'Hello! I am CareerPilot AI, your career advisor. I can review your resume bullets, simulate technical/behavioral interviews, explain skill match gaps, and help plan your next promotion or job hunt. How can I help you today?'
        }
      ];
      this.renderChatMessages();
    }
  }

  renderChatMessages() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    container.innerHTML = '';
    this.chatHistory.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-assistant'}`;
      // Basic formatting for newlines and markdown-like asterisks
      const formatted = msg.content
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      bubble.innerHTML = formatted;
      container.appendChild(bubble);
    });
    container.scrollTop = container.scrollHeight;
  }

  async sendChatMessage(userText, mode = 'general') {
    if (!userText.trim()) return;

    this.chatHistory.push({ role: 'user', content: userText });
    this.renderChatMessages();

    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) indicator.style.display = 'block';

    try {
      const res = await api.sendChatMessage(this.chatHistory, mode);
      this.chatHistory.push({ role: 'assistant', content: res.response });
      this.renderChatMessages();

      const modelBadge = document.getElementById('assistant-model-badge');
      if (modelBadge) {
        modelBadge.textContent = res.is_gemini_active ? 'Gemini 3.8 Flash Active' : 'Local Career Coach Active';
        modelBadge.className = `badge ${res.is_gemini_active ? 'badge-teal' : 'badge-violet'}`;
      }
    } catch (err) {
      this.chatHistory.push({ role: 'assistant', content: `Error: ${err.message}. Please try again.` });
      this.renderChatMessages();
    } finally {
      if (indicator) indicator.style.display = 'none';
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.careerPilot = new CareerPilotApp();

  // Bind Form Submissions
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pwd = document.getElementById('login-password').value;
      try {
        await api.login(email, pwd);
        window.careerPilot.currentUser = api.getUser();
        window.careerPilot.updateAuthNav(true);
        components.renderToast('Welcome back to CareerPilot AI!', 'success');
        window.careerPilot.navigate('dashboard');
      } catch (err) {
        components.renderToast(err.message, 'error');
      }
    });
  }

  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pwd = document.getElementById('reg-password').value;
      try {
        await api.register(name, email, pwd);
        window.careerPilot.currentUser = api.getUser();
        window.careerPilot.updateAuthNav(true);
        components.renderToast('Account created successfully!', 'success');
        window.careerPilot.navigate('dashboard');
      } catch (err) {
        components.renderToast(err.message, 'error');
      }
    });
  }

  // Profile Save Form
  const profileForm = document.getElementById('form-profile');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const skillsStr = document.getElementById('profile-skills-input').value;
      const rolesStr = document.getElementById('profile-roles-input').value;

      const payload = {
        headline: document.getElementById('profile-headline').value,
        education: document.getElementById('profile-education').value,
        years_experience: parseFloat(document.getElementById('profile-experience').value),
        preferred_location: document.getElementById('profile-location').value,
        salary_min: parseInt(document.getElementById('profile-salary-min').value),
        salary_max: parseInt(document.getElementById('profile-salary-max').value),
        work_preference: document.getElementById('profile-work-pref').value,
        skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
        preferred_roles: rolesStr.split(',').map(r => r.trim()).filter(Boolean),
        resume_text: document.getElementById('profile-resume-text').value
      };

      try {
        await api.updateProfile(payload);
        components.renderToast('Career profile updated!', 'success');
        window.careerPilot.navigate('dashboard');
      } catch (err) {
        components.renderToast(err.message, 'error');
      }
    });
  }

  // Resume Parse Trigger
  const btnParseResume = document.getElementById('btn-parse-resume');
  if (btnParseResume) {
    btnParseResume.addEventListener('click', async () => {
      const text = document.getElementById('profile-resume-text').value;
      if (!text || text.length < 20) {
        components.renderToast('Please paste at least 20 characters of resume text to parse.', 'error');
        return;
      }
      try {
        components.renderToast('Parsing resume text with local explainable extractor...', 'info');
        const parsed = await api.parseResume(text);
        
        // Populate inputs with review option
        if (parsed.extracted_headline) document.getElementById('profile-headline').value = parsed.extracted_headline;
        if (parsed.extracted_education) document.getElementById('profile-education').value = parsed.extracted_education;
        if (parsed.extracted_years_experience) document.getElementById('profile-experience').value = parsed.extracted_years_experience;
        if (parsed.extracted_skills && parsed.extracted_skills.length) {
          document.getElementById('profile-skills-input').value = parsed.extracted_skills.join(', ');
        }
        if (parsed.extracted_roles && parsed.extracted_roles.length) {
          document.getElementById('profile-roles-input').value = parsed.extracted_roles.join(', ');
        }
        components.renderToast(`Extracted ${parsed.extracted_skills.length} skills and experience! Review before saving.`, 'success');
      } catch (err) {
        components.renderToast(`Parse error: ${err.message}`, 'error');
      }
    });
  }

  // Job Search Filter Trigger
  const btnSearchJobs = document.getElementById('btn-search-jobs');
  if (btnSearchJobs) {
    btnSearchJobs.addEventListener('click', () => {
      window.careerPilot.loadJobs();
    });
  }

  // Job Description Match Tool Trigger
  const btnAnalyzeDesc = document.getElementById('btn-analyze-jd');
  if (btnAnalyzeDesc) {
    btnAnalyzeDesc.addEventListener('click', async () => {
      const text = document.getElementById('custom-jd-input').value;
      if (!text || text.length < 20) {
        components.renderToast('Please paste a job description (at least 20 characters).', 'error');
        return;
      }
      try {
        components.renderToast('Analyzing skill alignment and match percentage...', 'info');
        const analysis = await api.analyzeJobDescription(text);
        
        document.getElementById('jd-result-card').style.display = 'block';
        document.getElementById('jd-match-score').textContent = `${analysis.overall_match}% Match`;
        
        const matchedContainer = document.getElementById('jd-matched-skills');
        matchedContainer.innerHTML = analysis.matched_skills.map(s => `<span class="badge badge-emerald">${s}</span>`).join(' ');

        const missingContainer = document.getElementById('jd-missing-skills');
        missingContainer.innerHTML = analysis.missing_skills.map(s => `<span class="badge badge-rose">${s}</span>`).join(' ');

        const actionsList = document.getElementById('jd-improvements-list');
        actionsList.innerHTML = analysis.actionable_improvements.map(a => `<li>${a}</li>`).join('');

        document.getElementById('jd-disclaimer').textContent = analysis.is_simulation_note;
      } catch (err) {
        components.renderToast(err.message, 'error');
      }
    });
  }

  // Chat message submit
  const chatForm = document.getElementById('form-chat');
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-text-input');
      const text = input.value;
      input.value = '';
      window.careerPilot.sendChatMessage(text);
    });
  }

  // Quick prompt chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      window.careerPilot.sendChatMessage(prompt);
    });
  });

  // Track Application Form Submission
  const formApply = document.getElementById('form-submit-app');
  if (formApply) {
    formApply.addEventListener('submit', async (e) => {
      e.preventDefault();
      const company = document.getElementById('apply-company-name').value;
      const title = document.getElementById('apply-job-title').value;
      const status = document.getElementById('apply-stage-select').value;
      const notes = document.getElementById('apply-notes').value;

      try {
        await api.createApplication({
          company_name: company,
          job_title: title,
          status,
          notes,
          job_id: window.careerPilot.activeJobForModal ? window.careerPilot.activeJobForModal.id : null
        });
        components.renderToast('Added to Application Tracker!', 'success');
        window.careerPilot.closeAllModals();
        window.careerPilot.loadApplications();
        window.careerPilot.navigate('tracker');
      } catch (err) {
        components.renderToast(err.message, 'error');
      }
    });
  }
});
