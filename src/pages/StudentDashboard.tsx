import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourseTree, ContentItem } from '@/hooks/useCourseData';
import VideoPlayer from '@/components/VideoPlayer';
import CourseNavigation from '@/components/CourseNavigation';
import NotesAndLinks from '@/components/NotesAndLinks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, BookOpen, Menu, X } from 'lucide-react';
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
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-muted-foreground hover:text-foreground">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">EduPlatform</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" /> Admin
            </Button>
          )}
          <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {activeContent ? (
            <>
              {activeContent.content_type === 'video' ? (
                <VideoPlayer url={activeContent.url} title={activeContent.title} />
              ) : (
                <div className="p-6 rounded-lg bg-card border border-border">
                  <h2 className="text-lg font-semibold mb-2">{activeContent.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{activeContent.description}</p>
                  <a href={activeContent.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                    Open Resource →
                  </a>
                </div>
              )}

              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-medium text-sm mb-1">{activeContent.title}</h3>
                {activeContent.duration && <p className="text-xs text-muted-foreground mb-3">Duration: {activeContent.duration}</p>}
                {activeContent.description && <p className="text-sm text-muted-foreground">{activeContent.description}</p>}
              </div>

              <div className="bg-card rounded-lg border border-border p-4">
                <NotesAndLinks contentId={activeContent.id} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Welcome to EduPlatform</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select a lesson from the course navigation to start learning.
              </p>
            </div>
          )}
        </main>

        {/* Right sidebar - course navigation */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          fixed md:relative right-0 top-0 md:top-auto h-full md:h-auto
          w-80 border-l border-border bg-card overflow-hidden z-30
          transition-transform duration-200
        `}>
          <div className="p-4 border-b border-border">
            <Tabs defaultValue="content">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1 text-xs">Course Content</TabsTrigger>
                <TabsTrigger value="outline" className="flex-1 text-xs">Outline</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-3">
                <CourseNavigation
                  categories={categories}
                  subjects={subjects}
                  chapters={chapters}
                  content={content}
                  activeContentId={activeContent?.id}
                  onSelectContent={(item) => { setActiveContent(item); setSidebarOpen(false); }}
                />
              </TabsContent>
              <TabsContent value="outline" className="mt-3">
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.icon_color }} />
                        {cat.name}
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">{cat.description}</p>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-xs text-muted-foreground italic">No courses available yet.</p>}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-background/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}
