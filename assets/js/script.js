/* ===================================================
   LENIS SMOOTH SCROLL INITIALIZATION
=================================================== */
let lenis;
if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
    });
    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger so ScrollTrigger reads Lenis scroll position
    if (typeof ScrollTrigger !== "undefined") {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // Smooth scroll for internal anchor links (#hero, #portfolio, #prices, #payment)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId && targetId !== "#") {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
                }
            }
        });
    });
}

const data = {
    Produk: [
        "./assets/images/poster-produk1.png",
        "./assets/images/poster-produk2.png",
        "./assets/images/poster-produk3.png"
    ],

    Poster: [
        "./assets/images/poster1.png",
        "./assets/images/poster2.png",
        "./assets/images/poster3.png"
    ],

    Clothing: [
        "./assets/images/clothing1.png",
        "./assets/images/clothing2.png",
        "./assets/images/clothing3.png"
    ],

    Thumbnail: [
        "./assets/images/thumbnail1.png",
        "./assets/images/thumbnail2.png"
    ],

    Banner: [
        "./assets/images/banner.png"
    ]
};

const tabs = document.getElementById("tabs");
const track = document.getElementById("track");

/* Cek ukuran layar */
const isMobilePortfolio =
    window.matchMedia("(max-width:768px)").matches;

let currentIndex = 0;
const allSlides = [];

/* Gabungkan semua gambar */
Object.keys(data).forEach(category => {
    data[category].forEach(src => {
        allSlides.push({
            category,
            src
        });
    });
});

/* Buat tombol kategori */
if (tabs) {
    tabs.innerHTML = "";
    Object.keys(data).forEach(category => {
        const button = document.createElement("button");
        button.className = "tab-btn";
        button.textContent = category;

        button.onclick = () => {
            currentIndex = allSlides.findIndex(
                item => item.category === category
            );

            if (isMobilePortfolio) {
                scrollToSlideMobile(currentIndex);
                updateActiveTab();
            } else {
                renderSlides();
            }
        };

        tabs.appendChild(button);
    });
}

/* Buat semua slide (TIDAK digandakan lagi) */
if (track) {
    track.innerHTML = "";
    allSlides.forEach(item => {
        const slide = document.createElement("div");
        slide.className = "slide";
        slide.innerHTML = `<img src="${item.src}" loading="lazy">`;
        track.appendChild(slide);
    });
}

/* Simpan referensi slide */
const originalSlideEls = track ? Array.from(track.children) : [];

function updateActiveTab() {
    const activeCategory = allSlides[currentIndex].category;
    document.querySelectorAll(".tab-btn").forEach(button => {
        button.classList.remove("active");
        if (button.textContent === activeCategory) {
            button.classList.add("active");
        }
    });
}

function renderSlides() {
    const slides = document.querySelectorAll(".slide");
    slides.forEach((slide, index) => {
        slide.className = "slide";
        if (index === currentIndex) {
            slide.classList.add("active");
        } else if (index === (currentIndex - 1 + allSlides.length) % allSlides.length) {
            slide.classList.add("prev");
        } else if (index === (currentIndex + 1) % allSlides.length) {
            slide.classList.add("next");
        }
    });
    updateActiveTab();
}

function move(direction) {
    currentIndex = (currentIndex + direction + allSlides.length) % allSlides.length;
    renderSlides();
}

/* ========================= */
/* PORTFOLIO - MOBILE GALLERY */
/* (tanpa loop, hanya geser biasa) */
/* ========================= */

function scrollToSlideMobile(index) {
    const carouselEl = document.querySelector(".carousel-container");
    const target = originalSlideEls[index];
    if (!carouselEl || !target) return;

    carouselEl.scrollTo({
        left: target.offsetLeft - 14,
        behavior: "smooth"
    });
}

