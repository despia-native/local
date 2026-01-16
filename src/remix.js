/**
 * Remix integration for generating despia/local.json manifest
 * 
 * Usage in remix.config.js or vite.config.js:
 *   import { remix } from '@remix-run/dev';
 *   import { despiaLocalRemix } from '@despia/local/remix';
 *   
 *   export default {
 *     plugins: [
 *       remix(),
 *       despiaLocalRemix({ entryHtml: 'index.html' })
 *     ]
 *   }
 */

import { generateManifest } from './core.js';

export function despiaLocalRemix(options = {}) {
  const { entryHtml = 'index.html', outDir = 'build/client' } = options;

  return {
    name: 'despia-local-remix',
    apply: 'build',
    buildEnd() {
      // Remix outputs to build/client for client assets
      const outputDirs = ['build/client', 'build', 'public/build'];
      
      for (const outputDir of outputDirs) {
        try {
          const manifest = generateManifest({
            outputDir,
            entryHtml
          });
          const entryInfo = manifest.entry ? ` and entry: ${manifest.entry}` : '';
          console.log(`✓ Generated despia/local.json with ${manifest.assets.length} assets${entryInfo}`);
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
