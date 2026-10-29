/*
 * Проверяет, готов ли домен к GitHub Pages: A-записи apex-домена
 * и CNAME для www. Запросы идут через DNS-over-HTTPS, чтобы
 * кэш локального резолвера не искажал результат.
 */
const DOMAIN = 'vtoroe-dyhanie.ru';
const PAGES_IPS = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];
const PAGES_HOST = 'arsenbrsoyan987-eng.github.io';

async function resolve(name, type) {
  const url = `https://dns.google/resolve?name=${name}&type=${type}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const data = await res.json();
  return (data.Answer || []).map((a) => a.data);
}

(async () => {
  let ok = true;

  const a = await resolve(DOMAIN, 'A');
  const goodA = a.filter((ip) => PAGES_IPS.includes(ip));
  console.log(`${goodA.length === 4 ? 'OK ' : 'BAD'} A ${DOMAIN}: ${a.join(', ') || 'нет записей'}`);
  if (goodA.length !== 4) ok = false;

  const cname = await resolve(`www.${DOMAIN}`, 'CNAME');
  const goodCname = cname.some((v) => v.replace(/\.$/, '') === PAGES_HOST);
  console.log(`${goodCname ? 'OK ' : 'BAD'} CNAME www.${DOMAIN}: ${cname.join(', ') || 'нет записей'}`);
  if (!goodCname) ok = false;

  console.log(ok ? '\nDNS готов — можно включать Enforce HTTPS' : '\nDNS ещё не готов: пропиши записи в панели reg.ru');
  process.exitCode = ok ? 0 : 1;
})();
