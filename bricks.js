// ============================================================
// bricks.js: where the bricks are, and how they are drawn
// ============================================================

const BRICK_COLUMNS = 8;
const BRICK_ROWS = 4;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 6;     // empty space between bricks
const BRICKS_TOP = 50;   // how far down the first row starts

// Builds the list of bricks. Each brick is an object with an
// x, y, width, and height.
function makeBricks(level = 1) {
  const list = [];
  const rows = Math.min(BRICK_ROWS + Math.floor((level - 1) / 2), 8);

  // Center the whole block of bricks on the screen.
  const totalWidth = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP;
  const left = (WIDTH - totalWidth) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < BRICK_COLUMNS; col++) {
      list.push({
        x: left + col * (BRICK_WIDTH + BRICK_GAP),
        y: BRICKS_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        row,
        col,
        powerUp: null
      });
    }
  }

  list[10].powerUp = "multiball";
  list[21].powerUp = "tnt";
  if (level % 2 === 0) {
    list[5].powerUp = "extraLife";
  }
  if (level === 3) {
    list[26].powerUp = "grenade";
  }

  return list;
}

// Draws every brick in the list.
function drawBricks() {
  for (const brick of bricks) {
    ctx.fillStyle = brick.powerUp ? "#aaa" : "white";
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    if (brick.powerUp) {
      ctx.fillStyle = "black";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = brick.powerUp === "multiball" ? "+2" : brick.powerUp === "grenade" ? "GRENADE" : brick.powerUp === "extraLife" ? "1UP" : "TNT";
      ctx.fillText(label, brick.x + brick.width / 2, brick.y + brick.height / 2);
    }
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}
