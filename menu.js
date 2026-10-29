const mainMenu = document.getElementById("main-menu");
const inventoryScreen = document.getElementById("inventory-screen");
const gameScreen = document.getElementById("game-screen");
const casinoScreen = document.getElementById("casino-screen");
const menuWallet = document.getElementById("menu-wallet");
const inventoryWallet = document.getElementById("inventory-wallet");
const casinoWallet = document.getElementById("casino-wallet");
const inventoryList = document.getElementById("inventory-list");
const inventoryEmpty = document.getElementById("inventory-empty");
const openInventoryButton = document.getElementById("open-inventory");
const inventoryMenuButton = document.getElementById("inventory-menu");
const wagerInput = document.getElementById("wager");
const rouletteBet = document.getElementById("roulette-bet");
const casinoResult = document.getElementById("casino-result");
const spinButton = document.getElementById("spin-roulette");
const rouletteGame = document.getElementById("roulette-game");
const blackjackGame = document.getElementById("blackjack-game");
const pokerGame = document.getElementById("poker-game");
const slotsGame = document.getElementById("slots-game");
const plinkoGame = document.getElementById("plinko-game");
const plinkoBoard = document.getElementById("plinko-board");
const plinkoContext = plinkoBoard.getContext("2d");
const dropPlinkoButton = document.getElementById("drop-plinko");
const plinkoResult = document.getElementById("plinko-result");
const coinFlipGame = document.getElementById("coin-flip-game");
const cupBallGame = document.getElementById("cup-ball-game");
const cupBallStage = document.getElementById("cup-ball-stage");
const cupBall = document.getElementById("cup-ball");
const cupButtons = [...document.querySelectorAll("#cup-ball-stage .cup-button")];
const startCupBallButton = document.getElementById("start-cup-ball");
const cupBallResult = document.getElementById("cup-ball-result");
const caseOpeningGame = document.getElementById("case-opening-game");
const caseDisplay = document.getElementById("case-display");
const caseFace = document.getElementById("case-face");
const caseReel = document.getElementById("case-reel");
const caseReelTrack = document.getElementById("case-reel-track");
const caseOpeningResult = document.getElementById("case-opening-result");
const openCaseButton = document.getElementById("open-case");
const quickOpenCase = document.getElementById("quick-open-case");
const paddleBallCaseGame = document.getElementById("paddle-ball-case-game");
const paddleBallCaseDisplay = document.getElementById("paddle-ball-case-display");
const paddleBallCaseFace = document.getElementById("paddle-ball-case-face");
const paddleBallCaseResult = document.getElementById("paddle-ball-case-result");
const openPaddleBallCaseButton = document.getElementById("open-paddle-ball-case");
const paddleBallCaseReel = document.getElementById("paddle-ball-case-reel");
const paddleBallCaseReelTrack = document.getElementById("paddle-ball-case-reel-track");
const wagerMinimum = 50;
const quickOpenPaddleCase = document.getElementById("quick-open-paddle-case");
const PADDLE_SKIN_STORAGE_KEY = "block-breaker-paddle-skins";
let ownedPaddleSkins = [{ ...defaultPaddleSkin }];
const rouletteWheel = document.getElementById("roulette-wheel");
const rouletteContext = rouletteWheel.getContext("2d");
const rouletteSlice = (Math.PI * 2) / 38;
let wheelRotation = 0;
let blackjackDeck = [];
let playerHand = [];
let dealerHand = [];
let blackjackWager = 0;
let blackjackRoundActive = false;
let coinRotation = 0;
let cupPositions = [0, 1, 2];
let ballCupIndex = 0;
let cupBallWager = 0;
let cupBallRoundActive = false;
let plinkoDropActive = false;

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

const plinkoRows = 9;
const plinkoBuckets = 10;
const plinkoSpacing = 38;
const plinkoMultipliers = [6, 2.5, 1.5, 1, 0.6, 0.6, 1, 1.5, 2.5, 6];

