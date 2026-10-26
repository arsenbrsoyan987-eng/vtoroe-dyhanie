import { useSyncExternalStore } from 'react';
import { trainings as seedTrainings } from '../data/trainings';
import type { Training } from '../types';

const KEY = 'db_trainings';
const listeners = new Set<() => void>();
let cache: Training[] | null = null;

function read(): Training[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Training[]) : seedTrainings;
  } catch {
    cache = seedTrainings;
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

export function getTrainings(): Training[] {
  return read();
}

export function saveTrainings(next: Training[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function addTraining(training: Training) {
  saveTrainings([...read(), training]);
}

export function removeTraining(id: string) {
  saveTrainings(read().filter((t) => t.id !== id));
}

export function updateTraining(id: string, patch: Partial<Training>) {
  saveTrainings(read().map((t) => (t.id === id ? { ...t, ...patch } : t)));
}

export function resetTrainings() {
  cache = seedTrainings;
  localStorage.removeItem(KEY);
  emit();
}

/** Реактивный доступ к расписанию — изменения сразу видны во всех разделах */
export function useTrainings(): Training[] {
  return useSyncExternalStore(subscribe, read, read);
}

export function useTraining(id: string | undefined): Training | undefined {
  return useTrainings().find((t) => t.id === id);
}
