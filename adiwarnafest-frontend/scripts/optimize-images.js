import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public/comboard_photos');

async function optimizeImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await optimizeImages(fullPath);
    } else if (entry.isFile() && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
      const stats = await fs.stat(fullPath);
      
      // Only optimize if file is larger than 500KB
      if (stats.size > 500 * 1024) {
        console.log(`Optimizing: ${entry.name} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        
        const buffer = await fs.readFile(fullPath);
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Resize to a reasonable width (max 1200px) and compress
        await image
          .resize({ width: 1200, withoutEnlargement: true })
          .jpeg({ quality: 75, progressive: true })
          .toFile(fullPath + '.tmp');

        await fs.rename(fullPath + '.tmp', fullPath);
        
        const newStats = await fs.stat(fullPath);
        console.log(`  -> Done: ${(newStats.size / 1024).toFixed(2)} KB`);
      }
    }
  }
}

console.log('Starting image optimization...');
optimizeImages(PUBLIC_DIR)
  .then(() => console.log('Optimization complete!'))
  .catch(err => console.error('Error:', err));
