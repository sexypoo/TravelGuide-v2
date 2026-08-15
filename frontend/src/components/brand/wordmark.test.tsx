import { render, screen } from '@testing-library/react';
import { Wordmark } from './wordmark';

describe('Wordmark', () => {
  it('uses the 여JJU display brand and accessible home label', () => {
    render(<Wordmark />);

    const homeLink = screen.getByRole('link', { name: '여쭈어 홈' });
    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink).toHaveTextContent('여JJU');
    expect(homeLink).not.toHaveTextContent('TravelGuide');
    expect(homeLink.querySelector('.wordmark__mark svg')).toBeInTheDocument();
    expect(homeLink.querySelector('.wordmark__mark')).not.toHaveTextContent('Y');
  });
});
