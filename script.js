document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const nameInput = document.querySelector('#userName');
    const nameDisplays = document.querySelectorAll('.name-display');
    
    let currentIndex = 0;
    let startPos = 0;
    let isDragging = false;
    updateSlideClasses();
    updateTextColors();

    function formatText(text) {
        if (!text) return '';
        
        text = text.replace(/(\d{4})/g, '$1 ').trim();
        
        const words = text.split(' ').filter(word => word.length > 0);
        return words.join(' ');
    }

    nameInput.addEventListener('input', (e) => {
        const name = e.target.value;
        const formattedText = formatText(name);
        nameDisplays.forEach(display => {
            display.textContent = formattedText;
        });
        updateTextColors();
    });

    function updateTextColors() {
        slides.forEach((slide, index) => {
            const nameDisplay = slide.querySelector('.name-display');
            const img = slide.querySelector('img');
            if (nameDisplay && img) {
                if (img.src.includes('Length-size-W.jpg')) {
                    nameDisplay.style.color = '#1a237e';
                } else if (img.src.includes('Length-size-D.jpg')) {
                    nameDisplay.style.color = '#ffffff';
                }
                nameDisplay.style.fontWeight = '100';
                nameDisplay.style.letterSpacing = '0.5px';
            }
        });
    }

    function updateSlideClasses() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');
            
            const distance = (index - currentIndex + slides.length) % slides.length;
            
            if (distance === 0) {
                slide.classList.add('active');
            } else if (distance === 1 || distance === -(slides.length - 1)) {
                slide.classList.add('next');
            } else if (distance === -1 || distance === (slides.length - 1)) {
                slide.classList.add('prev');
            } else if (distance === 2 || distance === -(slides.length - 2)) {
                slide.classList.add('far-next');
            } else if (distance === -2 || distance === (slides.length - 2)) {
                slide.classList.add('far-prev');
            }
        });
        updateTextColors();
    }

    function moveToSlide(index, direction = 'next') {
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
            let baseTransform = '';
            let dragOffset = diff * 0.3;
            if (distance === 0) {
                baseTransform = `translateX(${dragOffset}px) translateZ(0) rotateY(${-dragOffset * 0.03}deg)`;
            } else if (distance === 1 || distance === -(slides.length - 1)) {
                baseTransform = `translateX(calc(50% + ${dragOffset}px)) translateY(0) translateZ(-300px) rotateY(${-25 - dragOffset * 0.03}deg)`;
            } else if (distance === -1 || distance === (slides.length - 1)) {
                baseTransform = `translateX(calc(-50% + ${dragOffset}px)) translateY(0) translateZ(-300px) rotateY(${25 - dragOffset * 0.03}deg)`;
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
                moveToSlide((currentIndex - 1 + slides.length) % slides.length, 'prev');
            } else {
                moveToSlide((currentIndex + 1) % slides.length, 'next');
            }
        }

        isDragging = false;
        track.style.cursor = '';
    }

    prevButton.addEventListener('click', () => {
        moveToSlide((currentIndex - 1 + slides.length) % slides.length, 'prev');
    });

    nextButton.addEventListener('click', () => {
        moveToSlide((currentIndex + 1) % slides.length, 'next');
    });


    track.addEventListener('touchstart', handleDragStart, { passive: true });
    track.addEventListener('touchmove', handleDragMove, { passive: true });
    track.addEventListener('touchend', handleDragEnd);


    track.addEventListener('mousedown', handleDragStart);
    track.addEventListener('mousemove', handleDragMove);
    track.addEventListener('mouseup', handleDragEnd);
    track.addEventListener('mouseleave', handleDragEnd);


    track.addEventListener('dragstart', e => e.preventDefault());


    const downloadBtn = document.getElementById('downloadBtn');
    
    downloadBtn.addEventListener('click', async () => {
        const activeSlide = document.querySelector('.carousel-slide.active .card');
        if (!activeSlide) return;

        const nameDisplay = activeSlide.querySelector('.name-display');
        if (nameDisplay) {
            nameDisplay.style.opacity = '1';
        }

        try {
            const canvas = await html2canvas(activeSlide, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false
            });

            const link = document.createElement('a');
            link.download = `eid-greeting-${currentIndex + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
        }
    });
});
