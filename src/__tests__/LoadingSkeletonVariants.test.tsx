import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  ProductCardSkeleton,
  MealCardSkeleton,
  ResultRowSkeleton,
  ListItemSkeleton,
  LoadingSkeletonList,
  LoadingSkeleton,
} from '../LoadingSkeletonVariants';

describe('LoadingSkeletonVariants', () => {
  it('renders ProductCardSkeleton', () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders MealCardSkeleton', () => {
    const { container } = render(<MealCardSkeleton />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders ResultRowSkeleton', () => {
    const { container } = render(<ResultRowSkeleton />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders ListItemSkeleton', () => {
    const { container } = render(<ListItemSkeleton />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('LoadingSkeletonList renders count of variant', () => {
    const { container } = render(<LoadingSkeletonList variant="ListItem" count={4} />);
    expect(container.querySelectorAll('[aria-busy="true"]').length).toBe(4);
  });

  it('LoadingSkeleton namespace exports', () => {
    expect(typeof LoadingSkeleton.ProductCard).toBe('function');
    expect(typeof LoadingSkeleton.List).toBe('function');
  });
});
