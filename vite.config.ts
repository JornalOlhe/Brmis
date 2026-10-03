// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    ...(isGitHubPages
      ? {
          prerender: {
            enabled: true,
            autoSubfolderIndex: true,
            autoStaticPathsDiscovery: true,
            crawlLinks: true,
          },
        }
      : {}),
  },
  ...(isGitHubPages
    ? {
        // GitHub Pages hosts this repository at /Brmis/.
        vite: {
          base: "/Brmis/",
        },
        // A Node-compatible Nitro build is required for TanStack Start prerendering.
        nitro: {
          preset: "node-server",
        },
      }
    : {}),
});
