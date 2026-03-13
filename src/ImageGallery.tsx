import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useFocusTrap } from './utils/useFocusTrap';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  thumbnail?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  /** Number of columns (default: auto responsive) */
  columns?: 2 | 3 | 4 | 5;
  /** Initial open image index */
  defaultOpenIndex?: number;
  /** Whether to show captions below thumbnails */
  showCaptions?: boolean;
  /** Custom empty state */
  emptyState?: ReactNode;
  className?: string;
}

/* ─── ImageGallery ────────────────────────────────────────────────────── */

export function ImageGallery({
  images,
  columns = 3,
  showCaptions = false,
  emptyState,
  className = '',
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const colClass: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
  };

  if (images.length === 0) {
    return (
      <>{emptyState ?? <p className="text-sm text-[var(--ui-text-muted)]">No hay imágenes.</p>}</>
    );
  }

  return (
    <>
      <div
        role="list"
        aria-label="Galería de imágenes"
        className={`grid gap-2 ${colClass[columns]} ${className}`}
      >
        {images.map((img, i) => (
          <div key={img.id} role="listitem" className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setLightboxIndex(i)}
              aria-label={`Ver imagen: ${img.alt}`}
              className="group relative overflow-hidden rounded-lg bg-[var(--ui-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]"
            >
              <img
                src={img.thumbnail ?? img.src}
                alt={img.alt}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="text-white drop-shadow"
                >
                  <path
                    d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            {showCaptions && img.caption && (
              <p className="text-xs text-[var(--ui-text-muted)] text-center">{img.caption}</p>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

/* ─── Lightbox ────────────────────────────────────────────────────────── */

export interface LightboxProps {
  images: GalleryImage[];
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useFocusTrap(dialogRef, true);

  const goNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  const current = images[index];

  return (
    <div
      className="fixed inset-0 z-[var(--ui-z-modal,500)] flex items-center justify-center bg-black/90 p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-full max-w-5xl flex-col items-center outline-none"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar lightbox"
          className="absolute -right-2 -top-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M12 2L2 12M2 2l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Image */}
        <img
          src={current.src}
          alt={current.alt}
          id={titleId}
          className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
        />

        {/* Caption */}
        {current.caption && (
          <p className="mt-3 text-sm text-white/70">{current.caption}</p>
        )}

        {/* Counter */}
        <p className="mt-1 text-xs text-white/50 tabular-nums">
          {index + 1} / {images.length}
        </p>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Imagen anterior"
              className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Imagen siguiente"
              className="absolute right-0 top-1/2 translate-x-12 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
