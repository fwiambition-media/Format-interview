// Helpers
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// Year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav
const navToggle = $('.nav-toggle');
const navMenu = $('#nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  $$('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// FAQ accordion
$$('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = $('.faq-a', item);
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    // close others (optionnel, mais propre)
    $$('.faq-q').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        const otherItem = other.closest('.faq-item');
        const otherAns = $('.faq-a', otherItem);
        otherAns.hidden = true;
        $('.faq-plus', other).textContent = '+';
      }
    });

    btn.setAttribute('aria-expanded', String(!expanded));
    answer.hidden = expanded;
    $('.faq-plus', btn).textContent = expanded ? '+' : '×';
  });
});

// Modal (success popup)
const modal = $('#success-modal');
const closeBtn = $('#close-modal');

function openModal() {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  closeBtn?.focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

if (modal) {
  // Close on backdrop click
  const backdrop = $('.modal-backdrop', modal);
  backdrop?.addEventListener('click', closeModal);

  // Close button
  closeBtn?.addEventListener('click', closeModal);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

// Form submit (NO redirect) -> FormSubmit AJAX
const form = $('#contact-form');
const submitBtn = $('#submit-btn');
const note = $('#form-note');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // ✅ bloque toute redirection

    // Basic HTML validity
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // UX: lock button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
    }
    if (note) note.textContent = '';

    try {
      const formData = new FormData(form);

      // Optional: add subject directly
      formData.append('_subject', 'Nouvelle candidature — FWI Ambition');
      formData.append('_captcha', 'false');

      const res = await fetch('https://formsubmit.co/ajax/fwiambition@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const data = await res.json();

      if (data?.success === 'true') {
        form.reset();
        openModal();
      } else {
        throw new Error('Envoi non confirmé');
      }
    } catch (err) {
      if (note) {
        note.textContent = "Une erreur est survenue. Merci de réessayer ou contactez-nous par email.";
      } else {
        alert("Une erreur est survenue. Merci de réessayer.");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer ma candidature';
      }
    }
  });
}
