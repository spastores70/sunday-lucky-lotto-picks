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
/* =========================================================
   BIRTHDAY DAILY LOTTO COMBINATION
========================================================= */

let selectedBirthdayGame = "powerball";
let birthdaySpinTimer = null;

function selectBirthdayGame(game) {
  selectedBirthdayGame = game;

  const powerballButton =
    document.getElementById("birthdayPowerballBtn");

  const megaButton =
    document.getElementById("birthdayMegaBtn");

  const ballsContainer =
    document.getElementById("birthdayBalls");

  powerballButton.classList.remove("active");
  megaButton.classList.remove("active");
  ballsContainer.classList.remove("mega-mode");

  if (game === "powerball") {
    powerballButton.classList.add("active");
  } else {
    megaButton.classList.add("active");
    ballsContainer.classList.add("mega-mode");
  }

  resetBirthdayBalls();
  loadBirthdayLuckyCombination();
}

function resetBirthdayBalls() {
  const balls =
    document.querySelectorAll("#birthdayBalls span");

  balls.forEach((ball) => {
    ball.textContent = "?";
    ball.classList.remove(
      "slot-spinning",
      "slot-winner"
    );
  });

  document.getElementById(
    "birthdayLuckyMessage"
  ).textContent =
    "Enter a birthday and reveal today’s lucky pick.";

  document.getElementById(
    "birthdayLuckyDate"
  ).textContent = "";
}

function getLocalDateKey() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
}

function createSeedFromText(text) {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);

    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;

  return function randomValue() {
    state += 0x6d2b79f5;

    let result = state;

    result = Math.imul(
      result ^ (result >>> 15),
      result | 1
    );

    result ^= result +
      Math.imul(
        result ^ (result >>> 7),
        result | 61
      );

    return (
      (result ^ (result >>> 14)) >>> 0
    ) / 4294967296;
  };
}

