export async function compressImageFile(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.\w+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
}

export async function compressFileInput(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return;
  const compressed = await compressImageFile(file);
  if (compressed === file) return;
  const dt = new DataTransfer();
  dt.items.add(compressed);
  input.files = dt.files;
}
