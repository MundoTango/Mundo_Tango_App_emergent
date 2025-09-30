/**
 * Native browser-based image compression using Canvas API
 * Replaces browser-image-compression library that hangs in Replit
 */

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

export async function compressImageNative(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    quality = 0.8
  } = options;

  console.log(`🖼️ [nativeCompression] Starting for ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('❌ [nativeCompression] Canvas context unavailable');
      resolve(file);
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = (height / width) * maxWidthOrHeight;
            width = maxWidthOrHeight;
          } else {
            width = (width / height) * maxWidthOrHeight;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('❌ [nativeCompression] Blob creation failed');
              resolve(file);
              return;
            }

            // Check if compressed size meets requirement
            const compressedSizeMB = blob.size / 1024 / 1024;
            
            if (compressedSizeMB > maxSizeMB && quality > 0.3) {
              // Try again with lower quality
              const newQuality = quality * 0.8;
              console.log(`🔄 [nativeCompression] Still ${compressedSizeMB.toFixed(2)}MB, retrying with quality ${newQuality.toFixed(2)}`);
              
              canvas.toBlob(
                (retryBlob) => {
                  if (!retryBlob) {
                    resolve(file);
                    return;
                  }
                  
                  const finalFile = new File(
                    [retryBlob],
                    file.name.replace(/\.\w+$/, '.jpg'),
                    { type: 'image/jpeg' }
                  );
                  
                  const reduction = ((1 - retryBlob.size / file.size) * 100).toFixed(1);
                  console.log(`✅ [nativeCompression] Done! ${(retryBlob.size/1024/1024).toFixed(2)}MB (-${reduction}%)`);
                  resolve(finalFile);
                },
                'image/jpeg',
                newQuality
              );
            } else {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.\w+$/, '.jpg'),
                { type: 'image/jpeg' }
              );
              
              const reduction = ((1 - blob.size / file.size) * 100).toFixed(1);
              console.log(`✅ [nativeCompression] Done! ${compressedSizeMB.toFixed(2)}MB (-${reduction}%)`);
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        console.error('❌ [nativeCompression] Error:', error);
        resolve(file);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      console.error('❌ [nativeCompression] Image load failed');
      resolve(file);
    };

    img.src = URL.createObjectURL(file);
  });
}
