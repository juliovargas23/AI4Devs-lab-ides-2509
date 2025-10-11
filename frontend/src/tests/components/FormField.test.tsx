import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormField from '../../components/FormField';

describe('FormField Component', () => {
  it('should render a text input by default', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="First Name"
        name="firstName"
        value=""
        onChange={handleChange}
      />
    );

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render a textarea when type is textarea', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="Address"
        name="address"
        type="textarea"
        value=""
        onChange={handleChange}
      />
    );

    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render an email input when type is email', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should display required indicator when required is true', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="First Name"
        name="firstName"
        value=""
        onChange={handleChange}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not display required indicator when required is false', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="Phone"
        name="phone"
        value=""
        onChange={handleChange}
        required={false}
      />
    );

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should display error message when error prop is provided', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={handleChange}
        error="Please enter a valid email"
      />
    );

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="First Name"
        name="firstName"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('First Name');
    fireEvent.change(input, { target: { value: 'John' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should display placeholder text', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="First Name"
        name="firstName"
        value=""
        onChange={handleChange}
        placeholder="Enter your first name"
      />
    );

    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
  });

  it('should render with the provided value', () => {
    const handleChange = jest.fn();
    render(
      <FormField
        label="First Name"
        name="firstName"
        value="John"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('First Name') as HTMLInputElement;
    expect(input.value).toBe('John');
  });

  it('should apply error class when error is present', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={handleChange}
        error="Invalid email"
      />
    );

    const input = container.querySelector('.form-field__input--error');
    expect(input).toBeInTheDocument();
  });
});
