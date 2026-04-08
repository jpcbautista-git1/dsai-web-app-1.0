const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

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
  const dest = path.join(DATA, req.file.filename + '.uploaded')
  try {
    // move/copy to data to signal available file for client polling
    fs.copyFileSync(src, dest)
    console.log(`[upload] copied to data: ${dest}`)
  } catch (err) {
    console.error('[upload] failed to copy to data', err)
    return res.status(500).json({ ok: false, error: 'failed to save uploaded file', detail: String(err) })
  }

  // return job id and file paths for debugging
  const jobId = path.basename(dest)
  res.json({ ok: true, jobId, savedOriginal: path.basename(src), savedCopy: jobId })
})

app.get('/api/uploads', (req, res) => {
  let files = []
  try { files = fs.readdirSync(UPLOADS) } catch (e) { files = [] }
  res.json({ files })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log('server listening on', PORT))
