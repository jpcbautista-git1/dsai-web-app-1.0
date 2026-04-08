const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const { spawn } = require('child_process')

const UPLOADS = path.join(__dirname, 'uploads')
const DATA = path.join(__dirname, 'data')
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true })
if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage })

const app = express()
app.use(cors())
app.use(express.json())
app.use('/data', express.static(DATA))

app.post('/api/upload', upload.single('file'), (req, res) => {
  console.log('[upload] request received')
  if (!req.file) {
    console.warn('[upload] no file in request')
    return res.status(400).json({ ok: false, error: 'no file' })
  }

  console.log('[upload] multer saved file:', req.file)
  const src = req.file.path

  try {
    // use the original filename (keep extension) and make it safe/unique for data folder
    const originalName = req.file.originalname || req.file.filename || 'upload'
    const safeOriginal = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const baseName = `${Date.now()}-${safeOriginal}`
    const dest = path.join(DATA, baseName + '.uploaded')

    // copy to data so worker can read and we can serve it
    fs.copyFileSync(src, dest)
    console.log(`[upload] copied to data: ${dest}`)

    // spawn python worker to process the uploaded file
    try {
      const outBase = path.join(DATA, baseName)
      const worker = spawn('python', [path.join(__dirname, 'workers', 'process_report.py'), dest, outBase], { detached: true, stdio: 'ignore' })
      worker.unref()
      console.log('[upload] spawned worker for', dest)
    } catch (err) {
      console.error('[upload] failed to spawn worker', err)
    }

    const jobId = path.basename(dest)
    return res.json({ ok: true, jobId, savedOriginal: originalName, savedCopy: jobId })
  } catch (err) {
    console.error('[upload] failed to copy to data', err)
    return res.status(500).json({ ok: false, error: 'failed to save uploaded file', detail: String(err) })
  }
})

app.get('/api/uploads', (req, res) => {
  let files = []
  try { files = fs.readdirSync(UPLOADS) } catch (e) { files = [] }
  res.json({ files })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log('server listening on', PORT))
