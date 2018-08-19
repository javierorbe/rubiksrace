class Board {
  /**
   * Create a game board.
   *
   * @param {number[][]} table Array containing the initial state of each tile.
   * @param {number} eptX The x value of the empty tile.
   * @param {number} eptY The y value of the empty tile.
   */
  constructor(table, eptX, eptY) {
    this.table = table;
    this.eptX = eptX;
    this.eptY = eptY;
  }

  /**
   * Move a tile to the empty position and update the new empty position.
   *
   * @param {number} x The x value of the tile to move.
   * @param {number} y The y value of the tile to move.
   */
  move(x, y) {
    if (this.canMove(x, y)) {
      this.table[this.eptY][this.eptX] = this.table[y][x];
      this.table[y][x] = -1;
      this.eptX = x;
      this.eptY = y;
    }
  }

  /**
   * Test if a tile a can be moved.
   * If the empty position (table value = -1) is one of the four neighbor
   * positions, then it can be moved.
   *
   * @param {number} x The x value of the tile.
   * @param {number} y The y value of the tile.
   * @returns {boolean} True if the tile can be moved.
   */
  canMove(x, y) {
    if (y < 4 && this.table[y + 1][x] === -1) {
      return true;
    }

    if (x < 4 && this.table[y][x + 1] === -1) {
      return true;
    }

    if (y > 0 && this.table[y - 1][x] === -1) {
      return true;
    }

    if (x > 0 && this.table[y][x - 1] === -1) {
      return true;
    }

    return false;
  }
}

module.exports = Board;
