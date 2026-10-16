window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    if (!dropdown || !button) return;

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');

    if (container && dropdown && button && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (!dropdown || !button) return;
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');

    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            button.classList.add('copied');
            copyText.textContent = 'Cop';

            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

function getCurrentSlideVideo(carousel) {
    const current = carousel.querySelector('.slider-item.is-current') ||
        carousel.querySelector('.slider-item.is-active') ||
        carousel.querySelector('.slider-item');
    return current ? current.querySelector('video') : null;
}

function pauseAllCarouselVideos(carousel) {
    carousel.querySelectorAll('video').forEach(function(video) {
        video.pause();
    });
}

function playCurrentCarouselVideo(carousel) {
    pauseAllCarouselVideos(carousel);
    const video = getCurrentSlideVideo(carousel);
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(function() {
        // Autoplay may be blocked until user interaction.
    });
}

// Advance only when the active video ends, or when nav buttons are pressed.
function setupVideoCarousel(carousel, instance) {
    const videos = carousel.querySelectorAll('video');
    if (videos.length === 0) return;

    videos.forEach(function(video) {
        video.removeAttribute('loop');
        video.loop = false;
        video.muted = true;
        video.setAttribute('playsinline', '');

        video.addEventListener('ended', function() {
            const active = getCurrentSlideVideo(carousel);
            if (active !== video) return;
            if (instance && typeof instance.next === 'function') {
                instance.next();
            }
        });
    });

    if (instance && typeof instance.on === 'function') {
        instance.on('before:show', function() {
            pauseAllCarouselVideos(carousel);
        });
        instance.on('after:show', function() {
            playCurrentCarouselVideo(carousel);
        });
        instance.on('show', function() {
            playCurrentCarouselVideo(carousel);
        });
    }

    // Pause when the carousel leaves the viewport; resume the current clip when visible.
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                playCurrentCarouselVideo(carousel);
            } else {
                pauseAllCarouselVideos(carousel);
            }
        });
    }, { threshold: 0.35 });
    observer.observe(carousel);

    playCurrentCarouselVideo(carousel);
}

function setupMethodAnimations() {
    var videos = document.querySelectorAll('video.method-anim');
    if (!videos.length) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            var video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(function() {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.4 });

    videos.forEach(function(video) {
        video.muted = true;
        video.loop = true;
        observer.observe(video);
    });
}

$(document).ready(function() {
    var imageOptions = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: false,
    };

    var videoOptions = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: false,
    };

    var teaser = document.querySelector('#teaser-carousel');
    var novel = document.querySelector('#novel-carousel');
    var otherCarousels = Array.prototype.slice.call(document.querySelectorAll('.carousel')).filter(function(el) {
        return el !== teaser && el !== novel;
    });

    if (otherCarousels.length) {
        bulmaCarousel.attach(otherCarousels, imageOptions);
    }

    var videoCarousels = [teaser, novel].filter(Boolean);
    videoCarousels.forEach(function(el) {
        var instances = bulmaCarousel.attach(el, videoOptions);
        var instance = Array.isArray(instances) ? instances[0] : instances;
        setupVideoCarousel(el, instance);
    });

    setupMethodAnimations();
    bulmaSlider.attach();
});
