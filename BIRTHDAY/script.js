gsap.registerPlugin(ScrollTrigger);

/* ================= 1. INTERACTIVE ELEMENTS (Confetti, Envelope, Modal) ================= */

// Material 3 Expressive Carousel with scroll-based scaling
// Material 3 Expressive Carousel with GSAP Pinning
const carouselContainer = document.querySelector('.carousel-container');
const carouselTrack = document.querySelector('.carousel-track');
const carouselItems = document.querySelectorAll('.carousel-item');

if (carouselContainer && carouselTrack) {
  // Calculate the total width to scroll
  // We want to scroll until the end of the track is visible
  // Total scroll distance = track width - container width

  // Note: We need a function to calculate this because widths might change if images load
  function getScrollAmount() {
    let trackWidth = carouselTrack.scrollWidth;
    let containerWidth = carouselContainer.offsetWidth;
    return -(trackWidth - containerWidth);
  }

  const tween = gsap.to(carouselTrack, {
    x: getScrollAmount,
    ease: "none",
    scrollTrigger: {
      trigger: "#memories",
      pin: true,
      start: "top top", // Start pinning when the section hits top of viewport
      end: () => `+=${carouselTrack.scrollWidth * 2}`, // Increased scroll distance for more control/stickiness
      scrub: 0.5, // tighter reaction
      snap: {
        snapTo: 1 / (carouselItems.length - 1),
        duration: { min: 0.2, max: 0.5 },
        delay: 0,
        ease: "power2.out"
      },
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        updateCarouselState();
      }
    }
  });
}

function updateCarouselState() {
  const center = window.innerWidth / 2;

  carouselItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const distance = Math.abs(center - itemCenter);

    // Removed intra-card parallax to keep images intact with the card
    const img = item.querySelector('img');
    if (img) {
      gsap.set(img, { x: 0 }); // Reset any potential shift
    }

    // Active state (focus)
    // If the item center is within a certain range of the viewport center
    // viewport width 420px approx per card. define a 'sweet spot'
    if (distance < 200) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}


// Confetti generation with colors
const confetti = document.getElementById("confetti");
const confettiColors = ["#FFEAD3", "#EA7B7B", "#D25353", "#FFD700", "#FFA07A"];
for (let i = 0; i < 40; i++) {
  const s = document.createElement("span");
  s.style.left = Math.random() * 100 + "%";
  s.style.width = 4 + Math.random() * 8 + "px";
  s.style.height = 10 + Math.random() * 16 + "px";
  s.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
  s.style.animationDuration = 6 + Math.random() * 8 + "s";
  s.style.animationDelay = Math.random() * 5 + "s";
  s.style.transform = `rotate(${Math.random() * 360}deg)`;
  s.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
  confetti.appendChild(s);
}

// Envelope scroll animation
gsap.to(".envelope", {
  scrollTrigger: {
    trigger: "#letter",
    start: "top center",
    end: "center center",
    scrub: true,
    onEnter: () => document.getElementById("envHint").style.opacity = .7
  },
  scale: 1,
  y: 0,
  opacity: 1
});

// Envelope Open/Close logic
const env = document.getElementById("envelope");
const modal = document.getElementById("letterModal");
const hint = document.getElementById("envHint");

env.onclick = () => {
  env.classList.add("open");
  hint.style.opacity = 0;
  setTimeout(() => modal.classList.add("active"), 500);
};

document.querySelector(".letter-close").onclick = () => {
  modal.classList.remove("active");
  setTimeout(() => env.classList.remove("open"), 300);
};

modal.onclick = e => {
  if (e.target === modal) {
    modal.classList.remove("active");
    setTimeout(() => env.classList.remove("open"), 300);
  }
};

/* ================= 2. LYRICS — RESPONSIVE ANIMATIONS ================= */

