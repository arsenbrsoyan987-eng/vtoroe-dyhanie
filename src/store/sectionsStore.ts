/**
 * Разделы сайта: произвольные разделы, которые администратор создаёт сам.
 *
 * Каждый раздел — это:
 * - slug (адрес /section/<slug>)
 * - title, subtitle, icon (для меню и главной)
 * - набор карточек с фото, заголовком и описанием
 */
import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';

export interface Section {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  /** Вводный текст страницы раздела, показывается перед карточками */
  description: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SectionCard {
  id: string;
  section_id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SectionRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface CardRow {
  id: string;
  section_id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const SECTION_COLUMNS =
  'id,slug,title,subtitle,icon,description,published,sort_order,created_at,updated_at';
/** Разделы создали раньше описания: без миграции колонки в базе нет */
const SECTION_COLUMNS_OLD =
  'id,slug,title,subtitle,icon,published,sort_order,created_at,updated_at';
const CARD_COLUMNS = 'id,section_id,title,description,image,link,sort_order,created_at,updated_at';

function fromSectionRow(row: SectionRow): Section {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    icon: row.icon,
    description: row.description ?? '',
    published: row.published,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function fromCardRow(row: CardRow): SectionCard {
  return {
    id: row.id,
    section_id: row.section_id,
    title: row.title,
    description: row.description,
    image: row.image,
    link: row.link,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ====== Sections ======
const sectionListeners = new Set<() => void>();
let sectionCache: Section[] | null = null;
let sectionStarted = false;
let sectionChannel: ReturnType<typeof supabase.channel> | null = null;

function getSectionCache(): Section[] {
  if (!sectionCache) sectionCache = [];
  return sectionCache;
}

function emitSections() {
  sectionListeners.forEach((l) => l());
}

export async function reloadSections(): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select(SECTION_COLUMNS)
    .order('sort_order', { ascending: true });

  if (error) {
    /** Колонку description ещё не добавили — читаем разделы без неё */
    if (error.message?.includes('does not exist')) {
      const fallback = await supabase
        .from('sections')
        .select(SECTION_COLUMNS_OLD)
        .order('sort_order', { ascending: true });
      if (fallback.error) throw fallback.error;
      sectionCache = (fallback.data as SectionRow[] | undefined)?.map(fromSectionRow) ?? [];
      emitSections();
      return sectionCache;
    }
    throw error;
  }
  sectionCache = (data as SectionRow[] | undefined)?.map(fromSectionRow) ?? [];
  emitSections();
  return sectionCache;
}

function ensureSectionStarted() {
  if (sectionStarted) return;
  sectionStarted = true;

  void reloadSections().catch(() => {});

  sectionChannel = supabase
    .channel('sections-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sections' },
      () => { void reloadSections().catch(() => {}); }
    )
    .subscribe();
}

function subscribeSection(listener: () => void) {
  ensureSectionStarted();
  sectionListeners.add(listener);
  return () => sectionListeners.delete(listener);
}

function getSections(): Section[] {
  ensureSectionStarted();
  return getSectionCache();
}

// ====== Section Cards ======
// Карточки храним одним плоским списком и грузим целиком разом: фильтр по
// разделу делаем на чтении. Отдельный запрос на каждый раздел перезаписывал
// бы кэш предыдущих, и на главной пустовали бы все разделы, кроме последнего.
const cardListeners = new Set<() => void>();
let cardCache: SectionCard[] | null = null;
let cardStarted = false;
let cardChannel: ReturnType<typeof supabase.channel> | null = null;

function getCardCache(): SectionCard[] {
  if (!cardCache) cardCache = [];
  return cardCache;
}

function emitCards() {
  cardListeners.forEach((l) => l());
}

export async function reloadCards(): Promise<SectionCard[]> {
  const { data, error } = await supabase
    .from('section_cards')
    .select(CARD_COLUMNS)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  cardCache = (data as unknown as CardRow[] | undefined)?.map(fromCardRow) ?? [];
  emitCards();
  return cardCache;
}

function ensureCardStarted() {
  if (cardStarted) return;
  cardStarted = true;

  void reloadCards().catch(() => {});

  cardChannel = supabase
    .channel('cards-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'section_cards' },
      () => { void reloadCards().catch(() => {}); }
    )
    .subscribe();
}

function subscribeCard(listener: () => void) {
  ensureCardStarted();
  cardListeners.add(listener);
  return () => cardListeners.delete(listener);
}

function getCards(): SectionCard[] {
  ensureCardStarted();
  return getCardCache();
}

// ====== API ======
export const sectionsStore = {
  get: getSections,
  reload: reloadSections,
  create: async (input: Partial<Section>): Promise<Section> => {
    const now = new Date().toISOString();
    const id = 'sec-' + Date.now();
    const row: Record<string, unknown> = {
      id,
      slug: input.slug ?? '',
      title: input.title ?? '',
      subtitle: input.subtitle ?? '',
      icon: input.icon ?? '',
      description: input.description ?? '',
      published: input.published ?? true,
      sort_order: 0,
      created_at: now,
      updated_at: now,
    };
    const { data: existing } = await supabase
      .from('sections')
      .select('id', { count: 'exact' });
    row.sort_order = (existing?.length ?? 0) + 1;

    const { error } = await supabase.from('sections').insert(row);
    if (error) throw error;
    await reloadSections();
    return { ...row, ...input } as Section;
  },
  update: async (id: string, patch: Partial<Section>): Promise<void> => {
    const { error } = await supabase
      .from('sections')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await reloadSections();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) throw error;
    await reloadSections();
  },
  reset: () => {
    if (sectionChannel) supabase.removeChannel(sectionChannel);
    sectionChannel = null;
    sectionStarted = false;
    sectionCache = null;
    emitSections();
  },
};

export const cardsStore = {
  get: getCards,
  reload: reloadCards,
  create: async (input: Partial<SectionCard>): Promise<SectionCard> => {
    const now = new Date().toISOString();
    const id = 'card-' + Date.now();
    const row: Record<string, unknown> = {
      id,
      section_id: input.section_id ?? '',
      title: input.title ?? '',
      description: input.description ?? '',
      image: input.image ?? '',
      link: input.link ?? '',
      sort_order: 0,
      created_at: now,
      updated_at: now,
    };
    const { data: existing } = await supabase
      .from('section_cards')
      .select('id', { count: 'exact' });
    row.sort_order = (existing?.length ?? 0) + 1;

    const { error } = await supabase.from('section_cards').insert(row);
    if (error) throw error;
    await reloadCards();
    return { ...row, ...input } as SectionCard;
  },
  update: async (id: string, patch: Partial<SectionCard>): Promise<void> => {
    const { error } = await supabase
      .from('section_cards')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await reloadCards();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('section_cards').delete().eq('id', id);
    if (error) throw error;
    await reloadCards();
  },
  reset: () => {
    if (cardChannel) supabase.removeChannel(cardChannel);
    cardChannel = null;
    cardStarted = false;
    cardCache = null;
    emitCards();
  },
};

export function useSections(): Section[] {
  return useSyncExternalStore(subscribeSection, getSections, getSections);
}

export function useCards(sectionId?: string): SectionCard[] {
  const cards = useSyncExternalStore(subscribeCard, getCards, getCards);
  if (!sectionId) return cards;
  return cards.filter((c) => c.section_id === sectionId);
}
