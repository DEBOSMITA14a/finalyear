import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        auth: 'auth.html',
        dashboard: 'dashboard.html',
        assessment: 'assessment.html',
        result: 'result.html'
      }
    }
  }
});
