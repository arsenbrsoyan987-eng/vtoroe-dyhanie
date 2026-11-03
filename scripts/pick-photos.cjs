/*
 * Подбор фотографий для карточек направлений.
 *
 * Wikimedia Commons отдаёт свободно лицензированные снимки, а его API
 * позволяет искать по описанию и сразу получать уменьшенную копию нужной
 * ширины. Скрипт печатает кандидатов, чтобы выбрать подходящие по названию,
 * — визуальную оценку делает человек.
 *
 * Запуск: node scripts/pick-photos.cjs "cross country skiing" "triathlon swim"
 */
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'vtoroe-dyhanie/1.0 (site owner; photo selection)';

async function search(query, limit = 6) {
  const url = new URL(API);
  Object.assign(url.searchParams, {
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1200',
    format: 'json',
  });

  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  const pages = Object.values(json?.query?.pages ?? {});
  return pages
    .map((p) => p.imageinfo?.[0])
    .filter((info) => info && info.mime === 'image/jpeg' && info.width >= 1000)
    .map((info) => ({
      title: info.descriptionshorturl ?? '',
      w: info.width,
      h: info.height,
      thumb: info.thumburl,
    }));
}

(async () => {
  const queries = process.argv.slice(2);
  if (queries.length === 0) {
    console.error('Укажите поисковые запросы: node scripts/pick-photos.cjs "running marathon"');
    process.exit(1);
  }
  for (const q of queries) {
    console.log(`\n### ${q}`);
    try {
      const found = await search(q);
      if (found.length === 0) console.log('  (пусто)');
      for (const f of found) {
        console.log(`  ${f.w}x${f.h}  ${f.title}`);
      }
    } catch (err) {
      console.log(`  ошибка: ${err.message}`);
    }
  }
})();
