# Второе дыхание — сайт спортивного клуба

Одностраничное приложение клуба: публичные разделы (направления, расписание,
тренеры, мероприятия, маршруты, новости, результаты) и личный кабинет с ролями
спортсмена, тренера и администратора.

## Стек

React 19, TypeScript, Vite 8, Tailwind 4, React Router 7.
Данные хранятся в `localStorage` браузера (`src/store/database.ts`) — внешней
базы нет, поэтому аккаунты и записи видны только в том браузере, где их создали.

## Локальная разработка

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # oxlint
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
src/data/         демо-контент клуба
src/store/        хранилище на localStorage
src/lib/          доступ, права, хеширование паролей, приглашения
public/images/    заглушки-иллюстрации (SVG) — заменяются на реальные фото
```