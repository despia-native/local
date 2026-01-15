# @despia/local

Universal build plugin to generate `despia/local.json` manifest for [Despia](https://despia.com) web-native apps. This manifest enables Despia Local Server, which runs your web app from a secure local HTTPS server on-device, providing full offline functionality with seamless updates.

**Note**: Despia Local Server is optional. Normally, the Despia runtime can run your web app directly from a URL. Despia Local Server is for developers who need extra performance and full true native offline support.

**Store Compliant**: Despia Local Server is fully compliant with Apple App Store and Google Play Store guidelines. It downloads and caches web content (HTML, CSS, JavaScript) for offline display in a WebView—identical to how web browsers work. No native code or executables are downloaded. See [Store Compliance & Security](#store-compliance--security) section for detailed compliance information.

## Features

- **Universal Support** - Works with Vite, Webpack, Rollup, Next.js, Nuxt, SvelteKit, Astro, Remix, esbuild, Parcel, and more
- **Zero Dependencies** - Uses only Node.js built-in modules
- **Automatic Asset Discovery** - Collects all output files (JS, CSS, images, fonts, HTML, etc.)
- **Root-Relative Paths** - Formats all paths as root-relative (starting with `/`)
- **Sorted Output** - Alphabetically sorted paths for consistent builds
- **Standalone Script** - Can be used with any build system via CLI

## About Despia Local Server

**Note**: Despia Local Server is optional. Normally, the Despia runtime can run your web app directly from a URL. Despia Local Server is for developers who need extra performance and full true native offline support.

Despia Local Server enables your web app to run entirely from a secure local HTTPS server on-device, providing a native app experience with full offline functionality.

### Architecture

The Despia native container consists of:

- **Native iOS/Android Container**: The native binary submitted to App Store/Play Store
  - WebView for UI rendering (WKWebView on iOS, WebView on Android)
  - JavaScript bridge for native API access (exposes native capabilities to web content via [`despia-native`](https://www.npmjs.com/package/despia-native))
  - Local HTTPS server infrastructure (runs on-device only)
  - Storage and update management systems

- **Web Content Layer** (downloaded and cached):
  - HTML, CSS, JavaScript files
  - Images, fonts, and other static assets
  - Served from `https://localhost` after initial hydration

**Key Architecture Principles:**
- Web content updates (HTML/CSS/JS only)
- JavaScript bridge provides access to native APIs already in the binary
- No native code execution or downloads
- No executable binaries downloaded
- All native code fixed at App Store/Play Store submission

### How It Works

**Initial Installation**
The App Store/Play Store binary contains the native iOS/Android container (see [Architecture](#architecture) above):
- Native code (Swift/Kotlin) for platform integration
- WebView component for UI rendering
- JavaScript bridge for native API access (exposes native capabilities to web content via [`despia-native`](https://www.npmjs.com/package/despia-native))
- Local HTTPS server infrastructure (runs on-device only)
- Storage and update management systems
- No web app assets (HTML, CSS, JavaScript) are bundled in the binary

This approach keeps initial install sizes minimal and allows for rapid iteration of web UI without requiring app store resubmissions. **Important**: All native code, the JavaScript bridge, and app functionality are fixed at submission time and cannot be changed. Only web content (HTML/CSS/JS) can be updated.

**First Launch Hydration**
On first app launch, Despia securely downloads your latest web build (HTML, CSS, JavaScript, images, fonts) from your repository and stores it locally on the device. The local HTTPS server then begins serving your web content from `https://localhost`, providing a stable, secure origin for your web application.

**Note on Compliance**: This process downloads and caches web content files only. No native code, executables, or binary files are downloaded. The JavaScript executes within the WebView's sandbox, identical to how Safari or Chrome render web pages.

**Offline Operation**
After the initial hydration, your app operates completely offline:
- Instant app boot times (no network requests)
- No network connectivity required
- Full SPA routing and navigation
- Deep linking support
- Stable HTTPS origin (`https://localhost`) for security

If the device goes offline permanently, the app continues to function using the last hydrated version, ensuring reliability even without connectivity.

**Seamless Updates**
When connectivity is available, Despia checks for updates in the background and downloads new web builds atomically. Updates are applied on the next app launch, ensuring:
- No partial or broken states
- Atomic updates for reliability
- No app store resubmission required for web UI changes
- Background updates that don't interrupt user experience

**Important**: Updates only change web content (HTML, CSS, JavaScript). Native code, permissions, and app functionality remain unchanged from the original App Store/Play Store submission.

### Store Compliance & Security

**Compliance Summary for App Reviewers:**

Despia Local Server downloads and caches web content files (HTML, CSS, JavaScript, images) for offline display in a WebView. This is identical to how web browsers (Safari, Chrome) download and render web pages. 

**Key Compliance Points:**
- No native code is downloaded or executed
- No executable binaries (`.so`, `.dylib`, `.dex`) are downloaded
- All native code and native API capabilities are fixed at App Store/Play Store submission
- JavaScript executes only within WebView sandbox (same as browsers)
- All content served from on-device `localhost` server
- App permissions and which native APIs are available cannot be changed
- Web UI can be updated to use existing native APIs (already in binary) in new ways

This approach is explicitly permitted under both App Store and Play Store policies, as it involves web content rendering, not native code execution.

#### Compliance Validation Tools

For conditionally rendering UI elements based on the Despia Native SDK runtime version, consider using [`despia-version-guard`](https://www.npmjs.com/package/despia-version-guard), a recommended tool in the Despia ecosystem. This framework-agnostic solution helps ensure store compliance and reliability by:

- Conditionally rendering UI based on `window.bundleNumber` (Despia Native SDK runtime version)
- Version-gating major UI shifts to maintain store compliance
- Preventing broken UI when Despia adds new runtime features that older users don't have
- Supporting React, Vue, Angular, Svelte, and Vanilla JS/Web Components

`despia-version-guard` complements `@despia/local` by enabling you to build conditional UI for major version shifts while remaining store-compliant. This is particularly useful for:

- **Major UI Shifts**: Show new UI only to users with the required minimum version
- **Deprecation**: Hide legacy features when version exceeds maximum
- **Upgrade Prompts**: Conditionally show upgrade buttons based on version
- **Store Compliance**: Ensure app review compatibility by version-gating major changes
- **Enterprise Reliability**: Prevent broken UI when Despia adds new runtime features

**Installation:**
```bash
npm install despia-version-guard
```

**Example Usage (React):**
```jsx
import { VersionGuard } from 'despia-version-guard';

// Only show this feature if version is 21.0.3 or higher
<VersionGuard min_version="21.0.3">
  <NewFeatureComponent />
</VersionGuard>
```

See the [`despia-version-guard` documentation](https://www.npmjs.com/package/despia-version-guard) for framework-specific usage and API details.

---

Despia Local Server is fully compliant with both Apple App Store and Google Play Store guidelines. This section explains the compliance in detail.

#### Apple App Store Compliance

**Guideline 3.3.2 - Code Execution:**
> "Apps must not download, install, or execute code which introduces or changes features or functionality of the app, including other apps."

**Compliance Statement:**
Despia Local Server complies with this guideline because:

1. **No Native Code Execution**: The app does not download, install, or execute any native code (Swift, Objective-C, C++, etc.). All native code is fixed at App Store submission time and cannot be modified.

2. **Web Content Rendering Only**: Only web content assets (HTML, CSS, JavaScript) are downloaded and rendered. This is identical to how Safari, Chrome, and other web browsers load and display web content. The JavaScript executes within the WebView's sandbox, not as native code.

3. **Fixed Native Functionality**: All native capabilities, permissions, and native API implementations are determined at submission time. The downloaded web content cannot change:
   - App permissions (declared in Info.plist)
   - Which native APIs are available in the binary
   - Native API implementations
   - App Store metadata
   - Binary behavior
   - System integration

   **However**, the web UI can be updated to use existing native APIs in new ways. For example, if Face ID is already implemented in the native code and exposed through the WebView bridge, the web UI can be updated to call Face ID from new parts of the app. This is compliant because the native capability already exists in the submitted binary—only the web UI's usage of it changes.

   **Note**: This follows the same pattern as [Expo](https://expo.dev), which has been generally accepted by app stores. However, Apple's interpretation of "feature changes" under Guideline 3.3.2 is subjective, and your app could still face review challenges. It's recommended to be conservative with updates that significantly change app behavior, even when using existing native APIs.

4. **On-Device Execution**: All web content is served from a local HTTPS server running on-device (`localhost`). No remote code execution occurs.

**This approach is explicitly permitted** under App Store guidelines, as evidenced by:
- Safari and other browsers downloading and rendering web content
- Apps using WKWebView to display web content
- Enterprise apps using web-based UIs
- Apps that cache web content for offline use

#### Google Play Store Compliance

**Play Store Policy - Malicious Behavior:**
> "Apps must not download executable code (e.g., dex, JAR, .so files) from a source other than Google Play."

**Compliance Statement:**
Despia Local Server complies with this policy because:

1. **No Executable Code Downloads**: The app does not download any executable code (`.dex`, `.jar`, `.so`, `.apk`, or native binaries). Only web content files (HTML, CSS, JavaScript, images, fonts) are downloaded.

2. **Web Content Rendering**: JavaScript files are executed within the WebView's JavaScript engine, not as native executables. This is the same mechanism used by Chrome and other Android browsers.

3. **Fixed Native Binary**: The APK/AAB submitted to Google Play contains all native code. No native code is downloaded or executed after installation.

4. **Sandboxed Execution**: All web content executes within the WebView's security sandbox, with permissions and capabilities fixed at APK submission time.

   **However**, the web UI can be updated to use existing native APIs in new ways. For example, if biometric authentication is already implemented in the native code and exposed through the WebView bridge, the web UI can be updated to call it from new parts of the app. This is compliant because the native capability already exists in the submitted APK—only the web UI's usage of it changes.

**This approach is explicitly permitted** under Play Store policies, as evidenced by:
- Chrome and other browsers rendering web content
- Apps using WebView to display web content
- Progressive Web Apps (PWAs) that cache content
- Apps that update UI via web technologies

#### Technical Implementation Details

**What Gets Downloaded:**
- HTML files (markup)
- CSS files (styling)
- JavaScript files (executed in WebView sandbox)
- Images, fonts, and other static assets
- Native code (Swift, Kotlin, C++, etc.) - NOT downloaded
- Executable binaries (`.so`, `.dylib`, `.dex`, etc.) - NOT downloaded
- Native libraries or frameworks - NOT downloaded

**What Cannot Change:**
- Native app permissions (declared in Info.plist/AndroidManifest.xml)
- App Store/Play Store metadata
- Native API implementations and capabilities
- System integration capabilities
- App signing and security model
- Which native APIs are available in the binary

**What CAN Change (Compliant Updates):**
- **Usage of Existing Native APIs**: The web UI can be updated to use native APIs that are already built into the binary and exposed through the WebView bridge. For example:
  - If Face ID/Touch ID is already implemented in the native code, the web UI can be updated to call it from new parts of the app
  - If camera access is already granted, the web UI can be updated to use it in new features
  - If location services are already available, the web UI can be updated to request location in new screens
  - Any native capability that exists in the submitted binary can be exposed to new parts of the web UI via updates

**Important Distinction:**
- **Compliant**: Updating web content to use existing native APIs (e.g., adding Face ID to a new login screen when Face ID is already in the binary)
- **Not Compliant**: Downloading new native code or adding new native capabilities that weren't in the original submission

This is compliant because:
1. The native API/capability already exists in the binary submitted to the stores
2. The WebView bridge was already configured to expose these APIs at submission time
3. Only the web UI is changing to call existing native functions
4. No new native code, permissions, or capabilities are being added

This follows the same pattern as established frameworks like [Expo](https://expo.dev), which uses JavaScript bridges to expose native APIs to web content and has been generally accepted by app stores.

**Important Disclaimer**: While this approach is technically compliant and follows established patterns, Apple's interpretation of Guideline 3.3.2 regarding "feature changes" is subjective. Apps using this pattern have been generally accepted, but your app could still face review challenges, especially if updates significantly change app behavior or functionality. It's recommended to:
- Be conservative with updates that dramatically change user-facing features
- Test thoroughly before submitting significant UI/UX changes
- Be prepared to explain how updates use existing native APIs if questioned during review
- Consider submitting major feature additions through the normal App Store review process when possible

**Security Model:**
- All web content is served from `https://localhost` (on-device only)
- WebView sandbox enforces same-origin policy
- No network access to external servers after initial hydration
- Content Security Policy (CSP) can be enforced
- All execution happens within WebView's security boundaries

#### Comparison to Similar Technologies

This approach is conceptually and technically identical to:

1. **Web Browsers** (Safari, Chrome): Download and render web content from servers
2. **Expo**: Uses JavaScript bridge to expose native APIs to React Native web content
3. **Electron Apps**: Update web UI content without changing native code
5. **Progressive Web Apps**: Cache web content for offline use
6. **Enterprise MDM Solutions**: Deploy web-based UIs to managed devices
7. **Hybrid Mobile Apps**: Use WebView to display web content

The key distinction that ensures compliance: **Web content rendering is not code execution in the App Store/Play Store policy sense**. Native code execution is what the policies restrict, and Despia does not perform any native code execution.

**Note**: Expo follows the same pattern of exposing native APIs through JavaScript bridges and has been generally accepted by app stores. However, as with any approach involving web content updates, there's always a possibility of review challenges depending on how Apple interprets "feature changes" in specific cases.

#### Practical Example: Using Existing Native APIs

To illustrate compliance with using existing native APIs:

**Scenario**: An app is submitted with Face ID/Touch ID already implemented in the native code and exposed through the WebView bridge. The initial web UI only uses Face ID on the login screen.

**Compliant Update**: The web UI can be updated via OTA to also use Face ID on:
- A new settings screen
- A payment confirmation screen
- Any other new feature

**Why This Is Compliant:**
1. Face ID native code was already in the binary at App Store submission
2. The WebView bridge was already configured to expose Face ID to JavaScript
3. Only the web UI JavaScript is changing to call the existing native function
4. No new native code, permissions, or capabilities are being added

**Not Compliant**: Downloading new native code to add Face ID support that wasn't in the original submission.

This is analogous to:
- A web browser using JavaScript to call `navigator.geolocation` in different parts of a website
- Expo apps updating React Native code to use existing native modules in new screens
- An Electron app updating its web UI to use existing Electron APIs in new features
- A hybrid app using existing Cordova plugins in new screens

**Review Considerations**: While this pattern is technically compliant and follows established frameworks like Expo, Apple's interpretation of Guideline 3.3.2 can be subjective. If your update significantly changes app behavior or introduces major new user-facing features, consider whether it might be better to submit through the normal App Store review process to avoid potential challenges.

#### Developer Responsibility

When submitting apps using Despia Local Server:

1. **App Store Submission**: Clearly state that the app uses a WebView to display web content that may be cached for offline use. This is standard practice and does not require special disclosure.

2. **Play Store Submission**: No special disclosure required. The app uses standard Android WebView components to display web content.

3. **Privacy Policy**: If your app collects data through the web content, ensure your privacy policy covers this, as required by both stores.

4. **Content Guidelines**: Ensure all web content complies with App Store and Play Store content policies, as the web content is part of your app submission.

5. **Update Strategy**: Be mindful that while using existing native APIs in new ways is technically compliant (following the same pattern as Expo), Apple's interpretation of "feature changes" under Guideline 3.3.2 is subjective. Consider:
   - Being conservative with updates that dramatically change app behavior
   - Testing thoroughly before deploying significant UI/UX changes
   - Being prepared to explain how updates use existing native APIs if questioned
   - Submitting major feature additions through normal App Store review when appropriate

6. **Version-Based UI Rendering**: Consider using [`despia-version-guard`](https://www.npmjs.com/package/despia-version-guard) to conditionally render UI elements based on the Despia Native SDK runtime version. This helps maintain store compliance by version-gating major changes and prevents broken UI for users with older runtime versions.

### The `local.json` Manifest

The `despia/local.json` manifest generated by this plugin serves as an asset inventory for Despia Local Server. It contains a complete list of all assets that need to be cached locally, enabling:

- **Complete Asset Discovery**: Ensures all files (JS, CSS, images, fonts, HTML) are properly cached
- **Efficient Updates**: Allows Despia to determine which assets have changed between builds
- **Reliable Offline Operation**: Guarantees all required assets are available offline
- **Atomic Updates**: Enables safe, complete updates without partial states

This manifest is automatically used by Despia during the hydration and update processes to ensure your app has everything it needs to run offline.

## Installation

```bash
npm install --save-dev @despia/local
```

## Quick Start

### Option 1: Framework-Specific Plugin (Recommended)

Choose the plugin for your framework below.

### Option 2: Standalone Script (Universal)

Add to your `package.json`:

```json
{
  "scripts": {
    "build": "your-build-command",
    "postbuild": "despia-local"
  }
}
```

Or run manually:

```bash
npx despia-local [outputDir] [entryHtml] [--output|-o manifestPath]
```

**Options:**
- `--output`, `-o <path>` - Custom output path for manifest file (useful for hosting providers)
- `--help`, `-h` - Show help message

**Examples:**
```bash
# Default: generates manifest in outputDir/despia/local.json
npx despia-local dist

# Custom output location (e.g., for Vercel/Netlify)
npx despia-local .next/static --output public/despia/local.json
npx despia-local dist -o public/manifest.json
```

## Framework Support

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { despiaLocalPlugin } from '@despia/local/vite';

export default defineConfig({
  plugins: [
    // ... your other plugins
    despiaLocalPlugin({
      outDir: 'dist',        // optional, default: 'dist'
      entryHtml: 'index.html' // optional, default: 'index.html'
    })
  ]
});
```

**Works with:**
- Vite + React
- Vite + Vue
- Vite + Svelte
- Vite + Preact
- Vite + Lit
- Any Vite-based project

### Webpack

```javascript
// webpack.config.js
const DespiaLocalPlugin = require('@despia/local/webpack');

module.exports = {
  // ... your config
  plugins: [
    // ... your other plugins
    new DespiaLocalPlugin({
      outDir: 'dist',        // optional, default: 'dist'
      entryHtml: 'index.html' // optional, default: 'index.html'
    })
  ]
};
```

**Works with:**
- Create React App (eject or CRACO)
- Vue CLI
- Angular (custom webpack config)
- Any webpack-based project

### Rollup

```javascript
// rollup.config.js
import { despiaLocal } from '@despia/local/rollup';

export default {
  // ... your config
  plugins: [
    // ... your other plugins
    despiaLocal({
      outDir: 'dist',
      entryHtml: 'index.html'
    })
  ]
};
```

### Next.js

**Recommended: Client-Side Apps for Local/Offline Apps**

For local/offline apps, we **recommend using client-side frameworks** like React + Vite or Create React App instead of Next.js. Client-side apps are better suited for offline/local deployment because:

- All features are client-side by default
- No server-side dependencies
- Simpler build and deployment
- Better offline support

See the [React/Vite](#react--vite) section for examples.

**Supported: Static Export Only**

If you're using Next.js, this plugin supports apps using `output: 'export'` (static export mode). 

```javascript
// next.config.js
const withDespiaLocal = require('@despia/local/next');

module.exports = withDespiaLocal({
  entryHtml: 'index.html',
  outDir: 'out' // Next.js static export directory
})({
  output: 'export',
  // your Next.js config
});
```

**For SSR Apps with Separate Static Build:**

If you need SSR for your main site but want a static build for the local app, Next.js can easily generate a separate static build. You can set up a mini CI/CD pipeline to:

- Keep your main site as SSR (better for SEO, dynamic content)
- Generate a separate static export build for the local/offline app
- Deploy both builds independently

**Note**: Setting up the CI/CD pipeline for dual builds (SSR main site + static local app) requires custom configuration based on your hosting provider and build setup. You'll need to figure out the deployment strategy yourself - this plugin only handles manifest generation for the static export build.

### Nuxt

```javascript
// nuxt.config.js
export default {
  modules: ['@despia/local/nuxt'],
  despiaLocal: {
    entryHtml: 'index.html'
  }
}
```

**Or as a local module:**

```javascript
// modules/despia-local.js
import DespiaLocalModule from '@despia/local/nuxt';
export default DespiaLocalModule;
```

### SvelteKit

```javascript
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { despiaLocalSvelteKit } from '@despia/local/sveltekit';

export default {
  plugins: [
    sveltekit(),
    despiaLocalSvelteKit({
      entryHtml: 'index.html'
    })
  ]
};
```

### Astro

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import despiaLocal from '@despia/local/astro';

export default defineConfig({
  integrations: [
    despiaLocal({
      entryHtml: 'index.html',
      outDir: 'dist'
    })
  ]
});
```

### Remix

```javascript
// vite.config.js (Remix uses Vite)
import { remix } from '@remix-run/dev';
import { despiaLocalRemix } from '@despia/local/remix';

export default {
  plugins: [
    remix(),
    despiaLocalRemix({
      entryHtml: 'index.html',
      outDir: 'build/client'
    })
  ]
};
```

### esbuild

```javascript
import { build } from 'esbuild';
import { despiaLocalEsbuild } from '@despia/local/esbuild';

await build({
  entryPoints: ['src/index.js'],
  outdir: 'dist',
  plugins: [
    despiaLocalEsbuild({
      outDir: 'dist',
      entryHtml: 'index.html'
    })
  ]
});
```

### Parcel

```json
// .parcelrc
{
  "extends": "@parcel/config-default",
  "plugins": {
    "@despia/local/parcel": true
  }
}
```

**Or in package.json:**

```json
{
  "parcel": {
    "plugins": {
      "@despia/local/parcel": true
    }
  }
}
```

### Other Build Tools

For any build tool not listed above, use the standalone CLI script:

```json
{
  "scripts": {
    "build": "your-build-command",
    "postbuild": "despia-local dist index.html"
  }
}
```

## Configuration Options

All plugins accept the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outDir` | `string` | `'dist'` | Output directory to scan for assets |
| `entryHtml` | `string` | `'index.html'` | Entry HTML filename to include in manifest |

## Output Format

The generated `despia/local.json` file contains a sorted JSON array of root-relative paths:

```json
[
  "/assets/app.abc123.css",
  "/assets/app.def456.js",
  "/assets/logo.xyz789.png",
  "/index.html"
]
```

## Examples

### React + Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { despiaLocalPlugin } from '@despia/local/vite';

export default defineConfig({
  plugins: [
    react(),
    despiaLocalPlugin()
  ]
});
```

### Vue + Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { despiaLocalPlugin } from '@despia/local/vite';

export default defineConfig({
  plugins: [
    vue(),
    despiaLocalPlugin()
  ]
});
```

### Angular

```javascript
// angular.json - Add to build configuration
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "builder": "@angular-builders/custom-webpack:browser",
          "options": {
            "customWebpackConfig": {
              "path": "./webpack.config.js"
            }
          }
        }
      }
    }
  }
}
```

```javascript
// webpack.config.js
const DespiaLocalPlugin = require('@despia/local/webpack');

module.exports = {
  plugins: [
    new DespiaLocalPlugin({ outDir: 'dist' })
  ]
};
```

### Svelte + Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { despiaLocalPlugin } from '@despia/local/vite';

export default defineConfig({
  plugins: [
    svelte(),
    despiaLocalPlugin()
  ]
});
```

## How the Plugin Works

1. **Hook into Build Process** - The plugin hooks into your build tool's completion event
2. **Scan Output Directory** - Recursively scans the build output directory for all files
3. **Collect Asset Paths** - Collects paths from both the build tool's bundle metadata and file system
4. **Normalize Paths** - Converts all paths to root-relative format (starting with `/`)
5. **Include Entry HTML** - Ensures the entry HTML file is always included
6. **Sort & Write** - Sorts paths alphabetically and writes to `despia/local.json`

The generated manifest is then used by Despia during app hydration and updates to ensure all assets are properly cached for offline operation.

## Notes

- The plugin automatically creates the `despia` subdirectory if it doesn't exist
- All paths are normalized to use forward slashes (`/`) regardless of OS
- Paths are sorted alphabetically for consistent output across builds
- The entry HTML file is always included, even if not found in the output directory
- The `despia` directory itself is excluded from the manifest to avoid recursion

## Troubleshooting

### Manifest not generated

1. Ensure the build completes successfully
2. Check that the output directory exists
3. Verify the `outDir` option matches your build configuration
4. Check console for error messages

### Missing assets in manifest

- The plugin scans the entire output directory
- Ensure assets are copied to the output directory during build
- Check that file paths are correctly formatted

### Path format issues

- All paths are automatically normalized to root-relative format
- Paths starting with `/` are preserved as-is
- Windows backslashes are converted to forward slashes

### Next.js Troubleshooting

**Static Export Issues:**

**Manifest not generated:**
1. Ensure you're using `output: 'export'` in your `next.config.js`
2. Verify the plugin is correctly configured with `withDespiaLocal()`
3. Check that `out/` directory exists after build
4. Ensure `entryHtml` matches your actual entry HTML file

**Wrong directory:**
- For static export: Use `out/` directory (Next.js default for static export)
- Never use `.next/` for static export (that's for SSR builds)

**Manifest not accessible:**
- Manifest is generated in `out/despia/local.json`
- Ensure your hosting provider serves files from the `out/` directory
- Static export output should be served as static files

**SSR Apps (Not Officially Supported):**

**Important**: This plugin does **not** officially support Next.js SSR apps. SSR requires custom tooling specific to your hosting provider.

If you choose to use post-build scripts for SSR (unsupported):
1. Use `.next/static/` directory (client assets only)
2. Never include `.next/server/` (server code, not needed)
3. Customize the approach based on your hosting provider's requirements
4. This is experimental and not guaranteed to work reliably

For production SSR apps, implement provider-specific solutions rather than relying on this plugin.

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## License

MIT

## Related

- [Despia](https://despia.com) - Web-native app platform
- [despia-native](https://www.npmjs.com/package/despia-native) - JavaScript SDK for accessing native device features (haptics, biometrics, camera, location, push notifications, in-app purchases, and 25+ more APIs)
- [despia-version-guard](https://www.npmjs.com/package/despia-version-guard) - Framework-agnostic solution for conditionally rendering UI based on Despia Native SDK runtime version