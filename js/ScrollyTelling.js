import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollyTelling {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    this.context = this.canvas.getContext('2d');
    
    this.frameCount = 99;
    this.images = [];
    this.imageSeq = { frame: 0 };
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Preload images
    for (let i = 1; i <= this.frameCount; i++) {
      const img = new Image();
      // ezgif-frame-001.jpg
      const frameStr = String(i).padStart(3, '0');
      img.src = `/image/ezgif-frame-${frameStr}.jpg`;
      this.images.push(img);
    }

    // Load first frame
    this.images[0].onload = () => {
      this.render();
    };

    // Setup sequence animation
    gsap.to(this.imageSeq, {
      frame: this.frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "#hero-section",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5, // 0.5s smoothing
      },
      onUpdate: () => this.render()
    });

    // Setup text beats
    this.setupTextBeats();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.render();
  }

  render() {
    if (!this.images[this.imageSeq.frame]) return;
    const img = this.images[this.imageSeq.frame];
    
    if (img.complete) {
      // Calculate object-fit contain manually for canvas
      const canvasRatio = this.canvas.width / this.canvas.height;
      const imgRatio = img.width / img.height;
      let renderWidth = this.canvas.width;
      let renderHeight = this.canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        renderWidth = this.canvas.width;
        renderHeight = this.canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (this.canvas.height - renderHeight) / 2;
      } else {
        renderHeight = this.canvas.height;
        renderWidth = this.canvas.height * imgRatio;
        offsetY = 0;
        offsetX = (this.canvas.width - renderWidth) / 2;
      }

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    }
  }

  setupTextBeats() {
    const beats = gsap.utils.toArray('.text-beat');
    
    // Split text into words for stagger animation
    const splitText = (el) => {
      const text = el.innerText;
      el.innerHTML = '';
      text.split(' ').forEach(word => {
        const span = document.createElement('span');
        span.className = 'word';
        span.innerText = word + ' ';
        el.appendChild(span);
      });
    };

    beats.forEach((beat, i) => {
      const h2 = beat.querySelector('h2');
      const p = beat.querySelector('p');
      if (h2) splitText(h2);
      if (p) splitText(p);
      const words = beat.querySelectorAll('.word');
      // Divide the total scroll area into equal parts for each text beat
      const part = 1 / beats.length;
      const startProgress = i * part;
      const endProgress = startProgress + part;
      
      // Calculate actual pixel values based on 500vh
      const scrollHeight = window.innerHeight * 5; 
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero-section",
          start: `${startProgress * 100}% top`,
          end: `${endProgress * 100}% top`,
          scrub: true,
        }
      });
      
      // Beat wrapper visible instantly for the duration to let word stagger do the fading
      tl.fromTo(beat, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 })
        
        // Word stagger in
        .fromTo(words, 
          { autoAlpha: 0, y: 30, filter: 'blur(8px)', scale: 0.95 }, 
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', scale: 1, stagger: 0.05, duration: 0.3 }
        )
        
        // Stay completely visible
        .to(beat, { autoAlpha: 1, duration: 0.4 })
        
        // Fade whole block out
        .to(beat, { autoAlpha: 0, y: -50, duration: 0.2, ease: "power2.inOut" });
    });

    // Fade out canvas at the end
    gsap.to(this.canvas, {
      autoAlpha: 0,
      scrollTrigger: {
        trigger: "#hero-section",
        start: "85% top", // Near the end
        end: "bottom top",
        scrub: true
      }
    });
  }
}
