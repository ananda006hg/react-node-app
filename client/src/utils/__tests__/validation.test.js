import { validateEmail, validatePhone, validateName, validateRequired } from '../validation';

describe('Validation Utilities', () => {
  // Email validation tests
  describe('validateEmail', () => {
    test('should return true for valid email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('name.lastname@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@domain.org')).toBe(true);
      expect(validateEmail('user.name@company-domain.com')).toBe(true);
    });
    
    test('should return false for invalid email formats', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('plaintext')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user@domain.')).toBe(false);
      expect(validateEmail('user@domain..com')).toBe(false);
    });
  });
  
  // Phone validation tests
  describe('validatePhone', () => {
    test('should return true for valid phone formats or empty strings', () => {
      // Empty is valid because phone is optional
      expect(validatePhone('')).toBe(true);
      
      // Common formats
      expect(validatePhone('123-456-7890')).toBe(true);
      expect(validatePhone('(123) 456-7890')).toBe(true);
      expect(validatePhone('123.456.7890')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+1-123-456-7890')).toBe(true);
    });
    
    test('should return false for invalid phone formats', () => {
      expect(validatePhone('123')).toBe(false); // Too short
      expect(validatePhone('abcdefghij')).toBe(false); // Not numbers
      expect(validatePhone('123-45-7890')).toBe(false); // Incorrect format
      expect(validatePhone('123-4567-890')).toBe(false); // Incorrect grouping
      expect(validatePhone('(123-456-7890')).toBe(false); // Unbalanced parentheses
    });
  });
  
  // Name validation tests
  describe('validateName', () => {
    test('should return true for valid names', () => {
      expect(validateName('John')).toBe(true);
      expect(validateName('Jane Doe')).toBe(true);
      expect(validateName('María Rodríguez')).toBe(true); // With accents
      expect(validateName('O\'Connor')).toBe(true); // With apostrophe
      expect(validateName('Smith-Johnson')).toBe(true); // With hyphen
    });
    
    test('should return false for invalid names', () => {
      expect(validateName('')).toBe(false); // Empty
      expect(validateName('   ')).toBe(false); // Only whitespace
      expect(validateName('123')).toBe(false); // Only numbers
      expect(validateName('John123')).toBe(false); // Mixed with numbers
      expect(validateName('@John')).toBe(false); // With special characters
    });
  });
  
  // Required field validation tests
  describe('validateRequired', () => {
    test('should return true for non-empty values', () => {
      expect(validateRequired('text')).toBe(true);
      expect(validateRequired(0)).toBe(true); // 0 is a valid value
      expect(validateRequired(false)).toBe(true); // false is a valid value
      expect(validateRequired([])).toBe(true); // Empty array is a valid value
      expect(validateRequired({})).toBe(true); // Empty object is a valid value
    });
    
    test('should return false for empty or undefined values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
      expect(validateRequired('   ')).toBe(false); // Only whitespace
    });
  });
});
