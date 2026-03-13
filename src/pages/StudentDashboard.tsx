import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourseTree, ContentItem } from '@/hooks/useCourseData';
import VideoPlayer from '@/components/VideoPlayer';
import CourseNavigation from '@/components/CourseNavigation';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, GraduationCap, Menu, X, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: tree, isLoading } = useCourseTree();
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-[500px] flex-1 rounded-xl" />
          <Skeleton className="h-[500px] w-80 rounded-xl hidden md:block" />
        </div>
      </div>
    );
  }

  const { categories = [], subjects = [], chapters = [], content = [] } = tree || {};

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm tracking-tight hidden sm:inline">EduForFree</span>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Settings className="h-3.5 w-3.5" /> Admin
            </Button>
          )}
          <span className="text-xs text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {activeContent ? (
            <div className="space-y-0">
              {activeContent.content_type === 'video' ? (
                <VideoPlayer url={activeContent.url} title={activeContent.title} />
              ) : (
                <div className="p-6 md:mx-4 md:mt-4 md:rounded-xl bg-card border-b md:border border-border/50">
                  <h2 className="text-lg font-semibold mb-2">{activeContent.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{activeContent.description}</p>
                  <a href={activeContent.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-medium">
                    Open Resource →
                  </a>
                </div>
              )}

              {/* Lesson info */}
              <div className="border-b md:border md:border-border/50 md:rounded-xl p-4 md:mx-4 md:mt-3 bg-card/50">
                <h3 className="font-medium text-sm">{activeContent.title}</h3>
                {activeContent.duration && <p className="text-xs text-muted-foreground mt-1">Duration: {activeContent.duration}</p>}
                {activeContent.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{activeContent.description}</p>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
                <GraduationCap className="h-10 w-10 text-primary/60" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to EduForFree</h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Select a lesson from the course navigation to start learning. Tap the menu icon to browse courses.
              </p>
            </div>
          )}
        </main>

        {/* Right sidebar - course navigation (desktop always visible) */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          fixed md:relative right-0 top-14 md:top-auto bottom-0 md:bottom-auto
          w-80 border-l border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden z-30
          transition-transform duration-200 ease-out flex flex-col
        `}>
          {/* Sidebar header with back button */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setActiveContent(null); setSidebarOpen(false); }}
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-surface transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="font-semibold text-sm">Course Content</h3>
              </div>
              <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full">
                {content.length} lessons
              </span>
            </div>
          </div>

          {/* Course tree */}
          <div className="flex-1 overflow-y-auto p-2">
            <CourseNavigation
              categories={categories}
              subjects={subjects}
              chapters={chapters}
              content={content}
              activeContentId={activeContent?.id}
              onSelectContent={(item) => { setActiveContent(item); setSidebarOpen(false); }}
            />
          </div>

          {/* Mobile footer with logout + admin */}
          <div className="md:hidden border-t border-border/50 p-3 space-y-1">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <Settings className="h-4 w-4" /> Admin Panel
              </button>
            )}
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-surface transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 top-14 bg-background/60 backdrop-blur-sm z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}