function plinkoPegPosition(row, column) {
  return {
    x: plinkoBoard.width / 2 - (row * plinkoSpacing) / 2 + column * plinkoSpacing,
    y: 50 + row * 37
  };
}

function plinkoBucketCenter(index) {
  return plinkoBoard.width / 2 - ((plinkoBuckets - 1) * plinkoSpacing) / 2 + index * plinkoSpacing;
}

function plinkoMultiplierColor(multiplier) {
  if (multiplier >= 5) return "#ff7468";
  if (multiplier >= 2) return "#ffc857";
  if (multiplier > 1) return "#62d6c5";
  if (multiplier === 1) return "#a8d972";
  return "#d3d8df";
}

function drawPlinkoBoard(ball = null, highlightedBucket = -1) {
  const width = plinkoBoard.width;
  const height = plinkoBoard.height;
  plinkoContext.clearRect(0, 0, width, height);

  for (let row = 0; row < plinkoRows; row++) {
    for (let column = 0; column <= row; column++) {
      const peg = plinkoPegPosition(row, column);
      plinkoContext.beginPath();
      plinkoContext.arc(peg.x, peg.y, 3.5, 0, Math.PI * 2);
      plinkoContext.fillStyle = "#e5d7a4";
      plinkoContext.shadowColor = "#ffe7a0";
      plinkoContext.shadowBlur = 5;
      plinkoContext.fill();
    }
  }
  plinkoContext.shadowBlur = 0;

  const bucketTop = 386;
  const bucketWidth = plinkoSpacing - 2;
  for (let index = 0; index < plinkoBuckets; index++) {
    const center = plinkoBucketCenter(index);
    const multiplier = plinkoMultipliers[index];
    const color = plinkoMultiplierColor(multiplier);
    plinkoContext.fillStyle = index === highlightedBucket ? color : color + "33";
    plinkoContext.fillRect(center - bucketWidth / 2, bucketTop, bucketWidth, 54);
    plinkoContext.strokeStyle = color;
    plinkoContext.lineWidth = 1;
    plinkoContext.strokeRect(center - bucketWidth / 2, bucketTop, bucketWidth, 54);
    plinkoContext.fillStyle = index === highlightedBucket ? "#111" : color;
    plinkoContext.font = "bold 10px sans-serif";
    plinkoContext.textAlign = "center";
    plinkoContext.textBaseline = "middle";
    plinkoContext.fillText(multiplier + "x", center, bucketTop + 28);
  }

  if (ball) {
    const ballGradient = plinkoContext.createRadialGradient(ball.x - 2, ball.y - 3, 1, ball.x, ball.y, 8);
    ballGradient.addColorStop(0, "#fff8d8");
    ballGradient.addColorStop(1, "#ff9f43");
    plinkoContext.beginPath();
    plinkoContext.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
    plinkoContext.fillStyle = ballGradient;
    plinkoContext.shadowColor = "#ffb347";
    plinkoContext.shadowBlur = 12;
    plinkoContext.fill();
    plinkoContext.shadowBlur = 0;
  }
}

function createPlinkoDropPath() {
  const path = [{ x: plinkoBoard.width / 2, y: 22 }, plinkoPegPosition(0, 0)];
  let bucketIndex = 0;
  for (let row = 0; row < plinkoRows; row++) {
    bucketIndex += Math.random() < 0.5 ? 0 : 1;
    if (row < plinkoRows - 1) {
      path.push(plinkoPegPosition(row + 1, bucketIndex));
    } else {
      path.push({ x: plinkoBucketCenter(bucketIndex), y: 418 });
    }
  }
  return { path, bucketIndex };
}

