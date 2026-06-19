(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (navButton && mobileMenu) {
    navButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    }, { once: true });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-search]').forEach(function (input) {
    var scope = document.querySelector('[data-card-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        card.classList.toggle('is-hidden', Boolean(query) && text.indexOf(query) === -1);
      });
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    var loaded = false;

    function playVideo() {
      if (!video || !stream) {
        return;
      }

      player.classList.add('is-playing');

      if (!loaded) {
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
