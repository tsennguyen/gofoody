export const formatVnCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0đ';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value) + 'đ';
};

export const calcDiscountPercent = (price: number, listPrice?: number | null): number => {
  if (!listPrice || listPrice <= 0) return 0;
  const percent = Math.round((1 - price / listPrice) * 100);
  return percent > 0 ? percent : 0;
};
