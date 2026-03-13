import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageGallery, Lightbox, type GalleryImage } from '../ImageGallery';

const images: GalleryImage[] = [
  { id: '1', src: 'img1.jpg', alt: 'Imagen 1', caption: 'Pie de foto 1' },
  { id: '2', src: 'img2.jpg', alt: 'Imagen 2' },
  { id: '3', src: 'img3.jpg', alt: 'Imagen 3' },
];

describe('ImageGallery', () => {
  it('renders all image thumbnails', () => {
    render(<ImageGallery images={images} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('shows empty state when no images', () => {
    render(<ImageGallery images={[]} />);
    expect(screen.getByText('No hay imágenes.')).toBeInTheDocument();
  });

  it('renders custom empty state', () => {
    render(<ImageGallery images={[]} emptyState={<p>Vacío</p>} />);
    expect(screen.getByText('Vacío')).toBeInTheDocument();
  });

  it('shows captions when showCaptions=true', () => {
    render(<ImageGallery images={images} showCaptions />);
    expect(screen.getByText('Pie de foto 1')).toBeInTheDocument();
  });

  it('opens lightbox when thumbnail is clicked', () => {
    render(<ImageGallery images={images} />);
    fireEvent.click(screen.getByLabelText('Ver imagen: Imagen 1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes lightbox on Escape key', () => {
    render(<ImageGallery images={images} />);
    fireEvent.click(screen.getByLabelText('Ver imagen: Imagen 1'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Lightbox', () => {
  it('renders current image', () => {
    render(<Lightbox images={images} initialIndex={0} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByAltText('Imagen 1')).toBeInTheDocument();
  });

  it('shows navigation buttons when multiple images', () => {
    render(<Lightbox images={images} onClose={() => {}} />);
    expect(screen.getByLabelText('Imagen siguiente')).toBeInTheDocument();
    expect(screen.getByLabelText('Imagen anterior')).toBeInTheDocument();
  });

  it('hides navigation when single image', () => {
    render(<Lightbox images={[images[0]]} onClose={() => {}} />);
    expect(screen.queryByLabelText('Imagen siguiente')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Lightbox images={images} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar lightbox'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('navigates to next image with ArrowRight', () => {
    render(<Lightbox images={images} initialIndex={0} onClose={() => {}} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Imagen 2')).toBeInTheDocument();
  });

  it('navigates to previous image with ArrowLeft', () => {
    render(<Lightbox images={images} initialIndex={1} onClose={() => {}} />);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('Imagen 1')).toBeInTheDocument();
  });

  it('shows image counter', () => {
    render(<Lightbox images={images} initialIndex={0} onClose={() => {}} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('has aria-modal attribute', () => {
    render(<Lightbox images={images} onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
