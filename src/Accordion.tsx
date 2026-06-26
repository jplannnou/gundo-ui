'use client';
import './ui-classes.css';
import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from './utils/useReducedMotion';
// Side-effect import: load the .ui-focus-ring CSS used below.
import './Button.css';

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
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isOpen
          ? 'gu-bg-surface gu-border-border'
          : 'gu-bg-surface border-transparent gu-h-border-border'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="ui-focus-ring w-full flex items-center gap-3 p-4 text-left rounded-lg"
      >
        <ChevronDown
          className={`w-4 h-4 shrink-0 gu-text-text-muted transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0">
          {header}
          {!isOpen && preview && (
            <p className="text-xs gu-text-text-muted mt-1 line-clamp-2">{preview}</p>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              ease: 'easeInOut',
            }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
