
(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }

  // Generic filter / search logic for any page section.
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const input = group.querySelector('[data-filter-input]');
    const buttons = group.querySelectorAll('[data-filter-btn]');
    const cards = Array.from(group.querySelectorAll('[data-filter-card]'));
    const counter = group.querySelector('[data-filter-counter]');

    let activeType = 'all';

    function applyFilter() {
      const query = (input?.value || '').trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const searchable = (card.dataset.search || card.textContent || '').toLowerCase();
        const type = (card.dataset.type || '').toLowerCase();
        const matchQuery = !query || searchable.includes(query);
        const matchType = activeType === 'all' || type === activeType;
        const show = matchQuery && matchType;
        card.classList.toggle('hide', !show);
        if (show) visible += 1;
      });

      if (counter) {
        counter.textContent = visible;
      }
    }

    input?.addEventListener('input', applyFilter);

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeType = (btn.dataset.filterBtn || 'all').toLowerCase();
        applyFilter();
      });
    });

    applyFilter();
  });

  // Bridge standalone hero search inputs to the first filter group on the page.
  const defaultFilterGroup = document.querySelector('[data-filter-group]');
  document.querySelectorAll('[data-filter-input]').forEach((input) => {
    if (input.closest('[data-filter-group]')) return;
    input.addEventListener('input', () => {
      const target = defaultFilterGroup?.querySelector('[data-filter-input]');
      if (target && target !== input) {
        target.value = input.value;
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  // Hero carousel
  document.querySelectorAll('[data-hero-carousel]').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-dot]'));
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function play() {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    prev?.addEventListener('click', () => {
      show(index - 1);
      play();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      play();
    });

    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      show(i);
      play();
    }));

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', play);
    show(0);
    play();
  });

  // Detail page player initialization.
  document.querySelectorAll('[data-player]').forEach((wrap) => {
    const video = wrap.querySelector('video');
    if (!video) return;

    const m3u8 = video.dataset.m3u8 || '';
    const fallback = video.dataset.fallback || '';
    const poster = video.dataset.poster || '';

    if (poster) video.poster = poster;

    function setFallback() {
      if (fallback) video.src = fallback;
    }

    if (m3u8) {
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        try {
          const hls = new window.Hls();
          hls.loadSource(m3u8);
          hls.attachMedia(video);
          wrap.dataset.playerState = 'hls';
          hls.on(window.Hls.Events.ERROR, () => setFallback());
        } catch (err) {
          setFallback();
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        wrap.dataset.playerState = 'native-hls';
      } else {
        setFallback();
      }
    } else {
      setFallback();
    }

    wrap.querySelectorAll('[data-play-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        video.play().catch(() => setFallback());
      });
    });
  });

  // Back to top button.
  const topBtn = document.querySelector('[data-top]');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('hide', window.scrollY < 360);
    });
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
