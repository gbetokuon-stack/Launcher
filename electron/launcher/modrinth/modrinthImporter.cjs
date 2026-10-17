/**
 * VoxelXLauncher — Minecraft Launcher
 * Created by FoxStudio. AI-assisted development.
 *
 * Source code : https://github.com/foxstudio-201/VoxelXLauncher
 * Website     : https://voxxelxclient.vercel.app
 *
 * NOTICE:
 *   - This software is provided as-is without warranty of any kind.
 *   - Do not redistribute or resell without explicit permission from FoxStudio.
 *   - If you use or reference this code, please credit FoxStudio.
 *   - Minecraft is a trademark of Mojang Studios / Microsoft. This project is not affiliated with Mojang.
 */

'use strict'

const https  = require('https')
const http   = require('http')
const fs     = require('fs')
const path   = require('path')
const zlib   = require('zlib')
const crypto = require('crypto')

function inflateRawAsync(buf) {
  return new Promise((resolve, reject) => {
    zlib.inflateRaw(buf, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

async function readZipEntry(buf, entryName) {
  const view = new DataView(buf.buffer ?? buf)
  let eocdOffset = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break }
  }
  if (eocdOffset < 0) return null

  const cdOffset = buf.readUInt32LE(eocdOffset + 16)
  const cdCount  = buf.readUInt16LE(eocdOffset + 10)
  let pos = cdOffset

  for (let i = 0; i < cdCount; i++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break
    const compMethod  = buf.readUInt16LE(pos + 10)
    const compSize    = buf.readUInt32LE(pos + 20)
    const fnLen       = buf.readUInt16LE(pos + 28)
    const extraLen    = buf.readUInt16LE(pos + 30)
    const commentLen  = buf.readUInt16LE(pos + 32)
    const localOffset = buf.readUInt32LE(pos + 42)
    const fileName    = buf.slice(pos + 46, pos + 46 + fnLen).toString('utf8')

    if (fileName === entryName) {
      const lfnLen  = buf.readUInt16LE(localOffset + 26)
      const lexLen  = buf.readUInt16LE(localOffset + 28)
      const dataOff = localOffset + 30 + lfnLen + lexLen
      const comp    = buf.slice(dataOff, dataOff + compSize)
      if (compMethod === 0) return comp
      if (compMethod === 8) return inflateRawAsync(comp)
      return null
    }
    pos += 46 + fnLen + extraLen + commentLen
  }
  return null
}

async function iterZipEntries(buf, cb) {
  let eocdOffset = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break }
  }
  if (eocdOffset < 0) return

  const cdOffset = buf.readUInt32LE(eocdOffset + 16)
  const cdCount  = buf.readUInt16LE(eocdOffset + 10)
  let pos = cdOffset

  for (let i = 0; i < cdCount; i++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break
    const compMethod  = buf.readUInt16LE(pos + 10)
    const compSize    = buf.readUInt32LE(pos + 20)
    const fnLen       = buf.readUInt16LE(pos + 28)
    const extraLen    = buf.readUInt16LE(pos + 30)
    const commentLen  = buf.readUInt16LE(pos + 32)
    const localOffset = buf.readUInt32LE(pos + 42)
    const fileName    = buf.slice(pos + 46, pos + 46 + fnLen).toString('utf8')

    await cb(fileName, async () => {
      const lfnLen  = buf.readUInt16LE(localOffset + 26)
      const lexLen  = buf.readUInt16LE(localOffset + 28)
      const dataOff = localOffset + 30 + lfnLen + lexLen
      const comp    = buf.slice(dataOff, dataOff + compSize)
      if (compMethod === 0) return comp
      if (compMethod === 8) return inflateRawAsync(comp)
      return null
    })
    pos += 46 + fnLen + extraLen + commentLen
    if (i % 10 === 0) await new Promise(r => setImmediate(r))
  }
}

const CONCURRENCY = 6
const DOWNLOAD_TIMEOUT_MS = 25000
const MAX_RETRIES = 3

async function verifyFile(filePath, hashes) {
  try {
    const stat = await fs.promises.stat(filePath)
    if (stat.size === 0) return false
    if (!hashes || (!hashes.sha1 && !hashes.sha512)) return true

    const data = await fs.promises.readFile(filePath)
    if (hashes.sha512) {
      const h = crypto.createHash('sha512').update(data).digest('hex')
      if (h.toLowerCase() !== hashes.sha512.toLowerCase()) return false
    }
    if (hashes.sha1) {
      const h = crypto.createHash('sha1').update(data).digest('hex')
      if (h.toLowerCase() !== hashes.sha1.toLowerCase()) return false
    }
    return true
  } catch {
    return false
  }
}

