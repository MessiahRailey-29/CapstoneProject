export const formatCurrency = (num: number) => {
  if (num < 1000) return num.toString();

  const units = ["", "k", "M", "B", "T", "Q", "Qu", "S", "Sp", "O"];
  let unitIndex = 0;

  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }

  return `${num.toFixed(3)}${units[unitIndex]}`;
};