/**
 * Converts meters to feet and inches, rounding inches and ignoring fractional display.
 * @param {string | number} input - The length in meters.
 * @returns {string} - Formatted string in feet and inches (e.g., "3' 4\"")
 */
export const getMeterToFeetInchesWithoutFraction = (input) => {
  if (input == null || isNaN(parseFloat(input))) return '0';

  const meters = parseFloat(input);
  const totalFeet = meters * 3.28084;
  let feet = Math.floor(totalFeet);
  let inches = Math.round((totalFeet - feet) * 12);

  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  return `${feet}' ${inches}"`;
};
