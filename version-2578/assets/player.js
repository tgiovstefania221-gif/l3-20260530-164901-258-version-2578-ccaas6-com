(function () {
  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);

    if (!video || !button || !sourceUrl) {
      return;
    }

    const overlay = button.closest('.play-overlay');
    let ready = false;
    let hls = null;

    function attachSource() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        ready = true;
        return;
      }

      video.src = sourceUrl;
      ready = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove('is-hidden');
      }
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      attachSource();
      hideOverlay();

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showOverlay();
        });
      }
    }

    button.addEventListener('click', startPlayback);

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
