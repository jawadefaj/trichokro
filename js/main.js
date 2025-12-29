lucide.createIcons();
document.addEventListener('DOMContentLoaded', () => {
    const percentEl = document.getElementById('load-percent');
    const percentReflectEl = document.getElementById('load-percent-reflection');
    const statusEl = document.getElementById('load-status');
    const loader = document.getElementById('loader');
    const body = document.body;
    let progress = 0;
    const statusMessages = ["CALIBRATING HYDRAULICS", "CONNECTING POWER GRID", "OPTIMIZING BATTERY", "LOADING ASSETS", "SYSTEM READY"];
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 1;
        if (progress > 100) progress = 100;
        const display = progress < 10 ? `0${progress}` : `${progress}`;
        percentEl.innerText = display;
        percentReflectEl.innerText = display;
        const msgIndex = Math.min(Math.floor(progress / 20), 4);
        statusEl.innerText = statusMessages[msgIndex];
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => { loader.style.opacity = '0'; loader.style.pointerEvents = 'none'; body.classList.remove('loading'); }, 500);
        }
    }, 30);
    startFloatingEmojis();

    // Initialize default tab (TEAM)
    switchTab(0);
});

function startFloatingEmojis() {
    const container = document.getElementById('emoji-container');
    const emojis = ['🌱', '🔋', '⚡', '♻️', '🌞', '🍃', '🌦️', '🚲', '🌎', '💡'];
    const maxEmojis = 20;
    let currentEmojis = 0;
    function createEmoji() {
        if (currentEmojis >= maxEmojis) return;
        const emoji = document.createElement('div');
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.classList.add('floating-emoji');
        emoji.style.left = `${Math.random() * 100}vw`;
        emoji.style.animationDuration = `${Math.random() * 10 + 10}s`;
        emoji.style.fontSize = `${Math.random() * 20 + 15}px`;
        container.appendChild(emoji);
        currentEmojis++;
        emoji.addEventListener('animationend', () => { emoji.remove(); currentEmojis--; });
    }
    setInterval(createEmoji, 1200);
    for(let i=0; i<8; i++) setTimeout(createEmoji, i * 400);
}

const speedOverlay = document.getElementById('speed-overlay');
const speedCounter = document.getElementById('speed-counter');
let speedInterval;
function triggerCarLoading() {
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
}

const triggerElements = document.querySelectorAll('.transition-trigger');
triggerElements.forEach(el => {
    el.addEventListener('click', (e) => {
        const href = el.getAttribute('href');
        if (href && !href.startsWith('#')) {
            e.preventDefault();
            triggerCarLoading();
            setTimeout(() => {
                window.location.href = href;
            }, 800);
        }
    });
});

const aiFab = document.getElementById('ai-fab');
const aiChatWindow = document.getElementById('ai-chat-window');
const closeChatBtn = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
let isChatOpen = false;
aiFab.addEventListener('click', () => { isChatOpen = !isChatOpen; if (isChatOpen) { aiChatWindow.classList.add('open'); } else { aiChatWindow.classList.remove('open'); } });
closeChatBtn.addEventListener('click', () => { isChatOpen = false; aiChatWindow.classList.remove('open'); });

const apiKey = "";
async function getGeminiResponse(userText) {
    if (!apiKey) { addMessage("⚠️ Pilot Offline: Please add a valid Google Gemini API Key in the source code.", 'ai'); return; }
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
            const formattedText = marked.parse(aiText);
            addMessage(formattedText, 'ai');
        } else { addMessage("I'm having trouble connecting to the satellite. Try again? 📡", 'ai'); }
    } catch (error) { chatMessages.removeChild(loadingDiv); addMessage("System Offline. Please check your connection. ⚠️", 'ai'); console.error(error); }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    if (sender === 'ai') { div.innerHTML = text; } else { div.textContent = text; }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatInput.value = '';
    getGeminiResponse(text);
});

