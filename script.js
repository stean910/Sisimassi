document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById("toggleBtn");
    const slider = document.getElementById("slider");
    const progressBar = document.querySelector(".progress-bar");
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

    // Инициализация
    function init() {
        // Предзагрузка звуков
        Object.values(sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.7;
        });
        
        // Настройка кнопки
        toggleBtn.addEventListener('click', handleToggle);
        toggleBtn.addEventListener('touchstart', handleToggle, { passive: true });
        
        // Настройка ползунка
        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('touchstart', startDrag, { passive: false });
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('touchmove', handleDrag, { passive: false });
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    // Обработчик кнопки (фикс бага 5)
    function handleToggle(e) {
        e.preventDefault();
        sounds.click.play();
        
        isActive = !isActive;
        toggleBtn.textContent = isActive ? "🔘 ВЫКЛ" : "🔘 ВКЛ";
        
        if (isActive) {
            sounds.start.play();
            resetProgress();
        }
    }

    // Логика ползунка (фикс бага 4)
    function startDrag(e) {
        if (!isActive) return;
        isDragging = true;
        e.preventDefault();
    }

    function handleDrag(e) {
        if (!isDragging) return;
        
        const rect = progressBar.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        progress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        
        updateSlider();
    }

    function endDrag() {
        isDragging = false;
        if (progress >= 100) triggerFound();
    }

    function updateSlider() {
        slider.style.left = `${progress}%`;
        
        // Подсветка сегментов
        document.querySelectorAll('.segment').forEach((seg, i) => {
            seg.style.opacity = i < Math.floor(progress / 11.11) ? '1' : '0.3';
        });
        
        // Звуковой эффект
        if (progress % 15 < 3) sounds.beep.play();
    }

    function triggerFound() {
        sounds.found.play();
        foundMessage.style.display = 'block';
        setTimeout(() => {
            foundMessage.style.display = 'none';
            resetProgress();
        }, 2000);
    }

    function resetProgress() {
        progress = 0;
        updateSlider();
    }

    // Запуск игры
    init();
});
