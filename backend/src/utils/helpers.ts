import crypto from 'crypto';

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const generateOrderNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SZ-${dateStr}-${randomSuffix}`;
};

export const generateSKU = (brand: string, category: string): string => {
  const b = brand.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SPZ');
  const c = category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'CAT');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${b}-${c}-${num}`;
};

export const roundPrice = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

