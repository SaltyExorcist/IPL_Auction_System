/**
 * Calculate the next bid increment based on current bid amount
 * Follows IPL-style dynamic increments
 */
export const getBidIncrement = (currentBid: number): number => {
  if (currentBid < 200) {
    return 10; // 100L-200L → +10L
  } else if (currentBid < 500) {
    return 20; // 200L-500L → +20L
  } else {
    return 25; // 500L+ → +25L
  }
};

/**
 * Calculate the next valid bid amount
 */
export const getNextBid = (currentBid: number): number => {
  const increment = getBidIncrement(currentBid);
  return currentBid + increment;
};