import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraFacing = 'environment' | 'user';

export interface UseCameraOptions {
  /** Preferred camera. Defaults to the rear ('environment') camera. */
  facingMode?: CameraFacing;
  /** Ideal capture resolution (hint to the browser). */
  width?: number;
  height?: number;
}

export interface UseCameraResult {
  /** Attach to a <video> element. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** True once the stream is live. */
  ready: boolean;
  /** Human-readable error (permission denied, no device, …). */
  error: string | null;
  /** Request the camera and start streaming. */
  start: () => Promise<void>;
  /** Stop all tracks and release the camera. */
  stop: () => void;
}

/**
 * Manages a getUserMedia stream bound to a <video> element, defaulting to the
 * rear camera. Releases tracks on unmount. Powers `CameraView` and
 * `BarcodeScannerView`, but can be used standalone for custom camera UIs.
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraResult {
  const { facingMode = 'environment', width = 1920, height = 1080 } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported on this device');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: width }, height: { ideal: height } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not access camera');
      setReady(false);
    }
  }, [facingMode, width, height]);

  useEffect(() => stop, [stop]);

  return { videoRef, ready, error, start, stop };
}

/** Draw the current video frame onto a fresh canvas, capped to `maxDimension`. */
export function captureVideoFrame(video: HTMLVideoElement, maxDimension = 1600): HTMLCanvasElement {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const scale = Math.min(1, maxDimension / Math.max(vw, vh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(vw * scale);
  canvas.height = Math.round(vh * scale);
  canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}
