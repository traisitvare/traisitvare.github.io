/* ============================================================================
   CV PORTFOLIO - MAIN JAVASCRIPT
   File: assets/js/app.js

   หน้าที่หลักของไฟล์นี้
   ---------------------------------------------------------------------------
   1. โหลดข้อมูลส่วนตัว, About Skills และ Technical Skills จาก data.json
   2. โหลดประสบการณ์ทำงานจาก experience-data.json
   3. โหลดผลงาน รูปภาพ และ Caption จาก gallery-data.json
   4. สร้าง About Skills, Technical Skills Matrix, Career Timeline และ Project Cards
   5. กรองผลงานตาม Category
   6. เปิดรูปผลงานใน Modal และเปลี่ยนรูปด้วยปุ่มหรือ Keyboard
   7. จัดการ Scroll Reveal, Theme และ Mobile Menu
   8. สร้าง Email, Phone และ Line ใน Contact Terminal
   ============================================================================ */


/* ============================================================================
   1) FALLBACK PROFILE

   ใช้เมื่อ data.json โหลดไม่ได้หรือ JSON มี Syntax Error
   หาก data.json โหลดสำเร็จ ข้อมูลจาก data.json จะถูกใช้แทน
   ============================================================================ */

const fallbackProfile = {
  name: 'ไตรสิทธิ์ วารีรัตน์ภากร',
  nameEn: 'Traisit Wareeratpakron',
  role: 'Senior System Engineer | Production Operations | Monitoring & Automation',
  summary: 'System Engineer ที่เชี่ยวชาญ Linux, Database, Monitoring และ Automation',
  email: 'taisit1998@gmail.com',
  phone: '+66 93 198 9779',
  line: 'ou2705',

  /* ข้อมูลสำรองสำหรับ About Skills */
  skills: [
    'Linux Administration',
    'Bash / Perl',
    'MariaDB / MySQL',
    'Oracle',
    'Nagios / NRPE',
    'Incident Management',
    'Log Management',
    'RCA & Automation'
  ],

  /* ข้อมูลสำรองสำหรับ Technical Skills Matrix */
  technicalSkills: [
    {
      number: '01',
      title: 'Operating Systems',
      items: ['Linux', 'Unix', 'Windows Server', 'Red Hat Enterprise Linux']
    },
    {
      number: '02',
      title: 'Monitoring & Observability',
      items: ['Nagios', 'NRPE', 'NSClient++', 'Dynatrace', 'Grafana', 'Prometheus', 'WMI']
    },
    {
      number: '03',
      title: 'Database',
      items: ['Microsoft SQL Server', 'MariaDB', 'MySQL', 'Oracle', 'T-SQL', 'SQL']
    },
    {
      number: '04',
      title: 'Scripting & Automation',
      items: ['Bash', 'Shell Script', 'PowerShell', 'Perl', 'Cron', 'Task Scheduler']
    },
    {
      number: '05',
      title: 'Container & Platform',
      items: ['Docker', 'Kubernetes', 'Red Hat OpenShift']
    },
    {
      number: '06',
      title: 'Operations',
      items: [
        'Production Support',
        'Incident Management',
        'Root Cause Analysis',
        'Log Management',
        'Runbook'
      ]
    }
  ]
};


/* ============================================================================
   2) DOM HELPERS
   ============================================================================ */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


/* ใส่ข้อความผ่าน textContent และไม่ Error หากไม่มี Element */
function setText(selector, value = '') {
  const element = $(selector);

  if (element) {
    element.textContent = value ?? '';
  }
}


/* Escape ข้อมูลจาก JSON ก่อนนำไปประกอบเป็น innerHTML */
function escapeHTML(value = '') {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]
  );
}


/* ============================================================================
   3) LOAD JSON

   path          = ตำแหน่งไฟล์ JSON
   fallbackValue = ข้อมูลสำรองเมื่อโหลดไม่สำเร็จ
   ============================================================================ */

