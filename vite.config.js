import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteCommonjs()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        esbuildCommonjs(['react-editor-js', '@react-editor-js/client', '@react-editor-js/server'])
      ]
    }
  }
})
