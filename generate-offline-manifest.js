#!/usr/bin/env node

/**
 * Standalone script to generate despia/local.json manifest
 * Can be used with any build system by running after build completes
 * 
 * Usage:
 *   node generate-offline-manifest.js [outputDir] [entryHtml]
 * 
 * Examples:
 *   node generate-offline-manifest.js
 *   node generate-offline-manifest.js dist
 *   node generate-offline-manifest.js dist index.html
 */

import { generateManifest } from './src/core.js';
import { resolve } from 'path';

// Get command line arguments
const outputDir = process.argv[2] || 'dist';
const entryHtml = process.argv[3] || 'index.html';

try {
  console.log(`Scanning ${resolve(process.cwd(), outputDir)} for assets...`);
  const paths = generateManifest({ outputDir, entryHtml });
  
  console.log(`✓ Generated despia/local.json`);
  console.log(`✓ Included ${paths.length} assets`);
  console.log(`✓ Entry HTML: /${entryHtml}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error('Please run this script after your build completes.');
  process.exit(1);
}
