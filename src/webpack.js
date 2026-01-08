/**
 * Webpack plugin for generating despia/local.json manifest
 */

import { generateManifest } from './core.js';

class DespiaLocalPlugin {
  constructor(options = {}) {
    this.options = {
      outDir: options.outDir || 'dist',
      entryHtml: options.entryHtml || 'index.html',
      ...options
    };
  }

  apply(compiler) {
    const pluginName = 'DespiaLocalPlugin';
    
    compiler.hooks.afterEmit.tapAsync(pluginName, (compilation, callback) => {
      // Get output path from webpack compiler
      const outputPath = compilation.compiler.outputPath || this.options.outDir;
      const additionalPaths = [];
      
      // Collect all emitted assets
      for (const [filename, asset] of Object.entries(compilation.assets)) {
        if (asset) {
          const rootRelativePath = '/' + filename.replace(/\\/g, '/');
          additionalPaths.push(rootRelativePath);
        }
      }
      
      // Also collect from compilation.getAssets() if available (webpack 5)
      if (compilation.getAssets) {
        for (const asset of compilation.getAssets()) {
          const rootRelativePath = '/' + asset.name.replace(/\\/g, '/');
          additionalPaths.push(rootRelativePath);
        }
      }
      
      try {
        const paths = generateManifest({
          outputDir: outputPath,
          entryHtml: this.options.entryHtml,
          additionalPaths
        });
        console.log(`✓ Generated despia/local.json with ${paths.length} assets`);
      } catch (error) {
        console.error('Error generating despia/local.json:', error.message);
      }
      
      callback();
    });
  }
}

export default DespiaLocalPlugin;
