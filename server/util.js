/**
 * Generate a random integer within a range.
 *
 * @param {number} min Minimum value of the random number.
 * @param {number} max Maximum value of the random number.
 * @returns {number} A random integer within the range.
 */
function randomNumberRange(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

module.exports = { randomNumberRange };
