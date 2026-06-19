(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');
    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    var hero = document.querySelector('.hero');
    var heroItems = document.querySelectorAll('.hero-thumb');
    if (hero && heroItems.length) {
        var heroImage = document.querySelector('.hero-poster img');
        var heroTitle = document.querySelector('.hero-poster-info h2');
        var heroText = document.querySelector('.hero-poster-info p');
        var heroLink = document.querySelector('.hero-main-link');
        var current = 0;
        function showHero(index) {
            var item = heroItems[index];
            if (!item) {
                return;
            }
            heroItems.forEach(function (thumb) {
                thumb.classList.remove('active');
            });
            item.classList.add('active');
            var image = item.getAttribute('data-image');
            var title = item.getAttribute('data-title');
            var desc = item.getAttribute('data-desc');
            var link = item.getAttribute('data-link');
            hero.style.setProperty('--hero-image', 'url("' + image + '")');
            if (heroImage) {
                heroImage.src = image;
                heroImage.alt = title;
            }
            if (heroTitle) {
                heroTitle.textContent = title;
            }
            if (heroText) {
                heroText.textContent = desc;
            }
            if (heroLink) {
                heroLink.href = link;
            }
            current = index;
        }
        heroItems.forEach(function (item, index) {
            item.addEventListener('click', function () {
                showHero(index);
            });
        });
        showHero(0);
        window.setInterval(function () {
            showHero((current + 1) % heroItems.length);
        }, 5200);
    }

    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var queryInput = form.querySelector('[data-search-input]');
            var keyword = queryInput ? queryInput.value.trim() : '';
            if (keyword) {
                var target = form.getAttribute('data-search-target') || 'categories.html';
                window.location.href = target + '?q=' + encodeURIComponent(keyword);
            }
        });
    });

    var filterBar = document.querySelector('[data-filter-bar]');
    if (filterBar) {
        var keywordInput = filterBar.querySelector('[data-filter-keyword]');
        var yearSelect = filterBar.querySelector('[data-filter-year]');
        var typeSelect = filterBar.querySelector('[data-filter-type]');
        var resetButton = filterBar.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('.empty-state');
        var params = new URLSearchParams(window.location.search);
        if (params.get('q') && keywordInput) {
            keywordInput.value = params.get('q');
        }
        function matchCard(card) {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okYear = !year || card.getAttribute('data-year') === year;
            var okType = !type || card.getAttribute('data-type') === type;
            return okKeyword && okYear && okType;
        }
        function applyFilter() {
            var shown = 0;
            cards.forEach(function (card) {
                var ok = matchCard(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        }
        [keywordInput, yearSelect, typeSelect].forEach(function (el) {
            if (el) {
                el.addEventListener('input', applyFilter);
                el.addEventListener('change', applyFilter);
            }
        });
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilter();
            });
        }
        applyFilter();
    }

    var videoBox = document.querySelector('[data-player]');
    if (videoBox) {
        var video = videoBox.querySelector('video');
        var button = videoBox.querySelector('.play-cover');
        var source = videoBox.getAttribute('data-src');
        var started = false;
        function startVideo() {
            if (!video || !source || started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            if (button) {
                button.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }
        if (button) {
            button.addEventListener('click', startVideo);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    startVideo();
                }
            });
        }
    }
})();
