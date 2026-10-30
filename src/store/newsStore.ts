import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { publishedOr } from '../data/published';
import { news as seedNews } from '../data/news';
import type { NewsItem } from '../types';

/**
 * Новости живут в таблице public.news: администратор и тренеры пишут их
 * из кабинета, тренер правит только свои (ограничение в RLS).
 * Изменения приходят по realtime — лента обновляется без перезагрузки.
 *
 * Начальное значение — published.json: пререндер и первый рендер показывают
 * новости, не дожидаясь сети.
 */

interface NewsRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  image: string;
  author_id: string | null;
  author_name: string | null;
}

const COLUMNS = 'id,title,summary,content,date,category,image,author_id,author_name';

function fromRow(row: NewsRow): NewsItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? '',
    content: row.content ?? '',
    date: (row.date ?? '').slice(0, 10),
    category: row.category || 'Клуб',
    image: row.image ?? '',
    ...(row.author_id ? { authorId: row.author_id } : {}),
    ...(row.author_name ? { authorName: row.author_name } : {}),
  };
}

const listeners = new Set<() => void>();
const FALLBACK = publishedOr<NewsItem>('news', seedNews);
let cache: NewsItem[] = FALLBACK;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select(COLUMNS)
    .order('date', { ascending: false });

  if (error) throw error;
  cache = (data as NewsRow[]).map(fromRow);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadNews().catch(() => {
    /* нет сети — останутся данные из сборки, подписка догонит */
  });

  channel = supabase
    .channel('news-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
      void reloadNews().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNews(): NewsItem[] {
  ensureStarted();
  return cache;
}

export async function addNews(item: NewsItem): Promise<void> {
  const { error } = await supabase.from('news').insert({
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: item.content,
    date: item.date,
    category: item.category,
    image: item.image,
    author_id: item.authorId ?? null,
    author_name: item.authorName ?? '',
  });
  if (error) throw error;
  await reloadNews();
}

export async function updateNews(id: string, patch: Partial<NewsItem>): Promise<void> {
  const { error } = await supabase
    .from('news')
    .update({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      ...(patch.date !== undefined ? { date: patch.date } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.image !== undefined ? { image: patch.image } : {}),
    })
    .eq('id', id);
  if (error) throw error;
  await reloadNews();
}

export async function removeNews(id: string): Promise<void> {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
  await reloadNews();
}

export function resetNews() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
  started = false;
  cache = FALLBACK;
  emit();
}

export function useNews(): NewsItem[] {
  return useSyncExternalStore(subscribe, getNews, getNews);
}

export function useNewsItem(id: string | undefined): NewsItem | undefined {
  return useNews().find((n) => n.id === id);
}
