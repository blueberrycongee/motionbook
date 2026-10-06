(() => {
  // The blue paper is an original procedural SVG applied by CSS.
  const form = document.querySelector('#newsletter');
  const email = document.querySelector('#email');
  const status = document.querySelector('#form-status');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!email.validity.valid) {
      email.setAttribute('aria-invalid', 'true');
      status.textContent = 'Please enter a valid email address.';
      email.focus();
      return;
    }
    email.removeAttribute('aria-invalid');
    status.textContent = 'Thank you! Preview only; no email was sent.';
  });
  email.addEventListener('input', () => {
    email.removeAttribute('aria-invalid');
    status.textContent = '';
  });
  const notice = document.querySelector('.notice');
  let timer;
  document.querySelectorAll('[data-demo]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      notice.textContent = `${link.dataset.demo} · Preview link. No destination is connected.`;
      notice.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(() => { notice.hidden = true; }, 4000);
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { notice.hidden = true; clearTimeout(timer); }
  });
})();
