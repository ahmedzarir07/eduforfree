import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotes, useCreateNote, useDeleteNote, useSavedLinks, useCreateSavedLink, useDeleteSavedLink } from '@/hooks/useCourseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, ExternalLink, StickyNote, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesAndLinksProps {
  contentId?: string;
}

export default function NotesAndLinks({ contentId }: NotesAndLinksProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: notes = [] } = useNotes(contentId, user?.id);
  const { data: savedLinks = [] } = useSavedLinks(user?.id);
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const createLink = useCreateSavedLink();
  const deleteLink = useDeleteSavedLink();

  const [noteText, setNoteText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const handleAddNote = () => {
    if (!noteText.trim() || !contentId || !user) return;
    createNote.mutate({ user_id: user.id, content_id: contentId, note_text: noteText.trim() }, {
      onSuccess: () => { setNoteText(''); toast({ title: 'Note saved' }); },
      onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
    });
  };

  const handleAddLink = () => {
    if (!linkUrl.trim() || !user) return;
    createLink.mutate({ user_id: user.id, content_id: contentId, link_url: linkUrl.trim(), link_title: linkTitle.trim() || undefined }, {
      onSuccess: () => { setLinkUrl(''); setLinkTitle(''); toast({ title: 'Link saved' }); },
      onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
    });
  };

  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="notes" className="flex-1 gap-1.5"><StickyNote className="h-3.5 w-3.5" /> Notes</TabsTrigger>
        <TabsTrigger value="links" className="flex-1 gap-1.5"><Link2 className="h-3.5 w-3.5" /> Saved Links</TabsTrigger>
      </TabsList>
      <TabsContent value="notes" className="space-y-3 mt-3">
        {contentId ? (
          <>
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
            <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Note
            </Button>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className="flex items-start gap-2 p-2.5 rounded-md bg-surface text-sm">
                  <span className="flex-1">{n.note_text}</span>
                  <button onClick={() => deleteNote.mutate(n.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {notes.length === 0 && <p className="text-xs text-muted-foreground italic">No notes yet for this lesson.</p>}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">Select a lesson to take notes.</p>
        )}
      </TabsContent>
      <TabsContent value="links" className="space-y-3 mt-3">
        <div className="flex gap-2">
          <Input placeholder="URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="text-sm" />
          <Input placeholder="Title (optional)" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} className="text-sm" />
        </div>
        <Button size="sm" onClick={handleAddLink} disabled={!linkUrl.trim()} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Save Link
        </Button>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {savedLinks.map((l) => (
            <div key={l.id} className="flex items-center gap-2 p-2.5 rounded-md bg-surface text-sm">
              <ExternalLink className="h-3.5 w-3.5 text-info shrink-0" />
              <a href={l.link_url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate hover:text-primary transition-colors">
                {l.link_title || l.link_url}
              </a>
              <button onClick={() => deleteLink.mutate(l.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {savedLinks.length === 0 && <p className="text-xs text-muted-foreground italic">No saved links yet.</p>}
        </div>
      </TabsContent>
    </Tabs>
  );
}
