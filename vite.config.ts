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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_COMMIT__: JSON.stringify(getCommitHash()),
    __CONTENT_UPDATED_AT__: JSON.stringify(getContentUpdatedAt()),
  },
  build: {
    rollupOptions: {
      output: {
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
