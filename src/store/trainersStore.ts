import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { publishedOr } from '../data/published';
import { trainers as seedTrainers } from '../data/trainers';
import type { Trainer } from '../types';

/**
 * Карточки тренеров живут в таблице public.trainers.
 *
 * Раньше админка писала в localStorage — это память одного браузера, поэтому
 * добавленный с телефона тренер не появлялся у посетителей. Теперь запись
 * уходит в базу, realtime-подписка разносит её по всем открытым страницам,
 * и правка видна всем сразу.
 *
 * Начальное значение — published.json: пререндер и первый рендер показывают
 * тренеров, не дожидаясь сети.
 */

interface TrainerRow {
  id: string;
  name: string;
  photo: string;
  specialization: string;
  experience: string;
  biography: string;
  directions: string[] | null;
  certifications: string[] | null;
  phone: string;
  email: string;
}

const COLUMNS =
  'id,name,photo,specialization,experience,biography,directions,certifications,phone,email';

function fromRow(row: TrainerRow): Trainer {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo ?? '',
    specialization: row.specialization ?? '',
    experience: row.experience ?? '',
    biography: row.biography ?? '',
    directions: row.directions ?? [],
    certifications: row.certifications ?? [],
    phone: row.phone ?? '',
    email: row.email ?? '',
  };
}

function toRow(t: Trainer): TrainerRow {
  return {
    id: t.id,
    name: t.name,
    photo: t.photo,
    specialization: t.specialization,
    experience: t.experience,
    biography: t.biography,
    directions: t.directions,
    certifications: t.certifications,
    phone: t.phone,
    email: t.email,
  };
}

const listeners = new Set<() => void>();
const FALLBACK = publishedOr<Trainer>('trainers', seedTrainers);
let cache: Trainer[] = FALLBACK;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadTrainers(): Promise<Trainer[]> {
  const { data, error } = await supabase
    .from('trainers')
    .select(COLUMNS)
    .order('created_at', { ascending: true });

  if (error) throw error;
  cache = (data as TrainerRow[]).map(fromRow);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadTrainers().catch(() => {
    /* нет сети — останутся данные из сборки, подписка догонит */
  });

  channel = supabase
    .channel('trainers-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trainers' }, () => {
      void reloadTrainers().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTrainers(): Trainer[] {
  ensureStarted();
  return cache;
}

/**
 * Оптимистичное обновление: кэш меняется мгновенно, чтобы форма сразу
 * закрылась, а запись в базу доходит следом. При ошибке список откатывается
 * к предыдущему значению — иначе админ видел бы то, чего в базе нет.
 */
export async function addTrainer(trainer: Trainer): Promise<void> {
  const prev = cache;
  cache = [...prev, trainer];
  emit();
  try {
    const { error } = await supabase.from('trainers').insert(toRow(trainer));
    if (error) throw error;
  } catch (err) {
    cache = prev;
    emit();
    throw err;
  }
}

export async function updateTrainer(id: string, patch: Partial<Trainer>): Promise<void> {
  const prev = cache;
  const current = prev.find((t) => t.id === id);
  if (!current) return;
  const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
  cache = next;
  emit();
  try {
    const { error } = await supabase
      .from('trainers')
      .update(toRow(next.find((t) => t.id === id) as Trainer))
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    cache = prev;
    emit();
    throw err;
  }
}

export async function removeTrainer(id: string): Promise<void> {
  const prev = cache;
  cache = prev.filter((t) => t.id !== id);
  emit();
  try {
    const { error } = await supabase.from('trainers').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    cache = prev;
    emit();
    throw err;
  }
}

export function resetTrainers() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
  started = false;
  cache = FALLBACK;
  emit();
}

/** Реактивный список тренеров: изменения сразу видны на публичных страницах */
export function useTrainers(): Trainer[] {
  return useSyncExternalStore(subscribe, getTrainers, getTrainers);
}

export function useTrainer(id: string | undefined): Trainer | undefined {
  return useTrainers().find((t) => t.id === id);
}
