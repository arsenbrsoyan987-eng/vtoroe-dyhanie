/**
 * Быстрые заявки (leads): записаться на тренировку без аккаунта.
 *
 * Гость вводит имя и телефон (опционально email и сообщение),
 * заявка падает в таблицу public.leads, а тренер видит её в админке.
 */
import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { normalizePhone, phoneIssue } from './database';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  trainingId: string;
  source: string;
  message: string;
  status: 'new' | 'worked' | 'closed';
  createdAt: string;
}

interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  training_id: string;
  source: string;
  message: string;
  status: string;
  created_at: string;
}

function fromRow(row: LeadRow): Lead {
  return {
    id: String(row.id),
    name: row.name,
    phone: row.phone,
    email: row.email,
    trainingId: row.training_id,
    source: row.source,
    message: row.message,
    status: (row.status as Lead['status']) || 'new',
    createdAt: row.created_at,
  };
}

const listeners = new Set<() => void>();
let cache: Lead[] | null = null;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function getCache(): Lead[] {
  if (!cache) cache = [];
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('id,name,phone,email,training_id,source,message,status,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  cache = (data as LeadRow[] | undefined)?.map(fromRow) ?? [];
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadLeads().catch(() => {});

  channel = supabase
    .channel('leads-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      () => { void reloadLeads().catch(() => {}); }
    )
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const leadsStore = {
  get: () => getCache(),
  reload: reloadLeads,
  submit: async (input: {
    name: string;
    phone: string;
    email?: string;
    trainingId?: string;
    source?: string;
    message?: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const name = input.name.trim();
    if (!name) return { ok: false, error: 'Укажите имя — так тренеру проще вас узнать' };
    const phoneError = phoneIssue(input.phone);
    if (phoneError) return { ok: false, error: phoneError };
    const phone = normalizePhone(input.phone);
    const { error } = await supabase.from('leads').insert({
      name: name.slice(0, 120),
      phone,
      email: input.email?.trim() ?? '',
      training_id: input.trainingId ?? '',
      source: input.source ?? '',
      message: input.message?.trim().slice(0, 1000) ?? '',
    });
    if (error) return { ok: false, error: 'Не удалось отправить заявку — попробуйте позвонить нам' };
    // Список читает только администратор: у гостя перечитка не выйдет,
    // и это не ошибка — заявку мы уже записали.
    await reloadLeads().catch(() => {});
    return { ok: true };
  },
  updateStatus: async (id: string, status: Lead['status']): Promise<void> => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) throw error;
    await reloadLeads();
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    await reloadLeads();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = null;
    emit();
  },
};

export function useLeads(): Lead[] {
  return useSyncExternalStore(subscribe, getCache, getCache);
}
