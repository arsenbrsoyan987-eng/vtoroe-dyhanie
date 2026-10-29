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
Пуш в `main` запускает `.github/workflows/deploy.yml`: сборка, запись `CNAME`,
копия `index.html` в `404.html` (SPA-fallback для глубоких ссылок) и публикация.

Важно: сайт отдаётся из корня домена, поэтому `base` в `vite.config.ts` и
`basename` роутера должны оставаться `/`. Пути к статике в `src/data/*.ts`
начинаются с `/images/...`.

## Проверки после деплоя

```bash
npm run check:dns    # A-записи домена и CNAME для www
npm run check:live   # корень, 404.html, SPA-роуты, ассеты, manifest, sw.js
```

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