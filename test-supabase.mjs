import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env from project root
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env not found at', envPath);
  process.exit(1);
}
const envText = fs.readFileSync(envPath, 'utf8');
envText.split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
});

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
console.log('VITE_SUPABASE_URL:', url);
console.log('VITE_SUPABASE_ANON_KEY:', anonKey ? 'present' : 'missing');

if (!url || !anonKey) {
  console.error('Missing Supabase env vars. Aborting test.');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

try {
  const res = await supabase.from('courses').select('*').limit(1);
  console.log('Query result:', res);
} catch (err) {
  console.error('Request error:', err.message || err);
}
