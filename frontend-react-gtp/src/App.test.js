import { render, screen } from '@testing-library/react';
import App from './App';

test('affiche le titre Gestion des Employés', () => {
  render(<App />);
  const titleElement = screen.getByText(/Gestion des Employés/i);
  expect(titleElement).toBeInTheDocument();
});
