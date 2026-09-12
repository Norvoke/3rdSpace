import sanitizeHtml from 'sanitize-html';

const SONG_HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
  'soundcloud.com', 'w.soundcloud.com',
  'open.spotify.com',
]);

// Same denylist sanitizeCustomCSS applies, run again over the final HTML so
// it also covers anything smuggled into a `style="..."` attribute value —
// sanitize-html allowlists the *attribute name* but doesn't parse CSS inside it.
function stripDangerousCss(value: string): string {
  return value
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/-moz-binding/gi, '')
    .replace(/behavior\s*:/gi, '');
}

export function sanitizeCustomHTML(html: string): string {
  const cleaned = sanitizeHtml(html, {
    allowedTags: [
      'b', 'i', 'u', 'strong', 'em', 's', 'strike', 'small', 'mark', 'sub', 'sup',
      'marquee', 'blink', 'img', 'a', 'div', 'span', 'p', 'br', 'hr',
      'table', 'thead', 'tbody', 'tr', 'td', 'th', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'center', 'font',
    ],
    // No on* handlers anywhere — deliberately omitted, not an oversight.
    // `style`/`class` ARE allowed (this is the whole "make it truly yours"
    // MySpace feature — a lot of pasted profile HTML relies on them); the
    // stripDangerousCss() pass below is what keeps `style=` safe.
    allowedAttributes: {
      '*': ['class', 'style', 'align', 'valign'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      font: ['color', 'face', 'size'],
      table: ['border', 'cellpadding', 'cellspacing', 'width', 'height', 'bgcolor'],
      td: ['width', 'height', 'bgcolor', 'colspan', 'rowspan'],
      th: ['width', 'height', 'bgcolor', 'colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
    disallowedTagsMode: 'discard',
  });
  return stripDangerousCss(cleaned);
}

export function sanitizeCustomCSS(css: string): string {
  return stripDangerousCss(
    css
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/@import[^;]*;?/gi, '')
  );
}

export function sanitizeSongUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && SONG_HOSTS.has(parsed.hostname)) return url;
  } catch {
    // fall through
  }
  return undefined;
}

// ponytail: self-check for the sanitizers' branches — `npx ts-node src/utils/sanitizeProfile.ts`
if (require.main === module) {
  const html = sanitizeCustomHTML('<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">click</a><img src="data:image/png;base64,abc">');
  console.assert(!html.includes('<script'), 'script tag should be stripped');
  console.assert(!html.includes('onerror'), 'event handler should be stripped');
  console.assert(!html.includes('javascript:'), 'javascript: href should be stripped');
  console.assert(html.includes('data:image/png'), 'data: image src should survive');

  const decorated = sanitizeCustomHTML('<div class="glitter" style="color:pink;background:url(javascript:alert(1))"><font color="red" size="5">hi</font></div>');
  console.assert(decorated.includes('class="glitter"'), 'class attribute should survive (customCSS targets it)');
  console.assert(decorated.includes('color:pink'), 'harmless inline style should survive');
  console.assert(!decorated.includes('javascript:'), 'javascript: inside a style attribute should still be stripped');
  console.assert(decorated.includes('color="red"'), 'legacy <font> attributes should survive');

  const css = sanitizeCustomCSS('body{color:red} @import url(evil.css); .x{behavior:url(evil.htc)}');
  console.assert(!css.includes('@import'), '@import should be stripped');
  console.assert(!css.includes('behavior:'), 'behavior: should be stripped');

  console.assert(sanitizeSongUrl('https://evil.com/phish') === undefined, 'non-allowlisted host should be rejected');
  console.assert(sanitizeSongUrl('https://w.soundcloud.com/player/?url=x') !== undefined, 'allowlisted host should pass');

  console.log('sanitizeProfile self-check passed');
}
