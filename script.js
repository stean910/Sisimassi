// Элементы
const toggleBtn = document.getElementById("toggleBtn");
const slider = document.getElementById("slider");
const clickSound = document.getElementById("clickSound");
const startSound = document.getElementById("startSound");
const beepSound = document.getElementById("beepSound");
const foundSound = document.getElementById("foundSound");

// Состояние игры
let isActive = false;
let progress = 0;
let beepInterval;

// Предзагрузка звуков
window.onload = function() {
  [clickSound, startSound, beepSound, foundSound].forEach(s => s.load());
};

// Кнопка ВКЛ/ВЫКЛ
toggleBtn.addEventListener("click", () => {
  clickSound.play();
  isActive = !isActive;
  
  if (isActive) {
    toggleBtn.textContent = "🔘 ВЫКЛ";
    startSound.play();
    startProgress();
  } else {
    toggleBtn.textContent = "🔘 ВКЛ";
    stopProgress();
  }
});

// Запуск прогресса
function startProgress() {
  progress = 0;
  beepInterval = setInterval(() => {
    progress += 1;
    
    // Рандомный сброс (15% шанс)
    if (Math.random() < 0.15 && progress < 70) {
      progress = 0;
    }
    
    updateSlider();
    
    if (progress >= 100) {
      foundSound.play();
      if (navigator.vibrate) navigator.vibrate([500, 200, 500]); // Вибрация
      stopProgress();
    }
  }, 100);
}

// Остановка прогресса
function stopProgress() {
  clearInterval(beepInterval);
}

// Обновление ползунка
function updateSlider() {
  const newPosition = Math.min(100, progress);
  slider.style.left = `${newPosition}%`;
  
  // Ускорение бипов
  if (progress <= 100 && progress % 10 === 0) {
    beepSound.play();
    clearInterval(beepInterval);
    beepInterval = setInterval(() => {
      progress += 1;
      updateSlider();
    }, Math.max(20, 100 - progress)); // Минимальная задержка 20мс
  }
}
