import { compressImage } from '../file-compress'

export async function compressImageForTarget(
  file: File,
  target: 'avatar' | 'portfolio' | 'thumbnail'
): Promise<File> {
  const configs = {
    avatar: { maxW: 400, maxH: 400, quality: 0.8 },
    portfolio: { maxW: 1200, maxH: 800, quality: 0.85 },
    thumbnail: { maxW: 400, maxH: 300, quality: 0.8 },
  }

  const { maxW, maxH, quality } = configs[target]
  return await compressImage(file, maxW, maxH, quality)
}
