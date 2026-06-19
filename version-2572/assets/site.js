import { H as Hls } from './hls-dru42stk.js';

const root = document.body.dataset.root || './';

function bySelector(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

function setupMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function setupSearchForms() {
  bySelector('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        window.location.href = `${root}search.html`;
      }
    });
  });
}

function setupImageFallbacks() {
  bySelector('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('is-missing');
    }, { once: true });
  });
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = bySelector('[data-hero-slide]', hero);
  const dots = bySelector('[data-hero-dot]', hero);
  if (slides.length < 2) {
    return;
  }

  let index = 0;
  let timer = null;

  const activate = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-pressed', dotIndex === index ? 'true' : 'false');
    });
  };

  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => activate(index + 1), 5200);
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      activate(dotIndex);
      start();
    });
  });

  activate(0);
  start();
}

function setupFilters() {
  const panel = document.querySelector('[data-filter-panel]');
  const list = document.querySelector('[data-filter-list]');
  if (!panel || !list) {
    return;
  }

  const cards = bySelector('[data-title]', list);
  const empty = document.querySelector('[data-filter-empty]');

  const apply = () => {
    const query = (panel.querySelector('[name="query"]')?.value || '').trim().toLowerCase();
    const year = panel.querySelector('[name="year"]')?.value || '';
    const region = panel.querySelector('[name="region"]')?.value || '';
    const type = panel.querySelector('[name="type"]')?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags,
      ].join(' ').toLowerCase();
      const matched = (!query || haystack.includes(query)) &&
        (!year || card.dataset.year === year) &&
        (!region || card.dataset.region === region) &&
        (!type || card.dataset.type === type);

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  panel.addEventListener('input', apply);
  panel.addEventListener('change', apply);
  panel.addEventListener('reset', () => {
    window.setTimeout(apply, 0);
  });
}

function initPlayer(shell) {
  const video = shell.querySelector('video');
  const status = shell.querySelector('[data-player-status]');
  const source = shell.dataset.src || '';
  if (!video || !source) {
    if (status) {
      status.textContent = '当前影片暂未配置播放源';
    }
    return;
  }

  if (shell.dataset.loaded === 'true') {
    video.play().catch(() => {});
    return;
  }

  shell.dataset.loaded = 'true';
  if (status) {
    status.textContent = '正在初始化播放源...';
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', () => {
      shell.classList.add('is-ready');
      if (status) {
        status.textContent = '播放源已就绪';
      }
      video.play().catch(() => {});
    }, { once: true });
    video.load();
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      shell.classList.add('is-ready');
      if (status) {
        status.textContent = '播放源已就绪';
      }
      video.play().catch(() => {});
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (status) {
        status.textContent = data?.fatal ? '播放源加载异常，可刷新页面重试' : '正在缓冲或切换播放片段';
      }
    });
    shell._hls = hls;
    return;
  }

  if (status) {
    status.textContent = '当前浏览器不支持 HLS 播放，请使用 Safari 或现代浏览器访问';
  }
}

function setupPlayers() {
  bySelector('[data-player]').forEach((shell) => {
    const button = shell.querySelector('[data-play-trigger]');
    const video = shell.querySelector('video');
    if (button) {
      button.addEventListener('click', () => initPlayer(shell));
    }
    if (video) {
      video.addEventListener('play', () => {
        shell.classList.add('is-ready');
      });
    }
  });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function createSearchCard(movie) {
  const article = document.createElement('article');
  article.className = 'list-card';
  article.dataset.title = movie.title;
  article.dataset.year = String(movie.year);
  article.dataset.region = movie.region;
  article.dataset.type = movie.type;
  article.dataset.genre = movie.genre;

  const coverHref = `${root}details/movie-${movie.id}.html`;
  const coverSrc = `${root}${movie.cover}.jpg`;
  article.innerHTML = `
    <span class="rank-num">${movie.id.slice(-2)}</span>
    <a href="${coverHref}" class="list-cover">
      <img src="${coverSrc}" alt="${movie.title}" loading="lazy" data-fallback>
    </a>
    <div class="list-body">
      <h3><a href="${coverHref}">${movie.title}</a></h3>
      <p>${movie.year} · ${movie.region} · ${movie.type} · ${movie.genre}</p>
      <p>${movie.oneLine}</p>
    </div>
  `;
  return article;
}

function setupSearchPage() {
  const results = document.querySelector('[data-search-results]');
  const form = document.querySelector('[data-search-page-form]');
  const input = document.querySelector('[data-search-page-input]');
  const summary = document.querySelector('[data-search-summary]');
  const movies = window.MOVIE_SEARCH_INDEX || [];
  if (!results || !input || !summary) {
    return;
  }

  const initialQuery = getQueryParam('q');
  input.value = initialQuery;

  const render = (query) => {
    const q = query.trim().toLowerCase();
    const matched = movies.filter((movie) => {
      if (!q) {
        return true;
      }
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' '),
      ].join(' ').toLowerCase().includes(q);
    }).slice(0, 120);

    results.innerHTML = '';
    matched.forEach((movie) => {
      results.appendChild(createSearchCard(movie));
    });
    summary.textContent = q ? `“${query}” 的匹配结果` : '可输入片名、地区、年份、题材进行搜索';
    if (matched.length === 0) {
      results.innerHTML = '<p class="filter-empty">没有找到匹配影片，请换一个关键词。</p>';
    }
    setupImageFallbacks();
  };

  render(initialQuery);
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const q = input.value.trim();
      const url = q ? `${root}search.html?q=${encodeURIComponent(q)}` : `${root}search.html`;
      window.history.replaceState(null, '', url);
      render(q);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupSearchForms();
  setupImageFallbacks();
  setupHero();
  setupFilters();
  setupPlayers();
  setupSearchPage();
});
