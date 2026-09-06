// =====================================================================
// Rafael Costa — Portfolio Scripts
// Handles: Theme Toggle, Lightbox, Dynamic Project Rendering from JSON,
// Accessible Tab Navigation, Contact Form Submission, and Scroll Spy.
// =====================================================================

// --- Print button ---
document.getElementById('print-btn')?.addEventListener('click', () => {
  window.print();
});

// --- Theme Toggle Logic ---
(() => {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const iconEl = toggleBtn.querySelector('.theme-icon');
  const labelEl = toggleBtn.querySelector('.theme-label');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  function updateThemeUI(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (iconEl) iconEl.textContent = '☀️';
      if (labelEl) labelEl.textContent = 'Light';
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
      if (metaTheme) metaTheme.setAttribute('content', '#111513');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      if (iconEl) iconEl.textContent = '🌙';
      if (labelEl) labelEl.textContent = 'Dark';
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      if (metaTheme) metaTheme.setAttribute('content', '#F1F2EC');
    }
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  updateThemeUI(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    updateThemeUI(nextTheme);
  });
})();

// --- Lightbox Logic ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
let lastFocused = null;

function openLightbox(img) {
  lastFocused = document.activeElement;
  lightboxImg.src = img.src;
  lightboxImg.alt = '';
  lightboxCaption.textContent = img.alt || '';
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
  lightboxCaption.textContent = '';
  (lastFocused || lightboxClose)?.focus();
}

lightboxClose?.addEventListener('click', closeLightbox);

lightbox?.addEventListener('click', (e) => {
  if (e.target !== lightboxClose) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('active')) return;
  if (e.key === 'Escape') {
    closeLightbox();
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    lightboxClose?.focus();
  }
});

function initLightbox() {
  document.querySelectorAll('.gallery img, .photo-frame img').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    if (!img.hasAttribute('aria-label')) {
      img.setAttribute('aria-label', `Enlarge image: ${img.alt || 'project photo'}`);
    }
    img.onclick = () => openLightbox(img);
    img.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    };
  });
}

// --- PDF Preview Modal Logic ---
const pdfModal = document.getElementById('pdf-modal');
const pdfModalFrame = document.getElementById('pdf-modal-frame');
const pdfModalTitle = document.getElementById('pdf-modal-title');
const pdfModalDownload = document.getElementById('pdf-modal-download');
const pdfModalClose = document.getElementById('pdf-modal-close');
let lastPdfFocused = null;

function openPdfModal(url, title) {
  if (!pdfModal || !pdfModalFrame) return;
  lastPdfFocused = document.activeElement;
  pdfModalTitle.textContent = title || 'Document Preview';
  pdfModalFrame.src = `${url}#view=FitH`;
  if (pdfModalDownload) {
    pdfModalDownload.href = url;
    const filename = url.split('/').pop() || 'document.pdf';
    pdfModalDownload.setAttribute('download', filename);
  }
  pdfModal.classList.add('active');
  pdfModal.setAttribute('aria-hidden', 'false');
  pdfModalClose?.focus();
}

function closePdfModal() {
  if (!pdfModal || !pdfModalFrame) return;
  pdfModal.classList.remove('active');
  pdfModal.setAttribute('aria-hidden', 'true');
  pdfModalFrame.src = '';
  (lastPdfFocused || pdfModalClose)?.focus();
}

pdfModalClose?.addEventListener('click', closePdfModal);
pdfModal?.addEventListener('click', (e) => {
  if (e.target === pdfModal) closePdfModal();
});

document.addEventListener('keydown', (e) => {
  if (!pdfModal?.classList.contains('active')) return;
  if (e.key === 'Escape') {
    closePdfModal();
  }
});

function initPdfLinks() {
  document.querySelectorAll('.preview-pdf-link, .doc-link').forEach(link => {
    link.onclick = (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const url = link.getAttribute('href');
      const title = link.getAttribute('data-title') || link.textContent.trim();
      openPdfModal(url, title);
    };
  });
}

