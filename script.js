document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const toggleBtn = document.getElementById("toggleBtn");
    const slider = document.getElementById("slider");
    const progressContainer = document.getElementById("progressContainer");
    const foundMessage = document.getElementById("foundMessage");
    const segments = document.querySelectorAll(".triangle-segment");
    
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
    let lastBeepTime = 0;

    // Инициализация
    function init() {
        // Предзагрузка звуков
        Object.values(sounds).forEach(sound => sound.load());
        
        // Обработчики
        toggleBtn.addEventListener('click', handleToggle);
        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('touchstart', startDrag);
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('touchmove', handleDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function handleToggle() {
        sounds.click.play();
        isActive = !isActive;
        toggleBtn.textContent = isActive ? "🔘 ВЫКЛ" : "🔘 ВКЛ";
        
        if (isActive) {
            sounds.start.play();
            resetProgress();
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
        
        const rect = progressContainer.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        progress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        
        updateSlider();
        updateBeepSpeed(); // Фикс бага 11
    }

    function endDrag() {
        isDragging = false;
        if (progress >= 95) triggerFound();
        if (isActive) startBeepInterval();
    }

    function updateSlider() {
        slider.style.left = `${progress}%`;
        
        // Обновление треугольников (фикс бага 12)
        segments.forEach((seg, i) => {
            const segmentProgress = (i + 1) * 11.11;
            seg.style.opacity = progress >= segmentProgress - 11.11 ? '1' : '0.3';
            seg.style.transform = progress >= segmentProgress - 5.55 ? 'scale(1.1)' : 'scale(1)';
        });
    }

    function updateBeepSpeed() {
        const now = Date.now();
        if (now - lastBeepTime > 1000 / (1 + progress / 25)) {
            sounds.beep.currentTime = 0;
            sounds.beep.play();
            lastBeepTime = now;
        }
    }

    function startBeepInterval() {
        clearInterval(beepInterval);
        beepInterval = setInterval(() => {
            if (!isDragging && isActive) {
                updateBeepSpeed();
            }
        }, 50);
    }

    function triggerFound() {
        sounds.found.play();
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
        if (isActive) startBeepInterval();
    }

    function stopGame() {
        clearInterval(beepInterval);
        progress = 0;
        updateSlider();
    }

    init();
});
