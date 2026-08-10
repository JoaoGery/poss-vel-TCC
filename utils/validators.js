export const sanitizeText = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim();
};

export const normalizeEmail = (value) => sanitizeText(value).toLowerCase();

export const parsePositiveNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

export const normalizeObjectIdList = (value) => {
  if (Array.isArray(value)) {
    return [...new Set(value.filter(Boolean).map(String))];
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [String(value)];
};

export const isValidEmail = (value) => {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidObjectId = (value) => {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
};

export const validateRequiredText = (value, label) => {
  const normalized = sanitizeText(value);

  if (!normalized) {
    return `${label} é obrigatório.`;
  }

  return null;
};
