/**
 * Страницы сайта — произвольные страницы, которые администратор создаёт
 * и редактирует из кабинета. Примеры: «О школе», «Контакты», «Политика
 * конфиденциальности», «Как записаться» и т.д.
 *
 * Хранятся в таблице public.pages с RLS: все читают, администратор
 * вставляет, обновляет и удаляет.
 */
import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';

export interface Page {
  id: string;
  slug: string;
  title: string;
  heroImage?: string;
  content: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PageRow {
  id: string;
  slug: string;
  title: string;
  hero_image: string;
  content: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const COLUMNS = [
  'id', 'slug', 'title', 'hero_image', 'content',
  'published', 'sort_order', 'created_at', 'updated_at',
].join(',');

function fromRow(row: PageRow): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    heroImage: row.hero_image || '',
    content: row.content,
    published: row.published,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const listeners = new Set<() => void>();
let cache: Page[] | null = null;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function getCache(): Page[] {
  if (!cache) cache = [];
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadPages(): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select(COLUMNS)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  cache = (data as unknown as PageRow[] | undefined)?.map(fromRow) ?? [];
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadPages().catch(() => { /* нет сети — пустой список */ });

  channel = supabase
    .channel('pages-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pages' },
      () => { void reloadPages().catch(() => {}); }
    )
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getPages(): Page[] {
  ensureStarted();
  return getCache();
}

export const pagesStore = {
  get: getPages,
  reload: reloadPages,
  /** Создать страницу и вернуть её с заполненным sort_order */
  create: async (input: Partial<Page>): Promise<Page> => {
    const now = new Date().toISOString();
    const id = 'page-' + Date.now();
    const row: Record<string, unknown> = {
      id,
      slug: input.slug ?? '',
      title: input.title ?? '',
      hero_image: input.heroImage ?? '',
      content: input.content ?? '',
      published: input.published ?? true,
      sort_order: 0,
      created_at: now,
      updated_at: now,
    };
    // Определим sort_order: 1 + текущее кол-во записей
    const { data: existing } = await supabase
      .from('pages')
      .select('id', { count: 'exact' });
    row.sort_order = (existing?.length ?? 0) + 1;

    const { error } = await supabase.from('pages').insert(row);
    if (error) throw error;
    await reloadPages();
    return { ...row, ...input } as Page;
  },
  update: async (id: string, patch: Partial<Page>): Promise<void> => {
    const { error } = await supabase
      .from('pages')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await reloadPages();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (error) throw error;
    await reloadPages();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = null;
    emit();
  },
};

export function usePages(): Page[] {
  return useSyncExternalStore(subscribe, getPages, getPages);
}
