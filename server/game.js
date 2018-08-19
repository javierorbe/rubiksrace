const Board = require('./board');
const { randomNumberRange } = require('./util');

/**
 * Create a the main game board (5x5).
 * First, the empty position is choosen randomly.
 * Then, every other position is filled with one of the six colors,
 * but each one only appearing a maximum of 4 times.
 *
 * @returns {Object} Object containing the board (array) and the position of the empty tile.
 */
function generateBoardData() {
  const table = [[], [], [], [], []];

  const eptX = randomNumberRange(0, 4);
  const eptY = randomNumberRange(0, 4);
  table[eptY][eptX] = -1;

  const colorCount = [0, 0, 0, 0, 0, 0];

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (!(eptX === i && eptY === j)) {
        let colorId;

        do {
          colorId = randomNumberRange(0, 5);
        } while (colorCount[colorId] === 4);

        table[j][i] = colorId;
        colorCount[colorId] += 1;
      }
    }
  }

  return { table, eptX, eptY };
}

/**
 * Create a 3x3 color pattern.
 * Each position is set with a random color, but each one only appearing
 * appearing a maximum of 4 times.
 *
 * @returns {number[][]} The 3x3 pattern array.
 */
function generateGoal() {
  const pattern = [[], [], []];
  const colorCount = [0, 0, 0, 0, 0, 0];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let colorId;

      do {
        colorId = randomNumberRange(0, 5);
      } while (colorCount[colorId] === 4);

      pattern[j][i] = colorId;
      colorCount[colorId] += 1;
    }
  }

  return pattern;
}

class Game {
  /**
   * Create a game.
   *
   * @param {number} id1 ID of player 1.
   * @param {number} id2 ID of player 2.
   */
  constructor(id1, id2) {
    this.id1 = id1;
    this.id2 = id2;
    this.goal = generateGoal();

    const { table, eptX, eptY } = generateBoardData();
    // Deep copy of the board for each player
    this.board1 = new Board(table.map(arr => arr.slice()), eptX, eptY);
    this.board2 = new Board(table.map(arr => arr.slice()), eptX, eptY);
  }

  /**
   * Check if one of the boards has the winning pattern and return the winner.
   *
   * @returns {number} The ID of the winner, if there is one. -1 by default.
   */
  getWinner() {
    if (this.testBoard(this.board1.table)) {
      return this.id1;
    } else if (this.testBoard(this.board2.table)) {
      return this.id2;
    }

    return -1;
  }

  /**
   * Test if the values on the center of the board match with the winning pattern.
   *
   * @param {number[][]} table Array with the values of the board.
   * @returns {boolean} True if all the values match the pattern.
   */
  testBoard(table) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // i, j: +1 because the pattern is in the center of the board
        if (table[j + 1][i + 1] !== this.goal[j][i]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Move the tile (x, y) of one of the players.
   *
   * @param {number} id The ID of the player that makes the move.
   * @param {number} x The x value on the board.
   * @param {number} y The y value on the board.
   */
  move(id, x, y) {
    if (id === this.id1) {
      this.board1.move(x, y);
    } else {
      this.board2.move(x, y);
    }
  }

  /**
   * Return an object with the data to initialize the game.
   *
   * @returns {Object} Data to start the game.
   */
  getInitData() {
    return {
      table: this.board1.table,
      goal: this.goal,
      eptX: this.board1.eptX,
      eptY: this.board1.eptY
    };
  }
}

module.exports = Game;
