import { Email } from '../../domain/value-objects/Email';

describe('Email Value Object', () => {
  describe('Valid emails', () => {
    it('should create email with valid format', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should convert email to lowercase', () => {
      const email = new Email('Test@Example.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = new Email('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });
  });

  describe('Invalid emails', () => {
    it('should throw error for email without @', () => {
      expect(() => new Email('invalidemail.com')).toThrow('Invalid email address');
    });

    it('should throw error for email without domain', () => {
      expect(() => new Email('test@')).toThrow('Invalid email address');
    });

    it('should throw error for email without local part', () => {
      expect(() => new Email('@example.com')).toThrow('Invalid email address');
    });

    it('should throw error for empty email', () => {
      expect(() => new Email('')).toThrow('Invalid email address');
    });
  });

  describe('Equality', () => {
    it('should return true for same email', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