ScrollTrigger.matchMedia({
  // Desktop: Complex Parallax & Blur
  "(min-width: 769px)": function () {
    gsap.utils.toArray(".lyric-card").forEach((card, i) => {
      const fromX = card.classList.contains("left") ? -180 : 180;

      // Entry
      gsap.fromTo(card, {
        x: fromX,
        y: 60,
        opacity: 0,
        filter: "blur(14px)"
      }, {
        x: 0,
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 92%",
          end: "top 60%",
          scrub: 1.6
        }
      });

      // Parallax float
      gsap.to(card, {
        y: i % 2 === 0 ? -50 : 50,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: 2.5
        }
      });
    });
  },

  // Mobile: Simple, Fast Fade Up
  "(max-width: 768px)": function () {
    gsap.utils.toArray(".lyric-card").forEach((card) => {
      gsap.fromTo(card, {
        y: 50,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }
});

/* ================= 3. WISHES — AMBIENT REASSURANCE ================= */

// Setup: Split text into words for staggered animation
const wishes = document.querySelectorAll(".wish-text");
wishes.forEach(wish => {
  // Split text content into words wrapped in spans
  const text = wish.innerText;
  wish.innerHTML = text.split(" ").map(word => `<span class="wish-word">${word}</span>`).join(" ");
});

const wishWords = gsap.utils.toArray(".wish-word"); // Select all words (though we'll select per sentence)

// Hide everything initially
gsap.set(wishes, { autoAlpha: 1 }); // Container visible, words hidden
gsap.set(".wish-word", {
  autoAlpha: 0,
  y: 60,
  rotateX: 90,
  scale: 0.8
});

// Create a Pinned Scroll Sequence
const wishTL = gsap.timeline({
  scrollTrigger: {
    trigger: "#wishes",
    pin: true,
    start: "top top",
    end: () => `+=${window.innerHeight * wishes.length * 2}`, // Longer scroll for drama
    scrub: 1
  }
});

// Animate each sentence
wishes.forEach((wish, i) => {
  const words = wish.querySelectorAll(".wish-word");

  // Enter: Staggered 3D Fly-in
  wishTL.to(words, {
    autoAlpha: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    duration: 2,
    stagger: 0.05,
    ease: "back.out(1.2)"
  })
    // Hold
    .to(words, {
      y: -10, // Gentle float up
      duration: 3,
      ease: "none"
    })
    // Exit: Staggered Float Away
    .to(words, {
      autoAlpha: 0,
      y: -80,
      rotateX: -45,
      scale: 1.1,
      duration: 1.5,
      stagger: 0.02,
      ease: "power2.in"
    }, "+=0.2");
});

/* ================= 4. FINAL SECTION (Signature) ================= */

// Smooth "Signing" Effect for Signature
const sigText = "- Spandan";
const sigContainer = document.getElementById("signatureText");

if (sigContainer) {
  // Set text immediately, but it's hidden by CSS width: 0
  sigContainer.textContent = sigText;

  ScrollTrigger.create({
    trigger: ".final-section",
    start: "top 60%",
    once: true,
    onEnter: () => {
      gsap.to(sigContainer, {
        width: "auto", // Reveal natural width
        duration: 3,
        ease: "power2.out", // Smooth deceleration like finishing a signature
      });
    }
  });
}



/* ================= 5. SKINCARE GIFT SECTION ================= */
const giftBox = document.getElementById('giftBox');
const skinModal = document.getElementById('skincareModal');
const skinClose = document.getElementById('skincareClose');

if (giftBox && skinModal) {
  // Open Modal
  giftBox.addEventListener('click', () => {
    skinModal.classList.add('active');
  });

  // Close Modal
  if (skinClose) {
    skinClose.addEventListener('click', () => {
      skinModal.classList.remove('active');
    });
  }

  // Close on Backdrop Click
  skinModal.addEventListener('click', (e) => {
    if (e.target === skinModal) {
      skinModal.classList.remove('active');
    }
  });

  // Optional: GSAP Entrance for Gift Box
  gsap.from("#giftBox", {
    scrollTrigger: {
      trigger: "#giftSection",
      start: "top 70%",
      toggleActions: "play none none reverse"
    },
    scale: 0,
    rotation: -10,
    duration: 0.8,
    ease: "back.out(1.7)"
  });

  gsap.from(".gift-hint", {
    scrollTrigger: {
      trigger: "#giftSection",
      start: "top 70%",
    },
    y: 20,
    opacity: 0,
    delay: 0.4,
    duration: 0.8
  });
}

// Force refresh to ensure calculations are correct
ScrollTrigger.refresh();

