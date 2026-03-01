import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

function extractVideoId(url: string): { type: 'youtube' | 'vimeo' | 'custom'; embedUrl: string; videoId?: string } {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    return {
      type: 'youtube',
      videoId: ytMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&enablejsapi=1&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`,
    };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?controls=0&title=0&byline=0&portrait=0`,
    };
  }
  return { type: 'custom', embedUrl: url };
}

interface VideoPlayerProps {
  url: string;
  title: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const { embedUrl, type } = useMemo(() => extractVideoId(url), [url]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

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

  const postMessage = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), '*');
  }, []);

  const togglePlay = useCallback(() => {
    if (type === 'youtube') {
      postMessage({ event: 'command', func: isPlaying ? 'pauseVideo' : 'playVideo' });
    } else if (type === 'vimeo') {
      postMessage({ method: isPlaying ? 'pause' : 'play' });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, type, postMessage]);

  const toggleMute = useCallback(() => {
    if (type === 'youtube') {
      postMessage({ event: 'command', func: isMuted ? 'unMute' : 'mute' });
    } else if (type === 'vimeo') {
      postMessage({ method: 'setVolume', value: isMuted ? 1 : 0 });
    }
    setIsMuted(!isMuted);
  }, [isMuted, type, postMessage]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const seek = useCallback((direction: 'forward' | 'back') => {
    const seconds = direction === 'forward' ? 10 : -10;
    if (type === 'youtube') {
      postMessage({ event: 'command', func: 'seekBy', args: [seconds] });
    }
  }, [type, postMessage]);

  const changeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (type === 'youtube') {
      postMessage({ event: 'command', func: 'setPlaybackRate', args: [speed] });
    }
  }, [type, postMessage]);

  // Reset state when URL changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
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
      />

      {/* Clickable overlay to toggle play */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Top gradient + title */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/80 to-transparent px-4 py-3 transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <h3 className="text-sm font-medium text-foreground truncate">{title}</h3>
      </div>

      {/* Center play button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all shadow-lg hover:scale-110"
          >
            <Play className="h-7 w-7 text-primary-foreground ml-1" />
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background/90 via-background/50 to-transparent transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        {/* Progress bar */}
        <div className="px-4 pt-4">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            className="h-1 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100 [&_[role=slider]]:transition-opacity"
            onValueChange={(val) => setProgress(val[0])}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1">
            <button onClick={togglePlay} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              {isPlaying ? <Pause className="h-4 w-4 text-foreground" /> : <Play className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => seek('back')} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              <SkipBack className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={() => seek('forward')} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              <SkipForward className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={toggleMute} className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
              {isMuted ? <VolumeX className="h-4 w-4 text-foreground" /> : <Volume2 className="h-4 w-4 text-foreground" />}
            </button>
          </div>

          <div className="flex items-center gap-1 relative">
            {/* Speed control */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                className="p-1.5 hover:bg-muted/50 rounded-md transition-colors flex items-center gap-1"
              >
                <Settings className="h-3.5 w-3.5 text-foreground" />
                <span className="text-[10px] text-foreground font-medium">{playbackSpeed}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg p-1 shadow-xl min-w-[80px]">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); changeSpeed(s); }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors",
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
              {isFullscreen ? <Minimize className="h-4 w-4 text-foreground" /> : <Maximize className="h-4 w-4 text-foreground" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