function initMobilePortfolioGallery() {
    const carouselEl = document.querySelector(".carousel-container");
    const hint = document.getElementById("portfolioScrollHint");

    if (!carouselEl) return;

    // Tampilkan/sembunyikan petunjuk geser
    carouselEl.addEventListener("scroll", () => {
        if (carouselEl.scrollLeft > 10) {
            hint.classList.add("hide");
        } else {
            hint.classList.remove("hide");
        }
        updateMobileActiveTabFromScroll(carouselEl);
    }, { passive: true });
}

function updateMobileActiveTabFromScroll(carouselEl) {
    const containerCenter = carouselEl.scrollLeft + carouselEl.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    originalSlideEls.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - containerCenter);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
        }
    });

    if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;
        updateActiveTab();
    }
}

/* ========================= */
/* LIGHTBOX GAMBAR */
/* ========================= */

function openPortfolioLightbox(src, alt) {
    const overlay = document.createElement("div");
    overlay.className = "portfolio-lightbox";
    overlay.innerHTML = `
        <button class="portfolio-lightbox-close" aria-label="Tutup">&times;</button>
        <img src="${src}" alt="${alt || ""}">
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => overlay.classList.add("show"));

    function closeLightbox() {
        overlay.classList.remove("show");
        document.body.style.overflow = "";
        setTimeout(() => overlay.remove(), 250);
        document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
        if (e.key === "Escape") closeLightbox();
    }

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.classList.contains("portfolio-lightbox-close")) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", onKey);
}

track?.addEventListener("click", (e) => {
    const img = e.target.closest("img");
    if (img) openPortfolioLightbox(img.src, img.alt);
});

/* Jalankan fungsi sesuai ukuran layar */
if (isMobilePortfolio) {
    initMobilePortfolioGallery();
} else {
    setInterval(() => {
        move(1);
    }, 5000);
    renderSlides();
}

/* ========================= */
/* BAGIAN LAINNYA (TETAP SAMA) */
/* ========================= */

/* Floating Phone */
const phone = document.querySelector(".phone-image");
document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", () => {
        const target = document.getElementById("payment");
        if (lenis && target) {
            lenis.scrollTo(target, { offset: -20, duration: 1.2 });
        } else if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

/* Sticky Navbar */
const stickyNavbar = document.querySelector(".sticky-navbar");
let hideTimer;

window.addEventListener("scroll", () => {
    if (window.scrollY > 120) {
        stickyNavbar.classList.remove("hide");
        stickyNavbar.classList.add("show");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => stickyNavbar.classList.add("hide"), 1200);
    } else {
        stickyNavbar.classList.remove("show", "hide");
    }
});

/* Scroll Reveal */
const reveals = document.querySelectorAll(".reveal,.reveal-left,.reveal-right,.reveal-scale");
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
reveals.forEach(el => observer.observe(el));

/* Scroll Progress Bar */
const progressFill = document.querySelector(".scroll-progress-fill");
window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = (scrollTop / scrollHeight) * 100;
    progressFill.style.width = percent + "%";
});

/* Mouse Glow Effect */
const mouseGlow = document.querySelector(".mouse-glow");
let glowX = window.innerWidth / 2;
let glowY = window.innerHeight / 2;
let currentGlowX = glowX;
let currentGlowY = glowY;

document.addEventListener("mousemove", (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
});

function animateGlow() {
    currentGlowX += (glowX - currentGlowX) * 0.08;
    currentGlowY += (glowY - currentGlowY) * 0.08;
    mouseGlow.style.transform = `translate(${currentGlowX - 350}px, ${currentGlowY - 350}px)`;
    requestAnimationFrame(animateGlow);
}
animateGlow();

/* Custom Cursor */
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorText = document.querySelector(".cursor-text");
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(animateCursor);
}
animateCursor();

/* Cursor Hover Effect */
const hoverTargets = document.querySelectorAll('a, button, .btn, .cta-button, .contact-btn, .nav-links a');
hoverTargets.forEach(item => {
    item.addEventListener("mouseenter", () => {
        cursorRing.classList.add("active");
        cursorDot.classList.add("hide");
        cursorText.textContent = "CLICK";
    });
    item.addEventListener("mouseleave", () => {
        cursorRing.classList.remove("active");
        cursorDot.classList.remove("hide");
        cursorText.textContent = "";
    });
});

/* Scroll State Guard for Audio Performance */
let isScrollingState = false;
let scrollStateTimeout;
window.addEventListener("scroll", () => {
    isScrollingState = true;
    clearTimeout(scrollStateTimeout);
    scrollStateTimeout = setTimeout(() => {
        isScrollingState = false;
    }, 150);
}, { passive: true });

/* Hover Sound Effects */
const soundClick = new Audio("./assets/sound/click.mp3");
const soundSwipe = new Audio("./assets/sound/swipe.mp3");
soundClick.volume = 0.35;
soundSwipe.volume = 0.45;

function playSound(audio) {
    if (!audio || isScrollingState) return;
    try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p !== undefined) {
            p.catch(() => { });
        }
    } catch (e) { }
}

document.querySelectorAll(".nav-links a").forEach(menu => {
    menu.addEventListener("mouseenter", () => {
        playSound(soundSwipe);
    });
});

document.querySelectorAll(".social-tag").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        playSound(soundClick);
    });
});

/* Parallax Card Effect */
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
});

/* Magnetic Button Effect */
const buttons = document.querySelectorAll('.btn, .cta-button');
buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = btn.getBoundingClientRect();
        const x = (e.clientX - left) - width / 2;
        const y = (e.clientY - top) - height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

/* Aktif Navigasi Berdasarkan Posisi Scroll */
const sections = document.querySelectorAll("section[id]");
const navs = [...document.querySelectorAll(".nav-links a")];
window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const top = section.offsetTop - 140;
        if (window.scrollY >= top) current = section.id;
    });
    navs.forEach(link => {
        link.classList.remove("active-link");
        if (link.getAttribute("href") === "#" + current) link.classList.add("active-link");
    });
});

/* Tombol Menu Mobile */
const mobileBtn = document.querySelector(".mobile-menu-btn");
const mainNav = document.getElementById("mainNav");
mobileBtn?.addEventListener("click", () => {
    mainNav.classList.toggle("show");
});

/* Tombol Menu di Sticky Navbar */
const stickyMenuBtn = document.getElementById("stickyMenuBtn");
stickyMenuBtn?.addEventListener("click", () => {
    const target = document.getElementById("hero");
    if (lenis && target) {
        lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    }
});

/* ===================================================
   GSAP BOUNCY FOOTER ANIMATION
=================================================== */
function initGSAPBouncyFooter() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const bouncyPath = document.getElementById("bouncy-path");
    const footerTrigger = document.querySelector(".footer-bouncy-wrapper") || document.querySelector(".footer");

    if (bouncyPath && footerTrigger) {
        ScrollTrigger.create({
            trigger: footerTrigger,
            start: "top bottom",
            toggleActions: "play pause resume reverse",
            onEnter: (self) => {
                const velocity = self.getVelocity ? self.getVelocity() : 1000;
                const variation = Math.min(0.6, Math.max(0.15, Math.abs(velocity) / 6000));
                const startY = 360;

                const anim = { y: startY };
                gsap.fromTo(anim,
                    { y: startY },
                    {
                        y: 0,
                        duration: 3.6,
                        ease: `elastic.out(${1.5 + variation * 0.5}, ${0.32 + variation * 0.08})`,
                        overwrite: "auto",
                        onUpdate: () => {
                            const yVal = anim.y.toFixed(1);
                            bouncyPath.setAttribute("d", `M0-0.3C0-0.3,464,${yVal},1139,${yVal}S2278-0.3,2278-0.3V683H0V-0.3z`);
                        }
                    }
                );
            }
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initGSAPBouncyFooter();
        initTechLogoLoop();
        initStickerPeel();
    });
} else {
    initGSAPBouncyFooter();
    initTechLogoLoop();
    initStickerPeel();
}

/* ===================================================
   REACT BITS STICKER PEEL (Scroll-Driven & Draggable)
=================================================== */
function initStickerPeel() {
    const containerEl = document.getElementById("stickerContainer");
    const target      = document.getElementById("heroSticker");
    if (!containerEl || !target) return;

    function updatePeel() {
        const y = (window.lenis && typeof window.lenis.scroll === "number")
            ? window.lenis.scroll
            : (window.scrollY || document.documentElement.scrollTop || 0);

        // Map scrollY (0 -> 130px) to peel percentage (0% -> 48%)
        const maxScroll = 130;
        const progress = Math.min(1, Math.max(0, y / maxScroll));
        const peel = (progress * 48).toFixed(2); // 0 to 48%

        containerEl.style.setProperty("--peel-back", peel + "%");
    }

    // Run immediately
    updatePeel();

    // Listen to scroll events
    window.addEventListener("scroll", updatePeel, { passive: true });
    document.addEventListener("scroll", updatePeel, { passive: true });

    if (window.lenis) {
        window.lenis.on("scroll", updatePeel);
    }

    // Also run on animation frame loop to guarantee sync
    (function rafLoop() {
        updatePeel();
        requestAnimationFrame(rafLoop);
    })();

    // GSAP Draggable support
    if (typeof gsap !== "undefined" && typeof Draggable !== "undefined") {
        gsap.registerPlugin(Draggable);
        Draggable.create(target, {
            type: "x,y",
            bounds: target.parentNode,
            inertia: true,
            onDrag() {
                const rot = gsap.utils.clamp(-24, 24, this.deltaX * 0.4);
                gsap.to(target, { rotation: rot, duration: 0.15, ease: "power1.out" });
            },
            onDragEnd() {
                gsap.to(target, { rotation: 0, duration: 0.8, ease: "power2.out" });
            }
        });
    }
}

/* ===================================================
   REACT BITS LOGOLOOP (TECH STACK INFINITE MARQUEE)
=================================================== */
function initTechLogoLoop() {
    const container = document.getElementById("techLogoLoop");
    const track = document.getElementById("techStackTrack");
    const origList = document.getElementById("techListOriginal");
    if (!container || !track || !origList) return;

    // 1. Auto-duplicate list copies so loop is 100% seamless without gap
    const listWidth = origList.getBoundingClientRect().width || 1200;
    const containerWidth = container.clientWidth || 1000;
    const copiesNeeded = Math.max(3, Math.ceil(containerWidth / listWidth) + 2);

    track.innerHTML = "";
    for (let i = 0; i < copiesNeeded; i++) {
        const clone = origList.cloneNode(true);
        clone.removeAttribute("id");
        if (i > 0) clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
    }

    // 2. Infinite Loop Animation with smooth lerp physics
    let offset = 0;
    let velocity = 70;
    let targetVelocity = 70;
    let lastTime = null;
    let isHovered = false;

    container.addEventListener("mouseenter", () => {
        isHovered = true;
    });
    container.addEventListener("mouseleave", () => {
        isHovered = false;
    });

    track.querySelectorAll(".tech-icon-item").forEach(card => {
        card.addEventListener("mouseenter", () => {
            if (typeof playSound === "function" && typeof soundClick !== "undefined") {
                playSound(soundClick);
            }
        });
    });

    function loopStep(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = Math.max(0, timestamp - lastTime) / 1000;
        lastTime = timestamp;

        const target = isHovered ? 0 : targetVelocity;
        const easing = 1 - Math.exp(-delta / 0.25);
        velocity += (target - velocity) * easing;

        const seqWidth = origList.getBoundingClientRect().width || 1200;
        if (seqWidth > 0) {
            offset += velocity * delta;
            offset = ((offset % seqWidth) + seqWidth) % seqWidth;
            track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        }

        requestAnimationFrame(loopStep);
    }

    requestAnimationFrame(loopStep);
}