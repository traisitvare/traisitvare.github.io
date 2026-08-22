/* ================================================================
   CV PORTFOLIO: MAIN JAVASCRIPT
   แก้ข้อมูลส่วนตัวใน data.json
   แก้ประสบการณ์ใน experience-data.json
   แก้การศึกษาใน education-data.json
   แก้ผลงานและตำแหน่งรูปใน gallery-data.json
   ================================================================ */

// ข้อมูลสำรอง ใช้เฉพาะกรณี Browser โหลด data.json ไม่ได้
const fallbackProfile = {
  name: 'ไตรสิทธิ์ วารีรัตน์ภากร',
  nameEn: 'Traisit Wareeratpakron',
  role: 'System Engineer | CRM (APO) Operation Support',
  summary: 'System Engineer ที่เชี่ยวชาญ Linux, Database, Monitoring และ Automation',
  email: 'your.email@example.com',
  phone: '+66 XX XXX XXXX',
  skills: ['Linux Administration', 'Bash / Perl', 'MariaDB / MySQL', 'Oracle', 'Nagios / NRPE']
};

// Helper สำหรับเลือก Element: $('#id') หรือ $$('.class')
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// โหลด JSON และคืนค่า fallback เมื่อโหลดไม่สำเร็จ
async function getJSON(path, fallbackValue = []) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Cannot load ${path}`);
    return await response.json();
  } catch (error) {
    console.warn(error.message);
    return fallbackValue;
  }
}

// ตั้งข้อความอย่างปลอดภัย หากไม่พบ Element จะไม่ทำให้ Script หยุด
function setText(selector, value = '') {
  const element = $(selector);
  if (element) element.textContent = value;
}

// เริ่มโหลดและแสดงข้อมูลทุกส่วนของหน้า
async function initPortfolio() {
  const profile = await getJSON('data.json', fallbackProfile);
  setText('#name', profile.name);
  setText('#nameEn', profile.nameEn);
  setText('#role', profile.role);
  setText('#summary', profile.summary);
  setText('#email', profile.email);
  setText('#phone', profile.phone);

  const emailLink = $('#emailLink');
  if (emailLink) emailLink.href = `mailto:${profile.email}`;

  // สร้าง Skill Tags จาก Array ใน data.json
  const skills = $('#skills');
  if (skills) skills.innerHTML = (profile.skills || []).map(item => `<span class="tag">${item}</span>`).join('');

  // สร้างรายการประสบการณ์จาก experience-data.json
  const experienceData = await getJSON('experience-data.json');
  const timeline = $('#timeline');
  if (timeline) {
    timeline.innerHTML = experienceData.map(item => `
      <article class="timeline-item card reveal">
        <div class="period">${item.period}</div>
        <div><h3>${item.role}</h3><h4>${item.company}</h4>
          <ul>${item.details.map(detail => `<li>${detail}</li>`).join('')}</ul>
        </div>
      </article>`).join('');
  }

  // แสดงผลงานและตั้งค่าปุ่มกรองหมวดหมู่
  const projectData = await getJSON('gallery-data.json');
  renderProjects(projectData);
  $$('.filter').forEach(button => {
    button.addEventListener('click', () => {
      $$('.filter').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const selected = button.dataset.filter;
      renderProjects(selected === 'all' ? projectData : projectData.filter(project => project.category === selected));
    });
  });

  observeRevealElements();
}

// สร้าง Project Cards และรูปผลงานเพิ่มเติม
function renderProjects(items) {
  const projectGrid = $('#projectGrid');
  if (!projectGrid) return;

  projectGrid.innerHTML = items.map(project => `
    <article class="project card reveal">
      <!-- รูปหน้าปกของผลงาน แก้ path ที่ image ใน gallery-data.json -->
      <img class="project-cover" src="${project.image}" alt="${project.title}" loading="lazy">
      <div class="project-body">
        <h3>${project.title}</h3>
        <p>${project.desc}</p>
        <div class="skills">${project.tech.map(tech => `<span class="tag">${tech}</span>`).join('')}</div>
        <!-- รองรับหลายรูป: เพิ่ม path ใน images array ของ gallery-data.json -->
       <div class="work-images">
  ${(project.images || []).map((image, index) => `
    <a
      href="#"
      class="project-image-link"
      data-project="${project.title}"
      data-index="${index}"
      title="คลิกเพื่อขยายรูป"
    >
      <img
        src="${image}"
        alt="${project.title} ภาพที่ ${index + 1}"
        loading="lazy"
      >
    </a>
  `).join('')}
