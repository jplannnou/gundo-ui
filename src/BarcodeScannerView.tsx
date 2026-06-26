'use client';
import { useEffect, useRef, useState } from 'react';
import { CameraOff, Keyboard, RefreshCw } from 'lucide-react';
import { useCamera, captureVideoFrame } from './utils/useCamera';

export interface BarcodeScannerViewProps {
  /**
   * Decode a frame and return the barcode value (or null). Injected by the
   * consumer so `@gundo/ui` stays free of any wasm/decoder dependency
   * (e.g. wrap `zxing-wasm`'s `readBarcodes`).
   */
  decode: (canvas: HTMLCanvasElement) => Promise<string | null>;
  /** Called once with the first decoded value; scanning then pauses. */
  onDetected: (value: string) => void;
  /** Scan cadence in ms (default 400). */
  intervalMs?: number;
  /** Instruction shown under the reticle. */
  hint?: string;
  /** Permission prompt text. */
  permissionHint?: string;
  /** Manual-entry affordance (shown as a button when provided). */
  onManualEntry?: () => void;
  manualLabel?: string;
  startLabel?: string;
  /** Max decoded frame dimension (default 1280 — smaller = faster decode). */
  maxDimension?: number;
  className?: string;
}

/**
 * Continuous barcode scanner: live rear camera + a reticle overlay that polls
 * frames through an injected `decode` function. Emits the first hit via
 * `onDetected` and offers a manual-entry fallback. Decoder-agnostic by design.
 */
export function BarcodeScannerView({
  decode,
  onDetected,
  intervalMs = 400,
  hint,
  permissionHint,
  onManualEntry,
  manualLabel = 'Enter code manually',
  startLabel = 'Enable camera',
  maxDimension = 1280,
  className = '',
}: BarcodeScannerViewProps) {
  const { videoRef, ready, error, start } = useCamera({ facingMode: 'environment' });
  const [detected, setDetected] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    void start();
  }, [start]);

  useEffect(() => {
    if (!ready || detected) return;
    const id = setInterval(async () => {
      if (busyRef.current || !videoRef.current) return;
      busyRef.current = true;
      try {
        const canvas = captureVideoFrame(videoRef.current, maxDimension);
        const value = await decode(canvas);
        if (value && !detected) {
          setDetected(true);
          onDetected(value);
        }
      } catch {
        /* ignore decode errors per-frame */
      } finally {
        busyRef.current = false;
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [ready, detected, decode, onDetected, intervalMs, maxDimension, videoRef]);

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-[var(--ui-radius-lg)] bg-black ${className}`}>
      <video ref={videoRef} playsInline muted autoPlay className="h-full w-full flex-1 object-cover" aria-label="Barcode scanner camera feed" />

      {/* Reticle */}
      {ready && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="relative h-32 w-72 max-w-[80%] rounded-[var(--ui-radius-md)] border-2 border-[var(--ui-primary)] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-[var(--ui-primary)]" />
          </div>
          {hint && <p className="rounded-[var(--ui-radius-sm)] bg-black/50 px-3 py-1 text-sm text-white">{hint}</p>}
        </div>
      )}

      {/* Permission / error */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--ui-surface)] p-6 text-center">
          <CameraOff className="h-10 w-10 text-[var(--ui-text-muted)]" aria-hidden="true" />
          {(error || permissionHint) && (
            <p className="text-sm text-[var(--ui-text-secondary)]">{error ?? permissionHint}</p>
          )}
          <button
            type="button"
            onClick={() => void start()}
            className="ui-focus-ring inline-flex items-center gap-2 rounded-[var(--ui-radius-md)] bg-[var(--ui-primary)] px-4 py-2 text-sm font-medium text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {startLabel}
          </button>
        </div>
      )}

      {/* Manual fallback */}
      {onManualEntry && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
          <button
            type="button"
            onClick={onManualEntry}
            className="ui-focus-ring inline-flex items-center gap-2 rounded-[var(--ui-radius-md)] bg-black/55 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/70"
          >
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            {manualLabel}
          </button>
        </div>
      )}
    </div>
  );
}