function downloadSingleFile(url, destPath, hashes) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath)
    fs.mkdirSync(dir, { recursive: true })
    const tmpPath = `${destPath}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`

    let settled = false
    const cleanup = () => { try { fs.unlinkSync(tmpPath) } catch {} }
    const fail = (err) => {
      if (settled) return
      settled = true
      cleanup()
      reject(err)
    }
    const succeed = async () => {
      if (settled) return
      settled = true
      try {
        if (hashes) {
          const ok = await verifyFile(tmpPath, hashes)
          if (!ok) {
            cleanup()
            return reject(new Error('Sai mã băm file (hash mismatch)'))
          }
        }
        await fs.promises.rename(tmpPath, destPath).catch(async () => {
          await fs.promises.copyFile(tmpPath, destPath)
          cleanup()
        })
        resolve()
      } catch (err) {
        cleanup()
        reject(err)
      }
    }

    const MAX_REDIRECTS = 5
    function requestUrl(currentUrl, redirectCount) {
      if (redirectCount > MAX_REDIRECTS) return fail(new Error('Quá nhiều redirects'))
      const client = currentUrl.startsWith('https') ? https : http
      const req = client.get(currentUrl, {
        headers: { 'User-Agent': 'VoxelXLauncher/Pinecone-2.0' },
        timeout: DOWNLOAD_TIMEOUT_MS,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          return requestUrl(res.headers.location, redirectCount + 1)
        }
        if (res.statusCode !== 200) {
          res.resume()
          return fail(new Error(`HTTP ${res.statusCode}: ${currentUrl}`))
        }
        const out = fs.createWriteStream(tmpPath)
        res.pipe(out)
        out.on('finish', () => succeed())
        out.on('error', (err) => fail(err))
        res.on('error', (err) => fail(err))
      })
      req.on('timeout', () => {
        req.destroy()
        fail(new Error(`Hết thời gian chờ tải (${DOWNLOAD_TIMEOUT_MS / 1000}s): ${currentUrl}`))
      })
      req.on('error', (err) => fail(err))
    }

    requestUrl(url, 0)
  })
}

async function downloadFileWithRetry(urls, destPath, hashes) {
  const urlList = Array.isArray(urls) ? urls : [urls]
  let lastErr = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    for (const u of urlList) {
      if (!u) continue
      try {
        await downloadSingleFile(u, destPath, hashes)
        return true
      } catch (err) {
        lastErr = err
      }
    }
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, attempt * 400))
    }
  }
  throw lastErr || new Error('Không thể tải file từ các nguồn')
}

async function parallelWorkerPool(items, concurrency, workerFn) {
  let index = 0
  const workers = Array(Math.min(concurrency, items.length || 1)).fill(0).map(async () => {
    while (index < items.length) {
      const i = index++
      await workerFn(items[i], i)
    }
  })
  await Promise.all(workers)
}

