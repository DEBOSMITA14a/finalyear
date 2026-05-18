export class InteractiveCards {
  constructor() {
    this.wrappers = document.querySelectorAll('.interactive-cards-wrapper');
    
    if (this.wrappers.length === 0) return;

    this.wrappers.forEach(wrapper => {
      this.initWrapper(wrapper);
    });
  }

  initWrapper(wrapper) {
    const container = wrapper.querySelector('.interactive-cards-container');
    const cards = Array.from(container.querySelectorAll('.i-card'));
    const btnLeft = wrapper.querySelector('.left-arrow');
    const btnRight = wrapper.querySelector('.right-arrow');

    if (!cards.length) return;

    let currentIndex = 0; // Start with first card centered

    const updateCards = () => {
      cards.forEach((card, index) => {
        // Remove all state attributes
        card.removeAttribute('data-state');
        card.style.zIndex = '';

        const len = cards.length;
        let relativeDiff = (index - currentIndex + len) % len;
        // if relativeDiff is more than half the cards, it wraps around to the left side
        if (relativeDiff > Math.floor(len / 2)) {
          relativeDiff -= len;
        }

        if (relativeDiff === 0) {
          card.setAttribute('data-state', 'center');
          card.style.zIndex = 10;
        } else if (relativeDiff === -1) {
          card.setAttribute('data-state', 'left-1');
          card.style.zIndex = 5;
        } else if (relativeDiff === 1) {
          card.setAttribute('data-state', 'right-1');
          card.style.zIndex = 4;
        } else if (relativeDiff === -2) {
          card.setAttribute('data-state', 'left-2');
          card.style.zIndex = 3;
        } else if (relativeDiff === 2) {
          card.setAttribute('data-state', 'right-2');
          card.style.zIndex = 2;
        } else {
          card.setAttribute('data-state', relativeDiff < 0 ? 'left-3' : 'right-3');
          card.style.zIndex = 1;
        }
      });
    };

    // Initial render
    updateCards();

    // Event Listeners
    if (btnLeft) {
      btnLeft.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : cards.length - 1;
        updateCards();
      });
    }

    if (btnRight) {
      btnRight.addEventListener('click', () => {
        currentIndex = (currentIndex < cards.length - 1) ? currentIndex + 1 : 0;
        updateCards();
      });
    }

    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (currentIndex !== index) {
          currentIndex = index;
          updateCards();
        }
      });
    });
  }
}
