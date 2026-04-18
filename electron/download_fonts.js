/**
 * download_fonts.js
 * Fetches the Google Fonts CSS for the exact fonts used by index.html,
 * extracts the real woff2 URLs, downloads them, and writes a local fonts.css.
 *
 * Run: node download_fonts.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'fonts');

// Exact Google Fonts URL from index.html
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Italiana&family=Barlow+Condensed:wght@400;600;700;800;900&family=Share+Tech+Mono&display=swap';

// Pretend to be a modern Chrome so Google returns woff2 URLs (not ttf)
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function fetchText(url, headers) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    const reqOpts = {
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      headers: headers || {},
    };
    https.get(reqOpts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

  console.log('Fetching Google Fonts CSS...');
  const css = await fetchText(GOOGLE_FONTS_URL, {
    'User-Agent': USER_AGENT,
  });

  // Extract all woff2 URLs from the CSS
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(css)) !== null) {
    if (!urls.includes(match[1])) urls.push(match[1]);
  }

  if (!urls.length) {
    console.error('No woff2 URLs found in CSS response. Raw response:');
    console.error(css.slice(0, 500));
    process.exit(1);
  }

  console.log(`Found ${urls.length} woff2 files. Downloading...\n`);

  // Download each font file
  for (const url of urls) {
    const filename = path.basename(url);
    const dest = path.join(FONTS_DIR, filename);
    process.stdout.write(`  ${filename} ... `);
    try {
      await downloadFile(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 100) {
        console.log(`✗ (file too small: ${size} bytes)`);
      } else {
        console.log(`✓ (${Math.round(size / 1024)}KB)`);
      }
    } catch (e) {
      console.log(`✗ (${e.message})`);
    }
  }

  // Rewrite CSS to point at local files instead of gstatic
  let localCss = css.replace(
    /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g,
    (_, url) => `url('./${path.basename(url)}')`
  );

  // Also strip any @import rules (not needed for local use)
  localCss = localCss.replace(/@import[^;]+;/g, '');

  const cssPath = path.join(FONTS_DIR, 'fonts.css');
  fs.writeFileSync(cssPath, localCss.trim() + '\n');
  console.log(`\nWrote ${cssPath}`);
  console.log('\nNow update index.html:');
  console.log('  Remove the two Google Fonts <link> tags and the @import in the <style> block');
  console.log('  Add: <link rel="stylesheet" href="fonts/fonts.css">');
}

main().catch(console.error);