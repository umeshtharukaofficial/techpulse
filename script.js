/* ==================================================
   TechPulse — GLOBAL TECH INTELLIGENCE
   ==================================================*/

// CONFIG — Get FREE key at https://gnews.io
var API_KEY = 'f2f190b2c0010826c51c2db6033368ce'; 
var currentCategory = 'technology';
var allArticles = [];
var bookmarks = JSON.parse(localStorage.getItem('wm_bookmarks')) || [];
var isDark = localStorage.getItem('wm_theme') !== 'light';

/* ====== BOOT SEQUENCE ====== */
window.addEventListener('DOMContentLoaded', function () {
    bootSequence();
});

function bootSequence() {
    var bar = document.getElementById('bootProgress');
    var txt = document.getElementById('bootText');
    var msgs = [
        'Connecting to satellite feeds...',
        'Scanning global sources...',
        'Decrypting intelligence...',
        'Building dashboard...',
        'System ready.'
    ];
    var progress = 0;
    var step = 0;

    var interval = setInterval(function () {
        progress += Math.random() * 25 + 5;
        if (progress > 100) progress = 100;
        bar.style.width = progress + '%';

        if (step < msgs.length) {
            txt.textContent = msgs[step];
            step++;
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(function () {
                document.getElementById('bootScreen').classList.add('done');
                document.getElementById('app').classList.remove('hidden');
                initApp();
            }, 400);
        }
    }, 500);
}

/* ====== INIT ====== */
function initApp() {
    // Theme
    if (!isDark) document.body.classList.add('light');
    updateThemeIcon();

    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Events
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('bookmarkToggle').addEventListener('click', function () {
        openModal();
    });
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            var q = this.value.trim();
            if (q) { currentCategory = q; fetchNews(q); }
        }
    });
    document.getElementById('mobileNavBtn').addEventListener('click', function () {
        var nav = document.getElementById('categoryNav');
        nav.style.display = nav.style.display === 'none' ? 'block' : '';
    });

    // Scroll top
    window.addEventListener('scroll', function () {
        var btn = document.getElementById('scrollTopBtn');
        btn.classList.toggle('visible', window.scrollY > 500);
    });

    // Keyboard shortcut
    document.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        if (e.key === 'Escape') closeModal();
    });

    // Modal outside click
    document.getElementById('bookmarkModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    updateBookmarkBadge();
    fetchNews('technology');
}

/* ====== CLOCK ====== */
function updateClock() {
    var now = new Date();
    var h = String(now.getUTCHours()).padStart(2, '0');
    var m = String(now.getUTCMinutes()).padStart(2, '0');
    var s = String(now.getUTCSeconds()).padStart(2, '0');
    var el = document.getElementById('liveTime');
    if (el) el.textContent = h + ':' + m + ':' + s;

    var at = document.getElementById('alertTime');
    if (at) at.textContent = h + ':' + m;
}

