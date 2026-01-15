#!/usr/bin/env node

/**
 * Standalone script to generate despia/local.json manifest
 * Can be used with any build system by running after build completes
 * 
 * Usage:
 *   node generate-offline-manifest.js [outputDir] [entryHtml] [--output|-o manifestPath]
 * 
 * Examples:
 *   node generate-offline-manifest.js
 *   node generate-offline-manifest.js dist
 *   node generate-offline-manifest.js dist index.html
 *   node generate-offline-manifest.js .next/static --output public/despia/local.json
 *   node generate-offline-manifest.js dist -o public/despia/local.json
 */

import { generateManifest } from './src/core.js';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

// Parse command line arguments
let outputDir = 'dist';
let entryHtml = 'index.html';
let manifestOutputPath = null;

// Check for --help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: despia-local [outputDir] [entryHtml] [options]

Arguments:
  outputDir              Directory to scan for assets (default: 'dist')
  entryHtml              Entry HTML filename (default: 'index.html')

Options:
  --output, -o <path>    Custom output path for manifest file
  --help, -h             Show this help message

Examples:
  despia-local
  despia-local dist
  despia-local dist index.html
  despia-local .next/static --output public/despia/local.json
  despia-local dist -o public/manifest.json
  `);
  process.exit(0);
}

// Parse arguments
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  
  if (arg === '--output' || arg === '-o') {
    manifestOutputPath = process.argv[++i];
    if (!manifestOutputPath) {
      console.error('❌ Error: --output/-o requires a path argument');
      process.exit(1);
    }
  } else if (outputDir === 'dist' && !arg.startsWith('-')) {
    outputDir = arg;
  } else if (!arg.startsWith('-') && entryHtml === 'index.html' && manifestOutputPath === null) {
    entryHtml = arg;
  }
}

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
    skipEntryHtml,
    manifestOutputPath
  });
  
  const manifestLocation = manifestOutputPath || join(outputDir, 'despia', 'local.json');
  console.log(`✓ Generated ${manifestLocation}`);
  console.log(`✓ Included ${paths.length} assets`);
  if (!skipEntryHtml) {
    console.log(`✓ Entry HTML: /${entryHtml}`);
  } else {
    console.log(`✓ Skipped entry HTML (SSR mode)`);
  }
  
  // Provide helpful hint if using default location for Next.js SSR
  if (isNextJsStatic && !manifestOutputPath) {
    console.log('');
    console.log('💡 Tip: For hosting providers (Vercel, Netlify, etc.), consider using:');
    console.log(`   despia-local .next/static --output public/despia/local.json`);
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
