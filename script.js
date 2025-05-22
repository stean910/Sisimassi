document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById("toggleBtn");
    const slider = document.getElementById("slider");
    const progressBar = document.querySelector(".progress-bar");
    const foundMessage = document.getElementById("foundMessage");
    const segments = document.querySelectorAll(".segment");
    
    // Звуки
    const sounds = {
        click: document.getElementById("clickSound"),
        start: document.getElementById("startSound"),
        beep: document.getElementById("beepSound"),
        found: document.getElementById("foundSound")
    };

    let isActive = false;
    let isDragging = false;
    let progress = 0;
    let beepInterval;

    // Инициализация
    function init() {
        // Предзагрузка звуков
        Object.values(sounds).forEach(sound => sound.load());
        
        // Обработчики
        toggleBtn.addEventListener('click', toggleGame);
        toggleBtn.addEventListener('touchend', toggleGame);
        
        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('touchstart', startDrag);
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('touchmove', handleDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function toggleGame(e) {
        e.preventDefault();
        sounds.click.play();
        isActive = !isActive;
        toggleBtn.textContent = isActive ? "🔘 ВЫКЛ" : "🔘 ВКЛ";
        
        if (isActive) {
            sounds.start.play();
            startBeepInterval();
        } else {
            stopGame();
        }
    }

    function startDrag(e) {
        if (!isActive) return;
        isDragging = true;
        e.preventDefault();
        clearInterval(beepInterval);
    }

    function handleDrag(e) {
        if (!isDragging || !isActive) return;
        
        const rect = progressBar.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        progress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        
        updateSlider();
        updateSegments();
        playBeepSound();
    }

    function endDrag() {
        isDragging = false;
        if (progress >= 95) triggerFound();
        if (isActive) startBeepInterval();
    }

    function updateSlider() {
        slider.style.left = `${progress}%`;
    }

    function updateSegments() {
        segments.forEach((seg, i) => {
            seg.style.opacity = i < Math.floor(progress / 11.11) ? '1' : '0.3';
        });
    }

    function playBeepSound() {
        if (progress % 15 < 3) {
            sounds.beep.currentTime = 0;
            sounds.beep.play();
        }
    }

    function startBeepInterval() {
        clearInterval(beepInterval);
        const speed = 1000 - (progress * 9); // Ускорение бипов
        beepInterval = setInterval(() => {
            if (!isDragging) {
                sounds.beep.currentTime = 0;
                sounds.beep.play();
            }
        }, speed);
    }

    function triggerFound() {
        sounds.found.play();
        foundMessage.style.display = 'block';
        if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
        setTimeout(() => {
            foundMessage.style.display = 'none';
            resetGame();
        }, 2000);
    }

    function resetGame() {
        progress = 0;
        updateSlider();
        updateSegments();
    }

    function stopGame() {
        clearInterval(beepInterval);
        resetGame();
    }

    init();
});
