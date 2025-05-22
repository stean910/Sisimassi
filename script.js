// Инициализация элементов
const toggleBtn = document.getElementById("toggleBtn");
const slider = document.getElementById("slider");
const progressBar = document.getElementById("progressBar");
const foundMessage = document.getElementById("foundMessage");

// Состояние игры
let isActive = false;
let isDragging = false;
let progress = 0;

// Обработчики для сенсорного ввода
slider.addEventListener('touchstart', handleStart, { passive: false });
slider.addEventListener('mousedown', handleStart);

document.addEventListener('touchmove', handleMove, { passive: false });
document.addEventListener('mousemove', handleMove);

document.addEventListener('touchend', handleEnd);
document.addEventListener('mouseup', handleEnd);

function handleStart(e) {
    if (!isActive) return;
    isDragging = true;
    e.preventDefault();
}

function handleMove(e) {
    if (!isDragging || !isActive) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clientX = e.clientX || e.touches[0].clientX;
    let newPos = ((clientX - rect.left) / rect.width) * 100;
    
    progress = Math.max(0, Math.min(100, newPos));
    updateSlider();
}

function handleEnd() {
    isDragging = false;
    if (progress >= 100) triggerFound();
}

function updateSlider() {
    slider.style.left = `${progress}%`;
    
    // Подсветка активных сегментов
    document.querySelectorAll('.segment').forEach((seg, i) => {
        seg.style.opacity = i < Math.floor(progress / 11.11) ? '1' : '0.3';
    });
    
    // Звуковое сопровождение
    if (progress % 15 < 3) beepSound.play();
}

function triggerFound() {
    foundSound.play();
    foundMessage.style.display = 'block';
    setTimeout(() => {
        foundMessage.style.display = 'none';
        resetGame();
    }, 2000);
}

function resetGame() {
    progress = 0;
    updateSlider();
}
