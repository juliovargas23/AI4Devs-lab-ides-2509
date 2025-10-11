export interface ResumeProps {
  id?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export class Resume {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  private readonly props: Required<ResumeProps>;

  constructor(props: ResumeProps) {
    this.validate(props);
    this.props = {
      id: props.id || '',
      fileName: props.fileName.trim(),
      filePath: props.filePath,
      fileSize: props.fileSize,
      mimeType: props.mimeType
    };
  }

  private validate(props: ResumeProps): void {
    if (!props.fileName || props.fileName.trim().length === 0) {
      throw new Error('File name is required');
    }
    if (!props.filePath || props.filePath.trim().length === 0) {
      throw new Error('File path is required');
    }
    if (props.fileSize <= 0) {
      throw new Error('File size must be greater than 0');
    }
    if (props.fileSize > Resume.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${Resume.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    if (!Resume.ALLOWED_MIME_TYPES.includes(props.mimeType)) {
      throw new Error('Invalid file type. Only PDF and Word documents are allowed');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get filePath(): string {
    return this.props.filePath;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get fileSizeInMB(): number {
    return this.props.fileSize / 1024 / 1024;
  }

  toJSON() {
    return {
      id: this.props.id,
      fileName: this.props.fileName,
      filePath: this.props.filePath,
      fileSize: this.props.fileSize,
      mimeType: this.props.mimeType
    };
  }
}
