import * as cheerio from 'cheerio';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import type { Speaker, Talk, TalkSpeakerRef, ScrapedData } from '../lib/types';

const BASE = 'https://us.pycon.org';
const INDEX_PATHS = ['/2026/schedule/talks/', '/2026/schedule/tutorials/'];
const CACHE_DIR = join(process.cwd(), '.cache');
const DATA_DIR = join(process.cwd(), 'data');
const CONCURRENCY = 4;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h — talks/speakers data is stable enough

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

function cacheKey(url: string): string {
  return createHash('sha1').update(url).digest('hex').slice(0, 16);
}

async function fetchCached(url: string): Promise<string> {
  await ensureDir(CACHE_DIR);
  const file = join(CACHE_DIR, `${cacheKey(url)}.html`);
  try {
    const s = await stat(file);
    if (Date.now() - s.mtimeMs < CACHE_TTL_MS) {
      return await readFile(file, 'utf8');
    }
  } catch {
    /* miss */
  }
  process.stdout.write(`  fetch ${url}\n`);
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'pycon-app-scraper/0.1' } });
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
      const text = await res.text();
      await writeFile(file, text, 'utf8');
      return text;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function pool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

function abs(href: string): string {
  return href.startsWith('http') ? href : BASE + href;
}

function clean(s: string | undefined | null): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

function parsePresentationIdFromHref(href: string): string | null {
  const m = href.match(/\/schedule\/presentation\/(\d+)\//);
  return m ? m[1] : null;
}

function parseSpeakerIdFromHref(href: string): string | null {
  const m = href.match(/\/speaker\/profile\/(\d+)\//);
  return m ? m[1] : null;
}

async function getPresentationIdsFromIndex(path: string): Promise<string[]> {
  const html = await fetchCached(BASE + path);
  const $ = cheerio.load(html);
  const ids = new Set<string>();
  $('div.presentation a[href*="/schedule/presentation/"]').each((_, a) => {
    const id = parsePresentationIdFromHref($(a).attr('href') || '');
    if (id) ids.add(id);
  });
  // Fallback: any link in the page
  if (ids.size === 0) {
    $('a[href*="/schedule/presentation/"]').each((_, a) => {
      const id = parsePresentationIdFromHref($(a).attr('href') || '');
      if (id) ids.add(id);
    });
  }
  return [...ids];
}

function parseTimeBlock(text: string): { day: string | null; dateText: string | null; start: string | null; end: string | null } {
  // Examples seen:
  //   "Saturday, May 16th, 2026 5 p.m.–5:30 p.m. in"
  //   "Friday, May 15th, 2026 9 a.m.–10 a.m. in"
  const t = clean(text).replace(/&ndash;/g, '–');
  const dayMatch = t.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
  const dateMatch = t.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Z][a-z]+\s+\d+[a-z]{2}?,?\s+\d{4}/i);
  const timeRange = t.match(/(\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.))\s*[–-]\s*(\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.))/i);
  return {
    day: dayMatch ? dayMatch[1] : null,
    dateText: dateMatch ? dateMatch[0] : null,
    start: timeRange ? timeRange[1].replace(/\s+/g, ' ') : null,
    end: timeRange ? timeRange[2].replace(/\s+/g, ' ') : null,
  };
}

async function scrapeTalk(id: string): Promise<Talk> {
  const url = `${BASE}/2026/schedule/presentation/${id}/`;
  const html = await fetchCached(url);
  const $ = cheerio.load(html);

  const header = $('.presentation-detail-header');
  const title = clean(header.find('h1').first().text());
  const pill = clean(header.find('.pill').first().text()).toLowerCase();
  const kind: 'talk' | 'tutorial' = pill.startsWith('tutorial') ? 'tutorial' : 'talk';

  const timeP = header.find('p.text-center.size-6').first();
  const timeText = clean(timeP.text());
  const { day, dateText, start, end } = parseTimeBlock(timeText);
  const roomEl = timeP.find('a[href*="/schedule/rooms/"]').first();
  const room = roomEl.length ? clean(roomEl.text()) : null;

  const speakers: TalkSpeakerRef[] = [];
  header.find('.speaker-list a[href*="/speaker/profile/"]').each((_, a) => {
    const href = $(a).attr('href') || '';
    const speakerId = parseSpeakerIdFromHref(href);
    const name = clean($(a).text());
    if (speakerId && name) speakers.push({ id: speakerId, name });
  });

  let level: string | null = null;
  header.find('.presentation-detail-meta').each((_, el) => {
    const h = clean($(el).find('.presentation-detail-meta-headline').text()).toLowerCase();
    if (h.includes('experience level')) {
      level = clean($(el).find('p').text());
    }
  });

  // Abstract is the .content block under "Description"
  const contentBlocks = $('.max-medium .content');
  const abstract = clean(contentBlocks.first().text());

  return {
    id,
    kind,
    title,
    abstract,
    speakers,
    day,
    dateText,
    startTime: start,
    endTime: end,
    room,
    level,
    url,
  };
}

async function scrapeSpeaker(id: string, talkIds: string[]): Promise<Speaker> {
  const url = `${BASE}/2026/speaker/profile/${id}/`;
  const html = await fetchCached(url);
  const $ = cheerio.load(html);
  const root = $('.speaker-profile');
  const name = clean(root.find('h1').first().text());
  const photoUrl = root.find('.speaker-photo img').attr('src') || null;
  const bio = clean(root.find('> div .content').first().text());
  return {
    id,
    name,
    photoUrl,
    bio,
    profileUrl: url,
    talkIds,
  };
}

async function main() {
  await ensureDir(DATA_DIR);

  console.log('Step 1: collecting presentation IDs from schedule indices');
  const idLists = await Promise.all(INDEX_PATHS.map(getPresentationIdsFromIndex));
  const allIds = [...new Set(idLists.flat())];
  console.log(`  found ${allIds.length} presentations`);

  console.log('Step 2: scraping each presentation page');
  const talks = await pool(allIds, CONCURRENCY, scrapeTalk);
  console.log(`  scraped ${talks.length} talks`);

  console.log('Step 3: gathering unique speakers');
  const speakerTalks = new Map<string, { name: string; talkIds: string[] }>();
  for (const t of talks) {
    for (const s of t.speakers) {
      const cur = speakerTalks.get(s.id) ?? { name: s.name, talkIds: [] };
      cur.talkIds.push(t.id);
      speakerTalks.set(s.id, cur);
    }
  }
  console.log(`  found ${speakerTalks.size} unique speakers`);

  console.log('Step 4: scraping speaker profiles');
  const speakerIds = [...speakerTalks.keys()];
  const speakers = await pool(speakerIds, CONCURRENCY, (id) =>
    scrapeSpeaker(id, speakerTalks.get(id)!.talkIds),
  );

  // Sort for deterministic diffs
  talks.sort((a, b) => Number(a.id) - Number(b.id));
  speakers.sort((a, b) => a.name.localeCompare(b.name));

  const out: ScrapedData = {
    talks,
    speakers,
    generatedAt: new Date().toISOString(),
  };

  await writeFile(join(DATA_DIR, 'talks.json'), JSON.stringify(talks, null, 2));
  await writeFile(join(DATA_DIR, 'speakers.json'), JSON.stringify(speakers, null, 2));
  await writeFile(join(DATA_DIR, 'pycon.json'), JSON.stringify(out, null, 2));

  console.log(`\nDone. Wrote:`);
  console.log(`  data/talks.json    (${talks.length} talks)`);
  console.log(`  data/speakers.json (${speakers.length} speakers)`);
  console.log(`  data/pycon.json    (combined)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
