export interface EducationProps {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

export class Education {
  private readonly props: Required<Omit<EducationProps, 'id' | 'fieldOfStudy' | 'endDate' | 'description'>> & 
                         Pick<EducationProps, 'id' | 'fieldOfStudy' | 'endDate' | 'description'>;

  constructor(props: EducationProps) {
    this.validate(props);
    this.props = {
      id: props.id,
      institution: props.institution.trim(),
      degree: props.degree.trim(),
      fieldOfStudy: props.fieldOfStudy?.trim(),
      startDate: props.startDate,
      endDate: props.endDate,
      description: props.description?.trim()
    };
  }

  private validate(props: EducationProps): void {
    if (!props.institution || props.institution.trim().length === 0) {
      throw new Error('Institution is required');
    }
    if (!props.degree || props.degree.trim().length === 0) {
      throw new Error('Degree is required');
    }
    if (!props.startDate) {
      throw new Error('Start date is required');
    }
    if (props.endDate && props.endDate < props.startDate) {
      throw new Error('End date cannot be before start date');
    }
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get institution(): string {
    return this.props.institution;
  }

  get degree(): string {
    return this.props.degree;
  }

  get fieldOfStudy(): string | undefined {
    return this.props.fieldOfStudy;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  toJSON() {
    return {
      id: this.props.id,
      institution: this.props.institution,
      degree: this.props.degree,
      fieldOfStudy: this.props.fieldOfStudy,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      description: this.props.description
    };
  }
}
