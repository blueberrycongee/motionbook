(() => {
  const sky = document.querySelector('.sky');
  // Reuse only the text-free top strip of the reference for its paper texture.
  // The lower illustration is separately clipped by CSS. All visible UI is HTML.
  for (let i = 0; i < 80; i++) {
    const slice = document.createElement('div');
    slice.className = 'sky-strip';
    const image = document.createElement('img');
    image.src = 'assets/reference-artwork.webp';
    image.alt = '';
    image.width = 1671;
    image.height = 941;
    slice.append(image);
    sky.append(slice);
  }
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
