import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // theme: {
  //   extend: {
  //     // Paste it right here inside the extend object
  //     gridTemplateColumns: {
  //       '15': 'repeat(15, minmax(0, 1fr))',
  //     },
  //     gridTemplateRows: {
  //       '15': 'repeat(15, minmax(0, 1fr))',
  //     },
  //   },
  // },
  plugins: [react(),tailwindcss()],
})
