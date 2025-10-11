export class Email {
  private readonly value: string;

  constructor(email: string) {
    const cleaned = email.trim().toLowerCase();
    if (!this.isValid(cleaned)) {
      throw new Error('Invalid email address');
    }
    this.value = cleaned;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
