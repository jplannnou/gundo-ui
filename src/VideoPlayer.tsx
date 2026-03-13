import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface VideoPlayerProps {
  src: string;
  /** Poster image shown before playback */
  poster?: string;
  title?: string;
  /** Aspect ratio (default: '16/9') */
  aspectRatio?: '16/9' | '4/3' | '1/1' | '9/16';
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  /** Show native controls instead of custom UI */
  nativeControls?: boolean;
  /** Called with the video element ref (useful for attaching HLS.js externally) */
  onReady?: (videoEl: HTMLVideoElement) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Floating caption overlay */
  caption?: string;
  className?: string;
}

/* ─── Utils ──────────────────────────────────────────────────────────── */

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ─── VideoPlayer ─────────────────────────────────────────────────────── */

const aspectClasses: Record<string, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '9/16': 'aspect-[9/16]',
};

export function VideoPlayer({
  src,
  poster,
  title,
  aspectRatio = '16/9',
  autoPlay = false,
  muted = false,
  loop = false,
  nativeControls = false,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  caption,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [mutedState, setMutedState] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && onReady) {
      onReady(videoRef.current);
    }
  }, [onReady]);

  const play = useCallback(() => videoRef.current?.play(), []);
  const pause = useCallback(() => videoRef.current?.pause(), []);
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.paused ? play() : pause();
  }, [play, pause]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMutedState(videoRef.current.muted);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      setCurrentTime(t);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setVolume(v);
      setMutedState(v === 0);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setFullscreen(false));
    }
  }, []);

  const revealControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    if (playing) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => () => clearTimeout(hideTimeout.current), []);

  if (nativeControls) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-black ${aspectClasses[aspectRatio]} ${className}`}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          title={title}
          className="h-full w-full object-contain"
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-xl bg-black ${aspectClasses[aspectRatio]} ${className}`}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onFocus={revealControls}
      role="region"
      aria-label={title ?? 'Reproductor de video'}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={mutedState}
        loop={loop}
        playsInline
        className="h-full w-full cursor-pointer object-contain"
        onClick={togglePlay}
        onPlay={() => { setPlaying(true); onPlay?.(); revealControls(); }}
        onPause={() => { setPlaying(false); setShowControls(true); onPause?.(); }}
        onEnded={() => { setPlaying(false); setShowControls(true); onEnded?.(); }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onTimeUpdate={(e: SyntheticEvent<HTMLVideoElement>) => {
          const v = e.currentTarget;
          setCurrentTime(v.currentTime);
          if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
          onTimeUpdate?.(v.currentTime, v.duration);
        }}
        onVolumeChange={() => setVolume(videoRef.current?.volume ?? 1)}
      />

      {/* Big play button overlay when paused */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reproducir"
          className="absolute inset-0 flex items-center justify-center focus-visible:outline-none"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white transition-transform hover:scale-110">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </div>
        </button>
      )}

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-14 left-0 right-0 px-4">
          <span className="rounded bg-black/75 px-2 py-0.5 text-sm text-white">{caption}</span>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 transition-opacity duration-200 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress */}
        <div className="relative mb-2 h-1 cursor-pointer">
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            style={{ width: duration ? `${(buffered / duration) * 100}%` : '0%' }}
          />
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Posición de reproducción"
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent accent-[var(--ui-primary)] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-runnable-track]:h-1"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pausar' : 'Reproducir'}
            className="text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <rect x="3" y="2" width="4" height="12" rx="1" />
                <rect x="9" y="2" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4 3v10l9-5-9-5z" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span className="text-xs tabular-nums text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={mutedState ? 'Activar sonido' : 'Silenciar'}
                className="text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
              >
                {mutedState || volume === 0 ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 5h3l4-3v12l-4-3H2V5zM13 5l-4 4M9 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 5h3l4-3v12l-4-3H2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M11 6a3 3 0 010 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={mutedState ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volumen"
                className="w-16 cursor-pointer accent-[var(--ui-primary)]"
              />
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className="text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
            >
              {fullscreen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
