import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { directions as seedDirections } from '../data/directions';
import type { Direction } from '../types';

interface DirectionRow {
  id: string;
  name: string;
  name_short: string;
  description: string;
  full_description: string;
  icon: string;
  image_url: string;
  suitable_for: string[] | null;
  required_equipment: string[] | null;
  level: string;
  sort_order: number;
}

const COLUMNS =
  'id,name,name_short,description,full_description,icon,image_url,suitable_for,required_equipment,level,sort_order';

function fromRow(row: DirectionRow): Direction {
  return {
    id: row.id,
    name: row.name,
    nameShort: row.name_short,
    description: row.description,
    fullDescription: row.full_description,
    icon: row.icon,
    imageUrl: row.image_url,
    suitableFor: row.suitable_for ?? [],
    requiredEquipment: row.required_equipment ?? [],
    level: row.level,
  };
}

/**
 * Порядок карточек из колонки `sort_order`.
 *
 * Держим отдельно от Direction: тип публичный, и поле «позиция в базе» в нём
 * только сбивало бы. Раньше `toRow` всегда писал 0, и любое сохранение
 * уводило направление в начало списка.
 */
function toRow(d: Direction): DirectionRow {
  return {
    id: d.id,
    name: d.name,
    name_short: d.nameShort,
    description: d.description,
    full_description: d.fullDescription,
    icon: d.icon,
    image_url: d.imageUrl,
    suitable_for: d.suitableFor,
    required_equipment: d.requiredEquipment,
    level: d.level,
    sort_order: sortOrder.get(d.id) ?? cache.length,
  };
}

const listeners = new Set<() => void>();
/**
 * Запасной вариант, пока база недоступна или таблица пуста.
 *
 * `published.json` направлений не содержит — они никогда не выгружались
 * через админку, поэтому источник один: значения из сборки.
 */
const FALLBACK: Direction[] = seedDirections;
let cache: Direction[] = FALLBACK;
let sortOrder = new Map(FALLBACK.map((d, i) => [d.id, i]));
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadDirections(): Promise<Direction[]> {
  const { data, error } = await supabase
    .from('directions')
    .select(COLUMNS)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  const rows = data as DirectionRow[];
  // Пустая таблица (схему применили, а данные не перенесли) не должна
  // очищать сайт: держим значения из сборки, пока админ не заполнит раздел.
  if (rows.length === 0) {
    cache = FALLBACK;
    sortOrder = new Map(FALLBACK.map((d, i) => [d.id, i]));
  } else {
    cache = rows.map(fromRow);
    sortOrder = new Map(rows.map((r) => [r.id, r.sort_order]));
  }
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadDirections().catch(() => {
    /* нет сети — останутся данные из сборки */
  });

  channel = supabase
    .channel('directions-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'directions' }, () => {
      void reloadDirections().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getDirections(): Direction[] {
  ensureStarted();
  return cache;
}

export const directionsStore = {
  get: getDirections,
  add: async (item: Direction): Promise<void> => {
    const { error } = await supabase.from('directions').insert(toRow(item));
    if (error) throw error;
    await reloadDirections();
  },
  update: async (id: string, patch: Partial<Direction>): Promise<void> => {
    const current = cache.find((d) => d.id === id);
    if (!current) return;
    const { error } = await supabase
      .from('directions')
      .update(toRow({ ...current, ...patch }))
      .eq('id', id);
    if (error) throw error;
    await reloadDirections();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('directions').delete().eq('id', id);
    if (error) throw error;
    await reloadDirections();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = FALLBACK;
    emit();
  },
};

export function useDirections(): Direction[] {
  return useSyncExternalStore(subscribe, getDirections, getDirections);
}

export function useDirection(id: string | undefined): Direction | undefined {
  return useDirections().find((d) => d.id === id);
}
