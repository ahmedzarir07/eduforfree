import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

function extractVideoId(url: string): { type: 'youtube' | 'vimeo' | 'custom'; embedUrl: string } {
  // YouTube - block related videos, annotations, info, end screen suggestions
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&origin=${window.location.origin}&enablejsapi=1&widget_referrer=${window.location.origin}`,
    };
  }
  // Vimeo - hide all chrome
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?controls=0&title=0&byline=0&portrait=0&sidedock=0&transparent=0`,
    };
  }
  return { type: 'custom', embedUrl: url };
}

// Load VidInfra script
let vidinfraLoaded = false;
function loadVidinfra(): Promise<void> {
  if (vidinfraLoaded || (window as any).Vidinfra) {
    vidinfraLoaded = true;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vidinfra/player/dist/player.global.js';
    script.onload = () => { vidinfraLoaded = true; resolve(); };
    script.onerror = () => resolve(); // graceful fallback
    document.head.appendChild(script);
  });
}

interface VideoPlayerProps {
  url: string;
  title: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const { embedUrl, type } = useMemo(() => extractVideoId(url), [url]);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const progressInterval = useRef<ReturnType<typeof setInterval>>();
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Initialize VidInfra player to control iframe
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await loadVidinfra();
      if (!mounted || !iframeRef.current) return;
      const Vidinfra = (window as any).Vidinfra;
      if (Vidinfra?.Player) {
        try {
          playerRef.current = new Vidinfra.Player(iframeRef.current);
          // Try to listen for events
          playerRef.current.on?.('play', () => mounted && setIsPlaying(true));
          playerRef.current.on?.('pause', () => mounted && setIsPlaying(false));
          playerRef.current.on?.('timeupdate', (data: any) => {
            if (!mounted) return;
            if (data?.currentTime !== undefined) setCurrentTime(data.currentTime);
            if (data?.duration !== undefined) setDuration(data.duration);
            if (data?.duration > 0) setProgress((data.currentTime / data.duration) * 100);
          });
        } catch {
          // VidInfra bridge not supported in this iframe, fall back to postMessage
          playerRef.current = null;
        }
      }
    };
    init();
    return () => { mounted = false; playerRef.current?.destroy?.(); playerRef.current = null; };
  }, [embedUrl]);

  // Fallback: YouTube postMessage API for time tracking
  useEffect(() => {
    if (type !== 'youtube') return;
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'onStateChange') {
          setIsPlaying(data.info === 1);
        }
        if (data?.info?.currentTime !== undefined) {
          setCurrentTime(data.info.currentTime);
          setDuration(data.info.duration || 0);
          if (data.info.duration > 0) setProgress((data.info.currentTime / data.info.duration) * 100);
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [type]);

  const postYT = useCallback((func: string, args?: any[]) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: args || [] }), '*');
  }, []);

  const postVimeo = useCallback((method: string, value?: any) => {
    const msg: any = { method };
    if (value !== undefined) msg.value = value;
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), '*');
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    } else {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (playerRef.current?.togglePlay) {
      playerRef.current.togglePlay();
      return;
    }
    if (type === 'youtube') postYT(isPlaying ? 'pauseVideo' : 'playVideo');
    else if (type === 'vimeo') postVimeo(isPlaying ? 'pause' : 'play');
    setIsPlaying(!isPlaying);
  }, [isPlaying, type, postYT, postVimeo]);

  const toggleMute = useCallback(() => {
    if (playerRef.current?.setMuted) {
      playerRef.current.setMuted(!isMuted);
    } else if (type === 'youtube') postYT(isMuted ? 'unMute' : 'mute');
    else if (type === 'vimeo') postVimeo('setVolume', isMuted ? 1 : 0);
    setIsMuted(!isMuted);
  }, [isMuted, type, postYT, postVimeo]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const seek = useCallback((direction: 'forward' | 'back') => {
    const secs = direction === 'forward' ? 10 : -10;
    if (playerRef.current?.seek) {
      playerRef.current.getCurrentTime?.().then?.((t: number) => playerRef.current.seek(Math.max(0, t + secs)));
    } else if (type === 'youtube') {
      // YouTube doesn't have seekBy, we use seekTo with current time
      const newTime = Math.max(0, currentTime + secs);
      postYT('seekTo', [newTime, true]);
      setCurrentTime(newTime);
    }
  }, [type, postYT, currentTime]);

  const changeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (playerRef.current?.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed);
    } else if (type === 'youtube') postYT('setPlaybackRate', [speed]);
  }, [type, postYT]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Reset on URL change
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackSpeed(1);
    setShowSpeedMenu(false);
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-background border border-border group"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={resetHideTimer}
    >
      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="w-full h-full absolute inset-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ border: 0 }}
      />

      {/* Clickable overlay - blocks default player interaction */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Block YouTube end-screen cards/suggestions overlay */}
      <div className="absolute top-0 right-0 w-[120px] h-[40px] z-10 bg-transparent" />

      {/* Top gradient + title */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/80 to-transparent px-4 py-3 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <h3 className="text-xs md:text-sm font-medium text-foreground truncate">{title}</h3>
      </div>

      {/* Center play button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all shadow-lg hover:scale-110"
          >
            <Play className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground ml-0.5" />
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background/90 via-background/50 to-transparent transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Progress bar */}
        <div className="px-3 md:px-4 pt-4">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            className="h-1 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity"
            onValueChange={(val) => {
              setProgress(val[0]);
              if (duration > 0) {
                const newTime = (val[0] / 100) * duration;
                if (playerRef.current?.seek) playerRef.current.seek(newTime);
                else if (type === 'youtube') postYT('seekTo', [newTime, true]);
              }
            }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between px-3 md:px-4 py-1.5 md:py-2">
          <div className="flex items-center gap-0.5 md:gap-1">
            <button onClick={togglePlay} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              {isPlaying ? <Pause className="h-4 w-4 text-foreground" /> : <Play className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => seek('back')} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              <SkipBack className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button onClick={() => seek('forward')} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              <SkipForward className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button onClick={toggleMute} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-foreground" /> : <Volume2 className="h-3.5 w-3.5 text-foreground" />}
            </button>
            {duration > 0 && (
              <span className="text-[10px] md:text-xs text-muted-foreground ml-1 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 relative">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                className="p-1.5 hover:bg-muted/50 rounded-md transition-colors flex items-center gap-0.5"
              >
                <Settings className="h-3.5 w-3.5 text-foreground" />
                <span className="text-[10px] text-foreground font-medium">{playbackSpeed}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg p-1 shadow-xl min-w-[72px]">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); changeSpeed(s); }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors",
                        s === playbackSpeed ? "bg-primary/20 text-primary" : "hover:bg-muted/50 text-foreground"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              {isFullscreen ? <Minimize className="h-3.5 w-3.5 text-foreground" /> : <Maximize className="h-3.5 w-3.5 text-foreground" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
