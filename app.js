/* =============================================================
   B4 ESPORTS — "COMBAT PROTOCOL"
   Vanilla JS. No dependencies. Deploy-ready static site.
   ============================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initHeader();
    initMobileMenu();
    initReveals();
    initCounters();
    initTimeline();
    initSpotlight();
    initTilt();
    initLiveCounter();
    initBackToTop();

    if (!isTouch && !reduceMotion) {
        initCursor();
        initMagnetic();
        initScramble();
        initHeroCanvas();
    } else {
        // Ensure scramble targets show their final text without animating
        document.querySelectorAll(".scramble").forEach(el => {
            el.textContent = el.dataset.text;
        });
    }
});

/* -------------------------------------------------------------
   rAF-throttled scroll dispatcher (single listener)
   ------------------------------------------------------------- */
const scrollSubs = [];
let ticking = false;
function onScroll(fn) { scrollSubs.push(fn); }
window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const fn of scrollSubs) fn(y);
        ticking = false;
    });
}, { passive: true });

/* =============================================================
   0. THEME TOGGLE (light / dark) — persisted in localStorage.
   The <head> inline script applies the saved theme before paint;
   this only wires the button.
   ============================================================= */
function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    const root = document.documentElement;
    const sync = () => btn.setAttribute("aria-pressed", String(root.classList.contains("light")));
    sync();
    btn.addEventListener("click", () => {
        const isLight = root.classList.toggle("light");
        try { localStorage.setItem("b4_theme", isLight ? "light" : "dark"); } catch (e) {}
        sync();
    });
}

/* =============================================================
   1. HEADER — sticky state, scroll progress, scrollspy
   ============================================================= */
function initHeader() {
    const header = document.getElementById("site-header");
    const bar = document.querySelector(".scroll-progress-bar");
    const links = [...document.querySelectorAll(".nav-link")];
    const sections = links
        .map(l => document.querySelector(l.getAttribute("href")))
        .filter(Boolean);

    onScroll((y) => {
        header.classList.toggle("scrolled", y > 40);

        const docH = document.documentElement.scrollHeight - window.innerHeight;
        if (bar && docH > 0) bar.style.width = `${(y / docH) * 100}%`;

        // scrollspy
        const pos = y + window.innerHeight * 0.35;
        let current = null;
        for (const sec of sections) {
            if (pos >= sec.offsetTop) current = sec.id;
        }
        links.forEach(l => {
            l.classList.toggle("active", l.getAttribute("href") === `#${current}`);
        });
    });
}

/* =============================================================
   2. MOBILE MENU
   ============================================================= */
function initMobileMenu() {
    const btn = document.getElementById("menu-btn");
    const drawer = document.getElementById("drawer");
    if (!btn || !drawer) return;

    const toggle = (open) => {
        const isOpen = open ?? !drawer.classList.contains("open");
        drawer.classList.toggle("open", isOpen);
        btn.classList.toggle("open", isOpen);
        btn.setAttribute("aria-expanded", String(isOpen));
        drawer.setAttribute("aria-hidden", String(!isOpen));
        document.body.style.overflow = isOpen ? "hidden" : "";
    };

    btn.addEventListener("click", () => toggle());
    drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => toggle(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });
}

/* =============================================================
   3. SCROLL REVEALS
   ============================================================= */
function initReveals() {
    const els = document.querySelectorAll("[data-reveal]");
    if (reduceMotion) { els.forEach(el => el.classList.add("in")); return; }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    els.forEach(el => io.observe(el));
}

/* =============================================================
   4. ANIMATED COUNTERS
   ============================================================= */
function initCounters() {
    const counters = document.querySelectorAll(".count");
    if (!counters.length) return;

    const run = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || "";
        if (reduceMotion) { el.textContent = target + suffix; return; }

        const dur = 1400;
        let start = null;
        const step = (ts) => {
            if (start === null) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => io.observe(c));
}

/* =============================================================
   5. TIMELINE — directional reveal + progress fill
   ============================================================= */
function initTimeline() {
    const items = document.querySelectorAll(".tl-item");
    const fill = document.getElementById("timeline-fill");
    const line = document.querySelector(".timeline-spine");

    if (items.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
            });
        }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
        items.forEach(el => io.observe(el));
    }

    if (fill && line) {
        onScroll(() => {
            const rect = line.getBoundingClientRect();
            const trigger = window.innerHeight * 0.6;
            const dist = trigger - rect.top;
            let pct = (dist / rect.height) * 100;
            pct = Math.max(0, Math.min(100, pct));
            fill.style.height = `${pct}%`;
        });
    }
}

/* =============================================================
   6. SPOTLIGHT CARDS (mouse-tracked glow)
   ============================================================= */
