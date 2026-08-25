/* ================================================================
   CV PORTFOLIO: MAIN JAVASCRIPT

   ข้อมูล:
   - data.json              = ข้อมูลส่วนตัว
   - experience-data.json   = ประสบการณ์
   - education-data.json    = การศึกษา
   - gallery-data.json      = ผลงาน + รูปภาพ

   Project Image Modal:
   - คลิกรูปผลงานเพื่อขยาย
   - รองรับหลายรูป
   - รองรับ Caption เฉพาะบางรูป
   - กด Previous / Next เพื่อเปลี่ยนรูป
   ================================================================ */


/* ================================================================
   1) FALLBACK PROFILE
   ใช้กรณีโหลด data.json ไม่ได้
   ================================================================ */

const fallbackProfile = {
  name: 'ไตรสิทธิ์ วารีรัตน์ภากร',
  nameEn: 'Traisit Wareeratpakron',
  role: 'System Engineer | CRM (APO) Operation Support',
  summary: 'System Engineer ที่เชี่ยวชาญ Linux, Database, Monitoring และ Automation',
  email: 'your.email@example.com',
  phone: '+66 XX XXX XXXX',
  skills: [
    'Linux Administration',
    'Bash / Perl',
    'MariaDB / MySQL',
    'Oracle',
    'Nagios / NRPE'
  ]
};


/* ================================================================
   2) HELPER FUNCTIONS
   ================================================================ */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


/* ================================================================
   3) LOAD JSON
   ================================================================ */

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


/* ================================================================
   4) SET TEXT SAFELY
   ================================================================ */

function setText(selector, value = '') {

  const element = $(selector);

  if (element) {
    element.textContent = value;
  }
}


/* ================================================================
   5) PROJECT DATA
   เก็บข้อมูล Project ทั้งหมดไว้ใช้กับ Modal
   ================================================================ */

let portfolioProjects = [];


/* ================================================================
   6) PROJECT MODAL VARIABLES
   ================================================================ */

const projectModal =
  $('#projectModal');

const projectModalImage =
  $('#projectModalImage');

const projectModalCaption =
  $('#projectModalCaption');

const projectModalClose =
  $('#projectModalClose');

const projectModalPrev =
  $('#projectModalPrev');

const projectModalNext =
  $('#projectModalNext');

const projectModalDots =
  $('#projectModalDots');


/* ================================================================
   7) PROJECT MODAL STATE
   ================================================================ */

let currentProjectImages = [];

let currentProjectIndex = 0;


/* ================================================================
   8) NORMALIZE IMAGE DATA

   รองรับทั้ง 2 รูปแบบ

   รูปแบบเก่า:
   "assets/images/portfolio/smm.png"

   รูปแบบใหม่:
   {
     "src": "assets/images/portfolio/smm.png",
     "caption": "คำอธิบาย"
   }

   ทำให้ Project เก่าของคุณยังสามารถทำงานได้
   ================================================================ */

function normalizeProjectImage(image) {

  // ถ้าเป็น String = รูปแบบเก่า
  if (typeof image === 'string') {

    return {
      src: image,
      caption: ''
    };
  }


  // ถ้าเป็น Object = รูปแบบใหม่
  if (image && typeof image === 'object') {

    return {
      src: image.src || '',
      caption: image.caption || ''
    };
  }


  // กรณีข้อมูลไม่ถูกต้อง
  return {
    src: '',
    caption: ''
  };
}


/* ================================================================
   9) OPEN PROJECT MODAL
   ================================================================ */

function openProjectModal(images, startIndex = 0) {

  if (!projectModal) return;

  if (!images || !images.length) return;


  // แปลงข้อมูลรูปให้เป็นรูปแบบเดียวกัน
  currentProjectImages =
    images.map(normalizeProjectImage);


  // กำหนดรูปเริ่มต้น
  currentProjectIndex =
    Math.max(
      0,
      Math.min(
        startIndex,
        currentProjectImages.length - 1
      )
    );


  // อัปเดตข้อมูล Modal
  updateProjectModal();


  // แสดง Modal
  projectModal.classList.add('show');

  document.body.style.overflow = 'hidden';
}


