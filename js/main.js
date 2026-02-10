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
