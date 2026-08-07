'use client'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { createClient } from '@/lib/supabaseClient'
import { getCroppedImg } from './[id]/cropImage'

export default function DreamPartnerSection({ dreamPartners, dreamerOcs, userId, saveAction, deleteAction }) {
  const [editingId, setEditingId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [pairedOcId, setPairedOcId] = useState('')
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const pairedOcMap = new Map(dreamerOcs.map((oc) => [oc.id, oc.name]))
  const usedOcIds = new Set(dreamPartners.map((p) => p.paired_with_oc_id))
  const availableOcs = dreamerOcs.filter((oc) => !usedOcIds.has(oc.id) || oc.id === (dreamPartners.find(p => p.id === editingId)?.paired_with_oc_id))
  const canAddMore = dreamPartners.length < dreamerOcs.length

  function startCreate() {
    setCreating(true)
    setEditingId(null)
    setName('')
    setPairedOcId('')
    setImageSrc(null)
    setError(null)
  }
  function startEdit(p) {
    setEditingId(p.id)
    setCreating(false)
    setName(p.name)
    setPairedOcId(p.paired_with_oc_id || '')
    setImageSrc(null)
    setError(null)
  }
  function cancel() {
    setCreating(false)
    setEditingId(null)
    setImageSrc(null)
    setError(null)
  }

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result)
    reader.readAsDataURL(file)
  }
  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), [])

  async function handleSave() {
    if (!name.trim()) { setError('お名前を入力してください'); return }
    if (!pairedOcId) { setError('どのOCのお相手か選んでください'); return }
    setPending(true)
    setError(null)
    try {
      let iconUrl = ''
      if (imageSrc && croppedAreaPixels) {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
        const supabase = createClient()
        const fileId = editingId || crypto.randomUUID()
        const path = `${userId}/dream-partner-${fileId}.jpg`
        const { error: uploadError } = await supabase.storage.from('oc-icons').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
        if (!uploadError) {
          const { data } = supabase.storage.from('oc-icons').getPublicUrl(path)
          iconUrl = `${data.publicUrl}?t=${Date.now()}`
        }
      }
      const formData = new FormData()
      if (editingId) formData.set('id', editingId)
      formData.set('name', name)
      formData.set('paired_with_oc_id', pairedOcId)
      if (iconUrl) formData.set('icon_url', iconUrl)
      const result = await saveAction(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        cancel()
      }
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('お相手の登録を削除しますか？')) return
    const formData = new FormData()
    formData.set('id', id)
    await deleteAction(formData)
  }

  const isFormOpen = creating || editingId

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#211d17', fontFamily: 'Georgia, serif', borderBottom: '3px double #211d17', paddingBottom: 8 }}>
        お相手
      </div>

      {dreamPartners.map((p) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 2px', borderBottom: '1px solid #d8cdb0' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: '#211d17', border: '1px solid #211d17',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f4eee0', fontWeight: 700, fontSize: 15, fontFamily: 'Georgia, serif',
          }}>
            {p.icon_url ? <img src={p.icon_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#211d17' }}>{p.name}</div>
            <div style={{ fontSize: 10, color: '#b3a98f', marginTop: 2 }}>× {pairedOcMap.get(p.paired_with_oc_id) || '不明'}</div>
          </div>
          <button type="button" onClick={() => startEdit(p)} style={{ fontSize: 11, color: '#6b6250', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>編集</button>
        </div>
      ))}

      {!isFormOpen && canAddMore && (
        <button
          type="button"
          onClick={startCreate}
          style={{
            display: 'block', width: '100%', textAlign: 'center', marginTop: 10,
            border: '1px dashed #6b6250', padding: 14, background: 'none',
            color: '#3d2717', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '.05em',
          }}
        >
          + 夢のお相手を登録する
        </button>
      )}

      {isFormOpen && (
        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5 }}>どのOCのお相手ですか</label>
          <select value={pairedOcId} onChange={(e) => setPairedOcId(e.target.value)} style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: '#fff', border: '1px solid #211d17', color: '#211d17', boxSizing: 'border-box' }}>
            <option value="">選んでください</option>
            {availableOcs.map((oc) => <option key={oc.id} value={oc.id}>{oc.name}</option>)}
          </select>

          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', marginTop: 12, marginBottom: 5 }}>アイコン画像(任意)</label>
          <input type="file" accept="image/*" onChange={onFileChange} style={{ fontSize: 12.5 }} />
          {imageSrc && (
            <div style={{ marginTop: 10 }}>
              <div style={{ position: 'relative', width: '100%', height: 200, background: '#211d17' }}>
                <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
              </div>
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '100%', marginTop: 8 }} />
            </div>
          )}

          <label style={{ fontSize: 11, color: '#6b6250', display: 'block', marginTop: 12, marginBottom: 5 }}>お名前</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例:フレッド・ウィーズリー" style={{ width: '100%', padding: '10px 12px', fontSize: 15, background: '#fff', border: '1px solid #211d17', color: '#211d17', boxSizing: 'border-box' }} />

          {error && <p style={{ fontSize: 11.5, color: '#8a2418', marginTop: 8 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={cancel} disabled={pending} style={{ flex: 1, padding: 10, border: '1px solid #8a8168', background: '#fff', color: '#6b6250', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>キャンセル</button>
            {editingId && (
              <button type="button" onClick={() => handleDelete(editingId)} disabled={pending} style={{ flex: 1, padding: 10, border: '1px solid #8a2418', background: '#fff', color: '#8a2418', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>削除</button>
            )}
            <button type="button" onClick={handleSave} disabled={pending} style={{ flex: 1, padding: 10, border: '1px solid #211d17', background: '#211d17', color: '#f4eee0', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              {pending ? '保存中…' : '保存'}
            </button>
          </div>
        </div>
      )}

      <p style={{ fontSize: 10, color: '#8a8168', marginTop: 10, fontStyle: 'italic' }}>
        お相手はあなただけに表示され、他の人からは見えません。登録できる人数は夢主OCの人数分までです。おしゃべりは「うちの子同士でおしゃべりする」から可能です。
      </p>
    </div>
  )
}
