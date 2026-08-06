'use client'
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import SubmitButton from '@/components/SubmitButton'
import { createClient } from '@/lib/supabaseClient'
import { getCroppedImg } from '../../ocs/[id]/cropImage'
const fieldLabelStyle = { fontSize: 11, color: '#a39a80', display: 'block', marginBottom: 6, letterSpacing: '.05em' }
const inputStyle = {
  width: '100%', padding: '11px 13px', fontSize: 15,
  background: 'rgba(255,255,255,.06)', border: '1px solid #a39a80', color: '#f4eee0',
  boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
}
const btnStyle = {
  width: '100%', padding: 12, border: '1px solid #f4eee0',
  fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 20,
  background: '#f4eee0', color: '#211d17', letterSpacing: '.05em',
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
function daysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}

export default function OCForm({ action, userId }) {
  const [ocType, setOcType] = useState('creation')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const days = Array.from({ length: daysInMonth(Number(year), Number(month)) }, (_, i) => i + 1)
  const selectStyle = { ...inputStyle, minWidth: 0 }

  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [pendingUpload, setPendingUpload] = useState(false)

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

  async function handleSubmit(formData) {
    if (imageSrc && croppedAreaPixels) {
      setPendingUpload(true)
      try {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
        const tempId = crypto.randomUUID()
        const supabase = createClient()
        const path = `${userId}/${tempId}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('oc-icons')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
        if (!uploadError) {
          const { data } = supabase.storage.from('oc-icons').getPublicUrl(path)
          formData.set('icon_url', `${data.publicUrl}?t=${Date.now()}`)
        }
      } catch (err) {
        console.error('画像処理エラー:', err)
      } finally {
        setPendingUpload(false)
      }
    }
    await action(formData)
  }

  return (
    <form action={handleSubmit} style={{ width: '100%', maxWidth: 360, textAlign: 'left', marginTop: 8 }}>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>アイコン画像(任意)</label>
        <input type="file" accept="image/*" onChange={onFileChange} style={{ fontSize: 12.5, color: '#f3e9d8' }} />
        {imageSrc && (
          <div style={{ marginTop: 10 }}>
            <div style={{ position: 'relative', width: '100%', height: 220, background: '#000' }}>
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
          </div>
        )}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>キャラクター名</label>
        <input name="name" placeholder="例:ミラ・トウドウ" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>タイプ</label>
        <select
          name="oc_type"
          style={inputStyle}
          value={ocType}
          onChange={(e) => setOcType(e.target.value)}
        >
          <option value="creation">創作キャラ</option>
          <option value="dreamer">夢主</option>
        </select>
      </div>
      {ocType === 'dreamer' && (
        <div style={{ marginBottom: 14 }}>
          <label style={fieldLabelStyle}>お相手(必須)</label>
          <input name="paired_character" placeholder="例:フレッド・ウィーズリー" style={inputStyle} />
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>寮・職業</label>
        <input name="house" placeholder="例:ハッフルパフ" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>生年月日</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{ ...selectStyle, flex: 1.3 }} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">年</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select style={{ ...selectStyle, flex: 1 }} value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">月</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select style={{ ...selectStyle, flex: 1 }} value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">日</option>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <input type="hidden" name="birth_date" value={year && month && day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={fieldLabelStyle}>設定・紹介文</label>
        <textarea name="description" placeholder="性格や特徴など自由にどうぞ" style={{ ...inputStyle, minHeight: 80, resize: 'none' }} />
      </div>
      <SubmitButton style={btnStyle} pendingText={pendingUpload ? '画像を処理中…' : '登録中…'}>登録してはじめる</SubmitButton>
    </form>
  )
}