/* ====== THEME ====== */
function toggleTheme() {
    isDark = !isDark;
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('wm_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}
function updateThemeIcon() {
    var btn = document.getElementById('themeToggle');
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

/* ====== FETCH NEWS ====== */
async function fetchNews(query) {
    var articles = [];

    if (API_KEY && API_KEY.length > 5) {
        try {
            var url = 'https://gnews.io/api/v4/search?q=' + encodeURIComponent(query) +
                '&lang=en&max=20&apikey=' + API_KEY;
            var res = await fetch(url);
            var data = await res.json();
            if (data.articles) {
                for (var i = 0; i < data.articles.length; i++) {
                    var a = data.articles[i];
                    articles.push({
                        title: a.title,
                        description: a.description || '',
                        url: a.url,
                        image: a.image || placeholder(query),
                        source: a.source ? a.source.name : 'Unknown',
                        date: a.publishedAt,
                        author: a.source ? a.source.name : 'Staff',
                        category: query
                    });
                }
            }
        } catch (e) { console.log('API error:', e); }
    }

    if (articles.length === 0) articles = demoData(query);

    allArticles = articles;
    renderFeatured(articles.slice(0, 5));
    renderFeed(articles.slice(5));
    renderTicker(articles);
    renderPriority(articles.slice(0, 7));
    updateStats(articles);
}

/* ====== DEMO DATA ====== */
function demoData(cat) {
    var items = [
        { t: "OpenAI Unveils GPT-5: A New Era of Reasoning AI", d: "GPT-5 demonstrates unprecedented multi-step reasoning, outperforming human experts across 12 benchmark categories.", img: "photo-1677442136019-21780ecad995", s: "TechCrunch", au: "S. Chen" },
        { t: "Apple's M5 Chip Benchmarks Leak — 3x Faster Than M4", d: "Leaked Geekbench scores show Apple's next-gen silicon delivering a massive leap in both CPU and GPU performance.", img: "photo-1591370874773-6702e8f12fd8", s: "The Verge", au: "J. Rodriguez" },
        { t: "Quantum Supremacy: Google Achieves 1 Million Qubit Milestone", d: "Google's Willow processor solves optimization problems in seconds that would take classical supercomputers millennia.", img: "photo-1635070041078-e363dbe005cb", s: "Nature", au: "E. Watson" },
        { t: "SpaceX Starship Lands on Mars Simulation Platform", d: "Full-duration test flight proves Starship can execute Mars descent and landing sequence autonomously.", img: "photo-1541185933-ef5d8ed016c2", s: "Ars Technica", au: "M. Johnson" },
        { t: "Tesla Robotaxi Network Goes Live in 12 US Cities", d: "Tesla's FSD-powered autonomous ride-hailing service launches simultaneously across major metropolitan areas.", img: "photo-1593941707882-a5bba14938c7", s: "Bloomberg", au: "L. Park" },
        { t: "Critical Zero-Day Exploits Found in Major Cloud Platforms", d: "Researchers discover chain of vulnerabilities affecting AWS, Azure, and GCP simultaneously.", img: "photo-1550751827-4bd374c3f58b", s: "Dark Reading", au: "A. Turner" },
        { t: "Ethereum 3.0 Upgrade Promises 100,000 TPS Throughput", d: "The next evolution of Ethereum aims to rival centralized payment networks with sharding improvements.", img: "photo-1518546305927-5a555bb7020d", s: "CoinDesk", au: "M. Santos" },
        { t: "Linux 7.0 Kernel Released With Revolutionary Scheduler", d: "New EEVDF scheduler delivers 40% better latency for interactive workloads on desktop systems.", img: "photo-1629654297299-c8506221ca97", s: "ZDNet", au: "D. Miller" },
        { t: "NVIDIA Blackwell Ultra GPUs Break AI Training Records", d: "New B300 chips deliver 5x improvement in large language model training efficiency.", img: "photo-1591488320449-011701bb6704", s: "Tom's Hardware", au: "K. Zhang" },
        { t: "GitHub Copilot Now Generates Full-Stack Applications", d: "AI pair programmer evolves into autonomous developer capable of building complete web applications.", img: "photo-1555066931-4365d14bab8c", s: "GitHub Blog", au: "T. Wilson" },
        { t: "Samsung Tri-Fold Phone Enters Mass Production", d: "Galaxy Z Trifold features a 10-inch display that folds into a pocket-sized smartphone.", img: "photo-1610945415295-d9bbf067e59c", s: "Samsung News", au: "J. Park" },
        { t: "DeepMind AlphaScience Discovers New Superconductor Material", d: "AI-designed material achieves superconductivity at -20°C, a massive improvement over previous records.", img: "photo-1620712943543-bcc4688e7485", s: "MIT Tech Review", au: "A. Lee" },
        { t: "Rust Becomes Top-3 Programming Language Globally", d: "TIOBE Index shows Rust overtaking Java in monthly rankings for the first time in history.", img: "photo-1461749280684-dccba630e2f6", s: "TIOBE", au: "C. Brown" },
        { t: "Meta's Neural Interface Lets You Type By Thinking", d: "Non-invasive brain-computer interface achieves 90 words per minute with 95% accuracy.", img: "photo-1622979135225-d2ba269cf1ac", s: "Engadget", au: "R. Kim" },
        { t: "AWS Graviton5 Chips Offer 60% Better Price-Performance", d: "Amazon's custom ARM processors redefine cloud computing economics for enterprise workloads.", img: "photo-1451187580459-43490279c0fa", s: "AWS Blog", au: "S. Kumar" }
    ];

    var result = [];
    for (var i = 0; i < items.length; i++) {
        result.push({
            title: items[i].t,
            description: items[i].d,
            url: '#',
            image: 'https://images.unsplash.com/' + items[i].img + '?w=800&q=80',
            source: items[i].s,
            date: new Date(Date.now() - i * 2700000).toISOString(),
            author: items[i].au,
            category: cat
        });
    }
    return result;
}

/* ====== RENDER FEATURED ====== */
function renderFeatured(articles) {
    var el = document.getElementById('featuredPanel');
    var html = '';
    for (var i = 0; i < Math.min(articles.length, 5); i++) {
        var a = articles[i];
        html += '<div class="feat-card" onclick="openUrl(\'' + a.url + '\')">' +
            '<img src="' + a.image + '" alt="" onerror="this.src=\'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800\'">' +
            '<div class="feat-overlay">' +
            '<span class="feat-tag"><i class="fas fa-signal"></i> ' + (a.category || 'TECH').toUpperCase() + '</span>' +
            '<h2>' + a.title + '</h2>' +
            '<div class="feat-meta">' +
            '<span><i class="fas fa-clock"></i> ' + ago(a.date) + '</span>' +
            '<span><i class="fas fa-tower-broadcast"></i> ' + a.source + '</span>' +
            '</div></div></div>';
    }
    el.innerHTML = html;
}

/* ====== RENDER FEED ====== */
function renderFeed(articles) {
    var el = document.getElementById('feedGrid');
    if (!articles.length) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-satellite-dish"></i><h3>No signals detected</h3><p>Try different sector</p></div>';
        return;
    }
    var html = '';
    for (var i = 0; i < articles.length; i++) {
        var a = articles[i];
        var saved = isBookmarked(a.title);
        var init = a.author ? a.author.charAt(0) : 'S';
        var idx = i + 5;

        html += '<div class="feed-card" style="animation-delay:' + (i * 0.06) + 's">' +
            '<div class="card-img">' +
            '<img src="' + a.image + '" alt="" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800\'">' +
            '<span class="card-src">' + a.source + '</span>' +
            '<button class="card-save ' + (saved ? 'saved' : '') + '" onclick="event.stopPropagation();toggleSave(' + idx + ')">' +
            '<i class="fas fa-bookmark"></i></button></div>' +
            '<div class="card-content">' +
            '<span class="card-tag">' + (a.category || 'Technology') + '</span>' +
            '<h3>' + a.title + '</h3>' +
            '<p>' + (a.description || 'Read full dispatch...') + '</p>' +
            '<div class="card-bottom">' +
            '<div class="card-author"><div class="author-avatar">' + init + '</div>' + a.author + '</div>' +
            '<a href="' + a.url + '" target="_blank" class="card-link" onclick="event.stopPropagation()">Open <i class="fas fa-arrow-right"></i></a>' +
            '</div></div></div>';
    }
    el.innerHTML = html;
}

/* ====== RENDER TICKER ====== */
function renderTicker(articles) {
    var parts = [];
    for (var i = 0; i < Math.min(articles.length, 10); i++) {
        parts.push('◆ ' + articles[i].title);
    }
    document.getElementById('alertText').textContent = parts.join('     ');
}

/* ====== RENDER PRIORITY ====== */
function renderPriority(articles) {
    var el = document.getElementById('priorityFeed');
    var html = '';
    for (var i = 0; i < articles.length; i++) {
        var a = articles[i];
        var num = (i + 1 < 10) ? '0' + (i + 1) : '' + (i + 1);
        html += '<div class="priority-item" onclick="openUrl(\'' + a.url + '\')">' +
            '<span class="priority-num">' + num + '</span>' +
            '<div class="priority-info">' +
            '<h4>' + a.title + '</h4>' +
            '<p>' + ago(a.date) + ' · ' + a.source + '</p>' +
            '</div></div>';
    }
    el.innerHTML = html;
}

/* ====== STATS ====== */
function updateStats(articles) {
    document.getElementById('statArticles').textContent = articles.length;
    document.getElementById('feedCount').textContent = articles.length;

    var srcs = [];
    for (var i = 0; i < articles.length; i++) {
        if (srcs.indexOf(articles[i].source) === -1) srcs.push(articles[i].source);
    }
    document.getElementById('statSources').textContent = srcs.length;

    var cat = currentCategory;
    document.getElementById('statCategory').textContent =
        cat.charAt(0).toUpperCase() + cat.slice(1);
}

/* ====== CATEGORY ====== */
function switchCategory(cat, btn) {
    currentCategory = cat;
    var btns = document.querySelectorAll('.cat-btn');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
    if (btn) btn.classList.add('active');
    fetchNews(cat);
}

/* ====== SEARCH ====== */
function quickSearch(term) {
    document.getElementById('searchInput').value = term;
    currentCategory = term;
    fetchNews(term);
}

/* ====== VIEW TOGGLE ====== */
function setView(mode) {
    var grid = document.getElementById('feedGrid');
    var gridBtn = document.getElementById('gridViewBtn');
    var listBtn = document.getElementById('listViewBtn');

    if (mode === 'list') {
        grid.classList.add('list-view');
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
    } else {
        grid.classList.remove('list-view');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    }
}

/* ====== BOOKMARKS ====== */
function isBookmarked(title) {
    for (var i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].title === title) return true;
    }
    return false;
}

