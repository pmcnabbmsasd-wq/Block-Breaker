const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const casinoScreen = document.getElementById("casino-screen");
const menuWallet = document.getElementById("menu-wallet");
const casinoWallet = document.getElementById("casino-wallet");
const wagerInput = document.getElementById("wager");
const rouletteBet = document.getElementById("roulette-bet");
const casinoResult = document.getElementById("casino-result");

const rouletteColors = [
  "green",
  "red", "black", "red", "black", "red", "black", "red", "black", "red", "black",
  "black", "red", "black", "red", "black", "red", "black", "red", "red", "black",
  "red", "black", "red", "black", "red", "black", "red", "black", "black", "red",
  "black", "red", "black", "red", "black", "red", "black"
];

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

document.getElementById("spin-roulette").addEventListener("click", function () {
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

  if (color === bet) {
    money += wager * (bet === "green" ? 36 : 2);
    casinoResult.textContent = "Pocket " + pocket + " is " + color + "! You won $" +
      (wager * (bet === "green" ? 35 : 1)) + ".";
  } else {
    casinoResult.textContent = "Pocket " + pocket + " is " + color + ". You lost $" + wager + ".";
  }

  updateWalletDisplay();
});

updateWalletDisplay();
