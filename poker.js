const pokerSuits = ["♣", "♦", "♥", "♠"];
const pokerRanks = { 11: "J", 12: "Q", 13: "K", 14: "A" };
const pokerStartButton = document.getElementById("poker-start");
const pokerFoldButton = document.getElementById("poker-fold");
const pokerCheckCallButton = document.getElementById("poker-check-call");
const pokerRaiseButton = document.getElementById("poker-raise");
const pokerResult = document.getElementById("poker-result");
const pokerStatus = document.getElementById("poker-street");
let pokerDeck = [];
let pokerPlayers = [];
let pokerBoard = [];
let pokerPot = 0;
let pokerCurrentBet = 0;
let pokerBuyIn = 0;
let pokerRaiseSize = 0;
let pokerRaisesThisStreet = 0;
let pokerStage = "waiting";
let pokerPendingSeats = [];
let pokerCurrentSeat = null;
let pokerDealerSeat = -1;
let pokerHandActive = false;
let pokerShowdown = false;
let pokerBusy = false;

function createPokerDeck() {
  const deck = [];
  for (const suit of pokerSuits) {
    for (let rank = 2; rank <= 14; rank++) {
      deck.push({ rank, suit });
    }
  }
  for (let index = deck.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

function drawPokerCard() {
  return pokerDeck.pop();
}

function pokerRankLabel(rank) {
  return pokerRanks[rank] || String(rank);
}

function createPokerCard(card, faceDown = false) {
  const element = document.createElement("div");
  element.className = "poker-card";
  if (faceDown || !card) {
    element.classList.add("is-back");
    element.setAttribute("aria-label", "Face-down card");
    element.textContent = "◆";
    return element;
  }

  if (card.suit === "♦" || card.suit === "♥") {
    element.classList.add("is-red");
  }
  element.setAttribute("aria-label", pokerRankLabel(card.rank) + " of " + card.suit);
  const rank = document.createElement("span");
  rank.textContent = pokerRankLabel(card.rank);
  const suit = document.createElement("span");
  suit.textContent = card.suit;
  element.append(rank, suit);
  return element;
}

function renderPokerTable() {
  for (let seatIndex = 0; seatIndex < 4; seatIndex++) {
    const player = pokerPlayers[seatIndex];
    const seat = document.querySelector('[data-poker-seat="' + seatIndex + '"]');
    const cards = document.getElementById("poker-cards-" + seatIndex);
    const status = document.getElementById("poker-status-" + seatIndex);
    const stack = document.getElementById("poker-stack-" + seatIndex);
    seat.classList.toggle("is-current", pokerHandActive && pokerCurrentSeat === seatIndex);
    seat.classList.toggle("is-folded", Boolean(player && !player.active));
    if (!player) {
      cards.replaceChildren();
      status.textContent = "Waiting";
      stack.textContent = "Stack: --";
      continue;
    }
    status.textContent = player.status;
    stack.textContent = "Stack: $" + player.stack;
    const revealCards = player.human || (pokerShowdown && player.active);
    cards.replaceChildren(...player.hole.map((card) => createPokerCard(card, !revealCards)));
  }

  document.getElementById("poker-board-cards").replaceChildren(
    ...pokerBoard.map((card) => createPokerCard(card))
  );
  document.getElementById("poker-pot").textContent = "Pot: $" + pokerPot;
  pokerStatus.textContent = pokerStage === "waiting" ? "Waiting for a hand" : pokerStage;
}

function pokerHandScore(cards) {
  if (cards.length < 5) {
    return [0];
  }
  let bestScore = null;
  const selected = [];

  function chooseCards(startIndex) {
    if (selected.length === 5) {
      const score = scoreFivePokerCards(selected);
      if (!bestScore || comparePokerScores(score, bestScore) > 0) {
        bestScore = score;
      }
      return;
    }
    for (let index = startIndex; index <= cards.length - (5 - selected.length); index++) {
      selected.push(cards[index]);
      chooseCards(index + 1);
      selected.pop();
    }
  }

  chooseCards(0);
  return bestScore;
}

function scoreFivePokerCards(cards) {
  const ranks = cards.map((card) => card.rank).sort((a, b) => b - a);
  const counts = new Map();
  for (const rank of ranks) {
    counts.set(rank, (counts.get(rank) || 0) + 1);
  }
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const uniqueRanks = [...counts.keys()].sort((a, b) => b - a);
  const straightRanks = uniqueRanks.includes(14) ? [...uniqueRanks, 1] : uniqueRanks;
  let straightHigh = 0;
  for (let index = 0; index <= straightRanks.length - 5; index++) {
    if (straightRanks[index] - straightRanks[index + 4] === 4) {
      straightHigh = straightRanks[index];
      break;
    }
  }
  const flush = cards.every((card) => card.suit === cards[0].suit);

  if (flush && straightHigh) return [8, straightHigh];
  if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]];
  if (groups[0][1] === 3 && groups[1][1] === 2) return [6, groups[0][0], groups[1][0]];
  if (flush) return [5, ...ranks];
  if (straightHigh) return [4, straightHigh];
  if (groups[0][1] === 3) {
    return [3, groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  }
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = groups.slice(0, 2).map(([rank]) => rank).sort((a, b) => b - a);
    return [2, ...pairs, groups[2][0]];
  }
  if (groups[0][1] === 2) {
    return [1, groups[0][0], ...groups.slice(1).map(([rank]) => rank).sort((a, b) => b - a)];
  }
  return [0, ...ranks];
}

