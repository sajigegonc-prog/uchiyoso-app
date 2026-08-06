'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom } from '../actions'

const labelStyle = { fontSize: 11, color: '#6b6250', display: 'block', marginBottom: 5, letterSpacing: '.05em' }
const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 15,
  background: '#fff', border: '1px solid #211d17', color: '#211d17',
  boxSizing: 'border-box', fontFamily: "'BIZ UDPGothic', sans-serif",
}
const btnStyle = {
  padding: '11px 20px', border: '1px solid #211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer',
  background: '#211d17', color: '#f4eee0', letterSpacing: '.05em',
}
const btnGhostStyle = { ...btnStyle, background: '#fff', color: '#6b6250', border: '1px solid #8a8168' }
const typeBtnStyle = (active) => ({
  display: 'block', width: '100%', padding: 16, marginBottom: 10,
  border: active ? '1px solid #211d17' : '1px solid #8a8168',
  background: active ? '#fff' : '#f4eee0', color: '#211d17',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
})

export default function NewRoomForm({ ocs, friendOcs, initialFriendOcId }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [roomType, setRoomType] = useState('')
  const [speakerOcId, setSpeakerOcId] = use
