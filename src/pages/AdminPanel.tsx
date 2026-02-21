import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  useCategories, useSubjects, useChapters, useAllContent,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCreateSubject, useUpdateSubject, useDeleteSubject,
  useCreateChapter, useUpdateChapter, useDeleteChapter,
  useCreateContent, useUpdateContent, useDeleteContent,
  Category, Subject, Chapter, ContentItem,
} from '@/hooks/useCourseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Layers, FolderOpen, FileText, Video, Plus, Pencil, Trash2, ArrowLeft, BookOpen, GraduationCap, BarChart3, Eye } from 'lucide-react';

function FormDialog({ trigger, title, children, open, onOpenChange }: {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md glass-card border-0">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function AdminCategories() {
  const { data: categories = [] } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#10b981');
  const [sortOrder, setSortOrder] = useState(0);

  const reset = () => { setName(''); setDesc(''); setColor('#10b981'); setSortOrder(0); setEditId(null); };

  const handleSave = () => {
    const onSuccess = () => { setOpen(false); reset(); toast({ title: editId ? 'Updated' : 'Created' }); };
    const onError = (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' });
    if (editId) {
      update.mutate({ id: editId, name, description: desc, icon_color: color, sort_order: sortOrder }, { onSuccess, onError });
    } else {
      create.mutate({ name, description: desc, icon_color: color, sort_order: sortOrder }, { onSuccess, onError });
    }
  };

  const startEdit = (c: Category) => { setEditId(c.id); setName(c.name); setDesc(c.description || ''); setColor(c.icon_color); setSortOrder(c.sort_order); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Categories ({categories.length})</h3>
        <FormDialog
          open={open}
          onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}
          trigger={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add</Button>}
          title={editId ? 'Edit Category' : 'New Category'}
        >
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Color</Label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full" /></div>
              <div><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
            </div>
            <Button onClick={handleSave} disabled={!name.trim()} className="w-full">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </FormDialog>
      </div>
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg glass-panel">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.icon_color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name}</p>
              {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
            </div>
            <span className="text-[10px] text-muted-foreground">#{c.sort_order}</span>
            <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => { del.mutate(c.id); toast({ title: 'Deleted' }); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-xs text-muted-foreground italic">No categories yet.</p>}
      </div>
    </div>
  );
}

function AdminSubjects() {
  const { data: categories = [] } = useCategories();
  const { data: subjects = [] } = useSubjects();
  const create = useCreateSubject();
  const update = useUpdateSubject();
  const del = useDeleteSubject();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const reset = () => { setName(''); setDesc(''); setCategoryId(''); setSortOrder(0); setEditId(null); };

  const handleSave = () => {
    const onSuccess = () => { setOpen(false); reset(); toast({ title: editId ? 'Updated' : 'Created' }); };
    const onError = (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' });
    if (editId) {
      update.mutate({ id: editId, name, description: desc, category_id: categoryId, sort_order: sortOrder }, { onSuccess, onError });
    } else {
      create.mutate({ category_id: categoryId, name, description: desc, sort_order: sortOrder }, { onSuccess, onError });
    }
  };

  const startEdit = (s: Subject) => { setEditId(s.id); setName(s.name); setDesc(s.description || ''); setCategoryId(s.category_id); setSortOrder(s.sort_order); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Subjects ({subjects.length})</h3>
        <FormDialog
          open={open}
          onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}
          trigger={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add</Button>}
          title={editId ? 'Edit Subject' : 'New Subject'}
        >
          <div className="space-y-3">
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <div><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
            <Button onClick={handleSave} disabled={!name.trim() || !categoryId} className="w-full">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </FormDialog>
      </div>
      <div className="space-y-2">
        {subjects.map((s) => {
          const cat = categories.find((c) => c.id === s.category_id);
          return (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg glass-panel">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{cat?.name}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">#{s.sort_order}</span>
              <button onClick={() => startEdit(s)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => { del.mutate(s.id); toast({ title: 'Deleted' }); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          );
        })}
        {subjects.length === 0 && <p className="text-xs text-muted-foreground italic">No subjects yet.</p>}
      </div>
    </div>
  );
}

function AdminChapters() {
  const { data: subjects = [] } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState('');
  const { data: allChapters = [] } = useChapters(selectedSubject || undefined);
  const create = useCreateChapter();
  const update = useUpdateChapter();
  const del = useDeleteChapter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const reset = () => { setName(''); setDesc(''); setSortOrder(0); setEditId(null); };

  const handleSave = () => {
    if (!selectedSubject) return;
    const onSuccess = () => { setOpen(false); reset(); toast({ title: editId ? 'Updated' : 'Created' }); };
    const onError = (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' });
    if (editId) {
      update.mutate({ id: editId, name, description: desc, sort_order: sortOrder }, { onSuccess, onError });
    } else {
      create.mutate({ subject_id: selectedSubject, name, description: desc, sort_order: sortOrder }, { onSuccess, onError });
    }
  };

  const startEdit = (c: Chapter) => { setEditId(c.id); setName(c.name); setDesc(c.description || ''); setSortOrder(c.sort_order); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2"><FolderOpen className="h-4 w-4 text-accent" /> Chapters</h3>
        <FormDialog
          open={open}
          onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}
          trigger={<Button size="sm" className="gap-1.5" disabled={!selectedSubject}><Plus className="h-3.5 w-3.5" /> Add</Button>}
          title={editId ? 'Edit Chapter' : 'New Chapter'}
        >
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <div><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
            <Button onClick={handleSave} disabled={!name.trim()} className="w-full">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </FormDialog>
      </div>
      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
        <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
        <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
      </Select>
      <div className="space-y-2">
        {allChapters.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg glass-panel">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name}</p>
              {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
            </div>
            <span className="text-[10px] text-muted-foreground">#{c.sort_order}</span>
            <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => { del.mutate(c.id); toast({ title: 'Deleted' }); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {!selectedSubject && <p className="text-xs text-muted-foreground italic">Select a subject first.</p>}
        {selectedSubject && allChapters.length === 0 && <p className="text-xs text-muted-foreground italic">No chapters yet.</p>}
      </div>
    </div>
  );
}

function AdminContent() {
  const { data: subjects = [] } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState('');
  const { data: chaptersForSubject = [] } = useChapters(selectedSubject || undefined);
  const [selectedChapter, setSelectedChapter] = useState('');
  const { data: contentItems = [] } = useAllContent();
  const filteredContent = selectedChapter ? contentItems.filter((c) => c.chapter_id === selectedChapter) : [];
  const create = useCreateContent();
  const update = useUpdateContent();
  const del = useDeleteContent();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [contentType, setContentType] = useState('video');
  const [desc, setDesc] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const reset = () => { setTitle(''); setUrl(''); setDuration(''); setContentType('video'); setDesc(''); setSortOrder(0); setEditId(null); };

  const handleSave = () => {
    if (!selectedChapter) return;
    const onSuccess = () => { setOpen(false); reset(); toast({ title: editId ? 'Updated' : 'Created' }); };
    const onError = (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' });
    if (editId) {
      update.mutate({ id: editId, title, url, duration, content_type: contentType, description: desc, sort_order: sortOrder }, { onSuccess, onError });
    } else {
      create.mutate({ chapter_id: selectedChapter, title, url, duration, content_type: contentType, description: desc, sort_order: sortOrder }, { onSuccess, onError });
    }
  };

  const startEdit = (c: ContentItem) => {
    setEditId(c.id); setTitle(c.title); setUrl(c.url); setDuration(c.duration || '');
    setContentType(c.content_type); setDesc(c.description || ''); setSortOrder(c.sort_order); setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2"><Video className="h-4 w-4 text-info" /> Content</h3>
        <FormDialog
          open={open}
          onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}
          trigger={<Button size="sm" className="gap-1.5" disabled={!selectedChapter}><Plus className="h-3.5 w-3.5" /> Add</Button>}
          title={editId ? 'Edit Content' : 'New Content'}
        >
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div>
              <Label>Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="resource">Resource/PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>URL / Embed Link</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={contentType === 'video' ? 'YouTube/Vimeo URL' : 'PDF or resource URL'} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Duration</Label><Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 15:30" /></div>
              <div><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <Button onClick={handleSave} disabled={!title.trim() || !url.trim()} className="w-full">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </FormDialog>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setSelectedChapter(''); }}>
          <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject}>
          <SelectTrigger><SelectValue placeholder="Chapter" /></SelectTrigger>
          <SelectContent>{chaptersForSubject.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        {filteredContent.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg glass-panel">
            {c.content_type === 'video' ? <Video className="h-4 w-4 text-primary shrink-0" /> : <FileText className="h-4 w-4 text-info shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.title}</p>
              <div className="flex items-center gap-2">
                {c.duration && <span className="text-xs text-muted-foreground">{c.duration}</span>}
                <span className="text-[10px] text-muted-foreground">#{c.sort_order}</span>
              </div>
            </div>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-info"><Eye className="h-3.5 w-3.5" /></a>
            <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => { del.mutate(c.id); toast({ title: 'Deleted' }); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {!selectedChapter && <p className="text-xs text-muted-foreground italic">Select subject & chapter first.</p>}
        {selectedChapter && filteredContent.length === 0 && <p className="text-xs text-muted-foreground italic">No content yet.</p>}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: subjects = [] } = useSubjects();
  const { data: content = [] } = useAllContent();

  const videoCount = content.filter(c => c.content_type === 'video').length;
  const resourceCount = content.filter(c => c.content_type !== 'video').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Admin Panel</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-xs">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </Button>
      </header>

      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div><p className="text-2xl font-bold">{categories.length}</p><p className="text-[10px] text-muted-foreground">Categories</p></div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <div><p className="text-2xl font-bold">{subjects.length}</p><p className="text-[10px] text-muted-foreground">Subjects</p></div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/15 flex items-center justify-center">
              <Video className="h-5 w-5 text-info" />
            </div>
            <div><p className="text-2xl font-bold">{videoCount}</p><p className="text-[10px] text-muted-foreground">Videos</p></div>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gold/15 flex items-center justify-center">
              <FileText className="h-5 w-5 text-gold" />
            </div>
            <div><p className="text-2xl font-bold">{resourceCount}</p><p className="text-[10px] text-muted-foreground">Resources</p></div>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="glass-card rounded-xl p-4 md:p-6">
          <Tabs defaultValue="categories">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs">Subjects</TabsTrigger>
              <TabsTrigger value="chapters" className="text-xs">Chapters</TabsTrigger>
              <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="categories"><AdminCategories /></TabsContent>
              <TabsContent value="subjects"><AdminSubjects /></TabsContent>
              <TabsContent value="chapters"><AdminChapters /></TabsContent>
              <TabsContent value="content"><AdminContent /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
