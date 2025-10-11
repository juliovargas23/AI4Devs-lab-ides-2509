import { VALIDATION_RULES } from '../config/constants';
import { CandidateFormData, ValidationError } from '../types/candidate';

export class FormValidator {
  private errors: ValidationError[] = [];

  validate(formData: CandidateFormData): ValidationError[] {
    this.errors = [];

    this.validateFirstName(formData.firstName);
    this.validateLastName(formData.lastName);
    this.validateEmail(formData.email);
    
    if (formData.phone) {
      this.validatePhone(formData.phone);
    }
    
    if (formData.address) {
      this.validateAddress(formData.address);
    }

    return this.errors;
  }

  private validateFirstName(firstName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      this.addError('firstName', 'First name is required');
      return;
    }

    if (firstName.length < VALIDATION_RULES.firstName.minLength) {
      this.addError('firstName', `First name must be at least ${VALIDATION_RULES.firstName.minLength} characters`);
    }

    if (firstName.length > VALIDATION_RULES.firstName.maxLength) {
      this.addError('firstName', `First name must not exceed ${VALIDATION_RULES.firstName.maxLength} characters`);
    }
  }

  private validateLastName(lastName: string): void {
    if (!lastName || lastName.trim().length === 0) {
      this.addError('lastName', 'Last name is required');
      return;
    }

    if (lastName.length < VALIDATION_RULES.lastName.minLength) {
      this.addError('lastName', `Last name must be at least ${VALIDATION_RULES.lastName.minLength} characters`);
    }

    if (lastName.length > VALIDATION_RULES.lastName.maxLength) {
      this.addError('lastName', `Last name must not exceed ${VALIDATION_RULES.lastName.maxLength} characters`);
    }
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      this.addError('email', 'Email is required');
      return;
    }

    if (!VALIDATION_RULES.email.pattern.test(email)) {
      this.addError('email', 'Please enter a valid email address');
    }
  }

  private validatePhone(phone: string): void {
    if (!VALIDATION_RULES.phone.pattern.test(phone)) {
      this.addError('phone', 'Phone number format is invalid');
    }
  }

  private validateAddress(address: string): void {
    if (address.length > VALIDATION_RULES.address.maxLength) {
      this.addError('address', `Address must not exceed ${VALIDATION_RULES.address.maxLength} characters`);
    }
  }

  private addError(field: string, message: string): void {
    this.errors.push({ field, message });
  }
}

export const formValidator = new FormValidator();