function animatePlinkoDrop(path, bucketIndex) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const segmentCount = path.length - 1;
    const duration = segmentCount * 145;

    function animateFrame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const segmentProgress = progress * segmentCount;
      const segment = Math.min(Math.floor(segmentProgress), segmentCount - 1);
      const fraction = progress === 1 ? 1 : segmentProgress - segment;
      const eased = fraction * fraction * (3 - 2 * fraction);
      const start = path[segment];
      const end = path[segment + 1];
      drawPlinkoBoard({
        x: start.x + (end.x - start.x) * eased,
        y: start.y + (end.y - start.y) * eased
      });

      if (progress === 1) {
        drawPlinkoBoard(null, bucketIndex);
        resolve();
      } else {
        requestAnimationFrame(animateFrame);
      }
    }

    requestAnimationFrame(animateFrame);
  });
}

drawPlinkoBoard();

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
  inventoryWallet.textContent = balance;
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

let caseTickAudioContext;

function getCaseTickAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  if (!caseTickAudioContext) {
    caseTickAudioContext = new AudioContextClass();
  }
  if (caseTickAudioContext.state === "suspended") {
    caseTickAudioContext.resume().catch(() => {});
  }
  return caseTickAudioContext;
}

function playCaseTick(audioContext) {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(1900, now);
  oscillator.frequency.exponentialRampToValueAtTime(720, now + 0.045);
  envelope.gain.setValueAtTime(0.18, now);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  oscillator.connect(envelope);
  envelope.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.055);
}

function shuffleCaseItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createCaseItemCard(item) {
  const card = document.createElement("div");
  card.className = "case-item";
  card.style.setProperty("--item-color", item.color || item.paddleColor);
  card.dataset.rarity = item.rarity || "skin";

  const name = document.createElement("span");
  name.className = "case-item-name";
  name.textContent = item.name;
  card.appendChild(name);
  return card;
}

async function spinCaseReel(prizeTable, prize, reel, track, displayEl, faceEl, quickOpen = false) {
  const tickAudioContext = quickOpen ? null : getCaseTickAudioContext();
  const reelItems = [];
  if (quickOpen) {
    reelItems.push(prize);
  } else {
    for (let pass = 0; pass < 4; pass++) {
      reelItems.push(...shuffleCaseItems(prizeTable));
    }
    reelItems.push(prize);
  }

  const sidePadding = reel.clientWidth / 2 - 54;
  track.style.paddingLeft = sidePadding + "px";
  track.style.paddingRight = sidePadding + "px";
  track.style.transform = "translateX(0px)";
  track.replaceChildren(...reelItems.map(createCaseItemCard));

  const cards = [...track.children];
  const targetCard = cards[cards.length - 1];
  const targetOffset = reel.clientWidth / 2 - targetCard.offsetLeft - targetCard.offsetWidth / 2;
  if (quickOpen) {
    targetCard.classList.add("is-highlighted");
    displayEl.style.setProperty("--case-glow", prize.color || prize.paddleColor);
    displayEl.classList.remove("spinning", "revealed");
    faceEl.textContent = "OPENED";
    return;
  }

  const animation = track.animate(
    [
      { transform: "translateX(0px)" },
      { transform: "translateX(" + targetOffset + "px)" }
    ],
    { duration: 6800, easing: "cubic-bezier(0.08, 0.62, 0.04, 1)", fill: "forwards" }
  );

  let nextCardToTick = 1;
  function tickCardsCrossingMarker() {
    const markerX = reel.getBoundingClientRect().left + reel.clientWidth / 2;
    while (
      nextCardToTick < cards.length &&
      cards[nextCardToTick].getBoundingClientRect().left + cards[nextCardToTick].offsetWidth / 2 <= markerX
    ) {
      playCaseTick(tickAudioContext);
      nextCardToTick++;
    }
    if (nextCardToTick < cards.length) {
      requestAnimationFrame(tickCardsCrossingMarker);
    }
  }
  requestAnimationFrame(tickCardsCrossingMarker);

  await animation.finished;
  tickCardsCrossingMarker();
  track.style.transform = "translateX(" + targetOffset + "px)";
  animation.cancel();
  targetCard.classList.add("is-highlighted");
  displayEl.style.setProperty("--case-glow", prize.color || prize.paddleColor);
  displayEl.classList.remove("spinning");
  displayEl.classList.add("revealed");
  faceEl.textContent = "OPENED";
}

