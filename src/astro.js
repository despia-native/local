/**
 * Astro integration for generating despia/local.json manifest
 * 
 * Usage in astro.config.mjs:
 *   import { defineConfig } from 'astro/config';
 *   import despiaLocal from '@despia/local/astro';
 *   
 *   export default defineConfig({
 *     integrations: [
 *       despiaLocal({ entryHtml: 'index.html' })
 *     ]
 *   });
 */

import { generateManifest } from './core.js';
import { fileURLToPath } from 'url';

export default function despiaLocalIntegration(options = {}) {
  const { entryHtml = 'index.html', outDir = 'dist' } = options;

  return {
    name: 'despia-local',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        // Astro provides dir as a URL object, convert to path
        let outputDir = outDir;
        if (dir) {
          // Handle both URL and string paths
          if (typeof dir === 'string') {
            outputDir = dir;
          } else if (dir.pathname) {
            outputDir = dir.pathname;
          } else if (dir.href) {
            // Convert file:// URL to path
            outputDir = fileURLToPath(dir);
          }
        }
        
        try {
          const manifest = generateManifest({
            outputDir,
            entryHtml
          });
          const entryInfo = manifest.entry ? ` and entry: ${manifest.entry}` : '';
          console.log(`✓ Generated despia/local.json with ${manifest.assets.length} assets${entryInfo}`);
        } catch (error) {
          console.error('Error generating despia/local.json:', error.message);
        }
      }
    }
  };
}
