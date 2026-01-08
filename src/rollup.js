/**
 * Rollup plugin for generating despia/local.json manifest
 */

import { generateManifest } from './core.js';

/**
 * Rollup plugin to generate despia/local.json manifest
 * @param {Object} options
 * @param {string} options.outDir - Output directory (default: 'dist')
 * @param {string} options.entryHtml - Entry HTML file (default: 'index.html')
 */
export function despiaOffline(options = {}) {
  const { outDir = 'dist', entryHtml = 'index.html' } = options;

  return {
    name: 'despia-offline',
    writeBundle(outputOptions, bundle) {
      const outputDir = outputOptions.dir || outDir;
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
