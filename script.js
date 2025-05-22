document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const toggleBtn = document.getElementById("toggleBtn");
    const slider = document.getElementById("slider");
    const progressContainer = document.getElementById("progressContainer");
    const foundMessage = document.getElementById("foundMessage");
    
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
    let touchStartTime = 0;

    // Инициализация
    function init() {
        // Предзагрузка звуков
        Object.values(sounds).forEach(sound => {
            sound.load();
            sound.volume = 1.0;
        });
        
        // Обработчики кнопки
        toggleBtn.addEventListener('touchstart', handleTouchStart, { passive: true });
        toggleBtn.addEventListener('touchend', handleToggle, { passive: true });
        toggleBtn.addEventListener('click', handleToggle);
        
        // Обработчики ползунка
        slider.addEventListener('touchstart', handleSliderStart, { passive: false });
        progressContainer.addEventListener('touchmove', handleSliderMove, { passive: false });
        progressContainer.addEventListener('touchend', handleSliderEnd);
        
        // Для десктопов
        slider.addEventListener('mousedown', handleSliderStart);
        document.addEventListener('mousemove', handleSliderMove);
        document.addEventListener('mouseup', handleSliderEnd);
    }

    function handleTouchStart() {
        touchStartTime = Date.now();
    }

    function handleToggle(e) {
        if (e.type === 'touchend' && Date.now() - touchStartTime < 100) return;
        
        e.preventDefault();
        sounds.click.play().catch(e => console.log("Sound error:", e));
        
        isActive = !isActive;
        toggleBtn.textContent = isActive ? "🔘 ВЫКЛ" : "🔘 ВКЛ";
        
        if (isActive) {
            sounds.start.play().then(() => {
                resetProgress();
            }).catch(e => {
                console.log("Start sound error:", e);
                resetProgress();
            });
        } else {
            stopGame();
        }
    }

    // Вертикальная логика
    function handleSliderStart(e) {
        if (!isActive) return;
        isDragging = true;
        e.preventDefault();
        clearInterval(beepInterval);
        updateSliderPosition(e);
    }

    function handleSliderMove(e) {
        if (!isDragging || !isActive) return;
        e.preventDefault();
        updateSliderPosition(e);
    }

    function handleSliderEnd() {
        if (!isActive) return;
        isDragging = false;
        if (progress >= 100) {
            triggerFound();
        } else {
            startBeepInterval();
        }
    }

    function updateSliderPosition(e) {
        const rect = progressContainer.getBoundingClientRect();
        const clientY = e.clientY || (e.touches[0] ? e.touches[0].clientY : 0);
        progress = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / rect.height) * 100));
        
        slider.style.bottom = `${progress}%`;
        updateSegments();
        playBeepSound();
    }

    function updateSegments() {
        document.querySelectorAll('.segment').forEach((seg, i) => {
            seg.style.opacity = i < 9 - Math.floor(progress / 11.11) ? '0.3' : '1';
        });
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
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
        setTimeout(() => {
            foundMessage.style.display = 'none';
            resetProgress();
        }, 2000);
    }

    function resetProgress() {
        progress = 0;
        slider.style.bottom = "0%";
        updateSegments();
        if (isActive) startBeepInterval();
    }

    function stopGame() {
        clearInterval(beepInterval);
        progress = 0;
        slider.style.bottom = "0%";
        updateSegments();
    }

    init();
});
