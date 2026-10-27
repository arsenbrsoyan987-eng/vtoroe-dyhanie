/* Опрашивает последний GitHub Actions run до терминального состояния. */
const T = process.env.GH_TOKEN;
const R = 'https://api.github.com/repos/arsenbrsoyan987-eng/vtoroe-dyhanie';

async function latest() {
  const res = await fetch(`${R}/actions/runs?per_page=1`, {
    headers: { Authorization: `Bearer ${T}`, Accept: 'application/vnd.github+json' },
  });
  const d = await res.json();
  return d.workflow_runs[0];
}

(async () => {
  for (let i = 0; i < 20; i++) {
    const r = await latest();
    console.log(`poll ${i + 1}: ${r.status} / ${r.conclusion}`);
    if (r.status === 'completed') {
      console.log('url:', r.html_url);
      process.exit(r.conclusion === 'success' ? 0 : 1);
    }
    await new Promise((s) => setTimeout(s, 15000));
  }
  console.log('timeout: сборка не завершилась');
})();