/* ================================================================
   10) CLOSE PROJECT MODAL
   ================================================================ */

function closeProjectModal() {

  if (!projectModal) return;

  projectModal.classList.remove('show');

  document.body.style.overflow = '';
}


/* ================================================================
   11) UPDATE PROJECT MODAL

   หน้าที่:
   - เปลี่ยนรูป
   - เปลี่ยน Caption
   - เปลี่ยนจุด Active
   - แสดง/ซ่อนปุ่ม Previous / Next
   ================================================================ */

function updateProjectModal() {

  if (!currentProjectImages.length) return;


  const image =
    currentProjectImages[currentProjectIndex];


  /* ------------------------------------------------
     รูป
     ------------------------------------------------ */

  if (projectModalImage) {

    projectModalImage.src =
      image.src;

    projectModalImage.alt =
      image.caption || 'Project image';
  }


  /* ------------------------------------------------
     Caption

     ถ้ามี Caption:
       แสดง

     ถ้าไม่มี Caption:
       ซ่อน
     ------------------------------------------------ */

  if (projectModalCaption) {

    if (image.caption) {

      projectModalCaption.textContent =
        image.caption;

      projectModalCaption.style.display =
        'block';

    } else {

      projectModalCaption.textContent =
        '';

      projectModalCaption.style.display =
        'none';
    }
  }


  /* ------------------------------------------------
     Dots
     ------------------------------------------------ */

  if (projectModalDots) {

    projectModalDots.innerHTML =
      currentProjectImages.map((_, index) => `
        <span
          class="project-modal-dot ${
            index === currentProjectIndex
              ? 'active'
              : ''
          }"
        ></span>
      `).join('');
  }


  /* ------------------------------------------------
     Previous / Next

     ถ้ามีรูปเดียว:
       ซ่อนปุ่ม

     ถ้ามีหลายรูป:
       แสดงปุ่ม
     ------------------------------------------------ */

  if (
    projectModalPrev &&
    projectModalNext
  ) {

    if (currentProjectImages.length <= 1) {

      projectModalPrev.style.display =
        'none';

      projectModalNext.style.display =
        'none';

    } else {

      projectModalPrev.style.display =
        'flex';

      projectModalNext.style.display =
        'flex';
    }
  }
}


/* ================================================================
   12) NEXT IMAGE
   ================================================================ */

function showNextProjectImage() {

  if (currentProjectImages.length <= 1) {
    return;
  }


  currentProjectIndex =
    (currentProjectIndex + 1) %
    currentProjectImages.length;


  updateProjectModal();
}


/* ================================================================
   13) PREVIOUS IMAGE
   ================================================================ */

function showPreviousProjectImage() {

  if (currentProjectImages.length <= 1) {
    return;
  }


  currentProjectIndex =
    (
      currentProjectIndex -
      1 +
      currentProjectImages.length
    ) %
    currentProjectImages.length;


  updateProjectModal();
}


/* ================================================================
   14) MODAL BUTTON EVENTS
   ================================================================ */

projectModalClose?.addEventListener(
  'click',
  closeProjectModal
);


projectModalNext?.addEventListener(
  'click',
  showNextProjectImage
);


projectModalPrev?.addEventListener(
  'click',
  showPreviousProjectImage
);


/* ================================================================
   15) CLICK OUTSIDE MODAL TO CLOSE
   ================================================================ */

projectModal?.addEventListener(
  'click',
  function (event) {

    // ถ้าคลิกพื้นที่ Overlay
    if (
      event.target.classList.contains(
        'project-modal-overlay'
      )
    ) {

      closeProjectModal();
    }
  }
);


/* ================================================================
   16) KEYBOARD CONTROL

   ESC   = ปิด
   ←     = รูปก่อนหน้า
   →     = รูปถัดไป
   ================================================================ */

