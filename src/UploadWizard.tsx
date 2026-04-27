import { useCallback, useRef, useState, type DragEvent, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type UploadWizardTestType = 'blood' | 'urine';
export type UploadWizardStep = 'type' | 'upload' | 'review' | 'done';

export interface OCRMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  /** Value from OCR before any user edit — used to highlight edits */
  originalValue?: string | number;
  /** Optional reference range */
  referenceRange?: string;
  /** Confidence 0-100 */
  confidence?: number;
}

export interface OCRResult {
  metrics: OCRMetric[];
  /** Additional raw text if useful */
  rawText?: string;
  /** Optional detected test date */
  testDate?: string;
}

export interface UploadWizardProps {
  /** Handle OCR extraction. Return metrics from the uploaded file. */
  onUpload: (file: File, metadata: { testType: UploadWizardTestType }) => Promise<OCRResult>;
  /** Called with confirmed metrics after user review */
  onConfirm: (metrics: OCRMetric[], metadata: { testType: UploadWizardTestType; file: File }) => void;
  /** Force a test type (skips step 1) */
  testType?: UploadWizardTestType;
  /** Called when user exits */
  onCancel?: () => void;
  /** Max file size MB (default 10) */
  maxSizeMB?: number;
  /** Accept attribute override */
  accept?: string;
  /** Show fallback to "enter manually" in step 2 */
  onManualFallback?: () => void;
  /** Custom privacy banner content */
  privacyBanner?: ReactNode;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const steps: { id: UploadWizardStep; label: string }[] = [
  { id: 'type', label: 'Tipo' },
  { id: 'upload', label: 'Subir' },
  { id: 'review', label: 'Revisar' },
  { id: 'done', label: 'Listo' },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ─── UploadWizard ───────────────────────────────────────────────────── */

export function UploadWizard({
  onUpload,
  onConfirm,
  testType: forcedType,
  onCancel,
  maxSizeMB = 10,
  accept = 'image/*,.pdf',
  onManualFallback,
  privacyBanner,
  className = '',
}: UploadWizardProps) {
  const [step, setStep] = useState<UploadWizardStep>(forcedType ? 'upload' : 'type');
  const [testType, setTestType] = useState<UploadWizardTestType | null>(forcedType ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [metrics, setMetrics] = useState<OCRMetric[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stepIndex = steps.findIndex((s) => s.id === step);

  /* ─── Handlers ─────────────────────────────────────────────────────── */

  const handleFileSelected = useCallback(
    async (selected: File) => {
      if (selected.size > maxSizeMB * 1024 * 1024) {
        setError(`El archivo supera ${maxSizeMB}MB`);
        return;
      }
      if (!testType) {
        setError('Elegí primero el tipo de test');
        return;
      }
      setError(null);
      setFile(selected);
      setProcessing(true);
      try {
        const ocr = await onUpload(selected, { testType });
        setResult(ocr);
        setMetrics(
          ocr.metrics.map((m) => ({ ...m, originalValue: m.originalValue ?? m.value })),
        );
        setStep('review');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error procesando el archivo');
      } finally {
        setProcessing(false);
      }
    },
    [maxSizeMB, onUpload, testType],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelected(dropped);
  };

  const editMetric = (id: string, patch: Partial<OCRMetric>) => {
    setMetrics((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const confirmReview = () => {
    if (!file || !testType) return;
    onConfirm(metrics, { testType, file });
    setStep('done');
  };

  /* ─── Render ───────────────────────────────────────────────────────── */

  return (
    <section
      className={`mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 md:p-6 ${className}`}
      aria-label="Subir analítica"
    >
      {/* Stepper */}
      <ol className="flex items-center gap-2" aria-label="Pasos del wizard">
        {steps.map((s, idx) => {
          const state = idx < stepIndex ? 'done' : idx === stepIndex ? 'active' : 'upcoming';
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  state === 'done'
                    ? 'bg-[var(--ui-success)] text-white'
                    : state === 'active'
                      ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                      : 'bg-[var(--ui-surface-hover)] text-[var(--ui-text-muted)]'
                }`}
                aria-current={state === 'active' ? 'step' : undefined}
              >
                {state === 'done' ? '✓' : idx + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  state === 'upcoming' ? 'text-[var(--ui-text-muted)]' : 'text-[var(--ui-text)]'
                }`}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <span className="mx-1 hidden h-px flex-1 bg-[var(--ui-border)] sm:block" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      {privacyBanner ?? (
        <div className="flex items-start gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-3 text-xs text-[var(--ui-text-secondary)]">
          <span aria-hidden="true" className="mt-0.5 text-[var(--ui-info)]">🔒</span>
          <p>
            Tus datos clínicos se guardan cifrados y no se comparten con terceros. OCR se corre del
            lado del servidor y sólo vos ves los resultados.
          </p>
        </div>
      )}

      {/* Step body */}
      {step === 'type' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['blood', 'urine'] as UploadWizardTestType[]).map((t) => {
            const selected = testType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTestType(t)}
                aria-pressed={selected}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${
                  selected
                    ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)]'
                    : 'border-[var(--ui-border)] hover:border-[var(--ui-border-hover)]'
                }`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {t === 'blood' ? '🩸' : '💧'}
                </span>
                <div>
                  <p className="font-semibold text-[var(--ui-text)]">
                    {t === 'blood' ? 'Analítica de sangre' : 'Analítica de orina'}
                  </p>
                  <p className="text-xs text-[var(--ui-text-secondary)]">
                    {t === 'blood'
                      ? 'Hemograma, perfil lipídico, glucosa, etc.'
                      : 'Sedimento, pH, densidad, etc.'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 'upload' && (
        <div className="flex flex-col gap-3">
          <label
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging
                ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)]'
                : 'border-[var(--ui-border)] bg-[var(--ui-surface-raised)] hover:border-[var(--ui-border-hover)]'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelected(f);
              }}
            />
            <span className="text-3xl" aria-hidden="true">📄</span>
            <p className="text-sm font-semibold text-[var(--ui-text)]">
              Arrastrá tu PDF o imagen aquí
            </p>
            <p className="text-xs text-[var(--ui-text-secondary)]">
              o tocá para elegir · máx {maxSizeMB} MB · {accept.includes('pdf') ? 'PDF + JPG/PNG' : 'JPG/PNG'}
            </p>
            {processing && (
              <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-[var(--ui-primary)]">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Procesando OCR…
              </p>
            )}
          </label>
          {/* Camera capture (iOS/Android) */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--ui-border)] px-4 py-2 text-sm font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]"
          >
            📷 Usar cámara
          </button>
          {onManualFallback && (
            <button
              type="button"
              onClick={onManualFallback}
              className="self-center text-xs font-medium text-[var(--ui-primary)] underline-offset-2 hover:underline"
            >
              O ingresar manualmente
            </button>
          )}
          {error && (
            <p role="alert" className="text-xs text-[var(--ui-error)]">
              {error}
            </p>
          )}
        </div>
      )}

      {step === 'review' && result && (
        <div className="flex flex-col gap-3">
          {file && (
            <p className="text-xs text-[var(--ui-text-muted)]">
              {file.name} · {formatBytes(file.size)}
              {result.testDate ? ` · Fecha test: ${result.testDate}` : ''}
            </p>
          )}
          <div className="flex flex-col divide-y divide-[var(--ui-border)] overflow-hidden rounded-xl border border-[var(--ui-border)]">
            {metrics.map((m) => {
              const edited = String(m.value) !== String(m.originalValue);
              return (
                <div key={m.id} className="flex items-center gap-3 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--ui-text)]">{m.label}</p>
                    {m.referenceRange && (
                      <p className="text-[11px] text-[var(--ui-text-muted)]">
                        Rango: {m.referenceRange}
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    value={String(m.value)}
                    onChange={(e) => editMetric(m.id, { value: e.target.value })}
                    className={`w-28 rounded-lg border px-2 py-1.5 text-right text-sm tabular-nums ${
                      edited
                        ? 'border-[var(--ui-warning)] bg-[var(--ui-warning-soft)]'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface-raised)]'
                    } focus-visible:border-[var(--ui-primary)] focus-visible:outline-none`}
                  />
                  <span className="w-10 text-xs text-[var(--ui-text-muted)]">{m.unit ?? ''}</span>
                  {typeof m.confidence === 'number' && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        m.confidence >= 80
                          ? 'bg-[var(--ui-success-soft)] text-[var(--ui-success)]'
                          : m.confidence >= 60
                            ? 'bg-[var(--ui-warning-soft)] text-[var(--ui-warning)]'
                            : 'bg-[var(--ui-error-soft)] text-[var(--ui-error)]'
                      }`}
                      title="Confianza OCR"
                    >
                      {m.confidence}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--ui-text-muted)]">
            Los valores en amarillo se editaron manualmente.
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="text-4xl" aria-hidden="true">✅</span>
          <p className="text-lg font-bold text-[var(--ui-text)]">Analítica guardada</p>
          <p className="text-sm text-[var(--ui-text-secondary)]">
            Estamos actualizando tu plan. Te avisamos cuando esté listo.
          </p>
        </div>
      )}

      {/* Footer actions */}
      {step !== 'done' && (
        <footer className="mt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (step === 'type') onCancel?.();
              else if (step === 'upload') setStep(forcedType ? 'upload' : 'type');
              else if (step === 'review') setStep('upload');
            }}
            className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)]"
          >
            {step === 'type' ? 'Cancelar' : 'Atrás'}
          </button>
          {step === 'type' && (
            <button
              type="button"
              onClick={() => testType && setStep('upload')}
              disabled={!testType}
              className="rounded-xl bg-[var(--ui-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] disabled:opacity-50"
            >
              Siguiente
            </button>
          )}
          {step === 'review' && (
            <button
              type="button"
              onClick={confirmReview}
              className="rounded-xl bg-[var(--ui-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
            >
              Confirmar y guardar
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
