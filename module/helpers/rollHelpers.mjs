/**
 * Determines if the roll was a critical (3 identical dice rolls)
 * @param {Object} roll roll object
 * @returns
 */
export function isCritical(roll) {
  if (!roll.terms) {
    return null;
  }
  // critical if all 3 dice results were the same
  // get only active die, the check that every active result's value is equal to the first one's
  return roll.terms
    .find((c) => (c.class = "Die"))
    .results.filter((c) => c.active)
    .every((c, i, a) => c.result == a?.[0]?.result);
}
