/**
 * Vite plugin for generating despia/local.json manifest
 */

import { resolve } from 'path';
import { generateManifest } from './core.js';

/**
 * Vite plugin to generate despia/local.json manifest
 * @param {Object} options
 * @param {string} options.outDir - Output directory (default: 'dist')
 * @param {string} options.entryHtml - Entry HTML file (default: 'index.html')
 */
export function despiaLocalPlugin(options = {}) {
  const { outDir = 'dist', entryHtml = 'index.html' } = options;

  return {
    name: 'despia-local',
    apply: 'build',
    writeBundle(bundleOptions, bundle) {
      const outputDir = bundleOptions.dir || outDir;
      const additionalPaths = [];
      
      // Collect paths from bundle
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' || chunk.type === 'chunk') {
          const filePath = chunk.fileName || fileName;
          const rootRelativePath = filePath.startsWith('/') 
            ? filePath 
            : '/' + filePath.replace(/\\/g, '/');
          additionalPaths.push(rootRelativePath);
        }
      }
      
      try {
        const paths = generateManifest({ 
          outputDir, 
          entryHtml,
          additionalPaths 
        });
        console.log(`✓ Generated despia/local.json with ${paths.length} assets`);
      } catch (error) {
        console.error('Error generating despia/local.json:', error.message);
      }
    }
  };
}
