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
 *     // your Next.js config
 *   });
 * 
 * For SSR apps, use the post-build script approach:
 *   // package.json
 *   {
 *     "scripts": {
 *       "build": "next build",
 *       "postbuild": "despia-local .next/static --output public/despia/local.json"
 *     }
 *   }
 * 
 * Or use the webpack plugin approach:
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
    const existingWebpack = nextConfig.webpack;

    return {
      ...nextConfig,
      webpack: (config, options) => {
        // Add Despia Local plugin
        config.plugins.push(
          new DespiaLocalPlugin({
            outDir: localConfig.outDir,
            entryHtml: localConfig.entryHtml
          })
        );

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
