/**
 * Next.js integration for generating despia/local.json manifest
 * 
 * Usage in next.config.js:
 *   const withDespiaOffline = require('@despia/local/next');
 *   module.exports = withDespiaOffline({
 *     entryHtml: 'index.html',
 *     outDir: '.next' // or 'out' for static export
 *   })({
 *     // your next config
 *   });
 * 
 * Or use the webpack plugin approach:
 *   const DespiaOfflinePlugin = require('@despia/local/webpack');
 *   module.exports = {
 *     webpack: (config) => {
 *       config.plugins.push(new DespiaOfflinePlugin({ outDir: '.next' }));
 *       return config;
 *     }
 *   };
 */

import { generateManifest } from './core.js';
import DespiaOfflinePlugin from './webpack.js';

export function withDespiaOffline(pluginOptions = {}) {
  const offlineConfig = {
    outDir: pluginOptions.outDir || '.next',
    entryHtml: pluginOptions.entryHtml || 'index.html',
    ...pluginOptions
  };

  return (nextConfig = {}) => {
    const existingWebpack = nextConfig.webpack;

    return {
      ...nextConfig,
      webpack: (config, options) => {
        // Add Despia Offline plugin
        config.plugins.push(
          new DespiaOfflinePlugin({
            outDir: offlineConfig.outDir,
            entryHtml: offlineConfig.entryHtml
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
export default withDespiaOffline;
