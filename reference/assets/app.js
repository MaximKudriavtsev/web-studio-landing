(() => {
  const config = window.SITE_CONFIG || {};

  document.querySelectorAll('[data-brand]').forEach((el) => {
    if (config.brand) el.textContent = config.brand;
  });
  document.querySelectorAll('[data-email]').forEach((el) => {
    if (!config.email) return;
    el.textContent = config.email;
    el.setAttribute('href', `mailto:${config.email}`);
  });
  document.querySelectorAll('[data-telegram]').forEach((el) => {
    if (config.telegram) el.setAttribute('href', config.telegram);
  });
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu?.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const form = document.querySelector('[data-contact-form]');
  const formStatus = document.querySelector('[data-form-status]');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const contact = String(data.get('contact') || '').trim();
    const message = String(data.get('message') || '').trim();
    const consent = data.get('consent');

    if (!name || !contact || !message || !consent) {
      form.classList.add('has-error');
      if (formStatus) formStatus.textContent = 'Заполните поля и подтвердите согласие.';
      return;
    }

    form.classList.remove('has-error');
    const subject = encodeURIComponent(`Новая заявка с сайта — ${name}`);
    const body = encodeURIComponent(`Имя: ${name}\nКонтакт: ${contact}\n\nЗадача:\n${message}`);
    const email = config.email || 'hello@example.ru';
    if (formStatus) formStatus.textContent = 'Готово — открываем письмо.';
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });

  const cookieBanner = document.querySelector('[data-cookie-banner]');
  const cookieAccept = document.querySelector('[data-cookie-accept]');
  const cookieKey = 'kotdela-cookie-consent-v1';
  try {
    if (!localStorage.getItem(cookieKey)) cookieBanner?.classList.add('is-visible');
  } catch (_) {
    cookieBanner?.classList.add('is-visible');
  }
  cookieAccept?.addEventListener('click', () => {
    try { localStorage.setItem(cookieKey, 'accepted'); } catch (_) {}
    cookieBanner?.classList.remove('is-visible');
  });
})();
