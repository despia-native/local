/**
 * Turbopack plugin for generating despia/local.json manifest
 * Note: Turbopack is Next.js's new bundler. Use the Next.js integration instead.
 * This is a placeholder for future Turbopack-specific optimizations.
 */

import { generateManifest } from './core.js';

export function despiaOfflineTurbopack(options = {}) {
  const { entryHtml = 'index.html', outDir = '.next' } = options;

  // Turbopack is used by Next.js, so we recommend using the Next.js integration
  // This is kept for potential future Turbopack-specific features
  console.warn('⚠ Turbopack: Use @despia/offline/next instead for Next.js projects');
  
  return {
    name: 'despia-offline-turbopack',
    // Implementation would go here when Turbopack plugin API is stable
  };
}
