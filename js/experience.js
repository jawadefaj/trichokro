
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.volume = 0.3;
        this.muted = false;
    }

    playOscillator(type, freq, duration, vol = 1) {
        if (this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(this.volume * vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHoverSound() {
        // High pitch short ping
        this.playOscillator('sine', 800, 0.1, 0.1);
    }

    playClickSound() {
        // Lower pitch blip
        this.playOscillator('triangle', 400, 0.15, 0.2);
    }

    playTypingSound() {
        // White noise burst for mechanical key feel
        if (this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    speak(text) {
        if (this.muted) return;
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 1.0;
            // Try to select a futuristic/robotic voice if available
            const voices = window.speechSynthesis.getVoices();
            const robotVoice = voices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('robot'));
            if (robotVoice) utterance.voice = robotVoice;

            window.speechSynthesis.speak(utterance);
        }
    }
}

const audioManager = new AudioManager();

// Typewriter Effect
function typeWriter(element, text, speed = 50) {
    element.innerHTML = '';
    element.classList.add('typing-active');

    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            if (text.charAt(i) !== ' ') audioManager.playTypingSound();
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('typing-active');
        }
    }
    type();
}

// Intro Sequence
function playIntro() {
    // Check if intro has already run this session
    if (sessionStorage.getItem('introPlayed')) return;
    sessionStorage.setItem('introPlayed', 'true');

    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: #020617;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: opacity 1s ease;
    `;

    // Car and Eagle Container
    const container = document.createElement('div');
    container.style.cssText = `
        position: relative;
        transform: scale(0.5);
        opacity: 0;
        animation: intro-pop 0.5s ease forwards;
    `;

    // Eagle Icon (Lucide) - represented as SVG
    const eagleSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse">
            <path d="M16 7h.01"/>
            <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/>
            <path d="m20 7 2 .5-2 .5"/>
            <path d="M10 18v3"/>
            <path d="M14 17.75V21"/>
            <path d="M7 18a6 6 0 0 0 3.84-10.61"/>
        </svg>
    `; // Using a 'Bird' like abstraction since standard 'Eagle' isn't in simple Lucide set, but this looks techy.

    container.innerHTML = `
        <div class="text-center">
            ${eagleSvg}
            <h1 class="text-4xl font-bold text-white mt-4 font-display tracking-widest" style="text-shadow: 0 0 20px #10b981;">TriChokro</h1>
        </div>
    `;

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Add Keyframes for intro
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes intro-pop {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Sequence
    setTimeout(() => {
        audioManager.speak("Welcome to TriChokro. Electric Eagle Online.");
    }, 500);

    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 1000);
    }, 2500);
}

function initExperience() {
    // 1. Hover Sounds
    document.querySelectorAll('a, button, .interactive').forEach(el => {
        el.addEventListener('mouseenter', () => audioManager.playHoverSound());
        el.addEventListener('click', () => audioManager.playClickSound());
    });

    // 2. Typing Effect on Load for Elements with class 'type-me'
    const typeElements = document.querySelectorAll('.type-me');
    typeElements.forEach(el => {
        // Store original text
        const text = el.innerText;
        el.innerText = '';
        // Wait for loader to finish (approx 1s in index.html)
        setTimeout(() => {
            typeWriter(el, text, 30);
        }, 1500);
    });

    // 3. Play Intro
    // We need user interaction first for AudioContext usually, but SpeechSynthesis might work.
    // We try to trigger it. If it fails due to autoplay policy, it fails silently.
    // However, the overlay is visual, so that works.
    playIntro();

    // Add resume on click just in case
    document.addEventListener('click', () => {
        if (audioManager.ctx.state === 'suspended') audioManager.ctx.resume();
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', initExperience);
