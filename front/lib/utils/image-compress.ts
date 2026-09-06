import { compressImage } from '../file-compress'

export async function compressImageForTarget(
  file: File,
  target: 'avatar' | 'portfolio' | 'thumbnail'
): Promise<File> {
  const configs = {
    avatar: { maxW: 500, maxH: 500, quality: 0.88 },
    portfolio: { maxW: 1440, maxH: 960, quality: 0.88 },
    thumbnail: { maxW: 500, maxH: 375, quality: 0.85 },
  }

  const { maxW, maxH, quality } = configs[target]
  return await compressImage(file, maxW, maxH, quality)
}
