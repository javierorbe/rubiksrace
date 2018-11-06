{
  /**
   * Map the tile type IDs to their respective color codes.
   *
   * @param {number} colorId Color id of the tile.
   * @return {string} Hex color code.
   */
  function getColorById(colorId) {
    switch (colorId) {
      case -1:
        return '#212121'; // semi-black
      case 0:
        return '#FFFFFF'; // white
      case 1:
        return '#FFEB3B'; // yellow
      case 2:
        return '#E53935'; // red
      case 3:
        return '#FFA726'; // orange
      case 4:
        return '#009E60'; // green
      case 5:
        return '#29B6F6'; // blue
      default:
        return '#000000';
    }
  }

  /**
   * Map the tile type IDs to their respective color codes.
   *
   * @param {number} colorId Color id of the tile.
   * @return {string} Hex color code.
   */
  function getDarkColorById(colorId) {
    switch (colorId) {
      case -1:
        return '#424242'; // semi-black
      case 0:
        return '#BDBDBD'; // white
      case 1:
        return '#FBC02D'; // yellow
      case 2:
        return '#B71C1C'; // red
      case 3:
        return '#E65100'; // orange
      case 4:
        return '#1B5E20'; // green
      case 5:
        return '#01579B'; // blue
      default:
        return '#000000';
    }
  }

  const TILE_SIDE = 64;

  class Board {
    /**
     * Create a game board.
     *
     * @param {number[5][5]} table Array containing the initial state of each tile.
     * @param {number} eptX The x value of the empty tile.
     * @param {number} eptY The y value of the empty tile.
     * @param {number[3][3]} goal Goal pattern.
     */
    constructor(table, eptX, eptY, goal) {
      this.table = table;
      this.eptX = eptX;
      this.eptY = eptY;
      this.goal = goal;
    }

    /**
     * Draw the board to the canvas.
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context to render to.
     */
    draw(ctx) {
      ctx.lineWidth = 4;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, TILE_SIDE * 5, TILE_SIDE * 5);

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          // Don't draw if the position is the empty one.
          if (i === this.eptX && j === this.eptY) {
            continue;
          }

          // Tile inner color
          ctx.fillStyle = getColorById(this.table[j][i]);
          ctx.fillRect(
            (i * TILE_SIDE) + 4,
            (j * TILE_SIDE) + 4,
            TILE_SIDE - 8,
            TILE_SIDE - 8
          );

          ctx.strokeStyle = getDarkColorById(this.table[j][i]);
          // Tile border
          ctx.strokeRect(
            (i * TILE_SIDE) + 4,
            (j * TILE_SIDE) + 4,
            TILE_SIDE - 8,
            TILE_SIDE - 8
          );
        }
      }
    }

    /**
     * Test if the tile at (x, y) can be moved.
     * If the empty position (table value = -1) is one of the four neighbor
     * positions, then it can be moved.
     *
     * @param {number} x The x value of the tile.
     * @param {number} y The y value of the tile.
     * @returns {boolean} True if the tile at (x, y) can be moved.
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

    /**
     * Move the tile at (x, y) position to the empty position,
     * and set the new empty position.
     * Emit the action through the socket.
     *
     * @param {Socket} socket Socket.IO connection.
     * @param {number} x The x value of the tile.
     * @param {number} y The y value of the tile.
     */
    move(socket, x, y) {
      socket.emit('move_tile', { x, y });

      this.table[this.eptY][this.eptX] = this.table[y][x];
      this.table[y][x] = -1;
      this.eptX = x;
      this.eptY = y;

      if (this.testWin()) {
        socket.emit('test_win');
      }
    }

    /**
     * Test if the clicked tile can be moved and move it.
     *
     * @param {Socket} socket Socket.IO connection.
     * @param {number} x X value of the clicked tile.
     * @param {number} y Y value of the clicked tile.
     */
    click(socket, x, y) {
      const gridX = Math.floor(x / 64);
      const gridY = Math.floor(y / 64);

      if (gridX < 5 && gridY < 5) {
        if (this.canMove(gridX, gridY)) {
          this.move(socket, gridX, gridY);
        }
      }
    }

    /**
     * Test if the center of the table matches the goal pattern.
     *
     * @returns {boolean} True if the pattern matches.
     */
    testWin() {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // +1 because the pattern is in the center of the board
          if (this.table[j + 1][i + 1] !== this.goal[j][i]) {
            return false;
          }
        }
      }

      return true;
    }

    /**
     * Draw the goal pattern to the canvas.
     *
     * @param {CanvasRenderingContext2D} ctx Canvas context to render to.
     * @param {number[3][3]} goal Goal pattern.
     */
    static drawGoal(ctx, goal) {
      ctx.lineWidth = 4;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, TILE_SIDE * 5, TILE_SIDE * 5);

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Tile inner color
          ctx.fillStyle = getColorById(goal[j][i]);
          ctx.fillRect(
            (i * TILE_SIDE) + 4 + TILE_SIDE,
            (j * TILE_SIDE) + 4 + TILE_SIDE,
            TILE_SIDE - 8,
            TILE_SIDE - 8
          );

          // Tile border
          ctx.strokeStyle = getDarkColorById(goal[j][i]);
          ctx.strokeRect(
            (i * TILE_SIDE) + 4 + TILE_SIDE,
            (j * TILE_SIDE) + 4 + TILE_SIDE,
            TILE_SIDE - 8,
            TILE_SIDE - 8
          );
        }
      }
    }
  }

  window.Board = Board;
}