async function importModrinthPack(mrpackPath, instancePath, onProgress) {
  onProgress?.({ phase: 'read', log: 'Đọc file modpack...', percent: 2 })

  const buf = await fs.promises.readFile(mrpackPath)

  const indexData = await readZipEntry(buf, 'modrinth.index.json')
  if (!indexData) throw new Error('modrinth.index.json không tìm thấy trong file')

  const index = JSON.parse(indexData.toString('utf8'))
  const name        = index.name || path.basename(mrpackPath, '.mrpack')
  const gameVersion = index.dependencies?.minecraft || ''
  let loader = 'fabric', loaderVersion = ''

  if (index.dependencies?.['fabric-loader'])    { loader = 'fabric';   loaderVersion = index.dependencies['fabric-loader'] }
  else if (index.dependencies?.['forge'])       { loader = 'forge';    loaderVersion = index.dependencies['forge'] }
  else if (index.dependencies?.['neoforge'])    { loader = 'neoforge'; loaderVersion = index.dependencies['neoforge'] }
  else if (index.dependencies?.['quilt-loader']){ loader = 'quilt';    loaderVersion = index.dependencies['quilt-loader'] }

  const files = (index.files || []).filter(f =>
    !f.env || f.env.client !== 'unsupported'
  )
  const total = files.length
  const blockedMods = []

  onProgress?.({ phase: 'mods', log: `Bắt đầu tải ${total} mods (tải song song ${CONCURRENCY} luồng)...`, done: 0, total, percent: 5 })

  let done = 0
  await parallelWorkerPool(files, CONCURRENCY, async (file) => {
    const destPath = path.join(instancePath, file.path)
    const fn = path.basename(file.path)

    const alreadyValid = await verifyFile(destPath, file.hashes)
    if (alreadyValid) {
      done++
      const pct = 5 + Math.round((done / total) * 75)
      onProgress?.({ phase: 'mods', log: `[${done}/${total}] Đã có sẵn: ${fn}`, done, total, percent: pct })
      return
    }

    const candidateUrls = file.downloads || []
    if (candidateUrls.length === 0) {
      done++
      const pct = 5 + Math.round((done / total) * 75)
      onProgress?.({ phase: 'mods', log: `[${done}/${total}] Không có link tải: ${file.path}`, done, total, percent: pct })
      blockedMods.push({
        id: file.hashes?.sha1 || fn,
        fileName: fn,
        name: fn.replace(/\.jar$/i, ''),
        platform: 'modrinth',
        browserUrl: `https://modrinth.com/mod/${encodeURIComponent(fn.replace(/\.jar$/i, ''))}`,
      })
      return
    }

    try {
      await downloadFileWithRetry(candidateUrls, destPath, file.hashes)
      done++
      const pct = 5 + Math.round((done / total) * 75)
      onProgress?.({ phase: 'mods', log: `[${done}/${total}] Đã tải: ${fn}`, done, total, percent: pct })
    } catch (err) {
      done++
      const pct = 5 + Math.round((done / total) * 75)
      onProgress?.({ phase: 'mods', log: `[WARN] Lỗi tải ${fn}: ${err.message}`, done, total, percent: pct })
      blockedMods.push({
        id: file.hashes?.sha1 || fn,
        fileName: fn,
        name: fn.replace(/\.jar$/i, ''),
        platform: 'modrinth',
        browserUrl: candidateUrls[0] || `https://modrinth.com/mod/${encodeURIComponent(fn.replace(/\.jar$/i, ''))}`,
      })
    }
  })

  onProgress?.({ phase: 'overrides', log: 'Giải nén cấu hình và overrides...', percent: 83 })

  const overridePrefixes = ['overrides/', 'client-overrides/']
  await iterZipEntries(buf, async (fileName, getData) => {
    const prefix = overridePrefixes.find(p => fileName.startsWith(p))
    if (!prefix || fileName.endsWith('/')) return

    const relPath = fileName.slice(prefix.length)
    const destPath = path.join(instancePath, relPath)
    const destDir  = path.dirname(destPath)

    try {
      await fs.promises.mkdir(destDir, { recursive: true })
      const data = await getData()
      if (data) await fs.promises.writeFile(destPath, data)
    } catch {}
  })

  // Save index copy for future missing mods checks
  try {
    await fs.promises.writeFile(path.join(instancePath, '.modrinth.index.json'), indexData)
  } catch {}

  // Final verification: check all files
  for (const file of files) {
    const destPath = path.join(instancePath, file.path)
    const ok = await verifyFile(destPath, file.hashes)
    if (!ok) {
      const fn = path.basename(file.path)
      const already = blockedMods.some(b => b.fileName === fn)
      if (!already) {
        blockedMods.push({
          id: file.hashes?.sha1 || fn,
          fileName: fn,
          name: fn.replace(/\.jar$/i, ''),
          platform: 'modrinth',
          browserUrl: file.downloads?.[0] || `https://modrinth.com/mod/${encodeURIComponent(fn.replace(/\.jar$/i, ''))}`,
        })
      }
    }
  }

  const msg = blockedMods.length > 0
    ? `Import hoàn tất: ${name} (${blockedMods.length} mod cần tải bổ sung)`
    : `Import hoàn tất: ${name}`
  onProgress?.({ phase: 'done', log: msg, percent: 100, blockedMods })

  return { name, gameVersion, loader, loaderVersion, iconUrl: null, bgUrl: null, blockedMods }
}

module.exports = { importModrinthPack }
