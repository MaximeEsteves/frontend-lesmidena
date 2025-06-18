document.addEventListener('DOMContentLoaded', async () => {
      window.history.scrollRestoration = 'manual'; window.scrollTo(0, 0);

  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  const scrollPosition = window.scrollY;
  const parallaxImage = document.querySelector('.parallax-wrapper img');
  parallaxImage.style.transform = "translateY(" + (scrollPosition * 0.5) + "px)";

});
