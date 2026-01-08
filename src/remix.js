/**
 * Remix integration for generating despia/local.json manifest
 * 
 * Usage in remix.config.js or vite.config.js:
 *   import { remix } from '@remix-run/dev';
 *   import { despiaOfflineRemix } from '@despia/offline/remix';
 *   
 *   export default {
 *     plugins: [
 *       remix(),
 *       despiaOfflineRemix({ entryHtml: 'index.html' })
 *     ]
 *   }
 */

import { generateManifest } from './core.js';

export function despiaOfflineRemix(options = {}) {
  const { entryHtml = 'index.html', outDir = 'build/client' } = options;

  return {
    name: 'despia-offline-remix',
    apply: 'build',
    buildEnd() {
      // Remix outputs to build/client for client assets
      const outputDirs = ['build/client', 'build', 'public/build'];
      
      for (const outputDir of outputDirs) {
        try {
          const paths = generateManifest({
            outputDir,
            entryHtml
          });
          console.log(`✓ Generated despia/local.json with ${paths.length} assets`);
          return; // Success, exit
        } catch (error) {
          // Try next directory
          continue;
        }
      }
      
      console.warn('⚠ Could not find Remix build output directory');
    }
  };
}
