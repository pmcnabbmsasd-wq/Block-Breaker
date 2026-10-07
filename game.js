// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const grenadeTexture = new Image();
grenadeTexture.src = "grenade.png";
const bossTexture = new Image();
bossTexture.src = "boss.png";

const WIDTH = canvas.width;   // 600
const HEIGHT = canvas.height; // 450


// ------------------------------------------------------------
// THE BALL
// x and y are the top-left corner. vx and vy are how many pixels
// the ball moves each update (vx = sideways, vy = up/down).
// A positive vy means the ball is moving DOWN the screen.
// ------------------------------------------------------------
const BALL_SPEED = 4;

const ball = {
  x: 0,
  y: 0,
  width: 12,
  height: 12,
  vx: 0,
  vy: 0,
  grenadeArmed: false
};

// Put the ball in the center and reset its speed and direction.
function resetBall() {
  const ballSpeed = BALL_SPEED + (currentLevel - 1) * 0.35;
  ball.x = WIDTH / 2 - ball.width / 2;
  ball.y = HEIGHT / 2 - ball.height / 2;
  ball.vx = ballSpeed;  // right
  ball.vy = ballSpeed;  // down
  ball.grenadeArmed = false;
}


// ------------------------------------------------------------
// THE PADDLE
// ------------------------------------------------------------
const paddle = {
  x: WIDTH / 2 - 45,
  y: HEIGHT - 30,
  width: 90,
  height: 12,
  speed: 6
};


// ------------------------------------------------------------
// THE BRICKS (the list is filled in by makeBricks() in bricks.js)
// ------------------------------------------------------------
let bricks = [];
let score = 0;
const particles = [];
const extraBalls = [];
const grenadeDrops = [];
const bossLasers = [];
const STARTING_RESPAWNS = 15;
const TOTAL_LEVELS = 16;
let respawnsLeft = STARTING_RESPAWNS;
let gameOver = false;
let gameWon = false;
let currentLevel = 1;
let levelTransitionTicks = 0;
let boss = null;


// ------------------------------------------------------------
// KEYBOARD
// keys["arrowleft"] is true while the left arrow is held down.
// ------------------------------------------------------------
const keys = {};

document.addEventListener("keydown", function (event) {
  keys[event.key.toLowerCase()] = true;
  // Stop the arrow keys from scrolling the page.
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});


// ------------------------------------------------------------
// UPDATE: runs 60 times every second. Move things, then check
// what they touched.
// ------------------------------------------------------------
function update() {
  if (gameOver || gameWon) {
    updateParticles();
    return;
  }

  if (bricks.length === 0 && !boss) {
    if (currentLevel === TOTAL_LEVELS) {
      gameWon = true;
    } else if (levelTransitionTicks === 0) {
      levelTransitionTicks = 90;
    } else {
      levelTransitionTicks--;
      if (levelTransitionTicks === 0) {
        currentLevel++;
        startLevel();
      }
    }
    updateParticles();
    return;
  }

  movePaddle();
  if (boss) {
    updateBoss();
    updateBossLasers();
  }

  const activeBalls = boss ? [] : [ball, ...extraBalls];

  for (const activeBall of activeBalls) {
    moveBall(activeBall);
    bounceOffWalls(activeBall);   // collisions.js
    bounceOffPaddle(activeBall);  // collisions.js
    bounceOffBricks(activeBall);  // collisions.js
  }

  updateGrenadeDrops();

  for (let i = extraBalls.length - 1; i >= 0; i--) {
    if (extraBalls[i].y > HEIGHT) {
      extraBalls.splice(i, 1);
    }
  }

  if (!boss && ball.y > HEIGHT) {
    if (respawnsLeft > 0) {
      respawnsLeft--;
      resetBall();
    } else {
      gameOver = true;
      extraBalls.length = 0;
    }
  }

  updateParticles();
}

function movePaddle() {
  if (keys["arrowleft"] || keys["a"]) {
    paddle.x = paddle.x - paddle.speed;
  }
  if (keys["arrowright"] || keys["d"]) {
    paddle.x = paddle.x + paddle.speed;
  }

  // Keep the paddle on the screen.
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > WIDTH) {
    paddle.x = WIDTH - paddle.width;
  }
}

function moveBall(movingBall = ball) {
  movingBall.x = movingBall.x + movingBall.vx;
  movingBall.y = movingBall.y + movingBall.vy;
}