// Updated Tabs Data: TEAM IS FIRST (INDEX 0)
const tabsData = [
    {
        title: "Meet the Innovators",
        html:
`<div class="animate-fade-in-up">
    <h3 class="text-2xl font-bold text-white mb-8 border-b border-slate-700 pb-2">Meet the Innovators</h3>

 <div class="grid grid-cols-2 md:grid-cols-3 gap-6">

    <a href="javascript:void(0)" onclick="showContactCard('rownak')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="src/assets/founders/rownak.jpg" onerror="this.src='https://ui-avatars.com/api/?name=Rownak+Shahriar+Ruhan&background=10b981&color=fff&size=128'" alt="Rownak Shahriar Ruhan">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Rownak Shahriar Ruhan</h4>
        <p class="text-emerald-400 text-xs">Founder</p>
    </a>

    <a href="javascript:void(0)" onclick="showContactCard('tomal')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Tomal+Kirtonia&background=10b981&color=fff&size=128" alt="Tomal Kirtonia">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Tomal Kirtonia</h4>
        <p class="text-emerald-400 text-xs">Head of Design</p>
    </a>

    <a href="javascript:void(0)" onclick="showContactCard('hasan')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Omor+Faruk+Hasan&background=10b981&color=fff&size=128" alt="Omor Faruk Hasan">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Omor Faruk Hasan</h4>
        <p class="text-emerald-400 text-xs">COO</p>
    </a>

    <a href="javascript:void(0)" onclick="showContactCard('mijanur')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Mijanur+Rahman&background=10b981&color=fff&size=128" alt="Mijanur Rahman">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Mijanur Rahman</h4>
        <p class="text-emerald-400 text-xs">HR</p>
    </a>

    <a href="javascript:void(0)" onclick="showContactCard('shwadhin')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Dipto+Muzumder+Swadhin&background=10b981&color=fff&size=128" alt="Dipto Muzumder Swadhin">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Dipto Muzumder Swadhin</h4>
        <p class="text-emerald-400 text-xs">COO</p>
    </a>

    <a href="javascript:void(0)" onclick="showContactCard('tahsif')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Tawhidul+Islam+Tahsif&background=10b981&color=fff&size=128" alt="Tawhidul Islam Tahsif">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Tawhidul Islam Tahsif</h4>
        <p class="text-emerald-400 text-xs">Lead Designer</p>
    </a>
</div>`
   },

    {
        title: "Our Expert Counsel",
        html:
            `
            <div class="animate-fade-in-up">
            <h3 class="text-2xl font-bold text-white mb-8 border-b border-slate-700 pb-2">Our Expert Counsel</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6">

    <a href="javascript:void(0)" onclick="showContactCard('ehsanSir')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Dr+Md+Ehsan&background=10b981&color=fff&size=128" alt="Dr. Md. Ehsan">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Dr. Md. Ehsan</h4>
        <p class="text-emerald-400 text-xs">Advisor & Mentor</p>
    </a>

    <a href="javascript:void(0)" onclick="showContactCard('abdul')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Abdul+Jawad&background=10b981&color=fff&size=128" alt="Abdul Jawad">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Abdul Jawad</h4>
        <p class="text-emerald-400 text-xs">Vehicle Advisor</p>
    </a>

    <a href="javascript:void(0)" onclick="showContactCard('ishraq')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
        <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
            <img src="https://ui-avatars.com/api/?name=Ishraq+Rafid&background=10b981&color=fff&size=128" alt="Ishraq Rafid">
        </div>
        <h4 class="text-white font-bold text-sm leading-tight mb-1">Ishraq Rafid</h4>
        <p class="text-emerald-400 text-xs">Architectural Advisor</p>
    </a>
    </div>
</div>`
        },
   {
        title: "Junior Associates",
        html:
`<div class="animate-fade-in-up">
    <h3 class="text-2xl font-bold text-white mb-8 border-b border-slate-700 pb-2">Junior Associates</h3>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <a href="javascript:void(0)" onclick="showContactCard('maxud')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
            <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
                <img src="https://ui-avatars.com/api/?name=Maxudur+Rahman+Chowdhury&background=10b981&color=fff&size=128" alt="Maxudur Rahman Chowdhury">
            </div>
            <h4 class="text-white font-bold text-sm leading-tight mb-1">Maxudur Rahman Chowdhury</h4>
            <p class="text-emerald-400 text-xs">Head of Communications</p>
        </a>

        <a href="javascript:void(0)" onclick="showContactCard('rakibul')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
            <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
                <img src="https://ui-avatars.com/api/?name=Rakibul+Hasan+Shanto&background=10b981&color=fff&size=128" alt="Rakibul Hasan Shanto">
            </div>
            <h4 class="text-white font-bold text-sm leading-tight mb-1">Rakibul Hasan Shanto</h4>
            <p class="text-emerald-400 text-xs">Manufacturing Executive</p>
        </a>

        <a href="javascript:void(0)" onclick="showContactCard('farhan')" class="text-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors group cursor-pointer interactive uplift-on-hover block">
            <div class="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden group-hover:ring-4 ring-emerald-400 transition-all duration-300 transform group-hover:rotate-6">
                <img src="https://ui-avatars.com/api/?name=Farhan+Saddique&background=10b981&color=fff&size=128" alt="Farhan Saddique">
            </div>
            <h4 class="text-white font-bold text-sm leading-tight mb-1">Farhan Saddique</h4>
            <p class="text-emerald-400 text-xs">Junior Associate</p>
            <p class="text-slate-500 text-[10px] mt-1">BUET BME '23</p>
        </a>
    </div>
</div>`
   },
            { title: "Cleaner Mobility for Everyone", text: "Accelerate Bangladesh’s shift to clean urban mobility by delivering durable, efficient three-wheelers that raise driver income and reduce city pollution. We design for real streets, real loads, and real economics.", quote: "We obsess over practical details — from frame geometry to charging routines." },
            { title: "From Prototype to Production", html: `<div class="animate-fade-in-up"><h3 class="text-2xl font-bold text-white mb-4">From Prototype to Production</h3><ul class="space-y-6 border-l border-slate-700 ml-2 pl-6"><li class="relative"><span class="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900 animate-pulse"></span><span class="text-emerald-400 font-bold text-sm block mb-1">2022</span><p class="text-slate-400 text-sm">Began with a simple idea: lighter, safer three-wheelers.</p></li><li class="relative"><span class="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-600 ring-4 ring-slate-900"></span><span class="text-white font-bold text-sm block mb-1">2023</span><p class="text-slate-400 text-sm">Piloted first fleet, iterating on chassis and suspension.</p></li><li class="relative"><span class="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-600 ring-4 ring-slate-900"></span><span class="text-white font-bold text-sm block mb-1">2024</span><p class="text-slate-400 text-sm">Production-ready platform with angular composite panels.</p></li><li class="relative"><span class="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-600 ring-4 ring-slate-900"></span><span class="text-white font-bold text-sm block mb-1">Today</span><p class="text-slate-400 text-sm">TriChokro vehicles carry passengers across cities daily.</p></li></ul></div>` },

        {
        title: "Achievements",
        html: `
            <div class="animate-fade-in-up">
                <h3 class="text-2xl font-bold text-white mb-4">Achievements</h3>
                <ul class="space-y-8 border-l border-slate-700 ml-2 pl-6">
                    <li class="relative">
                        <span class="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900 animate-pulse"></span>
                        <span class="text-emerald-400 font-bold text-sm block mb-1">Nov 2025</span>
                        <h4 class="text-lg font-semibold text-white mb-1">National Champion | SofE</h4>
                        <p class="text-slate-400 text-xs italic mb-2">Speak Out for Engineers (IMechE)</p>
                        <p class="text-slate-300 text-sm mb-2">
                            <b>Project Trambulance:</b> Innovated an efficiently designed, affordable Tri-wheeled Battery-Powered Ambulance.
                        </p>
                        <ul class="list-disc list-inside text-slate-500 text-sm space-y-0.5">
                            <li>Conducted 3D design in SolidWorks/SketchUp with Aerodynamic and Load Simulations in Ansys.</li>
                            <li>Innovative Chassis and Aerodynamic Origami inspired Hood System earned appreciation.</li>
                        </ul>
                    </li>
                    <li class="relative">
                        <span class="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-600 ring-4 ring-slate-900"></span>
                        <span class="text-white font-bold text-sm block mb-1">July 2025</span>
                        <h4 class="text-lg font-semibold text-white mb-1">BUET Champion | UIHP</h4>
                        <p class="text-slate-400 text-xs italic mb-2">University Innovation Hub Program (ICT Division)</p>
                        <p class="text-slate-300 text-sm mb-2">
                            <b>Project TriChokro:</b> Developed an improved and affordable Auto-Rickshaw Model.
                        </p>
                        <ul class="list-disc list-inside text-slate-500 text-sm space-y-0.5">
                            <li>Prototype built; mass production deal in progress with Panna Group.</li>
                            <li>Secured funding from BUET Alumni and Investors.</li>
                        </ul>
                    </li>
                </ul>
            </div>
        `
        }
        ];

        function switchTab(index) {
            const btns = document.querySelectorAll('.tab-btn');
            const contentDiv = document.getElementById('tab-content');
            btns.forEach((btn, i) => {
                if (i === index) { btn.className = "tab-btn w-full text-left px-6 py-4 rounded-xl transition-all duration-300 font-medium bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 interactive uplift-on-hover"; }
                else { btn.className = "tab-btn w-full text-left px-6 py-4 rounded-xl transition-all duration-300 font-medium bg-transparent text-slate-400 hover:bg-slate-800 interactive uplift-on-hover"; }
            });
            if (index === 3) { // Mission (Index 3 now)
                contentDiv.innerHTML = `<div class="animate-fade-in-up"><h3 class="text-2xl font-bold text-white mb-4">${tabsData[3].title}</h3>
                <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1472&auto=format&fit=crop" alt="Green Mobility" class="w-full h-48 object-cover rounded-xl mb-6 shadow-lg shadow-emerald-500/10">
                <p class="text-slate-400 leading-relaxed mb-6">${tabsData[3].text}</p><div class="p-6 bg-slate-800/50 border-l-4 border-emerald-500 rounded-r-xl"><p class="text-emerald-100 italic">"${tabsData[3].quote}"</p></div></div>`;
            }
            else { contentDiv.innerHTML = tabsData[index].html; }
        }

        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) { navbar.classList.add('bg-slate-900/90', 'backdrop-blur-md', 'shadow-lg', 'py-3'); navbar.classList.remove('py-5', 'bg-transparent'); }
            else { navbar.classList.remove('bg-slate-900/90', 'backdrop-blur-md', 'shadow-lg', 'py-3'); navbar.classList.add('py-5', 'bg-transparent'); }
        });

        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        let isMenuOpen = false;
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) { mobileMenu.classList.remove('max-h-0', 'opacity-0'); mobileMenu.classList.add('max-h-96', 'opacity-100'); }
            else { mobileMenu.classList.add('max-h-0', 'opacity-0'); mobileMenu.classList.remove('max-h-96', 'opacity-100'); }
        });

        const heroContent = document.getElementById('hero-content');
        const heroGrid = document.getElementById('hero-grid');
        const blob1 = document.getElementById('blob-1');
        const blob2 = document.getElementById('blob-2');
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            if(heroContent) heroContent.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            if(heroGrid) heroGrid.style.transform = `translate(${x * -0.5}px, ${y * -0.5}px) perspective(1000px) rotateX(10deg)`;
            if(blob1) blob1.style.transform = `translate(${x * -1}px, ${y * -1}px)`;
            if(blob2) blob2.style.transform = `translate(${x}px, ${y}px)`;
        });

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


        // Contact Card Modal
        // Logic handled by HTML structure and showContactCard function



        // Back to top visibility
        const backToTopBtn = document.getElementById('back-to-top');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
            }
        });

        document.addEventListener("mousemove", e => {
            const gradient = document.getElementById("cursor-gradient");
            if(gradient) {
                gradient.style.setProperty("--x", e.clientX + "px");
                gradient.style.setProperty("--y", e.clientY + "px");
            }
        });

        // FOUNDER PAGE ANIMATIONS
        function initFounderAnimations() {
            gsap.registerPlugin(ScrollTrigger);
            gsap.utils.toArray('.gs-reveal').forEach(elem => {
                gsap.from(elem, {
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });
        }

        // PARTICLE CANVAS LOGIC FOR FOUNDER PAGE
        function initParticleCanvas() {
            const canvas = document.getElementById('neural-canvas');
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            let width, height;
            let particles = [];

            const particleCount = 40;
            const connectionDistance = 200;
            const mouseDistance = 250;

            function resize() {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resize);
            resize();

            class Particle {
                constructor() {
                    this.x = Math.random() * width;
                    this.y = Math.random() * height;
                    this.vx = (Math.random() - 0.5) * 0.2;
                    this.vy = (Math.random() - 0.5) * 0.2;
                    this.size = Math.random() * 1.5 + 0.5;
                }

                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;
                }

                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = '#aa8c2c';
                    ctx.fill();
                }
            }

            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }

            let mouse = { x: null, y: null };
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.x;
                mouse.y = e.y;
            });

            function animate() {
                ctx.clearRect(0, 0, width, height);
                particles.forEach((p, index) => {
                    p.update();
                    p.draw();
                    for (let j = index; j < particles.length; j++) {
                        const p2 = particles[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < connectionDistance) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(170, 140, 44, ${0.15 * (1 - distance / connectionDistance)})`;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                    if (mouse.x != null) {
                        const dx = p.x - mouse.x;
                        const dy = p.y - mouse.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < mouseDistance) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(45, 212, 191, ${0.1 * (1 - distance / mouseDistance)})`;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(mouse.x, mouse.y);
                            ctx.stroke();
                        }
                    }
                });
                requestAnimationFrame(animate);
            }
            animate();
        }

        document.addEventListener('DOMContentLoaded', () => {
             initFounderAnimations();
             initParticleCanvas();
        });

        // Contact Card Logic
        const teamData = {
            rownak: {
                initials: "A A M",
                name: "Rownak Shahriar Ruhan",
                title: "Founder & CEO",
                phone1: "+880 1714 844677",
                phone2: "+880 1402 667477",
                email1: "rownakshahriarruhan@gmail.com",
                email2: "2010105@me.buet.ac.bd"
            },
            abdul: {
                initials: "A J",
                name: "Abdul Jawad",
                title: "Vehicle Adviser",
                email1: "abdul.jawad@gmail.com",
                email2: "N/A"
            },
            ishraq: {
                initials: "I R",
                name: "Ishraq Rafid",
                title: "Architectural Adviser",
                phone1: "+880 1700 000002",
                phone2: "+880 1400 000002",
                email1: "ishraq.rafid@gmail.com",
                email2: "N/A"
            },
            hasan: {
                initials: "H M",
                name: "Hasan Mahmud",
                title: "Chief Operation Officer",
                phone1: "+880 1700 000003",
                phone2: "+880 1400 000003",
                email1: "hasan.mahmud@gmail.com",
                email2: "2010108@me.buet.ac.bd"
            },
            mijanur: {
                initials: "M R",
                name: "Mijanur Rahman",
                title: "HR",
                phone1: "+880 1700 000004",
                phone2: "+880 1400 000004",
                email1: "mijanur.rahman@gmail.com",
                email2: "2010109@me.buet.ac.bd"
            },
            tomal: {
                initials: "T K",
                name: "Tomal Kirtonia",
                title: "Head of Design",
                phone1: "+880 1700 000005",
                phone2: "+880 1400 000005",
                email1: "tomal.kirtonia@gmail.com",
                email2: "2010110@me.buet.ac.bd"
            },
            tahsif: {
                initials: "T I T",
                name: "Tawhidul Islam Tahsif",
                title: "Lead Designer",
                phone1: "+880 1405 492960",
                phone2: "",
                email1: "tawhidul.tahsif@gmail.com",
                email2: "2110153@me.buet.ac.bd",
            },
            shwadhin: {
                initials: "D S",
                name: "Dipto Muzumder Swadhin",
                title: "COO",
                phone1: "N/A",
                phone2: "N/A",
                email1: "N/A",
                email2: "N/A",
            },
            maxud: {
                initials: "M R C",
                name: "Maxudur Rahman Chowdhury",
                title: "Head of Communications",
                phone1: "+880 1676 793982",
                phone2: "N/A",
                email1: "m.rahman.chw@gmail.com",
                email2: "2310132@me.buet.ac.bd",
            },
            rakibul: {
                initials: "R H S",
                name: "Rakibul Hasan Shanto",
                title: "Junior Associate",
                phone1: "N/A",
                phone2: "N/A",
                email1: "N/A",
                email2: "N/A",
            },
            farhan: {
                initials: "F S",
                name: "Farhan Saddique",
                title: "Junior Associate",
                phone1: "N/A",
                phone2: "N/A",
                email1: "N/A",
                email2: "N/A",
                dept: "Dept of Biomedical Engineering"
            },
            ehsanSir: {
                initials: "M E",
                name: "Dr. Md. Ehsan",
                title: "Advisor & Mentor",
                phone1: "+880 1711 446564",
                phone2: "880-2-8613046 (Fax)",
                email1: "ehsan@me.buet.ac.bd",
                email2: "N/A"
            },
        };

        function showContactCard(id) {
            const member = teamData[id] || teamData['rownak'];
            const modal = document.getElementById('contact-modal');
            const container = document.getElementById('contact-card-inject');
            const content = document.getElementById('contact-modal-content');

            container.innerHTML = `
                <div class="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl min-h-[480px]">
                    <!-- Left Panel -->
                    <div class="flex-[4] relative flex flex-col items-center justify-center p-10 text-center text-white overflow-hidden" style="background: linear-gradient(-45deg, #0f2013, #1a3c22, #0d2e18, #264d2e); background-size: 400% 400%; animation: gradientBG 15s ease infinite;">
                        <div class="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_60%)] animate-[spin_20s_linear_infinite] pointer-events-none"></div>
                        <div class="text-2xl font-bold tracking-[5px] mb-2 text-white/80">${member.initials}</div>
                        <h1 class="text-3xl font-bold leading-tight mb-0 text-white drop-shadow-md">${member.name}</h1>
                        <div class="relative text-xl font-light my-6 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-[#8da356]">${member.title}</div>

                        <div class="w-28 h-28 mb-5 relative transition-transform duration-500 hover:scale-110 hover:rotate-6">
                             <svg viewBox="0 0 100 100" class="w-full h-full overflow-visible">
                                <path d="M 85 50 A 35 35 0 1 1 50 15" fill="none" stroke="#2ecc71" stroke-width="6" stroke-linecap="round" class="origin-center animate-[spin_15s_linear_infinite]" style="filter: drop-shadow(0 0 5px rgba(46, 204, 113, 0.4));" />
                                <path d="M 50 85 A 35 35 0 0 0 85 50" fill="none" stroke="#27ae60" stroke-width="5" stroke-linecap="round" class="origin-center animate-[spin_10s_linear_infinite_reverse] opacity-70" />
                                <polygon points="55,25 35,55 50,55 40,80 65,45 50,45" fill="#3498db" class="origin-center animate-pulse" style="filter: drop-shadow(0 0 8px rgba(52, 152, 219, 0.6));" />
                            </svg>
                        </div>

                        <div class="font-serif text-3xl text-[#d4e1c6] mb-1">TriChokro</div>
                        <div class="text-sm opacity-90 tracking-widest font-mono">trichokro.com</div>
                    </div>

                    <!-- Divider -->
                    <div class="w-full md:w-[60px] relative z-10 flex md:flex-col justify-around items-center py-2 md:py-10 bg-gradient-to-b from-[#7da340] via-[#b5d67a] to-[#7da340] shadow-[-5px_0_15px_rgba(0,0,0,0.1)] md:rounded-r-[50%] md:rounded-br-[10%] md:-ml-5">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 hover:scale-125 transition-all"><i class="fas fa-phone text-white text-lg"></i></div>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 hover:scale-125 transition-all"><i class="fas fa-envelope text-white text-lg"></i></div>
                        <a href="https://www.linkedin.com/in/rownakshahriarruhan/" target="_blank" class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 hover:scale-125 transition-all"><i class="fab fa-linkedin text-white text-lg"></i></a>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 hover:scale-125 transition-all"><i class="fas fa-home text-white text-lg"></i></div>
                    </div>

                    <!-- Right Panel -->
                    <div class="flex-[5] bg-white p-10 flex flex-col justify-around text-[#333]">
                        <div class="border-b border-[#eee] pb-2 mb-2 pl-0 hover:pl-4 hover:border-l-[3px] hover:border-l-[#8da356] hover:bg-gradient-to-r hover:from-[#8da356]/10 hover:to-transparent transition-all duration-300 rounded-r-lg group">
                            <span class="block text-sm text-[#555] group-hover:text-black mb-1">${member.phone1 || 'N/A'}</span>
                            <span class="block text-sm text-[#555] group-hover:text-black mb-1">${member.phone2 || ''}</span>
                        </div>
                        <div class="border-b border-[#eee] pb-2 mb-2 pl-0 hover:pl-4 hover:border-l-[3px] hover:border-l-[#8da356] hover:bg-gradient-to-r hover:from-[#8da356]/10 hover:to-transparent transition-all duration-300 rounded-r-lg group">
                            <span class="block text-sm text-[#555] group-hover:text-black mb-1">${member.email1}</span>
                            <span class="block text-sm text-[#555] group-hover:text-black mb-1">${member.email2 || ''}</span>
                        </div>
                        <div class="border-b border-[#eee] pb-2 mb-2 pl-0 hover:pl-4 hover:border-l-[3px] hover:border-l-[#8da356] hover:bg-gradient-to-r hover:from-[#8da356]/10 hover:to-transparent transition-all duration-300 rounded-r-lg group">
                            <span class="block text-sm text-[#555] group-hover:text-black mb-1">Kazi Nazrul Islam Hall</span>
                            <span class="block text-sm text-[#555] group-hover:text-black mb-1">BUET, Palashi, Dhaka-1000</span>
                        </div>
                        <div class="pl-0 hover:pl-4 hover:border-l-[3px] hover:border-l-[#8da356] hover:bg-gradient-to-r hover:from-[#8da356]/10 hover:to-transparent transition-all duration-300 rounded-r-lg group">
                            <span class="block text-sm text-[#555] group-hover:text-black mb-1">${member.dept || 'Dept of Mechanical Engineering'}</span>
                            <span class="block text-sm font-bold text-[#1a3c22]">Bangladesh University of<br>Engineering & Technology (BUET)</span>
                        </div>
                    </div>
                </div>
            `;

            modal.classList.remove('opacity-0', 'pointer-events-none');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }

        function closeContactCard() {
            const modal = document.getElementById('contact-modal');
            const content = document.getElementById('contact-modal-content');
            modal.classList.add('opacity-0', 'pointer-events-none');
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
