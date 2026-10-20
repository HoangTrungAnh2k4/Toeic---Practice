/**
 * Thu nhỏ ảnh về cạnh dài `maxSide` rồi xuất WebP bằng canvas (chỉ chạy trên trình duyệt).
 * Trình duyệt không xuất được WebP (Safari cũ) thì `toBlob` trả PNG, ảnh vẫn dùng được nhưng nặng hơn.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.85): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob) throw new Error('Không nén được ảnh');
    const extension = blob.type === 'image/webp' ? 'webp' : 'png';
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, { type: blob.type });
}