function spawnExtraBalls(sourceBall) {
  const speed = Math.hypot(sourceBall.vx, sourceBall.vy);
  const angle = Math.atan2(sourceBall.vy, sourceBall.vx);

  for (const angleOffset of [-0.45, 0.45]) {
    extraBalls.push({
      x: sourceBall.x,
      y: sourceBall.y,
      width: sourceBall.width,
      height: sourceBall.height,
      vx: Math.cos(angle + angleOffset) * speed,
      vy: Math.sin(angle + angleOffset) * speed
    });
  }
}

function updateGrenadeDrops() {
  for (let i = grenadeDrops.length - 1; i >= 0; i--) {
    const drop = grenadeDrops[i];
    drop.y += drop.vy;

    if (boxesTouch(drop, paddle)) {
      ball.grenadeArmed = true;
      grenadeDrops.splice(i, 1);
    } else if (drop.y > HEIGHT) {
      grenadeDrops.splice(i, 1);
    }
  }
}

function updateBoss() {
  boss.x += boss.vx;
  if (boss.x < 8 || boss.x + boss.width > WIDTH - 8) {
    boss.x = Math.max(8, Math.min(WIDTH - boss.width - 8, boss.x));
    boss.vx = -boss.vx;
  }

  boss.fireCooldown--;
  if (boss.fireCooldown <= 0) {
    const bossCenter = boss.x + boss.width / 2;
    const paddleCenter = paddle.x + paddle.width / 2;
    bossLasers.push({
      x: bossCenter - 4,
      y: boss.y + boss.height,
      width: 8,
      height: 18,
      vx: Math.max(-1.5, Math.min(1.5, (paddleCenter - bossCenter) * 0.006)),
      vy: 3.8,
      returned: false
    });
    boss.fireCooldown = 82;
  }
}

function updateBossLasers() {
  for (let i = bossLasers.length - 1; i >= 0; i--) {
    const laser = bossLasers[i];
    laser.x += laser.vx;
    laser.y += laser.vy;

    if (laser.x < 0 || laser.x + laser.width > WIDTH) {
      laser.x = Math.max(0, Math.min(WIDTH - laser.width, laser.x));
      laser.vx = -laser.vx;
    }

    if (!laser.returned && boxesTouch(laser, paddle)) {
      laser.returned = true;
      laser.vy = -Math.abs(laser.vy);
      const paddleOffset = laser.x + laser.width / 2 - (paddle.x + paddle.width / 2);
      laser.vx = Math.max(-2, Math.min(2, paddleOffset * 0.08));
    } else if (!laser.returned && laser.y > HEIGHT) {
      respawnsLeft = Math.max(0, respawnsLeft - 1);
      bossLasers.splice(i, 1);
      if (respawnsLeft === 0) {
        gameOver = true;
        bossLasers.length = 0;
        return;
      }
      continue;
    }

    if (laser.returned && boxesTouch(laser, boss)) {
      boss.health--;
      bossLasers.splice(i, 1);
      if (boss.health <= 0) {
        boss = null;
        bossLasers.length = 0;
        return;
      }
      continue;
    }

    if (laser.returned && laser.y + laser.height < 0) {
      bossLasers.splice(i, 1);
    }
  }
}

function drawBoss() {
  if (bossTexture.complete && bossTexture.naturalWidth > 0) {
    ctx.drawImage(bossTexture, boss.x, boss.y, boss.width, boss.height);
  } else {
    ctx.fillStyle = "#7ee34b";
    ctx.fillRect(boss.x + 22, boss.y + 20, 52, 48);
    ctx.fillRect(boss.x + 6, boss.y + 32, 16, 30);
    ctx.fillRect(boss.x + 74, boss.y + 32, 16, 30);
    ctx.fillRect(boss.x + 30, boss.y + 8, 12, 12);
    ctx.fillRect(boss.x + 54, boss.y + 8, 12, 12);
    ctx.fillRect(boss.x + 24, boss.y + 68, 14, 14);
    ctx.fillRect(boss.x + 58, boss.y + 68, 14, 14);

    ctx.fillStyle = "#111";
    ctx.fillRect(boss.x + 32, boss.y + 38, 8, 8);
    ctx.fillRect(boss.x + 56, boss.y + 38, 8, 8);
  }

  ctx.fillStyle = "#444";
  ctx.fillRect(WIDTH / 2 - 60, boss.y + boss.height + 13, 120, 8);
  ctx.fillStyle = "#ff5263";
  ctx.fillRect(WIDTH / 2 - 60, boss.y + boss.height + 13, 120 * boss.health / boss.maxHealth, 8);
  ctx.fillStyle = "white";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BOSS", WIDTH / 2, boss.y + boss.height + 38);
  ctx.textAlign = "start";
}


