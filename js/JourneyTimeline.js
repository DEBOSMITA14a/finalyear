import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class JourneyTimeline {
  constructor() {
    this.core = document.getElementById('neuro-core');
    this.init();
  }

  init() {
    // Helper to split text into words for animation
    const splitTextAndAnimate = (selector, triggerSection) => {
      const elements = document.querySelectorAll(`${triggerSection} ${selector}`);
      elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = '';
        text.split(' ').forEach(word => {
          const span = document.createElement('span');
          span.className = 'word';
          span.innerText = word + ' ';
          el.appendChild(span);
        });

        const words = el.querySelectorAll('.word');
        gsap.fromTo(words, 
          { autoAlpha: 0, y: 30, filter: 'blur(8px)', scale: 0.95 },
          { 
            autoAlpha: 1, y: 0, filter: 'blur(0px)', scale: 1, 
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: triggerSection,
              start: "top 75%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    };

    // Generic helper for staggered lists/cards
    const staggerItems = (selector, triggerSection, startOffset = "top 75%") => {
      gsap.fromTo(`${triggerSection} ${selector}`, 
        { autoAlpha: 0, y: 40 },
        { 
          autoAlpha: 1, y: 0, 
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: triggerSection,
            start: startOffset,
            toggleActions: "play none none reverse"
          }
        }
      );
    };

    // Initialize animations for each section
    for (let i = 1; i <= 9; i++) {
      const sectionId = `#section-${i}`;
      
      // Animate text words
      splitTextAndAnimate('.animate-words', sectionId);

      // Specific staggered components per section
      if (i === 1 || i === 4 || i === 6 || i === 8) {
        staggerItems('.stagger-list li', sectionId, "top 60%");
      }
      if (i === 2 || i === 3) {
        staggerItems('.minimal-card', sectionId, "top 65%");
      }
      if (i === 5) {
        staggerItems('.step', sectionId, "top 60%");
      }
      if (i === 9) {
        staggerItems('.hero-actions', sectionId, "top 80%");
      }
    }

    // Keep Neuro Core moving dynamically down the journey
    if (this.core) {
      gsap.fromTo(this.core, 
        { autoAlpha: 0, scale: 0.5 },
        { 
          autoAlpha: 1, scale: 1, 
          scrollTrigger: { trigger: "#section-1", start: "top bottom", end: "top 50%", scrub: true }
        }
      );

      gsap.to(this.core, {
        y: () => document.querySelector('.journey-container').offsetHeight * 0.8,
        ease: "none",
        scrollTrigger: {
          trigger: ".journey-container",
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
      
      gsap.to(this.core, {
        rotate: 360 * 2,
        ease: "none",
        scrollTrigger: {
          trigger: ".journey-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 2
        }
      });
    }
  }
}
