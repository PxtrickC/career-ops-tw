#!/usr/bin/env node
/**
 * scan-portal.mjs — Direct portal scrape/API helper for Taiwan job platforms.
 *
 * Why this exists: scan.md's Level 1 (Playwright) requires browser automation
 * that isn't always available. Most Taiwan job portals expose either a public
 * JSON API or server-side-rendered HTML that we can hit with plain HTTPS.
 * This helper centralizes that logic so scan mode can call one CLI instead of
 * reverse-engineering each portal every run.
 *
 * Supported platforms (verified 2026-04-08):
 *   - 104       — JSON API at /jobs/search/api/jobs (needs Referer + XHR header)
 *   - yourator  — JSON API at /api/v4/jobs (needs Referer)
 *   - cake      — Next.js SSR HTML scraping (Cake job cards rendered in markup)
 *   - 1111      — Nuxt SSR HTML scraping (job links rendered in markup)
 *
 * NOT supported:
 *   - meet.jobs — Search filter is purely client-side React; no public API
 *     endpoint discoverable, URL params are ignored. Use WebSearch instead.
 *
 * Usage:
 *   node scan-portal.mjs <platform> [options]
 *
 *   Common options:
 *     --keyword <text>   Search keyword (Chinese or English)
 *     --area <code>      104: area code (e.g. 6001001000 = Taipei)
 *     --remote           Filter remote-friendly only (104, cake)
 *     --location <name>  cake: location filter (e.g. Taiwan)
 *     --term <slug>      yourator: category slug (designer, engineer, etc.)
 *                        repeat for multiple
 *     --pages <n>        Max pages to fetch (default 3)
 *     --format <fmt>     Output format: jsonl (default) or tsv
 *     --debug            Print fetch URLs and counts to stderr
 *
 * Output: one job per line. Default JSONL with shape:
 *   {"platform","query","title","company","url","location","salary","posted","raw"}
 *
 * Examples:
 *   node scan-portal.mjs 104 --keyword "資深產品設計師" --area 6001001000 --remote
 *   node scan-portal.mjs yourator --term designer --pages 2
 *   node scan-portal.mjs cake --keyword "founding designer" --remote
 *   node scan-portal.mjs 1111 --keyword "產品設計師"
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ---------- arg parsing ----------

function parseArgs(argv) {
  const platform = argv[0];
  const opts = { pages: 3, format: 'jsonl', terms: [] };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--keyword') opts.keyword = next();
    else if (a === '--area') opts.area = next();
    else if (a === '--location') opts.location = next();
    else if (a === '--term') opts.terms.push(next());
    else if (a === '--pages') opts.pages = parseInt(next(), 10) || 3;
    else if (a === '--format') opts.format = next();
    else if (a === '--remote') opts.remote = true;
    else if (a === '--debug') opts.debug = true;
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  return { platform, opts };
}

function debug(opts, ...args) {
  if (opts.debug) console.error('[scan-portal]', ...args);
}

// ---------- output ----------

function emit(opts, rec) {
  if (opts.format === 'tsv') {
    const cols = [rec.platform, rec.query || '', rec.title, rec.company, rec.url, rec.location || '', rec.salary || '', rec.posted || ''];
    process.stdout.write(cols.map(c => String(c).replace(/\t/g, ' ')).join('\t') + '\n');
  } else {
    process.stdout.write(JSON.stringify(rec) + '\n');
  }
}

// ---------- platform: 104 ----------

async function scan104(opts) {
  const platform = '104';
  const query = opts.keyword || '';
  const params = new URLSearchParams({
    ro: opts.remote ? '1' : '0',
    keyword: query,
    order: '15', // newest first
    mode: 's',
    page: '1',
    pagesize: '30',
  });
  if (opts.area) params.set('area', opts.area);
  if (opts.remote) params.set('remoteWork', '1');

  const referer = `https://www.104.com.tw/jobs/search/?${params.toString()}`;
  const headers = {
    'User-Agent': UA,
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Referer': referer,
    'X-Requested-With': 'XMLHttpRequest',
  };

  let count = 0;
  for (let page = 1; page <= opts.pages; page++) {
    params.set('page', String(page));
    const url = `https://www.104.com.tw/jobs/search/api/jobs?${params.toString()}`;
    debug(opts, `104 page=${page}`, url);
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`[scan-portal] 104 page ${page} failed: HTTP ${res.status}`);
      break;
    }
    const data = await res.json();
    // 104's data is an object with numeric string keys, not an array
    const jobs = Object.keys(data.data || {})
      .filter(k => /^\d+$/.test(k))
      .map(k => data.data[k]);
    if (jobs.length === 0) break;
    for (const j of jobs) {
      const link = j.link?.job || `https://www.104.com.tw/job/${j.jobNo}`;
      const fullUrl = link.startsWith('//') ? 'https:' + link : link;
      emit(opts, {
        platform, query,
        title: j.jobName || '',
        company: j.custName || '',
        url: fullUrl,
        location: j.jobAddrNoDesc || '',
        salary: (j.salaryLow && j.salaryHigh) ? `${j.salaryLow}-${j.salaryHigh}` : '',
        posted: j.appearDate || '',
      });
      count++;
    }
    const meta = data.metadata?.pagination;
    if (meta && page >= meta.lastPage) break;
  }
  debug(opts, `104 total emitted: ${count}`);
}

// ---------- platform: yourator ----------

async function scanYourator(opts) {
  const platform = 'yourator';
  const terms = opts.terms.length ? opts.terms : (opts.keyword ? [opts.keyword] : ['designer']);
  const query = terms.join(',');
  const headers = {
    'User-Agent': UA,
    'Accept': 'application/json',
    'Referer': 'https://www.yourator.co/jobs',
  };

  let count = 0;
  for (let page = 1; page <= opts.pages; page++) {
    const params = new URLSearchParams();
    for (const t of terms) params.append('term[]', t);
    params.set('page', String(page));
    const url = `https://www.yourator.co/api/v4/jobs?${params.toString()}`;
    debug(opts, `yourator page=${page}`, url);
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`[scan-portal] yourator page ${page} failed: HTTP ${res.status}`);
      break;
    }
    const data = await res.json();
    const jobs = data.payload?.jobs || [];
    if (jobs.length === 0) break;
    for (const j of jobs) {
      // Job URL pattern: https://www.yourator.co{company.path}/jobs/{id}
      const companyPath = j.company?.path || '';
      const fullUrl = j.thirdPartyUrl || `https://www.yourator.co${companyPath}/jobs/${j.id}`;
      emit(opts, {
        platform, query,
        title: j.name || '',
        company: (j.company?.brand || '').trim(),
        url: fullUrl,
        location: j.location || '',
        salary: j.salary || '',
        posted: j.lastActiveAt || '',
      });
      count++;
    }
    if (!data.payload?.hasMore) break;
  }
  debug(opts, `yourator total emitted: ${count}`);
}

// ---------- platform: cake (SSR HTML scraping) ----------

async function scanCake(opts) {
  const platform = 'cake';
  const query = opts.keyword || '';
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (opts.location) params.set('location', opts.location);
  if (opts.remote) params.set('remote', 'true');

  const headers = { 'User-Agent': UA, 'Accept': 'text/html' };
  // Cake's job cards use generated CSS module classnames but the readable
  // segments stay stable: `__jobTitle` for the title anchor and `__companyName`
  // for the company anchor. Match anchors by those segments. Drop <mark> tags
  // that wrap matched search terms.
  const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  let count = 0;
  for (let page = 1; page <= opts.pages; page++) {
    if (page > 1) params.set('page', String(page));
    const url = `https://www.cake.me/jobs?${params.toString()}`;
    debug(opts, `cake page=${page}`, url);
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`[scan-portal] cake page ${page} failed: HTTP ${res.status}`);
      break;
    }
    const html = await res.text();
    // Title anchor: class contains __jobTitle, href is /companies/.../jobs/...
    const titleRe = /<a[^>]*class="[^"]*__jobTitle[^"]*"[^>]*href="(\/companies\/[^"\/]+\/jobs\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    const seen = new Set();
    let pageCount = 0;
    let tm;
    while ((tm = titleRe.exec(html)) !== null) {
      const path = tm[1];
      if (seen.has(path)) continue;
      seen.add(path);
      const title = stripTags(tm[2]);
      // Company anchor appears within ~600 chars after the title anchor
      const lookahead = html.slice(tm.index + tm[0].length, tm.index + tm[0].length + 800);
      const compMatch = lookahead.match(/<a[^>]*class="[^"]*__companyName[^"]*"[^>]*>([\s\S]*?)<\/a>/);
      const company = compMatch ? stripTags(compMatch[1]) : (path.match(/^\/companies\/([^\/]+)\//)?.[1] || '');
      // Location often shows in a tag right after the description with class containing __location or as a span
      const locMatch = lookahead.match(/__location[^"]*"[^>]*>([\s\S]*?)<\//);
      const location = locMatch ? stripTags(locMatch[1]) : '';
      emit(opts, {
        platform, query,
        title: title || '(unknown)',
        company: company || '(unknown)',
        url: `https://www.cake.me${path}`,
        location,
        salary: '',
        posted: '',
      });
      count++;
      pageCount++;
    }
    if (pageCount === 0) break;
  }
  debug(opts, `cake total emitted: ${count}`);
}

// ---------- platform: 1111 (SSR HTML scraping) ----------

async function scan1111(opts) {
  const platform = '1111';
  const query = opts.keyword || '';
  const params = new URLSearchParams({ ks: query, col: 'ab' });

  const headers = { 'User-Agent': UA, 'Accept': 'text/html' };
  // 1111's job-card markup is Vue/Nuxt SSR. Each card has TWO anchors with
  // useful `title="..."` attributes:
  //   <a href="/job/{id}" title="{job title}">  ← job title
  //   <a href="/corp/{id}" title="{company name}">  ← company
  // Iterate by job-anchor matches and look forward ~1200 chars for the corp anchor.
  // Location appears in city-tag spans further into the card.
  const taiwanCity = /(臺北市|台北市|新北市|桃園市|台中市|高雄市|台南市|新竹[市縣]|彰化縣|雲林縣|嘉義[市縣]|宜蘭縣|基隆市|苗栗縣|南投縣|屏東縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)[^<\s,]{0,20}/;

  let count = 0;
  for (let page = 1; page <= opts.pages; page++) {
    params.set('page', String(page));
    const url = `https://www.1111.com.tw/search/job?${params.toString()}`;
    debug(opts, `1111 page=${page}`, url);
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`[scan-portal] 1111 page ${page} failed: HTTP ${res.status}`);
      break;
    }
    const html = await res.text();
    const re = /<a\s+href="\/job\/(\d+)"\s+title="([^"]+)"/g;
    let pageCount = 0;
    const seen = new Set();
    let m;
    while ((m = re.exec(html)) !== null) {
      const id = m[1];
      if (seen.has(id)) continue;
      seen.add(id);
      const title = m[2].trim();
      const lookahead = html.slice(m.index, m.index + 1200);
      const compMatch = lookahead.match(/<a\s+href="\/corp\/[^"]+"\s+title="([^"]+)"/);
      const company = compMatch?.[1].trim() || '(unknown)';
      const locMatch = lookahead.match(taiwanCity);
      const location = locMatch?.[0] || '';
      emit(opts, {
        platform, query,
        title: title || '(unknown)',
        company,
        url: `https://www.1111.com.tw/job/${id}`,
        location,
        salary: '',
        posted: '',
      });
      count++;
      pageCount++;
    }
    if (pageCount === 0) break;
  }
  debug(opts, `1111 total emitted: ${count}`);
}

// ---------- main ----------

const HELP = `Usage: node scan-portal.mjs <platform> [options]

Platforms: 104 | yourator | cake | 1111

Options:
  --keyword <text>     Search keyword (104 / cake / 1111)
  --term <slug>        Yourator category slug (repeatable: --term designer --term engineer)
  --area <code>        104 area code (e.g. 6001001000 = Taipei)
  --location <name>    Cake location filter (e.g. Taiwan)
  --remote             Remote-friendly only (104 / cake)
  --pages <n>          Max pages to fetch (default 3)
  --format jsonl|tsv   Output format (default jsonl)
  --debug              Verbose stderr

Examples:
  node scan-portal.mjs 104 --keyword "資深產品設計師" --area 6001001000 --remote
  node scan-portal.mjs yourator --term designer --pages 2
  node scan-portal.mjs cake --keyword "founding designer" --remote
  node scan-portal.mjs 1111 --keyword "產品設計師"
`;

// --help / -h before platform-positional, so `node scan-portal.mjs --help` works.
const argv = process.argv.slice(2);
if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
  process.stdout.write(HELP);
  process.exit(argv.length === 0 ? 1 : 0);
}
const { platform, opts } = parseArgs(argv);
if (opts.help) {
  process.stdout.write(HELP);
  process.exit(0);
}

const handlers = {
  '104': scan104,
  'yourator': scanYourator,
  'cake': scanCake,
  '1111': scan1111,
};

const fn = handlers[platform];
if (!fn) {
  console.error(`Unknown platform: ${platform}. Supported: ${Object.keys(handlers).join(', ')}`);
  process.exit(2);
}

try {
  await fn(opts);
} catch (e) {
  console.error(`[scan-portal] ${platform} failed:`, e.message);
  process.exit(3);
}
