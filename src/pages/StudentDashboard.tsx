import { useState } from 'react';
import { useCourseTree, ContentItem } from '@/hooks/useCourseData';
import VideoPlayer from '@/components/VideoPlayer';
import PdfViewer from '@/components/PdfViewer';
import CourseNavigation from '@/components/CourseNavigation';
import { BookOpen, Menu, X, GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboard() {
  const { data: tree, isLoading } = useCourseTree();
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-[400px] flex-1" />
          <Skeleton className="h-[400px] w-80" />
        </div>
      </div>
    );
  }

  const { categories = [], subjects = [], chapters = [], content = [] } = tree || {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Glass Header */}
      <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">EduPlatform</span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">Free Learning</span>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">Open Course Platform</span>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeContent ? (
            <div className="space-y-4 animate-fade-in">
              {activeContent.content_type === 'video' ? (
                <VideoPlayer url={activeContent.url} title={activeContent.title} />
              ) : (
                <PdfViewer url={activeContent.url} title={activeContent.title} />
              )}

              {/* Content info card */}
              <div className="max-w-3xl mx-auto glass-card rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1">{activeContent.title}</h3>
                {activeContent.duration && (
                  <span className="text-xs text-muted-foreground">Duration: {activeContent.duration}</span>
                )}
                {activeContent.description && (
                  <p className="text-sm text-muted-foreground mt-2">{activeContent.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 glass-card">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome to EduPlatform</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select a lesson from the course navigation to start learning. It's completely free!
              </p>
            </div>
          )}
        </main>

        {/* Right sidebar - glass course navigation */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          fixed md:relative right-0 top-0 md:top-auto h-full md:h-auto
          w-80 glass-sidebar overflow-hidden z-30
          transition-transform duration-200
        `}>
          <div className="p-4 border-b border-border/30">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Course Content
            </h2>
          </div>
          <div className="p-3 overflow-y-auto h-[calc(100%-52px)]">
            <CourseNavigation
              categories={categories}
              subjects={subjects}
              chapters={chapters}
              content={content}
              activeContentId={activeContent?.id}
              onSelectContent={(item) => { setActiveContent(item); setSidebarOpen(false); }}
            />
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}
