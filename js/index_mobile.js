// js/index_mobile.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Initialize Animate On Scroll (AOS) Library ---
    // This is what makes the content fade in as you scroll.
    AOS.init({
        duration: 800, // Animation duration in milliseconds
        easing: 'ease-in-out', // Animation timing function
        once: true, // Whether animation should happen only once
        disable: 'phone' // Optionally disable on smaller screens if needed
    });

    // --- Navigation Menu Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // --- Navigation and Call to Action Buttons ---
    // This handles all buttons with a 'data-href' attribute.
    document.querySelectorAll('[data-href]').forEach(button => {
        const targetHref = button.dataset.href;
        if (targetHref) {
            button.addEventListener('click', () => {
                window.location.href = targetHref;
            });
        }
    });

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            
            // Check if the body has the 'light-mode' class and update the icon
            if (document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

});