import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function loadEnvFile(dir: string): Record<string, string> {
  const file = path.join(dir, '.env');
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  const content = fs.readFileSync(file, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

export default defineConfig(() => {
  const root = path.resolve(__dirname);
  const env = loadEnvFile(root);
  return {
    plugins: [react()],
    root: '.',
    base: './',
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY ?? ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN ?? ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID ?? ''),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET ?? ''),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? ''),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID ?? ''),
      'import.meta.env.VITE_REVENUECAT_API_KEY': JSON.stringify(env.VITE_REVENUECAT_API_KEY ?? ''),
    },
  };
});
