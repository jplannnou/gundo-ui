'use client';
import './ui-classes.css';
import { useEffect, type ReactNode } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { useCamera, captureVideoFrame, type CameraFacing } from './utils/useCamera';

export interface CameraViewProps {
  /** Called with a freshly captured frame (canvas) when the user taps capture. */
  onCapture: (canvas: HTMLCanvasElement) => void;
  /** Overlay rendered on top of the live feed (framing guides, hints). */
  overlay?: ReactNode;
  /** Accessible label / text for the capture button. */
  captureLabel?: string;
  /** Label for the initial "enable camera" button. */
  startLabel?: string;
  /** Hint shown alongside the permission prompt. */
  permissionHint?: string;
  /** Rear ('environment', default) or front ('user') camera. */
  facingMode?: CameraFacing;
  /** Max captured frame dimension in px (default 1600). */
  maxDimension?: number;
  /** Start the camera automatically on mount (default true). */
  autoStart?: boolean;
  /** Hide the built-in capture button (e.g. for continuous-scan use). */
  hideCaptureButton?: boolean;
  className?: string;
}

/**
 * Live rear-camera viewport with a capture button and an overlay slot. Handles
 * permission/error states. Emits captured frames as a canvas via `onCapture`
 * so the consumer owns compression/analysis. Used directly for guided photo
 * capture and composed by `BarcodeScannerView`.
 */
export function CameraView({
  onCapture,
  overlay,
  captureLabel = 'Capture',
  startLabel = 'Enable camera',
  permissionHint,
  facingMode = 'environment',
  maxDimension = 1600,
  autoStart = true,
  hideCaptureButton = false,
  className = '',
}: CameraViewProps) {
  const { videoRef, ready, error, start } = useCamera({ facingMode });

  useEffect(() => {
    if (autoStart) void start();
  }, [autoStart, start]);

  const handleCapture = () => {
    if (videoRef.current && ready) onCapture(captureVideoFrame(videoRef.current, maxDimension));
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden gu-rounded-radius-lg bg-black ${className}`}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-full w-full flex-1 object-cover"
        aria-label="Camera feed"
      />

      {/* Overlay guides */}
      {ready && overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}

      {/* Permission / error state */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 gu-bg-surface p-6 text-center">
          {error ? (
            <>
              <CameraOff className="h-10 w-10 gu-text-error" aria-hidden="true" />
              <p className="text-sm gu-text-text-secondary">{error}</p>
              <button
                type="button"
                onClick={() => void start()}
                className="ui-focus-ring inline-flex items-center gap-2 gu-rounded-radius-md gu-bg-primary px-4 py-2 text-sm font-medium gu-text-surface transition-colors gu-h-bg-primary-hover"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {startLabel}
              </button>
            </>
          ) : (
            <>
              <Camera className="h-10 w-10 gu-text-text-muted" aria-hidden="true" />
              {permissionHint && <p className="text-sm gu-text-text-secondary">{permissionHint}</p>}
              <button
                type="button"
                onClick={() => void start()}
                className="ui-focus-ring inline-flex items-center gap-2 gu-rounded-radius-md gu-bg-primary px-4 py-2 text-sm font-medium gu-text-surface transition-colors gu-h-bg-primary-hover"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                {startLabel}
              </button>
            </>
          )}
        </div>
      )}

      {/* Capture button */}
      {ready && !hideCaptureButton && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-5">
          <button
            type="button"
            onClick={handleCapture}
            aria-label={captureLabel}
            className="ui-focus-ring flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 gu-bg-primary gu-text-surface shadow-lg transition-transform active:scale-95"
          >
            <Camera className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
