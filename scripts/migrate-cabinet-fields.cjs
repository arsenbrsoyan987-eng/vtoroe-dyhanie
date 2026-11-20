/*
 * Разовая миграция: убрать локальные дубли field/label в кабинете
 * и подключить общие fieldClass/labelClass из components/cabinet/ui.
 *
 * Запуск: node scripts/migrate-cabinet-fields.cjs
 */
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '..', 'src', 'pages', 'cabinet');

/** Две формы записи: с переносом строки и в одну строку */
const DECLS = [
  /  const field =\n    '[^']*';\n  const label = '[^']*';\n\n?/g,
  /  const field = '[^']*';\n  const label = '[^']*';\n\n?/g,
];

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.tsx'));
let changed = 0;

for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, 'utf8');
  let after = before;

  let touched = false;
  for (const re of DECLS) {
    if (re.test(after)) {
      touched = true;
      after = after.replace(re, '');
    }
  }
  if (!touched) continue;

  after = after
    .replace(/\{field\}/g, '{fieldClass}')
    .replace(/\{label\}/g, '{labelClass}')
    .replace(/\$\{field\}/g, '${fieldClass}')
    .replace(/\$\{label\}/g, '${labelClass}');

  const UI_IMPORT = /import \{([^}]*)\} from '\.\.\/\.\.\/components\/cabinet\/ui';/;
  if (UI_IMPORT.test(after)) {
    after = after.replace(UI_IMPORT, (m, names) => {
      const list = names
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const name of ['fieldClass', 'labelClass']) {
        if (!list.includes(name)) list.push(name);
      }
      return `import { ${list.join(', ')} } from '../../components/cabinet/ui';`;
    });
  } else {
    // Вставляем сразу после последнего импорта
    const imports = [...after.matchAll(/^import[^\n]*\n/gm)];
    const last = imports[imports.length - 1];
    const at = last.index + last[0].length;
    after =
      after.slice(0, at) +
      `import { fieldClass, labelClass } from '../../components/cabinet/ui';\n` +
      after.slice(at);
  }

  fs.writeFileSync(full, after);
  changed += 1;
  console.log(`~ ${file}`);
}

console.log(`\nФайлов изменено: ${changed} из ${files.length}`);
