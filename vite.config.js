import react from '@vitejs/plugin-react'
import { defineConfig, transformWithOxc } from 'vite'

const jsxInJsPlugin = {
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.includes('/src/') || !id.endsWith('.js')) return null

    const result = await transformWithOxc(code, id.replace(/\.js$/, '.jsx'), {
      jsx: { runtime: 'automatic' },
    })

    return { code: result.code, map: result.map }
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [jsxInJsPlugin, react()],
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'react-router-dom',
      'react-toastify',
    ],
  },
})
