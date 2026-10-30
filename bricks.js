// ============================================================
// bricks.js: where the bricks are, and how they are drawn
// ============================================================

const BRICK_COLUMNS = 8;
const BRICK_ROWS = 4;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 6;     // empty space between bricks
const BRICKS_TOP = 50;   // how far down the first row starts

class Brick {
  constructor(position) {
    Object.assign(this, position);
    this.powerUp = null;
  }
}

class PowerUpBrick extends Brick {
  constructor(position, powerUp) {
    super(position);
    this.powerUp = powerUp;
  }
}

class BrickCreator {
  buildBricks(level = 1) {
    const list = [];
    const rows = Math.min(BRICK_ROWS + Math.floor((level - 1) / 2), 8);

    // Center the whole block of bricks on the screen.
    const totalWidth = BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP;
    const left = (WIDTH - totalWidth) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < BRICK_COLUMNS; col++) {
        const position = {
          x: left + col * (BRICK_WIDTH + BRICK_GAP),
          y: BRICKS_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          row,
          col
        };
        list.push(this.createBrick(position, level, list.length));
      }
    }

    return list;
  }

  createBrick() {
    throw new Error("BrickCreator subclasses must implement createBrick()");
  }
}

class LevelBrickCreator extends BrickCreator {
  createBrick(position, level, index) {
    let powerUp = null;
    if (level === 6 && position.row === 2) {
      powerUp = "1up";
    } else if (index === 10) {
      powerUp = "multiball";
    } else if (index === 21) {
      powerUp = "tnt";
    } else if (index === 5 && level % 2 === 0) {
      powerUp = "1up";
    } else if (index === 26 && level === 3) {
      powerUp = "grenade";
    }

    return powerUp ? new PowerUpBrick(position, powerUp) : new Brick(position);
  }
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
      const label = brick.powerUp === "multiball" ? "+2" : brick.powerUp === "grenade" ? "GRENADE" : brick.powerUp === "1up" ? "1UP" : "TNT";
      ctx.fillText(label, brick.x + brick.width / 2, brick.y + brick.height / 2);
    }
  }
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}
