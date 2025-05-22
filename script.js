document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const toggleBtn = document.getElementById("toggleBtn");
    const verticalSlider = document.getElementById("verticalSlider");
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

    // Инициализация
    function init() {
        // Обработчики кнопки
        toggleBtn.addEventListener('click', handleToggle);
        toggleBtn.addEventListener('touchstart', handleToggle);
        
        // Обработчики ползунка
        verticalSlider.addEventListener('mousedown', startDrag);
        verticalSlider.addEventListener('touchstart', startDrag);
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
            startBeepInterval();
        } else {
            stopGame();
        }
    }

    function startDrag(e) {
        if (!isActive) return;
        isDragging = true;
        e.preventDefault();
    }

    function handleDrag(e) {
        if (!isDragging || !isActive) return;
        
        const container = verticalSlider.parentElement;
        const rect = container.getBoundingClientRect();
        const clientY = e.clientY || e.touches[0].clientY;
        progress = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / rect.height) * 100));
        
        updateSlider();
        updateProgressBar();
    }

    function endDrag() {
        isDragging = false;
    }

    function updateSlider() {
        verticalSlider.style.bottom = `${progress}%`;
    }

    function updateProgressBar() {
        segments.forEach((seg, i) => {
            seg.style.opacity = i < Math.floor(progress / 11.11) ? '1' : '0.3';
        });
        
        if (progress >= 95) triggerFound();
    }

    function startBeepInterval() {
        clearInterval(beepInterval);
        beepInterval = setInterval(() => {
            if (isActive && !isDragging) {
                sounds.beep.currentTime = 0;
                sounds.beep.play();
            }
        }, 1000 - (progress * 8));
    }

    function triggerFound() {
        sounds.found.play();
        foundMessage.style.display = 'block';
        if (navigator.vibrate) navigator.vibrate([500]);
        setTimeout(() => {
            foundMessage.style.display = 'none';
        }, 2000);
    }

    function stopGame() {
        clearInterval(beepInterval);
    }

    init();
});
