const { readFileSync, readdirSync, statSync } = require('fs');
const { join } = require('path');
const { parse } = require('@swc/core');

function walk(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (st.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx'))) {
      try {
        const code = readFileSync(full, 'utf8');
        parse(code, { syntax: 'typescript', tsx: full.endsWith('.tsx'), isModule: true });
      } catch (e) {
        console.error('PARSE FAIL:', full);
        console.error(e.message);
        process.exit(1);
      }
    }
  }
}

walk(process.cwd());
console.log('SWC parse check passed');
