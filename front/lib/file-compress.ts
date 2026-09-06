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

        // Multi-step downscaling (halving) if downscaling by more than 2x to avoid aliasing and preserve sharpness
        let currentCanvas = document.createElement("canvas");
        currentCanvas.width = img.width;
        currentCanvas.height = img.height;
        let currentCtx = currentCanvas.getContext("2d");

        if (!currentCtx) {
          resolve(file);
          return;
        }

        currentCtx.imageSmoothingEnabled = true;
        currentCtx.imageSmoothingQuality = "high";
        currentCtx.drawImage(img, 0, 0);

        let curW = img.width;
        let curH = img.height;

        // Step-down by halving dimensions until close to target
        while (curW / 2 > width && curH / 2 > height) {
          const nextW = Math.round(curW / 2);
          const nextH = Math.round(curH / 2);
          const stepCanvas = document.createElement("canvas");
          stepCanvas.width = nextW;
          stepCanvas.height = nextH;
          const stepCtx = stepCanvas.getContext("2d");
          if (stepCtx) {
            stepCtx.imageSmoothingEnabled = true;
            stepCtx.imageSmoothingQuality = "high";
            stepCtx.drawImage(currentCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
            currentCanvas = stepCanvas;
            curW = nextW;
            curH = nextH;
          } else {
            break;
          }
        }

        // Final canvas with exact target dimensions
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = width;
        finalCanvas.height = height;
        const finalCtx = finalCanvas.getContext("2d");

        if (!finalCtx) {
          resolve(file);
          return;
        }

        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = "high";
        finalCtx.drawImage(currentCanvas, 0, 0, curW, curH, 0, 0, width, height);

        // Prefer modern WebP for smaller size and high quality preservation, fallback to jpeg
        let outputType = "image/webp";
        if (file.type === "image/png") {
          // Check if canvas toBlob supports image/webp
          outputType = "image/webp";
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          outputType = "image/webp";
        }

        // Test webp support or fallback to jpeg
        finalCanvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to image/jpeg if webp not supported
              finalCanvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) {
                    resolve(file);
                    return;
                  }
                  if (jpegBlob.size < file.size) {
                    const compressedFile = new File([jpegBlob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                  } else {
                    resolve(file);
                  }
                },
                "image/jpeg",
                quality
              );
              return;
            }

            // If compressed blob is smaller or if resizing reduced dimensions significantly
            if (blob.size < file.size || width < img.width || height < img.height) {
              const newFileName = file.name.replace(/\.[^.]+$/, ".webp");
              const compressedFile = new File([blob], newFileName, {
                type: "image/webp",
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
