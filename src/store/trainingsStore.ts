import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { publishedOr } from '../data/published';
import { trainings as seedTrainings } from '../data/trainings';
import type { Training } from '../types';

/**
 * Расписание живёт в таблице public.trainings: записи на тренировки ссылаются
 * на её id, а тренер видит только свои занятия (проверка на стороне базы).
 * Изменения приходят по realtime — открытые страницы обновляются сами.
 *
 * Начальное значение берётся из published.json: пререндер и первый рендер
 * показывают расписание, не дожидаясь сети, иначе в HTML для поисковиков
 * не осталось бы ни одной тренировки.
 */

interface TrainingRow {
  id: string;
  name: string;
  direction_id: string;
  direction_name: string;
  date: string;
  time: string;
  location: string;
  trainer_id: string;
  trainer_name: string;
  duration: string;
  level: string;
  capacity: number;
  description: string;
  equipment: string[] | null;
  image: string;
}

const COLUMNS =
  'id,name,direction_id,direction_name,date,time,location,trainer_id,trainer_name,duration,level,capacity,description,equipment,image';

function fromRow(row: TrainingRow): Training {
  return {
    id: row.id,
    name: row.name,
    directionId: row.direction_id,
    directionName: row.direction_name,
    date: (row.date ?? '').slice(0, 10),
    time: row.time,
    location: row.location,
    trainer: row.trainer_name,
    trainerId: row.trainer_id,
    duration: row.duration,
    level: row.level,
    spotsAvailable: row.capacity,
    description: row.description,
    equipment: row.equipment ?? [],
    image: row.image,
  };
}

function toRow(t: Training): TrainingRow {
  return {
    id: t.id,
    name: t.name,
    direction_id: t.directionId,
    direction_name: t.directionName,
    date: t.date,
    time: t.time,
    location: t.location,
    trainer_id: t.trainerId,
    trainer_name: t.trainer,
    duration: t.duration,
    level: t.level,
    capacity: t.spotsAvailable,
    description: t.description,
    equipment: t.equipment,
    image: t.image,
  };
}

const listeners = new Set<() => void>();
const FALLBACK = publishedOr<Training>('trainings', seedTrainings);
let cache: Training[] = FALLBACK;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadTrainings(): Promise<Training[]> {
  const { data, error } = await supabase
    .from('trainings')
    .select(COLUMNS)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;
  cache = (data as TrainingRow[]).map(fromRow);
  emit();
  return cache;
}

/** Единственная подписка на всё приложение: расписание читают все страницы */
function ensureStarted() {
  if (started) return;
  started = true;

  void reloadTrainings().catch(() => {
    /* нет сети — покажем пустое расписание, подписка догонит */
  });

  channel = supabase
    .channel('trainings-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trainings' }, () => {
      void reloadTrainings().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTrainings(): Training[] {
  ensureStarted();
  return cache;
}

export async function addTraining(training: Training): Promise<void> {
  const { error } = await supabase.from('trainings').insert(toRow(training));
  if (error) throw error;
  await reloadTrainings();
}

export async function updateTraining(id: string, patch: Partial<Training>): Promise<void> {
  const current = cache.find((t) => t.id === id);
  if (!current) return;
  const { error } = await supabase
    .from('trainings')
    .update(toRow({ ...current, ...patch }))
    .eq('id', id);
  if (error) throw error;
  await reloadTrainings();
}

export async function removeTraining(id: string): Promise<void> {
  // Сначала записи: они ссылаются на тренировку
  await supabase.from('registrations').delete().eq('training_id', id);
  const { error } = await supabase.from('trainings').delete().eq('id', id);
  if (error) throw error;
  await reloadTrainings();
}

export function resetTrainings() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
  started = false;
  cache = FALLBACK;
  emit();
}

/** Реактивный доступ к расписанию — изменения сразу видны во всех разделах */
export function useTrainings(): Training[] {
  return useSyncExternalStore(subscribe, getTrainings, getTrainings);
}

export function useTraining(id: string | undefined): Training | undefined {
  return useTrainings().find((t) => t.id === id);
}