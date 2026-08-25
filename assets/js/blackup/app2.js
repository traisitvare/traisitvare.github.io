/* ============================================================================
   CV PORTFOLIO - MAIN JAVASCRIPT
   File: assets/js/app.js

   หน้าที่หลักของไฟล์นี้
   ---------------------------------------------------------------------------
   1. โหลดข้อมูลส่วนตัวและ Technical Skills จาก data.json
   2. โหลดประสบการณ์ทำงานจาก experience-data.json
   3. โหลดผลงาน รูปภาพ และ Caption จาก gallery-data.json
   4. สร้าง Technical Skills Matrix, Career Timeline และ Project Cards
   5. กรองผลงานตาม Category
   6. เปิดรูปผลงานใน Modal และเปลี่ยนรูปด้วยปุ่มหรือ Keyboard
   7. จัดการ Scroll Reveal, Theme และ Mobile Menu
   8. สร้าง Email และ Phone Links ใน Contact Terminal

   ไฟล์นี้จัด Comment และเว้นบรรทัดไว้เพื่อให้แก้ไขต่อได้ง่าย
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
      items: ['Production Support', 'Incident Management', 'Root Cause Analysis', 'Log Management', 'Runbook']
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
    element.textContent = value;
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
      throw new Error(`Cannot load ${path}`);
    }

    return await response.json();

  } catch (error) {
    console.warn(error.message);
    return fallbackValue;
  }
}

     


/* ============================================================================
   4) RENDER TECHNICAL SKILLS MATRIX

   สร้าง Grid 2 คอลัมน์ 3 แถวตามภาพตัวอย่างแรก
   ใช้ข้อมูล profile.technicalSkills จาก data.json
   ============================================================================ */

function renderTechnicalSkills(skillGroups = []) {
  const container = $('#technicalSkills');

  if (!container) {
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
   5) PROJECT IMAGE NORMALIZER

   รองรับ images ใน gallery-data.json ทั้งแบบ String และ Object ที่มี Caption
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
   6) PROJECT MODAL STATE
   ============================================================================ */

let allProjects = [];
let modalImages = [];
let modalIndex = 0;


/* อัปเดตรูป Caption จุด และปุ่ม Previous / Next */
function updateProjectModal() {
  const currentImage = modalImages[modalIndex];

  if (!currentImage) {
    return;
  }

  $('#modalImage').src = currentImage.src;
  $('#modalImage').alt = currentImage.caption || 'Project image';

  $('#modalCaption').textContent = currentImage.caption;
  $('#modalCaption').style.display =
    currentImage.caption ? 'block' : 'none';

  $('#modalDots').innerHTML = modalImages.map((_, index) => `
    <span class="modal-dot ${index === modalIndex ? 'active' : ''}"></span>
  `).join('');

  const hasMultipleImages = modalImages.length > 1;

  $('#modalPrev').style.display =
    hasMultipleImages ? 'block' : 'none';

  $('#modalNext').style.display =
    hasMultipleImages ? 'block' : 'none';
}


