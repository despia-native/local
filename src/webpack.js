/**
 * Webpack plugin for generating despia/local.json manifest
 */

import { generateManifest } from './core.js';
import { readdirSync } from 'fs';
import { join, relative, extname } from 'path';

class DespiaLocalPlugin {
  constructor(options = {}) {
    this.options = {
      outDir: options.outDir || 'dist',
      entryHtml: options.entryHtml || 'index.html',
      skipEntryHtml: options.skipEntryHtml || false,
      extensions: options.extensions || ['.js', '.css', '.mjs', '.woff', '.woff2', '.ttf', '.eot', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.json', '.xml', '.txt'],
      publicDir: options.publicDir || null,
      ...options
    };
  }

  /**
   * Scan public directory for static assets
   */
  scanPublicDir(dir, baseDir, assets) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip despia folder to avoid circular reference
          if (entry.name !== 'despia') {
            this.scanPublicDir(fullPath, baseDir, assets);
          }
        } else {
          const ext = extname(entry.name).toLowerCase();
          if (this.options.extensions.includes(ext)) {
            const relativePath = '/' + relative(baseDir, fullPath).replace(/\\/g, '/');
            assets.add(relativePath);
          }
        }
      }
    } catch (e) {
      // Ignore permission errors
    }
  }

  apply(compiler) {
    const pluginName = 'DespiaLocalPlugin';
    const isNextJs = this.options.isNextJs || false;
    const injectIntoAssets = this.options.injectIntoAssets || false;
    
    // For Next.js: Use 'emit' phase to inject into compilation.assets
    // For other bundlers: Use 'afterEmit' phase to write to filesystem
    const hook = injectIntoAssets ? compiler.hooks.emit : compiler.hooks.afterEmit;
    
    hook.tapAsync(pluginName, (compilation, callback) => {
      // Detect if this is a Next.js server build
      // Next.js server builds have specific compiler name patterns
      const compilerName = compilation.compiler.name || '';
      const isNextJsServerBuild = (compilerName.includes('server') || 
                                   compilerName.includes('Server') ||
                                   compilation.compiler.options?.target === 'node') &&
                                   isNextJs;
      
      // Skip manifest generation for server builds (SSR apps don't need server-side assets)
      if (isNextJsServerBuild) {
        callback();
        return;
      }
      
      const assets = new Set();
      
      if (injectIntoAssets && isNextJs) {
        // Next.js mode: Collect from webpack compilation and public folder
        
        // 1. Collect all webpack-generated assets from .next/static
        for (const filename of Object.keys(compilation.assets)) {
          if (filename === this.options.manifestPath) {
            continue; // Skip the manifest file itself
          }
          
          const ext = extname(filename).toLowerCase();
          if (this.options.extensions.includes(ext)) {
            // Next.js serves these at /_next/static/...
            assets.add(`/_next/static/${filename}`);
          }
        }
        
        // 2. Scan /public folder for static assets
        if (this.options.publicDir) {
          this.scanPublicDir(this.options.publicDir, this.options.publicDir, assets);
        }
        
        // 3. Separate entry from other assets and generate object format
        const entryPath = this.options.entryHtml.startsWith('/') 
          ? this.options.entryHtml 
          : '/' + this.options.entryHtml;
        const hasEntry = assets.has(entryPath) && !this.options.skipEntryHtml;
        const assetList = Array.from(assets)
          .filter(path => path !== entryPath || this.options.skipEntryHtml)
          .sort();
        
        const manifestObj = {
          entry: hasEntry ? entryPath : null,
          assets: assetList
        };
        const manifest = JSON.stringify(manifestObj, null, 2);
        
        // 4. Inject into webpack output at despia/local.json
        const manifestPath = this.options.manifestPath || 'despia/local.json';
        compilation.assets[manifestPath] = {
          source: () => manifest,
          size: () => Buffer.byteLength(manifest, 'utf8')
        };
        
        console.log(`✓ Injected despia/local.json into build with ${assetList.length} assets${hasEntry ? ` and entry: ${entryPath}` : ''}`);
      } else {
        // Traditional mode: Write to filesystem (for other bundlers)
        const additionalPaths = new Set();
        
        // Collect all emitted assets from compilation
        for (const [filename, asset] of Object.entries(compilation.assets)) {
          if (asset && filename !== this.options.manifestPath) {
            let rootRelativePath = filename.replace(/\\/g, '/');
            if (!rootRelativePath.startsWith('/')) {
              rootRelativePath = '/' + rootRelativePath;
            }
            additionalPaths.add(rootRelativePath);
          }
        }
        
        // Also collect from compilation.getAssets() if available (webpack 5)
        if (compilation.getAssets) {
          for (const asset of compilation.getAssets()) {
            if (asset.name !== this.options.manifestPath) {
              let assetPath = asset.name.replace(/\\/g, '/');
              if (!assetPath.startsWith('/')) {
                assetPath = '/' + assetPath;
              }
              additionalPaths.add(assetPath);
            }
          }
        }
        
        try {
          const outputPath = compilation.compiler.outputPath || this.options.outDir;
          const manifest = generateManifest({
            outputDir: outputPath,
            entryHtml: this.options.entryHtml,
            additionalPaths: Array.from(additionalPaths),
            skipEntryHtml: this.options.skipEntryHtml
          });
          const entryInfo = manifest.entry ? ` and entry: ${manifest.entry}` : '';
          console.log(`✓ Generated despia/local.json with ${manifest.assets.length} assets${entryInfo}`);
        } catch (error) {
          console.error('Error generating despia/local.json:', error.message);
        }
      }
      
      callback();
    });
  }
}

export default DespiaLocalPlugin;
