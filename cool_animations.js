document.addEventListener('DOMContentLoaded', () => {
    // 1. Particle Network Animation
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray = [];
        const numberOfParticles = 80; // Reduced count for performance

        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around screen
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = 'rgba(100, 255, 218, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();

                // Connect particles
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 255, 218, ${1 - distance / 120})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        init();
        animate();
    }

    // 2. Animated Counters
    const counters = document.querySelectorAll('.counter');
    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = Math.max(1, Math.ceil(target / 100)); // Ensure increment is at least 1

                if (count < target) {
                    counter.innerText = count + inc;
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    // Observer for counters
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.disconnect(); // Run once (assuming all counters are in the same section)
            }
        });
    });

    if (counters.length > 0) {
        counterObserver.observe(counters[0]); 
    }

    // 3. Glitch Effect Logic (applied via CSS class, toggle on hover)
    const glitchElement = document.querySelector('.type-me');
    if (glitchElement) {
        glitchElement.addEventListener('mouseover', () => {
            glitchElement.classList.add('glitch-active');
        });
        glitchElement.addEventListener('mouseout', () => {
            glitchElement.classList.remove('glitch-active');
        });
    }

    // 4. Magnetic Buttons (Light version)
    const buttons = document.querySelectorAll('.magnetic-btn');
    if (!window.matchMedia("(pointer: coarse)").matches) { // Disable on touch devices
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                // Use translate property to avoid conflict with Tailwind transform classes
                btn.style.translate = `${x * 0.2}px ${y * 0.2}px`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.translate = '0px 0px';
            });
        });
    }
});
