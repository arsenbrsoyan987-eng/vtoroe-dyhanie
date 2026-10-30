import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toUser, type ProfileRow, type User } from './database';

/**
 * Список профилей клуба с живой подпиской на изменения.
 * Регистрация с любого устройства попадает в общую базу и появляется
 * у администратора без перезагрузки страницы.
 */
export async function fetchProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,name,phone,role,trainer_id,photo,must_change_password,created_at,deleted_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ProfileRow[]).map(toUser);
}

export function useProfiles(): User[] {
  const [profiles, setProfiles] = useState<User[]>([]);

  useEffect(() => {
    let active = true;

    const load = () => {
      fetchProfiles()
        .then((list) => {
          if (active) setProfiles(list);
        })
        .catch(() => {
          /* нет сессии или сети — список останется пустым */
        });
    };

    load();

    // Одна подписка на все изменения профилей: INSERT при регистрации,
    // UPDATE при смене роли, DELETE при удалении аккаунта
    const channel = supabase
      .channel('profiles-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return profiles;
}

/** Профили без удалённых аккаунтов */
export function activeProfiles(profiles: User[]): User[] {
  return profiles.filter((p) => !p.deleted);
}
