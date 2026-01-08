/**
 * SvelteKit adapter for generating despia/local.json manifest
 * 
 * Usage in vite.config.js:
 *   import { sveltekit } from '@sveltejs/kit/vite';
 *   import { despiaLocalSvelteKit } from '@despia/local/sveltekit';
 *   
 *   export default {
 *     plugins: [
 *       sveltekit(),
 *       despiaLocalSvelteKit({ entryHtml: 'index.html' })
 *     ]
 *   }
 */

import { generateManifest } from './core.js';

export function despiaLocalSvelteKit(options = {}) {
  const { entryHtml = 'index.html' } = options;

  return {
    name: 'despia-local-sveltekit',
    apply: 'build',
    buildEnd() {
      // SvelteKit outputs to build directory
      const outputDirs = ['build', '.svelte-kit', 'dist'];
      
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
      
      console.warn('⚠ Could not find SvelteKit build output directory');
    }
  };
}
