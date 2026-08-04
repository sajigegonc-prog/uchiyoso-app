'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import { createClient } from '@/lib/supabaseClient'
import { getCroppedImg } from './cropImage'
import { updateOcIcon } from './actions'

export default function IconUploader({ ocId, userId }) {
  const router = useRouter()
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [uploading, setUploading] = useState(false)

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
    if (!imageSrc || !croppedAreaPixels) return
    setUploading(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const supabase = createClient()
      const path = `${userId}/${ocId}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('oc-icons')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) {
        alert('アップロードに失敗しました: ' + uploadError.message)
        return
      }
      const { data } = supabase.storage.from('oc-icons').getPublicUrl(path)
      await updateOcIcon(ocId, `${data.publicUrl}?t=${Date.now()}`)
      setImageSrc(null)
      router.refresh()
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <input type="file" accept="image/*" onChange={onFileChange} style={{ fontSize: 12.5 }} />
      {imageSrc && (
        <div style={{ marginTop: 10 }}>
          <div style={{ position: 'relative', width: '100%', height: 260, background: '#241a10', borderRadius: 3 }}>
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
          <input
            type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100%', marginTop: 10 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={handleSave} disabled={uploading} style={{
              flex: 1, padding: 10, borderRadius: 3, border: 'none',
              background: '#8b5a2b', color: '#f3e9d8', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              {uploading ? '保存中…' : 'この位置・サイズで保存'}
            </button>
            <button type="button" onClick={() => setImageSrc(null)} style={{
              flex: 1, padding: 10, borderRadius: 3, border: '2px solid #d8c7ac',
              background: '#fff', color: '#8b7355', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
