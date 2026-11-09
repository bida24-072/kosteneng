// Simple fade-in on load
document.addEventListener("DOMContentLoaded", () => {
    const heroContent = document.querySelector('.hero-content');
    const header = document.querySelector('header');
    
    // Set initial state
    heroContent.style.opacity = 0;
    heroContent.style.transform = 'translateY(20px)';
    heroContent.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
    
    header.style.opacity = 0;
    header.style.transition = 'opacity 1s ease';

    // Trigger animation after a tiny delay
    setTimeout(() => {
        heroContent.style.opacity = 1;
        heroContent.style.transform = 'translateY(0)';
        header.style.opacity = 1;
    }, 100);
});
