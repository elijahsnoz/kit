import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { generateGiftContent } from './api/_gift-core'

// Serve POST /api/generate during `npm run dev`, using the same core as the
// production serverless function. Needs ANTHROPIC_API_KEY in the environment;
// without it, responds 501 so the client falls back to its local generator.
function giftApiDev(): Plugin {
  return {
    name: 'gift-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        const apiKey = process.env.ANTHROPIC_API_KEY
        res.setHeader('content-type', 'application/json')
        if (!apiKey) {
          res.statusCode = 501
          res.end(JSON.stringify({ error: 'AI not configured (set ANTHROPIC_API_KEY).' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          const written = await generateGiftContent(body, apiKey, process.env.GIFT_MODEL)
          res.statusCode = 200
          res.end(JSON.stringify(written))
        } catch (err: any) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: String(err?.message || err) }))
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), giftApiDev()],
  base: './',
  server: {
    host: true,
  },
})
