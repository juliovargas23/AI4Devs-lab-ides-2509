import React from 'react';
import '../styles/FormField.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  rows = 3,
}) => {
  const inputId = `field-${name}`;

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-field__textarea ${error ? 'form-field__textarea--error' : ''}`}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`form-field__input ${error ? 'form-field__input--error' : ''}`}
          placeholder={placeholder}
        />
      )}
      
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
};

export default FormField;
