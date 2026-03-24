'use client';
import { useCallback, useId, useRef, useState, type HTMLAttributes } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface Language {
  code: string;
  label: string;
  /** Short display label, e.g. "ES" (defaults to code.toUpperCase()) */
  short?: string;
  /** Country flag emoji or custom icon URL */
  flag?: string;
}

export type LanguageSwitcherVariant = 'dropdown' | 'pills' | 'select';

export interface LanguageSwitcherProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  languages: Language[];
  currentLanguage: string;
  onChange: (code: string) => void;
  variant?: LanguageSwitcherVariant;
  /** Show full label (default: false — shows short/code only) */
  showLabel?: boolean;
  /** Show flag (default: true) */
  showFlag?: boolean;
}

/* ─── LanguageSwitcher ────────────────────────────────────────────────── */

export function LanguageSwitcher({
  languages,
  currentLanguage,
  onChange,
  variant = 'dropdown',
  showLabel = false,
  showFlag = true,
  className = '',
  ...props
}: LanguageSwitcherProps) {
  if (variant === 'pills') {
    return (
      <PillsVariant
        languages={languages}
        currentLanguage={currentLanguage}
        onChange={onChange}
        showLabel={showLabel}
        showFlag={showFlag}
        className={className}
        {...props}
      />
    );
  }

  if (variant === 'select') {
    return (
      <SelectVariant
        languages={languages}
        currentLanguage={currentLanguage}
        onChange={onChange}
        className={className}
        {...props}
      />
    );
  }

  return (
    <DropdownVariant
      languages={languages}
      currentLanguage={currentLanguage}
      onChange={onChange}
      showLabel={showLabel}
      showFlag={showFlag}
      className={className}
      {...props}
    />
  );
}

/* ─── Dropdown variant ───────────────────────────────────────────────── */

function DropdownVariant({
  languages,
  currentLanguage,
  onChange,
  showLabel,
  showFlag,
  className,
  ...props
}: Omit<LanguageSwitcherProps, 'variant'>) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === currentLanguage) ?? languages[0];

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className={`relative ${className}`} {...props}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Idioma actual: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] px-2.5 text-sm font-medium text-[var(--ui-text)] transition-colors hover:bg-[var(--ui-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
      >
        {showFlag && current.flag && <span aria-hidden="true">{current.flag}</span>}
        <span>{showLabel ? current.label : (current.short ?? current.code.toUpperCase())}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            id={listId}
            role="listbox"
            aria-label="Seleccionar idioma"
            className="absolute right-0 top-full z-50 mt-1 min-w-36 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] py-1 shadow-[var(--ui-shadow-md)]"
          >
            {languages.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <li
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-[var(--ui-surface-hover)] ${
                    isSelected ? 'text-[var(--ui-primary)] font-medium' : 'text-[var(--ui-text)]'
                  }`}
                >
                  {showFlag && lang.flag && <span aria-hidden="true">{lang.flag}</span>}
                  <span>{lang.label}</span>
                  {isSelected && (
                    <svg
                      className="ml-auto"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/* ─── Pills variant ──────────────────────────────────────────────────── */

function PillsVariant({
  languages,
  currentLanguage,
  onChange,
  showLabel,
  showFlag,
  className,
  ...props
}: Omit<LanguageSwitcherProps, 'variant'>) {
  return (
    <div
      role="group"
      aria-label="Seleccionar idioma"
      className={`flex items-center gap-1 ${className}`}
      {...props}
    >
      {languages.map((lang) => {
        const isSelected = lang.code === currentLanguage;
        return (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(lang.code)}
            className={`flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] ${
              isSelected
                ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                : 'bg-[var(--ui-surface-hover)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
            }`}
          >
            {showFlag && lang.flag && <span aria-hidden="true">{lang.flag}</span>}
            {showLabel ? lang.label : (lang.short ?? lang.code.toUpperCase())}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Select variant ─────────────────────────────────────────────────── */

function SelectVariant({
  languages,
  currentLanguage,
  onChange,
  className,
  ...props
}: Omit<LanguageSwitcherProps, 'variant' | 'showLabel' | 'showFlag'>) {
  const selectId = useId();
  return (
    <div className={className} {...props}>
      <label htmlFor={selectId} className="sr-only">
        Idioma
      </label>
      <select
        id={selectId}
        value={currentLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] px-2 text-sm text-[var(--ui-text)] outline-none transition-colors focus-visible:border-[var(--ui-primary)] focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)]"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
