/**
 * Маршруты — публичные данные, которые администратор правит из кабинета.
 *
 * Хранятся в таблице public.routes с RLS: все читают, администратор
 * вставляет, обновляет и удаляет.
 */
import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import type { Route } from '../types';

interface RouteRow {
  id: string;
  name: string;
  type: string;
  image: string;
  distance: string;
  elevation: string;
  duration: string;
  difficulty: string;
  description: string;
  start_point: string;
  map_url: string;
  gpx_url: string;
  sort_order: number;
}

const COLUMNS = [
  'id', 'name', 'type', 'image', 'distance', 'elevation',
  'duration', 'difficulty', 'description', 'start_point',
  'map_url', 'gpx_url', 'sort_order',
].join(',');

function fromRow(row: RouteRow): Route {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Route['type'],
    image: row.image,
    distance: row.distance,
    elevation: row.elevation,
    duration: row.duration,
    difficulty: row.difficulty as Route['difficulty'],
    description: row.description,
    startPoint: row.start_point,
    mapUrl: row.map_url,
    gpxUrl: row.gpx_url,
  };
}

const listeners = new Set<() => void>();
let cache: Route[] | null = null;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function getCache(): Route[] {
  if (!cache) cache = [];
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from('routes')
    .select(COLUMNS)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  cache = (data as unknown as RouteRow[] | undefined)?.map(fromRow) ?? [];
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadRoutes().catch(() => { /* нет сети — пустой список */ });

  channel = supabase
    .channel('routes-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'routes' },
      () => { void reloadRoutes().catch(() => {}); }
    )
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRoutes(): Route[] {
  ensureStarted();
  return getCache();
}

export const routesStore = {
  get: getRoutes,
  reload: reloadRoutes,
  /** Создать маршрут и вернуть его с заполненным sort_order */
  create: async (input: Partial<Route>): Promise<Route> => {
    const now = new Date().toISOString();
    const id = 'route-' + Date.now();
    const row: Record<string, unknown> = {
      id,
      name: input.name ?? '',
      type: input.type ?? 'running',
      image: input.image ?? '',
      distance: input.distance ?? '',
      elevation: input.elevation ?? '',
      duration: input.duration ?? '',
      difficulty: input.difficulty ?? 'easy',
      description: input.description ?? '',
      start_point: input.startPoint ?? '',
      map_url: input.mapUrl ?? '',
      gpx_url: input.gpxUrl ?? '',
      created_at: now,
      updated_at: now,
    };
    // Определим sort_order: 1 + текущее кол-во записей
    const { data: existing } = await supabase
      .from('routes')
      .select('id', { count: 'exact' });
    row.sort_order = (existing?.length ?? 0) + 1;

    const { error } = await supabase.from('routes').insert(row);
    if (error) throw error;
    await reloadRoutes();
    return { ...row, ...input } as Route;
  },
  update: async (id: string, patch: Partial<Route>): Promise<void> => {
    const { error } = await supabase
      .from('routes')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await reloadRoutes();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('routes').delete().eq('id', id);
    if (error) throw error;
    await reloadRoutes();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = null;
    emit();
  },
};

export function useRoutes(): Route[] {
  return useSyncExternalStore(subscribe, getRoutes, getRoutes);
}