async function getJSON(path, fallbackValue = []) {
  try {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Cannot load ${path}: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(error.message);
    return fallbackValue;
  }
}


/* ============================================================================
   4) RENDER ABOUT SKILLS

   อ่าน profile.skills จาก data.json แล้วสร้าง <span> ภายใน #skills
   ใช้ textContent จึงไม่ต้องเขียน &amp; ใน data.json
   ============================================================================ */

function renderSkills(skills = []) {
  const container = $('#skills');

  if (!container) {
    console.warn('ไม่พบ Element id="skills" ใน index.html');
    return;
  }

  container.replaceChildren();

  if (!Array.isArray(skills)) {
    console.warn('skills ใน data.json ต้องเป็น Array');
    return;
  }

  skills.forEach(skill => {
    const skillTag = document.createElement('span');
    skillTag.textContent = skill;
    container.appendChild(skillTag);
  });
}


/* ============================================================================
   5) RENDER TECHNICAL SKILLS MATRIX

   ใช้ข้อมูล profile.technicalSkills จาก data.json
   ============================================================================ */

function renderTechnicalSkills(skillGroups = []) {
  const container = $('#technicalSkills');

  if (!container) {
    return;
  }

  if (!Array.isArray(skillGroups)) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = skillGroups.map((group, index) => {
    const displayNumber =
      group.number || String(index + 1).padStart(2, '0');

    return `
      <article class="skill-matrix-item">
        <span class="skill-number">
          ${escapeHTML(displayNumber)}
        </span>

        <h3>${escapeHTML(group.title)}</h3>

        <div class="skill-matrix-tags">
          ${(group.items || []).map(item => `
            <span class="skill-matrix-tag">
              ${escapeHTML(item)}
            </span>
          `).join('')}
        </div>
      </article>
    `;
  }).join('');
}


/* ============================================================================
   6) PROJECT IMAGE NORMALIZER
   ============================================================================ */

function normalizeProjectImage(image) {
  if (typeof image === 'string') {
    return {
      src: image,
      caption: ''
    };
  }

  return {
    src: image?.src || '',
    caption: image?.caption || ''
  };
}


/* ============================================================================
   7) PROJECT MODAL STATE
   ============================================================================ */

let allProjects = [];
let modalImages = [];
let modalIndex = 0;


function updateProjectModal() {
  const currentImage = modalImages[modalIndex];
  const modalImage = $('#modalImage');
  const modalCaption = $('#modalCaption');
  const modalDots = $('#modalDots');
  const modalPrev = $('#modalPrev');
  const modalNext = $('#modalNext');

  if (!currentImage || !modalImage || !modalCaption || !modalDots) {
    return;
  }

  modalImage.src = currentImage.src;
  modalImage.alt = currentImage.caption || 'Project image';

  modalCaption.textContent = currentImage.caption;
  modalCaption.style.display = currentImage.caption ? 'block' : 'none';

  modalDots.innerHTML = modalImages.map((_, index) => `
    <span class="modal-dot ${index === modalIndex ? 'active' : ''}"></span>
  `).join('');

  const hasMultipleImages = modalImages.length > 1;

  if (modalPrev) {
    modalPrev.style.display = hasMultipleImages ? 'block' : 'none';
  }

  if (modalNext) {
    modalNext.style.display = hasMultipleImages ? 'block' : 'none';
  }
}


function openProjectModal(images, startIndex = 0) {
  const projectModal = $('#projectModal');

  modalImages = (images || [])
    .map(normalizeProjectImage)
    .filter(image => image.src);

  if (!modalImages.length || !projectModal) {
    return;
  }

  modalIndex = Math.min(
    Math.max(startIndex, 0),
    modalImages.length - 1
  );

  updateProjectModal();

  projectModal.classList.add('show');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}


function closeProjectModal() {
  const projectModal = $('#projectModal');

  if (!projectModal) {
    return;
  }

  projectModal.classList.remove('show');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}


