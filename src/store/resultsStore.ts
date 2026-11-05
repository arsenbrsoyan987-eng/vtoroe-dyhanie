import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { publishedOr } from '../data/published';
import { results as seedResults } from '../data/news';
import type { SportResult } from '../types';

/**
 * Публичные спортивные результаты живут в таблице public.sport_results.
 *
 * Раньше админка писала в localStorage — это память одного браузера, поэтому
 * добавленные результаты не появлялись у других посетителей. Теперь запись
 * уходит в базу, realtime-подписка разносит её по всем открытым страницам.
 *
 * Начальное значение — published.json: пререндер и первый рендер показывают
 * результаты, не дожидаясь сети.
 */

interface SportResultRow {
  id: string;
  athlete_name: string;
  event: string;
  date: string;
  discipline: string;
  result: string;
  place: string;
  protocol_url: string;
}

const COLUMNS =
  'id,athlete_name,event,date,discipline,result,place,protocol_url';

function fromRow(row: SportResultRow): SportResult {
  return {
    id: row.id,
    athleteName: row.athlete_name,
    event: row.event ?? '',
    date: (row.date ?? '').slice(0, 10),
    discipline: row.discipline ?? '',
    result: row.result ?? '',
    place: row.place ?? '',
    protocolUrl: row.protocol_url ?? '',
  };
}

function toRow(r: SportResult): SportResultRow {
  return {
    id: r.id,
    athlete_name: r.athleteName,
    event: r.event,
    date: r.date,
    discipline: r.discipline,
    result: r.result,
    place: r.place,
    protocol_url: r.protocolUrl ?? '',
  };
}

const listeners = new Set<() => void>();
const FALLBACK = publishedOr<SportResult>('results', seedResults);
let cache: SportResult[] = FALLBACK;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadResults(): Promise<SportResult[]> {
  const { data, error } = await supabase
    .from('sport_results')
    .select(COLUMNS)
    .order('date', { ascending: false });

  if (error) throw error;
  cache = (data as SportResultRow[]).map(fromRow);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadResults().catch(() => {
    /* нет сети — останутся данные из сборки, подписка догонит */
  });

  channel = supabase
    .channel('results-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sport_results' }, () => {
      void reloadResults().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function get(): SportResult[] {
  ensureStarted();
  return cache;
}

export const resultsStore = {
  get,
  add: async (item: SportResult): Promise<void> => {
    const { error } = await supabase.from('sport_results').insert(toRow(item));
    if (error) throw error;
    await reloadResults();
  },
  update: async (id: string, patch: Partial<SportResult>): Promise<void> => {
    const current = cache.find((r) => r.id === id);
    if (!current) return;
    const { error } = await supabase
      .from('sport_results')
      .update(toRow({ ...current, ...patch }))
      .eq('id', id);
    if (error) throw error;
    await reloadResults();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('sport_results').delete().eq('id', id);
    if (error) throw error;
    await reloadResults();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = FALLBACK;
    emit();
  },
};

/** Реактивный список результатов: изменения сразу видны на публичных страницах */
export function useResults(): SportResult[] {
  return useSyncExternalStore(subscribe, get, get);
}