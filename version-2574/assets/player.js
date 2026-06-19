(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = document.querySelectorAll(".video-shell");

    players.forEach(function (shell) {
      var video = shell.querySelector("video[data-src]");
      var button = shell.querySelector(".video-start");

      if (!video) {
        return;
      }

      var source = video.getAttribute("data-src");
      var hasLoaded = false;

      function loadSource() {
        if (hasLoaded || !source) {
          return;
        }

        hasLoaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else {
          video.src = source;
        }
      }

      function startPlayback() {
        loadSource();
        shell.classList.add("is-playing");
        video.controls = true;

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          shell.classList.remove("is-playing");
        }
      });
    });
  });
})();
