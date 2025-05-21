document.addEventListener('DOMContentLoaded', () => {
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

    // Initially hide player and show after CRT animation
    setTimeout(() => {
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
        // First make it visible
        playerContainer.style.display = 'flex';
        // Force a reflow to ensure the display change takes effect
        void playerContainer.offsetWidth;
        // Then add the animation class
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

    // Play/Pause toggle
    playButton.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            playButton.title = 'Pause';
            startVisualEffect();
        } else {
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            playButton.title = 'Play';
            stopVisualEffect();
        }
    });

    // Stop functionality
    stopButton.addEventListener('click', () => {
        isPlaying = false;
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        playButton.title = 'Play';
        progressBar.style.width = '0%';
        currentTime.textContent = '0:00';
        stopVisualEffect();
    });

    // Mute toggle
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
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

    // Progress bar interaction
    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        const progressBarRect = e.target.getBoundingClientRect();
        const clickPosition = e.clientX - progressBarRect.left;
        const percentage = (clickPosition / progressBarRect.width) * 100;
        progressBar.style.width = `${percentage}%`;
        
        // Update time display
        const totalSeconds = 213; // 3:33 in seconds
        const currentSeconds = Math.floor((percentage / 100) * totalSeconds);
        updateTimeDisplay(currentSeconds);
    });

    // Volume bar interaction
    document.querySelector('.volume-container').addEventListener('click', (e) => {
        const volumeBarRect = e.target.getBoundingClientRect();
        const clickPosition = e.clientX - volumeBarRect.left;
        const percentage = (clickPosition / volumeBarRect.width) * 100;
        volumeBar.style.width = `${percentage}%`;
        
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

    // Visual effect animation
    let visualEffectInterval;
    function startVisualEffect() {
        const visualEffect = document.querySelector('.visual-effect');
        visualEffect.style.animation = 'xp-pulse 4s infinite';
    }

    function stopVisualEffect() {
        const visualEffect = document.querySelector('.visual-effect');
        visualEffect.style.animation = 'none';
    }

    // Time display update
    function updateTimeDisplay(currentSeconds) {
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        currentTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Playlist item interaction
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Update track info
            const trackName = item.querySelector('span').textContent;
            document.querySelector('.track').textContent = trackName;
        });
    });

    // Animate Japanese characters
    const characters = document.querySelectorAll('.japanese-character');
    characters.forEach((char, index) => {
        char.style.animationDelay = `${index * 0.2}s`;
    });

    // Start background animation
    startVisualEffect();
}); 