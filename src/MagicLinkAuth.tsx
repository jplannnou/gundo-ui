import { useState, type FormEvent, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MagicLinkAuthState = 'idle' | 'sending' | 'sent' | 'error';

export interface MagicLinkAuthProps {
  /** Called when user submits magic-link form */
  onMagicLink: (email: string) => Promise<void>;
  /** Called when user clicks Google */
  onGoogle: () => void;
  /** Called when user clicks Apple (omit to hide) */
  onApple?: () => void;
  /** Welcome title (optional) */
  title?: string;
  /** Secondary copy */
  subtitle?: string;
  /** Label under the email form (e.g. terms link) */
  disclaimer?: ReactNode;
  /** Preloaded email */
  defaultEmail?: string;
  /** Force a given state (for storybooks / tests) */
  forcedState?: MagicLinkAuthState;
  /** Called after state transitions to `sent` */
  onSent?: (email: string) => void;
  className?: string;
}

/* ─── Icons ──────────────────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#EA4335" d="M9 3.48c1.69 0 2.85.73 3.5 1.34l2.55-2.49C13.46 0.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" />
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.13-.84 2.08-1.8 2.72l2.91 2.26c1.7-1.57 2.69-3.88 2.69-6.63z" />
      <path fill="#FBBC05" d="M3.87 10.78c-.2-.57-.32-1.17-.32-1.78s.12-1.21.32-1.78L.96 4.96C.35 6.17 0 7.54 0 9s.35 2.83.96 4.04l2.91-2.26z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.86.86-3.05.86-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.44 15.98 5.48 18 9 18z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M14.5 13.6c-.3.8-.8 1.5-1.3 2.1-.7.8-1.5 1.2-2.3 1.2-.9 0-1.2-.3-2-.3s-1.2.3-2.1.3c-.8 0-1.5-.4-2.2-1.1-1.8-2-2.5-5.4-1-7.8.7-1.2 1.9-2 3.2-2 .9 0 1.6.4 2.1.4s1.3-.5 2.2-.5c.8 0 1.7.3 2.4.9-2.1 1.1-1.7 4-.1 5 .3.2.7.4 1.1.5zM11 3.5c.5-.7.9-1.6.8-2.5-.8.1-1.7.6-2.3 1.2-.5.6-1 1.5-.8 2.4.9.1 1.8-.4 2.3-1.1z" />
    </svg>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/* ─── MagicLinkAuth ──────────────────────────────────────────────────── */

export function MagicLinkAuth({
  onMagicLink,
  onGoogle,
  onApple,
  title = 'Bienvenido a GUNDO',
  subtitle = 'Entrá en 5 segundos. Sin contraseñas.',
  disclaimer,
  defaultEmail = '',
  forcedState,
  onSent,
  className = '',
}: MagicLinkAuthProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<MagicLinkAuthState>('idle');
  const [error, setError] = useState<string | null>(null);
  const currentState = forcedState ?? state;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Ingresá un email válido');
      return;
    }
    setError(null);
    setState('sending');
    try {
      await onMagicLink(email.trim());
      setState('sent');
      onSent?.(email.trim());
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'No pudimos enviar el email. Reintentá.');
    }
  }

  return (
    <div
      className={`mx-auto flex w-full max-w-md flex-col items-stretch gap-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-[var(--ui-shadow-md)] md:p-8 ${className}`}
    >
      <header className="flex flex-col items-center gap-1 text-center">
        <div
          className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
          style={{ background: 'var(--ui-gradient)' }}
          aria-hidden="true"
        >
          <span className="text-white">G</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--ui-text)]">{title}</h1>
        <p className="text-sm text-[var(--ui-text-secondary)]">{subtitle}</p>
      </header>

      {/* Social providers */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onGoogle}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm font-semibold text-[var(--ui-text)] transition-colors hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
        {onApple && (
          <button
            type="button"
            onClick={onApple}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm font-semibold text-[var(--ui-text)] transition-colors hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
          >
            <AppleIcon />
            Continuar con Apple
          </button>
        )}
      </div>

      <div className="relative flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--ui-border)]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
          o con magic link
        </span>
        <span className="h-px flex-1 bg-[var(--ui-border)]" />
      </div>

      {currentState === 'sent' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--ui-success)_40%,transparent)] bg-[var(--ui-success-soft)] p-4 text-center text-sm text-[var(--ui-success)]"
        >
          <span className="text-2xl" aria-hidden="true">📬</span>
          <p className="font-semibold">Te enviamos un link a {email || 'tu email'}</p>
          <p className="text-xs text-[var(--ui-text-secondary)]">
            Abrí el email y tocá el botón para entrar. Expira en 15 min.
          </p>
          <button
            type="button"
            onClick={() => setState('idle')}
            className="mt-1 text-xs font-semibold text-[var(--ui-primary)] underline-offset-2 hover:underline"
          >
            Usar otro email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="magic-link-email" className="sr-only">
            Email
          </label>
          <input
            id="magic-link-email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={currentState === 'sending'}
            className="w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] px-4 py-3 text-sm text-[var(--ui-text)] placeholder:text-[var(--ui-text-muted)] focus-visible:border-[var(--ui-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] disabled:opacity-50"
          />
          {error && (
            <p role="alert" className="text-xs text-[var(--ui-error)]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={currentState === 'sending'}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'var(--ui-gradient)' }}
          >
            {currentState === 'sending' ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Enviando link...
              </>
            ) : (
              'Enviarme magic link'
            )}
          </button>
        </form>
      )}

      {disclaimer && (
        <p className="text-center text-[11px] text-[var(--ui-text-muted)]">{disclaimer}</p>
      )}
    </div>
  );
}
