import { render, screen } from '@testing-library/react';
import App from './App';

test('renders entry portal options', () => {
  render(<App />);
  const textElement = screen.getByText(/LEARN WEALTH/i);
  expect(textElement).toBeInTheDocument();
});
