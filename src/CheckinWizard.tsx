import { useMemo, useState, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type CheckinQuestionType = 'emoji' | 'multiselect' | 'scale';

export interface CheckinEmojiOption {
  value: string;
  emoji: string;
  label: string;
}

export interface CheckinMultiOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface CheckinQuestion {
  id: string;
  text: string;
  type: CheckinQuestionType;
  /** For emoji: emoji options. For multiselect: label options. For scale: ignored (uses 1-5). */
  options?: CheckinEmojiOption[] | CheckinMultiOption[];
  /** Optional helper/hint shown under the title */
  hint?: string;
  /** Max selections (multiselect only, default unlimited) */
  maxSelections?: number;
  /** Min value for scale (default 1) */
  scaleMin?: number;
  /** Max value for scale (default 5) */
  scaleMax?: number;
  /** Scale labels — [minLabel, maxLabel] */
  scaleLabels?: [string, string];
}

export type CheckinAnswer = string | string[] | number;

export interface CheckinAnswers {
  [questionId: string]: CheckinAnswer;
}

export interface CheckinWizardProps {
  questions: CheckinQuestion[];
  /** Called with all answers when user completes every question */
  onComplete: (answers: CheckinAnswers) => void;
  /** Called when user exits without completing */
  onCancel?: () => void;
  /** Render a sticky impact preview (e.g. "Esto ajustará tu plan 3 comidas") */
  impactPreview?: (answers: CheckinAnswers, currentId: string) => ReactNode;
  /** Pre-filled answers */
  defaultAnswers?: CheckinAnswers;
  /** Override final CTA label */
  completeLabel?: string;
  className?: string;
}

/* ─── CheckinWizard ──────────────────────────────────────────────────── */

export function CheckinWizard({
  questions,
  onComplete,
  onCancel,
  impactPreview,
  defaultAnswers = {},
  completeLabel = 'Terminar check-in',
  className = '',
}: CheckinWizardProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<CheckinAnswers>(defaultAnswers);

  const current = questions[index];
  const isFirst = index === 0;
  const isLast = index === questions.length - 1;
  const currentAnswer = answers[current.id];

  const canAdvance = useMemo(() => {
    if (current.type === 'multiselect') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }
    return currentAnswer !== undefined && currentAnswer !== '';
  }, [current, currentAnswer]);

  const progressPct = ((index + 1) / questions.length) * 100;

  function setAnswer(value: CheckinAnswer) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function toggleMulti(value: string) {
    const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
    if (prev.includes(value)) {
      setAnswer(prev.filter((v) => v !== value));
      return;
    }
    if (current.maxSelections && prev.length >= current.maxSelections) return;
    setAnswer([...prev, value]);
  }

  function next() {
    if (!canAdvance) return;
    if (isLast) {
      onComplete(answers);
      return;
    }
    setIndex(index + 1);
  }

  function back() {
    if (isFirst) {
      onCancel?.();
      return;
    }
    setIndex(index - 1);
  }

  return (
    <section
      className={`mx-auto flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 ${className}`}
      aria-label="Check-in mensual"
    >
      {/* Progress */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-[var(--ui-text-muted)]">
          <span>
            Pregunta {index + 1} de {questions.length}
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-[var(--ui-surface-hover)]"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[var(--ui-primary)] transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <header className="mt-1">
        <h2 className="text-lg font-bold text-[var(--ui-text)]">{current.text}</h2>
        {current.hint && (
          <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">{current.hint}</p>
        )}
      </header>

      {/* Body by type */}
      <div className="flex flex-col gap-3">
        {current.type === 'emoji' &&
          current.options &&
          (
            <div className="grid grid-cols-5 gap-2">
              {(current.options as CheckinEmojiOption[]).map((opt) => {
                const selected = currentAnswer === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(opt.value)}
                    aria-pressed={selected}
                    className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                      selected
                        ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface-raised)] text-[var(--ui-text-secondary)] hover:border-[var(--ui-border-hover)]'
                    }`}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {opt.emoji}
                    </span>
                    <span className="line-clamp-1 text-center font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

        {current.type === 'multiselect' && current.options && (
          <div className="flex flex-wrap gap-2">
            {(current.options as CheckinMultiOption[]).map((opt) => {
              const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleMulti(opt.value)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                    selected
                      ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'
                      : 'border-[var(--ui-border)] bg-[var(--ui-surface-raised)] text-[var(--ui-text-secondary)] hover:border-[var(--ui-border-hover)]'
                  }`}
                >
                  {opt.emoji && <span aria-hidden="true">{opt.emoji}</span>}
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {current.type === 'scale' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              {(() => {
                const min = current.scaleMin ?? 1;
                const max = current.scaleMax ?? 5;
                const values: number[] = [];
                for (let i = min; i <= max; i++) values.push(i);
                return values.map((v) => {
                  const selected = currentAnswer === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAnswer(v)}
                      aria-pressed={selected}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                        selected
                          ? 'scale-110 border-[var(--ui-primary)] bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                          : 'border-[var(--ui-border)] bg-[var(--ui-surface-raised)] text-[var(--ui-text-secondary)] hover:border-[var(--ui-primary)]'
                      }`}
                    >
                      {v}
                    </button>
                  );
                });
              })()}
            </div>
            {current.scaleLabels && (
              <div className="flex items-center justify-between text-[11px] text-[var(--ui-text-muted)]">
                <span>{current.scaleLabels[0]}</span>
                <span>{current.scaleLabels[1]}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Impact preview */}
      {impactPreview && (
        <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-3 text-xs text-[var(--ui-text-secondary)]">
          {impactPreview(answers, current.id)}
        </div>
      )}

      {/* Nav */}
      <footer className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={back}
          className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
        >
          {isFirst ? 'Salir' : 'Atrás'}
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ui-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? completeLabel : 'Siguiente'}
        </button>
      </footer>
    </section>
  );
}
