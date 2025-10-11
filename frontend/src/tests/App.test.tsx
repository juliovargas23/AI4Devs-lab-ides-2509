import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders add candidate form', () => {
  render(<App />);
  const headingElement = screen.getByText(/Add New Candidate/i);
  expect(headingElement).toBeInTheDocument();
});
