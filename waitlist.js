/* ResumeLayer static site: Google Apps Script waitlist integration. */
(function () {
  'use strict';
  const config = document.createElement('script');
  config.src = './waitlist-config.js';
  config.onload = init;
  config.onerror = init;
  document.head.appendChild(config);

  function init() {
    const endpoint = String(window.RESUMELAYER_SHEETS_URL || '').trim();
    const configured = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(endpoint);
    const forms = Array.from(document.querySelectorAll('form[data-waitlist-form]'));
    const frame = document.createElement('iframe');
    frame.name = 'resumelayer-waitlist-frame';
    frame.title = 'Waitlist response';
    frame.hidden = true;
    frame.style.display = 'none';
    document.body.appendChild(frame);
    let pending = null;
    const trustedOrigin = origin => /^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|google\.com)$/.test(origin);
    window.addEventListener('message', function (event) {
      if (!trustedOrigin(event.origin) || !pending) return;
      const msg = event.data;
      if (!msg || msg.type !== 'resumelayer-waitlist' || msg.token !== pending.token) return;
      clearTimeout(pending.timeout);
      const { form, status, button } = pending;
      const ok = msg.status === 'success' || msg.status === 'duplicate';
      status.textContent = ok ? (msg.status === 'duplicate' ? 'You are already on the list! Thanks for your interest.' : 'You’re on the list! We’ll email you about early access.') : 'Could not save your email. Please try again.';
      status.className = 'rl-message ' + (ok ? 'ok' : 'error');
      button.disabled = false;
      button.textContent = 'Get early access';
      if (ok) form.reset();
      pending = null;
    });
    for (const form of forms) {
      const input = form.querySelector('input[type="email"]');
      const status = form.querySelector('[role="status"]');
      const button = form.querySelector('[type="submit"]');
      form.action = configured ? endpoint : '#';
      form.target = frame.name;
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        status.textContent = '';
        if (!input.checkValidity()) {
          input.reportValidity();
          return;
        }
        if (!configured) {
          status.textContent = 'Email signup is being configured. Please check back soon.';
          status.className = 'rl-message error';
          return;
        }
        if (pending) {
          status.textContent = 'Please finish the previous request first.';
          return;
        }
        if (form.querySelector('[name="website"]').value) return;
        const token = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
        form.querySelector('[name="request_token"]').value = token;
        button.disabled = true;
        button.textContent = 'Joining…';
        status.textContent = 'Submitting your email…';
        pending = { token, form, status, button, timeout: setTimeout(() => {
          if (!pending || pending.token !== token) return;
          status.textContent = 'We could not confirm your signup. Check the Google Sheet before trying again.';
          status.className = 'rl-message error';
          button.disabled = false;
          button.textContent = 'Get early access';
          pending = null;
        }, 16000) };
        HTMLFormElement.prototype.submit.call(form);
      });
    }
    // Mobile navigation (Next.js runtime was removed for GitHub Pages compatibility).
    const menuButton = document.querySelector('button[aria-label="Open menu"]');
    if (menuButton) {
      const mobile = document.createElement('nav');
      mobile.id = 'rl-mobile-navigation';
      mobile.className = 'rl-mobile-menu';
      mobile.setAttribute('aria-label', 'Mobile navigation');
      for (const [name, id] of [['How it works','#how-it-works'], ['Features','#features'], ['Examples','#examples'], ['FAQ','#faq'], ['Get early access','#waitlist']]) {
        const a = document.createElement('a');
        a.href = id;
        a.textContent = name;
        a.addEventListener('click', () => {mobile.classList.remove('open'); menuButton.setAttribute('aria-expanded','false');});
        mobile.appendChild(a);
      }
      (menuButton.closest('header') || menuButton.parentElement.parentElement).after(mobile);
      menuButton.setAttribute('aria-controls', mobile.id);
      menuButton.addEventListener('click', () => {
        const open = mobile.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
    }
    // FAQ: toggle the existing answers directly without React.
    for (const button of document.querySelectorAll('button[aria-controls*="panel-"]')) {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      if (!panel) continue;
      panel.hidden = true;
      panel.style.display = 'none';
      button.addEventListener('click', () => {
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
        panel.style.display = isOpen ? 'none' : 'block';
      });
    }
  }
})();
