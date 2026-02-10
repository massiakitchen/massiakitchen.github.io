/**
 * Scrollytelling Animation for Massia Kitchen
 * Inspired by Microsoft Edge Year in Review
 * Uses GSAP, ScrollTrigger, and Lenis for smooth scrolling
 */

function initScrollytelling() {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. Scrollytelling Logic
    const section = document.querySelector('.scrolly-section');
    const sticky = document.querySelector('.scrolly-sticky');
    const card = document.querySelector('.scrolly-card');
    const bgItems = document.querySelectorAll('.p-item');
    const glows = document.querySelectorAll('.scrolly-section .ambient-glow');

    if (!section || !card) return;

    // Create the main timeline tied to scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: false
        }
    });

    // Initial State: Items appear straight and visible
    gsap.set(bgItems, {
        y: (i) => (i % 2 === 0 ? 100 : -100),
        x: (i) => (i % 3 === 0 ? 50 : -50),
        rotate: 0, // No rotation as requested
        scale: 0.85,
        opacity: 1, // Full opacity as requested
        filter: "blur(0px)"
    });

    gsap.set(glows, { opacity: 0.15, scale: 0.8 });

    // Card starts VISIBLE as it is the Hero
    gsap.set(card, { opacity: 1, y: 0, scale: 1 });

    // 2.5 Staggered Entrance for Trust Badges
    const badges = card.querySelectorAll('.badge');
    if (badges.length > 0) {
        gsap.to(badges, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: {
                each: 0.12,
                from: "center"
            },
            ease: "back.out(2)",
            delay: 0.8,
            onComplete: () => {
                // Remove initial transform to let CSS float keyframe take over safely
                gsap.set(badges, { clearProps: "y,scale" });
            }
        });
    }

    // Animation Sequence
    tl.to(bgItems, {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        stagger: 0.01,
        duration: 0.2
    }, 0)
        .to(glows, {
            opacity: 0.3,
            scale: 1,
            duration: 0.2
        }, 0)
        // 2. Separate card slightly
        .to(card, {
            y: -5,
            duration: 0.2
        }, 0)

        // 3. Parallax Exit phase (Keeping elements visible as requested)
        .to(bgItems, {
            y: (i, target) => {
                const speed = parseFloat(target.dataset.speed) || 0.5;
                return -150 * speed; // More subtle parallax exit
            },
            x: (i) => (i % 2 === 0 ? -10 : 10),
            scale: 1.05,
            opacity: 0.8, // Stay visible
            duration: 0.5,
            ease: "power2.out"
        }, 0.5)
        .to(card, {
            opacity: 1, // Stay fully visible
            scale: 0.98,
            y: -20,
            duration: 0.5,
            ease: "power2.out"
        }, 0.5);

    // Mouse movement parallax (Subtle)
    sticky.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth) - 0.5;
        const yPos = (clientY / window.innerHeight) - 0.5;

        bgItems.forEach((item, i) => {
            const factor = (i + 1) * 10;
            gsap.to(item, {
                x: `+=${xPos * factor}`,
                y: `+=${yPos * factor}`,
                duration: 2,
                ease: "power2.out",
                overwrite: 'auto'
            });
        });

        gsap.to(card, {
            rotationY: xPos * 5,
            rotationX: -yPos * 5,
            duration: 1.5,
            ease: "power2.out"
        });
    });
}

// Initialize on load
window.addEventListener('load', () => {
    if (window.gsap && window.ScrollTrigger) {
        initScrollytelling();
    }
});
