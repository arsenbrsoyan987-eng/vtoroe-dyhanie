import { useSyncExternalStore } from 'react';
import { trainers as seedTrainers } from '../data/trainers';
import type { Trainer } from '../types';

const KEY = 'db_trainers';
const listeners = new Set<() => void>();
let cache: Trainer[] | null = null;

function read(): Trainer[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Trainer[]) : seedTrainers;
  } catch {
    cache = seedTrainers;
  }
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTrainers(): Trainer[] {
  return read();
}

export function saveTrainers(next: Trainer[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function addTrainer(trainer: Trainer) {
  saveTrainers([...read(), trainer]);
}

export function updateTrainer(id: string, patch: Partial<Trainer>) {
  saveTrainers(read().map((t) => (t.id === id ? { ...t, ...patch } : t)));
}

export function removeTrainer(id: string) {
  saveTrainers(read().filter((t) => t.id !== id));
}

/** Реактивный список тренеров: изменения сразу видны на публичных страницах */
export function useTrainers(): Trainer[] {
  return useSyncExternalStore(subscribe, read, read);
}

export function useTrainer(id: string | undefined): Trainer | undefined {
  return useTrainers().find((t) => t.id === id);
}
