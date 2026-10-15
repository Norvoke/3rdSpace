export type MusicProvider = 'spotify' | 'apple' | 'youtube';

export interface FavoriteSong {
  url: string;
  provider: MusicProvider;
  title: string;
  artist: string;
  cover: string;
}

type ParsedLink = { provider: MusicProvider; id: string; country?: string };

// Only IDs are pulled out of the user's link — every fetch below targets a
// fixed provider endpoint built from that ID, never the user-supplied URL.
export function parseMusicLink(raw: string): ParsedLink | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'open.spotify.com') {
    const m = u.pathname.match(/\/track\/([A-Za-z0-9]{22})/);
    return m ? { provider: 'spotify', id: m[1] } : null;
  }

  if (host === 'music.apple.com') {
    const id = u.searchParams.get('i') || u.pathname.match(/\/song\/(?:[^/]+\/)?(\d+)/)?.[1];
    const country = u.pathname.match(/^\/([a-z]{2})\//)?.[1];
    return id && /^\d+$/.test(id) ? { provider: 'apple', id, country } : null;
  }

  if (['music.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
    const id = host === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
    return id && /^[\w-]{11}$/.test(id) ? { provider: 'youtube', id } : null;
  }

  return null;
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function get(url: string, json: true): Promise<any>;
async function get(url: string, json: false): Promise<string>;
async function get(url: string, json: boolean) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (3rdSpace link preview)' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).hostname}`);
  return json ? res.json() : res.text();
}

export async function resolveFavoriteSong(raw: string): Promise<FavoriteSong | null> {
  const link = parseMusicLink(raw);
  if (!link) return null;

  if (link.provider === 'spotify') {
    const url = `https://open.spotify.com/track/${link.id}`;
    const html = await get(url, false);
    const meta = (key: string) =>
      html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];
    const title = meta('og:title');
    if (!title) return null;
    return {
      url,
      provider: 'spotify',
      title: decode(title),
      artist: decode(meta('music:musician_description') || meta('og:description')?.split(' · ')[0] || ''),
      cover: meta('og:image') || '',
    };
  }

  if (link.provider === 'apple') {
    const data = await get(`https://itunes.apple.com/lookup?id=${link.id}&country=${link.country || 'us'}`, true);
    const track = data.results?.find((r: any) => r.wrapperType === 'track');
    if (!track) return null;
    return {
      url: track.trackViewUrl?.replace(/[?&]uo=\d+/, '') || `https://music.apple.com/song/${link.id}`,
      provider: 'apple',
      title: track.trackName,
      artist: track.artistName,
      // The 100x100 URL accepts any size in its last path segment.
      cover: track.artworkUrl100?.replace(/\/\d+x\d+bb\./, '/600x600bb.') || '',
    };
  }

  const url = `https://music.youtube.com/watch?v=${link.id}`;
  const data = await get(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${link.id}`)}`,
    true
  );
  return {
    url,
    provider: 'youtube',
    title: data.title,
    // Auto-generated YouTube Music uploads live on "<Artist> - Topic" channels.
    artist: (data.author_name || '').replace(/ - Topic$/, ''),
    cover: data.thumbnail_url || `https://i.ytimg.com/vi/${link.id}/hqdefault.jpg`,
  };
}

// ponytail: self-check for link parsing — `npx ts-node src/utils/musicLink.ts` (add `--live` to hit the providers)
if (require.main === module) {
  const eq = (a: unknown, b: unknown, msg: string) => console.assert(JSON.stringify(a) === JSON.stringify(b), msg, a);
  eq(parseMusicLink('https://open.spotify.com/intl-de/track/4cOdK2wGLETKBW3PvgPWqT?si=abc'), { provider: 'spotify', id: '4cOdK2wGLETKBW3PvgPWqT' }, 'spotify intl track');
  eq(parseMusicLink('https://open.spotify.com/album/4cOdK2wGLETKBW3PvgPWqT'), null, 'spotify album rejected');
  eq(parseMusicLink('https://music.apple.com/gb/album/x/1773292758?i=1773293184'), { provider: 'apple', id: '1773293184', country: 'gb' }, 'apple album?i=');
  eq(parseMusicLink('https://music.apple.com/us/song/never-gonna/1773293184'), { provider: 'apple', id: '1773293184', country: 'us' }, 'apple song path');
  eq(parseMusicLink('https://music.youtube.com/watch?v=dQw4w9WgXcQ&si=x'), { provider: 'youtube', id: 'dQw4w9WgXcQ' }, 'yt music');
  eq(parseMusicLink('https://youtu.be/dQw4w9WgXcQ'), { provider: 'youtube', id: 'dQw4w9WgXcQ' }, 'youtu.be');
  eq(parseMusicLink('https://evil.com/track/4cOdK2wGLETKBW3PvgPWqT'), null, 'unknown host rejected');
  eq(parseMusicLink('not a url'), null, 'garbage rejected');
  console.log('musicLink parse self-check passed');

  if (process.argv.includes('--live')) {
    Promise.all([
      'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
      'https://music.apple.com/us/album/x/1773292758?i=1773293184',
      'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
    ].map(resolveFavoriteSong)).then(r => console.log(r));
  }
}
