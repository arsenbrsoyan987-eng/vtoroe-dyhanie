import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { published } from '../data/published';
import type { Camp } from '../types';

/**
 * Тренировочные сборы (кэмпы). Читают все посетители, создаёт и меняет
 * только администратор — это ограничение продублировано в RLS,
 * поэтому скрытая кнопка в кабинете не является защитой.
 */

interface CampRow {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  full_description: string;
  price: string;
  program: string[] | null;
  includes: string[] | null;
  image: string;
  images: string[] | null;
  registration_open: boolean;
  contact: string;
  published: boolean;
}

const COLUMNS =
  'id,name,location,start_date,end_date,description,full_description,price,program,includes,image,images,registration_open,contact,published';

function fromRow(row: CampRow): Camp {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? '',
    startDate: (row.start_date ?? '').slice(0, 10),
    ...(row.end_date ? { endDate: row.end_date.slice(0, 10) } : {}),
    description: row.description ?? '',
    fullDescription: row.full_description ?? '',
    price: row.price ?? '',
    program: row.program ?? [],
    includes: row.includes ?? [],
    image: row.image ?? '',
    images: row.images ?? [],
    registrationOpen: Boolean(row.registration_open),
    contact: row.contact ?? '',
    published: Boolean(row.published),
  };
}

function toRow(c: Camp): CampRow {
  return {
    id: c.id,
    name: c.name,
    location: c.location,
    start_date: c.startDate,
    end_date: c.endDate || null,
    description: c.description,
    full_description: c.fullDescription,
    price: c.price,
    program: c.program,
    includes: c.includes,
    image: c.image,
    images: c.images,
    registration_open: c.registrationOpen,
    contact: c.contact,
    published: c.published,
  };
}

const listeners = new Set<() => void>();
// Пререндер и первый рендер показывают сборы из сборки, не дожидаясь сети
const FALLBACK: Camp[] = published.camps ?? [];
let cache: Camp[] = FALLBACK;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadCamps(): Promise<Camp[]> {
  const { data, error } = await supabase
    .from('camps')
    .select(COLUMNS)
    .order('start_date', { ascending: false });

  if (error) throw error;
  cache = (data as CampRow[]).map(fromRow);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadCamps().catch(() => {
    /* нет сети — список останется пустым, подписка догонит */
  });

  channel = supabase
    .channel('camps-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'camps' }, () => {
      void reloadCamps().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCamps(): Camp[] {
  ensureStarted();
  return cache;
}

export async function addCamp(camp: Camp): Promise<void> {
  const { error } = await supabase.from('camps').insert(toRow(camp));
  if (error) throw error;
  await reloadCamps();
}

export async function updateCamp(id: string, patch: Partial<Camp>): Promise<void> {
  const current = cache.find((c) => c.id === id);
  if (!current) return;
  const { error } = await supabase
    .from('camps')
    .update(toRow({ ...current, ...patch }))
    .eq('id', id);
  if (error) throw error;
  await reloadCamps();
}

export async function removeCamp(id: string): Promise<void> {
  const { error } = await supabase.from('camps').delete().eq('id', id);
  if (error) throw error;
  await reloadCamps();
}

export function resetCamps() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
  started = false;
  cache = FALLBACK;
  emit();
}

export function useCamps(): Camp[] {
  return useSyncExternalStore(subscribe, getCamps, getCamps);
}

/** Только опубликованные сборы — для публичных страниц */
export function usePublishedCamps(): Camp[] {
  return useCamps().filter((c) => c.published);
}

export function useCamp(id: string | undefined): Camp | undefined {
  return useCamps().find((c) => c.id === id);
}