// --- Dynamic Rendering from projects.json ---
function renderEngineeringCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.id = `project-${project.id}`;

  // Cover image / placeholder
  let coverHtml = '';
  if (project.cover && project.cover.src) {
    coverHtml = `<img loading="lazy" decoding="async" src="${project.cover.src}" alt="${project.cover.alt || ''}">`;
  } else {
    coverHtml = `Photo — ${project.title}`;
  }

  // Tags
  const tagsHtml = project.tags && project.tags.length
    ? `<span class="project-tags">${project.tags.join(' &middot; ')}</span>`
    : '';

  // Meta (role/dates)
  const metaHtml = project.role ? `<p class="project-meta">${project.role}</p>` : '';

  // Description paragraphs
  const descParagraphs = Array.isArray(project.description) ? project.description : [project.description];
  const bodyHtml = descParagraphs.length
    ? `<div class="project-body">${descParagraphs.map(p => `<p>${p}</p>`).join('')}</div>`
    : '';

  // Gallery
  const galleryHtml = project.gallery && project.gallery.length
    ? `<div class="gallery">${project.gallery.map(img => `<img loading="lazy" decoding="async" src="${img.src}" alt="${img.alt || ''}" class="${img.wide ? 'wide ' : ''}gallery-img">`).join('')}</div>`
    : '';

  // Videos
  const videosHtml = project.videos && project.videos.length
    ? `<div class="video-wrap">${project.videos.map(v => `<video controls preload="metadata"${v.poster ? ` poster="${v.poster}"` : ''}><source src="${v.src}" type="${v.type || 'video/mp4'}"></video>`).join('')}</div>`
    : '';

  // Document downloads / previews
  const isFileProto = window.location.protocol === 'file:';
  const dlAttr = isFileProto ? '' : ' download';
  const docsHtml = project.docs && project.docs.length
    ? `<div class="doc-links">${project.docs.map(d => `<a class="doc-link preview-pdf-link" href="${d.url}" data-title="${d.label}" target="_blank" rel="noopener"${dlAttr}>${d.label}</a>`).join('')}</div>`
    : '';

  // External links
  const extHtml = project.links && project.links.length
    ? `<div class="ext-links">${project.links.map(l => `<a class="ext-link" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')}</div>`
    : '';

  card.innerHTML = `
    <div class="photo-frame">
      ${coverHtml}
    </div>
    <div>
      ${tagsHtml}
      <h3 class="project-title">${project.title}</h3>
      ${metaHtml}
      ${bodyHtml}
      ${galleryHtml}
      ${videosHtml}
      ${docsHtml}
      ${extHtml}
    </div>
  `;
  return card;
}

function renderPersonalCard(project) {
  const card = document.createElement('div');
  card.className = 'mini-card';
  card.id = `project-${project.id}`;

  const tagsHtml = project.tags && project.tags.length
    ? `<span class="project-tags">${project.tags.join(' &middot; ')}</span>`
    : '';

  const descHtml = project.description ? `<p>${project.description}</p>` : '';

  let videoHtml = '';
  if (project.video && project.video.src) {
    videoHtml = `
      <div class="video-wrap">
        <video controls preload="metadata"${project.video.poster ? ` poster="${project.video.poster}"` : ''}>
          <source src="${project.video.src}" type="${project.video.type || 'video/mp4'}">
        </video>
      </div>`;
  }

  const galleryHtml = project.gallery && project.gallery.length
    ? `<div class="gallery">${project.gallery.map(img => `<img loading="lazy" decoding="async" src="${img.src}" alt="${img.alt || ''}" class="gallery-img">`).join('')}</div>`
    : '';

  const extHtml = project.links && project.links.length
    ? `<div class="ext-links">${project.links.map(l => `<a class="ext-link" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')}</div>`
    : '';

  card.innerHTML = `
    ${tagsHtml}
    <h4>${project.title}</h4>
    ${descHtml}
    ${videoHtml}
    ${galleryHtml}
    ${extHtml}
  `;
  return card;
}

// --- Scroll Spy Logic ---
let currentSpyObserver = null;
let currentScrollSpyNav = null;
let currentScrollSpyHandler = null;

