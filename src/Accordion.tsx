import { useState, type ReactNode } from 'react';

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

interface AccordionItemProps {
  id: string;
  header: ReactNode;
  preview?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

export function AccordionItem({
  id,
  header,
  preview,
  children,
  defaultOpen = false,
  className = '',
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = `accordion-content-${id}`;

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isOpen
          ? 'bg-[var(--ui-surface)] border-[var(--ui-primary)]/20'
          : 'bg-[var(--ui-surface)]/50 border-transparent hover:border-[var(--ui-border)]'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <svg
          className={`w-4 h-4 shrink-0 text-[var(--ui-text-muted)] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>

        <div className="flex-1 min-w-0">
          {header}
          {!isOpen && preview && (
            <p className="text-xs text-[var(--ui-text-muted)] mt-1 line-clamp-2">{preview}</p>
          )}
        </div>
      </button>

      <div
        id={contentId}
        role="region"
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
