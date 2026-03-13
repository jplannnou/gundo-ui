import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { VideoPlayer } from '../VideoPlayer';

// jsdom doesn't implement HTMLMediaElement.play/pause
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(),
  });
});

describe('VideoPlayer', () => {
  it('renders video element with src', () => {
    render(<VideoPlayer src="video.mp4" />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'video.mp4');
  });

  it('renders with native controls when nativeControls=true', () => {
    render(<VideoPlayer src="video.mp4" nativeControls />);
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('controls');
  });

  it('shows play button when not playing', () => {
    render(<VideoPlayer src="video.mp4" />);
    expect(screen.getAllByLabelText('Reproducir')).toHaveLength(2);
  });

  it('renders region with aria-label', () => {
    render(<VideoPlayer src="video.mp4" title="Mi video" />);
    expect(screen.getByRole('region', { name: 'Mi video' })).toBeInTheDocument();
  });

  it('shows default region label when no title', () => {
    render(<VideoPlayer src="video.mp4" />);
    expect(screen.getByRole('region', { name: 'Reproductor de video' })).toBeInTheDocument();
  });

  it('renders poster attribute', () => {
    render(<VideoPlayer src="video.mp4" poster="thumb.jpg" />);
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('poster', 'thumb.jpg');
  });

  it('calls onReady with video element', () => {
    const onReady = vi.fn();
    render(<VideoPlayer src="video.mp4" onReady={onReady} />);
    expect(onReady).toHaveBeenCalledOnce();
    expect(onReady.mock.calls[0][0]).toBeInstanceOf(HTMLVideoElement);
  });

  it('renders caption when provided', () => {
    render(<VideoPlayer src="video.mp4" caption="Capítulo 1" />);
    expect(screen.getByText('Capítulo 1')).toBeInTheDocument();
  });
});
