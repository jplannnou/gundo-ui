'use client';
import './ui-classes.css';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { Check, X } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface InlineEditProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** Placeholder shown when value is empty */
  placeholder?: string;
  /** Validate the value — return error string or null */
  validate?: (value: string) => string | null;
  /** Whether to save on blur (default: true) */
  saveOnBlur?: boolean;
  disabled?: boolean;
  /** Element type used in display mode */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  inputClassName?: string;
}

/* ─── InlineEdit ──────────────────────────────────────────────────────── */

export function InlineEdit({
  value,
  onChange,
  placeholder = 'Haz clic para editar…',
  validate,
  saveOnBlur = true,
  disabled = false,
  as: Tag = 'span',
  className = '',
  inputClassName = '',
  ...props
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = useCallback(() => {
    if (disabled) return;
    setDraft(value);
    setError(null);
    setEditing(true);
  }, [disabled, value]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (validate) {
      const err = validate(trimmed);
      if (err) {
        setError(err);
        inputRef.current?.focus();
        return;
      }
    }
    setError(null);
    setEditing(false);
    if (trimmed !== value) onChange(trimmed);
  }, [draft, value, validate, onChange]);

  const cancel = useCallback(() => {
    setDraft(value);
    setError(null);
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') cancel();
    },
    [commit, cancel],
  );

  if (!editing) {
    return (
      <Tag
        role="button"
        tabIndex={disabled ? undefined : 0}
        aria-label={`Editar: ${value || placeholder}`}
        aria-disabled={disabled}
        onClick={startEdit}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEdit(); }
        }}
        className={`cursor-pointer rounded outline-none transition-colors ${
          disabled
            ? 'cursor-default opacity-60'
            : 'gu-h-bg-surface-hover focus-visible:ring-2 gu-fv-ring-primary'
        } ${!value ? 'italic gu-text-text-muted' : ''} ${className}`}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {value || placeholder}
        {!disabled && (
          <svg
            className="ml-1 inline-block h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 [span:hover_&]:opacity-50"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path d="M9 1.5l1.5 1.5L3.5 10.5l-2 .5.5-2L9 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </Tag>
    );
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveOnBlur ? commit : cancel}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={`rounded border gu-bg-surface-hover px-2 py-0.5 gu-text-text outline-none transition-colors ${
            error
              ? 'gu-border-error focus-visible:ring-1 gu-fv-ring-error'
              : 'gu-border-primary focus-visible:ring-1 gu-fv-ring-primary'
          } ${inputClassName}`}
        />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); commit(); }}
          aria-label="Confirmar"
          className="flex h-6 w-6 items-center justify-center rounded gu-text-success transition-colors gu-h-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
        >
          <Check className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); cancel(); }}
          aria-label="Cancelar"
          className="flex h-6 w-6 items-center justify-center rounded gu-text-text-muted transition-colors gu-h-bg-surface-hover gu-h-text-error focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
        >
          <X className="w-2.5 h-2.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs gu-text-error">
          {error}
        </p>
      )}
    </div>
  );
}
