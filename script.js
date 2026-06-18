let selectedGame = "powerball";
let currentPick = "";

const rules = document.getElementById("rules");

function selectGame(game) {
  selectedGame = game;

  document.getElementById("powerballBtn").classList.remove("active");
  document.getElementById("megaBtn").classList.remove("active");

  if (game === "powerball") {
    document.getElementById("powerballBtn").classList.add("active");
    rules.textContent = "White Balls (1-69) + Powerball (1-26)";
  } else {
    document.getElementById("megaBtn").classList.add("active");
    rules.textContent = "White Balls (1-70) + Mega Ball (1-25)";
  }
}

function uniqueNumbers(count, max) {
  let numbers = [];

  while (numbers.length < count) {
    let number = Math.floor(Math.random() * max) + 1;

    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  return numbers.sort((a, b) => a - b);
}

function generateNumbers() {
  const balls = document.querySelectorAll("#balls span");

  balls.forEach(ball => ball.classList.add("spin"));

  let spins = 0;

  const spinning = setInterval(() => {
    const isMega = selectedGame === "mega";
    const whiteMax = isMega ? 70 : 69;
    const specialMax = isMega ? 25 : 26;

    balls.forEach((ball, index) => {
      const max = index === 5 ? specialMax : whiteMax;
      ball.textContent = Math.floor(Math.random() * max) + 1;
    });

    spins++;

    if (spins > 25) {
      clearInterval(spinning);

      const isMega = selectedGame === "mega";
      const whiteMax = isMega ? 70 : 69;
      const specialMax = isMega ? 25 : 26;

      const finalNumbers = uniqueNumbers(5, whiteMax);
      const finalSpecial = Math.floor(Math.random() * specialMax) + 1;

      for (let i = 0; i < 5; i++) {
        balls[i].textContent = finalNumbers[i];
      }

      balls[5].textContent = finalSpecial;

      balls.forEach(ball => ball.classList.remove("spin"));

      const gameName = isMega ? "Mega Millions" : "Powerball";
      currentPick = `${gameName}: ${finalNumbers.join(" ")} | ${finalSpecial}`;

      saveToHistory(currentPick);
      renderHistory();
    }
  }, 70);
}

function savePick() {
  if (!currentPick) {
    alert("Generate numbers first.");
    return;
  }

  localStorage.setItem("savedPick", currentPick);

  document.getElementById("savedPick").textContent =
    "⭐ SAVED PICK  " + currentPick;
}

function copyPick() {
  if (!currentPick) {
    alert("Generate numbers first.");
    return;
  }

  navigator.clipboard.writeText(currentPick);
  alert("Copied: " + currentPick);
}

function saveToHistory(pick) {
  let history = JSON.parse(localStorage.getItem("pickHistory")) || [];

  history.unshift({
    pick: pick,
    date: new Date().toLocaleString()
  });

  if (history.length > 20) {
    history = history.slice(0, 20);
  }

  localStorage.setItem("pickHistory", JSON.stringify(history));
}

function renderHistory() {
  const historyList = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem("pickHistory")) || [];

  historyList.innerHTML = "";

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <span>${item.pick}</span>
      <small>${item.date}</small>
    `;

    historyList.appendChild(div);
  });
}

function toggleHistory() {
  const box = document.getElementById("historyBox");

  if (box.style.display === "none") {
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }

  renderHistory();
}

function clearHistory() {
  localStorage.removeItem("pickHistory");
  renderHistory();
}

function getTodayKey() {
  const today = new Date().toDateString();
  return "dailyPick-" + today + "-" + selectedGame;
}

function getDailyPick() {
  const key = getTodayKey();
  let savedDaily = localStorage.getItem(key);

  if (savedDaily) {
    document.getElementById("dailyPick").textContent =
      savedDaily + " ⭐ Already picked for today";
    currentPick = savedDaily;
    return;
  }

  const isMega = selectedGame === "mega";
  const whiteMax = isMega ? 70 : 69;
  const specialMax = isMega ? 25 : 26;

  const finalNumbers = uniqueNumbers(5, whiteMax);
  const finalSpecial = Math.floor(Math.random() * specialMax) + 1;

  const gameName = isMega ? "Mega Millions" : "Powerball";
  const pick = `${gameName}: ${finalNumbers.join(" ")} | ${finalSpecial}`;

  localStorage.setItem(key, pick);

  document.getElementById("dailyPick").textContent = pick;

  currentPick = pick;
  saveToHistory(pick);
  renderHistory();
}

function loadSavedPick() {
  const saved = localStorage.getItem("savedPick");

  if (saved) {
    document.getElementById("savedPick").textContent =
      "⭐ SAVED PICK  " + saved;
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}

loadSavedPick();
renderHistory();