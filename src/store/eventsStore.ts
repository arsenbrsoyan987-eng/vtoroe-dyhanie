import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { publishedOr } from '../data/published';
import { events as seedEvents } from '../data/events';
import type { Event } from '../types';

/**
 * Мероприятия живут в таблице public.events.
 *
 * Раньше админка писала в localStorage — это память одного браузера, поэтому
 * добавленные события не появлялись у других посетителей. Теперь запись
 * уходит в базу, realtime-подписка разносит её по всем открытым страницам.
 *
 * Начальное значение — published.json: пререндер и первый рендер показывают
 * мероприятия, не дожидаясь сети.
 */

interface EventRow {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  full_description: string;
  images: string[] | null;
  registration_open: boolean;
  registration_deadline: string | null;
  price: string;
  requirements: string[] | null;
}

const COLUMNS =
  'id,name,category,date,time,location,description,full_description,images,registration_open,registration_deadline,price,requirements';

function fromRow(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    category: (row.category || 'competition') as Event['category'],
    date: (row.date ?? '').slice(0, 10),
    time: row.time ?? '',
    location: row.location ?? '',
    description: row.description ?? '',
    fullDescription: row.full_description ?? '',
    images: row.images ?? [],
    registrationOpen: Boolean(row.registration_open),
    registrationDeadline: (row.registration_deadline ?? '').slice(0, 10),
    price: row.price ?? '',
    requirements: row.requirements ?? [],
  };
}

function toRow(e: Event): EventRow {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    date: e.date,
    time: e.time,
    location: e.location,
    description: e.description,
    full_description: e.fullDescription,
    images: e.images,
    registration_open: e.registrationOpen,
    registration_deadline: e.registrationDeadline || null,
    price: e.price,
    requirements: e.requirements,
  };
}

const listeners = new Set<() => void>();
const FALLBACK = publishedOr<Event>('events', seedEvents);
let cache: Event[] = FALLBACK;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(COLUMNS)
    .order('date', { ascending: false });

  if (error) throw error;
  cache = (data as EventRow[]).map(fromRow);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadEvents().catch(() => {
    /* нет сети — останутся данные из сборки, подписка догонит */
  });

  channel = supabase
    .channel('events-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
      void reloadEvents().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function get(): Event[] {
  ensureStarted();
  return cache;
}

export const eventsStore = {
  get,
  add: async (event: Event): Promise<void> => {
    const { error } = await supabase.from('events').insert(toRow(event));
    if (error) throw error;
    await reloadEvents();
  },
  update: async (id: string, patch: Partial<Event>): Promise<void> => {
    const current = cache.find((e) => e.id === id);
    if (!current) return;
    const { error } = await supabase
      .from('events')
      .update(toRow({ ...current, ...patch }))
      .eq('id', id);
    if (error) throw error;
    await reloadEvents();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    await reloadEvents();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = FALLBACK;
    emit();
  },
};

/** Реактивный список мероприятий: изменения сразу видны на всех страницах */
export function useEvents(): Event[] {
  return useSyncExternalStore(subscribe, get, get);
}