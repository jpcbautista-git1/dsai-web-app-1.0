// Simple AI proxy server
// - POST /api/ai { prompt, provider? }
// - By default forwards to OpenAI Chat Completions (requires OPENAI_API_KEY env)
// - You can also set AI_API_URL and AI_API_KEY to target another HTTP AI endpoint.
// Note: GitHub Copilot (Copilot Pro) does not expose a public HTTP API; you must use a supported API (OpenAI or similar).

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json({ limit: '200kb' }))

// DEV ONLY: disable TLS certificate validation for local testing when user accepts the risk
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
console.warn('WARNING: NODE_TLS_REJECT_UNAUTHORIZED=0 — TLS certificate validation is disabled. Use only for local testing.')

const PORT = process.env.PORT || 3002

app.post('/api/ai', async (req, res) => {
  try {
    const { prompt, provider } = req.body || {}
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'Missing prompt' })

    // If user explicitly wants GitHub Copilot, return informative error (no public API)
    if ((provider || '').toLowerCase().includes('copilot')){
      return res.status(501).json({ error: 'GitHub Copilot/CoPilot Pro does not offer a public HTTP API. Use OpenAI or another provider and set OPENAI_API_KEY (or set AI_API_URL/AI_API_KEY).' })
    }

    // Prefer explicit AI_API_URL/AI_API_KEY if provided
    const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
    const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY

    // Support Google Generative Language (Gemini) when requested via provider or env
    const providerNormalized = ((provider || process.env.AI_PROVIDER) || '').toString().toLowerCase()
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY

    // If Gemini/Google detected, prepare a GaML request
    if (providerNormalized.includes('gemini') || providerNormalized.includes('google') || (process.env.AI_PROVIDER || '').toLowerCase().includes('gemini') ){
      if (!GOOGLE_API_KEY) return res.status(500).json({ error: 'Google API key not configured. Set GOOGLE_API_KEY (or AI_API_KEY) in env.' })
      const gaModel = process.env.GOOGLE_MODEL || 'models/gemini-1.0' // override via env if needed
      const gaUrl = `https://generativelanguage.googleapis.com/v1/${gaModel}:generateText?key=${GOOGLE_API_KEY}`
      const gaBody = {
        prompt: { text: prompt },
        temperature: Number(process.env.AI_TEMPERATURE || 0.2),
        maxOutputTokens: Number(process.env.AI_MAX_TOKENS || 800)
      }
      const fetch = global.fetch || (await import('node-fetch')).default
      const resp = await fetch(gaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gaBody)
      })
      if (!resp.ok){ const txt = await resp.text(); return res.status(502).json({ error: 'Upstream Google AI error', detail: txt }) }
      const data = await resp.json()
      // extract text from known response shapes
      let reply = ''
      if (data.candidates && data.candidates.length){ reply = data.candidates.map(c => c.output || c.content?.[0]?.text || '').join('\n') }
      else if (data.output && Array.isArray(data.output)) { reply = data.output.map(o => o.content?.[0]?.text || o.text || '').join('\n') }
      else if (data.results && Array.isArray(data.results)) { reply = data.results.map(r => r.output?.[0]?.content?.map(c=>c.text).join('') || '').join('\n') }
      else { reply = JSON.stringify(data) }
      return res.json({ ok: true, reply, raw: data })
    }

    // Fallback: OpenAI-style / generic HTTP provider
    if (!AI_API_KEY) return res.status(500).json({ error: 'AI API key not configured. Set OPENAI_API_KEY or AI_API_KEY in env.' })

    // Prepare request for OpenAI Chat Completions shape
    const body = {
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an assistant. Reply concisely.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: Number(process.env.AI_MAX_TOKENS || 800),
      temperature: Number(process.env.AI_TEMPERATURE || 0.2)
    }

    const fetch = global.fetch || (await import('node-fetch')).default
    const resp = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify(body)
    })

    if (!resp.ok){
      const txt = await resp.text()
      return res.status(502).json({ error: 'Upstream AI provider error', detail: txt })
    }

    const data = await resp.json()

    // Attempt to extract assistant reply from known shapes
    let reply = ''
    if (data.choices && data.choices.length){
      // OpenAI chat-like response
      const content = data.choices[0].message?.content || data.choices[0].text || ''
      reply = content
    } else if (data.output && Array.isArray(data.output)){
      reply = data.output.map(o => (o.content?.[0]?.text || o.text || '')).join('\n')
    } else {
      reply = JSON.stringify(data)
    }

    return res.json({ ok: true, reply, raw: data })
  } catch (err){
    console.error('AI proxy error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/', (req, res) => res.send('AI proxy running'))

app.listen(PORT, () => console.log(`AI proxy listening on http://localhost:${PORT}`))
