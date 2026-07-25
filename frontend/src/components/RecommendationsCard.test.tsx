import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecommendationsCard } from './RecommendationsCard';

describe('RecommendationsCard', () => {
  it('renders recommendations', () => {
    render(
      <RecommendationsCard
        recommendations={[
          {
            id: 'title:missing',
            priority: 'high',
            title: 'Add a page title',
            description: 'A clear title helps search engines understand your page.',
            action: 'Add a descriptive title tag.',
          },
        ]}
      />
    );

    expect(screen.getByText('Add a page title')).toBeInTheDocument();
    expect(screen.getByText(/high priority/i)).toBeInTheDocument();
  });

  it('renders the empty state', () => {
    render(<RecommendationsCard recommendations={[]} />);

    expect(screen.getByText(/no recommendations/i)).toBeInTheDocument();
  });
});
