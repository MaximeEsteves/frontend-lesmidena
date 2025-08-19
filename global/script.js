document.addEventListener('DOMContentLoaded', async () => {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  // Gère l'ajout du listener scroll pour le header, une seule fois
  function handleHeaderScroll() {
    const header = document.querySelector('header');
    if (!header._hasScrollListener) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
      });
      header._hasScrollListener = true; // flag pour éviter les doublons
    }
  }
  handleHeaderScroll();
});
