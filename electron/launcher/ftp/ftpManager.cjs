'use strict'

const fs = require('fs')
const path = require('path')
const ftp = require('basic-ftp')

let activeClient = null
let currentSyncAbort = false

function getPresetsFile(dataDir) {
  return path.join(dataDir, 'ftp_servers.json')
}

function readPresets(dataDir) {
  const file = getPresetsFile(dataDir)
  try {
    if (!fs.existsSync(file)) return []
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return []
  }
}

function writePresets(dataDir, presets) {
  const file = getPresetsFile(dataDir)
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(presets, null, 2), { mode: 0o600 })
  fs.renameSync(tmp, file)
}

function register({ ipcMain, paths, getMainWindow }) {
  const { DATA_DIR, INSTANCES_DIR, PROFILES_FILE } = paths

  // 1. Get saved FTP presets
  ipcMain.handle('ftp:getPresets', async () => {
    return readPresets(DATA_DIR)
  })

  // 2. Save/Update FTP preset
  ipcMain.handle('ftp:savePreset', async (_e, preset) => {
    if (!preset || !preset.name || !preset.host) {
      return { error: 'Tên máy chủ và địa chỉ IP/Host không được để trống' }
    }
    const presets = readPresets(DATA_DIR)
    const id = preset.id || ('ftp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6))
    const existingIdx = presets.findIndex(p => p.id === id)

    const cleanPreset = {
      id,
      name: preset.name.trim(),
      host: preset.host.trim(),
      port: parseInt(preset.port || '21', 10),
      user: preset.user ? preset.user.trim() : 'anonymous',
      password: preset.password || '',
      remotePath: preset.remotePath ? preset.remotePath.trim() : '/mods',
      secure: Boolean(preset.secure),
      cleanSync: Boolean(preset.cleanSync),
      updatedAt: new Date().toISOString()
    }

    if (existingIdx >= 0) {
      presets[existingIdx] = cleanPreset
    } else {
      presets.push(cleanPreset)
    }

    writePresets(DATA_DIR, presets)
    return { ok: true, preset: cleanPreset, presets }
  })

  // 3. Delete FTP preset
  ipcMain.handle('ftp:deletePreset', async (_e, id) => {
    let presets = readPresets(DATA_DIR)
    presets = presets.filter(p => p.id !== id)
    writePresets(DATA_DIR, presets)
    return { ok: true, presets }
  })

  // 4. Test connection
  ipcMain.handle('ftp:testConnection', async (_e, config) => {
    const client = new ftp.Client(30000)
    try {
      await client.access({
        host: config.host.trim(),
        port: parseInt(config.port || '21', 10),
        user: config.user ? config.user.trim() : 'anonymous',
        password: config.password || '',
        secure: Boolean(config.secure)
      })
      const list = await client.list(config.remotePath || '/')
      client.close()
      return { ok: true, fileCount: list.length }
    } catch (err) {
      client.close()
      return { error: err.message || 'Không thể kết nối đến máy chủ FTP' }
    }
  })

  // 5. List remote directory and compare with local profile mods
  ipcMain.handle('ftp:listDirectory', async (_e, { config, remotePath, profileId }) => {
    const client = new ftp.Client(30000)
    try {
      await client.access({
        host: config.host.trim(),
        port: parseInt(config.port || '21', 10),
        user: config.user ? config.user.trim() : 'anonymous',
        password: config.password || '',
        secure: Boolean(config.secure)
      })

      const targetPath = remotePath || config.remotePath || '/'
      const remoteItems = await client.list(targetPath)
      client.close()

      // Read local profile mods if profileId is given
      let localMods = new Map()
      if (profileId) {
        let instancePath = null
        try {
          if (fs.existsSync(PROFILES_FILE)) {
            const profData = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'))
            const prof = profData.profiles?.find(p => p.id === profileId)
            if (prof) instancePath = prof.path || path.join(INSTANCES_DIR, profileId)
          }
        } catch {}

        if (!instancePath) instancePath = path.join(INSTANCES_DIR, profileId)
        const modsDir = path.join(instancePath, 'mods')
        if (fs.existsSync(modsDir)) {
          const files = fs.readdirSync(modsDir)
          for (const f of files) {
            try {
              const stat = fs.statSync(path.join(modsDir, f))
              localMods.set(f.toLowerCase(), {
                filename: f,
                size: stat.size,
                mtime: stat.mtime
              })
            } catch {}
          }
        }
      }

      const files = remoteItems.map(item => {
        const isDir = item.isDirectory
        const isJar = item.name.toLowerCase().endsWith('.jar')
        const isZip = item.name.toLowerCase().endsWith('.zip')
        const localMatch = localMods.get(item.name.toLowerCase())

        let status = 'new'
        if (localMatch) {
          if (localMatch.size === item.size) {
            status = 'installed'
          } else {
            status = 'update_available'
          }
        }

        return {
          name: item.name,
          isDirectory: isDir,
          size: item.size,
          rawModifiedAt: item.rawModifiedAt,
          modifiedAt: item.modifiedAt ? item.modifiedAt.toISOString() : null,
          isModFile: isJar || isZip,
          status,
          localSize: localMatch ? localMatch.size : null
        }
      })

      return {
        ok: true,
        currentPath: targetPath,
        files: files.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        })
      }
    } catch (err) {
      client.close()
      return { error: err.message || 'Lỗi khi đọc danh sách file từ máy chủ FTP' }
    }
  })

  // 6. Download single file from FTP
  ipcMain.handle('ftp:downloadFile', async (_e, { config, remotePath, filename, profileId, targetSubdir }) => {
    let instancePath = null
    try {
      if (fs.existsSync(PROFILES_FILE)) {
        const profData = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'))
        const prof = profData.profiles?.find(p => p.id === profileId)
        if (prof) instancePath = prof.path || path.join(INSTANCES_DIR, profileId)
      }
    } catch {}

    if (!instancePath) instancePath = path.join(INSTANCES_DIR, profileId)
    const targetDir = path.join(instancePath, targetSubdir || 'mods')
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

    const localFilePath = path.join(targetDir, filename)
    const client = new ftp.Client(60000)

    try {
      await client.access({
        host: config.host.trim(),
        port: parseInt(config.port || '21', 10),
        user: config.user ? config.user.trim() : 'anonymous',
        password: config.password || '',
        secure: Boolean(config.secure)
      })

      const remoteFile = remotePath.endsWith('/') ? remotePath + filename : remotePath + '/' + filename
      await client.downloadTo(localFilePath, remoteFile)
      client.close()

      return { ok: true, filename, localFilePath }
    } catch (err) {
      client.close()
      return { error: err.message || 'Không thể tải file từ FTP' }
    }
  })

  // 7. Synchronize entire mods directory
  ipcMain.handle('ftp:syncMods', async (_e, { config, profileId, cleanSync }) => {
    const mainWindow = getMainWindow ? getMainWindow() : null
    currentSyncAbort = false

    function notifyProgress(data) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('ftp:syncProgress', data)
      }
    }

    let instancePath = null
    try {
      if (fs.existsSync(PROFILES_FILE)) {
        const profData = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'))
        const prof = profData.profiles?.find(p => p.id === profileId)
        if (prof) instancePath = prof.path || path.join(INSTANCES_DIR, profileId)
      }
    } catch {}

    if (!instancePath) instancePath = path.join(INSTANCES_DIR, profileId)
    const localModsDir = path.join(instancePath, 'mods')
    if (!fs.existsSync(localModsDir)) fs.mkdirSync(localModsDir, { recursive: true })

    const client = new ftp.Client(60000)
    activeClient = client

    try {
      notifyProgress({
        phase: 'connecting',
        message: `Đang kết nối tới máy chủ FTP: ${config.host}...`,
        percent: 5
      })

      await client.access({
        host: config.host.trim(),
        port: parseInt(config.port || '21', 10),
        user: config.user ? config.user.trim() : 'anonymous',
        password: config.password || '',
        secure: Boolean(config.secure)
      })

      const remotePath = config.remotePath ? config.remotePath.trim() : '/mods'
      notifyProgress({
        phase: 'listing',
        message: `Đang quét danh sách file tại ${remotePath}...`,
        percent: 15
      })

      const remoteItems = await client.list(remotePath)
      const remoteFiles = remoteItems.filter(i => !i.isDirectory && (i.name.toLowerCase().endsWith('.jar') || i.name.toLowerCase().endsWith('.zip')))

      // Scan local mods
      const localFiles = fs.readdirSync(localModsDir)
      const localFileMap = new Map()
      for (const lf of localFiles) {
        try {
          const st = fs.statSync(path.join(localModsDir, lf))
          localFileMap.set(lf.toLowerCase(), { name: lf, size: st.size })
        } catch {}
      }

      // Determine what to download
      const toDownload = []
      const remoteNamesLower = new Set()

      for (const rf of remoteFiles) {
        remoteNamesLower.add(rf.name.toLowerCase())
        const local = localFileMap.get(rf.name.toLowerCase())
        if (!local || local.size !== rf.size) {
          toDownload.push(rf)
        }
      }

      // Determine what to delete if cleanSync is true
      const toDelete = []
      if (cleanSync) {
        for (const [lowerName, info] of localFileMap.entries()) {
          if (!remoteNamesLower.has(lowerName)) {
            toDelete.push(info.name)
          }
        }
      }

      notifyProgress({
        phase: 'plan',
        message: `Phân tích hoàn tất: Cần tải ${toDownload.length} mods, cần xóa ${toDelete.length} mods cũ.`,
        percent: 25,
        totalDownload: toDownload.length,
        totalDelete: toDelete.length
      })

      // Delete obsolete mods if requested
      if (cleanSync && toDelete.length > 0) {
        for (const df of toDelete) {
          try {
            fs.unlinkSync(path.join(localModsDir, df))
            notifyProgress({
              phase: 'deleting',
              message: `Đã dọn dẹp file cũ: ${df}`,
              percent: 25
            })
          } catch {}
        }
      }

      // Download missing or changed mods
      const totalCount = toDownload.length
      let downloadedCount = 0

      for (let i = 0; i < totalCount; i++) {
        if (currentSyncAbort) {
          throw new Error('Quá trình đồng bộ đã bị người dùng hủy.')
        }

        const rf = toDownload[i]
        const remoteFilePath = remotePath.endsWith('/') ? remotePath + rf.name : remotePath + '/' + rf.name
        const localFilePath = path.join(localModsDir, rf.name)
        const tmpFilePath = localFilePath + '.dlpart'

        const pct = Math.round(25 + ((i / totalCount) * 70))
        notifyProgress({
          phase: 'downloading',
          currentFile: rf.name,
          currentFileIndex: i + 1,
          totalFiles: totalCount,
          fileSize: rf.size,
          percent: pct,
          message: `[${i + 1}/${totalCount}] Đang tải: ${rf.name} (${Math.round(rf.size / 1024)} KB)...`
        })

        // Track per-file progress
        client.trackProgress(info => {
          if (rf.size > 0) {
            const filePct = Math.min(100, Math.round((info.bytes / rf.size) * 100))
            notifyProgress({
              phase: 'fileProgress',
              currentFile: rf.name,
              bytes: info.bytes,
              totalBytes: rf.size,
              filePercent: filePct
            })
          }
        })

        await client.downloadTo(tmpFilePath, remoteFilePath)
        client.trackProgress() // reset tracking

        if (fs.existsSync(localFilePath)) {
          try { fs.unlinkSync(localFilePath) } catch {}
        }
        fs.renameSync(tmpFilePath, localFilePath)
        downloadedCount++
      }

      client.close()
      activeClient = null

      notifyProgress({
        phase: 'completed',
        message: `Đồng bộ hoàn tất! Đã tải ${downloadedCount} mods, xóa ${toDelete.length} mods thừa.`,
        percent: 100,
        downloadedCount,
        deletedCount: toDelete.length
      })

      return {
        ok: true,
        downloadedCount,
        deletedCount: toDelete.length,
        totalRemoteMods: remoteFiles.length
      }
    } catch (err) {
      if (client) client.close()
      activeClient = null
      notifyProgress({
        phase: 'error',
        message: `Lỗi đồng bộ FTP: ${err.message}`,
        percent: 0,
        error: err.message
      })
      return { error: err.message || 'Lỗi đồng bộ FTP' }
    }
  })

  // 8. Cancel sync
  ipcMain.handle('ftp:cancelSync', async () => {
    currentSyncAbort = true
    if (activeClient) {
      try { activeClient.close() } catch {}
      activeClient = null
    }
    return { ok: true }
  })
}

module.exports = { register }
