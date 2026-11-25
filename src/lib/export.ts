import type { Notification, PersonalResult, TrainingRegistration, User } from '../store/database';

/**
 * Выгрузка личных данных в JSON.
 *
 * Собирается в браузере из того, что уже загружено в кабинет: отдельного
 * API для экспорта нет, а права на чтение своих строк даёт RLS.
 */
export interface ExportPayload {
  exportedAt: string;
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
  };
  registrations: TrainingRegistration[];
  results: PersonalResult[];
  notifications: Notification[];
}

export function buildExport(
  user: User,
  registrations: TrainingRegistration[],
  results: PersonalResult[],
  notifications: Notification[]
): ExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created,
    },
    registrations: registrations.filter((r) => r.userId === user.id),
    results: results.filter((r) => r.userId === user.id),
    notifications: notifications.filter((n) => n.userId === user.id),
  };
}

/** Скачивает JSON-файл — без сервера и сторонних библиотек */
export function downloadJson(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vtoroe-dyhanie-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** CSV с точкой с запятой: Excel в русской локали открывает без настроек */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const escape = (value: string | number) => {
    const text = String(value ?? '');
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const body = rows.map((row) => row.map(escape).join(';')).join('\r\n');
  // BOM нужен, чтобы Excel не превратил кириллицу в кракозябры
  const blob = new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
