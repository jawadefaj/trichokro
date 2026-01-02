document.addEventListener('DOMContentLoaded', () => {
    const galleryTrack = document.getElementById('gallery-track');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!galleryTrack) return;

    let galleryImages = [];
    let currentIndex = 0;
    let galleryInterval;

    function checkImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    async function initGallery() {
        // Efficiently load images in parallel
        const imagePromises = [];
        // Check up to 30 images
        for (let i = 1; i <= 30; i++) {
            const src = `src/assets/slideshow/${i}.jpg`;
            imagePromises.push(checkImage(src).then(exists => exists ? src : null));
        }

        const results = await Promise.all(imagePromises);
        galleryImages = results.filter(src => src !== null);

        // Fallback logic if no images found via check (e.g. local file system restrictions)
        if(galleryImages.length === 0) {
             // Try to use a default set if check failed but we hope they exist
             galleryImages = Array.from({length: 10}, (_, i) => `src/assets/slideshow/${i+1}.jpg`);
        }

        if(galleryImages.length === 0) {
             const gallerySec = document.getElementById('gallery');
             if(gallerySec) gallerySec.style.display = 'none';
             return;
        }

        // Clear existing (if any)
        galleryTrack.innerHTML = '';

        // Render
        galleryImages.forEach((src) => {
            const div = document.createElement('div');
            div.className = 'min-w-full h-full relative flex-shrink-0 cursor-pointer';
            const photoName = src.split('/').pop().split('.')[0];
            div.onclick = () => openLightbox(src, photoName);
            div.innerHTML = `
                <img src="${src}" class="w-full h-full object-cover select-none" alt="${photoName}">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-70 hover:opacity-50 transition-opacity"></div>
                <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p class="text-lg font-semibold tracking-wide drop-shadow-lg">${photoName.replace(/-/g, ' ').toUpperCase()}</p>
                </div>
            `;
            galleryTrack.appendChild(div);
        });

        startGalleryAutoSlide();
    }

    function openLightbox(src, caption) {
        if(!lightbox) return;
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.classList.remove('hidden');
        requestAnimationFrame(() => {
            lightbox.classList.remove('opacity-0');
        });
        stopGalleryAutoSlide();
    }

    function closeLightbox() {
        if(!lightbox) return;
        lightbox.classList.add('opacity-0');
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImg.src = '';
        }, 300);
        startGalleryAutoSlide();
    }

    if(lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox) closeLightbox();
        });
    }

    function updateGalleryPosition() {
        galleryTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateGalleryPosition();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateGalleryPosition();
    }

    function startGalleryAutoSlide() {
        galleryInterval = setInterval(nextSlide, 3000);
    }

    function stopGalleryAutoSlide() {
        clearInterval(galleryInterval);
    }

    if(prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => { stopGalleryAutoSlide(); prevSlide(); startGalleryAutoSlide(); });
        nextBtn.addEventListener('click', () => { stopGalleryAutoSlide(); nextSlide(); startGalleryAutoSlide(); });

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;
        const slider = document.querySelector('.gallery-slider');

        if (slider) {
            slider.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
                stopGalleryAutoSlide();
            }, {passive: true});

            slider.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
                startGalleryAutoSlide();
            }, {passive: true});
        }

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) nextSlide();
            if (touchEndX > touchStartX + 50) prevSlide();
        }
    }

    initGallery();
});