function applyPaddleBallSkin(skin) {
  activePaddleSkin = {
    name: skin.name,
    paddleColor: skin.paddleColor,
    ballColor: skin.ballColor
  };
  persistPaddleBallInventory();
}

function showCasinoGame(game) {
  rouletteGame.hidden = game !== "roulette";
  blackjackGame.hidden = game !== "blackjack";
  pokerGame.hidden = game !== "poker";
  slotsGame.hidden = game !== "slots";
  plinkoGame.hidden = game !== "plinko";
  coinFlipGame.hidden = game !== "coin-flip";
  cupBallGame.hidden = game !== "cup-ball";
  caseOpeningGame.hidden = game !== "case-opening";
  paddleBallCaseGame.hidden = game !== "paddle-ball-case";
  casinoScreen.classList.toggle("poker-active", game === "poker");
  for (const name of ["roulette", "blackjack", "poker", "slots", "plinko", "coin-flip", "cup-ball", "case-opening", "paddle-ball-case"]) {
    const button = document.getElementById("show-" + name);
    if (button) {
      button.setAttribute("aria-pressed", String(name === game));
    }
  }
}

function showScreen(screenName) {
  activeScreen = screenName;
  mainMenu.hidden = screenName !== "menu";
  inventoryScreen.hidden = screenName !== "inventory";
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

openInventoryButton.addEventListener("click", function () {
  renderPaddleBallInventory();
  showScreen("inventory");
});

inventoryMenuButton.addEventListener("click", function () {
  showScreen("menu");
});

document.getElementById("game-menu").addEventListener("click", function () {
  showScreen("menu");
});

document.getElementById("casino-menu").addEventListener("click", function () {
  showScreen("menu");
});

document.getElementById("show-case-opening").addEventListener("click", function () {
  showCasinoGame("case-opening");
});

document.getElementById("show-paddle-ball-case").addEventListener("click", function () {
  showCasinoGame("paddle-ball-case");
});

const casePrizeTable = [
  { name: "P250 | Sand Dune", value: 80, weight: 28, color: "#d2d2d2" },
  { name: "USP-S | Dark Water", value: 120, weight: 22, color: "#8ec5ff" },
  { name: "Desert Eagle | Blaze", value: 180, weight: 17, color: "#8b5cf6" },
  { name: "AK-47 | Redline", value: 300, weight: 12, color: "#f97316" },
  { name: "M4A1-S | Knight", value: 450, weight: 9, color: "#ec4899" },
  { name: "AWP | Asiimov", value: 700, weight: 7, color: "#10b981" },
  { name: "Karambit | Doppler", value: 1200, weight: 4, color: "#f59e0b" },
  { name: "★ Butterfly Knife | Fade", value: 2500, weight: 1, color: "#facc15" }
];

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

function animateDealerCard(cardElement, reveal = false) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return Promise.resolve();
  }

  const keyframes = reveal
    ? [
        { transform: "perspective(500px) rotateY(90deg)", opacity: 0.5 },
        { transform: "perspective(500px) rotateY(0deg)", opacity: 1 }
      ]
    : [
        { transform: "translateY(-24px) rotate(-8deg) scale(0.9)", opacity: 0 },
        { transform: "translateY(0) rotate(0) scale(1)", opacity: 1 }
      ];
  return cardElement.animate(keyframes, {
    duration: 380,
    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
  }).finished;
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

