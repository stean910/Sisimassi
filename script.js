document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const toggleBtn = document.getElementById("toggleBtn");
    const verticalSlider = document.getElementById("verticalSlider");
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

    // Состояние игры
    let isActive = false;
    let isDragging = false;
    let progress = 0;
    let beepInterval;
    let lastTapTime = 0;

    // Инициализация
    function init() {
        // Предзагрузка звуков
        Object.values(sounds).forEach(sound => {
            sound.load();
            sound.volume = 1.0;
        });
        
        // Обработчики кнопки
        toggleBtn.addEventListener('click', handleToggle);
        toggleBtn.addEventListener('touchend', function(e) {
            // Антидребезг для тачей
            const now = Date.now();
            if (now - lastTapTime < 300) return;
            lastTapTime = now;
            handleToggle(e);
        });
        
        // Обработчики ползунка
        verticalSlider.addEventListener('mousedown', startDrag);
        verticalSlider.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('touchmove', handleDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function handleToggle(e) {
        e.preventDefault();
        sounds.click.play().catch(e => console.log("Sound error:", e));
        
        isActive = !isActive;
        toggleBtn.textContent = isActive ? "🔘 ВЫКЛ" : "🔘 ВКЛ";
        
        if (isActive) {
            sounds.start.play().then(() => {
                resetProgress();
            }).catch(e => console.log("Start sound error:", e));
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
        
        const rect = verticalSlider.parentElement.getBoundingClientRect();
        const clientY = e.clientY || (e.touches[0] ? e.touches[0].clientY : 0);
        progress = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / rect.height) * 100));
        
        updateSlider();
        updateProgressBar();
        playBeepSound();
    }

    function endDrag() {
        isDragging = false;
        if (progress >= 95) {
            triggerFound();
        } else if (isActive) {
            startBeepInterval();
        }
    }

    function updateSlider() {
        verticalSlider.style.bottom = `${progress}%`;
    }

    function updateProgressBar() {
        segments.forEach((seg, i) => {
            seg.style.opacity = i < Math.floor(progress / 11.11) ? '1' : '0.3';
        });
    }

    function playBeepSound() {
        if (progress % 15 < 3) {
            sounds.beep.currentTime = 0;
            sounds.beep.play().catch(e => console.log("Beep error:", e));
        }
    }

    function startBeepInterval() {
        clearInterval(beepInterval);
        const baseDelay = 1000;
        const speedFactor = Math.max(0.1, 1 - (progress / 115));
        
        beepInterval = setInterval(() => {
            if (!isDragging && isActive) {
                sounds.beep.currentTime = 0;
                sounds.beep.play().catch(e => console.log("Beep error:", e));
            }
        }, baseDelay * speedFactor);
    }

    function triggerFound() {
        sounds.found.play().catch(e => console.log("Found sound error:", e));
        foundMessage.style.display = 'block';
        if (navigator.vibrate) navigator.vibrate([500]);
        setTimeout(() => {
            foundMessage.style.display = 'none';
            resetProgress();
        }, 2000);
    }

    function resetProgress() {
        progress = 0;
        updateSlider();
        updateProgressBar();
        if (isActive) startBeepInterval();
    }

    function stopGame() {
        clearInterval(beepInterval);
        progress = 0;
        updateSlider();
        updateProgressBar();
    }

    init();
});
