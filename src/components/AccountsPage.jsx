import React, { useState, useEffect, useRef } from 'react'
import { useAccounts } from '../hooks/useAccounts.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { formatRelative } from '../utils/format.js'
import {
  UserCircle, ShieldCheck, Clock, IdentificationCard,
  CheckCircle, Warning, Info, CircleNotch, Gear, Copy, Eye, EyeSlash, Trash, Plus
} from '@phosphor-icons/react'
import { PageHeader, Card, Button, Badge } from './ui.jsx'
import PlayerHead from './PlayerHead.jsx'
import PlayerModel3D from './PlayerModel3D.jsx'
import AddAccountModal from './AddAccountModal.jsx'
import SkinCustomizeModal from './SkinCustomizeModal.jsx'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

// Canvas helper to extract and crop head/face from raw 64x64 skin texture
function SkinHeadPreview({ skinUrl, size = 48 }) {
  const canvasRef = useRef(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!skinUrl) return
    setError(false)
    const img = new Image()
    if (skinUrl && !skinUrl.startsWith('data:') && !skinUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.imageSmoothingEnabled = false
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size)
      
      // Base head: 8, 8 (width 8, height 8)
      ctx.drawImage(img, 8, 8, 8, 8, 0, 0, size, size)
      // Helm overlay: 40, 8 (width 8, height 8)
      ctx.drawImage(img, 40, 8, 8, 8, 0, 0, size, size)
    }
    img.onerror = () => {
      setError(true)
    }
    img.src = skinUrl
  }, [skinUrl, size])

  if (error) {
    return (
      <div 
        className="rounded-lg bg-bg2 border border-line flex items-center justify-center text-fgdim font-medium text-xs"
        style={{ width: size, height: size }}
      >
        Skin
      </div>
    )
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className="rounded-lg bg-bg2 border border-line" 
      style={{ width: size, height: size, imageRendering: 'pixelated' }} 
    />
  )
}

