/**
 * Nuxt module for generating despia/local.json manifest
 * 
 * Usage in nuxt.config.js:
 *   export default {
 *     modules: ['@despia/local/nuxt'],
 *     despiaOffline: {
 *       entryHtml: 'index.html'
 *     }
 *   }
 * 
 * Or use as a Nuxt module in modules/ directory:
 *   // modules/despia-offline.js
 *   import DespiaOfflineModule from '@despia/local/nuxt';
 *   export default DespiaOfflineModule;
 */

import { generateManifest } from './core.js';

export default function DespiaOfflineModule(moduleOptions) {
  const options = {
    entryHtml: 'index.html',
    ...moduleOptions,
    ...(this.options?.despiaOffline || {})
  };

  // Hook into Nuxt build completion
  this.nuxt.hook('build:done', async (builder) => {
    // Determine output directory based on Nuxt mode
    let outputDir;
    
    if (this.options.generate) {
      // Static site generation
      outputDir = '.output/public';
    } else if (this.options.target === 'static') {
      outputDir = 'dist';
    } else {
      // SSR mode - assets are in .nuxt/dist/client
      outputDir = '.nuxt/dist/client';
    }
    
    // Try to generate manifest
    const altDirs = [outputDir, '.output/public', 'dist', '.nuxt/dist'];
    let generated = false;
    
    for (const dir of altDirs) {
      try {
        const paths = generateManifest({
          outputDir: dir,
          entryHtml: options.entryHtml
        });
        console.log(`✓ Generated despia/local.json with ${paths.length} assets`);
        generated = true;
        break;
      } catch (e) {
        // Continue to next directory
      }
    }
    
    if (!generated) {
      console.warn('⚠ Could not find Nuxt build output directory');
    }
  });
}
