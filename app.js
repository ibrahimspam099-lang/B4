/* -------------------------------------------------------------
   B4 ESPORTS - PREMIUM LANDING PAGE JAVASCRIPT
   ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    // Systems Init
    initLoader();
    initNavbar();
    initCanvasParticles();
    initSpotlightCards();
    initScrollObserver();
    initLiveCounter();
});

/* =============================================================
   1. CINEMATIC LOADING SCREEN & AUDIO SYNTH ENGINE
   ============================================================= */
let audioCtx = null;
let isMuted = true; // Start muted to comply with browser autoplay policies

function initLoader() {
    const loader = document.getElementById("loader-screen");
    const progressFill = document.getElementById("loader-progress");
    const percentageText = document.getElementById("loader-pct");
    const actionText = document.getElementById("loader-action-txt");
    const soundBtn = document.getElementById("sound-toggle-btn");
    const soundOnIcon = document.getElementById("sound-on-icon");
    const soundOffIcon = document.getElementById("sound-off-icon");
    const soundLabel = document.getElementById("sound-status-label");

    // Cinematic loading phrases
    const loadingPhrases = [
        "INITIALIZING CORE SYSTEMS...",
        "CONNECTING TO B4 GAMESERVER...",
        "DECRYPTING ROSTER DATABASE...",
        "COMPILING SHADERS & LIGHTING...",
        "STREAMING PUBG MOBILE CHANNELS...",
        "CALIBRATING NEON GLOW GRID...",
        "SYNCHRONIZING TIMELINE EVENTS...",
        "ESTABLISHING SECURE CONNECTION...",
        "B4 ESPORTS HUB READY!"
    ];

    // Load sound state preference from LocalStorage
    const savedMuteState = localStorage.getItem("b4_muted");
    if (savedMuteState !== null) {
        isMuted = savedMuteState === "true";
    }

    // Set initial sound UI state
    updateSoundUI();

    // Toggle Sound Button
    soundBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isMuted = !isMuted;
        localStorage.setItem("b4_muted", isMuted);
        updateSoundUI();
        
        // Initialize Audio Context on click if not done
        if (!isMuted && !audioCtx) {
            initAudioContext();
        }
    });

    function updateSoundUI() {
        if (isMuted) {
            soundOnIcon.classList.add("hidden");
            soundOffIcon.classList.remove("hidden");
            soundLabel.textContent = "AUDIO MUTED";
            soundBtn.style.borderColor = "rgba(255,255,255,0.15)";
        } else {
            soundOffIcon.classList.add("hidden");
            soundOnIcon.classList.remove("hidden");
            soundLabel.textContent = "AUDIO ENABLED";
            soundBtn.style.borderColor = "var(--primary-red)";
        }
    }

    // Loading Progress Simulation
    let progress = 0;
    const intervalTime = 40; // Total loading time approx 3-4 seconds
    
    const loadingInterval = setInterval(() => {
        // Increment progress with slightly random steps for authenticity
        progress += Math.floor(Math.random() * 3) + 1;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // Finish Loading
            progressFill.style.width = "100%";
            percentageText.textContent = "100%";
            actionText.textContent = loadingPhrases[loadingPhrases.length - 1];
            
            // Play exit cinematic synth boom
            if (!isMuted) playCinematicBoom();

            setTimeout(() => {
                // Fade out loader
                loader.classList.remove("active");
                document.body.style.overflowY = "auto";
                
                // Add animated reveal class to Hero content
                document.querySelectorAll(".fade-in-up").forEach(el => {
                    el.style.opacity = 1;
                });
            }, 600);
        } else {
            // Update Loading UI
            progressFill.style.width = `${progress}%`;
            percentageText.textContent = `${progress}%`;
            
            // Periodically switch action text based on progress
            const phraseIdx = Math.floor((progress / 100) * (loadingPhrases.length - 1));
            actionText.textContent = loadingPhrases[phraseIdx];
            
            // Play a rising pitch hum as it loads
            if (!isMuted && progress % 10 === 0) {
                playRisingSynthHum(progress);
            }
        }
    }, intervalTime);
}

// Web Audio API Synthesizer functions (fully self-contained, no files needed)
function initAudioContext() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
    } catch(e) {
        console.error("Web Audio API not supported on this browser", e);
    }
}

