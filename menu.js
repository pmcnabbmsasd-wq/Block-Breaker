const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const casinoScreen = document.getElementById("casino-screen");
const menuWallet = document.getElementById("menu-wallet");
const casinoWallet = document.getElementById("casino-wallet");
const wagerInput = document.getElementById("wager");
const rouletteBet = document.getElementById("roulette-bet");
const casinoResult = document.getElementById("casino-result");
const spinButton = document.getElementById("spin-roulette");
const rouletteGame = document.getElementById("roulette-game");
const blackjackGame = document.getElementById("blackjack-game");
const slotsGame = document.getElementById("slots-game");
const wagerMinimum = 50;
const rouletteWheel = document.getElementById("roulette-wheel");
const rouletteContext = rouletteWheel.getContext("2d");
const rouletteSlice = (Math.PI * 2) / 38;
let wheelRotation = 0;
let blackjackDeck = [];
let playerHand = [];
let dealerHand = [];
let blackjackWager = 0;
let blackjackRoundActive = false;

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

function validateWager() {
  const wager = Number(wagerInput.value);
  if (!Number.isSafeInteger(wager) || wager < wagerMinimum) {
    return { error: "Enter a whole-dollar wager of at least $" + wagerMinimum + "." };
  }
  if (wager > money) {
    return { error: "Your wager cannot be greater than your cash." };
  }
  return { wager };
}

