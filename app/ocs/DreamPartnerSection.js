'use client'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { createClient } from '@/lib/supabaseClient'
import { getCroppedImg } from './[id]/cropImage'

export default function DreamPartnerSection({ dreamPartner, userId, saveAction, deleteAction }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dreamPartner?.name || '')
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result)
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleSave() {
    if (!name.trim()) {
      setError('お名前を入力してください')
      return
    }
    setPending(true)
    setError(null)
    try {
      let iconUrl = ''
      if (imageSrc && croppedAreaPixels) {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
        const supabase = createClient()
        const path = `${userId}/dream-partner.jpg`
        const { error: uploadError } = await supabase.storage
          .from('oc-icons')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
        if (!uploadError) {
          const { data } = supabase.storage.from('oc-icons').getPublicUrl(path)
          iconUrl = `${data.publicUrl}?t=${Date.now()}`
        }
      }
      const formData = new FormData()
      formData.set('name', name)
      if (iconUrl) formData.set('icon_url', iconUrl)
      const result = await saveAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditing(false)
        setImageSrc(null)
      }
    } finally {
      setPending(false)
    }
  }

  async function handleDelete() {
    if (!confirm('お相手の登録を削除しますか？')) return
    await deleteAction()
    setEditing(false)
  }

  if (!editing && dreamPartner) {
    return (
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', borderBottom: '3px double #211d17', paddingBottom: 8 }}>
          お相手
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 2px' }}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: '#211d17', border: '1px solid #211d17',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f4eee0', fontWeight: 700, fontSize: 16, fontFamily: 'Georgia, serif',
          }}>
            {dreamPartner.icon_url ? (
              <img src={dreamPartner.icon_url} alt={dreamPartner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : dreamPartner.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif' }}>{dreamPartner.name}</div>
          </div>
          <button type="button" onClick={() => { setEditing(true); setName(dreamPartner.name); setError(null) }} style={{ fontSize: 11, color: '#6b6250', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
            編集
          </button>
        </div>
        <p style={{ fontSize: 10, color: '#8a8168', fontStyle: 'italic' }}>
          お相手はあなただけに表示され、他の人からは見えません。
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', borderBottom: '3px double #211d17', paddingBottom: 8 }}>
        お相手
      </div>
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            display: 'block', width: '100%', textAlign: 'center', marginTop: 10,
            border: '1px dashed #6b6250', padding: 14,
            color: '#3d2717', fontWeight: 700, fontSize: 13, background: 'none', cursor: 'pointer', letterSpacing: '.05em',
          }}
        >
          + 夢のお相手を登録する
        </button>
      ) : (
        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5 }}>アイコン画像(任意)</label>
          <input type="file" accept="image/*" onChange={onFileChange} style={{ fontSize: 12.5 }} />
          {imageSrc && (
            <div style={{ marginTop: 10 }}>
              <div style={{ position: 'relative', width: '100%', height: 200, background: '#211d17' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '100%', marginTop: 8 }} />
            </div>
          )}
          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', marginTop: 12, marginBottom: 5 }}>お名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例:フレッド・ウィーズリー"
            style={{ width: '100%', padding: '10px 12px', fontSize: 15, background: '#fff', border: '1px solid #211d17', color: '#211d17', boxSizing: 'border-box' }}
          />
          {error && <p style={{ fontSize: 11.5, color: '#8a2418', marginTop: 8 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => { setEditing(false); setImageSrc(null); setError(null) }} disabled={pending} style={{ flex: 1, padding: 10, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              キャンセル
            </button>
            {dreamPartner && (
              <button type="button" onClick={handleDelete} disabled={pending} style={{ flex: 1, padding: 10, border: '1px solid #8a2418', background: '#fff', color: '#8a2418', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                削除
              </button>
            )}
            <button type="button" onClick={handleSave} disabled={pending} style={{ flex: 1, padding: 10, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              {pending ? '保存中…' : '保存'}
            </button>
          </div>
        </div>
      )}
      <p style={{ fontSize: 10, color: '#8a8168', marginTop: 8, fontStyle: 'italic' }}>
        お相手はあなただけに表示され、他の人からは見えません。
      </p>
    </div>
  )
}
