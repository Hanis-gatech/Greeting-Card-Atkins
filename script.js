document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  const nameInput = document.querySelector('#userName');
  const nameDisplays = document.querySelectorAll('.name-display');
  const downloadBtn = document.getElementById('downloadBtn');

  const MAX_CHARS = 20;

  let currentIndex = 0;
  let startPos = 0;
  let isDragging = false;

  updateSlideClasses();
  applyTextToAllSlides(nameInput.value);
  updateTextColors();

  function formatText(text) {
    if (!text) return '';

    const cleaned = text.replace(/(\d{4})/g, '$1 ').trim();
    const words = cleaned.split(' ').filter(w => w.length > 0);
    return words.join(' ');
  }

  function clampToMaxChars(text) {
    if (!text) return '';
    return text.slice(0, MAX_CHARS);
  }

  function applyTextToAllSlides(rawText) {
    const limited = clampToMaxChars(rawText);
    const formatted = formatText(limited);

    nameDisplays.forEach(display => {
      display.textContent = formatted;
    });
  }

  nameInput.addEventListener('input', (e) => {
    let value = e.target.value || '';
    value = clampToMaxChars(value);

    if (e.target.value !== value) {
      e.target.value = value;
    }

    applyTextToAllSlides(value);
    updateTextColors();
  });

  function updateTextColors() {
    slides.forEach(slide => {
      const nameDisplay = slide.querySelector('.name-display');
      if (!nameDisplay) return;

      const color = slide.dataset.textColor || '#ffffff';
      nameDisplay.style.color = color;
      nameDisplay.style.fontWeight = '300';
      nameDisplay.style.letterSpacing = '0.3px';
      nameDisplay.style.opacity = '1';
    });
  }

  function updateSlideClasses() {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');

      const distance = (index - currentIndex + slides.length) % slides.length;

      if (distance === 0) {
        slide.classList.add('active');
      } else if (distance === 1 || distance === slides.length - 1) {
        slide.classList.add('next');
      } else if (distance === slides.length - 1 || distance === -1) {
        slide.classList.add('prev');
      } else if (distance === 2 || distance === slides.length - 2) {
        slide.classList.add('far-next');
      } else if (distance === slides.length - 2 || distance === -2) {
        slide.classList.add('far-prev');
      }
    });

    updateTextColors();
  }

  function moveToSlide(index) {
    if (index === currentIndex) return;

    slides.forEach((slide, i) => {
      const distance = Math.abs(i - currentIndex);
      const newDistance = Math.abs(i - index);
      if (distance > 2 && newDistance > 2) {
        slide.style.transition = 'none';
      }
    });

    track.offsetHeight;

    setTimeout(() => {
      slides.forEach(slide => {
        slide.style.transition = '';
      });
    }, 50);

    currentIndex = index;
    updateSlideClasses();
  }

  function handleDragStart(e) {
    startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    isDragging = true;
    track.style.cursor = 'grabbing';
  }

  function handleDragMove(e) {
    if (!isDragging) return;

    const currentPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const diff = currentPos - startPos;

    slides.forEach((slide, index) => {
      const distance = (index - currentIndex + slides.length) % slides.length;
      const dragOffset = diff * 0.3;

      let baseTransform = '';

      if (distance === 0) {
        baseTransform = `translateX(${dragOffset}px) translateZ(0) rotateY(${-dragOffset * 0.03}deg)`;
      } else if (distance === 1 || distance === slides.length - 1) {
        baseTransform = `translateX(calc(50% + ${dragOffset}px)) translateZ(-300px) rotateY(${-25 - dragOffset * 0.03}deg)`;
      } else if (distance === slides.length - 1 || distance === -1) {
        baseTransform = `translateX(calc(-50% + ${dragOffset}px)) translateZ(-300px) rotateY(${25 - dragOffset * 0.03}deg)`;
      }

      if (baseTransform) {
        slide.style.transform = baseTransform;
      }
    });
  }

  function handleDragEnd(e) {
    if (!isDragging) return;

    const currentPos = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].clientX;
    const diff = currentPos - startPos;

    slides.forEach(slide => {
      slide.style.transform = '';
    });

    if (Math.abs(diff) > 100) {
      if (diff > 0) {
        moveToSlide((currentIndex - 1 + slides.length) % slides.length);
      } else {
        moveToSlide((currentIndex + 1) % slides.length);
      }
    }

    isDragging = false;
    track.style.cursor = '';
  }

  prevButton.addEventListener('click', () => {
    moveToSlide((currentIndex - 1 + slides.length) % slides.length);
  });

  nextButton.addEventListener('click', () => {
    moveToSlide((currentIndex + 1) % slides.length);
  });

  track.addEventListener('touchstart', handleDragStart, { passive: true });
  track.addEventListener('touchmove', handleDragMove, { passive: true });
  track.addEventListener('touchend', handleDragEnd);

  track.addEventListener('mousedown', handleDragStart);
  track.addEventListener('mousemove', handleDragMove);
  track.addEventListener('mouseup', handleDragEnd);
  track.addEventListener('mouseleave', handleDragEnd);

  track.addEventListener('dragstart', e => e.preventDefault());

  downloadBtn.addEventListener('click', async () => {
    const exportArea = document.querySelector('.carousel-slide.active .export-area');
    if (!exportArea) return;

    const rect = exportArea.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);

    const prevTransform = exportArea.style.transform;
    exportArea.style.transform = 'none';

    try {
      const canvas = await html2canvas(exportArea, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: w,
        height: h,
        windowWidth: w,
        windowHeight: h
      });

      const a = document.createElement('a');
      a.download = `greeting-card-${currentIndex + 1}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      exportArea.style.transform = prevTransform;
    }
  });
});

