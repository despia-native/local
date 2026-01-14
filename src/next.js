/**
 * Next.js integration for generating despia/local.json manifest
 * 
 * Usage for static export:
 *   const withDespiaLocal = require('@despia/local/next');
 *   module.exports = withDespiaLocal({
 *     entryHtml: 'index.html',
 *     outDir: 'out' // Next.js static export directory
 *   })({
 *     output: 'export',
 *     // your next config
 *   });
 * 
 * Usage for SSR (recommended: use post-build script):
 *   // package.json
 *   {
 *     "scripts": {
 *       "build": "next build",
 *       "postbuild": "despia-local .next/static"
 *     }
 *   }
 * 
 * Or use the webpack plugin approach (works best for static export):
 *   const DespiaLocalPlugin = require('@despia/local/webpack');
 *   module.exports = {
 *     webpack: (config) => {
 *       config.plugins.push(new DespiaLocalPlugin({ outDir: '.next' }));
 *       return config;
 *     }
 *   };
 */

import { generateManifest } from './core.js';
import DespiaLocalPlugin from './webpack.js';

export function withDespiaLocal(pluginOptions = {}) {
  const localConfig = {
    outDir: pluginOptions.outDir || '.next',
    entryHtml: pluginOptions.entryHtml || 'index.html',
    ...pluginOptions
  };

  return (nextConfig = {}) => {
    // Detect if this is static export or SSR
    const isStaticExport = nextConfig.output === 'export';
    const existingWebpack = nextConfig.webpack;

    return {
      ...nextConfig,
      webpack: (config, options) => {
        // Only add webpack plugin for client builds (not server builds)
        // For SSR, the webpack plugin will target .next/static during client build
        // For static export, it works normally
        if (!options.isServer) {
          // Determine the correct output directory
          let targetOutDir = localConfig.outDir;
          
          // For SSR apps, target .next/static where client assets are stored
          if (!isStaticExport && targetOutDir === '.next') {
            targetOutDir = '.next/static';
          }
          
          config.plugins.push(
            new DespiaLocalPlugin({
              outDir: targetOutDir,
              entryHtml: localConfig.entryHtml,
              skipEntryHtml: !isStaticExport // Skip entryHtml for SSR
            })
          );
        }

        // Call existing webpack config if present
        if (typeof existingWebpack === 'function') {
          return existingWebpack(config, options);
        }

        return config;
      }
    };
  };
}

// Also export as CommonJS for Next.js compatibility
export default withDespiaLocal;
