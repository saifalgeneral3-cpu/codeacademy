// Shared helpers for admin file uploads to Supabase Storage.
import { supabase, STORAGE_BUCKET } from './supabase.js';

const VIDEO_EXT = ['mp4', 'webm', 'mov'];
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
const DOC_EXT = ['pdf', 'zip', 'txt', 'md'];

function ext(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || '');
  return m ? m[1].toLowerCase() : '';
}

export function isVideo(name) { return VIDEO_EXT.includes(ext(name)); }
export function isImage(name) { return IMAGE_EXT.includes(ext(name)); }
export function isDoc(name) { return DOC_EXT.includes(ext(name)); }

export async function uploadFile(file, folder = 'misc') {
  if (!file) return { error: 'No file provided.' };
  const safeName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET)
    .upload(safeName, file, { cacheControl: '3600', upsert: false });
  if (error) return { error: error.message };
  const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
  return { url: pub.publicUrl, path: data.path };
}
