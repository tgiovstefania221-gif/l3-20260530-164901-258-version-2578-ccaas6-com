import { H as Hls } from "./hls-vendor-dru42stk.js";

const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;

function activateHero(index) {
  if (!slides.length) {
    return;
  }

  heroIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, current) => {
    slide.classList.toggle("active", current === heroIndex);
  });

  dots.forEach((dot, current) => {
    dot.classList.toggle("active", current === heroIndex);
  });
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    activateHero(Number(dot.dataset.heroDot));
  });
});

if (slides.length > 1) {
  window.setInterval(() => {
    activateHero(heroIndex + 1);
  }, 5200);
}

const filterInput = document.querySelector("[data-filter-input]");
const filterScope = document.querySelector("[data-filter-scope]");

if (filterInput && filterScope) {
  const cards = Array.from(filterScope.querySelectorAll("[data-card]"));

  filterInput.addEventListener("input", () => {
    const terms = filterInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);

    cards.forEach((card) => {
      const source = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.textContent
      ].join(" ").toLowerCase();

      const matched = terms.every((term) => source.includes(term));
      card.classList.toggle("is-hidden", !matched);
    });
  });
}

const playerMap = new WeakMap();

function preparePlayer(video) {
  const stream = video.dataset.stream;

  if (!stream) {
    return;
  }

  if (playerMap.has(video)) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = stream;
    playerMap.set(video, true);
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(stream);
    hls.attachMedia(video);
    playerMap.set(video, hls);
    return;
  }

  video.src = stream;
  playerMap.set(video, true);
}

document.querySelectorAll(".movie-player").forEach((video) => {
  video.addEventListener("play", () => {
    preparePlayer(video);
  }, { once: true });
});

document.querySelectorAll("[data-play-button]").forEach((button) => {
  const card = button.closest(".player-card");
  const video = card ? card.querySelector(".movie-player") : null;

  if (!video) {
    return;
  }

  button.addEventListener("click", async () => {
    preparePlayer(video);
    button.classList.add("is-hidden");

    try {
      await video.play();
    } catch (error) {
      button.classList.remove("is-hidden");
    }
  });

  video.addEventListener("playing", () => {
    button.classList.add("is-hidden");
  });

  video.addEventListener("pause", () => {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });
});
