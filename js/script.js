// Smooth scrolling function
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add scroll effect to navbar
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
    }
});

// Hover effects to cards
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Ripple effect for buttons
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add CSS for ripple animation (injected)
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
`;
document.head.appendChild(style);

/* ===== Accordion (Collapsible Features) ===== */
document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.accordion-button');

    function closePanel(panel) {
        panel.classList.remove('open');
        panel.style.maxHeight = '0px';
    }

    function openPanel(panel) {
        panel.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
    }

    // Initialize all panels as closed
    buttons.forEach(btn => {
        const panelId = btn.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (panel) {
            closePanel(panel);
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    // Toggle behavior
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            const panelId = btn.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (!panel) return;

            if (expanded) {
                btn.setAttribute('aria-expanded', 'false');
                closePanel(panel);
            } else {
                btn.setAttribute('aria-expanded', 'true');
                openPanel(panel);
            }
        });

        // Keyboard accessibility (Enter/Space)
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Recalculate heights on window resize (for responsive content)
    window.addEventListener('resize', () => {
        document.querySelectorAll('.accordion-button[aria-expanded="true"]').forEach(btn => {
            const panel = document.getElementById(btn.getAttribute('aria-controls'));
            if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
        });
    });
});
