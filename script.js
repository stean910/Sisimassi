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
        
        // Фикс бага 10: раздельные обработчики для тача и клика
        toggleBtn.addEventListener('touchstart', handleTouchStart, { passive: true });
        toggleBtn.addEventListener('touchend', handleToggle, { passive: true });
        toggleBtn.addEventListener('click', handleToggle);
        
        // Фикс бага 8: улучшенное управление ползунком
        slider.addEventListener('touchstart', handleSliderStart, { passive: false });
        progressContainer.addEventListener('touchmove', handleSliderMove, { passive: false });
        progressContainer.addEventListener('touchend', handleSliderEnd);
        
        // Для десктопов
        slider.addEventListener('mousedown', handleSliderStart);
        document.addEventListener('mousemove', handleSliderMove);
        document.addEventListener('mouseup', handleSliderEnd);
    }

    // Фикс бага 10: антидребезг для кнопки
    function handleTouchStart() {
        touchStartTime = Date.now();
    }

    function handleToggle(e) {
        // Игнорируем короткие тапы (менее 100ms)
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

    // Логика ползунка (фикс бага 8)
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
            startBeepInterval(); // Фикс бага 9
        }
    }

    function updateSliderPosition(e) {
        const rect = progressContainer.getBoundingClientRect();
        const clientX = e.clientX || (e.touches[0] ? e.touches[0].clientX : 0);
        progress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        
        updateSlider();
        playBeepSound();
    }

    // Фикс бага 9: плавное ускорение бипов
    function startBeepInterval() {
        clearInterval(beepInterval);
        const baseDelay = 1000;
        // Нелинейное ускорение (быстрее на высоких значениях)
        const speedFactor = Math.max(0.1, 1 - (progress / 115));
        
        beepInterval = setInterval(() => {
            if (!isDragging && isActive) {
                sounds.beep.currentTime = 0;
                sounds.beep.play().catch(e => console.log("Beep error:", e));
            }
        }, baseDelay * speedFactor);
    }

    function playBeepSound() {
        if (progress % 15 < 3) {
            sounds.beep.currentTime = 0;
            sounds.beep.play().catch(e => console.log("Beep error:", e));
        }
    }

    // Остальные функции остаются без изменений
    // ... (updateSlider, triggerFound, resetProgress, stopGame)
    
    init();
});
