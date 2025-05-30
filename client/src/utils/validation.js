/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if the email is valid, false otherwise
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  // Regular expression for email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number format (optional field)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if the phone is valid or empty, false otherwise
 */
export const validatePhone = (phone) => {
  // If empty, return true as phone is optional
  if (!phone) return true;
  
  // Regular expression for common phone formats
  const phoneRegex = /^(\+\d{1,3}[-\s]?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a name (allows letters, spaces, hyphens, and apostrophes)
 * @param {string} name - The name to validate
 * @returns {boolean} - True if the name is valid, false otherwise
 */
export const validateName = (name) => {
  if (!name || !name.trim()) return false;
  
  // Regular expression for name validation
  // Allows letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\u00C0-\u024F\s'-]+$/;
  return nameRegex.test(name);
};

/**
 * Validates if a value is not empty (required field validation)
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is not empty, false otherwise
 */
export const validateRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};
