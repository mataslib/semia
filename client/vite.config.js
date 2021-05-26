import { defineConfig } from 'vite'
import svelte from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Does fix issue with svelte error `Function called outside...`
  // which is throwed when used hook functions from `svelte-navigator` package
  // https://github.com/mefechoel/svelte-navigator/issues/34
  optimizeDeps: {exclude: ["svelte", "svelte-routing", "svelte-navigator"]}
})
