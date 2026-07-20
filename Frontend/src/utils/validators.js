// Email validator
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validator
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Required field validator
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Phone number validator
export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]{10,}$/;
  return re.test(phone);
};

// Name validator
export const validateName = (name) => {
  return name && name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
};