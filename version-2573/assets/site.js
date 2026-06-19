
(function () {
  const scrollStrip = document.querySelector('[data-scroll-strip]');
  if (scrollStrip) {
    let offset = 0;
    setInterval(() => {
      offset += 1;
      if (offset > scrollStrip.scrollWidth) {
        offset = 0;
      }
      scrollStrip.scrollTo({ left: offset, behavior: 'smooth' });
    }, 3500);
  }

  document.querySelectorAll('[data-filter-input]').forEach((input) => {
    const section = input.closest('section') || document;
    const grid = section.querySelector('[data-filter-grid]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const hay = `${card.dataset.title || ''} ${card.dataset.search || ''}`.toLowerCase();
        const match = !q || hay.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) shown += 1;
      });
      let empty = section.querySelector('.card-empty');
      if (!empty && !shown) {
        empty = document.createElement('div');
        empty.className = 'card-empty';
        empty.textContent = '没有找到匹配的影片。';
        grid.after(empty);
      } else if (empty && shown) {
        empty.remove();
      }
    });
  });

  document.querySelectorAll('.js-player').forEach((shell) => {
    const video = shell.querySelector('.player-video');
    const playBtn = shell.querySelector('[data-player-play]');
    const loadBtn = shell.querySelector('[data-player-load]');
    const input = shell.querySelector('[data-player-input]');
    const defaultSrc = shell.dataset.defaultSrc || '';
    const poster = shell.dataset.poster || '';
    let hls = null;

    function destroy() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    }

    function loadSource(url) {
      if (!url) return;
      destroy();
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      video.poster = poster;
      video.load();
    }

    loadSource(defaultSrc);

    const start = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    };

    playBtn?.addEventListener('click', start);
    video.addEventListener('click', start);
    loadBtn?.addEventListener('click', () => {
      loadSource(input.value.trim());
      start();
    });

    input?.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        loadSource(input.value.trim());
        start();
      }
    });
  });

  if (document.body.classList.contains('page-search')) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const meta = document.getElementById('search-meta');
    const results = document.getElementById('search-results');

    function makePoster(item) {
      const palette = [
        ['#2a1f15', '#54402a', '#6f5536', '#9f7f56'],
        ['#231b14', '#4b3726', '#7a5b39', '#b88a58'],
        ['#1f1812', '#4d3a28', '#7e5b3a', '#d0a56c'],
        ['#251d17', '#5a4530', '#816245', '#c49f70']
      ][item.id % 4];
      const [dark, mid, accent, gold] = palette;
      const title = String(item.title || '').slice(0, 12);
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 600">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${dark}"/>
            <stop offset="55%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${accent}"/>
          </linearGradient>
        </defs>
        <rect width="420" height="600" rx="36" fill="url(#bg)"/>
        <circle cx="326" cy="110" r="120" fill="${gold}" fill-opacity="0.18"/>
        <rect x="24" y="24" width="372" height="552" rx="28" fill="#fff" fill-opacity="0.08" stroke="#fff" stroke-opacity="0.16"/>
        <text x="52" y="150" fill="#fff" font-size="48" font-weight="800" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif">${title}</text>
        <text x="52" y="214" fill="#fff" fill-opacity="0.85" font-size="22" font-weight="600" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif">${item.region || ''}</text>
        <text x="52" y="258" fill="#fff" fill-opacity="0.76" font-size="18" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif">${item.type || ''}</text>
      </svg>`;
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    function card(item) {
      const poster = makePoster(item);
      return `
        <a class="movie-card" href="movies/${String(item.id).padStart(4, '0')}.html">
          <div class="movie-card__poster">
            <img src="${poster}" alt="${item.title} 海报" loading="lazy">
            <div class="movie-card__overlay"><span>点击查看详情</span></div>
          </div>
          <div class="movie-card__body">
            <h3>${item.title}</h3>
            <p class="movie-card__meta">${[item.year, item.region, item.type].filter(Boolean).join(' · ')}</p>
            <p class="movie-card__desc">${item.one_line || item.summary || item.review || ''}</p>
          </div>
        </a>`;
    }

    fetch('assets/site-data.json')
      .then((r) => r.json())
      .then((data) => {
        const q = query.toLowerCase();
        const matches = !q ? data : data.filter((item) => {
          const hay = [item.title, item.region, item.type, item.genre, item.tags, item.one_line, item.summary, item.review].join(' ').toLowerCase();
          return hay.includes(q);
        });
        meta.textContent = q ? `关键词「${query}」共找到 ${matches.length} 条结果。` : `未输入关键词，默认展示全部影片数据。`;
        if (!matches.length) {
          results.innerHTML = '<div class="card-empty">没有找到匹配的影片，请换一个关键词试试。</div>';
          return;
        }
        results.innerHTML = matches.map(card).join('');
      })
      .catch(() => {
        meta.textContent = '搜索数据加载失败，请稍后重试。';
        results.innerHTML = '<div class="card-empty">搜索数据暂不可用。</div>';
      });
  }
})();