document.addEventListener(
  'keydown',
  function (event) {

    if (
      !projectModal ||
      !projectModal.classList.contains('show')
    ) {
      return;
    }


    if (event.key === 'Escape') {

      closeProjectModal();

      return;
    }


    if (event.key === 'ArrowRight') {

      showNextProjectImage();

      return;
    }


    if (event.key === 'ArrowLeft') {

      showPreviousProjectImage();

      return;
    }
  }
);


/* ================================================================
   17) RENDER PROJECTS

   สร้าง Project Card จาก gallery-data.json
   ================================================================ */

function renderProjects(items) {

  const projectGrid =
    $('#projectGrid');

  if (!projectGrid) return;


  projectGrid.innerHTML =
    items.map(project => `

      <article
        class="project card reveal"
        data-project-id="${project.id}"
      >

        <!-- =================================================
             Project Cover
             ================================================= -->

        <img
          class="project-cover"
          src="${project.image}"
          alt="${project.title}"
          loading="lazy"
        >


        <div class="project-body">

          <!-- Project Title -->

          <h3>
            ${project.title}
          </h3>


          <!-- Project Description -->

          <p>
            ${project.desc}
          </p>


          <!-- Technology Tags -->

          <div class="skills">

            ${(project.tech || [])
              .map(tech => `
                <span class="tag">
                  ${tech}
                </span>
              `)
              .join('')
            }

          </div>


          <!-- =================================================
               Project Images

               รองรับ:

               รูปแบบเก่า:
               "image.png"

               รูปแบบใหม่:
               {
                 src: "image.png",
                 caption: "คำอธิบาย"
               }
               ================================================= -->

          <div class="work-images">

            ${(project.images || [])
              .map((image, index) => {

                const normalized =
                  normalizeProjectImage(image);

                if (!normalized.src) {
                  return '';
                }


                return `
                  <a
                    href="#"
                    class="project-image-link"
                    data-project-id="${project.id}"
                    data-index="${index}"
                    title="คลิกเพื่อขยายรูป"
                  >

                    <img
                      src="${normalized.src}"
                      alt="${project.title} ภาพที่ ${index + 1}"
                      loading="lazy"
                    >

                  </a>
                `;

              })
              .join('')
            }

          </div>

        </div>

      </article>

    `).join('');


  // เริ่ม Observe Animation
  observeRevealElements();
}


/* ================================================================
   18) CLICK PROJECT IMAGE

   เมื่อคลิกรูป:

   1. หา Project จาก project-id
   2. หา index ของรูป
   3. ส่ง images ทั้งหมดไป Modal
   ================================================================ */

document.addEventListener(
  'click',
  function (event) {

    const link =
      event.target.closest(
        '.project-image-link'
      );


    // ไม่ใช่รูป Project
    if (!link) {
      return;
    }


    // ป้องกันเปิด URL ใหม่
    event.preventDefault();


    // หา Project ID
    const projectId =
      Number(link.dataset.projectId);


    // หา Project จากข้อมูล JSON
    const project =
      portfolioProjects.find(
        item =>
          Number(item.id) === projectId
      );


    if (!project) {
      return;
    }


    // หาว่ากดรูปที่เท่าไร
    const index =
      Number(link.dataset.index) || 0;


    // เปิด Modal
    openProjectModal(
      project.images || [],
      index
    );

  }
);


/* ================================================================
   19) REVEAL ANIMATION
   ================================================================ */

function observeRevealElements() {

  const elements =
    $$('.reveal:not(.show)');


  if (!elements.length) {
    return;
  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              'show'
            );

            observer.unobserve(
              entry.target
            );
          }

        });

      },
      {
        threshold: 0.12
      }
    );


  elements.forEach(element => {

    observer.observe(element);

  });
}


/* ================================================================
   20) INIT PORTFOLIO
   ================================================================ */

