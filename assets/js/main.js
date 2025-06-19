// Dark mode toggle functionality
(() => {
  const toggle = document.getElementById('darkModeToggle');
  const root   = document.documentElement;

  // On load: apply saved theme (default to light)
  const savedTheme = localStorage.getItem('theme') || 'light';
  root.setAttribute('data-theme', savedTheme);
  toggle.checked = (savedTheme === 'dark');

  // When user flips the switch
  toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
})();