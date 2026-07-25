import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreCard } from './ScoreCard';

describe('ScoreCard', () => {
  it('shows the correct status text for a high score', () => {
    render(<ScoreCard label="SEO Score" score={95} />);

    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('shows the correct status text for a lower score', () => {
    render(<ScoreCard label="Accessibility Score" score={40} />);

    expect(screen.getByText('Poor')).toBeInTheDocument();
  });
});
