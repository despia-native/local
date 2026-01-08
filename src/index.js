/**
 * Main entry point for @despia/local
 * Re-exports core functionality and all plugins
 */

export { generateManifest, collectFiles } from './core.js';
export { despiaLocalPlugin } from './vite.js';
export { default as DespiaLocalPlugin } from './webpack.js';
export { despiaLocal } from './rollup.js';
export { withDespiaLocal } from './next.js';
export { default as DespiaLocalModule } from './nuxt.js';
export { despiaLocalSvelteKit } from './sveltekit.js';
export { default as despiaLocalIntegration } from './astro.js';
export { despiaLocalRemix } from './remix.js';
export { despiaLocalEsbuild } from './esbuild.js';
export { default as DespiaLocalParcel } from './parcel.js';
