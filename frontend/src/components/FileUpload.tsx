import React, { useRef, useState } from 'react';
import { MAX_FILE_SIZE, ALLOWED_FILE_EXTENSIONS } from '../config/constants';
import '../styles/FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, error }) => {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setUploadError('');

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return false;
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
      setUploadError(`Only ${ALLOWED_FILE_EXTENSIONS.join(', ')} files are allowed`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      setFileName('');
      onFileSelect(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setFileName(file.name);
      onFileSelect(file);
      
      // Update the file input
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    } else {
      setFileName('');
      onFileSelect(null);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFileName('');
    setUploadError('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayError = error || uploadError;

  return (
    <div className="file-upload">
      <label className="file-upload__label">
        Resume
      </label>

      <div
        className={`file-upload__dropzone ${isDragging ? 'file-upload__dropzone--dragging' : ''} ${displayError ? 'file-upload__dropzone--error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {fileName ? (
          <div className="file-upload__preview">
            <span className="file-upload__file-name">{fileName}</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="file-upload__remove-btn"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <p className="file-upload__text">
              Drag and drop your resume here, or
            </p>
            <button
              type="button"
              onClick={handleBrowseClick}
              className="file-upload__browse-btn"
            >
              Browse Files
            </button>
            <p className="file-upload__hint">
              Supported formats: PDF, DOC, DOCX (Max {MAX_FILE_SIZE / (1024 * 1024)}MB)
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={ALLOWED_FILE_EXTENSIONS.join(',')}
        className="file-upload__input"
      />

      {displayError && <span className="file-upload__error">{displayError}</span>}
    </div>
  );
};

export default FileUpload;
