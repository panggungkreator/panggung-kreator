/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Returns a new File object if compressed, or the original file if compression fails or doesn't yield a smaller size.
 *
 * @param file The original image file to compress
 * @param maxW The maximum width of the output image (default: 1920)
 * @param maxH The maximum height of the output image (default: 1080)
 * @param quality Compression quality from 0.0 to 1.0 (default: 0.8)
 */
export async function compressImage(
  file: File,
  maxW: number = 1920,
  maxH: number = 1080,
  quality: number = 0.8
): Promise<File> {
  // If the file is not an image, return it as-is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Do not compress SVG or GIF (to preserve animations/vector properties)
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output type
        let outputType = file.type;
        if (file.type === "image/png" || file.type === "image/jpeg") {
          outputType = "image/jpeg"; // convert to jpeg for much better compression ratio
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Only return the compressed file if it's actually smaller
            if (blob.size < file.size) {
              const compressedFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          outputType,
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };
    };

    reader.onerror = () => {
      resolve(file);
    };
  });
}
