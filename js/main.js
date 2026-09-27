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