function changeProjectImage(step) {
  if (!modalImages.length) {
    return;
  }

  modalIndex = (
    modalIndex + step + modalImages.length
  ) % modalImages.length;

  updateProjectModal();
}


/* ============================================================================
   8) RENDER PROJECT CARDS
   ============================================================================ */

function renderProjects(projects = []) {
  const projectGrid = $('#projectGrid');

  if (!projectGrid) {
    return;
  }

  if (!Array.isArray(projects)) {
    projectGrid.innerHTML = '';
    return;
  }

  projectGrid.innerHTML = projects.map(project => `
    <article class="project card reveal">
      <img
        class="project-cover"
        src="${escapeHTML(project.image)}"
        alt="${escapeHTML(project.title)}"
        loading="lazy"
      >

      <div class="project-body">
        <h3>${escapeHTML(project.title)}</h3>
        <p>${escapeHTML(project.desc)}</p>

        <div class="tags">
          ${(project.tech || []).map(technology => `
            <span class="tag">
              ${escapeHTML(technology)}
            </span>
          `).join('')}
        </div>

        <div class="work-images">
          ${(project.images || []).map((image, index) => {
            const normalizedImage = normalizeProjectImage(image);

            if (!normalizedImage.src) {
              return '';
            }

            return `
              <a
                href="#"
                class="project-image"
                data-project-id="${Number(project.id)}"
                data-image-index="${index}"
                aria-label="เปิดรูป ${escapeHTML(project.title)} ภาพที่ ${index + 1}"
              >
                <img
                  src="${escapeHTML(normalizedImage.src)}"
                  alt="${escapeHTML(project.title)} ภาพที่ ${index + 1}"
                  loading="lazy"
                >
              </a>
            `;
          }).join('')}
        </div>
      </div>
    </article>
  `).join('');

  observeRevealElements();
}


/* ============================================================================
   9) RENDER CAREER HISTORY
   ============================================================================ */

function renderCareerHistory(experiences = []) {
  const timeline = $('#timeline');

  if (!timeline) {
    return;
  }

  if (!Array.isArray(experiences)) {
    timeline.innerHTML = '';
    return;
  }

  timeline.innerHTML = experiences.map(item => `
    <article class="career-item reveal">
      <div class="career-period">
        ${escapeHTML(item.period)}
      </div>

      <div class="career-content">
        <div class="career-role-row">
          <h3>${escapeHTML(item.role)}</h3>
          <span class="career-arrow" aria-hidden="true">↗</span>
        </div>

        <h4>${escapeHTML(item.company)}</h4>
        <p>${escapeHTML(item.summary || '')}</p>
      </div>
    </article>
  `).join('');
}


/* ============================================================================
   10) SCROLL REVEAL
   ============================================================================ */

