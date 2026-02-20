import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon_color: string;
  sort_order: number;
}

export interface Subject {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface ContentItem {
  id: string;
  chapter_id: string;
  title: string;
  content_type: string;
  url: string;
  duration: string | null;
  sort_order: number;
  description: string | null;
}

export interface Note {
  id: string;
  user_id: string;
  content_id: string;
  note_text: string;
  timestamp_seconds: number | null;
  created_at: string;
}

export interface SavedLink {
  id: string;
  user_id: string;
  content_id: string | null;
  link_url: string;
  link_title: string | null;
  created_at: string;
}

// Queries
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order');
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useSubjects(categoryId?: string) {
  return useQuery({
    queryKey: ['subjects', categoryId],
    queryFn: async () => {
      let q = supabase.from('subjects').select('*').order('sort_order');
      if (categoryId) q = q.eq('category_id', categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Subject[];
    },
  });
}

export function useChapters(subjectId?: string) {
  return useQuery({
    queryKey: ['chapters', subjectId],
    queryFn: async () => {
      let q = supabase.from('chapters').select('*').order('sort_order');
      if (subjectId) q = q.eq('subject_id', subjectId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!subjectId,
  });
}

export function useContent(chapterId?: string) {
  return useQuery({
    queryKey: ['content', chapterId],
    queryFn: async () => {
      let q = supabase.from('content').select('*').order('sort_order');
      if (chapterId) q = q.eq('chapter_id', chapterId);
      const { data, error } = await q;
      if (error) throw error;
      return data as ContentItem[];
    },
    enabled: !!chapterId,
  });
}

export function useAllContent() {
  return useQuery({
    queryKey: ['all-content'],
    queryFn: async () => {
      const { data, error } = await supabase.from('content').select('*').order('sort_order');
      if (error) throw error;
      return data as ContentItem[];
    },
  });
}

export function useNotes(contentId?: string, userId?: string) {
  return useQuery({
    queryKey: ['notes', contentId, userId],
    queryFn: async () => {
      let q = supabase.from('notes').select('*').order('created_at', { ascending: false });
      if (contentId) q = q.eq('content_id', contentId);
      if (userId) q = q.eq('user_id', userId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!contentId && !!userId,
  });
}

export function useSavedLinks(userId?: string) {
  return useQuery({
    queryKey: ['saved-links', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('saved_links').select('*').eq('user_id', userId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as SavedLink[];
    },
    enabled: !!userId,
  });
}

// Full course tree for navigation
export function useCourseTree() {
  return useQuery({
    queryKey: ['course-tree'],
    queryFn: async () => {
      const [catRes, subRes, chapRes, contRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.from('chapters').select('*').order('sort_order'),
        supabase.from('content').select('*').order('sort_order'),
      ]);
      if (catRes.error) throw catRes.error;
      if (subRes.error) throw subRes.error;
      if (chapRes.error) throw chapRes.error;
      if (contRes.error) throw contRes.error;
      return {
        categories: catRes.data as Category[],
        subjects: subRes.data as Subject[],
        chapters: chapRes.data as Chapter[],
        content: contRes.data as ContentItem[],
      };
    },
  });
}

// Mutations
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; icon_color?: string; sort_order?: number }) => {
      const { error } = await supabase.from('categories').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; icon_color?: string; sort_order?: number }) => {
      const { error } = await supabase.from('categories').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { category_id: string; name: string; description?: string; sort_order?: number }) => {
      const { error } = await supabase.from('subjects').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; category_id?: string; sort_order?: number }) => {
      const { error } = await supabase.from('subjects').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { subject_id: string; name: string; description?: string; sort_order?: number }) => {
      const { error } = await supabase.from('chapters').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chapters'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useUpdateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string; subject_id?: string; sort_order?: number }) => {
      const { error } = await supabase.from('chapters').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chapters'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chapters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chapters'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useCreateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { chapter_id: string; title: string; content_type?: string; url: string; duration?: string; sort_order?: number; description?: string }) => {
      const { error } = await supabase.from('content').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['content'] }); qc.invalidateQueries({ queryKey: ['all-content'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; content_type?: string; url?: string; duration?: string; sort_order?: number; description?: string; chapter_id?: string }) => {
      const { error } = await supabase.from('content').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['content'] }); qc.invalidateQueries({ queryKey: ['all-content'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useDeleteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['content'] }); qc.invalidateQueries({ queryKey: ['all-content'] }); qc.invalidateQueries({ queryKey: ['course-tree'] }); },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { user_id: string; content_id: string; note_text: string; timestamp_seconds?: number }) => {
      const { error } = await supabase.from('notes').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); },
  });
}

export function useCreateSavedLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { user_id: string; content_id?: string; link_url: string; link_title?: string }) => {
      const { error } = await supabase.from('saved_links').insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-links'] }); },
  });
}

export function useDeleteSavedLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-links'] }); },
  });
}
