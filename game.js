// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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
  vy: 0
};

// Put the ball in the center and reset its speed and direction.
function resetBall() {
  const ballSpeed = BALL_SPEED + (currentLevel - 1) * 0.35;
  ball.x = WIDTH / 2 - ball.width / 2;
  ball.y = HEIGHT / 2 - ball.height / 2;
  ball.vx = ballSpeed;  // right
  ball.vy = ballSpeed;  // down
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
const STARTING_RESPAWNS = 15;
const TOTAL_LEVELS = 11;
let respawnsLeft = STARTING_RESPAWNS;
let gameOver = false;
let gameWon = false;
let currentLevel = 1;
let levelTransitionTicks = 0;


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

  if (bricks.length === 0) {
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
  const activeBalls = [ball, ...extraBalls];

  for (const activeBall of activeBalls) {
    moveBall(activeBall);
    bounceOffWalls(activeBall);   // collisions.js
    bounceOffPaddle(activeBall);  // collisions.js
    bounceOffBricks(activeBall);  // collisions.js
  }

  for (let i = extraBalls.length - 1; i >= 0; i--) {
    if (extraBalls[i].y > HEIGHT) {
      extraBalls.splice(i, 1);
    }
  }

  if (ball.y > HEIGHT) {
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
  ctx.fillText("Respawns: " + respawnsLeft, WIDTH - 150, 30);
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

  if (bricks.length === 0) {
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

  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  for (const activeBall of [ball, ...extraBalls]) {
    ctx.fillRect(activeBall.x, activeBall.y, activeBall.width, activeBall.height);
  }

  drawBricks();  // bricks.js
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
  bricks = makeBricks(currentLevel);
  levelTransitionTicks = 0;
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