function observeRevealElements() {
  const elements = $$('.reveal:not(.show)');

  if (!elements.length) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('show'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  elements.forEach(element => observer.observe(element));
}


/* ============================================================================
   11) INITIALIZE PORTFOLIO
   ============================================================================ */

async function initPortfolio() {
  /* PROFILE, ABOUT SKILLS และ TECHNICAL SKILLS */
  const profile = await getJSON(
    'data.json',
    fallbackProfile
  );

  setText('#name', profile.name);
  setText('#nameEn', profile.nameEn);
  setText('#role', profile.role);
  setText('#summary', profile.summary);
  setText('#email', profile.email);
  setText('#phone', profile.phone);
  setText('#line', profile.line);

  /* ดึง About Skills จาก profile.skills ใน data.json */
  renderSkills(
    Array.isArray(profile.skills)
      ? profile.skills
      : fallbackProfile.skills
  );

  /* ดึง Technical Skills จาก profile.technicalSkills ใน data.json */
  renderTechnicalSkills(
    Array.isArray(profile.technicalSkills)
      ? profile.technicalSkills
      : fallbackProfile.technicalSkills
  );


  /* CONTACT LINKS ภายใน Terminal Contact */
  const emailSubject = encodeURIComponent(
    'Contact from Portfolio'
  );

  const emailURL =
    `mailto:${profile.email || ''}?subject=${emailSubject}`;

  const cleanPhoneNumber =
    (profile.phone || '').replace(/[^+\d]/g, '');

  const cleanLineId = String(profile.line || '').trim();

  if ($('#emailLink')) {
    $('#emailLink').href = emailURL;
  }

  if ($('#emailDisplayLink')) {
    $('#emailDisplayLink').href = emailURL;
  }

  if ($('#phoneLink')) {
    $('#phoneLink').href = `tel:${cleanPhoneNumber}`;
  }

  if ($('#lineLink')) {
    $('#lineLink').href = cleanLineId
      ? `https://line.me/ti/p/~${encodeURIComponent(cleanLineId)}`
      : '#';
  }


  /* EXPERIENCE */
  const experiences = await getJSON(
    'experience-data.json',
    []
  );

  renderCareerHistory(experiences);


  /* PROJECTS */
  allProjects = await getJSON(
    'gallery-data.json',
    []
  );

  renderProjects(allProjects);


  /* PROJECT FILTER */
  $$('.filter').forEach(button => {
    button.addEventListener('click', () => {
      $$('.filter').forEach(filterButton =>
        filterButton.classList.remove('active')
      );

      button.classList.add('active');

      const selectedCategory = button.dataset.filter;

      const filteredProjects = selectedCategory === 'all'
        ? allProjects
        : allProjects.filter(project =>
            project.category === selectedCategory
          );

      renderProjects(filteredProjects);
    });
  });

  observeRevealElements();
}


/* ============================================================================
   12) PROJECT MODAL EVENTS
   ============================================================================ */

document.addEventListener('click', event => {
  const imageLink = event.target.closest('.project-image');

  if (!imageLink) {
    return;
  }

  event.preventDefault();

  const projectId = Number(imageLink.dataset.projectId);
  const imageIndex = Number(imageLink.dataset.imageIndex) || 0;

  const selectedProject = allProjects.find(project =>
    Number(project.id) === projectId
  );

  if (selectedProject) {
    openProjectModal(
      selectedProject.images || [],
      imageIndex
    );
  }
});

$('#modalClose')?.addEventListener('click', closeProjectModal);
$('[data-close]')?.addEventListener('click', closeProjectModal);
$('#modalPrev')?.addEventListener('click', () => changeProjectImage(-1));
$('#modalNext')?.addEventListener('click', () => changeProjectImage(1));


document.addEventListener('keydown', event => {
  const modalIsOpen =
    $('#projectModal')?.classList.contains('show');

  if (!modalIsOpen) {
    return;
  }

  if (event.key === 'Escape') {
    closeProjectModal();
  }

  if (event.key === 'ArrowLeft') {
    changeProjectImage(-1);
  }

  if (event.key === 'ArrowRight') {
    changeProjectImage(1);
  }
});


/* ============================================================================
   13) THEME
   ============================================================================ */

const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
}

$('#themeBtn')?.addEventListener('click', () => {
  const nextTheme =
    document.documentElement.dataset.theme === 'light'
      ? 'dark'
      : 'light';

  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
});


/* ============================================================================
   14) MOBILE NAVIGATION
   ============================================================================ */

$('#menuBtn')?.addEventListener('click', () => {
  const menu = $('#navLinks');
  const menuButton = $('#menuBtn');

  if (!menu || !menuButton) {
    return;
  }

  const menuIsOpen = menu.classList.toggle('open');

  menuButton.setAttribute(
    'aria-expanded',
    String(menuIsOpen)
  );
});

$$('#navLinks a').forEach(link => {
  link.addEventListener('click', () => {
    $('#navLinks')?.classList.remove('open');
    $('#menuBtn')?.setAttribute('aria-expanded', 'false');
  });
});


/* ============================================================================
   15) FOOTER YEAR และ START APPLICATION
   ============================================================================ */

setText('#year', new Date().getFullYear());

initPortfolio();
