(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function initHeader() {
    var header = document.querySelector('[data-site-header]');
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (header) {
      var updateHeader = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 10);
      };
      updateHeader();
      window.addEventListener('scroll', updateHeader, { passive: true });
    }

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var counter = scope.querySelector('[data-result-counter]');

      if (!input || !cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && scope.hasAttribute('data-search-page')) {
        input.value = query;
      }

      function applyFilter() {
        var value = normalize(input.value);
        var matched = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var isMatch = !value || haystack.indexOf(value) !== -1;
          card.classList.toggle('is-filtered-out', !isMatch);
          if (isMatch) {
            matched += 1;
          }
        });

        if (empty) {
          empty.hidden = matched !== 0;
        }

        if (counter) {
          counter.textContent = '共 ' + matched + ' 部影片';
        }
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;
      var loaded = false;

      if (!video || !button) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function hideOverlay() {
        button.classList.add('is-hidden');
      }

      function attachSource() {
        var source = video.getAttribute('data-src');
        if (!source) {
          setStatus('未找到可用播放源');
          return false;
        }

        if (loaded) {
          return true;
        }

        setStatus('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          loaded = true;
          return true;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源加载完成');
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络错误，正在重试...');
              hlsInstance.startLoad();
              return;
            }

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体错误，正在恢复...');
              hlsInstance.recoverMediaError();
              return;
            }

            setStatus('播放源加载失败，请稍后再试');
            hlsInstance.destroy();
          });

          loaded = true;
          return true;
        }

        setStatus('当前浏览器暂不支持 HLS 播放');
        return false;
      }

      function play() {
        if (!attachSource()) {
          return;
        }

        hideOverlay();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放');
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        hideOverlay();
        setStatus('正在播放');
      });
      video.addEventListener('pause', function () {
        setStatus('已暂停');
      });
      video.addEventListener('ended', function () {
        setStatus('播放结束');
        button.classList.remove('is-hidden');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilters();
    initPlayers();
  });
})();