/* เปิด Modal และล็อก Scroll ของหน้าเว็บ */
function openProjectModal(images, startIndex = 0) {
  modalImages = (images || [])
    .map(normalizeProjectImage)
    .filter(image => image.src);

  if (!modalImages.length) {
    return;
  }

  modalIndex = Math.min(
    Math.max(startIndex, 0),
    modalImages.length - 1
  );

  updateProjectModal();

  $('#projectModal').classList.add('show');
  $('#projectModal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}


/* ปิด Modal และคืน Scroll ให้หน้าเว็บ */
function closeProjectModal() {
  $('#projectModal').classList.remove('show');
  $('#projectModal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}


/* step = -1 แสดงรูปก่อนหน้า, step = 1 แสดงรูปถัดไป */
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
   7) RENDER PROJECT CARDS

   สร้าง Cover, Title, Description, Technology Tags และ Thumbnail Images
   ============================================================================ */

function renderProjects(projects = []) {
  const projectGrid = $('#projectGrid');

  if (!projectGrid) {
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
   8) RENDER CAREER HISTORY

   หน้าแรกแสดง Period, Role, Company และ Summary จาก experience-data.json
   ============================================================================ */

function renderCareerHistory(experiences = []) {
  const timeline = $('#timeline');

  if (!timeline) {
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
   9) SCROLL REVEAL

   เพิ่ม Class show เมื่อ Element เลื่อนเข้ามาในหน้าจอ
   ============================================================================ */

function observeRevealElements() {
  const elements = $$('.reveal:not(.show)');

  if (!elements.length) {
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
   10) INITIALIZE PORTFOLIO

   โหลด Profile, Contact, Technical Skills, Experience และ Projects ตามลำดับ
   ============================================================================ */

      async function initPortfolio() {
      /* โหลดข้อมูล Profile จาก data.json */
      const profile = await getJSON(
      'data.json',
      fallbackProfile
      );
      /* ข้อมูลส่วน Profile */
      setText('#name', profile.name);
      setText('#nameEn', profile.nameEn);
      setText('#role', profile.role);
      setText('#summary', profile.summary);
      /* ข้อมูลส่วน Contact */
      setText('#email', profile.email);
      setText('#phone', profile.phone);
      setText('#line', profile.line);
      /*ความเชี่ยวชาญหน้า ABOUT
       หาก profile.skills ใน data.json เป็น Array:
      ใช้ข้อมูลจาก data.json
       หากไม่มีข้อมูลหรือชนิดข้อมูลไม่ถูกต้อง:
      ใช้ fallbackProfile.skills*/
      renderSkills(Array.isArray(profile.skills)
      ? profile.skills: fallbackProfile.skills
      );

    

  renderTechnicalSkills(
    profile.technicalSkills || fallbackProfile.technicalSkills
  );


  /* CONTACT LINKS ภายใน Terminal Contact */
  const emailSubject = encodeURIComponent(
    'Contact from Portfolio'
  );

  const emailURL =
    `mailto:${profile.email}?subject=${emailSubject}`;

  const cleanPhoneNumber =
    (profile.phone || '').replace(/[^+\d]/g, '');

  if ($('#emailLink')) {
    $('#emailLink').href = emailURL;
  }

  if ($('#emailDisplayLink')) {
    $('#emailDisplayLink').href = emailURL;
  }

  if ($('#phoneLink')) {
    $('#phoneLink').href = `tel:${cleanPhoneNumber}`;
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
   11) PROJECT MODAL EVENTS

   ใช้ Event Delegation เพราะ Project Cards ถูกสร้างหลังจากโหลด JSON
   ============================================================================ */

document.addEventListener('click', event => {
  const imageLink = event.target.closest('.project-image');

  if (!imageLink) {
    return;
  }

  event.preventDefault();

  const projectId = Number(
    imageLink.dataset.projectId
  );

  const imageIndex = Number(
    imageLink.dataset.imageIndex
  ) || 0;

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

$('#modalClose')?.addEventListener(
  'click',
  closeProjectModal
);

$('[data-close]')?.addEventListener(
  'click',
  closeProjectModal
);

$('#modalPrev')?.addEventListener(
  'click',
  () => changeProjectImage(-1)
);

$('#modalNext')?.addEventListener(
  'click',
  () => changeProjectImage(1)
);


/* Keyboard: ESC ปิด Modal, ลูกศรซ้ายและขวาเปลี่ยนรูป */
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
   12) THEME

   บันทึก Theme ที่เลือกไว้ใน localStorage
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
   13) MOBILE NAVIGATION
   ============================================================================ */

$('#menuBtn')?.addEventListener('click', () => {
  const menu = $('#navLinks');
  const menuIsOpen = menu.classList.toggle('open');

  $('#menuBtn').setAttribute(
    'aria-expanded',
    String(menuIsOpen)
  );
});

$$('#navLinks a').forEach(link => {
  link.addEventListener('click', () => {
    $('#navLinks').classList.remove('open');
    $('#menuBtn').setAttribute('aria-expanded', 'false');
  });
});


/* ============================================================================
   14) FOOTER YEAR และ START APPLICATION
   ============================================================================ */

setText(
  '#year',
  new Date().getFullYear()
);

initPortfolio();
