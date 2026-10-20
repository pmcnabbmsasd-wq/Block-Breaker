const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const casinoScreen = document.getElementById("casino-screen");
const menuWallet = document.getElementById("menu-wallet");
const casinoWallet = document.getElementById("casino-wallet");
const wagerInput = document.getElementById("wager");
const rouletteBet = document.getElementById("roulette-bet");
const casinoResult = document.getElementById("casino-result");
const spinButton = document.getElementById("spin-roulette");
const rouletteWheel = document.getElementById("roulette-wheel");
const rouletteContext = rouletteWheel.getContext("2d");
const rouletteSlice = (Math.PI * 2) / 38;
let wheelRotation = 0;

const rouletteColors = [
  "green",
  "red", "black", "red", "black", "red", "black", "red", "black", "red", "black",
  "black", "red", "black", "red", "black", "red", "black", "red", "red", "black",
  "red", "black", "red", "black", "red", "black", "red", "black", "black", "red",
  "black", "red", "black", "red", "black", "red", "black"
];

function drawRouletteWheel() {
  const center = rouletteWheel.width / 2;
  const radius = center - 8;

  rouletteColors.forEach((color, pocket) => {
    const startAngle = -Math.PI / 2 + pocket * rouletteSlice;
    const endAngle = startAngle + rouletteSlice;
    const middleAngle = startAngle + rouletteSlice / 2;

    rouletteContext.beginPath();
    rouletteContext.moveTo(center, center);
    rouletteContext.arc(center, center, radius, startAngle, endAngle);
    rouletteContext.closePath();
    rouletteContext.fillStyle = color;
    rouletteContext.fill();
    rouletteContext.strokeStyle = "#d7bd75";
    rouletteContext.lineWidth = 1.5;
    rouletteContext.stroke();

    rouletteContext.save();
    rouletteContext.translate(center, center);
    rouletteContext.rotate(middleAngle);
    rouletteContext.textAlign = "right";
    rouletteContext.textBaseline = "middle";
    rouletteContext.font = "bold 11px sans-serif";
    rouletteContext.fillStyle = "white";
    rouletteContext.fillText(String(pocket), radius - 13, 0);
    rouletteContext.restore();
  });

  rouletteContext.beginPath();
  rouletteContext.arc(center, center, 34, 0, Math.PI * 2);
  rouletteContext.fillStyle = "#d7bd75";
  rouletteContext.fill();
  rouletteContext.beginPath();
  rouletteContext.arc(center, center, 25, 0, Math.PI * 2);
  rouletteContext.fillStyle = "#174b32";
  rouletteContext.fill();
  rouletteContext.fillStyle = "white";
  rouletteContext.font = "bold 18px sans-serif";
  rouletteContext.textAlign = "center";
  rouletteContext.textBaseline = "middle";
  rouletteContext.fillText("0", center, center);
}

async function spinWheelToPocket(pocket) {
  const targetRotation = (360 - ((pocket + 0.5) * 360) / rouletteColors.length) % 360;
  const currentRotation = ((wheelRotation % 360) + 360) % 360;
  const alignmentRotation = (targetRotation - currentRotation + 360) % 360;
  const nextRotation = wheelRotation + 360 * 6 + alignmentRotation;
  const animation = rouletteWheel.animate(
    [
      { transform: "rotate(" + wheelRotation + "deg)" },
      { transform: "rotate(" + nextRotation + "deg)" }
    ],
    { duration: 4800, easing: "cubic-bezier(0.12, 0.72, 0.12, 1)", fill: "forwards" }
  );

  await animation.finished;
  wheelRotation = nextRotation;
  rouletteWheel.style.transform = "rotate(" + wheelRotation + "deg)";
  animation.cancel();
}

function updateWalletDisplay() {
  const balance = "Cash: $" + money;
  menuWallet.textContent = balance;
  casinoWallet.textContent = balance;
}

function showScreen(screenName) {
  activeScreen = screenName;
  mainMenu.hidden = screenName !== "menu";
  gameScreen.hidden = screenName !== "game";
  casinoScreen.hidden = screenName !== "casino";
  updateWalletDisplay();
}

document.getElementById("play-game").addEventListener("click", function () {
  restartGame();
  startBallFromSky();
  showScreen("game");
});

document.getElementById("open-casino").addEventListener("click", function () {
  casinoResult.textContent = "";
  showScreen("casino");
});

document.getElementById("game-menu").addEventListener("click", function () {
  showScreen("menu");
});

document.getElementById("casino-menu").addEventListener("click", function () {
  showScreen("menu");
});

spinButton.addEventListener("click", async function () {
  const wager = Number(wagerInput.value);
  if (!Number.isSafeInteger(wager) || wager < 50) {
    casinoResult.textContent = "Enter a whole-dollar wager of at least $50.";
    return;
  }
  if (wager > money) {
    casinoResult.textContent = "Your wager cannot be greater than your cash.";
    return;
  }

  const pocket = Math.floor(Math.random() * rouletteColors.length);
  const color = rouletteColors[pocket];
  const bet = rouletteBet.value;
  money -= wager;
  updateWalletDisplay();
  casinoResult.textContent = "The wheel is spinning...";
  spinButton.disabled = true;

  try {
    await spinWheelToPocket(pocket);

    if (color === bet) {
      const winnings = wager * (bet === "green" ? 35 : 1);
      money += wager + winnings;
      casinoResult.textContent = "Pocket " + pocket + " is " + color + "! You won $" + winnings + ".";
    } else {
      casinoResult.textContent = "Pocket " + pocket + " is " + color + ". You lost $" + wager + ".";
    }
  } finally {
    spinButton.disabled = false;
    updateWalletDisplay();
  }
});

drawRouletteWheel();
updateWalletDisplay();
