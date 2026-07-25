import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { IssueBadge } from './IssueBadge';

describe('IssueBadge', () => {
  it('applies the correct style for an error', () => {
    render(<IssueBadge severity="error" />);

    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('applies the correct style for a warning', () => {
    render(<IssueBadge severity="warning" />);

    expect(screen.getByText('warning')).toBeInTheDocument();
  });
});
