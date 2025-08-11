// Desktop interactions for index_desktop.html
// Clean, fast, accessible — no preloader, no particles, no annoying moving boxes.

document.addEventListener('DOMContentLoaded', () => {
    // Smooth reveal animations (no external libs)
    const animElements = document.querySelectorAll('[data-anim]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const anim = el.getAttribute('data-anim');
                el.classList.add('is-visible', `anim-${anim}`);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.12 });

    animElements.forEach(el => observer.observe(el));

    // Theme toggle (persist to localStorage)
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('mrs_theme_desktop') || 'dark';

    function applyTheme(t) {
        if (t === 'light') {
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-pressed','true');
        } else {
            body.classList.remove('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-pressed','false');
        }
    }
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', (e) => {
        const isLight = body.classList.contains('light-mode');
        const next = isLight ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem('mrs_theme_desktop', next);
    });

    // Simple mobile menu overlay for narrower screens
    const menuOpen = document.getElementById('menuOpen');
    let mobileOverlay = null;
    menuOpen && menuOpen.addEventListener('click', () => {
        if (!mobileOverlay) {
            mobileOverlay = document.createElement('div');
            mobileOverlay.id = 'mobileOverlay';
            mobileOverlay.style.position = 'fixed';
            mobileOverlay.style.inset = '0';
            mobileOverlay.style.background = 'linear-gradient(180deg, rgba(4,8,6,0.96), rgba(4,8,6,0.98))';
            mobileOverlay.style.zIndex = '1400';
            mobileOverlay.style.display = 'flex';
            mobileOverlay.style.flexDirection = 'column';
            mobileOverlay.style.padding = '28px';
            mobileOverlay.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <a href="index_desktop.html" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;">
                        <img src="assets/logo.png" alt="logo" style="height:44px;" />
                        <strong style="font-size:18px;">MyRealSurveys</strong>
                    </a>
                    <button id="closeMobile" aria-label="Close menu" style="background:none;border:none;color:#fff;font-size:30px;">&times;</button>
                </div>
                <nav style="margin-top:22px; display:flex; flex-direction:column; gap:14px;">
                    <a href="index_desktop.html" style="color:#fff;text-decoration:none;font-size:18px;font-weight:700;">Home</a>
                    <a href="giveaways_desktop.html" style="color:#fff;text-decoration:none;font-size:18px;">Giveaways</a>
                    <a href="howitworks_desktop.html" style="color:#fff;text-decoration:none;font-size:18px;">How it Works</a>
                    <a href="contact_desktop.html" style="color:#fff;text-decoration:none;font-size:18px;">Contact</a>
                    <a href="register_desktop.html" style="background:${'#fdd835'};color:#163b10;padding:10px;border-radius:12px;text-align:center;font-weight:800;text-decoration:none;margin-top:8px;">Register</a>
                </nav>
            `;
            document.body.appendChild(mobileOverlay);
            document.getElementById('closeMobile').addEventListener('click', closeOverlay);
        } else {
            mobileOverlay.style.display = 'flex';
        }
        document.body.style.overflow = 'hidden';
    });

    function closeOverlay() {
        if (mobileOverlay) mobileOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay();
    });

    // Smooth internal scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (ev) => {
            const targetId = a.getAttribute('href').slice(1);
            if (!targetId) return;
            const target = document.getElementById(targetId);
            if (target) {
                ev.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Image graceful fallback
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            img.style.opacity = '0.6';
            img.style.filter = 'grayscale(80%)';
        });
    });

    // Micro UX: subtle hover ripple for CTA
    document.querySelectorAll('.btn-cta-lg').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            btn.style.background = `radial-gradient(circle at ${x}px 50%, rgba(255,255,255,0.06), transparent 30%), linear-gradient(90deg,var(--accent),var(--accent-2))`;
            clearTimeout(btn._rippleTimeout);
            btn._rippleTimeout = setTimeout(()=> btn.style.background = 'linear-gradient(90deg,var(--accent),var(--accent-2))', 180);
        });
    });

    console.log('Desktop UI ready — clean, no borders, no noisy animations.');
});
