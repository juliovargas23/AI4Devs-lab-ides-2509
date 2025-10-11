import { Email } from '../value-objects/Email';
import { Phone } from '../value-objects/Phone';
import { Education, EducationProps } from '../value-objects/Education';
import { WorkExperience, WorkExperienceProps } from '../value-objects/WorkExperience';
import { Resume, ResumeProps } from '../value-objects/Resume';

export interface CandidateProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations?: EducationProps[];
  workExperiences?: WorkExperienceProps[];
  resume?: ResumeProps;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Candidate {
  private readonly _id?: string;
  private _firstName: string;
  private _lastName: string;
  private _email: Email;
  private _phone?: Phone;
  private _address?: string;
  private _educations: Education[];
  private _workExperiences: WorkExperience[];
  private _resume?: Resume;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: CandidateProps) {
    this.validate(props);

    this._id = props.id;
    this._firstName = props.firstName.trim();
    this._lastName = props.lastName.trim();
    this._email = new Email(props.email);
    this._phone = props.phone ? new Phone(props.phone) : undefined;
    this._address = props.address?.trim();
    this._educations = props.educations?.map(edu => new Education(edu)) || [];
    this._workExperiences = props.workExperiences?.map(exp => new WorkExperience(exp)) || [];
    this._resume = props.resume ? new Resume(props.resume) : undefined;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  private validate(props: CandidateProps): void {
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (props.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    if (props.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }
    if (!props.email || props.email.trim().length === 0) {
      throw new Error('Email is required');
    }
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get email(): Email {
    return this._email;
  }

  get phone(): Phone | undefined {
    return this._phone;
  }

  get address(): string | undefined {
    return this._address;
  }

  get educations(): Education[] {
    return [...this._educations];
  }

  get workExperiences(): WorkExperience[] {
    return [...this._workExperiences];
  }

  get resume(): Resume | undefined {
    return this._resume;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business logic methods
  updatePersonalInfo(firstName: string, lastName: string, phone?: string, address?: string): void {
    if (firstName && firstName.trim().length >= 2) {
      this._firstName = firstName.trim();
    }
    if (lastName && lastName.trim().length >= 2) {
      this._lastName = lastName.trim();
    }
    if (phone) {
      this._phone = new Phone(phone);
    }
    this._address = address?.trim();
    this._updatedAt = new Date();
  }

  updateEmail(email: string): void {
    this._email = new Email(email);
    this._updatedAt = new Date();
  }

  addEducation(education: EducationProps): void {
    this._educations.push(new Education(education));
    this._updatedAt = new Date();
  }

  removeEducation(educationId: string): void {
    this._educations = this._educations.filter(edu => edu.id !== educationId);
    this._updatedAt = new Date();
  }

  addWorkExperience(experience: WorkExperienceProps): void {
    this._workExperiences.push(new WorkExperience(experience));
    this._updatedAt = new Date();
  }

  removeWorkExperience(experienceId: string): void {
    this._workExperiences = this._workExperiences.filter(exp => exp.id !== experienceId);
    this._updatedAt = new Date();
  }

  attachResume(resume: ResumeProps): void {
    this._resume = new Resume(resume);
    this._updatedAt = new Date();
  }

  removeResume(): void {
    this._resume = undefined;
    this._updatedAt = new Date();
  }

  hasResume(): boolean {
    return this._resume !== undefined;
  }

  // Serialization
  toJSON() {
    return {
      id: this._id,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      email: this._email.getValue(),
      phone: this._phone?.getValue(),
      address: this._address,
      educations: this._educations.map(edu => edu.toJSON()),
      workExperiences: this._workExperiences.map(exp => exp.toJSON()),
      resume: this._resume?.toJSON(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}