function playRisingSynthHum(progress) {
    if (!audioCtx) initAudioContext();
    if (!audioCtx || audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    try {
        const now = audioCtx.currentTime;
        
        // Setup oscillator and filter
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const gainNode = audioCtx.createGain();
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = "sawtooth";
        // Frequency rises based on loading progress (from 60Hz to ~180Hz)
        const startFreq = 60 + (progress * 1.2);
        osc.frequency.setValueAtTime(startFreq, now);
        
        // Lowpass filter keeps it warm and bassy
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(150 + (progress * 3), now);
        
        // Gain envelope - fade in and out fast
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.35);
    } catch (err) {
        console.warn("Synth play failed", err);
    }
}

function playCinematicBoom() {
    if (!audioCtx) initAudioContext();
    if (!audioCtx || audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    try {
        const now = audioCtx.currentTime;
        
        // 1. Sub Bass Drop
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        
        bassOsc.connect(bassGain);
        bassGain.connect(audioCtx.destination);
        
        bassOsc.type = "sine";
        // Sweep down pitch (from 120Hz down to 30Hz)
        bassOsc.frequency.setValueAtTime(120, now);
        bassOsc.frequency.exponentialRampToValueAtTime(30, now + 1.5);
        
        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        
        bassOsc.start(now);
        bassOsc.stop(now + 1.8);

        // 2. High Cyber Sweep
        const sweepOsc = audioCtx.createOscillator();
        const sweepFilter = audioCtx.createBiquadFilter();
        const sweepGain = audioCtx.createGain();
        
        sweepOsc.connect(sweepFilter);
        sweepFilter.connect(sweepGain);
        sweepGain.connect(audioCtx.destination);
        
        sweepOsc.type = "triangle";
        sweepOsc.frequency.setValueAtTime(440, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(880, now + 0.6);
        
        sweepFilter.type = "peaking";
        sweepFilter.frequency.setValueAtTime(800, now);
        sweepFilter.Q.setValueAtTime(10, now);
        
        sweepGain.gain.setValueAtTime(0, now);
        sweepGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        sweepOsc.start(now);
        sweepOsc.stop(now + 0.8);
    } catch (err) {
        console.warn("Synth boom failed", err);
    }
}

/* =============================================================
   2. NAVBAR SCROLL EFFECT & MOBILE DRAWER
   ============================================================= */
function initNavbar() {
    const header = document.getElementById("main-header");
    const menuToggle = document.getElementById("menu-toggle");
    const mobileDrawer = document.getElementById("mobile-drawer");
    const scrollProgressBar = document.getElementById("scroll-progress-bar");
    const desktopLinks = document.querySelectorAll(".nav-link");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    // Scroll States
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Sticky header class
        if (scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        // Scroll Progress Bar
        if (docHeight > 0) {
            const scrollPercent = (scrollY / docHeight) * 100;
            scrollProgressBar.style.width = `${scrollPercent}%`;
        }

        // Active Section Highlights on Scroll
        highlightActiveNav();
    });

    // Mobile Hamburger Menu Click
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        mobileDrawer.classList.toggle("active");
    });

    // Close Drawer when Link is Clicked
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.classList.remove("active");
            mobileDrawer.classList.remove("active");
        });
    });

    // Ripple click effect for buttons
    const rippleButtons = document.querySelectorAll(".ripple-btn");
    rippleButtons.forEach(btn => {
        btn.addEventListener("click", function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement("span");
            ripple.classList.add("ripple-wave");
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Highlight nav links based on scrolled section
    function highlightActiveNav() {
        const sections = document.querySelectorAll("section");
        const scrollPos = window.scrollY + 200; // Offset

        sections.forEach(section => {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                const id = section.getAttribute("id");
                
                // Desktop
                desktopLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
                
                // Mobile
                mobileLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }
}

/* =============================================================
   3. HIGH-PERFORMANCE HTML5 CANVAS PARTICLES & SMOKE
   ============================================================= */
function initCanvasParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let particlesArray = [];
    let mouse = {
        x: null,
        y: null,
        radius: 120 // Interaction boundary
    };

    // Track mouse coordinates over Hero
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Reset mouse when cursor leaves page
    window.addEventListener("mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Handle Canvas Resizing
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle blueprint
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            // Spawn mostly near the bottom or randomly
            this.y = canvas.height + (Math.random() * 100);
            this.size = (Math.random() * 3) + 1; // Size 1 to 4px
            this.speedY = -(Math.random() * 1.5 + 0.5); // Floating upwards speed
            this.speedX = (Math.random() * 0.6) - 0.3; // Slight drift
            this.opacity = Math.random() * 0.5 + 0.3; // Opacity 0.3 to 0.8
            this.wobbleSpeed = Math.random() * 0.02;
            this.wobbleCount = Math.random() * 360;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            // Neon red fill with custom opacity
            ctx.fillStyle = `rgba(229, 9, 20, ${this.opacity})`;
            ctx.shadowBlur = this.size * 2;
            ctx.shadowColor = "rgba(229, 9, 20, 0.8)";
            ctx.fill();
        }

        update() {
            // Apply upward speed
            this.y += this.speedY;
            
            // Sway wobble sideways
            this.wobbleCount += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobbleCount) * 0.25;

            // Mouse deflection vector mathematics
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    // Stronger push when closer
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * 3;
                    const directionY = forceDirectionY * force * 3;
                    
                    this.x += directionX;
                    this.y += directionY;
                }
            }

            // Wrap particle if it goes off top or sides
            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.y = canvas.height + 20;
                this.x = Math.random() * canvas.width;
                this.opacity = Math.random() * 0.5 + 0.3;
            }
        }
    }

    // Populate particles based on screen width
    function populateParticles() {
        particlesArray = [];
        const count = Math.min(Math.floor(canvas.width / 15), 100); // Caps at 100 particles
        for (let i = 0; i < count; i++) {
            particlesArray.push(new Particle());
        }
    }
    populateParticles();
    window.addEventListener("resize", populateParticles);

    // Animation Loop
    function animateParticles() {
        // Clear frame with semi-transparent black for a trace trailing effect
        ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
        ctx.shadowBlur = 0; // Disable shadow for background fill
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

/* =============================================================
   4. PREMIUM CARD SPOTLIGHT EFFECT
   ============================================================= */
function initSpotlightCards() {
    const cards = document.querySelectorAll(".spotlight-card");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse coordinate percentage relative to card boundaries
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });
}

