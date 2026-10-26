/**
 * Проверка миграции localStorage и сброса пароля администратором.
 * Запуск: node scripts/verify-auth.cjs (нужен dev-сервер на :5199)
 */
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
let failed = 0;

function log(name, ok, extra = '') {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
  });
  const page = await browser.newPage();

  // --- 1. Миграция схемы не удаляет пользователей ---
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => localStorage.getItem('db_schema_version') === '6', { timeout: 15000 });

  await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('db_users'));
    const admin = users.find((u) => u.role === 'admin');
    users.push({
      id: 'u-migration-test',
      name: 'Тест Миграции',
      email: 'migration@test.ru',
      phone: '',
      role: 'athlete',
      passwordHash: admin.passwordHash,
      created: '2026-01-01',
    });
    localStorage.setItem('db_users', JSON.stringify(users));
    localStorage.setItem('db_schema_version', '4');
  });

  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => localStorage.getItem('db_schema_version') === '6', { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 800));

  const migrated = await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('db_users'));
    return {
      kept: users.some((u) => u.email === 'migration@test.ru'),
      count: users.length,
      trainerLinked: users.find((u) => u.email === 'trainer@vtoroe-dyhanie.ru')?.trainerId,
      ownerEmail: users.find((u) => u.role === 'admin')?.email,
    };
  });
  log('Миграция сохранила пользователей', migrated.kept, `аккаунтов: ${migrated.count}`);
  log('Тренер привязан к профилю', migrated.trainerLinked === 'trainer-1', String(migrated.trainerLinked));
  log('Аккаунт владельца обновлён', migrated.ownerEmail === 'arsenbrsoyan@yandex.ru', String(migrated.ownerEmail));

  // --- 1b. Лишние администраторы удаляются, владелец остаётся ---
  await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('db_users'));
    const owner = users.find((u) => u.role === 'admin');
    users.push({
      id: 'u-old-admin',
      name: 'Админ Клуба',
      email: 'admin@club.ru',
      phone: '+7 900 000-00-00',
      role: 'admin',
      passwordHash: owner.passwordHash,
      created: '2025-01-01',
    });
    localStorage.setItem('db_users', JSON.stringify(users));
    localStorage.setItem('db_schema_version', '5');
  });
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => localStorage.getItem('db_schema_version') === '6', { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));

  const owners = await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('db_users'));
    return {
      admins: users.filter((u) => u.role === 'admin').map((u) => u.email),
      clubGone: !users.some((u) => u.email === 'admin@club.ru'),
    };
  });
  log('Остался единственный администратор', owners.admins.length === 1, owners.admins.join(', '));
  log('Лишний админ admin@club.ru удалён', owners.clubGone);
  log('Владелец сохранён', owners.admins[0] === 'arsenbrsoyan@yandex.ru');

  // --- 2. Сброс пароля администратором ---
  await page.type('#email', 'arsenbrsoyan@yandex.ru');
  await page.type('#password', '220413A@b)');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname.startsWith('/cabinet'), { timeout: 8000 });

  await page.goto(BASE + '/cabinet/admin/users', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => document.querySelector('button[aria-label^="Сбросить пароль"]'),
    { timeout: 8000 }
  );

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button[aria-label^="Сбросить пароль"]')];
    const trainerBtn = buttons.find((b) => b.getAttribute('aria-label').includes('Тренер'));
    (trainerBtn || buttons[0]).click();
  });
  await page.waitForFunction(() => document.querySelector('code'), { timeout: 8000 });
  const tempPassword = await page.evaluate(() => document.querySelector('code').textContent.trim());
  log('Временный пароль сгенерирован', /^Vtoroe-/.test(tempPassword), tempPassword);

  // Выход
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Выйти');
    btn && btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Вход с временным паролем
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#email'));
  await page.type('#email', 'trainer@vtoroe-dyhanie.ru');
  await page.type('#password', tempPassword);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname.startsWith('/cabinet'), { timeout: 8000 });
  await page
    .waitForFunction(() => document.body.innerText.includes('Кабинет тренера'), { timeout: 8000 })
    .catch(() => {});
  const text = await page.evaluate(() => document.body.innerText);
  log('Вход с временным паролем', text.includes('Кабинет тренера'));
  log('Тренеру предложена смена временного пароля', text.includes('стартовый пароль'));

  await browser.close();
  console.log(`\nИтог: ${failed === 0 ? 'все проверки пройдены' : failed + ' провалено'}`);
  process.exit(failed === 0 ? 0 : 1);
})();
