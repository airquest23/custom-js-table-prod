function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function arrayAddOrRemove(array, value) {
  let index = array.indexOf(value);
  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  };
};

/**
 * Moves an element one position up in the array (towards index 0).
 * @param {Array} arr - The array to modify.
 * @param {number} index - The current index of the element to move up.
 * @returns {Array} The modified array (same reference).
 */
function arrayMoveUp(arr, index) {
  // Validate input
  if (!Array.isArray(arr)) {
    throw new TypeError("First argument must be an array.");
  };

  if (typeof index !== "number" || index < 0 || index >= arr.length) {
    throw new RangeError("Invalid index.");
  };

  // Can't move up if already at the top
  if (index === 0) {
    return arr;
  };

  // Swap with the previous element
  [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
  return arr;
};

/**
 * Moves an element one position down in the array (towards the end).
 * @param {Array} arr - The array to modify.
 * @param {number} index - The current index of the element to move down.
 * @returns {Array} The modified array (same reference).
 */
function arrayMoveDown(arr, index) {
  // Validate input
  if (!Array.isArray(arr)) {
    throw new TypeError("First argument must be an array.");
  };

  if (typeof index !== "number" || index < 0 || index >= arr.length) {
    throw new RangeError("Invalid index.");
  };

  // Can't move down if already at the bottom
  if (index === arr.length - 1) {
    return arr;
  };

  // Swap with the next element
  [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
  return arr;
};

/**
* Rounds an array of proportions so the sum is exactly 100.
* @param {number[]} values - Array of numbers (proportions, not necessarily summing to 1).
* @returns {number[]} - Array of integers summing to 100.
*/
function roundPercentages(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Input must be a non-empty array of numbers.");
  };

  if (values.some(v => typeof v !== "number" || isNaN(v) || v < 0)) {
    throw new Error("All values must be non-negative numbers.");
  };

  const total = values.reduce((sum, v) => sum + v, 0);

  if (total === 0) {
    return values.map(() => 0);
  };

  // Step 1: Calculate exact percentages
  const exact = values.map(v => (v / total) * 100);

  // Step 2: Take the floor of each percentage
  const floored = exact.map(Math.floor);

  // Step 3: Calculate how many percentage points are left to distribute
  let remainder = 100 - floored.reduce((sum, v) => sum + v, 0);

  // Step 4: Sort indices by largest fractional remainder
  const remainders = exact.map((val, idx) => ({
      idx,
      frac: val - floored[idx]
  })).sort((a, b) => b.frac - a.frac);

  // Step 5: Distribute remaining points
  for (let i = 0; i < remainder; i++) {
    floored[remainders[i].idx] += 1;
  };

  return floored;
};