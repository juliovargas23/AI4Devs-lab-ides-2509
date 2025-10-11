export interface WorkExperienceProps {
  id?: string;
  company: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
}

export class WorkExperience {
  private readonly props: Required<Omit<WorkExperienceProps, 'id' | 'description' | 'endDate'>> & 
                         Pick<WorkExperienceProps, 'id' | 'description' | 'endDate'>;

  constructor(props: WorkExperienceProps) {
    this.validate(props);
    this.props = {
      id: props.id,
      company: props.company.trim(),
      position: props.position.trim(),
      description: props.description?.trim(),
      startDate: props.startDate,
      endDate: props.endDate
    };
  }

  private validate(props: WorkExperienceProps): void {
    if (!props.company || props.company.trim().length === 0) {
      throw new Error('Company is required');
    }
    if (!props.position || props.position.trim().length === 0) {
      throw new Error('Position is required');
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

  get company(): string {
    return this.props.company;
  }

  get position(): string {
    return this.props.position;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get isCurrentPosition(): boolean {
    return !this.props.endDate;
  }

  toJSON() {
    return {
      id: this.props.id,
      company: this.props.company,
      position: this.props.position,
      description: this.props.description,
      startDate: this.props.startDate,
      endDate: this.props.endDate
    };
  }
}
