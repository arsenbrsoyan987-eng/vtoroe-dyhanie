import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import type { TrainingPhoto } from '../types';

/**
 * Галерея прошедших тренировок. Фото грузятся в Storage, а записи о них
 * лежат в public.training_photos. Тренер добавляет снимки только к своим
 * занятиям — проверяется политикой на стороне базы.
 */

interface PhotoRow {
  id: string;
  training_id: string;
  url: string;
  caption: string;
  author_id: string | null;
  author_name: string | null;
  created_at: string;
}

const COLUMNS = 'id,training_id,url,caption,author_id,author_name,created_at';

function fromRow(row: PhotoRow): TrainingPhoto {
  return {
    id: row.id,
    trainingId: row.training_id,
    url: row.url,
    caption: row.caption ?? '',
    ...(row.author_id ? { authorId: row.author_id } : {}),
    authorName: row.author_name ?? '',
    createdAt: row.created_at,
  };
}

const listeners = new Set<() => void>();
let cache: TrainingPhoto[] = [];
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadTrainingPhotos(): Promise<TrainingPhoto[]> {
  const { data, error } = await supabase
    .from('training_photos')
    .select(COLUMNS)
    .order('created_at', { ascending: false });

  if (error) throw error;
  cache = (data as PhotoRow[]).map(fromRow);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadTrainingPhotos().catch(() => {
    /* нет сети — галереи останутся пустыми, подписка догонит */
  });

  channel = supabase
    .channel('training-photos-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'training_photos' }, () => {
      void reloadTrainingPhotos().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTrainingPhotos(): TrainingPhoto[] {
  ensureStarted();
  return cache;
}

export async function addTrainingPhoto(input: {
  trainingId: string;
  url: string;
  caption?: string;
  authorId?: string;
  authorName?: string;
}): Promise<void> {
  const { error } = await supabase.from('training_photos').insert({
    training_id: input.trainingId,
    url: input.url,
    caption: input.caption ?? '',
    author_id: input.authorId ?? null,
    author_name: input.authorName ?? '',
  });
  if (error) throw error;
  await reloadTrainingPhotos();
}

export async function updateTrainingPhoto(id: string, caption: string): Promise<void> {
  const { error } = await supabase.from('training_photos').update({ caption }).eq('id', id);
  if (error) throw error;
  await reloadTrainingPhotos();
}

export async function removeTrainingPhoto(id: string): Promise<void> {
  const { error } = await supabase.from('training_photos').delete().eq('id', id);
  if (error) throw error;
  await reloadTrainingPhotos();
}

export function resetTrainingPhotos() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
  started = false;
  cache = [];
  emit();
}

export function useTrainingPhotos(): TrainingPhoto[] {
  return useSyncExternalStore(subscribe, getTrainingPhotos, getTrainingPhotos);
}

/** Фото одной тренировки, свежие сверху */
export function usePhotosOf(trainingId: string | undefined): TrainingPhoto[] {
  const all = useTrainingPhotos();
  if (!trainingId) return [];
  return all.filter((p) => p.trainingId === trainingId);
}
