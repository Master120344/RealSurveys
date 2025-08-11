/* ===================================================================
   MyRealSurveys :: index_mobile.js
   Version: 2.0 (Next-Level Redesign)
   Description: Powers all interactivity and advanced animations.
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Function to handle navigation menu toggling.
     */
    const setupNavigation = () => {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevents the click from closing the menu immediately
                navMenu.classList.toggle('active');
            });
        }
    };

    /**
     * Function to handle all navigation and CTA button clicks.
     * Looks for a 'data-href' attribute and redirects the user.
     */
    const setupLinkButtons = () => {
        document.querySelectorAll('[data-href]').forEach(button => {
            const targetHref = button.dataset.href;
            if (targetHref) {
                button.addEventListener('click', () => {
                    window.location.href = targetHref;
                });
            }
        });
    };

    /**
     * Function to handle the light/dark theme toggle.
     */
    const setupThemeToggle = () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // This is a placeholder for future theme logic.
                // For now, it just provides the visual effect.
                const icon = themeToggle.querySelector('i');
                if (icon.classList.contains('fa-moon')) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
                // In a full implementation, you would add:
                // document.body.classList.toggle('light-mode');
                // localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
            });
        }
    };

    /**
     * Advanced scroll animation setup using Intersection Observer.
     * This is far more performant than listening to the 'scroll' event.
     * It adds a 'is-visible' class to elements when they enter the viewport.
     */
    const setupScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('.animated-element');
        
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the element is in view
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Stop observing the element once it's visible to save resources
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        // Start observing each animated element
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    };
    
    /**
     * Initializes all necessary functions once the DOM is loaded.
     */
    const initializePage = () => {
        setupNavigation();
        setupLinkButtons();
        setupThemeToggle();
        setupScrollAnimations();
    };

    // Run the initialization
    initializePage();

});