'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import { createClient } from '@/lib/supabaseClient'
import { getCroppedImg } from '../[id]/cropImage'
import { updateOcIcon } from '../[id]/actions'

const currentYear = new Date().getFullYear()
const HOUSES = ['グリフィンドール', 'ハッフルパフ', 'レイブンクロー', 'スリザリン']
const years = Array.from({ length: 300 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
function daysInMonth(year, month) {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}

const labelStyle = { fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5, letterSpacing: '.05em' }
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15,
  background: '#fff', border: '1px solid #211d17', color: '#211d17',
  boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
}
const btnStyle = {
  width: '100%', padding: 12, border: '1px solid #211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 18,
  background: '#211d17', color: '#f4eee0', letterSpacing: '.05em',
}
const btnGhostStyle = {
  ...btnStyle, background: '#fff', color: '#6b6250', border: '1px solid #8a8168',
}

export default function NewOCFormWithIcon({ action, userId }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [ocType, setOcType] = useState('creation')
  const [house, setHouse] = useState('')
  const [customHouse, setCustomHouse] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const days = Array.from({ length: daysInMonth(Number(year), Number(month)) }, (_, i) => i + 1)
  const selectStyle = { ...inputStyle, minWidth: 0 }

  const [fields, setFields] = useState(null)

  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function handleNext(e) {
    const form = e.target.closest('form')
    const formData = new FormData(form)
    setFields(formData)
    setStep(2)
  }

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

  async function handleFinish() {
    setSubmitting(true)
    setError(null)
    try {
      const result = await action(fields)
      if (result?.error) {
        setError(result.error)
        return
      }
      const ocId = result.id
      if (imageSrc && croppedAreaPixels) {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
        const supabase = createClient()
        const path = `${userId}/${ocId}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('oc-icons')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
        if (!uploadError) {
          const { data } = supabase.storage.from('oc-icons').getPublicUrl(path)
          await updateOcIcon(ocId, `${data.publicUrl}?t=${Date.now()}`)
        }
      }
      router.push('/ocs')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
      <div style={{ fontSize: 11, color: '#6b6250', marginBottom: 12, letterSpacing: '.1em' }}>
        {step} / 2
      </div>

      {step === 1 && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>キャラクター名</label>
            <input name="name" placeholder="例:ミラ・トウドウ" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>タイプ</label>
            <select name="oc_type" style={inputStyle} value={ocType} onChange={(e) => setOcType(e.target.value)}>
              <option value="creation">創作キャラ</option>
              <option value="dreamer">夢主</option>
            </select>
          </div>
          {ocType === 'dreamer' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>お相手(必須)</label>
              <input name="paired_character" placeholder="例:フレッド・ウィーズリー" style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>寮・職業</label>
            <select value={house} onChange={(e) => setHouse(e.target.value)} style={inputStyle}>
              <option value="">選んでください</option>
              {HOUSES.map((h) => <option key={h} value={h}>{h}</option>)}
              <option value="その他">その他(自由記入)</option>
            </select>
            {house === 'その他' && (
              <input
                value={customHouse}
                onChange={(e) => setCustomHouse(e.target.value)}
                placeholder="例:魔法史担当教授"
                style={{ ...inputStyle, marginTop: 8 }}
              />
            )}
            <input type="hidden" name="house" value={house === 'その他' ? customHouse : house} />
          </div>
                      <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>卒業後の進路(任意)</label>
            <input name="career" placeholder="例:魔法薬学の研究者" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>生年月日</label>
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
            <label style={labelStyle}>設定・紹介文</label>
            <textarea name="description" placeholder="性格や特徴など自由にどうぞ" style={{ ...inputStyle, minHeight: 80, resize: 'none' }} />
          </div>
          <button type="button" style={btnStyle} onClick={handleNext}>次へ(画像設定)</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <label style={labelStyle}>アイコン画像(任意)</label>
          <input type="file" accept="image/*" onChange={onFileChange} style={{ fontSize: 12.5 }} />
          {imageSrc && (
            <div style={{ marginTop: 12 }}>
              <div style={{ position: 'relative', width: '100%', height: 240, background: '#211d17' }}>
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
          {error && <p style={{ fontSize: 12.5, color: '#8a2418', marginTop: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button type="button" style={btnGhostStyle} onClick={() => setStep(1)} disabled={submitting}>戻る</button>
            <button type="button" style={btnStyle} onClick={handleFinish} disabled={submitting}>
              {submitting ? '登録中…' : '登録してはじめる'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