async function dealerTurn() {
  const hitButton = document.getElementById("hit-blackjack");
  const standButton = document.getElementById("stand-blackjack");
  hitButton.disabled = true;
  standButton.disabled = true;

  renderBlackjackHands(true);
  const dealerCards = [...document.getElementById("dealer-hand").children];
  await Promise.all(dealerCards.map((card, index) =>
    new Promise((resolve) => setTimeout(resolve, index * 100)).then(() => animateDealerCard(card, true))
  ));

  while (handValue(dealerHand) < 16) {
    dealerHand.push(drawCard());
    renderBlackjackHands(true);
    const newCard = document.getElementById("dealer-hand").lastElementChild;
    await animateDealerCard(newCard);
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

document.getElementById("show-poker").addEventListener("click", function () {
  showCasinoGame("poker");
});

document.getElementById("show-slots").addEventListener("click", function () {
  showCasinoGame("slots");
});

document.getElementById("show-plinko").addEventListener("click", function () {
  showCasinoGame("plinko");
});

document.getElementById("show-coin-flip").addEventListener("click", function () {
  showCasinoGame("coin-flip");
});

document.getElementById("show-cup-ball").addEventListener("click", function () {
  showCasinoGame("cup-ball");
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
const weightedSlotSymbols = ["🍒", "🍒", "🍋", "🍋", "🍊", "🍊", "🍇", "🔔", "⭐", "7️⃣"];
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
  const symbols = slotReels.map(() => weightedSlotSymbols[Math.floor(Math.random() * weightedSlotSymbols.length)]);
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

dropPlinkoButton.addEventListener("click", async function () {
  if (plinkoDropActive) return;
  const validation = validateWager();
  if (validation.error) {
    plinkoResult.textContent = validation.error;
    return;
  }

  const wager = validation.wager;
  const { path, bucketIndex } = createPlinkoDropPath();
  const multiplier = plinkoMultipliers[bucketIndex];
  const payout = Math.floor(wager * multiplier);
  money -= wager;
  updateWalletDisplay();
  plinkoDropActive = true;
  dropPlinkoButton.disabled = true;
  plinkoResult.textContent = "Your chip is bouncing through the board...";

  try {
    await animatePlinkoDrop(path, bucketIndex);
    money += payout;
    if (payout > wager) {
      plinkoResult.textContent = "Landed in " + multiplier + "x. You won $" + (payout - wager) + " profit.";
    } else if (payout === wager) {
      plinkoResult.textContent = "Landed in " + multiplier + "x. Your wager is returned.";
    } else {
      plinkoResult.textContent = "Landed in " + multiplier + "x. $" + payout + " returned.";
    }
  } finally {
    plinkoDropActive = false;
    dropPlinkoButton.disabled = false;
    updateWalletDisplay();
  }
});

openCaseButton.addEventListener("click", async function () {
  const caseCost = 50;
  if (money < caseCost) {
    caseOpeningResult.textContent = "You cannot afford to open this case.";
    return;
  }

  money -= caseCost;
  updateWalletDisplay();
  caseDisplay.classList.remove("revealed");
  caseDisplay.classList.remove("opening");
  caseDisplay.classList.add("spinning");
  caseDisplay.style.setProperty("--case-glow", "#d4af37");
  caseFace.textContent = "LOCKED";
  document.getElementById("case-reveal").textContent = "Opening...";
  caseOpeningResult.textContent = "Opening the case...";
  openCaseButton.disabled = true;
  const weightedItems = casePrizeTable.flatMap((item) => Array(item.weight).fill(item));
  const prize = weightedItems[Math.floor(Math.random() * weightedItems.length)];
  try {
    await spinCaseReel(casePrizeTable, prize, caseReel, caseReelTrack, caseDisplay, caseFace, quickOpenCase.checked);
    money += prize.value;
    document.getElementById("case-reveal").textContent = prize.name + " — $" + prize.value;
    caseOpeningResult.textContent = "You opened " + prize.name + " for $" + prize.value + ".";
    updateWalletDisplay();
  } finally {
    openCaseButton.disabled = false;
  }
});

const paddleBallPrizeTable = [
  { name: "Neon Pulse", paddleColor: "#56ccf2", ballColor: "#ffe66d", price: 95 },
  { name: "Solar Flare", paddleColor: "#ffb703", ballColor: "#fb8500", price: 110 },
  { name: "Electric Mint", paddleColor: "#80ffdb", ballColor: "#64dfdf", price: 135 },
  { name: "Lava Pop", paddleColor: "#ff5d8f", ballColor: "#ff9f1c", price: 150 },
  { name: "Void Rift", paddleColor: "#9d4edd", ballColor: "#c77dff", price: 180 }
];

function persistPaddleBallInventory() {
  try {
    localStorage.setItem(PADDLE_SKIN_STORAGE_KEY, JSON.stringify({
      owned: ownedPaddleSkins.map((skin) => skin.name),
      equipped: activePaddleSkin.name
    }));
  } catch (error) {
    console.warn("Could not save paddle and ball inventory:", error);
  }
}

function restorePaddleBallInventory() {
  try {
    const saved = JSON.parse(localStorage.getItem(PADDLE_SKIN_STORAGE_KEY) || "null");
    if (!saved) {
      return;
    }

    const ownedNames = new Set(Array.isArray(saved.owned) ? saved.owned : []);
    ownedPaddleSkins = [
      { ...defaultPaddleSkin },
      ...paddleBallPrizeTable
        .filter((skin) => ownedNames.has(skin.name))
        .map((skin) => ({ ...skin }))
    ];
    const equippedSkin = ownedPaddleSkins.find((skin) => skin.name === saved.equipped);
    activePaddleSkin = { ...(equippedSkin || defaultPaddleSkin) };
  } catch (error) {
    console.warn("Could not restore paddle and ball inventory:", error);
  }
}

function renderPaddleBallInventory() {
  inventoryList.replaceChildren();
  inventoryEmpty.hidden = ownedPaddleSkins.length > 1;

  for (const skin of ownedPaddleSkins) {
    const equipped = skin.name === activePaddleSkin.name;
    const item = document.createElement("article");
    item.className = "inventory-item";
    item.setAttribute("role", "listitem");
    item.setAttribute("aria-current", String(equipped));

    const name = document.createElement("h3");
    name.textContent = skin.name;
    item.appendChild(name);

    const colors = document.createElement("div");
    colors.className = "inventory-colors";
    for (const [label, color] of [["Paddle", skin.paddleColor], ["Ball", skin.ballColor]]) {
      const swatchGroup = document.createElement("span");
      swatchGroup.className = "inventory-swatch-group";
      const swatch = document.createElement("span");
      swatch.className = "inventory-swatch";
      swatch.style.backgroundColor = color;
      swatch.setAttribute("aria-hidden", "true");
      const swatchLabel = document.createElement("span");
      swatchLabel.textContent = label;
      swatchGroup.append(swatch, swatchLabel);
      colors.appendChild(swatchGroup);
    }
    item.appendChild(colors);

    const equipButton = document.createElement("button");
    equipButton.type = "button";
    equipButton.disabled = equipped;
    equipButton.textContent = equipped ? "Equipped" : "Equip";
    equipButton.addEventListener("click", function () {
      applyPaddleBallSkin(skin);
      renderPaddleBallInventory();
    });
    item.appendChild(equipButton);
    inventoryList.appendChild(item);
  }
}

restorePaddleBallInventory();

openPaddleBallCaseButton.addEventListener("click", async function () {
  const caseCost = 50;
  if (money < caseCost) {
    paddleBallCaseResult.textContent = "You cannot afford to open this case.";
    return;
  }

  money -= caseCost;
  updateWalletDisplay();
  paddleBallCaseDisplay.classList.remove("revealed");
  paddleBallCaseDisplay.classList.add("spinning");
  paddleBallCaseFace.textContent = "LOCKED";
  paddleBallCaseResult.textContent = "Opening your paddle and ball case...";
  document.getElementById("paddle-ball-case-reveal").textContent = "Opening...";
  openPaddleBallCaseButton.disabled = true;
  const prize = paddleBallPrizeTable[Math.floor(Math.random() * paddleBallPrizeTable.length)];
  try {
    await spinCaseReel(paddleBallPrizeTable, prize, paddleBallCaseReel, paddleBallCaseReelTrack, paddleBallCaseDisplay, paddleBallCaseFace, quickOpenPaddleCase.checked);
    if (!ownedPaddleSkins.some((skin) => skin.name === prize.name)) {
      ownedPaddleSkins.push({ ...prize });
    }
    applyPaddleBallSkin(prize);
    document.getElementById("paddle-ball-case-reveal").textContent = prize.name + " — applied to paddle and ball";
    paddleBallCaseResult.textContent = "You unlocked " + prize.name + ".";
    updateWalletDisplay();
  } finally {
    openPaddleBallCaseButton.disabled = false;
  }
});

const coin = document.getElementById("coin");
const coinButton = document.getElementById("flip-coin");

coinButton.addEventListener("click", async function () {
  const validation = validateWager();
  const result = document.getElementById("coin-result");
  if (validation.error) {
    result.textContent = validation.error;
    return;
  }

  const wager = validation.wager;
  const outcome = Math.random() < 0.5 ? "heads" : "tails";
  const guess = document.getElementById("coin-guess").value;
  const targetAngle = outcome === "heads" ? 0 : 180;
  const normalizedRotation = ((coinRotation % 360) + 360) % 360;
  const alignment = (targetAngle - normalizedRotation + 360) % 360;
  const nextRotation = coinRotation + 360 * 6 + alignment;

  money -= wager;
  updateWalletDisplay();
  result.textContent = "The coin is flipping...";
  coinButton.disabled = true;

  try {
    const animation = coin.animate(
      [
        { transform: "rotateY(" + coinRotation + "deg)" },
        { transform: "rotateY(" + nextRotation + "deg)" }
      ],
      { duration: 2800, easing: "cubic-bezier(0.12, 0.72, 0.12, 1)", fill: "forwards" }
    );
    await animation.finished;
    coinRotation = nextRotation;
    coin.style.transform = "rotateY(" + coinRotation + "deg)";
    animation.cancel();
    document.querySelector(".coin-stage").setAttribute("aria-label", "Coin showing " + outcome);

    if (outcome === guess) {
      money += wager * 2;
      result.textContent = "It’s " + outcome + "! You won $" + wager + ".";
    } else {
      result.textContent = "It’s " + outcome + ". You lost $" + wager + ".";
    }
  } finally {
    coinButton.disabled = false;
    updateWalletDisplay();
  }
});

function cupSlotCenter(slot) {
  return (slot + 0.5) * cupBallStage.clientWidth / 3;
}

async function swapCups(firstCup, secondCup) {
  const firstStart = cupSlotCenter(cupPositions[firstCup]);
  const secondStart = cupSlotCenter(cupPositions[secondCup]);
  const midpoint = (firstStart + secondStart) / 2;
  const duration = 340;
  const firstAnimation = cupButtons[firstCup].animate(
    [
      { left: firstStart + "px", top: "58px" },
      { left: midpoint + "px", top: "18px" },
      { left: secondStart + "px", top: "58px" }
    ],
    { duration, easing: "ease-in-out", fill: "forwards" }
  );
  const secondAnimation = cupButtons[secondCup].animate(
    [
      { left: secondStart + "px", top: "58px" },
      { left: midpoint + "px", top: "86px" },
      { left: firstStart + "px", top: "58px" }
    ],
    { duration, easing: "ease-in-out", fill: "forwards" }
  );

  await Promise.all([firstAnimation.finished, secondAnimation.finished]);
  const firstPosition = cupPositions[firstCup];
  cupPositions[firstCup] = cupPositions[secondCup];
  cupPositions[secondCup] = firstPosition;
  cupButtons[firstCup].style.left = secondStart + "px";
  cupButtons[secondCup].style.left = firstStart + "px";
  cupButtons[firstCup].style.top = "58px";
  cupButtons[secondCup].style.top = "58px";
  firstAnimation.cancel();
  secondAnimation.cancel();
}

async function revealCupBallChoice(selectedCup) {
  if (!cupBallRoundActive) {
    return;
  }

  cupBallRoundActive = false;
  cupButtons.forEach((cup) => { cup.disabled = true; });
  const revealAnimations = cupButtons.map((cup) => {
    const animation = cup.animate(
      [{ top: "58px" }, { top: "20px" }],
      { duration: 350, easing: "ease-out", fill: "forwards" }
    );
    return animation.finished.then(() => {
      cup.style.top = "20px";
      animation.cancel();
    });
  });
  await Promise.all(revealAnimations);

  cupBall.style.left = cupSlotCenter(cupPositions[ballCupIndex]) + "px";
  cupBall.style.top = "124px";
  cupBall.style.visibility = "visible";
  if (selectedCup === ballCupIndex) {
    const winnings = cupBallWager * 2;
    money += cupBallWager + winnings;
    cupBallResult.textContent = "You found the ball under Cup " + (selectedCup + 1) + "! You won $" + winnings + ".";
  } else {
    cupBallResult.textContent = "The ball was under Cup " + (ballCupIndex + 1) + ". You lost $" + cupBallWager + ".";
  }
  updateWalletDisplay();
  startCupBallButton.disabled = false;
}

cupButtons.forEach((cup, index) => {
  cup.addEventListener("click", function () {
    revealCupBallChoice(index);
  });
});

startCupBallButton.addEventListener("click", async function () {
  const validation = validateWager();
  if (validation.error) {
    cupBallResult.textContent = validation.error;
    return;
  }

  cupBallRoundActive = false;
  cupBallWager = validation.wager;
  money -= cupBallWager;
  updateWalletDisplay();
  startCupBallButton.disabled = true;
  cupButtons.forEach((cup, index) => {
    cup.disabled = true;
    cup.style.left = cupSlotCenter(index) + "px";
    cup.style.top = "40px";
  });
  cupPositions = [0, 1, 2];
  ballCupIndex = Math.floor(Math.random() * cupButtons.length);
  cupBall.style.visibility = "visible";
  cupBall.style.left = cupBallStage.clientWidth / 2 + "px";
  cupBall.style.top = "164px";
  cupBallResult.textContent = "Watch the ball, then follow the cups...";

  const ballDestination = cupSlotCenter(ballCupIndex);
  const ballAnimation = cupBall.animate(
    [
      { left: cupBallStage.clientWidth / 2 + "px", top: "164px" },
      { left: (cupBallStage.clientWidth / 2 + ballDestination) / 2 + "px", top: "137px", offset: 0.55 },
      { left: ballDestination + "px", top: "124px" }
    ],
    { duration: 720, easing: "ease-in-out", fill: "forwards" }
  );
  await ballAnimation.finished;
  cupBall.style.left = ballDestination + "px";
  cupBall.style.top = "124px";
  ballAnimation.cancel();

  const coverAnimation = cupButtons[ballCupIndex].animate(
    [{ top: "40px" }, { top: "58px" }],
    { duration: 250, easing: "ease-in", fill: "forwards" }
  );
  await coverAnimation.finished;
  cupButtons[ballCupIndex].style.top = "58px";
  coverAnimation.cancel();
  cupBall.style.visibility = "hidden";

  await Promise.all(cupButtons.map((cup) => {
    const animation = cup.animate(
      [{ top: cup.style.top || "40px" }, { top: "58px" }],
      { duration: 180, easing: "ease-in", fill: "forwards" }
    );
    return animation.finished.then(() => {
      cup.style.top = "58px";
      animation.cancel();
    });
  }));

  for (let swap = 0; swap < 12; swap++) {
    const firstCup = Math.floor(Math.random() * cupButtons.length);
    const secondCup = (firstCup + 1 + Math.floor(Math.random() * (cupButtons.length - 1))) % cupButtons.length;
    await swapCups(firstCup, secondCup);
  }

  cupBallRoundActive = true;
  cupButtons.forEach((cup) => { cup.disabled = false; });
  cupBallResult.textContent = "Pick the cup hiding the ball.";
});

drawRouletteWheel();
showCasinoGame("slots");
updateWalletDisplay();
