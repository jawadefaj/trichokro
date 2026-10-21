import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

// Lets the user pick a photo (camera or gallery) and returns the asset, or null
export async function pickImage({ camera = false, square = true } = {}) {
  const perm = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error(camera ? 'Allow camera access to take a photo.' : 'Allow photo access to choose a picture.');
  const opts = { mediaTypes: ['images'], quality: 0.6, base64: true, allowsEditing: true, aspect: square ? [1, 1] : [4, 3] };
  const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  return res.assets[0];
}

// Uploads to <bucket>/<uid>/<name>-<time>.jpg. Returns { path, publicUrl }
export async function uploadImage(asset, bucket, name) {
  const { data } = await supabase.auth.getSession();
  const uid = data.session.user.id;
  const path = `${uid}/${name}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(bucket).upload(path, decode(asset.base64), {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  const publicUrl = bucket === 'avatars' ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
  return { path, publicUrl };
}
