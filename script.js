
// Carousel functionality with tilt effect
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        // Carousel elements
        const carousel = document.querySelector('.carousel');
        const cards = document.querySelectorAll('.movie-card');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const dots = document.querySelectorAll('.dot');
        const progressBars = document.querySelectorAll('.progress');

        let currentIndex = 0;
        const totalCards = cards.length;
        let progressInterval;

        // Initialize all favorite buttons
        const favButtons = document.querySelectorAll('.fav-btn');

        favButtons.forEach(fav => {
            const heart = fav.querySelector('.heart');
            fav.addEventListener('click', () => {
                const isFav = fav.classList.toggle('favorited');
                fav.setAttribute('aria-pressed', isFav ? 'true' : 'false');
                fav.title = isFav ? 'Hapus dari favorit' : 'Tambahkan ke favorit';
                heart.style.transform = isFav ? 'scale(1.08)' : 'scale(1)';
            });
        });

        // Star fill based on data-score (0-5)
        const starsWraps = document.querySelectorAll('.stars');

        starsWraps.forEach(starsWrap => {
            const scoreNum = parseFloat(starsWrap.dataset.score) || 0;
            const stars = Array.from(starsWrap.querySelectorAll('svg'));

            // Create SVG gradient for half stars if not exists
            if (!document.getElementById('half-star')) {
                const svgNS = "http://www.w3.org/2000/svg";
                const defs = document.createElementNS(svgNS, "defs");
                const gradient = document.createElementNS(svgNS, "linearGradient");
                gradient.setAttribute("id", "half-star");

                const stop1 = document.createElementNS(svgNS, "stop");
                stop1.setAttribute("offset", "50%");
                stop1.setAttribute("stop-color", "#FBBF24");

                const stop2 = document.createElementNS(svgNS, "stop");
                stop2.setAttribute("offset", "50%");
                stop2.setAttribute("stop-color", "rgba(255, 255, 255, 0.06)");

                gradient.appendChild(stop1);
                gradient.appendChild(stop2);
                defs.appendChild(gradient);
                document.body.appendChild(defs);
            }

            // Apply star ratings
            stars.forEach((star, i) => {
                if (i < Math.floor(scoreNum)) {
                    star.classList.add('filled');
                } else if (i === Math.floor(scoreNum) && scoreNum % 1 >= 0.5) {
                    star.classList.add('half-filled');
                }
            });
        });

        // Update carousel display
        function updateCarousel() {
            cards.forEach((card, index) => {
                card.classList.remove('active', 'prev', 'next');

                if (index === currentIndex) {
                    card.classList.add('active');
                } else if (index === (currentIndex - 1 + totalCards) % totalCards) {
                    card.classList.add('prev');
                } else if (index === (currentIndex + 1) % totalCards) {
                    card.classList.add('next');
                }
            });

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });

            // Update button states
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === totalCards - 1;

            // Reset and start progress bar
            resetProgressBar();
            startProgressBar();
        }

        // Navigation functions
        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel();
        }

        // Progress bar functions
        function startProgressBar() {
            clearInterval(progressInterval);
            let width = 0;
            const duration = 5000; // 5 seconds
            const interval = 50;
            const increment = (interval / duration) * 100;

            progressInterval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(progressInterval);
                    nextSlide();
                } else {
                    width += increment;
                    progressBars.forEach(bar => {
                        bar.style.width = width + '%';
                    });
                }
            }, interval);
        }

        function resetProgressBar() {
            clearInterval(progressInterval);
            progressBars.forEach(bar => {
                bar.style.width = '0%';
            });
        }

        // Event listeners for navigation
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetProgressBar();
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetProgressBar();
        });

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetProgressBar();
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetProgressBar();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetProgressBar();
            }
        });

        // Swipe functionality for touch devices
        let startX = 0;
        let endX = 0;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            resetProgressBar();
        });

        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = startX - endX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide(); // Swipe left
                } else {
                    prevSlide(); // Swipe right
                }
                resetProgressBar();
            }
        }

        // Tilt effect for active card only
        function initTiltEffect() {
            const activeCard = document.querySelector('.movie-card.active');
            if (!activeCard) return;

            let isTilting = false;

            activeCard.addEventListener('mouseenter', () => {
                isTilting = true;
                activeCard.classList.add('tilt');
            });

            activeCard.addEventListener('mouseleave', () => {
                isTilting = false;
                activeCard.style.transform = 'translateY(-12px) scale(1.02)';
                activeCard.classList.remove('tilt');
            });

            activeCard.addEventListener('mousemove', (e) => {
                if (!isTilting) return;

                const cardRect = activeCard.getBoundingClientRect();
                const centerX = cardRect.left + cardRect.width / 2;
                const centerY = cardRect.top + cardRect.height / 2;

                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;

                // Calculate rotation based on mouse position
                const rotateY = (mouseX / (cardRect.width / 2)) * 3;
                const rotateX = -(mouseY / (cardRect.height / 2)) * 3;

                activeCard.style.transform = `translateY(-12px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        }

        // Re-initialize tilt effect when carousel changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (mutation.target.classList.contains('active')) {
                        initTiltEffect();
                    }
                }
            });
        });

        cards.forEach(card => {
            observer.observe(card, { attributes: true });
        });

        // Auto-advance carousel
        startProgressBar();

        carousel.addEventListener('mouseenter', () => {
            clearInterval(progressInterval);
        });

        carousel.addEventListener('mouseleave', () => {
            startProgressBar();
        });

        // Initial setup
        updateCarousel();
        initTiltEffect();
    });
})();