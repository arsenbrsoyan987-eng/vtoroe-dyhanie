# Второе дыхание — сайт спортивного клуба

Одностраничное приложение клуба: публичные разделы (направления, расписание,
тренеры, мероприятия, маршруты, новости, результаты) и личный кабинет с ролями
спортсмена, тренера и администратора.

## Стек

React 19, TypeScript, Vite 8, Tailwind 4, React Router 7.
Данные клуба хранятся в Supabase: профили и роли, расписание, записи,
уведомления, результаты, новости, кэмпы и фото тренировок. Доступ ограничен
политиками RLS, поэтому роли проверяются на стороне базы, а не только в UI.
Схема и все политики — в `supabase/schema.sql`.

## Схема базы

Файл идемпотентен: его можно выполнять повторно. Применяется вручную —
Supabase → SQL Editor → New query → Run (CLI в проекте не авторизован):

```bash
cat supabase/schema.sql | pbcopy   # затем вставьте в SQL Editor и нажмите Run
```

Что создаётся: `profiles`, `invitations`, `trainings`, `registrations`,
`notifications`, `results`, `news`, `camps`, `training_photos`, функции
`is_admin()`, `is_trainer()`, `is_trainer_of()`, `my_trainer_id()`, `teaches()`,
триггеры `handle_new_user()` и `protect_profile_fields()`, realtime-подписки и
публичный бакет Storage `training-photos`.

Права по разделам:

| Раздел | Кто пишет |
| --- | --- |
| Кэмпы | только администратор |
| Фото тренировок | администратор и тренер этой тренировки |
| Тренировки | администратор и тренер (только свои) |
| Новости | администратор и тренеры (тренер правит свои) |

После применения схемы данные из сборки переносятся в базу:

```bash
node --env-file=.env.local scripts/seed-supabase.cjs
```

## Локальная разработка

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

Для работы с реальной базой создайте `.env.local`:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...   # только для scripts/seed-supabase.cjs
```

## Деплой

Сайт живёт на GitHub Pages под доменом **https://vtoroe-dyhanie.ru**.
Пуш в `main` запускает `.github/workflows/deploy.yml`: сборка, пререндер
публичных страниц, запись `CNAME` и публикация.

Важно: сайт отдаётся из корня домена, поэтому `base` в `vite.config.ts` и
`basename` роутера должны оставаться `/`. Пути к статике в `src/data/*.ts`
начинаются с `/images/...`.

### Пререндер

GitHub Pages не умеет SPA-rewrite: глубокий адрес (`/trainers/trainer-1`)
отдаётся с кодом 404, и поисковики считают такую страницу несуществующей.
`scripts/prerender.cjs` после сборки открывает каждый адрес из `sitemap.xml`
в headless Chrome и сохраняет готовый HTML в `dist/<путь>/index.html` — статус
становится 200, а заголовок, описание и текст уже есть в разметке.

```bash
npm run build && npm run prerender
```

Локально нужен установленный Chrome (или `CHROME_PATH`), в CI его ставит
`browser-actions/setup-chrome`.

## SEO

- `src/lib/seo.ts` — заголовки и описания всех разделов; `applySeo` переписывает
  `title`, `description`, Open Graph, canonical и `robots` при смене маршрута.
- `src/components/Seo.tsx` — один компонент на приложение, подключён в `App.tsx`.
  Карточки тренеров, тренировок, событий и новостей собирают мета из данных.
  Кабинет, вход, регистрация и QR-страницы закрыты `noindex`.
- `public/robots.txt` — открывает публичные разделы, закрывает кабинет.
- `public/sitemap.xml` — 32 адреса; из него же берёт список пререндер.
- Микроразметка `SportsClub` — в `index.html`.

**При добавлении страницы** обновите `STATIC_SEO`, `sitemap.xml` — и она
попадёт в пререндер автоматически.

## Публикация правок из админки

Тренеры, тренировки, новости, кэмпы и фото тренировок сохраняются сразу в базе
и видны всем посетителям без пересборки сайта.

Кнопка **«Опубликовать»** в кабинете администратора нужна для того, что пока
лежит в сборке: мероприятия, отзывы, результаты и сами карточки тренеров.

1. В кабинете администратора нажмите **«Опубликовать»** — скачается
   `published.json` (обычно в `~/Downloads`).
2. В папке проекта выполните:

```bash
npm run publish
```

Скрипт `scripts/publish-and-deploy.cjs` сам найдёт свежий `published.json`,
перенесёт данные в `src/data/published.json`, вытащит вставленные фото
в `public/images/uploads/`, пересоберёт сайт, пререндерит страницы, закоммитит
и запушит в `main`. GitHub Actions задеплоит — правки появятся у всех.

Если файл лежит не в «Загрузках», путь можно указать явно:
`npm run publish -- ~/Desktop/published.json`. Повторный запуск с теми же
данными ничего не публикует.

## Проверки после деплоя

```bash
npm run check:dns        # A-записи домена и CNAME для www
npm run check:live       # корень, 404.html, SPA-роуты, ассеты, manifest, sw.js
npm run check:seo        # title/description/canonical/h1 на всех маршрутах
npm run check:mobile     # переполнение и тап-зоны на 375 и 390 px + скриншоты
npm run check:hydration  # React монтируется поверх пререндера без ошибок
```

Скрипты `check:seo`, `check:mobile`, `check:hydration` работают по локальной
сборке: сначала `npm run build`, затем `npm run preview -- --port 5199`.

Если локальный DNS ещё помнит старый адрес, `check:live` можно прогнать в обход
кэша: `SITE_IP=185.199.108.153 npm run check:live`.

## Структура

```
src/components/   layout, секции главной, UI-примитивы
src/pages/        публичные страницы и разделы кабинета
src/data/         демо-контент и published.json (снимок данных для пререндера)
src/store/        сторы Supabase с realtime: тренировки, новости, кэмпы, фото
src/lib/          доступ, права, SEO, сжатие и загрузка фото в Storage
supabase/         schema.sql — таблицы, политики RLS, Storage
public/images/    заглушки-иллюстрации (SVG) — заменяются на реальные фото
```