function comparePokerScores(first, second) {
  for (let index = 0; index < Math.max(first.length, second.length); index++) {
    const difference = (first[index] || 0) - (second[index] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function pokerHandName(category) {
  return ["high card", "one pair", "two pair", "three of a kind", "straight", "flush", "full house", "four of a kind", "straight flush"][category];
}

function pokerStrength(player) {
  if (pokerBoard.length >= 3) {
    return pokerHandScore([...player.hole, ...pokerBoard])[0] / 8;
  }
  const [first, second] = player.hole.map((card) => card.rank).sort((a, b) => b - a);
  let strength = (first - 2) * 0.035 + (second - 2) * 0.018;
  if (first === second) strength += 0.2;
  if (player.hole[0].suit === player.hole[1].suit) strength += 0.04;
  if (first - second === 1) strength += 0.03;
  return Math.min(strength, 1);
}

function pokerCommit(player, amount) {
  const committed = Math.min(player.stack, amount);
  player.stack -= committed;
  player.streetBet += committed;
  pokerPot += committed;
}

function activePokerPlayers() {
  return pokerPlayers.filter((player) => player.active);
}

function buildPokerOwedQueue(afterSeat) {
  const queue = [];
  for (let offset = 1; offset <= pokerPlayers.length; offset++) {
    const seatIndex = (afterSeat + offset) % pokerPlayers.length;
    const player = pokerPlayers[seatIndex];
    if (player.active && player.streetBet < pokerCurrentBet) {
      queue.push(seatIndex);
    }
  }
  return queue;
}

function refreshPokerActions(playerTurn = false) {
  const player = pokerPlayers[0];
  const amountToCall = player ? pokerCurrentBet - player.streetBet : 0;
  pokerFoldButton.disabled = !playerTurn;
  pokerCheckCallButton.disabled = !playerTurn || amountToCall > player.stack;
  pokerCheckCallButton.textContent = amountToCall > 0 ? "Call $" + amountToCall : "Check";
  const canRaise = pokerRaisesThisStreet < 2 && player && player.stack >= amountToCall + pokerRaiseSize;
  pokerRaiseButton.disabled = !playerTurn || !canRaise;
  pokerRaiseButton.textContent = (pokerCurrentBet > 0 ? "Raise $" : "Bet $") + pokerRaiseSize;
}

function applyPokerAction(player, action) {
  const amountToCall = pokerCurrentBet - player.streetBet;
  if (action === "fold") {
    player.active = false;
    player.status = "Folded";
    return false;
  }
  if (action === "check" || action === "call") {
    if (amountToCall > 0) {
      pokerCommit(player, amountToCall);
      player.status = "Called $" + amountToCall;
    } else {
      player.status = "Checked";
    }
    return false;
  }

  const raiseAmount = amountToCall + pokerRaiseSize;
  pokerCommit(player, raiseAmount);
  pokerCurrentBet = player.streetBet;
  pokerRaisesThisStreet++;
  player.status = (amountToCall > 0 ? "Raised to $" : "Bet $") + pokerCurrentBet;
  return true;
}

function choosePokerBotAction(player) {
  const amountToCall = pokerCurrentBet - player.streetBet;
  const strength = pokerStrength(player);
  const canRaise = pokerRaisesThisStreet < 2 && player.stack >= amountToCall + pokerRaiseSize;
  if (amountToCall > player.stack) {
    return "fold";
  }
  if (amountToCall > 0) {
    if (strength < 0.16 && Math.random() < 0.65) return "fold";
    if (canRaise && strength > 0.72 && Math.random() < 0.16) return "raise";
    return "call";
  }
  if (canRaise && strength > 0.58 && Math.random() < 0.22) return "raise";
  return "check";
}

function updatePokerWallet() {
  updateWalletDisplay();
}

function settlePokerHand(winners, message, revealCards = true) {
  const baseShare = Math.floor(pokerPot / winners.length);
  let remainder = pokerPot % winners.length;
  for (const winner of winners) {
    const share = baseShare + (remainder > 0 ? 1 : 0);
    remainder--;
    winner.stack += share;
    if (winner.human) {
      message += " Your share is $" + share + ".";
    }
  }
  pokerHandActive = false;
  pokerBusy = false;
  pokerCurrentSeat = null;
  pokerShowdown = revealCards;
  pokerPlayers[0].status = winners.some((winner) => winner.human) ? "Winner" : pokerPlayers[0].status;
  pokerResult.textContent = message;
  pokerStartButton.disabled = false;
  pokerStartButton.textContent = "Deal next hand";
  refreshPokerActions(false);
  updatePokerWallet();
  renderPokerTable();
}

function finishPokerByFold() {
  const winner = activePokerPlayers()[0];
  const amount = pokerPot;
  settlePokerHand([winner], winner.human
    ? "Everyone folded. You win the $" + amount + " pot."
    : winner.name + " wins the $" + amount + " pot; everyone else folded.", false);
}

function finishPokerShowdown() {
  pokerShowdown = true;
  const contenders = activePokerPlayers().map((player) => ({
    player,
    score: pokerHandScore([...player.hole, ...pokerBoard])
  }));
  let best = contenders[0].score;
  for (const contender of contenders.slice(1)) {
    if (comparePokerScores(contender.score, best) > 0) best = contender.score;
  }
  const winners = contenders
    .filter((contender) => comparePokerScores(contender.score, best) === 0)
    .map((contender) => contender.player);
  const handName = pokerHandName(best[0]);
  for (const contender of contenders) {
    contender.player.status = winners.includes(contender.player) ? handName : "Showdown";
  }
  const winnerNames = winners.map((winner) => winner.human ? "You" : winner.name).join(" and ");
  settlePokerHand(winners, winnerNames + " win with " + handName + ".");
}

function dealNextPokerStreet() {
  if (pokerStage === "pre-flop") {
    pokerStage = "flop";
    pokerBoard.push(drawPokerCard(), drawPokerCard(), drawPokerCard());
  } else if (pokerStage === "flop") {
    pokerStage = "turn";
    pokerBoard.push(drawPokerCard());
  } else {
    pokerStage = "river";
    pokerBoard.push(drawPokerCard());
  }
  pokerCurrentBet = 0;
  pokerRaisesThisStreet = 0;
  pokerPlayers.forEach((player) => {
    player.streetBet = 0;
    if (player.active) player.status = "In hand";
  });
  pokerPendingSeats = Array.from({ length: 4 }, (_, offset) => (pokerDealerSeat + offset + 1) % 4)
    .filter((seatIndex) => pokerPlayers[seatIndex].active);
  pokerCurrentSeat = null;
  renderPokerTable();
}

function waitForPokerAction() {
  return new Promise((resolve) => setTimeout(resolve, 420));
}

async function runPokerHand() {
  pokerBusy = true;
  refreshPokerActions(false);
  while (pokerHandActive) {
    if (activePokerPlayers().length === 1) {
      finishPokerByFold();
      return;
    }

    if (pokerPendingSeats.length === 0) {
      const unmatched = pokerPlayers.some((player) => player.active && player.streetBet < pokerCurrentBet);
      if (unmatched) {
        pokerPendingSeats = buildPokerOwedQueue(pokerCurrentSeat ?? 3);
        continue;
      }
      if (pokerStage === "river") {
        finishPokerShowdown();
        return;
      }
      dealNextPokerStreet();
      await waitForPokerAction();
      continue;
    }

    const seatIndex = pokerPendingSeats.shift();
    const player = pokerPlayers[seatIndex];
    if (!player.active) continue;
    pokerCurrentSeat = seatIndex;
    if (player.human) {
      player.status = "Your turn";
      pokerResult.textContent = pokerCurrentBet > player.streetBet
        ? "Choose whether to call, raise, or fold."
        : "Check, bet, or fold.";
      pokerBusy = false;
      refreshPokerActions(true);
      renderPokerTable();
      return;
    }

    const action = choosePokerBotAction(player);
    const raised = applyPokerAction(player, action);
    renderPokerTable();
    if (raised) {
      pokerPendingSeats = buildPokerOwedQueue(seatIndex);
    }
    await waitForPokerAction();
  }
  pokerBusy = false;
}

function startPokerHand() {
  if (pokerHandActive || pokerBusy) return;
  const validation = validateWager();
  if (validation.error) {
    pokerResult.textContent = validation.error;
    return;
  }

  pokerBuyIn = validation.wager;
  pokerRaiseSize = Math.max(2, Math.floor(pokerBuyIn * 0.1));
  const smallBlind = Math.max(1, Math.floor(pokerBuyIn * 0.1));
  const bigBlind = Math.max(smallBlind + 1, Math.floor(pokerBuyIn * 0.2));
  money -= pokerBuyIn;
  pokerDeck = createPokerDeck();
  pokerBoard = [];
  pokerPot = 0;
  pokerCurrentBet = bigBlind;
  pokerRaisesThisStreet = 0;
  pokerStage = "pre-flop";
  pokerShowdown = false;
  pokerDealerSeat = (pokerDealerSeat + 1) % 4;
  const smallBlindSeat = (pokerDealerSeat + 1) % 4;
  const bigBlindSeat = (pokerDealerSeat + 2) % 4;
  pokerPlayers = [
    { name: "You", human: true, stack: pokerBuyIn, active: true, status: "In hand", hole: [], streetBet: 0 },
    { name: "Maya", human: false, stack: pokerBuyIn, active: true, status: "In hand", hole: [], streetBet: 0 },
    { name: "Leo", human: false, stack: pokerBuyIn, active: true, status: "In hand", hole: [], streetBet: 0 },
    { name: "Sam", human: false, stack: pokerBuyIn, active: true, status: "In hand", hole: [], streetBet: 0 }
  ];
  pokerPlayers[pokerDealerSeat].status = "Dealer";
  pokerPlayers[smallBlindSeat].status = "Small blind";
  pokerPlayers[bigBlindSeat].status = "Big blind";
  for (let card = 0; card < 2; card++) {
    pokerPlayers.forEach((player) => player.hole.push(drawPokerCard()));
  }
  pokerCommit(pokerPlayers[smallBlindSeat], smallBlind);
  pokerCommit(pokerPlayers[bigBlindSeat], bigBlind);
  pokerCurrentSeat = null;
  pokerPendingSeats = Array.from({ length: 4 }, (_, offset) => (pokerDealerSeat + offset + 3) % 4);
  pokerHandActive = true;
  pokerStartButton.disabled = true;
  pokerStartButton.textContent = "Hand in progress";
  pokerResult.textContent = "Blinds are posted. Betting begins.";
  updatePokerWallet();
  renderPokerTable();
  runPokerHand();
}

async function playPokerAction(action) {
  if (!pokerHandActive || pokerBusy || pokerCurrentSeat !== 0) return;
  pokerBusy = true;
  const raised = applyPokerAction(pokerPlayers[0], action);
  pokerCurrentSeat = null;
  if (raised) pokerPendingSeats = buildPokerOwedQueue(0);
  renderPokerTable();
  refreshPokerActions(false);
  await runPokerHand();
}

pokerStartButton.addEventListener("click", startPokerHand);
pokerFoldButton.addEventListener("click", () => playPokerAction("fold"));
pokerCheckCallButton.addEventListener("click", () => {
  const player = pokerPlayers[0];
  playPokerAction(pokerCurrentBet > player.streetBet ? "call" : "check");
});
pokerRaiseButton.addEventListener("click", () => playPokerAction("raise"));
renderPokerTable();