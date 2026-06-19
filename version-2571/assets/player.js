
document.addEventListener("DOMContentLoaded", function () {
  var Hls = window.Hls;
  var root = document.querySelector("[data-player]");
  if (!root) {
    return;
  }
  var video = root.querySelector("video");
  var cover = root.querySelector(".player-cover");
  var config = document.getElementById("video-config");
  if (!video || !config) {
    return;
  }
  var src = "";
  try {
    src = JSON.parse(config.textContent).src || "";
  } catch (error) {
    src = "";
  }
  var loaded = false;
  var hls = null;
  function markError() {
    root.classList.add("player-error");
    if (cover) {
      cover.classList.remove("is-hidden");
    }
  }
  function loadVideo() {
    if (loaded || !src) {
      return;
    }
    loaded = true;
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          markError();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      markError();
    }
  }
  function start() {
    loadVideo();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }
  if (cover) {
    cover.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      start();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
