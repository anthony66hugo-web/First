'use strict';

/* ============================================================
   NAV TOGGLE (mobile hamburger)
============================================================ */
const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.getElementById('primary-nav');

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    primaryNav.classList.toggle('is-open', !isOpen);
  });

  // Close nav when a link is clicked (mobile UX)
  primaryNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !primaryNav.contains(e.target)) {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
    }
  });
}

/* ============================================================
   FOOTER YEAR
============================================================ */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   ACTIVE NAV LINK (scroll spy, IntersectionObserver)
============================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.primary-nav__link[href^="#"]');

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle(
          'primary-nav__link--active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ============================================================
   CONTACT FORM — client-side validation feedback
============================================================ */
const contactForm = document.querySelector('.contact__form');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    // Honeypot check
    const honeypot = contactForm.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== '') {
      e.preventDefault();
      return; // silently drop spam
    }

    if (!contactForm.checkValidity()) {
      e.preventDefault();
      showFormErrors(contactForm);
    }
  });

  // Inline validation on blur
  contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearFieldError(field));
  });
}

function validateField(field) {
  if (field.name === 'website') return; // skip honeypot
  const errorId = `${field.id}-error`;
  let existing = document.getElementById(errorId);

  if (!field.validity.valid) {
    const msg = getValidationMessage(field);
    if (!existing) {
      existing = document.createElement('span');
      existing.id = errorId;
      existing.className = 'field-error';
      existing.setAttribute('role', 'alert');
      existing.style.cssText = 'color:var(--color-error);font-size:var(--text-sm);margin-top:.25rem;display:block';
      field.parentNode.appendChild(existing);
    }
    existing.textContent = msg;
    field.setAttribute('aria-describedby', errorId);
    field.setAttribute('aria-invalid', 'true');
  } else {
    clearFieldError(field);
  }
}

function clearFieldError(field) {
  const errorId = `${field.id}-error`;
  const existing = document.getElementById(errorId);
  if (existing) existing.remove();
  field.removeAttribute('aria-describedby');
  field.removeAttribute('aria-invalid');
}

function getValidationMessage(field) {
  if (field.validity.valueMissing)  return 'This field is required.';
  if (field.validity.typeMismatch)  return 'Please enter a valid value.';
  if (field.validity.tooShort)      return `Minimum ${field.minLength} characters required.`;
  if (field.validity.tooLong)       return `Maximum ${field.maxLength} characters allowed.`;
  return field.validationMessage;
}

function showFormErrors(form) {
  form.querySelectorAll('input, textarea').forEach(validateField);
  const firstInvalid = form.querySelector(':invalid');
  if (firstInvalid) firstInvalid.focus();
}

/* ============================================================
   LAZY IMAGE FADE-IN (IntersectionObserver)
============================================================ */
const lazyImages = document.querySelectorAll('img[loading="lazy"]');

if ('IntersectionObserver' in window && lazyImages.length) {
  const imageObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.style.opacity = '1';
      obs.unobserve(img);
    });
  }, { rootMargin: '200px' });

  lazyImages.forEach(img => {
    img.style.cssText = 'opacity:0; transition: opacity 400ms ease';
    imageObserver.observe(img);
  });
}