</div>
      </div>
    </article>`).join('');

  observeRevealElements();
}

// Animation เมื่อเลื่อนหน้าไปพบ Element ที่มี class reveal
function observeRevealElements() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.12 });
  $$('.reveal:not(.show)').forEach(element => observer.observe(element));
}

// อ่าน Theme ที่เคยบันทึกไว้
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

// ปุ่มสลับ Dark / Light mode
$('#themeBtn')?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
});

// ปุ่มเปิดเมนูบน Mobile
$('#menuBtn')?.addEventListener('click', () => $('#navLinks')?.classList.toggle('open'));
$$('#navLinks a').forEach(link => link.addEventListener('click', () => $('#navLinks')?.classList.remove('open')));

// แสดงปีปัจจุบันใน Footer แล้วเริ่มทำงาน
setText('#year', new Date().getFullYear());
initPortfolio();

// ================================================================
// PROJECT IMAGE MODAL
// ================================================================

const projectModal = $('#projectModal');
const projectModalImage = $('#projectModalImage');
const projectModalClose = $('#projectModalClose');
const projectModalPrev = $('#projectModalPrev');
const projectModalNext = $('#projectModalNext');
const projectModalDots = $('#projectModalDots');

let currentProjectImages = [];
let currentProjectIndex = 0;


// ------------------------------------------------
// เปิด Modal
// ------------------------------------------------

function openProjectModal(images, index) {

  if (!images || images.length === 0) return;

  currentProjectImages = images;
  currentProjectIndex = index;

  updateProjectModal();

  projectModal.classList.add('show');

  document.body.style.overflow = 'hidden';
}


// ------------------------------------------------
// ปิด Modal
// ------------------------------------------------

function closeProjectModal() {

  projectModal.classList.remove('show');

  document.body.style.overflow = '';

  setTimeout(() => {
    projectModalImage.src = '';
  }, 250);
}


// ------------------------------------------------
// แสดงรูปปัจจุบัน
// ------------------------------------------------

function updateProjectModal() {

  if (!currentProjectImages.length) return;

  const image = currentProjectImages[currentProjectIndex];

  projectModalImage.src = image;

  // สร้างจุดด้านล่างรูป
  projectModalDots.innerHTML =
    currentProjectImages.map((_, index) => `
      <span
        class="project-modal-dot ${index === currentProjectIndex ? 'active' : ''}"
      ></span>
    `).join('');


  // ถ้ามีรูปเดียว ซ่อนปุ่มลูกศร
  if (currentProjectImages.length <= 1) {

    projectModalPrev.style.display = 'none';
    projectModalNext.style.display = 'none';

  } else {

    projectModalPrev.style.display = 'flex';
    projectModalNext.style.display = 'flex';
  }
}


// ------------------------------------------------
// รูปก่อนหน้า
// ------------------------------------------------

function previousProjectImage() {

  if (currentProjectImages.length <= 1) return;

  currentProjectIndex--;

  if (currentProjectIndex < 0) {
    currentProjectIndex =
      currentProjectImages.length - 1;
  }

  updateProjectModal();
}


// ------------------------------------------------
// รูปถัดไป
// ------------------------------------------------

function nextProjectImage() {

  if (currentProjectImages.length <= 1) return;

  currentProjectIndex++;

  if (currentProjectIndex >= currentProjectImages.length) {
    currentProjectIndex = 0;
  }

  updateProjectModal();
}


// ------------------------------------------------
// คลิกรูปผลงาน
// ------------------------------------------------

document.addEventListener('click', function(event) {

  const link = event.target.closest('.project-image-link');

  if (!link) return;

  event.preventDefault();


  // หา Project Card ที่รูปนี้อยู่
  const project = link.closest('.project');

  if (!project) return;


  // ดึงเฉพาะรูปของ Project นี้
  const images = [...project.querySelectorAll('.project-image-link img')]
    .map(img => img.src);


  const index =
    Number(link.dataset.index) || 0;


  openProjectModal(images, index);

});


// ------------------------------------------------
// ปุ่มปิด
// ------------------------------------------------

projectModalClose?.addEventListener(
  'click',
  closeProjectModal
);


// ------------------------------------------------
// คลิกพื้นหลัง
// ------------------------------------------------

projectModal?.addEventListener('click', function(event) {

  if (event.target === projectModal) {
    closeProjectModal();
  }

});


// ------------------------------------------------
// ปุ่ม Previous
// ------------------------------------------------

projectModalPrev?.addEventListener(
  'click',
  previousProjectImage
);


// ------------------------------------------------
// ปุ่ม Next
// ------------------------------------------------

projectModalNext?.addEventListener(
  'click',
  nextProjectImage
);


// ------------------------------------------------
// Keyboard
// ------------------------------------------------

document.addEventListener('keydown', function(event) {

  if (!projectModal?.classList.contains('show')) {
    return;
  }


  // ESC = ปิด
  if (event.key === 'Escape') {
    closeProjectModal();
  }


  // ←
  if (event.key === 'ArrowLeft') {
    previousProjectImage();
  }


  // →
  if (event.key === 'ArrowRight') {
    nextProjectImage();
  }

});