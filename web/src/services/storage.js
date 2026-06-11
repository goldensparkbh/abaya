import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase.js';

export async function uploadFile(file, path) {
  if (!storage) throw new Error('Firebase Storage is not configured');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadReferenceImages(files, userId) {
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `custom-designs/${userId}/${Date.now()}-${i}.${ext}`;
    const url = await uploadFile(file, path);
    urls.push(url);
  }
  return urls;
}

export async function uploadProductImage(file, shopId) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `products/${shopId}/${Date.now()}.${ext}`;
  return uploadFile(file, path);
}

export async function uploadShopLogo(file, shopId) {
  const ext = file.name.split('.').pop() || 'png';
  const path = `shops/${shopId}/logo.${ext}`;
  return uploadFile(file, path);
}

export async function uploadMeasurementGuide(file) {
  const ext = file.name.split('.').pop() || 'svg';
  const path = `settings/measurement-guide.${ext}`;
  return uploadFile(file, path);
}

export async function uploadAbayaModelImage(file, modelId) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `settings/abaya-models/${modelId}.${ext}`;
  return uploadFile(file, path);
}
