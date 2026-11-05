import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { publishedOr } from '../data/published';
import { testimonials as seedTestimonials } from '../data/news';
import type { Testimonial } from '../types';

/**
 * Отзывы живут в таблице public.testimonials.
 *
 * Раньше админка писала в localStorage — это память одного браузера, поэтому
 * добавленные отзывы не появлялись у других посетителей. Теперь запись
 * уходит в базу, realtime-подписка разносит её по всем открытым страницам.
 *
 * Начальное значение — published.json: пререндер и первый рендер показывают
 * отзывы, не дожидаясь сети.
 */

interface TestimonialRow {
  id: string;
  name: string;
  photo: string;
  text: string;
  achievement: string;
  direction: string;
}

const COLUMNS =
  'id,name,photo,text,achievement,direction';

function fromRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo ?? '',
    text: row.text ?? '',
    achievement: row.achievement ?? '',
    direction: row.direction ?? '',
  };
}

function toRow(t: Testimonial): TestimonialRow {
  return {
    id: t.id,
    name: t.name,
    photo: t.photo,
    text: t.text,
    achievement: t.achievement,
    direction: t.direction,
  };
}

const listeners = new Set<() => void>();
const FALLBACK = publishedOr<Testimonial>('testimonials', seedTestimonials);
let cache: Testimonial[] = FALLBACK;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select(COLUMNS)
    .order('created_at', { ascending: true });

  if (error) throw error;
  cache = (data as TestimonialRow[]).map(fromRow);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadTestimonials().catch(() => {
    /* нет сети — останутся данные из сборки, подписка догонит */
  });

  channel = supabase
    .channel('testimonials-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
      void reloadTestimonials().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function get(): Testimonial[] {
  ensureStarted();
  return cache;
}

export const testimonialsStore = {
  get,
  add: async (item: Testimonial): Promise<void> => {
    const { error } = await supabase.from('testimonials').insert(toRow(item));
    if (error) throw error;
    await reloadTestimonials();
  },
  update: async (id: string, patch: Partial<Testimonial>): Promise<void> => {
    const current = cache.find((t) => t.id === id);
    if (!current) return;
    const { error } = await supabase
      .from('testimonials')
      .update(toRow({ ...current, ...patch }))
      .eq('id', id);
    if (error) throw error;
    await reloadTestimonials();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    await reloadTestimonials();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = FALLBACK;
    emit();
  },
};

/** Реактивный список отзывов: изменения сразу видны на публичных страницах */
export function useTestimonials(): Testimonial[] {
  return useSyncExternalStore(subscribe, get, get);
}