async function initPortfolio() {


  /* ============================================================
     PROFILE
     ============================================================ */

  const profile =
    await getJSON(
      'data.json',
      fallbackProfile
    );


  setText(
    '#name',
    profile.name
  );


  setText(
    '#nameEn',
    profile.nameEn
  );


  setText(
    '#role',
    profile.role
  );


  setText(
    '#summary',
    profile.summary
  );


  setText(
    '#email',
    profile.email
  );


  setText(
    '#phone',
    profile.phone
  );


  /* ============================================================
     EMAIL LINK
     ============================================================ */

  const emailLink =
    $('#emailLink');


  if (emailLink) {

    emailLink.href =
      `mailto:${profile.email}`;
  }


  /* ============================================================
     SKILLS
     ============================================================ */

  const skills =
    $('#skills');


  if (skills) {

    skills.innerHTML =
      (profile.skills || [])
        .map(item => `
          <span class="tag">
            ${item}
          </span>
        `)
        .join('');
  }


  /* ============================================================
     EXPERIENCE
     ============================================================ */

  const experienceData =
    await getJSON(
      'experience-data.json'
    );


  const timeline =
    $('#timeline');


  if (timeline) {

    timeline.innerHTML =
      experienceData.map(item => `

        <article
          class="timeline-item card reveal"
        >

          <div class="period">
            ${item.period}
          </div>


          <div>

            <h3>
              ${item.role}
            </h3>


            <h4>
              ${item.company}
            </h4>


           <p class="experience-summary">
        ${item.summary || ''}
      </p>

          </div>

        </article>

      `).join('');
  }


  /* ============================================================
     PROJECTS
     ============================================================ */

  const projectData =
    await getJSON(
      'gallery-data.json'
    );


  // เก็บข้อมูล Project ไว้ให้ Modal ใช้
  portfolioProjects =
    projectData;


  // แสดง Project ครั้งแรก
  renderProjects(
    projectData
  );


  /* ============================================================
     PROJECT FILTER
     ============================================================ */

  $$('.filter').forEach(
    button => {

      button.addEventListener(
        'click',
        () => {


          // เอา Active ออกจากปุ่มทั้งหมด

          $$('.filter').forEach(
            item =>
              item.classList.remove(
                'active'
              )
          );


          // เพิ่ม Active ให้ปุ่มที่กด

          button.classList.add(
            'active'
          );


          // อ่าน Category

          const selected =
            button.dataset.filter;


          // Filter Project

          const filteredProjects =
            selected === 'all'
              ? projectData
              : projectData.filter(
                  project =>
                    project.category ===
                    selected
                );


          // แสดงผลใหม่

          renderProjects(
            filteredProjects
          );

        }
      );

    }
  );


  /* ============================================================
     REVEAL
     ============================================================ */

  observeRevealElements();
}


/* ================================================================
   21) THEME
   ================================================================ */

const savedTheme =
  localStorage.getItem(
    'theme'
  );


if (savedTheme) {

  document.documentElement.dataset.theme =
    savedTheme;
}


/* ================================================================
   22) THEME BUTTON
   ================================================================ */

$('#themeBtn')?.addEventListener(
  'click',
  () => {

    const nextTheme =
      document.documentElement.dataset.theme ===
      'light'
        ? 'dark'
        : 'light';


    document.documentElement.dataset.theme =
      nextTheme;


    localStorage.setItem(
      'theme',
      nextTheme
    );

  }
);


/* ================================================================
   23) MOBILE MENU
   ================================================================ */

$('#menuBtn')?.addEventListener(
  'click',
  () => {

    $('#navLinks')?.classList.toggle(
      'open'
    );

  }
);


/* ================================================================
   24) CLOSE MOBILE MENU AFTER CLICK
   ================================================================ */

$$('#navLinks a').forEach(
  link => {

    link.addEventListener(
      'click',
      () => {

        $('#navLinks')?.classList.remove(
          'open'
        );

      }
    );

  }
);


/* ================================================================
   25) FOOTER YEAR
   ================================================================ */

setText(
  '#year',
  new Date().getFullYear()
);


/* ================================================================
   26) START PORTFOLIO
   ================================================================ */

initPortfolio();