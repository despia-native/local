/**
 * Main entry point for @despia/offline
 * Re-exports core functionality and all plugins
 */

export { generateManifest, collectFiles } from './core.js';
export { despiaOfflinePlugin } from './vite.js';
export { default as DespiaOfflinePlugin } from './webpack.js';
export { despiaOffline } from './rollup.js';
export { withDespiaOffline } from './next.js';
export { default as DespiaOfflineModule } from './nuxt.js';
export { despiaOfflineSvelteKit } from './sveltekit.js';
export { default as despiaOfflineIntegration } from './astro.js';
export { despiaOfflineRemix } from './remix.js';
export { despiaOfflineEsbuild } from './esbuild.js';
export { default as DespiaOfflineParcel } from './parcel.js';
