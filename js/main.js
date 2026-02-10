/**
 * Kishan Pandey — Security Operations Console
 * GSAP Controlled Motion System (Merged & Fixed)
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

  /* ================= HERO HEADLINE TYPING ================= */
  function initTerminalTyping() {
    const headline = document.getElementById('hero-headline');
    if (!headline) return;

    const fullText = headline.textContent;
    headline.textContent = '';
    headline.style.borderRight = '2px solid #00ff88';

    let i = 0;
    const typingSpeed = 35;

    function typeChar() {
      if (i < fullText.length) {
        headline.textContent += fullText.charAt(i++);
        setTimeout(typeChar, typingSpeed);
      } else {
        headline.style.borderRight = 'none';
      }
    }

    typeChar();
  }

  /* ================= LIVE TERMINAL ================= */
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
        initTerminalTyping();
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
    .fromTo('.hero-subtext',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.3'
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
      gsap.from(section, {
        opacity: 0,
        y: 60,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  /* ================= SKILL BARS ================= */
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

  /* ================= CONTACT FORM ================= */
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
    initContactForm();
    initMobileNav();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
