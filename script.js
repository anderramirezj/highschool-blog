document.addEventListener('DOMContentLoaded', () => {
    // Menu button effects
    const menuItems = document.querySelectorAll('.menu-items span');
    
    menuItems[0].addEventListener('click', () => {
        // File menu - Blue confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0058ee', '#3f8cff', '#2060dd', '#1a4fc7']
        });
    });

    menuItems[1].addEventListener('click', () => {
        // View menu - Green confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00dd00', '#60ff60', '#00c700', '#009600']
        });
    });

    menuItems[2].addEventListener('click', () => {
        // Play menu - Red confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ff3333', '#ff6666', '#ff9999']
        });
    });

    menuItems[3].addEventListener('click', () => {
        // Tools menu - Rainbow confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
        });
    });

    menuItems[4].addEventListener('click', () => {
        // Help menu - Fireworks effect
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    });

    // Create CRT turn on effects
    const crtOverlay = document.createElement('div');
    crtOverlay.className = 'crt-overlay';
    document.body.appendChild(crtOverlay);

    const crtFlash = document.createElement('div');
    crtFlash.className = 'crt-flash';
    document.body.appendChild(crtFlash);

    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    document.body.appendChild(scanlines);

    // Create taskbar icon early
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar-icon';
    taskbar.innerHTML = `
        <img src="./icons/Icon_wmp.png" alt="WMP">
        <span>Windows Media Player</span>
    `;
    document.body.appendChild(taskbar);

    // Get player container reference
    const playerContainer = document.querySelector('.player-container');
    playerContainer.style.opacity = '0';
    playerContainer.style.display = 'none';

    // Initially hide player and show after CRT animation
    setTimeout(() => {
        playerContainer.style.display = 'flex';
        void playerContainer.offsetWidth; // Force reflow
        playerContainer.classList.add('player-reveal');
    }, 1800);

    // Remove overlay elements after animations complete
    setTimeout(() => {
        crtOverlay.remove();
        crtFlash.remove();
    }, 2500);

    // Window Controls
    const minimizeButton = document.querySelector('.minimize');
    const maximizeButton = document.querySelector('.maximize');
    const closeButton = document.querySelector('.close');
    
    let isMaximized = false;
    
    minimizeButton.addEventListener('click', () => {
        playerContainer.style.opacity = '0';
        setTimeout(() => {
            playerContainer.style.opacity = '1';
        }, 100);
    });
    
    maximizeButton.addEventListener('click', () => {
        if (!isMaximized) {
            playerContainer.style.width = '100vw';
            playerContainer.style.height = '100vh';
            playerContainer.style.borderRadius = '0';
            isMaximized = true;
        } else {
            playerContainer.style.width = '900px';
            playerContainer.style.height = '600px';
            playerContainer.style.borderRadius = '8px 8px 3px 3px';
            isMaximized = false;
        }
    });
    
    closeButton.addEventListener('click', () => {
        playerContainer.classList.add('closing');
        
        setTimeout(() => {
            playerContainer.style.display = 'none';
            playerContainer.classList.remove('closing');
            playerContainer.classList.remove('player-reveal');
            taskbar.classList.add('visible');
        }, 300);
    });

    // Taskbar handler
    taskbar.addEventListener('click', () => {
        playerContainer.style.display = 'flex';
        void playerContainer.offsetWidth;
        playerContainer.classList.add('restoring');
        taskbar.classList.remove('visible');
    });

    // Listen for animation end
    playerContainer.addEventListener('animationend', (e) => {
        if (e.animationName === 'windowRestore') {
            playerContainer.classList.remove('restoring');
            playerContainer.style.display = 'flex';
            playerContainer.style.opacity = '1';
            playerContainer.style.transform = 'scale(1) translateY(0)';
        }
    });

    // Media Player Controls
    const playButton = document.querySelector('.play');
    const stopButton = document.querySelector('.stop');
    const muteButton = document.querySelector('.mute');
    const progressBar = document.querySelector('.progress');
    const volumeBar = document.querySelector('.volume');
    const currentTime = document.querySelector('.current');
    const totalTime = document.querySelector('.total');
    
    let isPlaying = false;
    let isMuted = false;

    // Dynamically populate playlist from music folder
    const playlistItemsContainer = document.querySelector('.playlist-items');
    const musicFiles = [
        'yeule - x w x.opus',
        'The Hellp - meant2be.opus',
        'Sweet Trip - Dsco.opus',
        'Snow Strippers - Back N Forth.opus',
        'Magdalena Bay - You Lose!.opus',
        'fakemink, Ecco2k, Mechatok - MAKKA.opus',
        'Ecco2k, Bladee - Amygdala.opus',
        'Charli xcx - Everything is romantic.opus',
        'Candy Claws - Pangaea Girls (Magic Feeling).opus',
        'Bassvictim - Alice.opus',
        '2hollis - two bad.opus'
    ];

    // All code that uses musicFiles is now below this point
    let durations = Array(musicFiles.length).fill('--:--');
    const audioPlayer = document.getElementById('audio-player');
    let currentTrackIndex = null;

    // Helper to format seconds as mm:ss
    function formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Load durations for all tracks
    musicFiles.forEach((file, idx) => {
        const audio = new Audio(`music/${file}`);
        audio.addEventListener('loadedmetadata', () => {
            durations[idx] = formatTime(audio.duration);
            // Update duration in playlist
            const item = playlistItemsContainer.children[idx];
            if (item) {
                item.querySelector('.duration').textContent = durations[idx];
            }
        });
    });

    // Populate playlist
    playlistItemsContainer.innerHTML = '';
    musicFiles.forEach(file => {
        const displayName = file.replace(/\.opus$/, '');
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.innerHTML = `<i class="fas fa-music"></i><span>${displayName}</span><span class="duration">--:--</span>`;
        playlistItemsContainer.appendChild(item);
    });

    // Play track by index
    function playTrack(idx) {
        const file = musicFiles[idx];
        audioPlayer.src = `music/${file}`;
        audioPlayer.play();
        currentTrackIndex = idx;
        // Update UI
        document.querySelectorAll('.playlist-item').forEach((i, j) => {
            i.classList.toggle('active', j === idx);
        });
        // Parse and show info
        const displayName = file.replace(/\.opus$/, '');
        let artist = '', song = displayName;
        if (displayName.includes(' - ')) {
            [artist, song] = displayName.split(' - ', 2);
        }
        artistElem.textContent = artist;
        trackElem.textContent = song;
        trackMetaElem.textContent = ''; // Remove album metadata
    }

    // Play next track automatically
    audioPlayer.addEventListener('ended', () => {
        progressBar.style.width = '0%';
        currentTime.textContent = '0:00';
        // Play next track if available
        if (currentTrackIndex !== null && currentTrackIndex < musicFiles.length - 1) {
            playTrack(currentTrackIndex + 1);
        } else {
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            playButton.title = 'Play';
            stopVisualEffect();
        }
    });

    // Playlist item click logic (update play button state)
    document.querySelectorAll('.playlist-item').forEach((item, idx) => {
        item.addEventListener('click', () => {
            playTrack(idx);
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            playButton.title = 'Pause';
            startVisualEffect();
        });
    });

    // Audio player events: update progress bar and time
    audioPlayer.addEventListener('timeupdate', () => {
        if (!audioPlayer.duration) return;
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        totalTime.textContent = formatTime(audioPlayer.duration);
    });
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTime.textContent = formatTime(audioPlayer.duration);
    });

    // Play/Pause toggle
    playButton.addEventListener('click', () => {
        if (!audioPlayer.src) return;
        if (audioPlayer.paused) {
            audioPlayer.play();
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            playButton.title = 'Pause';
            startVisualEffect();
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            playButton.title = 'Play';
            stopVisualEffect();
        }
    });

    // Stop functionality
    stopButton.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        playButton.title = 'Play';
        progressBar.style.width = '0%';
        currentTime.textContent = '0:00';
        totalTime.textContent = '0:00';
        stopVisualEffect();
    });

    // Progress bar interaction (fix bug)
    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        if (!audioPlayer.duration) return;
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = (clickPosition / rect.width);
        audioPlayer.currentTime = percentage * audioPlayer.duration;
    });

    // Mute toggle
    muteButton.addEventListener('click', () => {
        audioPlayer.muted = !audioPlayer.muted;
        isMuted = audioPlayer.muted;
        if (isMuted) {
            muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            muteButton.title = 'Unmute';
            volumeBar.style.width = '0%';
        } else {
            muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            muteButton.title = 'Mute';
            volumeBar.style.width = '70%';
        }
    });

    // Volume bar visual and logic
    function setVolumeBar(vol) {
        volumeBar.style.width = `${vol * 100}%`;
    }
    // Initialize volume bar
    setVolumeBar(audioPlayer.volume);
    document.querySelector('.volume-container').addEventListener('click', (e) => {
        const volumeBarRect = e.currentTarget.getBoundingClientRect();
        const clickPosition = e.clientX - volumeBarRect.left;
        const percentage = Math.max(0, Math.min(1, clickPosition / volumeBarRect.width));
        audioPlayer.volume = percentage;
        setVolumeBar(percentage);
        if (percentage === 0) {
            muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            muteButton.title = 'Unmute';
            isMuted = true;
        } else {
            muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            muteButton.title = 'Mute';
            isMuted = false;
        }
    });
    // Update volume bar on volume change
    audioPlayer.addEventListener('volumechange', () => {
        setVolumeBar(audioPlayer.volume);
    });

    // Simplified visual effect
    function startVisualEffect() {
        const visualEffect = document.querySelector('.visual-effect');
        visualEffect.style.animation = 'xp-pulse 4s infinite';
    }

    function stopVisualEffect() {
        const visualEffect = document.querySelector('.visual-effect');
        visualEffect.style.animation = 'none';
    }

    // Sidebar selection logic
    const screens = {
        'now-playing': document.querySelector('.now-playing-screen'),
        'videos': document.querySelector('.videos-screen'),
        'photography': document.querySelector('.photography-screen'),
        'graphic-design': document.querySelector('.graphic-design-screen'),
        'bio': document.querySelector('.bio-screen'),
        'contact': document.querySelector('.contact-screen'),
    };
    const audioControlsContainer = document.querySelector('.audio-controls-container');

    // --- SIDEBAR SCREEN SWITCHING WITH ANIMATION ---
    function showScreen(key) {
        Object.keys(screens).forEach(k => {
            if (k === key) {
                screens[k].classList.add('visible');
            } else {
                screens[k].classList.remove('visible');
            }
        });
        if (key === 'now-playing') {
            audioControlsContainer.classList.add('visible');
            // Ensure visual effect is running
            const visualEffect = document.querySelector('.visual-effect');
            if (visualEffect) visualEffect.style.animation = 'xp-pulse 4s infinite';
        } else {
            audioControlsContainer.classList.remove('visible');
        }
    }
    // Initial state
    showScreen('now-playing');
    document.querySelectorAll('.sidebar div').forEach(btn => {
        btn.addEventListener('click', () => {
            // Sidebar highlight
            document.querySelectorAll('.sidebar div').forEach(i => i.classList.remove('selected'));
            btn.classList.add('selected');
            // Show only the relevant screen with animation
            Object.keys(screens).forEach(key => {
                if (btn.classList.contains(key)) {
                    showScreen(key);
                }
            });
        });
    });

    // Track info logic
    const artistElem = document.querySelector('.artist');
    const trackElem = document.querySelector('.track');
    const trackMetaElem = document.querySelector('.track-meta');
    const playlistTitleElem = document.querySelector('.playlist-title');

    // Show playlist name by default
    function showPlaylistTitle() {
        artistElem.textContent = '';
        trackElem.textContent = 'Ander\'s tunes collection';
        trackMetaElem.textContent = '';
        progressBar.style.width = '0%';
        currentTime.textContent = '0:00';
        totalTime.textContent = '0:00';
    }
    showPlaylistTitle();

    // Deselect all tracks by default
    document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));

    // Simplified Japanese character animations
    const characters = document.querySelectorAll('.japanese-character');
    characters.forEach((char, index) => {
        char.style.animationDelay = `${index * 0.2}s`;
    });

    // Start background animation
    startVisualEffect();

    // --- WELCOME OVERLAY BLUR/BUTTON LOGIC (MOVED TO END FOR RELIABILITY) ---
    setTimeout(() => {
        const welcomeOverlay = document.querySelector('.welcome-overlay');
        const enterBtn = document.querySelector('.enter-portfolio');
        if (welcomeOverlay && enterBtn) {
            playerContainer.classList.add('blurred');
            enterBtn.onclick = () => {
                welcomeOverlay.style.opacity = '0';
                setTimeout(() => {
                    welcomeOverlay.style.display = 'none';
                    playerContainer.classList.remove('blurred');
                }, 400);
            };
            console.log('Welcome overlay logic attached');
        } else {
            console.log('Welcome overlay or button not found');
        }
    }, 0);

    // --- VIDEO MODAL LOGIC ---
    const videoModal = document.querySelector('.video-modal');
    const modalIframe = document.querySelector('.modal-iframe');
    const modalClose = document.querySelector('.video-modal-close');
    const modalBackdrop = videoModal.querySelector('.video-modal-backdrop');
    document.querySelectorAll('.videos-screen .explorer-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling to other modals
            const embedUrl = item.getAttribute('data-vimeo-embed');
            modalIframe.src = embedUrl;
            videoModal.style.display = 'flex';
            setTimeout(() => videoModal.classList.add('visible'), 10);
        });
    });
    function closeModal() {
        videoModal.classList.remove('visible');
        setTimeout(() => {
            videoModal.style.display = 'none';
            modalIframe.src = '';
        }, 300);
    }
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (videoModal.classList.contains('visible') && (e.key === 'Escape' || e.key === 'Esc')) closeModal();
    });

    // --- PHOTO MODAL LOGIC ---
    const photoModal = document.querySelector('.photo-modal');
    const modalPhoto = document.querySelector('.modal-photo');
    const photoModalClose = document.querySelector('.photo-modal-close');
    const photoModalBackdrop = photoModal.querySelector('.photo-modal-backdrop');
    document.querySelectorAll('.photography-screen .explorer-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling to other modals
            const photoUrl = item.getAttribute('data-photo');
            modalPhoto.src = photoUrl;
            photoModal.style.display = 'flex';
            setTimeout(() => photoModal.classList.add('visible'), 10);
        });
    });
    function closePhotoModal() {
        photoModal.classList.remove('visible');
        setTimeout(() => {
            photoModal.style.display = 'none';
            modalPhoto.src = '';
        }, 300);
    }
    photoModalClose.addEventListener('click', closePhotoModal);
    photoModalBackdrop.addEventListener('click', closePhotoModal);
    document.addEventListener('keydown', (e) => {
        if (photoModal.classList.contains('visible') && (e.key === 'Escape' || e.key === 'Esc')) closePhotoModal();
    });

    // --- DESIGN MODAL LOGIC ---
    const designModal = document.querySelector('.design-modal');
    const modalDesign = document.querySelector('.modal-design');
    const designModalClose = document.querySelector('.design-modal-close');
    const designModalBackdrop = designModal.querySelector('.design-modal-backdrop');
    document.querySelectorAll('.graphic-design-screen .explorer-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const designUrl = item.getAttribute('data-design');
            modalDesign.src = designUrl;
            designModal.style.display = 'flex';
            setTimeout(() => designModal.classList.add('visible'), 10);
        });
    });
    function closeDesignModal() {
        designModal.classList.remove('visible');
        setTimeout(() => {
            designModal.style.display = 'none';
            modalDesign.src = '';
        }, 300);
    }
    designModalClose.addEventListener('click', closeDesignModal);
    designModalBackdrop.addEventListener('click', closeDesignModal);
    document.addEventListener('keydown', (e) => {
        if (designModal.classList.contains('visible') && (e.key === 'Escape' || e.key === 'Esc')) closeDesignModal();
    });

    // Next/Previous button logic
    document.querySelector('.next').addEventListener('click', () => {
        if (currentTrackIndex === null) return;
        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= musicFiles.length) nextIndex = 0;
        playTrack(nextIndex);
        playButton.innerHTML = '<i class="fas fa-pause"></i>';
        playButton.title = 'Pause';
        startVisualEffect();
    });
    document.querySelector('.prev').addEventListener('click', () => {
        if (currentTrackIndex === null) return;
        let prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = musicFiles.length - 1;
        playTrack(prevIndex);
        playButton.innerHTML = '<i class="fas fa-pause"></i>';
        playButton.title = 'Pause';
        startVisualEffect();
    });
}); 