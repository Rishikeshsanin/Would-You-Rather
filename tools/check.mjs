import fs from 'node:fs';
import vm from 'node:vm';

const files = ['index.html', 'styles.css', 'questions.js', 'app.js', 'vercel.json'];
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('questions.js', 'utf8'), context);

const qs = context.window.WYR_QUESTIONS;
const source = context.window.WYR_DATA_SOURCE;

if (!source || source.mode !== 'historical_snapshot') {
  throw new Error('Historical data-source metadata is missing');
}
if (!Array.isArray(qs) || qs.length !== 100) {
  throw new Error(`Expected 100 questions, got ${qs?.length}`);
}
if (new Set(qs.map(q => q.id)).size !== 100) {
  throw new Error('Question IDs are not unique');
}

for (const q of qs) {
  if (!q.red?.trim() || !q.blue?.trim()) {
    throw new Error(`Incomplete question ${q.id}`);
  }
  if (!Number.isInteger(q.redVotes) || q.redVotes <= 0) {
    throw new Error(`Invalid redVotes for ${q.id}`);
  }
  if (!Number.isInteger(q.blueVotes) || q.blueVotes <= 0) {
    throw new Error(`Invalid blueVotes for ${q.id}`);
  }
}

const appSource = fs.readFileSync('app.js', 'utf8');
if (/localStorage|WYR_API_BASE|\/vote|fetch\s*\(/.test(appSource)) {
  throw new Error('A vote-writing or runtime API path exists in app.js');
}

const indexSource = fs.readFileSync('index.html', 'utf8');
if (/config\.js|api\/vote|supabase/i.test(indexSource)) {
  throw new Error('index.html references removed runtime voting infrastructure');
}

JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
new Function(appSource);

console.log('✓ 100 unique historical polls');
console.log('✓ Every poll has positive recorded vote counts');
console.log('✓ No vote-writing or runtime data API path');
console.log('✓ JavaScript and Vercel config parse');
