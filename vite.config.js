  import { defineConfig } from 'vite'

  export default defineConfig({
    base: '/monitor-contracoes/',
    test: {
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        all: true,
        include: ['src/utils/*.js'],
      },
    },
  })
