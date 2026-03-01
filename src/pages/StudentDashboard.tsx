import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourseTree, ContentItem } from '@/hooks/useCourseData';
import VideoPlayer from '@/components/VideoPlayer';
import CourseNavigation from '@/components/CourseNavigation';
import NotesAndLinks from '@/components/NotesAndLinks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Settings, BookOpen, Menu, X, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StudentDashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: tree, isLoading } = useCourseTree();
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll to top of main content when selecting a lesson on mobile
  useEffect(() => {
    if (activeContent && isMobile && mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeContent, isMobile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-[300px] md:h-[400px] flex-1" />
          <Skeleton className="h-[200px] md:h-[400px] w-full md:w-80" />
        </div>
      </div>
    );
  }

  const { categories = [], subjects = [], chapters = [], content = [] } = tree || {};

  const navigationContent = (
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
  );

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">EduPlatform</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-1.5 text-xs h-8 px-2">
              <Settings className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          <span className="text-xs text-muted-foreground hidden md:inline max-w-[120px] truncate">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-xs h-8 px-2">
            <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <main ref={mainRef} className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-3 md:p-6 space-y-3 md:space-y-4 pb-20 md:pb-6">
            {activeContent ? (
              <>
                {activeContent.content_type === 'video' ? (
                  <VideoPlayer url={activeContent.url} title={activeContent.title} />
                ) : (
                  <div className="p-4 md:p-6 rounded-xl bg-card border border-border">
                    <h2 className="text-base md:text-lg font-semibold mb-2">{activeContent.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{activeContent.description}</p>
                    <a href={activeContent.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      Open Resource →
                    </a>
                  </div>
                )}

                <div className="bg-card rounded-xl border border-border p-3 md:p-4">
                  <h3 className="font-medium text-sm mb-1">{activeContent.title}</h3>
                  {activeContent.duration && <p className="text-xs text-muted-foreground mb-2">Duration: {activeContent.duration}</p>}
                  {activeContent.description && <p className="text-xs md:text-sm text-muted-foreground">{activeContent.description}</p>}
                </div>

                <div className="bg-card rounded-xl border border-border p-3 md:p-4">
                  <NotesAndLinks contentId={activeContent.id} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[50dvh] md:min-h-[400px] text-center px-4">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h2 className="text-base md:text-lg font-semibold mb-2">Welcome to EduPlatform</h2>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm">
                  Select a lesson from the course navigation to start learning.
                </p>
                {isMobile && (
                  <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-4 w-4" /> Browse Courses
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside className="w-80 border-l border-border bg-card shrink-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4">
                {navigationContent}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Mobile bottom sheet */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="bottom" className="h-[75dvh] rounded-t-2xl p-0">
              <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
                <SheetTitle className="text-sm">Course Navigation</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(75dvh-60px)]">
                <div className="p-4">
                  {navigationContent}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Mobile floating action button for course nav */}
      {isMobile && activeContent && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
