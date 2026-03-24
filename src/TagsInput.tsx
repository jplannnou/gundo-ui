'use client';
import { useState, useRef, useId, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

export function TagsInput({
  value,
  onChange,
  placeholder = 'Add tag...',
  maxTags,
  disabled = false,
  className = '',
}: TagsInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (maxTags && value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const atLimit = maxTags !== undefined && value.length >= maxTags;

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] px-2 py-1.5 focus-within:border-[var(--ui-primary)] transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--ui-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--ui-primary)]"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              aria-label={`Remove ${tag}`}
              className="ml-0.5 hover:text-[var(--ui-error)] transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
            </button>
          )}
        </span>
      ))}
      {!atLimit && (
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input); }}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-[var(--ui-text)] outline-none placeholder:text-[var(--ui-text-muted)] py-0.5"
        />
      )}
    </div>
  );
}