function initSpotlight() {
    if (isTouch) return;
    document.querySelectorAll(".spotlight").forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${e.clientX - r.left}px`);
            card.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
    });
}

/* =============================================================
   7. 3D TILT
   ============================================================= */
function initTilt() {
    if (isTouch || reduceMotion) return;
    const MAX = 8; // degrees
    document.querySelectorAll(".tilt").forEach(el => {
        let raf = null;
        el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                el.style.transform = `perspective(900px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateZ(0)`;
            });
        });
        el.addEventListener("mouseleave", () => {
            if (raf) cancelAnimationFrame(raf);
            el.style.transform = "";
        });
    });
}

/* =============================================================
   8. LIVE FAN COUNTER (simulated drift)
   ============================================================= */
function initLiveCounter() {
    const el = document.getElementById("fan-count");
    if (!el) return;
    let count = 1482;
    setInterval(() => {
        count += Math.floor(Math.random() * 9) - 4;
        if (count < 1420) count += 6;
        if (count > 1495) count -= 6;
        el.textContent = count.toLocaleString();
    }, 3000);
}

/* =============================================================
   9. BACK TO TOP
   ============================================================= */
function initBackToTop() {
    const btn = document.getElementById("to-top");
    if (!btn) return;
    onScroll((y) => btn.classList.toggle("show", y > 600));
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* =============================================================
   10. CUSTOM CURSOR (lerp follower)
   ============================================================= */
function initCursor() {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;
    document.body.classList.add("cursor-on");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const loop = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll("[data-cursor], a, button").forEach(el => {
        el.addEventListener("mouseenter", () => ring.classList.add("hover"));
        el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });
    window.addEventListener("mousedown", () => ring.classList.add("click"));
    window.addEventListener("mouseup", () => ring.classList.remove("click"));
    window.addEventListener("mouseout", (e) => {
        if (!e.relatedTarget) { dot.style.opacity = "0"; ring.style.opacity = "0"; }
    });
    window.addEventListener("mouseover", () => { dot.style.opacity = "1"; ring.style.opacity = "1"; });
}

/* =============================================================
   11. MAGNETIC BUTTONS
   ============================================================= */
function initMagnetic() {
    document.querySelectorAll("[data-magnetic]").forEach(el => {
        const strength = 0.35;
        el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * strength;
            const y = (e.clientY - r.top - r.height / 2) * strength;
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
        el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
}

/* =============================================================
   12. TEXT SCRAMBLE (hero title decode)
   ============================================================= */
function initScramble() {
    const chars = "!<>-_\\/[]{}—=+*^?#01B4";
    const els = [...document.querySelectorAll(".scramble")];

    const scramble = (el, delay) => {
        const text = el.dataset.text;
        const duration = 900;
        let startTime = null;

        const frame = (ts) => {
            if (startTime === null) startTime = ts;
            const elapsed = ts - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const revealCount = Math.floor(progress * text.length);
            let out = "";
            for (let i = 0; i < text.length; i++) {
                if (i < revealCount || text[i] === " ") out += text[i];
                else out += chars[Math.floor(Math.random() * chars.length)];
            }
            el.textContent = out;
            if (progress < 1) requestAnimationFrame(frame);
            else el.textContent = text;
        };

        setTimeout(() => requestAnimationFrame(frame), delay);
    };

    els.forEach((el, i) => scramble(el, 150 + i * 180));
}

/* =============================================================
   13. HERO CANVAS — rising embers + parallax
   ============================================================= */
function initHeroCanvas() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const hero = document.getElementById("home");

    let W, H, dpr, particles = [], running = true;
    const mouse = { x: null, y: null, r: 130 };

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = hero.offsetWidth;
        H = hero.offsetHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        populate();
    }

    class Ember {
        constructor(init) { this.reset(init); }
        reset(init) {
            this.x = Math.random() * W;
            this.y = init ? Math.random() * H : H + Math.random() * 60;
            this.size = Math.random() * 2.4 + 0.6;
            this.vy = -(Math.random() * 0.9 + 0.35);
            this.vx = (Math.random() * 0.5) - 0.25;
            this.alpha = Math.random() * 0.5 + 0.25;
            this.wob = Math.random() * Math.PI * 2;
            this.wobSpeed = Math.random() * 0.02 + 0.005;
        }
        update() {
            this.y += this.vy;
            this.wob += this.wobSpeed;
            this.x += this.vx + Math.sin(this.wob) * 0.35;

            if (mouse.x !== null) {
                const dx = this.x - mouse.x, dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouse.r && dist > 0) {
                    const f = (mouse.r - dist) / mouse.r;
                    this.x += (dx / dist) * f * 2.2;
                    this.y += (dy / dist) * f * 2.2;
                }
            }
            if (this.y < -12 || this.x < -12 || this.x > W + 12) this.reset(false);
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 60, 65, ${this.alpha})`;
            ctx.shadowBlur = this.size * 3;
            ctx.shadowColor = "rgba(229, 9, 20, 0.85)";
            ctx.fill();
        }
    }

    function populate() {
        const count = Math.min(Math.floor(W / 22), 80);
        particles = Array.from({ length: count }, () => new Ember(true));
    }

    function animate() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) { p.update(); p.draw(); }
        ctx.shadowBlur = 0;
        requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });
    window.addEventListener("mouseout", () => { mouse.x = null; mouse.y = null; });
    window.addEventListener("resize", resize);

    // Pause canvas when hero scrolls off-screen (battery/perf)
    const io = new IntersectionObserver(([entry]) => {
        const wasRunning = running;
        running = entry.isIntersecting;
        if (running && !wasRunning) animate();
    }, { threshold: 0 });
    io.observe(hero);

    resize();
    animate();
}
