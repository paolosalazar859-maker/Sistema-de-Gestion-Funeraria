import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Plugin to handle figma:asset imports outside of Figma Make environment
function figmaAssetFallbackPlugin() {
  return {
    name: 'figma-asset-fallback',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        return '\0' + id;
      }
    },
    load(id: string) {
      if (id.startsWith('\0figma:asset/')) {
        // Return a transparent 1x1 PNG as a data URI fallback
        const transparentPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        return `export default "${transparentPng}";`;
      }
    },
  };
}

export default defineConfig({
  base: '/', 
  plugins: [
    figmaAssetFallbackPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1'
  }
})