function updateScrollSpy() {
  if (currentSpyObserver) {
    currentSpyObserver.disconnect();
    currentSpyObserver = null;
  }
  if (currentScrollSpyHandler) {
    window.removeEventListener('scroll', currentScrollSpyHandler);
    currentScrollSpyHandler = null;
  }
  if (currentScrollSpyNav) {
    currentScrollSpyNav.remove();
    currentScrollSpyNav = null;
  }

  const activePanel = document.querySelector('.tab-panel.active');
  if (!activePanel || activePanel.id === 'panel-contact') {
    return;
  }

  const items = Array.from(activePanel.querySelectorAll('.project-card, .mini-card'));
  if (items.length <= 1) return;

  const nav = document.createElement('nav');
  nav.className = 'scroll-spy no-print';
  const track = document.createElement('div');
  track.className = 'scroll-spy-track';
  nav.appendChild(track);
  document.body.appendChild(nav);
  currentScrollSpyNav = nav;

  const dots = [];
  items.forEach((item, index) => {
    if (!item.id) item.id = `item-${index}`;
    const titleEl = item.querySelector('.project-title, h4');
    const title = titleEl ? titleEl.innerText.trim() : `Item ${index + 1}`;

    const dot = document.createElement('a');
    dot.href = `#${item.id}`;
    dot.className = 'scroll-spy-dot';
    dot.setAttribute('data-title', title);
    dot.setAttribute('aria-label', `Scroll to ${title}`);

    dot.addEventListener('click', (e) => {
      e.preventDefault();
      item.scrollIntoView({ behavior: 'smooth' });
    });

    track.appendChild(dot);
    dots.push(dot);
  });

  function setActiveDot(index) {
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  function checkBottom() {
    const scrollPos = window.innerHeight + window.scrollY;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const lastItem = items[items.length - 1];
    const lastItemRect = lastItem ? lastItem.getBoundingClientRect() : null;

    if (scrollPos >= docHeight - 140 || (lastItemRect && lastItemRect.bottom <= window.innerHeight + 80)) {
      setActiveDot(dots.length - 1);
      return true;
    }
    return false;
  }

  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -40% 0px',
    threshold: 0
  };

  currentSpyObserver = new IntersectionObserver((entries) => {
    if (checkBottom()) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = items.indexOf(entry.target);
        if (idx !== -1) setActiveDot(idx);
      }
    });
  }, observerOptions);

  items.forEach(item => currentSpyObserver.observe(item));

  currentScrollSpyHandler = () => {
    checkBottom();
  };
  window.addEventListener('scroll', currentScrollSpyHandler, { passive: true });

  if (!checkBottom()) {
    setActiveDot(0);
  }
}

