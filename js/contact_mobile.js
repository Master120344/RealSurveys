// Utility: Debounce function
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Global App Object
const MyRealSurveysApp = {
    // Configuration
    config: {
        particleColor: 0x00f7ff,
        particleCount: 70,
        particleSize: 0.6,
        particleSpeed: 0.03,
        stickyNavOffset: 10,
        scrollAnimationThreshold: 0.15,
        preloaderMinTime: 500, // Reduced minimum time for faster debugging
        preloaderFadeTime: 800,
        preloaderMaxWait: 7000, // Max time to wait before forcing preloader hide
    },

    // State
    state: {
        isMenuOpen: false,
        lastScrollTop: 0,
        isThreeJsInitialized: false,
        isGsapInitialized: false,
        preloaderHidden: false, // Track if preloader has been hidden
    },

    // DOM Elements Cache
    elements: {},

    // Initialization Sequence
    init: function() {
        console.log("MyRealSurveysApp (index_mobile.js): Initializing...");
        this.cacheDOMElements();
        
        // Attempt to hide preloader sooner, less dependent on window.load
        this.initiatePreloaderHide(); 

        this.initTheme();
        this.initNavigation();
        this.initFooter();
        this.initLibrariesAndPostLoadTasks(); // Handles libraries and animations after preloader
        this.initScrollEffects();
        console.log("MyRealSurveysApp (index_mobile.js): Core Initialized.");
    },

    cacheDOMElements: function() {
        console.log("MyRealSurveysApp: Caching DOM Elements...");
        this.elements = {
            body: document.body,
            preloader: document.getElementById('quantum-preloader'),
            particleCanvas: document.getElementById('quantum-particle-canvas'),
            header: document.querySelector('.holographic-header'),
            nav: document.getElementById('stellar-nav'),
            navMenuTrigger: document.querySelector('.nav-menu-trigger'),
            navMenuOptions: document.getElementById('nav-menu-options'),
            currentYearSpan: document.getElementById('current-year'),
            logo: document.querySelector('.quantum-logo'),
            headerMainContent: document.querySelector('.header-main-content'),
            neuralTickerBar: document.querySelector('.neural-ticker-bar'),
            animatedScrollElements: document.querySelectorAll('.animate-on-scroll'),
        };
        if (!this.elements.preloader) {
            console.error("MyRealSurveysApp: PRELOADER ELEMENT NOT FOUND IN DOM!");
        }
        console.log("MyRealSurveysApp: DOM Elements Cached.");
    },

    initiatePreloaderHide: function() {
        console.log("MyRealSurveysApp: initiatePreloaderHide called.");
        if (!this.elements.preloader) {
            console.error("MyRealSurveysApp: Cannot hide preloader, element not found.");
            return;
        }
        if (this.state.preloaderHidden) {
            console.log("MyRealSurveysApp: Preloader already processed for hiding.");
            return;
        }

        // Hide preloader after a minimum display time from DOMContentLoaded
        // This is less dependent on all external resources (window.load)
        const startTime = Date.now();
        
        const doHide = () => {
            if (this.state.preloaderHidden) return; // Prevent multiple calls
            console.log("MyRealSurveysApp: doHide (for preloader) called.");
            this.elements.preloader.setAttribute('aria-busy', 'false');
            setTimeout(() => {
                if (this.elements.preloader) this.elements.preloader.style.display = 'none';
                console.log("MyRealSurveysApp: Preloader display set to none.");
            }, this.config.preloaderFadeTime);
            this.state.preloaderHidden = true; // Mark as hidden
            this.triggerEntranceAnimations(); // Try to trigger animations now
        };

        const timeSinceDOMLoaded = Date.now() - (this.domContentLoadedTime || Date.now());
        const remainingMinTime = Math.max(0, this.config.preloaderMinTime - timeSinceDOMLoaded);
        
        console.log(`MyRealSurveysApp: Scheduling preloader hide in ${remainingMinTime}ms.`);
        setTimeout(doHide, remainingMinTime);

        // Safety Max Wait: Force hide if it's still there after a long time
        setTimeout(() => {
            if (!this.state.preloaderHidden && this.elements.preloader && this.elements.preloader.getAttribute('aria-busy') === 'true') {
                console.warn("MyRealSurveysApp: PRELOADER MAX_WAIT TIMEOUT triggered. Forcing hide.");
                doHide();
            }
        }, this.config.preloaderMaxWait);
    },
    
    initTheme: function() {
        // (Assuming this is simple and not error-prone, keep as is for now)
        if (!this.elements.body) return;
        this.elements.body.classList.add('dark-mode');
        this.elements.body.classList.remove('light-mode');
        console.log("MyRealSurveysApp: Theme set to dark mode (enforced).");
    },

    initNavigation: function() {
        // (Assuming this is simple and not error-prone)
        if (!this.elements.navMenuTrigger || !this.elements.navMenuOptions) {
             console.error("MyRealSurveysApp: Navigation elements not found.");
             return;
        }
        const toggleMenu = () => {
            this.state.isMenuOpen = !this.state.isMenuOpen;
            this.elements.navMenuTrigger.setAttribute('aria-expanded', this.state.isMenuOpen);
            this.elements.navMenuOptions.classList.toggle('active', this.state.isMenuOpen);
            this.elements.body.classList.toggle('no-scroll', this.state.isMenuOpen);
        };
        this.elements.navMenuTrigger.addEventListener('click', toggleMenu);
        this.elements.navMenuOptions.addEventListener('click', (event) => {
             if (event.target.matches('.nav-link') && this.state.isMenuOpen) toggleMenu();
        });
        document.addEventListener('click', (event) => {
            if (this.state.isMenuOpen &&
                !this.elements.navMenuOptions.contains(event.target) &&
                !this.elements.navMenuTrigger.contains(event.target)) {
                toggleMenu();
            }
        });
        console.log("MyRealSurveysApp: Navigation initialized.");
    },

    initFooter: function() {
        if (this.elements.currentYearSpan) {
            this.elements.currentYearSpan.textContent = new Date().getFullYear();
        }
        console.log("MyRealSurveysApp: Footer initialized.");
    },

    // This function will now be called slightly later or ensure libraries are ready
    initLibrariesAndPostLoadTasks: function() {
        console.log("MyRealSurveysApp: initLibrariesAndPostLoadTasks called.");
        // Check for Three.js
        try {
            const threeCheckInterval = setInterval(() => {
                if (typeof THREE !== 'undefined') {
                    clearInterval(threeCheckInterval);
                    console.log("MyRealSurveysApp: Three.js library found.");
                    this.initThreeJSBackground();
                } else {
                    console.log("MyRealSurveysApp: Waiting for Three.js...");
                }
            }, 200); // Check slightly less frequently
            setTimeout(() => { // Safety timeout for Three.js check
                clearInterval(threeCheckInterval);
                if (typeof THREE === 'undefined') console.warn("MyRealSurveysApp: Three.js did not load in time.");
            }, 5000);
        } catch (error) {
            console.error("MyRealSurveysApp: Error during Three.js init setup:", error);
        }

        // Check for GSAP and ScrollTrigger
        try {
            const gsapCheckInterval = setInterval(() => {
                if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                    clearInterval(gsapCheckInterval);
                    console.log("MyRealSurveysApp: GSAP & ScrollTrigger libraries found.");
                    gsap.registerPlugin(ScrollTrigger);
                    this.state.isGsapInitialized = true;
                    this.initScrollAnimations(); 
                    this.triggerEntranceAnimations(); // Now safe to call if preloader already hidden
                } else {
                    console.log("MyRealSurveysApp: Waiting for GSAP & ScrollTrigger...");
                }
            }, 200);
            setTimeout(() => { // Safety timeout for GSAP check
                clearInterval(gsapCheckInterval);
                if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                     console.warn("MyRealSurveysApp: GSAP or ScrollTrigger did not load in time.");
                }
            }, 5000);
        } catch (error) {
            console.error("MyRealSurveysApp: Error during GSAP init setup:", error);
        }
    },

    threeJS: { /* ... (keep the threeJS object structure as before) ... */
        scene: null, camera: null, renderer: null, particles: null, animationFrameId: null,
    },

    initThreeJSBackground: function() {
        if (!this.elements.particleCanvas || !this.elements.header) {
            console.warn("MyRealSurveysApp: Three.js canvas or header container not found, background disabled.");
            return;
        }
        if (this.state.isThreeJsInitialized) {
            console.log("MyRealSurveysApp: Three.js already initialized.");
            return;
        }
        console.log("MyRealSurveysApp: Initializing Three.js background...");
        // ... (The rest of your initThreeJSBackground function - ensure it's robust)
        // Make sure to wrap the core logic in a try...catch
        try {
            const container = this.elements.header;
            this.threeJS.scene = new THREE.Scene();
            this.threeJS.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            this.threeJS.camera.position.z = 40;
            this.threeJS.renderer = new THREE.WebGLRenderer({
                canvas: this.elements.particleCanvas, alpha: true, antialias: false, powerPreference: "low-power"
            });
            this.threeJS.renderer.setSize(container.clientWidth, container.clientHeight);
            this.threeJS.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

            const particleGeometry = new THREE.BufferGeometry();
            const count = this.config.particleCount;
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count * 3; i++) { positions[i] = (Math.random() - 0.5) * 150; }
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particleMaterial = new THREE.PointsMaterial({
                size: this.config.particleSize, sizeAttenuation: true, color: this.config.particleColor,
                transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending
            });
            this.threeJS.particles = new THREE.Points(particleGeometry, particleMaterial);
            this.threeJS.scene.add(this.threeJS.particles);

            const clock = new THREE.Clock();
            const animate = () => {
                this.threeJS.animationFrameId = requestAnimationFrame(animate);
                const elapsedTime = clock.getElapsedTime();
                const speed = this.config.particleSpeed;
                if (this.threeJS.particles) {
                    this.threeJS.particles.rotation.y = elapsedTime * speed;
                    this.threeJS.particles.rotation.x = elapsedTime * speed * 0.5;
                }
                if(this.threeJS.scene && this.threeJS.camera && this.threeJS.renderer){
                     this.threeJS.renderer.render(this.threeJS.scene, this.threeJS.camera);
                }
            };
            if(this.threeJS.renderer) {
                animate();
                this.state.isThreeJsInitialized = true;
                console.log("MyRealSurveysApp: Three.js background animation started.");
            } else { throw new Error("Three.js Renderer failed to initialize for animation."); }

            const handleResize = debounce(() => {
                if (!this.state.isThreeJsInitialized || !this.threeJS.camera || !this.threeJS.renderer || !container) return;
                this.threeJS.camera.aspect = container.clientWidth / container.clientHeight;
                this.threeJS.camera.updateProjectionMatrix();
                this.threeJS.renderer.setSize(container.clientWidth, container.clientHeight);
                this.threeJS.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            }, 250);
            window.addEventListener('resize', handleResize);

        } catch (error) {
            console.error("MyRealSurveysApp: CRITICAL ERROR in initThreeJSBackground:", error);
            this.disposeThreeJS();
            if (this.elements.particleCanvas) this.elements.particleCanvas.style.display = 'none';
        }
    },

    disposeThreeJS: function() { /* ... (keep as is) ... */ 
        console.warn("MyRealSurveysApp: Disposing Three.js resources...");
        if (this.threeJS.animationFrameId) cancelAnimationFrame(this.threeJS.animationFrameId);
        if (this.threeJS.renderer) { this.threeJS.renderer.dispose(); this.threeJS.renderer = null; }
        if (this.threeJS.scene) {
            this.threeJS.scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
                    else object.material.dispose();
                }
            });
            this.threeJS.scene = null;
        }
        this.threeJS.camera = null; this.threeJS.particles = null; this.state.isThreeJsInitialized = false;
    },

    initScrollEffects: function() { /* ... (keep as is, it's fairly safe) ... */ 
        if (!this.elements.nav) return;
        const handleScroll = () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > this.config.stickyNavOffset) this.elements.nav.classList.add('scrolled');
            else this.elements.nav.classList.remove('scrolled');
            this.state.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        };
        window.addEventListener('scroll', debounce(handleScroll, 15), { passive: true });
        console.log("MyRealSurveysApp: Basic scroll effects initialized.");
    },

    triggerEntranceAnimations: function() {
        console.log("MyRealSurveysApp: Attempting to triggerEntranceAnimations.");
        if (!this.state.isGsapInitialized) {
            console.warn("MyRealSurveysApp: GSAP not ready for entrance animations.");
            return;
        }
        if (!this.state.preloaderHidden) {
            console.warn("MyRealSurveysApp: Preloader not hidden yet, deferring entrance animations.");
            return; // Don't run if preloader isn't confirmed hidden
        }
        console.log("MyRealSurveysApp: GSAP ready, preloader hidden. Triggering entrance animations NOW.");
        try {
            const tlHeader = gsap.timeline({ delay: 0.1 });
            if (this.elements.logo) {
                tlHeader.from(this.elements.logo, {
                    duration: 1.2, y: -60, opacity: 0, scale: 0.8, ease: 'elastic.out(1, 0.6)',
                });
            }
            if (this.elements.headerMainContent) {
                tlHeader.from(this.elements.headerMainContent.querySelectorAll('.site-title, .site-tagline'), {
                    duration: 0.8, y: 30, opacity: 0, stagger: 0.2, ease: 'power3.out',
                }, "-=0.8");
            }
        } catch(error) {
            console.error("MyRealSurveysApp: Error in triggerEntranceAnimations:", error);
        }
    },

    initScrollAnimations: function() {
        console.log("MyRealSurveysApp: Attempting to initScrollAnimations.");
        if (!this.state.isGsapInitialized || !this.elements.animatedScrollElements) {
            console.warn("MyRealSurveysApp: GSAP or scroll elements not ready for scroll animations.");
            return;
        }
        console.log(`MyRealSurveysApp: Initializing scroll animations for ${this.elements.animatedScrollElements.length} elements.`);
        try {
            this.elements.animatedScrollElements.forEach(el => {
                const delay = parseFloat(el.dataset.delay) || 0;
                gsap.from(el, {
                    scrollTrigger: {
                        trigger: el, start: `top bottom-=${100 + (delay * 50)}px`,
                        toggleActions: "play none none none", once: true,
                    },
                    opacity: 0, y: 50, scale: 0.95, duration: 0.8, delay: delay, ease: 'power3.out',
                });
            });
        } catch(error) {
            console.error("MyRealSurveysApp: Error in initScrollAnimations:", error);
        }
    }
};

// Store DOMContentLoaded time for preloader logic
MyRealSurveysApp.domContentLoadedTime = Date.now(); 

// Run the App initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing MyRealSurveysApp.");
    MyRealSurveysApp.domContentLoadedTime = Date.now(); // Update with more accurate time
    try {
        MyRealSurveysApp.init();
    } catch (error) {
        console.error("MyRealSurveysApp: CRITICAL ERROR during init on DOMContentLoaded:", error);
        // Fallback: try to ensure preloader is hidden if a catastrophic error occurs in init
        const preloader = document.getElementById('quantum-preloader');
        if (preloader) {
            preloader.setAttribute('aria-busy', 'false');
            setTimeout(() => { preloader.style.display = 'none'; }, 500);
            console.warn("MyRealSurveysApp: Forcibly hid preloader due to critical init error.");
        }
    }
});

console.log("MyRealSurveysApp (index_mobile.js): Script parsing completed.");