function toggleSave(idx) {
    var a = allArticles[idx];
    if (!a) return;

    var found = -1;
    for (var i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].title === a.title) { found = i; break; }
    }

    if (found > -1) bookmarks.splice(found, 1);
    else bookmarks.push(a);

    localStorage.setItem('wm_bookmarks', JSON.stringify(bookmarks));
    updateBookmarkBadge();
    renderFeed(allArticles.slice(5));
}

function updateBookmarkBadge() {
    document.getElementById('bookmarkBadge').textContent = bookmarks.length;
}

function openModal() {
    var modal = document.getElementById('bookmarkModal');
    var body = document.getElementById('bookmarkBody');

    if (!bookmarks.length) {
        body.innerHTML = '<div class="empty-state"><i class="fas fa-bookmark"></i><h3>No saved intel</h3><p>Bookmark articles to save them here</p></div>';
    } else {
        var html = '';
        for (var i = 0; i < bookmarks.length; i++) {
            var a = bookmarks[i];
            html += '<div class="bm-item">' +
                '<img src="' + a.image + '" onerror="this.src=\'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400\'">' +
                '<h4><a href="' + a.url + '" target="_blank" style="color:var(--text-primary)">' + a.title + '</a></h4>' +
                '<button class="bm-del" onclick="removeBm(' + i + ')"><i class="fas fa-trash-alt"></i></button></div>';
        }
        body.innerHTML = html;
    }
    modal.classList.add('open');
}

function closeModal() {
    document.getElementById('bookmarkModal').classList.remove('open');
}

function removeBm(i) {
    bookmarks.splice(i, 1);
    localStorage.setItem('wm_bookmarks', JSON.stringify(bookmarks));
    updateBookmarkBadge();
    openModal();
    renderFeed(allArticles.slice(5));
}

/* ====== UTILITIES ====== */
function openUrl(url) {
    if (url && url !== '#') window.open(url, '_blank');
}

function ago(dateStr) {
    if (!dateStr) return 'Just now';
    var sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (sec < 60) return 'Just now';
    if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
    if (sec < 604800) return Math.floor(sec / 86400) + 'd ago';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function placeholder(cat) {
    return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800';
}
