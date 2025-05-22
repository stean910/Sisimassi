const toggleBtn = document.getElementById("toggleBtn");
const slider = document.getElementById("slider");
const clickSound = document.getElementById("clickSound");
const startSound = document.getElementById("startSound");
const beepSound = document.getElementById("beepSound");
const foundSound = document.getElementById("foundSound");

let isActive = false;
let progress = 0;
let beepInterval;

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

function startProgress() {
    progress = 0;
    beepInterval = setInterval(() => {
        progress += 1;
        updateSlider();
        
        if (progress >= 100) {
            foundSound.play();
            stopProgress();
            alert("🚨 ПИДОРАС НАЙДЕН!");
        }
    }, 100);
}

function stopProgress() {
    clearInterval(beepInterval);
    slider.style.left = "0";
}

function updateSlider() {
    const newPosition = (progress / 100) * 100;
    slider.style.left = `${newPosition}%`;
    
    // Ускоряем бип-бип
    if (progress % 10 === 0) {
        beepSound.play();
        clearInterval(beepInterval);
        beepInterval = setInterval(() => {
            progress += 1;
            updateSlider();
        }, 100 - progress); // Чем больше progress, тем быстрее бипы
    }
}