function createUniqueSeededNumbers(
  count,
  maximum,
  random
) {
  const numbers = [];

  while (numbers.length < count) {
    const number =
      Math.floor(random() * maximum) + 1;

    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  return numbers.sort((a, b) => a - b);
}

function calculateBirthdayCombination(
  birthdayValue,
  game
) {
  const dateKey = getLocalDateKey();

  const seedText =
    `${birthdayValue}|${dateKey}|${game}`;

  const random = seededRandom(
    createSeedFromText(seedText)
  );

  const isMega = game === "mega";

  const whiteMaximum = isMega ? 70 : 69;
  const specialMaximum = isMega ? 24 : 26;

  const whiteNumbers =
    createUniqueSeededNumbers(
      5,
      whiteMaximum,
      random
    );

  const specialNumber =
    Math.floor(random() * specialMaximum) + 1;

  return {
    game,
    whiteNumbers,
    specialNumber,
    dateKey
  };
}

function generateBirthdayLuckyCombination() {
  const birthdayInput =
    document.getElementById("birthdayInput");

  const birthdayValue = birthdayInput.value;

  if (!birthdayValue) {
    alert("Please enter the person’s birthday.");
    birthdayInput.focus();
    return;
  }

  const selectedBirthday = new Date(
    `${birthdayValue}T12:00:00`
  );

  if (
    Number.isNaN(selectedBirthday.getTime()) ||
    selectedBirthday > new Date()
  ) {
    alert("Please enter a valid birthday.");
    birthdayInput.focus();
    return;
  }

  const result = calculateBirthdayCombination(
    birthdayValue,
    selectedBirthdayGame
  );

  spinBirthdayCombination(result);
}

function spinBirthdayCombination(result) {
  const balls =
    document.querySelectorAll("#birthdayBalls span");

  const button =
    document.getElementById("birthdayLuckyButton");

  const message =
    document.getElementById("birthdayLuckyMessage");

  if (birthdaySpinTimer) {
    clearInterval(birthdaySpinTimer);
  }

  button.disabled = true;
  button.textContent = "🎰 Spinning...";

  message.textContent =
    "The birthday lucky machine is spinning...";

  balls.forEach((ball) => {
    ball.classList.remove("slot-winner");
    ball.classList.add("slot-spinning");
  });

  const isMega = result.game === "mega";
  const whiteMaximum = isMega ? 70 : 69;
  const specialMaximum = isMega ? 24 : 26;

  let spins = 0;
  const maximumSpins = 32;

  birthdaySpinTimer = setInterval(() => {
    balls.forEach((ball, index) => {
      const maximum =
        index === 5
          ? specialMaximum
          : whiteMaximum;

      ball.textContent =
        Math.floor(Math.random() * maximum) + 1;
    });

    spins++;

    if (spins >= maximumSpins) {
      clearInterval(birthdaySpinTimer);
      birthdaySpinTimer = null;

      revealBirthdayCombination(result);
    }
  }, 70);
}

function revealBirthdayCombination(result) {
  const balls =
    document.querySelectorAll("#birthdayBalls span");

  const button =
    document.getElementById("birthdayLuckyButton");

  result.whiteNumbers.forEach(
    (number, index) => {
      balls[index].textContent = number;
    }
  );

  balls[5].textContent = result.specialNumber;

  balls.forEach((ball, index) => {
    ball.classList.remove("slot-spinning");

    setTimeout(() => {
      ball.classList.add("slot-winner");
    }, index * 100);
  });

  const gameName =
    result.game === "mega"
      ? "Mega Millions"
      : "Powerball";

  const specialName =
    result.game === "mega"
      ? "Mega Ball"
      : "Powerball";

  document.getElementById(
    "birthdayLuckyMessage"
  ).textContent =
    `${gameName}: ` +
    `${result.whiteNumbers.join(" - ")} | ` +
    `${specialName} ${result.specialNumber}`;

  document.getElementById(
    "birthdayLuckyDate"
  ).textContent =
    `Birthday-based pick for ${formatTodayForDisplay()}`;

  button.disabled = false;
  button.textContent =
    "🎰 Reveal Birthday Lucky Pick";

  saveBirthdayLuckyCombination(result);
}

function getBirthdayStorageKey(
  birthdayValue,
  game
) {
  return [
    "birthdayLottoPick",
    birthdayValue,
    getLocalDateKey(),
    game
  ].join("-");
}

function saveBirthdayLuckyCombination(result) {
  const birthdayValue =
    document.getElementById(
      "birthdayInput"
    ).value;

  const storageKey = getBirthdayStorageKey(
    birthdayValue,
    result.game
  );

  const record = {
    birthday: birthdayValue,
    game: result.game,
    whiteNumbers: result.whiteNumbers,
    specialNumber: result.specialNumber,
    generatedDate: result.dateKey
  };

  localStorage.setItem(
    storageKey,
    JSON.stringify(record)
  );
}

function loadBirthdayLuckyCombination() {
  const birthdayInput =
    document.getElementById("birthdayInput");

  const birthdayValue = birthdayInput.value;

  if (!birthdayValue) {
    return;
  }

  const storageKey = getBirthdayStorageKey(
    birthdayValue,
    selectedBirthdayGame
  );

  const savedRecord =
    localStorage.getItem(storageKey);

  if (!savedRecord) {
    return;
  }

  try {
    const record = JSON.parse(savedRecord);

    revealBirthdayCombination(record);
  } catch (error) {
    console.error(
      "Unable to load birthday lotto pick:",
      error
    );

    localStorage.removeItem(storageKey);
  }
}

function formatTodayForDisplay() {
  return new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const birthdayInput =
      document.getElementById("birthdayInput");

    birthdayInput.addEventListener(
      "change",
      () => {
        resetBirthdayBalls();
        loadBirthdayLuckyCombination();
      }
    );

    selectBirthdayGame("powerball");
  }
);