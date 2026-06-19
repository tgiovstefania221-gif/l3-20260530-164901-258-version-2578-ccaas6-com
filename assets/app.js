(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeSlide);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  const filterInput = document.querySelector('[data-search-input]');
  const filterSelect = document.querySelector('[data-search-select]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const genre = filterSelect ? filterSelect.value : '';

    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region')
      ].join(' ').toLowerCase();
      const matchesQuery = !query || haystack.indexOf(query) !== -1;
      const matchesGenre = !genre || (card.getAttribute('data-genre') || '').indexOf(genre) !== -1;
      card.style.display = matchesQuery && matchesGenre ? '' : 'none';
    });
  }

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('q');

    if (preset) {
      filterInput.value = preset;
    }

    filterInput.addEventListener('input', applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  applyFilter();
})();
