/**
 * esbuild plugin for generating despia/local.json manifest
 * 
 * Usage:
 *   import { build } from 'esbuild';
 *   import { despiaOfflineEsbuild } from '@despia/offline/esbuild';
 *   
 *   await build({
 *     plugins: [despiaOfflineEsbuild({ outDir: 'dist' })]
 *   });
 */

import { generateManifest } from './core.js';
import { relative } from 'path';

export function despiaOfflineEsbuild(options = {}) {
  const { outDir = 'dist', entryHtml = 'index.html' } = options;

  return {
    name: 'despia-offline',
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length > 0) {
          return; // Don't generate manifest if build failed
        }

        const additionalPaths = [];
        const actualOutDir = build.initialOptions.outdir || outDir;
        const outDirPath = typeof actualOutDir === 'string' ? actualOutDir : outDir;
        
        // Collect output files from esbuild result
        if (result.outputFiles) {
          for (const file of result.outputFiles) {
            const filePath = file.path;
            // Get relative path from output directory
            try {
              const relativePath = relative(outDirPath, filePath);
              const rootRelativePath = '/' + relativePath.replace(/\\/g, '/');
              additionalPaths.push(rootRelativePath);
            } catch (e) {
              // If relative path calculation fails, use filename
              const filename = filePath.split(/[/\\]/).pop();
              if (filename) {
                additionalPaths.push('/' + filename);
              }
            }
          }
        }

        try {
          const paths = generateManifest({
            outputDir: outDirPath,
            entryHtml,
            additionalPaths
          });
          console.log(`✓ Generated despia/local.json with ${paths.length} assets`);
        } catch (error) {
          console.error('Error generating despia/local.json:', error.message);
        }
      });
    }
  };
}