// ------------------------------------------------------------
// DRAW: paints everything on the canvas. Black background,
// white shapes.
// ------------------------------------------------------------
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.x = particle.x + particle.vx;
    particle.y = particle.y + particle.vy;
    particle.life = particle.life - 1;

    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  for (const particle of particles) {
    ctx.fillStyle = "rgba(255, 255, 255, " + particle.life / 15 + ")";
    ctx.fillRect(particle.x, particle.y, 3, 3);
  }
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText((boss ? "Lives: " : "Respawns: ") + respawnsLeft, WIDTH - 150, 30);
  ctx.fillText("Level: " + currentLevel + "/" + TOTAL_LEVELS, WIDTH / 2 - 50, 30);

  if (gameWon) {
    ctx.textAlign = "center";
    ctx.font = "40px sans-serif";
    ctx.fillText("You win!", WIDTH / 2, HEIGHT / 2 - 15);
    ctx.font = "18px sans-serif";
    ctx.fillText("Click to play again", WIDTH / 2, HEIGHT / 2 + 25);
    ctx.textAlign = "start";
    drawParticles();
    return;
  }

  if (bricks.length === 0 && !boss) {
    ctx.textAlign = "center";
    ctx.font = "36px sans-serif";
    ctx.fillText("Level " + currentLevel + " complete!", WIDTH / 2, HEIGHT / 2);
    ctx.textAlign = "start";
    drawParticles();
    return;
  }

  if (gameOver) {
    ctx.textAlign = "center";
    ctx.font = "40px sans-serif";
    ctx.fillText("Game over", WIDTH / 2, HEIGHT / 2 - 15);
    ctx.font = "18px sans-serif";
    ctx.fillText("Click to restart", WIDTH / 2, HEIGHT / 2 + 25);
    ctx.textAlign = "start";
    drawParticles();
    return;
  }

  if (boss) {
    drawBoss();
    for (const laser of bossLasers) {
      ctx.fillStyle = laser.returned ? "#5fffe0" : "#ff5263";
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }
  }

  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  if (!boss) {
    for (const activeBall of [ball, ...extraBalls]) {
      ctx.fillStyle = activeBall.grenadeArmed ? "#f05a3e" : "white";
      ctx.fillRect(activeBall.x, activeBall.y, activeBall.width, activeBall.height);
    }
  }

  drawBricks();  // bricks.js
  for (const drop of grenadeDrops) {
    if (grenadeTexture.complete && grenadeTexture.naturalWidth > 0) {
      ctx.drawImage(grenadeTexture, drop.x, drop.y, drop.width, drop.height);
    } else {
      ctx.fillStyle = "#f05a3e";
      ctx.beginPath();
      ctx.arc(drop.x + drop.width / 2, drop.y + drop.height / 2, drop.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawParticles();
}

function restartGame() {
  currentLevel = 1;
  levelTransitionTicks = 0;
  score = 0;
  respawnsLeft = STARTING_RESPAWNS;
  gameOver = false;
  gameWon = false;
  extraBalls.length = 0;
  particles.length = 0;
  startLevel();
}

function startLevel() {
  boss = currentLevel === TOTAL_LEVELS ? {
    x: WIDTH / 2 - 48,
    y: 62,
    width: 96,
    height: 96,
    vx: 2.6,
    health: 8,
    maxHealth: 8,
    fireCooldown: 55
  } : null;
  bossLasers.length = 0;
  if (boss) {
    respawnsLeft = 20;
  }
  bricks = boss ? [] : makeBricks(currentLevel);
  levelTransitionTicks = 0;
  grenadeDrops.length = 0;
  paddle.width = Math.max(60, 90 - (currentLevel - 1) * 3);
  paddle.x = WIDTH / 2 - paddle.width / 2;
  extraBalls.length = 0;
  resetBall();
}

canvas.addEventListener("click", function () {
  if (gameOver || gameWon) {
    restartGame();
  }
});


// ------------------------------------------------------------
// THE GAME LOOP
// The browser calls frame() every time it is ready to draw.
// Some screens are faster than others, so we make sure update()
// always runs exactly 60 times per second on every computer.
// ------------------------------------------------------------
const STEP = 1000 / 60;
let lastTime = 0;
let leftover = 0;

function frame(now) {
  leftover = leftover + (now - lastTime);
  lastTime = now;

  // If the tab was hidden for a while, don't try to catch up.
  if (leftover > 250) {
    leftover = 250;
  }

  while (leftover >= STEP) {
    update();
    leftover = leftover - STEP;
  }

  draw();
  requestAnimationFrame(frame);
}

function start() {
  restartGame();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all three script files have loaded, then start.
window.addEventListener("load", start);
