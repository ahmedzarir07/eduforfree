import { useMemo } from 'react';

function extractVideoId(url: string): { type: 'youtube' | 'vimeo' | 'custom'; embedUrl: string } {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&showinfo=0` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  return { type: 'custom', embedUrl: url };
}

interface VideoPlayerProps {
  url: string;
  title: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const { embedUrl } = useMemo(() => extractVideoId(url), [url]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="aspect-video rounded-xl overflow-hidden glass-card">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
