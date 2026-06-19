
document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initHeroSlider();
  initFilters();
  initSearchPage();
});

function initMobileMenu() {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", function () {
    panel.classList.toggle("open");
    toggle.textContent = panel.classList.contains("open") ? "×" : "☰";
  });
}

function initHeroSlider() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;
  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }
  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      start();
    });
  });
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initFilters() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
  scopes.forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
    var empty = scope.querySelector("[data-empty-state]");
    var activeValue = "";
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        var meta = (card.getAttribute("data-meta") || "").toLowerCase();
        var okText = !q || meta.indexOf(q) !== -1;
        var okChip = !activeValue || meta.indexOf(activeValue.toLowerCase()) !== -1;
        var visible = okText && okChip;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeValue = chip.getAttribute("data-filter-value") || "";
        apply();
      });
    });
    apply();
  });
}

function initSearchPage() {
  var page = document.querySelector("[data-search-page]");
  if (!page) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var input = document.querySelector("[data-search-input]");
  var cards = Array.prototype.slice.call(page.querySelectorAll("[data-movie-card]"));
  var empty = page.querySelector("[data-empty-state]");
  if (input) {
    input.value = query;
    input.addEventListener("input", function () {
      filterSearch(input.value);
    });
  }
  function filterSearch(value) {
    var q = value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var meta = (card.getAttribute("data-meta") || "").toLowerCase();
      var visible = !q || meta.indexOf(q) !== -1;
      card.style.display = visible ? "" : "none";
      if (visible) {
        shown += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("show", shown === 0);
    }
  }
  filterSearch(query);
}
