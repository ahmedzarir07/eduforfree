interface PdfViewerProps {
  url: string;
  title: string;
}

export default function PdfViewer({ url, title }: PdfViewerProps) {
  const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('pdf');

  if (!isPdf) {
    return (
      <div className="w-full max-w-3xl mx-auto glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm inline-flex items-center gap-2"
        >
          Open Resource →
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <span className="text-sm font-medium truncate">{title}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline shrink-0 ml-2"
          >
            Open in new tab ↗
          </a>
        </div>
        <iframe
          src={url}
          title={title}
          className="w-full h-[500px]"
        />
      </div>
    </div>
  );
}
