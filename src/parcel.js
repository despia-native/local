/**
 * Parcel plugin for generating despia/local.json manifest
 * 
 * Note: Parcel 2.x uses a different plugin system. For Parcel projects,
 * we recommend using the standalone CLI script instead:
 * 
 *   "scripts": {
 *     "build": "parcel build",
 *     "postbuild": "despia-local dist"
 *   }
 * 
 * For Parcel 1.x, you can use this plugin, but the API may vary.
 */

import { generateManifest } from './core.js';

// Parcel 2.x plugin format
export default function(api) {
  const { outDir = 'dist', entryHtml = 'index.html' } = api.options || {};

  return {
    name: 'despia-local',
    async bundleEnd({ bundleGraph }) {
      const additionalPaths = [];
      
      // Collect all bundles
      if (bundleGraph && bundleGraph.getBundles) {
        bundleGraph.getBundles().forEach(bundle => {
          const filePath = bundle.filePath || bundle.name;
          if (filePath) {
            const rootRelativePath = '/' + filePath.replace(/\\/g, '/');
            additionalPaths.push(rootRelativePath);
          }
        });
      }

      try {
        const paths = generateManifest({
          outputDir: api.options?.outDir || outDir,
          entryHtml,
          additionalPaths
        });
        console.log(`✓ Generated despia/local.json with ${paths.length} assets`);
      } catch (error) {
        console.error('Error generating despia/local.json:', error.message);
        console.warn('💡 Tip: For Parcel projects, use the standalone CLI: "despia-local dist"');
      }
    }
  };
}
