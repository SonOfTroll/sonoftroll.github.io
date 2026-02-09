/**
 * Kishan Pandey — Security Operations Console
 * Interactive cybersecurity portfolio
 */

(function() {
  'use strict';

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
      if (document.body.classList.contains('ui-mode')) return;
      if (i < fullText.length) {
        headline.textContent += fullText.charAt(i);
        i++;
        setTimeout(typeChar, typingSpeed);
      } else {
        headline.style.borderRight = 'none';
        setInterval(() => {
          if (document.body.classList.contains('ui-mode')) return;
          headline.style.borderRight = headline.style.borderRight ? 'none' : '2px solid #00ff88';
        }, 530);
      }
    }

    setTimeout(typeChar, startDelay);
  }

  // ========== View Toggle (Terminal / UI Mode) ==========
  function initViewToggle() {
    const toggle = document.getElementById('view-toggle');
    const label = toggle?.querySelector('.toggle-label');
    const profileAvatar = document.getElementById('hero-profile-avatar');
    const terminalLines = document.querySelectorAll('.terminal-line[data-cmd]');

    if (!toggle) return;

    // Default: Terminal Mode
    document.body.classList.add('terminal-mode');
    document.body.classList.remove('ui-mode');

    function revealAllForUIMode() {
      terminalLines.forEach((line, i) => {
        const text = line.dataset.cmd || '';
        line.innerHTML = '<span class="prompt">></span> ' + text;
        line.classList.add('typed');
      });
      if (profileAvatar) profileAvatar.classList.add('visible');
    }

    toggle.addEventListener('click', () => {
      const isTerminal = document.body.classList.contains('terminal-mode');
      if (isTerminal) {
        document.body.classList.remove('terminal-mode');
        document.body.classList.add('ui-mode');
        if (label) label.textContent = '[ TERMINAL MODE ]';
        revealAllForUIMode();
      } else {
        document.body.classList.remove('ui-mode');
        document.body.classList.add('terminal-mode');
        if (label) label.textContent = '[ UI MODE ]';
      }
    });
  }

  // ========== Scroll Reveal Animations ==========
  function initScrollReveal() {
    const sections = document.querySelectorAll('.section');
    const options = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, options);

    sections.forEach(section => observer.observe(section));
  }

  // ========== Skill Bar Animations ==========
  function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const skill = item.dataset.skill || 0;
          item.style.setProperty('--skill-width', `${skill}%`);
          item.classList.add('animated');
        }
      });
    }, options);

    skillItems.forEach(item => observer.observe(item));
  }

  // ========== Timeline Animation ==========
  function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const options = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }
      });
    }, options);

    timelineItems.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
      observer.observe(item);
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
        if (profileAvatar && document.body.classList.contains('terminal-mode')) {
          profileAvatar.classList.add('visible');
        }
        return;
      }

      const line = lines[lineIndex];
      const text = line.dataset.cmd || '';
      line.innerHTML = '<span class="prompt">></span> ';
      line.classList.add('typed');

      let charIndex = 0;
      const typeChar = () => {
        if (document.body.classList.contains('ui-mode')) {
          line.innerHTML = '<span class="prompt">></span> ' + text;
          line.classList.add('typed');
          lineIndex++;
          if (lineIndex >= lines.length && profileAvatar) {
            profileAvatar.classList.add('visible');
          }
          return;
        }
        if (charIndex < text.length) {
          line.innerHTML += text.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, 45);
        } else {
          lineIndex++;
          if (lineIndex >= lines.length && profileAvatar && document.body.classList.contains('terminal-mode')) {
            profileAvatar.classList.add('visible');
          }
          setTimeout(typeNextLine, 400);
        }
      };
      typeChar();
    };

    setTimeout(typeNextLine, 600);
  }

  // ========== Smooth Scroll for Nav Links ==========
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

// ========== Contact Form Handler ==========
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');
  if (!form || !feedback) return;

  const API_URL = "/api/contact";

  function showFeedback(success, lines) {
    feedback.className = 'contact-feedback ' + (success ? 'success' : 'error');
    feedback.innerHTML = lines.map(line => `<div class="feedback-line">${line}</div>`).join('');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.querySelector('input[name="email"]').value.trim();
    const message = form.querySelector('textarea[name="message"]').value.trim();

    submitBtn.disabled = true;
    feedback.className = 'contact-feedback';
    feedback.innerHTML = '';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({   email,   message,    // fingerprint entropy (safe + legal)   screen: `${screen.width}x${screen.height}`,   timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,   locale: navigator.language,   cores: navigator.hardwareConcurrency || null,   memory: navigator.deviceMemory || null })
body: JSON.stringify({
  email,
  message,
  screen: `${screen.width}x${screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale: navigator.language,
  cores: navigator.hardwareConcurrency || null,
  memory: navigator.deviceMemory || null
})

      });

      const text = await res.text();
      console.log('API response:', res.status, text);

      if (res.ok) {
        showFeedback(true, [
          '> Transmission successful',
          '> Message delivered to operator'
        ]);
        form.reset();
      } else {
        showFeedback(false, [
          '> Transmission failed',
          '> Retry connection'
        ]);
      }
    } catch (err) {
      console.error(err);
      showFeedback(false, [
        '> Transmission failed',
        '> Retry connection'
      ]);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

  // ========== Mobile Nav Toggle ==========
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav-links');

    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        nav.classList.toggle('active');
      });

      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          nav.classList.remove('active');
        });
      });
    }
  }

  // ========== Initialize All ==========
  function init() {
    initParticles();
    initTerminalTyping();
    initViewToggle();
    initScrollReveal();
    initSkillBars();
    initTimelineAnimation();
    initLiveTerminal();
    initSmoothScroll();
    initContactForm();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
