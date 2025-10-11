export class Phone {
  private readonly value: string;

  constructor(phone: string) {
    const cleaned = phone.trim();
    if (!this.isValid(cleaned)) {
      throw new Error('Invalid phone number format');
    }
    this.value = cleaned;
  }

  private isValid(phone: string): boolean {
    // Basic validation: allows + prefix, digits, spaces, hyphens, parentheses
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
