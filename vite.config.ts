import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
}

function getContentUpdatedAt() {
  try {
    return execSync('git log -1 --format=%cs -- src/data', { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

const CONTENT_CHUNK_DIRECTORY = 'assets/content/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_COMMIT__: JSON.stringify(getCommitHash()),
    __CONTENT_UPDATED_AT__: JSON.stringify(getContentUpdatedAt()),
  },
  build: {
    modulePreload: {
      // Prayer/song text chunks import nothing, so they never need a preload list.
      // Without this filter Vite lists all ~700 of them in the entry chunk (+15 KB gzip)
      // as preload dependencies of the "load the whole collection" import.
      resolveDependencies: (_filename, dependencies) => dependencies.filter(
        (dependency) => !dependency.startsWith(CONTENT_CHUNK_DIRECTORY),
      ),
    },
    rollupOptions: {
      output: {
        // One chunk per prayer/song Markdown file (see src/data/contentLoaders.ts),
        // kept in their own folder with ASCII names.
        chunkFileNames(chunkInfo) {
          const isContentFile = /\/src\/data\/(prayers|songs)\/[^/]+\.md/.test(chunkInfo.facadeModuleId ?? '')
          return isContentFile ? `${CONTENT_CHUNK_DIRECTORY}[hash].js` : 'assets/[name]-[hash].js'
        },
        // Split vendor libraries into separate long-lived chunks so app
        // updates don't invalidate them in the user's browser cache.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router')) return 'router-vendor'
          if (id.includes('react-markdown')) return 'markdown-vendor'
          if (id.includes('react-icons')) return 'icons-vendor'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'react-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
})
