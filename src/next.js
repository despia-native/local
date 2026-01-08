/**
 * Next.js integration for generating despia/local.json manifest
 * 
 * Usage in next.config.js:
 *   const withDespiaLocal = require('@despia/local/next');
 *   module.exports = withDespiaLocal({
 *     entryHtml: 'index.html',
 *     outDir: '.next' // or 'out' for static export
 *   })({
 *     // your next config
 *   });
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
