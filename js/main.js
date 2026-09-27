(function () {
  var burger = document.querySelector('.site-nav .navbar-burger');
  var menu = document.getElementById('site-nav-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', function () {
    var open = burger.classList.toggle('is-active');
    menu.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('is-active');
      menu.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav .navbar-end a'));
  var sections = links.map(function (link) {
    return document.getElementById(link.getAttribute('href').slice(1));
  }).filter(Boolean);

  if (!sections.length || !('IntersectionObserver' in window)) return;

  var active = null;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) active = entry.target.id;
    });
    links.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + active);
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(function (section) { observer.observe(section); });
})();

document.getElementById('copy-bibtex').addEventListener('click', function () {
  const code = document.getElementById('bibtex-code').textContent;
  navigator.clipboard.writeText(code).then(function () {
    const btn = document.getElementById('copy-bibtex');
    const label = btn.querySelector('span:last-child');
    const original = label.textContent;
    label.textContent = 'Copied!';
    setTimeout(function () {
      label.textContent = original;
    }, 2000);
  });
});
