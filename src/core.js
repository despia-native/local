/**
 * Core utility functions for generating despia/local.json manifest
 * Shared across all build tool plugins
 */

import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, relative, resolve } from 'path';

/**
 * Recursively collect all files in a directory
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative paths
 * @returns {string[]} Array of root-relative paths
 */
export function collectFiles(dir, baseDir = dir) {
  const files = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      // Skip the despia directory itself to avoid recursion
      if (entry === 'despia') {
        continue;
      }
      
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        files.push(...collectFiles(fullPath, baseDir));
      } else if (stat.isFile()) {
        // Get relative path from base directory
        const relativePath = relative(baseDir, fullPath);
        // Convert to root-relative path (starting with /)
        const rootRelativePath = '/' + relativePath.replace(/\\/g, '/');
        files.push(rootRelativePath);
      }
    }
  } catch (error) {
    // Silently skip directories that can't be read
  }
  
  return files;
}

/**
 * Generate the offline manifest file
 * @param {Object} options
 * @param {string} options.outputDir - Output directory path (where to scan for assets)
 * @param {string} options.entryHtml - Entry HTML filename (default: 'index.html')
 * @param {string[]} options.additionalPaths - Additional paths to include
 * @param {boolean} options.skipEntryHtml - Skip adding entry HTML to manifest (for SSR apps)
 * @param {string} options.manifestOutputPath - Custom path for manifest file (default: outputDir/despia/local.json)
 * @returns {{entry: string|null, assets: string[]}} Object with entry path and assets array
 */
export function generateManifest({ outputDir, entryHtml = 'index.html', additionalPaths = [], skipEntryHtml = false, manifestOutputPath = null }) {
  const outputPath = resolve(process.cwd(), outputDir);
  
  // Use custom manifest output path if provided, otherwise default to outputDir/despia/local.json
  const manifestPath = manifestOutputPath
    ? resolve(process.cwd(), manifestOutputPath)
    : join(outputPath, 'despia', 'local.json');
  
  // Check if output directory exists
  if (!existsSync(outputPath)) {
    throw new Error(`Output directory "${outputPath}" does not exist.`);
  }
  
  // Collect all files from the output directory
  const assetPaths = new Set(collectFiles(outputPath, outputPath));
  
  // Add any additional paths provided
  additionalPaths.forEach(path => {
    const normalizedPath = path.startsWith('/') ? path : '/' + path.replace(/\\/g, '/');
    assetPaths.add(normalizedPath);
  });
  
  // Determine entry path
  const entryPath = entryHtml.startsWith('/') 
    ? entryHtml 
    : '/' + entryHtml;
  
  // Ensure entry HTML is included (unless skipped for SSR apps)
  if (!skipEntryHtml) {
    assetPaths.add(entryPath);
  }
  
  // Separate entry from other assets
  const hasEntry = assetPaths.has(entryPath) && !skipEntryHtml;
  const assets = Array.from(assetPaths)
    .filter(path => path !== entryPath || skipEntryHtml)
    .sort();
  
  // Create manifest object
  const manifest = {
    entry: hasEntry ? entryPath : null,
    assets: assets
  };
  
  // Create directory for manifest if it doesn't exist
  const manifestDir = manifestOutputPath 
    ? resolve(manifestPath, '..') 
    : join(outputPath, 'despia');
  if (!existsSync(manifestDir)) {
    mkdirSync(manifestDir, { recursive: true });
  }
  
  // Write formatted JSON object
  const jsonContent = JSON.stringify(manifest, null, 2);
  writeFileSync(manifestPath, jsonContent, 'utf-8');
  
  return manifest;
}
