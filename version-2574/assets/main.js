(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupImageFallbacks();
  });

  function setupMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "×" : "☰";
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-to]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("active");
    }));

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to")) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-results .movie-card"));

    if (!panel || !cards.length) {
      return;
    }

    var searchInput = panel.querySelector(".js-card-search");
    var regionSelect = panel.querySelector(".js-filter-region");
    var typeSelect = panel.querySelector(".js-filter-type");
    var yearSelect = panel.querySelector(".js-filter-year");
    var count = panel.querySelector("[data-result-count]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    fillOptions(regionSelect, cards, "region");
    fillOptions(typeSelect, cards, "type");
    fillOptions(yearSelect, cards, "year", true);

    if (searchInput && query) {
      searchInput.value = query;
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" "));
        var match = true;

        if (keyword && text.indexOf(keyword) === -1) {
          match = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          match = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          match = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          match = false;
        }

        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "共 " + visible + " 部";
      }
    }
  }

  function fillOptions(select, cards, key, descending) {
    if (!select) {
      return;
    }

    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + key) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    values.sort(function (a, b) {
      if (descending) {
        return String(b).localeCompare(String(a), "zh-CN");
      }
      return String(a).localeCompare(String(b), "zh-CN");
    });

    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll("img.movie-cover, .hero-slide > img");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
        image.removeAttribute("src");
      }, { once: true });
    });
  }
})();