/* =============================================================
   5. INTERSECTION OBSERVER FOR SCROLL REVEALS & TIMELINE
   ============================================================= */
function initScrollObserver() {
    // 1. General Section and Card Reveals
    const revealElements = document.querySelectorAll(".scroll-reveal, .scroll-reveal-item");
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                // Stop observing once animated in
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before screen entry
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Timeline Progress Bar Height Tracker
    const timelineContainer = document.querySelector(".timeline-container");
    const timelineProgress = document.querySelector(".timeline-progress");
    const timelineLine = document.querySelector(".timeline-line");
    
    if (timelineContainer && timelineProgress && timelineLine) {
        window.addEventListener("scroll", () => {
            const rect = timelineLine.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate how much of the timeline line has crossed the middle of the screen
            const startOffset = windowHeight / 1.7; // Middle/Lower cross line
            const scrollDistance = startOffset - rect.top;
            const lineLength = rect.height;
            
            let percentage = (scrollDistance / lineLength) * 100;
            percentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
            
            timelineProgress.style.height = `${percentage}%`;
        });
    }

    // 3. Back to Top Button
    const backToTopBtn = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* =============================================================
   6. SIMULATED LIVE SPECTATOR/FAN COUNTER DRIFT
   ============================================================= */
function initLiveCounter() {
    const counterEl = document.getElementById("visitor-count");
    if (!counterEl) return;

    let count = 1482; // Start value

    setInterval(() => {
        // Subtle drifts up and down
        const drift = Math.floor(Math.random() * 9) - 4; // Yields -4 to +4
        count += drift;

        // Force bounds check to keep it around the 1420-1495 fan zone
        if (count < 1420) count += 6;
        if (count > 1495) count -= 6;

        // Apply formatting with thousands separator (e.g. 1,482)
        counterEl.textContent = count.toLocaleString();
    }, 3000); // Update count every 3 seconds
}
