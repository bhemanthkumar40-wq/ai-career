/**
 * CareerPilot AI - Component Library
 * Generates reusable UI elements: job cards, readiness gauges, kanban cards, and badges.
 */

export const components = {
  renderJobCard(job, onSaveClick, onApplyClick, onDetailClick) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.dataset.jobId = job.id;

    const salaryText = `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    const matchScore = job.match_percentage || 75;

    const skillsHtml = (job.required_skills || [])
      .slice(0, 4)
      .map(s => `<span class="badge badge-gray">${s}</span>`)
      .join(' ');

    const missingHtml = (job.missing_skills || []).length > 0
      ? `<div style="margin-top:0.6rem; font-size:0.75rem; color:#64748B;">
           <span style="font-weight:600; color:#EF4444;">Skill Gap:</span> ${(job.missing_skills).slice(0, 2).join(', ')}
         </div>`
      : '';

    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <span class="match-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${matchScore}% Match
            </span>
            <span class="badge badge-sample" style="margin-left:0.4rem;">Sample Job</span>
          </div>
          <button class="btn btn-outline-dark btn-sm btn-save" title="${job.is_saved ? 'Remove from saved' : 'Save job'}" style="padding:0.35rem 0.6rem;">
            ${job.is_saved ? '★ Saved' : '☆ Save'}
          </button>
        </div>

        <h3 style="font-size:1.1rem; font-weight:700; color:var(--navy-900); margin-bottom:0.25rem; cursor:pointer;" class="job-title-link">
          ${job.title}
        </h3>
        <p style="font-size:0.875rem; font-weight:600; color:var(--text-secondary); margin-bottom:0.75rem;">
          ${job.company} • <span style="font-weight:400; color:var(--text-muted);">${job.location}</span>
        </p>

        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:1rem;">
          <span class="badge badge-teal">${job.work_type}</span>
          <span class="badge badge-violet">${job.experience_level}</span>
          <span class="badge badge-emerald">${salaryText}</span>
        </div>

        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin-bottom:1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${job.description}
        </p>

        <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.5rem;">
          ${skillsHtml}
        </div>
        ${missingHtml}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--off-white-border);">
        <span style="font-size:0.75rem; color:var(--text-muted);">${job.posted_date}</span>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-outline-dark btn-sm btn-detail">Inspect Match</button>
          <button class="btn btn-primary btn-sm btn-apply">Track Application</button>
        </div>
      </div>
    `;

    card.querySelector('.btn-save').addEventListener('click', (e) => {
      e.stopPropagation();
      if (onSaveClick) onSaveClick(job);
    });

    card.querySelector('.btn-apply').addEventListener('click', (e) => {
      e.stopPropagation();
      if (onApplyClick) onApplyClick(job);
    });

    card.querySelector('.btn-detail').addEventListener('click', (e) => {
      e.stopPropagation();
      if (onDetailClick) onDetailClick(job);
    });

    card.querySelector('.job-title-link').addEventListener('click', () => {
      if (onDetailClick) onDetailClick(job);
    });

    return card;
  },

  renderGauge(score, tier) {
    return `
      <div class="gauge-circle" style="--score-pct: ${score}">
        <div class="gauge-inner">
          <span class="gauge-number">${score}</span>
          <span class="gauge-label">Score / 100</span>
        </div>
      </div>
      <div style="margin-top:0.25rem;">
        <span class="badge badge-violet" style="font-size:0.85rem; padding:0.35rem 0.85rem;">${tier || 'Ready for Market'}</span>
      </div>
    `;
  },

  renderToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#1C2541'};
      color: #FFFFFF;
      padding: 0.85rem 1.35rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
      font-size: 0.9rem;
      font-weight: 500;
      z-index: 1000;
      animation: fadeIn 0.25s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};
