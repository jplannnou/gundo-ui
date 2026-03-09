import { useRef, useState, useCallback, useId, type DragEvent } from 'react';

interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FileUpload({
  onFiles,
  accept,
  multiple = false,
  maxSizeMB,
  disabled = false,
  className = '',
  children,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const validate = useCallback((files: File[]): File[] => {
    if (maxSizeMB) {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const oversized = files.filter(f => f.size > maxBytes);
      if (oversized.length > 0) {
        setError(`File exceeds ${maxSizeMB}MB limit`);
        return files.filter(f => f.size <= maxBytes);
      }
    }
    setError(null);
    return files;
  }, [maxSizeMB]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = validate(Array.from(fileList));
    if (files.length > 0) onFiles(files);
  }, [onFiles, validate]);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') setDragging(true);
    else if (e.type === 'dragleave') setDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={className}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${
          dragging
            ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)]'
            : 'border-[var(--ui-border)] hover:border-[var(--ui-border-hover)] bg-[var(--ui-surface-raised)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children ?? (
          <>
            <svg className="w-8 h-8 text-[var(--ui-text-muted)] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            <p className="text-sm text-[var(--ui-text-secondary)]">
              <span className="font-medium text-[var(--ui-primary)]">Click to upload</span> or drag and drop
            </p>
            {accept && (
              <p className="mt-1 text-xs text-[var(--ui-text-muted)]">{accept}</p>
            )}
            {maxSizeMB && (
              <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">Max {maxSizeMB}MB</p>
            )}
          </>
        )}
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={e => handleFiles(e.target.files)}
        className="hidden"
        aria-label="File upload"
      />
      {error && (
        <p className="mt-1.5 text-xs text-[var(--ui-error)]" role="alert">{error}</p>
      )}
    </div>
  );
}
