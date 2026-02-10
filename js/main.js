/**
 * Kishan Pandey — Security Operations Console
 * GSAP Controlled Motion System
 */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* ================= THEME TOGGLE ================= */
  function initThemeToggle() {
    const toggle = document.getElementById('view-toggle');
    const label = toggle?.querySelector('.toggle-label');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-theme');
    label.textContent = savedTheme === 'dark'
      ? '[ LIGHT MODE ]'
      : '[ DARK MODE ]';

    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');

      document.body.classList.toggle('dark-theme', !isDark);
      document.body.classList.toggle('light-theme', isDark);

      const next = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      label.textContent = next === 'dark'
        ? '[ LIGHT MODE ]'
        : '[ DARK MODE ]';
    });
  }

  /* ================= PARTICLES ================= */
  function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        position:absolute;
        width:2px;
        height:2px;
        background:rgba(0,255,136,.35);
        border-radius:50%;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
      `;
      container.appendChild(p);

      gsap.to(p, {
        x: 'random(-20,20)',
        y: 'random(-20,20)',
        opacity: 'random(0.2,0.6)',
        duration: 'random(3,6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  /* ================= TERMINAL TYPING ================= */
  function initLiveTerminal() {
    const terminal = document.getElementById('terminal-intro');
    const avatar = document.getElementById('hero-profile-avatar');
    if (!terminal) return;

    const lines = terminal.querySelectorAll('.terminal-line[data-cmd]');
    let index = 0;

    function typeLine() {
      if (index >= lines.length) {
        avatar?.classList.add('visible');
        initHeroGSAP().play();
        return;
      }

      const line = lines[index];
      const text = line.dataset.cmd;
      line.innerHTML = '<span class="prompt">></span> ';
      let i = 0;

      const typer = setInterval(() => {
        if (i < text.length) {
          line.innerHTML += text.charAt(i++);
        } else {
          clearInterval(typer);
          index++;
          setTimeout(typeLine, 400);
        }
      }, 40);
    }

    setTimeout(typeLine, 600);
  }

  /* ================= HERO GSAP ================= */
  function initHeroGSAP() {
    const tl = gsap.timeline({ paused: true });

    tl.fromTo('.hero-owner-title',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo('.hero-headline',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo('.hero-subtext',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo('.cta-btn',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.4'
    );

    return tl;
  }

  /* ================= SCROLL SECTIONS ================= */
  function initScrollSections() {
    gsap.utils.toArray('.section').forEach(section => {
      gsap.fromTo(section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true
          }
        }
      );
    });
  }

  /* ================= SKILLS ================= */
  function initSkillBars() {
    gsap.utils.toArray('.skill-item').forEach(item => {
      const fill = item.querySelector('.skill-fill');
      const value = item.dataset.skill;

      gsap.fromTo(fill,
        { width: '0%' },
        {
          width: value + '%',
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            once: true
          }
        }
      );
    });
  }

  /* ================= TIMELINE ================= */
  function initTimeline() {
    gsap.from('.timeline-item', {
      opacity: 0,
      x: -40,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 80%',
        once: true
      }
    });
  }

  /* ================= SMOOTH ANCHORS ================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href'))
          ?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ================= MOBILE NAV ================= */
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav-links');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
    });
  }

  /* ================= INIT ================= */
  function init() {
    initThemeToggle();
    initParticles();
    initLiveTerminal();
    initScrollSections();
    initSkillBars();
    initTimeline();
    initSmoothScroll();
    initMobileNav();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();


this gsap doesnt contain something that my previous main.js contains i will show you mf
/**
 * Kishan Pandey — Security Operations Console
 * Interactive cybersecurity portfolio
 */

(function() {
  'use strict';

  /* ========== THEME TOGGLE (Dark / Light ONLY) ========== */
  function initThemeToggle() {
    const toggle = document.getElementById('view-toggle');
    const label = toggle?.querySelector('.toggle-label');
    if (!toggle) return;

    // Default = Dark (terminal vibe)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-theme');
    label.textContent = savedTheme === 'dark'
      ? '[ LIGHT MODE ]'
      : '[ DARK MODE ]';

    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');

      document.body.classList.toggle('dark-theme', !isDark);
      document.body.classList.toggle('light-theme', isDark);

      const nextTheme = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      label.textContent = nextTheme === 'dark'
        ? '[ LIGHT MODE ]'
        : '[ DARK MODE ]';
    });
  }

  // ========== Particle Grid Background ==========
  function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(0, 255, 136, 0.35);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleFloat 4s ease-in-out infinite;
        animation-delay: ${Math.random() * 3}s;
      `;
      container.appendChild(particle);
    }
  }

  // ========== Terminal Typing Animation ==========
  function initTerminalTyping() {
    const headline = document.getElementById('hero-headline');
    if (!headline) return;

    const fullText = headline.textContent;
    headline.textContent = '';
    headline.style.borderRight = '2px solid #00ff88';

    let i = 0;
    const typingSpeed = 35;
    const startDelay = 2500;

    function typeChar() {
      if (i < fullText.length) {
        headline.textContent += fullText.charAt(i++);
        setTimeout(typeChar, typingSpeed);
      } else {
        headline.style.borderRight = 'none';
      }
    }

    setTimeout(typeChar, startDelay);
  }

  // ========== Scroll Reveal Animations ==========
  function initScrollReveal() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    sections.forEach(section => observer.observe(section));
  }

  // ========== Skill Bar Animations ==========
  function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.setProperty('--skill-width', `${e.target.dataset.skill}%`);
          e.target.classList.add('animated');
        }
      }),
      { threshold: 0.3 }
    );
    skillItems.forEach(item => observer.observe(item));
  }

  // ========== Timeline Animation ==========
  function initTimelineAnimation() {
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;

      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }
      }).observe(item);
    });
  }

  // ========== Live Terminal Simulation ==========
  function initLiveTerminal() {
    const terminalIntro = document.getElementById('terminal-intro');
    const profileAvatar = document.getElementById('hero-profile-avatar');
    if (!terminalIntro) return;

    const lines = terminalIntro.querySelectorAll('.terminal-line[data-cmd]');
    let lineIndex = 0;

    const typeNextLine = () => {
      if (lineIndex >= lines.length) {
        profileAvatar?.classList.add('visible');
        return;
      }

      const line = lines[lineIndex];
      const text = line.dataset.cmd || '';
      line.innerHTML = '<span class="prompt">></span> ';
      let charIndex = 0;

      const typeChar = () => {
        if (charIndex < text.length) {
          line.innerHTML += text.charAt(charIndex++);
          setTimeout(typeChar, 45);
        } else {
          lineIndex++;
          setTimeout(typeNextLine, 400);
        }
      };
      typeChar();
    };

    setTimeout(typeNextLine, 600);
  }

  // ========== Smooth Scroll ==========
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(anchor.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ========== Contact Form ==========
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('contact-feedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button');
      btn.disabled = true;
      feedback.innerHTML = '';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.value.trim(),
            message: form.message.value.trim(),
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language,
            cores: navigator.hardwareConcurrency || null,
            memory: navigator.deviceMemory || null
          })
        });

        feedback.className = res.ok
          ? 'contact-feedback success'
          : 'contact-feedback error';
        feedback.innerHTML = res.ok
          ? '<div>> Transmission successful</div>'
          : '<div>> Transmission failed</div>';
        if (res.ok) form.reset();
      } catch {
        feedback.className = 'contact-feedback error';
        feedback.innerHTML = '<div>> Transmission failed</div>';
      } finally {
        btn.disabled = false;
      }
    });
  }

  // ========== Mobile Nav ==========
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav-links');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
    });
  }

  // ========== INIT ==========
  function init() {
    initThemeToggle();
    initParticles();
    initTerminalTyping();
    initScrollReveal();
    initSkillBars();
    initTimelineAnimation();
    initLiveTerminal();
    initSmoothScroll();
    initContactForm();
    initMobileNav();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