export default function AccountsPage() {
  const {
    accounts,
    selectedAccount,
    loading,
    addAccount,
    updateAccount,
    removeAccount,
    selectAccount
  } = useAccounts()

  const toast = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSkinModal, setShowSkinModal] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)
  
  const [slim, setSlim] = useState(false)
  const [showUuid, setShowUuid] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [skinPrefs, setSkinPrefs] = useState(null)

  const selected = selectedAccount || accounts[0] || null

  useEffect(() => {
    if (!loading && accounts.length === 0) {
      setShowAddModal(true)
    }
  }, [loading, accounts.length])

  // Load custom skin prefs when selected account changes
  useEffect(() => {
    if (!selected?.uuid) {
      setSkinPrefs(null)
      return
    }
    const load = async () => {
      try {
        const prefs = isElectron
          ? await window.electronAPI.getSkinPrefs({ uuid: selected.uuid })
          : JSON.parse(localStorage.getItem(`vxc_skin_prefs_${selected.uuid}`) || 'null')

        setSkinPrefs(prefs || null)
      } catch {
        setSkinPrefs(null)
      }
    }
    load()
  }, [selected?.uuid])

  const appliedSkinUrl = skinPrefs?.useCustomSkin !== false ? (skinPrefs?.skinUrl || null) : null

  const onRemove = async (id) => {
    const r = await removeAccount(id)
    if (r?.error) {
      toast.push({ type: 'error', title: 'Xoá thất bại', message: r.error })
    } else {
      toast.push({ type: 'success', message: 'Đã xoá tài khoản.' })
    }
    setConfirmRemove(null)
  }

  const handleCopyUuid = () => {
    if (!selected?.uuid) return
    navigator.clipboard.writeText(selected.uuid).then(() => {
      setCopied(true)
      toast.push({ type: 'success', message: 'Đã sao chép UUID.' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSelectSkinFromGrid = async (item) => {
    if (item.isDefault || item.isRemove) {
      const newPrefs = {
        uuid: selected?.uuid,
        skinUrl: item.isRemove ? null : (skinPrefs?.skinUrl || null),
        capeUrl: item.isRemove ? null : (skinPrefs?.capeUrl || null),
        elytraUrl: item.isRemove ? null : (skinPrefs?.elytraUrl || null),
        useCustomSkin: false,
      }
      try {
        if (isElectron) {
          await window.electronAPI.saveSkinPrefs(newPrefs)
          if (item.isRemove) {
            await window.electronAPI.deleteLocalFile({ uuid: selected?.uuid, type: 'skin' })
          }
        } else {
          localStorage.setItem(`vxc_skin_prefs_${selected?.uuid}`, JSON.stringify(newPrefs))
        }
      } catch (err) {
        console.error(err)
      }
      setSkinPrefs(item.isRemove ? null : newPrefs)
      setSlim(false)
      toast.push({ type: 'success', message: item.isRemove ? 'Đã gỡ skin tùy chỉnh.' : 'Đã chuyển về skin mặc định.' })
    } else {
      if (!item.active) {
        const newPrefs = {
          uuid: selected?.uuid,
          skinUrl: skinPrefs?.skinUrl || null,
          capeUrl: skinPrefs?.capeUrl || null,
          elytraUrl: skinPrefs?.elytraUrl || null,
          useCustomSkin: true,
        }
        try {
          if (isElectron) {
            await window.electronAPI.saveSkinPrefs(newPrefs)
          } else {
            localStorage.setItem(`vxc_skin_prefs_${selected?.uuid}`, JSON.stringify(newPrefs))
          }
        } catch (err) {
          console.error(err)
        }
        setSkinPrefs(newPrefs)
        toast.push({ type: 'success', message: 'Đã kích hoạt skin tùy chỉnh.' })
      } else {
        toast.push({ type: 'info', message: 'Skin này hiện đang được sử dụng.' })
      }
    }
  }

  return (
    <div className="flex w-full min-h-0 flex-1 overflow-hidden">
      {/* Cột trái: Quản lý tài khoản và Skin */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-line bg-bg0">
        <PageHeader
          eyebrow="TÀI KHOẢN"
          title="Tài Khoản Minecraft"
          subtitle="Quản lý tài khoản Microsoft và Offline, cấu hình skin và trang phục cho nhân vật."
        >
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2 font-medium">
            <Plus size={15} weight="bold" />
            Thêm tài khoản
          </Button>
        </PageHeader>

        {/* Danh sách tài khoản */}
        <div className="overflow-y-auto px-8 pt-4 pb-4 space-y-2.5 max-h-[45%]">
          {loading ? (
            <div className="text-sm text-fgdim flex items-center gap-2 py-4">
              <CircleNotch size={14} className="animate-spin text-accent" />
              Đang tải danh sách tài khoản...
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-6 text-center text-xs text-fgfaint">
              Chưa có tài khoản nào. Bấm "Thêm tài khoản" ở góc trên để bắt đầu.
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((a) => (
                <AccountRow
                  key={a.id}
                  account={a}
                  isSelected={a.id === selected?.id}
                  onSelect={() => selectAccount(a.id)}
                  onRemove={() => setConfirmRemove(a)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Ngăn cách */}
        <div className="h-px bg-line mx-8 flex-shrink-0" />

        {/* Tab điều chỉnh skin */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-8 pt-4 pb-5">
          {selected ? (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between pb-3 border-b border-line flex-shrink-0">
                <h3 className="text-xs font-semibold text-fg tracking-wide uppercase">Skin của {selected.username}</h3>
                <Button 
                  variant="subtle" 
                  size="sm" 
                  onClick={() => setShowSkinModal(true)} 
                  className="text-xs gap-1.5"
                >
                  <Gear size={13} />
                  Tùy chỉnh skin
                </Button>
              </div>

              {/* Grid hiển thị skin */}
              <div className="flex-1 overflow-y-auto pt-4 pb-2">
                {(() => {
                  const defaultBodyPreviewUrl = selected?.username ? `https://crafthead.net/body/${selected.username}` : null
                  const items = []

                  if (defaultBodyPreviewUrl) {
                    items.push({
                      url: defaultBodyPreviewUrl,
                      label: 'Skin mặc định',
                      active: !skinPrefs?.skinUrl || skinPrefs.useCustomSkin === false,
                      isDefault: true,
                    })
                  }
                  if (skinPrefs?.skinUrl) {
                    items.push({
                      url: skinPrefs.skinUrl,
                      label: 'Skin tùy chỉnh',
                      active: skinPrefs.useCustomSkin !== false,
                      isDefault: false,
                      isCustomSkin: true,
                    })
                  }

                  if (items.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <p className="text-xs text-fgfaint">Chưa có skin nào được tải lên.</p>
                        <button
                          onClick={() => setShowSkinModal(true)}
                          className="text-xs text-accent hover:underline font-medium"
                        >
                          Tải lên file skin (.png)
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectSkinFromGrid(item)}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-lg transition-colors cursor-pointer group relative border min-h-[120px] ${
                            item.active
                              ? 'bg-accentsoft border-accent'
                              : 'bg-bg1 border-line hover:border-linestrong'
                          }`}
                        >
                          {item.active && (
                            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent" />
                          )}
                          
                          {item.isDefault ? (
                            <img
                              src={item.url}
                              alt=""
                              className="w-12 h-12 rounded object-contain bg-bg0"
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <SkinHeadPreview skinUrl={item.url} size={48} />
                          )}
                          
                          <span className="text-[11px] font-medium text-fgdim mt-2 truncate w-full text-center">
                            {item.label}
                          </span>
                          
                          {item.isCustomSkin ? (
                            <div className="mt-1 flex items-center justify-between w-full px-1">
                              {item.active ? (
                                <span className="text-[10px] text-accent font-semibold">Đang dùng</span>
                              ) : (
                                <span className="text-[10px] text-fgfaint opacity-0 group-hover:opacity-100 transition-opacity">Nhấp để dùng</span>
                              )}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  await handleSelectSkinFromGrid({ isRemove: true })
                                }}
                                className="p-1 rounded text-fgfaint hover:text-error hover:bg-errorsoft transition-colors"
                                title="Xóa skin tùy chỉnh"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          ) : (
                            item.active ? (
                              <span className="text-[10px] text-accent mt-0.5 font-semibold">Đang dùng</span>
                            ) : (
                              <span className="text-[10px] text-fgfaint mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                Nhấp để dùng
                              </span>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-fgfaint">
              Chọn một tài khoản để tùy chỉnh skin.
            </div>
          )}
        </div>
      </div>

      {/* Cột phải: Xem trước mô hình 3D */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-bg1 border-l border-line">
        <div className="p-3 border-b border-line text-xs font-semibold text-fgdim uppercase tracking-wider text-center">
          Mô Hình Nhân Vật
        </div>

        {selected ? (
          <>
            <div className="flex-1 min-h-0 relative bg-bg0/60 tech-grid hud-bracket overflow-hidden flex flex-col justify-between p-3">
              <div className="flex items-center justify-between text-[9px] font-mono text-accent z-10 select-none">
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  HOLO MODEL 3D
                </span>
                <span className="text-fgfaint">ROTATABLE</span>
              </div>
              <div className="absolute inset-0 z-0">
                <PlayerModel3D
                  uuid={selected.uuid}
                  username={selected.username}
                  slim={slim}
                  customSkinUrl={appliedSkinUrl}
                />
              </div>
            </div>

            <div className="text-center p-4 border-t border-line bg-bg1">
              <p className="text-sm font-semibold text-fg truncate">{selected.username}</p>

              {/* UUID row */}
              <div className="flex items-center justify-center gap-1.5 mt-1 text-fgfaint font-mono text-[10px]">
                <span className="truncate max-w-[130px]">
                  {showUuid ? selected.uuid : `${selected.uuid.slice(0, 8)}...`}
                </span>
                <button
                  onClick={() => setShowUuid(!showUuid)}
                  className="text-fgfaint hover:text-fg transition-colors"
                  title={showUuid ? 'Ẩn UUID' : 'Hiện UUID'}
                >
                  {showUuid ? <EyeSlash size={12} /> : <Eye size={12} />}
                </button>
                <button
                  onClick={handleCopyUuid}
                  className="text-fgfaint hover:text-fg transition-colors"
                  title="Sao chép UUID"
                >
                  <Copy size={12} className={copied ? 'text-accent' : ''} />
                </button>
              </div>

              {/* Type badge and slim/wide toggle */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <Badge tone={(selected.type || 'microsoft') === 'microsoft' ? 'info' : 'neutral'}>
                  {selected.type || 'offline'}
                </Badge>

                <button
                  onClick={() => setSlim(!slim)}
                  className="text-[10px] px-2 py-0.5 rounded border border-line bg-bg0 text-fgdim hover:text-fg hover:border-linestrong transition-colors font-medium cursor-pointer"
                >
                  Dạng tay: {slim ? 'Alex (Slim)' : 'Steve (Wide)'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center p-6">
            <UserCircle size={32} className="text-fgfaint" />
            <p className="text-xs text-fgfaint">Chọn một tài khoản để xem mô hình 3D</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onAdd={addAccount}
          existingAccounts={accounts}
        />
      )}

      {showSkinModal && (
        <SkinCustomizeModal
          account={selected}
          onClose={() => setShowSkinModal(false)}
          onApply={({ type, url, skinType }) => {
            if (type === 'skin') {
              setSkinPrefs(prev => ({
                ...prev,
                uuid: selected?.uuid,
                skinUrl: url,
                useCustomSkin: true
              }))
              if (skinType) setSlim(skinType === 'slim')
            }
            toast.push({
              type: 'success',
              title: 'Đã cập nhật skin',
              message: 'Skin mới đã được lưu thành công.'
            })
          }}
        />
      )}

      {confirmRemove && (
        <ConfirmModal
          title="Xoá tài khoản?"
          message={`Tài khoản "${confirmRemove.username}" sẽ bị xoá khỏi danh sách.`}
          confirmText="Xoá"
          danger
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => onRemove(confirmRemove.id)}
        />
      )}
    </div>
  )
}

function AccountRow({ account, isSelected, onSelect, onRemove }) {
  return (
    <div 
      className={[
        'p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 group',
        isSelected ? 'border-accent bg-accentsoft' : 'border-line bg-bg1 hover:border-linestrong',
      ].join(' ')} 
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <PlayerHead uuid={account.uuid} username={account.username} size={34} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-fg truncate text-xs">{account.username}</span>
            {isSelected && <Badge tone="accent">Đang chọn</Badge>}
            <Badge tone={(account.type || 'microsoft') === 'microsoft' ? 'info' : 'neutral'}>
              {account.type || 'offline'}
            </Badge>
          </div>
          <div className="text-[10px] text-fgfaint font-mono mt-0.5 truncate">
            {account.uuid.slice(0, 18)}...
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {isSelected && (
          <CheckCircle size={16} weight="fill" className="text-accent group-hover:hidden" />
        )}
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded flex items-center justify-center text-fgfaint hover:text-error hover:bg-errorsoft transition-colors hidden group-hover:flex cursor-pointer"
          title="Xoá tài khoản"
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  )
}

function ConfirmModal({ title, message, confirmText, danger, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-lg bg-bg1 border border-line shadow-xl p-5">
        <div className="flex items-start gap-3 mb-2">
          <div className={[
            'w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0',
            danger ? 'bg-errorsoft text-error' : 'bg-accentsoft text-accent',
          ].join(' ')}>
            {danger ? <Warning size={18} /> : <Info size={18} />}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-fg mb-1">{title}</h2>
            <p className="text-xs text-fgdim">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="subtle" size="sm" onClick={onCancel}>Huỷ</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}