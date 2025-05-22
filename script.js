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

    // Инициализация
    function init() {
        // Предзагрузка звуков
        Object.values(sounds).forEach(sound => {
            sound.load();
            sound.volume = 1.0;
        });
        
        // Кнопка (фикс бага 5 и 6)
        toggleBtn.addEventListener('click', handleToggle);
        toggleBtn.addEventListener('touchstart', handleToggle, { passive: true });
        
        // Ползунок (фикс бага 4)
        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('touchstart', startDrag, { passive: false });
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('touchmove', handleDrag, { passive: false });
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    // Обработчик кнопки
    function handleToggle(e) {
        e.preventDefault();
        sounds.click.play().catch(e => console.log("Sound error:", e));
        
        isActive = !isActive;
        toggleBtn.textContent = isActive ? "🔘 ВЫКЛ" : "🔘 ВКЛ";
        
        if (isActive) {
            // Фикс бага 6: гарантированное воспроизведение
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

    // Логика ползунка
    function startDrag(e) {
        if (!isActive) return;
        isDragging = true;
        e.preventDefault();
        clearInterval(beepInterval);
    }

    function handleDrag(e) {
        if (!isDragging || !isActive) return;
        
        const rect = progressContainer.getBoundingClientRect();
        const clientX = e.clientX || (e.touches[0] ? e.touches[0].clientX : 0);
        progress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        
        updateSlider();
        playBeepSound(); // Фикс бага 7
    }

    function endDrag() {
        isDragging = false;
        if (progress >= 100) {
            triggerFound();
        } else if (isActive) {
            startBeepInterval();
        }
    }

    // Обновление интерфейса
    function updateSlider() {
        slider.style.left = `${progress}%`;
        
        // Подсветка сегментов
        document.querySelectorAll('.segment').forEach((seg, i) => {
            seg.style.opacity = i < Math.floor(progress / 11.11) ? '1' : '0.3';
        });
    }

    // Звуки бипов (фикс бага 7)
    function playBeepSound() {
        if (progress % 10 < 2) {
            sounds.beep.currentTime = 0;
            sounds.beep.play().catch(e => console.log("Beep error:", e));
        }
    }

    function startBeepInterval() {
        clearInterval(beepInterval);
        const baseDelay = 1000;
        const speedFactor = 1 - (progress / 150); // Чем выше прогресс, тем быстрее
        
        beepInterval = setInterval(() => {
            if (!isDragging) {
                sounds.beep.currentTime = 0;
                sounds.beep.play().catch(e => console.log("Beep error:", e));
            }
        }, baseDelay * speedFactor);
    }

    function triggerFound() {
        sounds.found.play().catch(e => console.log("Found sound error:", e));
        foundMessage.style.display = 'block';
        
        // Вибрация если поддерживается
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
        
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

    // Запуск игры
    init();
});
