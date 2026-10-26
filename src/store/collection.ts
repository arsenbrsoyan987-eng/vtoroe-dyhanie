import { useSyncExternalStore } from 'react';

/**
 * Небольшая реактивная коллекция поверх localStorage.
 * Один экземпляр на сущность: изменения сразу видны на всех страницах.
 */
export interface Collection<T extends { id: string }> {
  get: () => T[];
  save: (next: T[]) => void;
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  reset: () => void;
  useAll: () => T[];
}

export function createCollection<T extends { id: string }>(
  storageKey: string,
  seed: T[]
): Collection<T> {
  const listeners = new Set<() => void>();
  let cache: T[] | null = null;

  const read = (): T[] => {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(storageKey);
      cache = raw ? (JSON.parse(raw) as T[]) : seed;
    } catch {
      cache = seed;
    }
    return cache;
  };

  const emit = () => listeners.forEach((l) => l());

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const save = (next: T[]) => {
    cache = next;
    localStorage.setItem(storageKey, JSON.stringify(next));
    emit();
  };

  return {
    get: read,
    save,
    add: (item) => save([...read(), item]),
    update: (id, patch) =>
      save(read().map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id) => save(read().filter((x) => x.id !== id)),
    reset: () => {
      cache = seed;
      localStorage.removeItem(storageKey);
      emit();
    },
    useAll: () => useSyncExternalStore(subscribe, read, read),
  };
}
