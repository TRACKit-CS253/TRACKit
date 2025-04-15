// Calculate mean
const calculateMean = (numbers) => {
    const total = numbers.reduce((acc, num) => acc + num, 0);
    return total / numbers.length;
  };
  
  // Calculate median
  const calculateMedian = (numbers) => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
  
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  };
  
  // Calculate maximum
    const calculateMax = (numbers) => {
        return Math.max(...numbers);
    };
  
  // Calculate standard deviation
  const calculateStandardDeviation = (numbers, mean) => {
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  };
  
  module.exports = {
    calculateMean,
    calculateMedian,
    calculateMax,
    calculateStandardDeviation
  };