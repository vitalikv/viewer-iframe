import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 4210
  },
  plugins: [
    {
      name: 'redirect-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Перенаправляем запросы к /assets/ на /iframe/assets/
          if (req.url.startsWith('/assets/')) {
            const newUrl = req.url.replace('/assets/', '/iframe/assets/')
            req.url = newUrl
          }
          next()
        })
      }
    }
  ]
})