function showCasinoGame(game) {
  rouletteGame.hidden = game !== "roulette";
  blackjackGame.hidden = game !== "blackjack";
  slotsGame.hidden = game !== "slots";
  for (const name of ["roulette", "blackjack", "slots"]) {
    document.getElementById("show-" + name).setAttribute("aria-pressed", String(name === game));
  }
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
  const validation = validateWager();
  if (validation.error) {
    casinoResult.textContent = validation.error;
    return;
  }
  const wager = validation.wager;

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

const cardSuits = ["♠", "♥", "♦", "♣"];
const cardRanks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createShuffledDeck() {
  const deck = [];
  for (let copy = 0; copy < 4; copy++) {
    for (const suit of cardSuits) {
      for (const rank of cardRanks) {
        deck.push({ rank, suit });
      }
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawCard() {
  if (blackjackDeck.length === 0) {
    blackjackDeck = createShuffledDeck();
  }
  return blackjackDeck.pop();
}

function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.rank === "A") {
      total += 11;
      aces++;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function renderHand(container, hand, hideCards = false) {
  container.replaceChildren();
  hand.forEach((card) => {
    const cardElement = document.createElement("div");
    if (hideCards) {
      cardElement.className = "playing-card card-back";
      cardElement.setAttribute("aria-label", "Face-down card");
      cardElement.textContent = "◆";
    } else {
      const isRed = card.suit === "♥" || card.suit === "♦";
      cardElement.className = "playing-card" + (isRed ? " red-card" : "");
      cardElement.setAttribute("aria-label", card.rank + " of " + card.suit);
      cardElement.innerHTML = "<span>" + card.rank + "</span><span>" + card.suit + "</span>";
    }
    container.appendChild(cardElement);
  });
}

function renderBlackjackHands(revealDealer = false) {
  const dealerElement = document.getElementById("dealer-hand");
  const playerElement = document.getElementById("player-hand");
  renderHand(dealerElement, dealerHand, !revealDealer && blackjackRoundActive);
  renderHand(playerElement, playerHand);
  dealerElement.setAttribute("aria-label", revealDealer ? "Dealer cards revealed" : "Dealer cards face down");
  document.getElementById("player-total").textContent = "Total: " + handValue(playerHand);
  document.getElementById("dealer-total").textContent = revealDealer
    ? "Total: " + handValue(dealerHand)
    : "Total: hidden";
}

function finishBlackjackRound(outcome) {
  blackjackRoundActive = false;
  renderBlackjackHands(true);
  document.getElementById("hit-blackjack").disabled = true;
  document.getElementById("stand-blackjack").disabled = true;
  document.getElementById("deal-blackjack").disabled = false;

  if (outcome === "win") {
    const isBlackjack = handValue(playerHand) === 21 && playerHand.length === 2;
    const winnings = isBlackjack ? Math.floor(blackjackWager * 1.5) : blackjackWager;
    money += blackjackWager + winnings;
    document.getElementById("blackjack-result").textContent =
      (isBlackjack ? "Blackjack! " : "You win! ") + "You won $" + winnings + ".";
  } else if (outcome === "push") {
    money += blackjackWager;
    document.getElementById("blackjack-result").textContent = "Push. Your $" + blackjackWager + " bet is returned.";
  } else {
    document.getElementById("blackjack-result").textContent =
      outcome === "bust" ? "You busted. You lost $" + blackjackWager + "." : "Dealer wins. You lost $" + blackjackWager + ".";
  }
  updateWalletDisplay();
}

function dealerTurn() {
  while (handValue(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
  const playerTotal = handValue(playerHand);
  const dealerTotal = handValue(dealerHand);
  renderBlackjackHands(true);
  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    finishBlackjackRound("win");
  } else if (playerTotal === dealerTotal) {
    finishBlackjackRound("push");
  } else {
    finishBlackjackRound("lose");
  }
}

document.getElementById("show-roulette").addEventListener("click", function () {
  showCasinoGame("roulette");
});

document.getElementById("show-blackjack").addEventListener("click", function () {
  showCasinoGame("blackjack");
});

document.getElementById("show-slots").addEventListener("click", function () {
  showCasinoGame("slots");
});

document.getElementById("deal-blackjack").addEventListener("click", function () {
  const validation = validateWager();
  const result = document.getElementById("blackjack-result");
  if (validation.error) {
    result.textContent = validation.error;
    return;
  }

  blackjackWager = validation.wager;
  money -= blackjackWager;
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  blackjackRoundActive = true;
  document.getElementById("deal-blackjack").disabled = true;
  document.getElementById("hit-blackjack").disabled = false;
  document.getElementById("stand-blackjack").disabled = false;
  result.textContent = "Your turn: hit or stand.";
  renderBlackjackHands();
  updateWalletDisplay();

  const playerHasBlackjack = handValue(playerHand) === 21;
  const dealerHasBlackjack = handValue(dealerHand) === 21;
  if (playerHasBlackjack || dealerHasBlackjack) {
    renderBlackjackHands(true);
    if (playerHasBlackjack && dealerHasBlackjack) {
      finishBlackjackRound("push");
    } else if (playerHasBlackjack) {
      finishBlackjackRound("win");
    } else {
      finishBlackjackRound("lose");
    }
  }
});

document.getElementById("hit-blackjack").addEventListener("click", function () {
  if (!blackjackRoundActive) return;
  playerHand.push(drawCard());
  renderBlackjackHands();
  if (handValue(playerHand) > 21) {
    finishBlackjackRound("bust");
  }
});

document.getElementById("stand-blackjack").addEventListener("click", function () {
  if (blackjackRoundActive) dealerTurn();
});

const slotSymbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "⭐", "7️⃣"];
const slotReels = [1, 2, 3].map((number) => document.getElementById("slot-reel-" + number));
const slotsButton = document.getElementById("spin-slots");

function spinSlotReel(reel, result, duration) {
  return new Promise((resolve) => {
    const timer = setInterval(function () {
      reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    }, 75);
    setTimeout(function () {
      clearInterval(timer);
      reel.textContent = result;
      resolve();
    }, duration);
  });
}

slotsButton.addEventListener("click", async function () {
  const validation = validateWager();
  const result = document.getElementById("slots-result");
  if (validation.error) {
    result.textContent = validation.error;
    return;
  }

  const wager = validation.wager;
  const symbols = slotReels.map(() => slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
  money -= wager;
  updateWalletDisplay();
  result.textContent = "The reels are spinning...";
  slotsButton.disabled = true;

  try {
    await Promise.all(slotReels.map((reel, index) =>
      spinSlotReel(reel, symbols[index], 900 + index * 400)
    ));

    const counts = new Map();
    for (const symbol of symbols) {
      counts.set(symbol, (counts.get(symbol) || 0) + 1);
    }
    const matchCount = Math.max(...counts.values());
    if (matchCount === 3) {
      const payout = wager * 5;
      money += payout;
      result.textContent = symbols.join(" ") + " — three of a kind! You won $" + (payout - wager) + ".";
    } else if (matchCount === 2) {
      const payout = wager * 2;
      money += payout;
      result.textContent = symbols.join(" ") + " — two match! You won $" + (payout - wager) + ".";
    } else {
      result.textContent = symbols.join(" ") + " — no match. You lost $" + wager + ".";
    }
  } finally {
    slotsButton.disabled = false;
    updateWalletDisplay();
  }
});

drawRouletteWheel();
showCasinoGame("slots");
updateWalletDisplay();
