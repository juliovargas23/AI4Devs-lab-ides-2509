import { formValidator } from '../../utils/formValidator';
import { CandidateFormData } from '../../types/candidate';

describe('FormValidator', () => {
  describe('validate', () => {
    it('should return no errors for valid data', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-1234',
        address: '123 Main St, City, State 12345',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toEqual([]);
    });

    it('should return error when firstName is missing', () => {
      const formData: CandidateFormData = {
        firstName: '',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'firstName',
        message: 'First name is required',
      });
    });

    it('should return error when lastName is missing', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: '',
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'lastName',
        message: 'Last name is required',
      });
    });

    it('should return error when email is invalid', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'email',
        message: 'Please enter a valid email address',
      });
    });

    it('should return error when firstName is too short', () => {
      const formData: CandidateFormData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'firstName',
        message: 'First name must be at least 2 characters',
      });
    });

    it('should return error when lastName is too short', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'D',
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'lastName',
        message: 'Last name must be at least 2 characters',
      });
    });

    it('should return error when firstName is too long', () => {
      const formData: CandidateFormData = {
        firstName: 'A'.repeat(101),
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'firstName',
        message: 'First name must not exceed 100 characters',
      });
    });

    it('should return error when lastName is too long', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'A'.repeat(101),
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'lastName',
        message: 'Last name must not exceed 100 characters',
      });
    });

    it('should return error when phone format is invalid', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: 'invalid-phone',
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'phone',
        message: 'Phone number format is invalid',
      });
    });

    it('should return error when address is too long', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        address: 'A'.repeat(501),
      };

      const errors = formValidator.validate(formData);
      expect(errors).toContainEqual({
        field: 'address',
        message: 'Address must not exceed 500 characters',
      });
    });

    it('should return multiple errors when multiple fields are invalid', () => {
      const formData: CandidateFormData = {
        firstName: '',
        lastName: '',
        email: 'invalid',
      };

      const errors = formValidator.validate(formData);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors.some((e) => e.field === 'firstName')).toBe(true);
      expect(errors.some((e) => e.field === 'lastName')).toBe(true);
      expect(errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should not validate phone when not provided', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors.some((e) => e.field === 'phone')).toBe(false);
    });

    it('should not validate address when not provided', () => {
      const formData: CandidateFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const errors = formValidator.validate(formData);
      expect(errors.some((e) => e.field === 'address')).toBe(false);
    });
  });
});