// --- Tabs Management ---
function switchTab(tabId, updateHash = true, scrollIntoView = false) {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  let activeBtn = document.getElementById(tabId);
  if (!activeBtn) {
    if (tabId === 'projects' || tabId === 'engineering' || tabId === 'panel-engineering') {
      activeBtn = document.getElementById('tab-engineering');
    } else if (tabId === 'personal' || tabId === 'personal-projects' || tabId === 'panel-personal') {
      activeBtn = document.getElementById('tab-personal');
    } else if (tabId === 'contact' || tabId === 'panel-contact') {
      activeBtn = document.getElementById('tab-contact');
    }
  }
  if (!activeBtn) return;

  const targetPanelId = activeBtn.getAttribute('aria-controls');

  tabs.forEach(btn => {
    const isTarget = btn === activeBtn;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    btn.setAttribute('tabindex', isTarget ? '0' : '-1');
  });

  panels.forEach(panel => {
    const isTarget = panel.id === targetPanelId;
    if (isTarget) {
      panel.removeAttribute('hidden');
      panel.classList.add('active');
    } else {
      panel.setAttribute('hidden', '');
      panel.classList.remove('active');
    }
  });

  if (updateHash) {
    const hash = targetPanelId.replace('panel-', '');
    if (window.location.hash !== `#${hash}`) {
      history.replaceState(null, '', `#${hash}`);
    }
  }

  updateScrollSpy();

  if (scrollIntoView) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function setupTabs() {
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      switchTab(tab.id);
    });

    tab.addEventListener('keydown', (e) => {
      let targetIdx = null;
      if (e.key === 'ArrowRight') {
        targetIdx = (idx + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        targetIdx = (idx - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        targetIdx = 0;
      } else if (e.key === 'End') {
        targetIdx = tabs.length - 1;
      }

      if (targetIdx !== null) {
        e.preventDefault();
        tabs[targetIdx].focus();
        switchTab(tabs[targetIdx].id);
      }
    });
  });

  // Hero contact button
  document.getElementById('hero-contact-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('tab-contact', true, true);
  });

  // Footer contact link
  document.querySelector('.footer-contact-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('tab-contact', true, true);
  });

  // Handle URL hash on load or change
  function handleHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'contact') {
      switchTab('tab-contact', false, false);
    } else if (hash === 'personal' || hash === 'personal-projects') {
      switchTab('tab-personal', false, false);
    } else if (hash === 'engineering' || hash === 'projects') {
      switchTab('tab-engineering', false, false);
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

// --- Contact Form Handling ---
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form || !statusEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // Friendly prompt if Formspree ID has not yet been configured
    if (form.action.includes('YOUR_FORM_ID')) {
      statusEl.className = 'form-status info';
      statusEl.innerHTML = '<strong>Form endpoint setup:</strong> To connect this form to your inbox, sign up for a free account at <a href="https://formspree.io" target="_blank" rel="noopener" style="text-decoration:underline;">formspree.io</a>, create a form, and replace <code>YOUR_FORM_ID</code> in <code>index.html</code> with your Form ID.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.className = 'form-status';
    statusEl.textContent = '';
    form.querySelectorAll('[data-fs-error]').forEach(el => { el.textContent = ''; });

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusEl.className = 'form-status success';
        statusEl.textContent = 'Thank you! Your message has been sent successfully. I will get back to you soon.';
        form.reset();
      } else {
        let errorMsg = 'Oops! There was a problem submitting your message. Please try again.';
        try {
          const data = await response.json();
          if (data && data.errors && data.errors.length) {
            errorMsg = data.errors.map(err => err.message).join(', ');
            data.errors.forEach(err => {
              if (err.field) {
                const fieldErrorEl = form.querySelector(`[data-fs-error="${err.field}"]`);
                if (fieldErrorEl) fieldErrorEl.textContent = err.message;
              }
            });
          }
        } catch (_) {}
        statusEl.className = 'form-status error';
        statusEl.textContent = errorMsg;
      }
    } catch (err) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Network error. Please check your connection and try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

// --- Initialization ---
async function initApp() {
  let data = null;

  try {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.warn('Could not fetch projects.json, checking embedded fallback:', err);
    const fallbackEl = document.getElementById('projects-fallback-data');
    if (fallbackEl && fallbackEl.textContent.trim()) {
      try {
        data = JSON.parse(fallbackEl.textContent);
      } catch (parseErr) {
        console.error('Failed to parse fallback JSON:', parseErr);
      }
    }
  }

  if (data) {
    // Render Engineering Projects
    const engList = document.getElementById('engineering-projects-list');
    if (engList && data.engineering) {
      engList.innerHTML = '';
      data.engineering.forEach(proj => {
        engList.appendChild(renderEngineeringCard(proj));
      });
      const engCount = data.engineering.length;
      const engCountText = `${engCount} project${engCount === 1 ? '' : 's'}`;
      const engCountEl = document.getElementById('engineering-count');
      const engBadgeEl = document.getElementById('engineering-badge');
      if (engCountEl) engCountEl.textContent = engCountText;
      if (engBadgeEl) engBadgeEl.textContent = engCount;
    }

    // Render Personal Projects
    const personalList = document.getElementById('personal-projects-list');
    if (personalList && data.personal) {
      personalList.innerHTML = '';
      data.personal.forEach(proj => {
        personalList.appendChild(renderPersonalCard(proj));
      });
      const perCount = data.personal.length;
      const perCountText = `${perCount} project${perCount === 1 ? '' : 's'}`;
      const perCountEl = document.getElementById('personal-count');
      const perBadgeEl = document.getElementById('personal-badge');
      if (perCountEl) perCountEl.textContent = perCountText;
      if (perBadgeEl) perBadgeEl.textContent = perCount;
    }

    initLightbox();
    initPdfLinks();
    updateScrollSpy();
  }

  setupTabs();
  setupContactForm();
  initPdfLinks();

  if (window.location.protocol === 'file:') {
    document.querySelectorAll('a[download]').forEach(a => {
      a.removeAttribute('download');
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
