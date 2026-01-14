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
import { resolve, join } from 'path';
import { existsSync } from 'fs';

// Get command line arguments
const outputDir = process.argv[2] || 'dist';
const entryHtml = process.argv[3] || 'index.html';

// Detect Next.js SSR context
const isNextJsDir = outputDir.includes('.next');
const isNextJsStatic = outputDir.includes('.next/static') || outputDir === '.next/static';
const isNextJsRoot = outputDir === '.next';
const isNextJsServer = outputDir.includes('.next/server');

// Determine if we should skip entryHtml (for SSR apps)
const skipEntryHtml = isNextJsStatic || isNextJsServer;

// Provide helpful messages for Next.js
if (isNextJsDir && !isNextJsStatic && !isNextJsServer) {
  if (isNextJsRoot) {
    console.warn('⚠ Warning: Scanning .next/ directory directly.');
    console.warn('💡 For SSR apps, use: despia-local .next/static');
    console.warn('💡 For static export, use: despia-local out');
  }
}

if (isNextJsServer) {
  console.error('❌ Error: .next/server/ contains server-side code, not client assets.');
  console.error('💡 For SSR apps, use: despia-local .next/static');
  process.exit(1);
}

try {
  const resolvedPath = resolve(process.cwd(), outputDir);
  console.log(`Scanning ${resolvedPath} for assets...`);
  
  // Check if directory exists, and provide helpful suggestions for Next.js
  if (!existsSync(resolvedPath)) {
    if (isNextJsRoot) {
      console.error(`❌ Directory "${resolvedPath}" does not exist.`);
      console.error('💡 For SSR apps, try: despia-local .next/static');
      console.error('💡 For static export, try: despia-local out');
    }
    throw new Error(`Output directory "${resolvedPath}" does not exist.`);
  }
  
  // Check for Next.js static directory and suggest if scanning wrong location
  if (isNextJsRoot && existsSync(join(resolvedPath, 'static'))) {
    console.warn('⚠ Found .next/static/ subdirectory.');
    console.warn('💡 For SSR apps, consider scanning .next/static directly for better results.');
  }
  
  const paths = generateManifest({ 
    outputDir, 
    entryHtml,
    skipEntryHtml 
  });
  
  console.log(`✓ Generated despia/local.json`);
  console.log(`✓ Included ${paths.length} assets`);
  if (!skipEntryHtml) {
    console.log(`✓ Entry HTML: /${entryHtml}`);
  } else {
    console.log(`✓ Skipped entry HTML (SSR mode)`);
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  console.error('💡 Please run this script after your build completes.');
  
  // Additional help for Next.js
  if (isNextJsDir) {
    console.error('');
    console.error('Next.js tips:');
    console.error('  - SSR apps: Use "despia-local .next/static"');
    console.error('  - Static export: Use "despia-local out"');
  }
  
  process.exit(1);
}
