/**
 * CareerPilot AI - Frontend API Client
 * Manages authentication tokens and communicates with FastAPI backend endpoints.
 */

const API_BASE = window.location.origin.includes(':8000') 
  ? window.location.origin 
  : '';

export const api = {
  getToken() {
    return localStorage.getItem('careerpilot_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('careerpilot_token', token);
    } else {
      localStorage.removeItem('careerpilot_token');
    }
  },

  getUser() {
    const raw = localStorage.getItem('careerpilot_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('careerpilot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('careerpilot_user');
    }
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      this.setToken(null);
      this.setUser(null);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.detail || data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  },

  // Auth
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.access_token);
    this.setUser(res.user);
    return res;
  },

  async register(fullName, email, password) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password })
    });
    this.setToken(res.access_token);
    this.setUser(res.user);
    return res;
  },

  async demoLogin() {
    const res = await this.request('/api/auth/demo-login', {
      method: 'POST'
    });
    this.setToken(res.access_token);
    this.setUser(res.user);
    return res;
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
  },

  async getCurrentUser() {
    return this.request('/api/auth/me');
  },

  // Profile
  async getProfile() {
    return this.request('/api/profile');
  },

  async updateProfile(profileData) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async parseResume(resumeText) {
    return this.request('/api/profile/parse-resume', {
      method: 'POST',
      body: JSON.stringify({ resume_text: resumeText })
    });
  },

  // Jobs
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/jobs${query ? '?' + query : ''}`);
  },

  async getSavedJobs() {
    return this.request('/api/jobs/saved');
  },

  async toggleSaveJob(jobId) {
    return this.request(`/api/jobs/${jobId}/toggle-save`, {
      method: 'POST'
    });
  },

  // Recommendations & Matching
  async getRecommendations(limit = 6) {
    return this.request(`/api/recommendations?limit=${limit}`);
  },

  async analyzeJobDescription(jobDescription, targetRole = '') {
    return this.request('/api/recommendations/analyze-description', {
      method: 'POST',
      body: JSON.stringify({ job_description: jobDescription, target_role: targetRole })
    });
  },

  // Placement Readiness
  async getReadinessScore() {
    return this.request('/api/readiness');
  },

  // Applications
  async getApplications() {
    return this.request('/api/applications');
  },

  async createApplication(appData) {
    return this.request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
  },

  async updateApplication(id, appData) {
    return this.request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appData)
    });
  },

  async deleteApplication(id) {
    return this.request(`/api/applications/${id}`, {
      method: 'DELETE'
    });
  },

  // Learning Plan
  async getLearningPlan() {
    return this.request('/api/learning-plan');
  },

  async addLearningItem(itemData) {
    return this.request('/api/learning-plan', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  },

  async updateLearningItem(id, itemData) {
    return this.request(`/api/learning-plan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  },

  async deleteLearningItem(id) {
    return this.request(`/api/learning-plan/${id}`, {
      method: 'DELETE'
    });
  },

  // Career Assistant
  async sendChatMessage(messages, mode = 'general') {
    return this.request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, mode })
    });
  }
};
