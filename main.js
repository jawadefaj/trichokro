// Core Application Logic for TriChokro Website
// Contains Loader, Animation Observers, Speedometer, AI Widget, and general UI interactions.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Initialize Loader Logic
    const percentEl = document.getElementById('load-percent');
    const percentReflectEl = document.getElementById('load-percent-reflection');
    const statusEl = document.getElementById('load-status');
    const loader = document.getElementById('loader');
    const body = document.body;

    if (loader) {
        let progress = 0;
        // Default messages, pages can override this if they have specific inline script, 
        // but this provides a fallback safe universal behavior.
        const statusMessages = ["SYSTEM CHECK", "INITIALIZING", "LOADING ASSETS", "CONNECTING", "READY"];
        
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 6) + 3;
            if (progress > 100) progress = 100;
            
            const display = progress < 10 ? `0${progress}` : `${progress}`;
            if (percentEl) percentEl.innerText = display;
            if (percentReflectEl) percentReflectEl.innerText = display;
            
            const msgIndex = Math.min(Math.floor(progress / 20), 4);
            if (statusEl) statusEl.innerText = statusMessages[msgIndex];
            
            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => { 
                    loader.style.opacity = '0'; 
                    loader.style.pointerEvents = 'none'; 
                    body.classList.remove('loading'); 
                }, 500);
            }
        }, 30);
    }

    // 3. Floating Emojis
    const emojiContainer = document.getElementById('emoji-container');
    if (emojiContainer) {
        const emojis = ['🌱', '🔋', '⚡', '♻️', '🌞', '🍃', '🌦️', '🚲', '🌎', '💡', '🤖', '💻', '🔌', '⚙️', '🛠️', '🚗', '🔧', '⚡', '🔋', '🌱'];
        const maxEmojis = 40;
        let currentEmojis = 0;

        function createEmoji() {
            if (currentEmojis >= maxEmojis) return;
            const emoji = document.createElement('div');
            emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.classList.add('floating-emoji');
            emoji.style.left = `${Math.random() * 100}vw`;
            emoji.style.animationDuration = `${Math.random() * 10 + 10}s`;
            emoji.style.fontSize = `${Math.random() * 20 + 15}px`;
            emojiContainer.appendChild(emoji);
            currentEmojis++;
            emoji.addEventListener('animationend', () => { emoji.remove(); currentEmojis--; });
        }
        setInterval(createEmoji, 1200);
        for(let i=0; i<8; i++) setTimeout(createEmoji, i * 400);
    }

    // 4. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) { 
                navbar.classList.add('bg-slate-900/90', 'backdrop-blur-md', 'shadow-lg', 'py-3'); 
                navbar.classList.remove('py-5', 'bg-transparent'); 
            } else { 
                navbar.classList.remove('bg-slate-900/90', 'backdrop-blur-md', 'shadow-lg', 'py-3'); 
                navbar.classList.add('py-5', 'bg-transparent'); 
            }
        });
    }

    // 5. Mobile Menu Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        let isMenuOpen = false;
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) { 
                mobileMenu.classList.remove('max-h-0', 'opacity-0'); 
                mobileMenu.classList.add('max-h-96', 'opacity-100'); 
            } else { 
                mobileMenu.classList.add('max-h-0', 'opacity-0'); 
                mobileMenu.classList.remove('max-h-96', 'opacity-100'); 
            }
        });
    }

    // 6. Scroll Animations (IntersectionObserver)
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal-on-scroll').forEach(el => { observer.observe(el); });

    // 7. Hero Mouse Parallax (Hero Content)
    const heroContent = document.getElementById('hero-content');
    const heroGrid = document.getElementById('hero-grid');
    const blob1 = document.getElementById('blob-1');
    const blob2 = document.getElementById('blob-2');
    
    if (heroContent || heroGrid) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            if(heroContent) heroContent.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            if(heroGrid) heroGrid.style.transform = `translate(${x * -0.5}px, ${y * -0.5}px) perspective(1000px) rotateX(10deg)`;
            if(blob1) blob1.style.transform = `translate(${x * -1}px, ${y * -1}px)`;
            if(blob2) blob2.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    // 8. 3D Tilt Cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'; });
        });
    }

    // 9. Speedometer Transition Logic
    const speedOverlay = document.getElementById('speed-overlay');
    const speedCounter = document.getElementById('speed-counter');
    let speedInterval;
    
    window.triggerCarLoading = function() {
        if (!speedOverlay || !speedCounter) return;
        speedOverlay.classList.add('active');
        let speed = 0;
        clearInterval(speedInterval);
        speedInterval = setInterval(() => {
            if(speed < 60) speed += 5; else if(speed < 90) speed += 4; else speed += 2;
            if(speed >= 100) {
                speed = 100;
                speedCounter.innerText = speed;
                clearInterval(speedInterval);
                setTimeout(() => { speedOverlay.classList.remove('active'); }, 200);
            } else { speedCounter.innerText = speed; }
        }, 10);
    };
    
    // Attach trigger to elements
    const triggerElements = document.querySelectorAll('.transition-trigger');
    triggerElements.forEach(el => { 
        el.addEventListener('click', (e) => { 
            const href = el.getAttribute('href');
            if (href && !href.startsWith('#')) {
                e.preventDefault();
                window.triggerCarLoading();
                setTimeout(() => {
                    window.location.href = href;
                }, 800);
            }
        }); 
    });

    // 10. AI Widget Interaction
    const aiFab = document.getElementById('ai-fab');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    
    if (aiFab && aiChatWindow && closeChatBtn) {
        let isChatOpen = false;
        aiFab.addEventListener('click', () => { 
            isChatOpen = !isChatOpen; 
            if (isChatOpen) { aiChatWindow.classList.add('open'); } else { aiChatWindow.classList.remove('open'); } 
        });
        closeChatBtn.addEventListener('click', () => { 
            isChatOpen = false; 
            aiChatWindow.classList.remove('open'); 
        });
    }
    
    // 11. Chat Logic
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatForm && chatInput && chatMessages) {
        const apiKey = ""; // API Key
        
        window.getGeminiResponse = async function(userText) {
            if (!apiKey) { 
                addMessage("⚠️ Pilot Offline: Please add a valid Google Gemini API Key in the source code.", 'ai'); 
                return; 
            }
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chat-message ai flex gap-1 items-center';
            loadingDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }], systemInstruction: { parts: [{ text: `You are the "TriChokro AI Pilot", an intelligent assistant for a Bangladeshi Electric Vehicle company. Your Capabilities: 1. Trip Planning (120km range). 2. Mechanic/Diagnostics. 3. Product Specs. Tone: Professional, Helpful, Futuristic. Use emojis.` }] } })
                });
                const data = await response.json();
                chatMessages.removeChild(loadingDiv);
                if (data.candidates && data.candidates[0].content) {
                    const aiText = data.candidates[0].content.parts[0].text;
                    const formattedText = (typeof marked !== 'undefined') ? marked.parse(aiText) : aiText;
                    addMessage(formattedText, 'ai');
                } else { addMessage("I'm having trouble connecting to the satellite. Try again? 📡", 'ai'); }
            } catch (error) { 
                if(loadingDiv.parentNode) chatMessages.removeChild(loadingDiv); 
                addMessage("System Offline. Please check your connection. ⚠️", 'ai'); 
                console.error(error); 
            }
        };

        window.addMessage = function(text, sender) {
            const div = document.createElement('div');
            div.className = `chat-message ${sender}`;
            if (sender === 'ai') { div.innerHTML = text; } else { div.textContent = text; }
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            window.addMessage(text, 'user');
            chatInput.value = '';
            window.getGeminiResponse(text);
        });
    }

    // 12. Cursor Gradient
    const gradient = document.getElementById("cursor-gradient");
    if (gradient) {
        document.addEventListener("mousemove", e => { 
            gradient.style.setProperty("--x", e.clientX + "px"); 
            gradient.style.setProperty("--y", e.clientY + "px"); 
        });
    }

    // 13. Back to Top
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
            }
        });
    }
    
    // 14. Scroll to Bottom
    const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    if (scrollToBottomBtn) {
        window.addEventListener('scroll', () => {
            const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100);
            if (!isAtBottom && window.scrollY > 300) {
                scrollToBottomBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
            } else {
                scrollToBottomBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
            }
        });
    }

    // 15. Scroll Progress Bar
    function updateScrollProgress() {
        const scrollProgress = document.getElementById('scroll-progress-bar');
        const scrollIcon = document.getElementById('scroll-icon');
        if (!scrollProgress) return;
        
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;
        
        const easedPercent = scrollPercent < 0.5 
            ? 2 * scrollPercent * scrollPercent 
            : -1 + (4 - 2 * scrollPercent) * scrollPercent;
        
        scrollProgress.style.transform = `scaleY(${easedPercent})`;
        
        if (scrollPercent > 0 && scrollPercent < 1) {
            scrollProgress.classList.add('active');
        } else if (scrollPercent >= 1) {
            scrollProgress.classList.remove('active');
        }
        
        if(scrollIcon) {
            scrollIcon.style.opacity = Math.max(0.15, 0.3 + (scrollPercent * 0.2));
        }
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // 16. Tab Switching Logic (Depends on window.tabsData being defined in HTML)
    // Initialize default tab (0) if tabs exist
    if (document.getElementById('tab-content')) {
         window.switchTab = function(index) {
            if (!window.tabsData || !window.tabsData[index]) return;
            
            const btns = document.querySelectorAll('.tab-btn');
            const contentDiv = document.getElementById('tab-content');
            
            btns.forEach((btn, i) => {
                if (i === index) { 
                    btn.className = "tab-btn w-full text-left px-6 py-4 rounded-xl transition-all duration-300 font-medium bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 interactive uplift-on-hover"; 
                } else { 
                    btn.className = "tab-btn w-full text-left px-6 py-4 rounded-xl transition-all duration-300 font-medium bg-transparent text-slate-400 hover:bg-slate-800 interactive uplift-on-hover"; 
                }
            });
            
            const data = window.tabsData[index];
            if (index === 3 && window.tabsData.length > 3 && data.quote) { // Mission (Index 3 usually) - Special Layout check
                 contentDiv.innerHTML = `<div class="animate-fade-in-up"><h3 class="text-2xl font-bold text-white mb-4">${data.title}</h3>
                <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1472&auto=format&fit=crop" alt="Green Mobility" class="w-full h-48 object-cover rounded-xl mb-6 shadow-lg shadow-emerald-500/10">
                <p class="text-slate-400 leading-relaxed mb-6">${data.text}</p><div class="p-6 bg-slate-800/50 border-l-4 border-emerald-500 rounded-r-xl"><p class="text-emerald-100 italic">"${data.quote}"</p></div></div>`; 
            } else {
                 contentDiv.innerHTML = data.html || `<div class="animate-fade-in-up"><h3 class="text-2xl font-bold text-white mb-4">${data.title}</h3><p class="text-slate-400">${data.text || ''}</p></div>`;
            }
        };
        
        // Initialize
        if (typeof window.switchTab === 'function') {
            window.switchTab(0);
        }
    }
});
