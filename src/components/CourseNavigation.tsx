import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Play, FileText, FolderOpen, BookOpen } from 'lucide-react';
import { Category, Subject, Chapter, ContentItem } from '@/hooks/useCourseData';

interface CourseNavigationProps {
  categories: Category[];
  subjects: Subject[];
  chapters: Chapter[];
  content: ContentItem[];
  activeContentId?: string;
  onSelectContent: (item: ContentItem) => void;
}

export default function CourseNavigation({
  categories, subjects, chapters, content,
  activeContentId, onSelectContent,
}: CourseNavigationProps) {
  return (
    <div className="h-full overflow-y-auto">
      <Accordion type="multiple" className="space-y-0.5">
        {categories.map((cat) => {
          const catSubjects = subjects.filter((s) => s.category_id === cat.id);
          return (
            <AccordionItem key={cat.id} value={cat.id} className="border-none">
              <AccordionTrigger className="px-3 py-2.5 rounded-lg hover:bg-surface-hover hover:no-underline text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.icon_color }} />
                  {cat.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4 pb-0">
                <Accordion type="multiple" className="space-y-0.5">
                  {catSubjects.map((sub) => {
                    const subChapters = chapters.filter((c) => c.subject_id === sub.id);
                    return (
                      <AccordionItem key={sub.id} value={sub.id} className="border-none">
                        <AccordionTrigger className="px-3 py-2 rounded-md hover:bg-surface-hover hover:no-underline text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                            {sub.name}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4 pb-0">
                          <Accordion type="multiple" className="space-y-0.5">
                            {subChapters.map((chap) => {
                              const chapContent = content.filter((c) => c.chapter_id === chap.id);
                              return (
                                <AccordionItem key={chap.id} value={chap.id} className="border-none">
                                  <AccordionTrigger className="px-3 py-1.5 rounded-md hover:bg-surface-hover hover:no-underline text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <FolderOpen className="h-3 w-3 text-accent" />
                                      {chap.name}
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pl-2 pb-0">
                                    <div className="space-y-0.5">
                                      {chapContent.map((item) => (
                                        <button
                                          key={item.id}
                                          onClick={() => onSelectContent(item)}
                                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors text-left ${
                                            activeContentId === item.id
                                              ? 'active-lesson gold-glow'
                                              : 'hover:bg-surface-hover text-muted-foreground hover:text-foreground'
                                          }`}
                                        >
                                          {item.content_type === 'video' ? (
                                            <Play className="h-3 w-3 shrink-0 text-primary" />
                                          ) : (
                                            <FileText className="h-3 w-3 shrink-0 text-info" />
                                          )}
                                          <span className="flex-1 truncate">{item.title}</span>
                                          {item.duration && (
                                            <span className="text-[10px] text-muted-foreground shrink-0">{item.duration}</span>
                                          )}
                                        </button>
                                      ))}
                                      {chapContent.length === 0 && (
                                        <p className="px-3 py-2 text-xs text-muted-foreground italic">No content yet</p>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                            {subChapters.length === 0 && (
                              <p className="px-3 py-2 text-xs text-muted-foreground italic">No chapters yet</p>
                            )}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                  {catSubjects.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground italic">No subjects yet</p>
                  )}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
