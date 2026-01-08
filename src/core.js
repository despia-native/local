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
 * @param {string} options.outputDir - Output directory path
 * @param {string} options.entryHtml - Entry HTML filename (default: 'index.html')
 * @param {string[]} options.additionalPaths - Additional paths to include
 * @returns {string[]} Array of all asset paths
 */
export function generateManifest({ outputDir, entryHtml = 'index.html', additionalPaths = [] }) {
  const outputPath = resolve(process.cwd(), outputDir);
  const manifestPath = join(outputPath, 'despia', 'local.json');
  
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
  
  // Ensure entry HTML is included
  const entryPath = entryHtml.startsWith('/') 
    ? entryHtml 
    : '/' + entryHtml;
  assetPaths.add(entryPath);
  
  // Convert to sorted array
  const sortedPaths = Array.from(assetPaths).sort();
  
  // Create despia directory if it doesn't exist
  const despiaDir = join(outputPath, 'despia');
  if (!existsSync(despiaDir)) {
    mkdirSync(despiaDir, { recursive: true });
  }
  
  // Write formatted JSON array
  const jsonContent = JSON.stringify(sortedPaths, null, 2);
  writeFileSync(manifestPath, jsonContent, 'utf-8');
  
  return sortedPaths;
}
