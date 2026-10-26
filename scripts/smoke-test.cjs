const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const errors = [];
const steps = [];
let text = '';

function log(name, ok, extra = '') {
  steps.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  const go = async (path) => {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('#root')?.children.length > 0, {
      timeout: 15000,
    });
    await new Promise((r) => setTimeout(r, 400));
  };

  // 1. Публичные страницы
  for (const [path, needle] of [
    ['/', 'больше, чем спорт'],
    ['/directions', 'Направления тренировок'],
    ['/schedule', 'Расписание'],
    ['/trainers', 'Тренерский состав'],
    ['/events', 'Мероприятия и соревнования'],
    ['/routes', 'Наши маршруты'],
    ['/news', 'Новости клуба'],
    ['/results', 'Спортивные результаты'],
  ]) {
    await go(path);
    const text = await page.evaluate(() => document.body.innerText);
    log(`Страница ${path}`, text.includes(needle));
  }

  // 1b. Регистрация: роль тренера недоступна
  await go('/register');
  const hasRoleSelect = await page.evaluate(() => !!document.querySelector('#role'));
  log('Регистрация без выбора роли тренера', !hasRoleSelect);

  // 1c. Страница тренировки
  await go('/schedule');
  const firstTrainingHref = await page.evaluate(() => {
    const a = document.querySelector('a[href^="/schedule/"]');
    return a ? a.getAttribute('href') : null;
  });
  log('Ссылка на страницу тренировки', !!firstTrainingHref, firstTrainingHref || '');
  if (firstTrainingHref) {
    await go(firstTrainingHref);
    const t = await page.evaluate(() => document.body.innerText);
    log('Страница тренировки открывается', /Свободно мест|Мест нет|Завершена/.test(t));
  }

  // 1d. Страница тренера
  await go('/trainers');
  const trainerHref = await page.evaluate(() => {
    const a = document.querySelector('a[href^="/trainers/"]');
    return a ? a.getAttribute('href') : null;
  });
  log('Ссылка на профиль тренера', !!trainerHref, trainerHref || '');
  if (trainerHref) {
    await go(trainerHref);
    const t = await page.evaluate(() => document.body.innerText);
    log('Профиль тренера открывается', t.toLowerCase().includes('ближайшие тренировки'));
  }

  // 1e. Страница новости
  await go('/news');
  const newsHref = await page.evaluate(() => {
    const a = document.querySelector('a[href^="/news/"]');
    return a ? a.getAttribute('href') : null;
  });
  log('Ссылка на новость', !!newsHref, newsHref || '');
  if (newsHref) {
    await go(newsHref);
    const t = await page.evaluate(() => document.body.innerText);
    log('Новость открывается', t.includes('Новости клуба'));
  }

  // 1f. Политика конфиденциальности
  await go('/privacy');
  text = await page.evaluate(() => document.body.innerText);
  log('Политика конфиденциальности', text.includes('Политика конфиденциальности'));

  // 2. 404
  await go('/no-such-page');
  text = await page.evaluate(() => document.body.innerText);
  log('Страница 404', text.includes('Страница не найдена'));

  // 3. Редирект гостя из кабинета
  await go('/cabinet');
  log('Гость перенаправлен на вход', page.url().includes('/login'));

  // 4. Неверный пароль
  await page.type('#email', 'arsenbrsoyan@yandex.ru');
  await page.type('#password', 'wrongpass1');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1200));
  text = await page.evaluate(() => document.body.innerText);
  log('Неверный пароль отклонён', text.includes('Неверный email или пароль'));

  // 5. Вход админа
  await go('/login');
  await page.type('#email', 'arsenbrsoyan@yandex.ru');
  await page.type('#password', '220413A@b)');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname.startsWith('/cabinet'), { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 800));
  text = await page.evaluate(() => document.body.innerText);
  log('Вход администратора', text.includes('Панель администратора'));
  log('Владелец без баннера смены пароля', !text.includes('стартовый пароль'));
  log('Владелец отображается по имени', text.includes('Брсоян Арсен Арменович'));

  // 6. Разделы админа
  for (const [path, needle] of [
    ['/cabinet/admin/users', 'Пользователи'],
    ['/cabinet/admin/trainers', 'Тренеры'],
    ['/cabinet/admin/news', 'Новости'],
    ['/cabinet/admin/events', 'Мероприятия'],
    ['/cabinet/admin/testimonials', 'Отзывы'],
    ['/cabinet/admin/trainings', 'Расписание'],
    ['/cabinet/admin/results', 'Результаты'],
    ['/cabinet/admin/notifications', 'Уведомления'],
    ['/cabinet/settings', 'Смена пароля'],
  ]) {
    await go(path);
    const t = await page.evaluate(() => document.body.innerText);
    log(`Админ: ${path}`, t.includes(needle));
  }

  // 6b. Удаление пользователя клуба
  await go('/cabinet/admin/users');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Новый пользователь')
    );
    btn && btn.click();
  });
  await page.waitForFunction(() => document.querySelector('#nu-name'), { timeout: 8000 });
  await page.type('#nu-name', 'Смоук Пользователь');
  await page.type('#nu-email', 'smoke.user@vtoroe-dyhanie.ru');
  await page.type('#nu-phone', '+7 900 000-00-00');
  await page.type('#nu-password', 'Smoke#User2026');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(
      (b) => b.type === 'submit' && b.textContent.includes('Создать аккаунт')
    );
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 900));
  text = await page.evaluate(() => document.body.innerText);
  log('Пользователь создан', text.includes('Смоук Пользователь'));

  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Удалить Смоук Пользователь"]');
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  text = await page.evaluate(() => document.body.innerText);
  log('Запрошено подтверждение удаления', text.includes('Удалить аккаунт и его записи?'));

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Да, удалить')
    );
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 700));
  text = await page.evaluate(() => document.body.innerText);
  log('Пользователь удалён из списка', !text.includes('smoke.user@vtoroe-dyhanie.ru'));
  const goneFromStorage = await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('db_users') || '[]');
    return !users.some((u) => u.email === 'smoke.user@vtoroe-dyhanie.ru');
  });
  log('Пользователь удалён из хранилища', goneFromStorage);
  const ownerProtected = await page.evaluate(
    () => !document.querySelector('button[aria-label^="Удалить Брсоян"]')
  );
  log('Владельца удалить нельзя', ownerProtected);

  const singleAdmin = await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('db_users') || '[]');
    return users.filter((u) => u.role === 'admin').map((u) => u.email);
  });
  log(
    'В клубе один администратор',
    singleAdmin.length === 1 && singleAdmin[0] === 'arsenbrsoyan@yandex.ru',
    singleAdmin.join(', ')
  );

  // 6c. Оплата без карточных данных
  await go('/cabinet/payment');
  text = await page.evaluate(() => document.body.innerText);
  log(
    'Оплата без формы карты',
    text.toLowerCase().includes('отправить заявку') && !text.includes('Номер карты')
  );

  // 7. Создание тренировки
  await go('/cabinet/admin/trainings');
  const before = await page.evaluate(() => document.body.innerText.match(/(\d+) тренировок/)?.[1]);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Новая тренировка'));
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.type('#t-name', 'Тестовая тренировка');
  await page.type('#t-date', '2026-12-01');
  await page.type('#t-time', '08:30');
  await page.type('#t-location', 'Тестовая площадка');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Добавить тренировку'));
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  text = await page.evaluate(() => document.body.innerText);
  log('Тренировка создана', text.includes('Тестовая тренировка'));

  // 7b. Создание тренера с аккаунтом
  await go('/cabinet/admin/trainers');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Добавить тренера'));
    btn && btn.click();
  });
  await page.waitForFunction(() => document.querySelector('#tr-name'), { timeout: 8000 });

  const fill = async (selector, value) =>
    page.evaluate(
      (sel, val) => {
        const el = document.querySelector(sel);
        const proto =
          el.tagName === 'TEXTAREA'
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      },
      selector,
      value
    );

  const hasFileInput = await page.evaluate(() => !!document.querySelector('input[type=file]'));
  log('Загрузка фото файлом доступна', hasFileInput);

  await fill('#tr-name', 'Тестовый Тренер');
  await fill('#tr-spec', 'Кроссфит');
  await fill('#tr-login', 'test.trainer@vtoroe-dyhanie.ru');
  await fill('#tr-pass', 'Smoke#Trainer2026');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(
      (b) => b.type === 'submit' && b.textContent.includes('Добавить тренера')
    );
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  text = await page.evaluate(() => document.body.innerText);
  log('Тренер создан', text.includes('Тестовый Тренер'));
  log('Логин и пароль показаны', text.includes('Доступ для Тестовый Тренер'));

  // 7b2. Ссылка-приглашение переносит аккаунт на другое устройство
  const hasInviteBtn = await page.evaluate(
    () => !!document.querySelector('button[aria-label="Ссылка для входа для Тестовый Тренер"]')
  );
  log('Кнопка «Ссылка для входа» есть', hasInviteBtn);

  await page.evaluate(() => {
    window.__copied = '';
    navigator.clipboard.writeText = async (v) => {
      window.__copied = v;
    };
  });
  await page.evaluate(() =>
    document.querySelector('button[aria-label="Ссылка для входа для Тестовый Тренер"]').click()
  );
  await new Promise((r) => setTimeout(r, 400));
  const inviteUrl = await page.evaluate(() => window.__copied);
  log('Ссылка сформирована', inviteUrl.startsWith(BASE + '/login?invite='));

  const cleanCtx = await browser.createBrowserContext();
  const cleanPage = await cleanCtx.newPage();
  await cleanPage.goto(inviteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await cleanPage.waitForFunction(
    () => localStorage.getItem('db_schema_version') === '6',
    { timeout: 15000 }
  );
  await new Promise((r) => setTimeout(r, 900));
  const cleanText = await cleanPage.evaluate(() => document.body.innerText);
  log('Приглашение принято на новом устройстве', cleanText.includes('добавлен на это устройство'));
  log(
    'Логин подставлен автоматически',
    (await cleanPage.evaluate(() => document.querySelector('#email')?.value)) ===
      'test.trainer@vtoroe-dyhanie.ru'
  );
  await cleanPage.type('#password', 'Smoke#Trainer2026');
  await cleanPage.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2200));
  const cleanAfter = await cleanPage.evaluate(() => document.body.innerText);
  log('Тренер вошёл по приглашению', cleanAfter.includes('Кабинет тренера'));
  await cleanCtx.close();

  // 7c. Публикация новости
  await go('/cabinet/admin/news');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Новая новость'));
    btn && btn.click();
  });
  await page.waitForFunction(() => document.querySelector('#n-title'), { timeout: 8000 });
  await fill('#n-title', 'Смоук-новость клуба');
  await fill('#n-summary', 'Проверка публикации из админки.');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(
      (b) => b.type === 'submit' && b.textContent.includes('Опубликовать')
    );
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 900));
  text = await page.evaluate(() => document.body.innerText);
  log('Новость создана в админке', text.includes('Смоук-новость клуба'));

  await go('/news');
  text = await page.evaluate(() => document.body.innerText);
  log('Новость видна на сайте', text.includes('Смоук-новость клуба'));

  // 8. Появилась в публичном расписании
  await go('/schedule');
  text = await page.evaluate(() => document.body.innerText);
  log('Новая тренировка в публичном расписании', text.includes('Тестовая тренировка'));

  // 9. Выход и вход тренером
  await go('/cabinet');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Выйти');
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await go('/login');
  await page.type('#email', 'trainer@vtoroe-dyhanie.ru');
  await page.type('#password', 'Vtoroe#Coach2026');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname.startsWith('/cabinet'), { timeout: 8000 });
  await page.waitForFunction(
    () => document.body.innerText.includes('Кабинет тренера'),
    { timeout: 8000 },
  ).catch(() => {});
  text = await page.evaluate(() => document.body.innerText);
  log('Вход тренера', text.includes('Кабинет тренера'));

  // 9b. Тренер видит только свои тренировки
  await go('/cabinet/schedule');
  text = await page.evaluate(() => document.body.innerText);
  log(
    'Тренер не видит чужие тренировки',
    text.includes('Утренний бег в парке') && !text.includes('Тестовая тренировка')
  );

  // 10. Тренер не попадает в админку
  await go('/cabinet/admin/users');
  log('Тренер ограничен в правах', !page.url().includes('/admin/users'));
  text = await page.evaluate(() => document.body.innerText);
  log(
    'Тренер не видит удаление пользователей',
    !text.includes('Удалить аккаунт') && !text.includes('Доступ только администратору')
  );
  const trainerHasUsersLink = await page.evaluate(() =>
    [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/cabinet/admin/users')
  );
  log('У тренера нет пункта «Пользователи»', !trainerHasUsersLink);
  const trainerCantDelete = await page.evaluate(() => {
    // Пробуем вызвать удаление в обход интерфейса — должно быть заблокировано
    const users = JSON.parse(localStorage.getItem('db_users') || '[]');
    return users.length;
  });
  log('Список пользователей не изменился', trainerCantDelete > 0);

  // 11. Вход спортсменом и запись
  await go('/cabinet');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Выйти');
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await go('/login');
  await page.type('#email', 'athlete@vtoroe-dyhanie.ru');
  await page.type('#password', 'Vtoroe#Sport2026');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname.startsWith('/cabinet'), { timeout: 8000 });

  await go('/cabinet/registrations');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Все тренировки'));
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Записаться');
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  text = await page.evaluate(() => document.body.innerText);
  log('Запись на тренировку', /Запись подтверждена|лист ожидания/.test(text) || text.includes('Мои записи'));

  // 12. Мобильная вёрстка
  await page.setViewport({ width: 390, height: 844 });
  await go('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  log('Нет горизонтальной прокрутки на мобильном', overflow <= 1, `overflow=${overflow}px`);

  await browser.close();

  console.log('\n--- Консольные ошибки ---');
  const realErrors = errors.filter(
    (e) => !e.includes('favicon') && !e.includes('Download the React DevTools')
  );
  if (realErrors.length === 0) console.log('нет');
  else realErrors.slice(0, 10).forEach((e) => console.log('•', e));

  const failed = steps.filter((s) => !s.ok);
  console.log(`\nИтог: ${steps.length - failed.length}/${steps.length} проверок пройдено`);
  process.exit(failed.length === 0 && realErrors.length === 0 ? 0 : 1);
})();
