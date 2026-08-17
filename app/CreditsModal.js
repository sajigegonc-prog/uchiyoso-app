'use client'
import { useState } from 'react'

export default function CreditsModal({ dark = true }) {
  const [open, setOpen] = useState(false)
  const linkColor = dark ? '#a39a80' : '#8a8168'
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'block', margin: '10px auto 0', background: 'none', border: 'none',
          color: linkColor, fontSize: 10.5, textDecoration: 'underline', cursor: 'pointer',
        }}
      >
        クレジット
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#211d17', border: '1px solid #f4eee0', padding: 22, maxWidth: 340, width: '100%' }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f4eee0', fontFamily: 'Georgia, serif', borderBottom: '1px solid #f4eee0', paddingBottom: 10, marginBottom: 14 }}>
              クレジット
            </div>
            <div style={{ fontSize: 12, color: '#d8cdb0', lineHeight: 2 }}>
              <p style={{ margin: 0 }}>制作: 藤堂</p>
              <p style={{ margin: '10px 0 0' }}>
                X:<br />
                <a href="https://x.com/Milla_tohdoh" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b98a' }}>
                  @Milla_tohdoh
                </a>
              </p>
              <p style={{ margin: '10px 0 0' }}>
                個人サイト:<br />
                <a href="https://w-chronicle.raindrop.jp/index.html" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b98a' }}>
                  https://w-chronicle.raindrop.jp/index.html
                </a>
              </p>
              <p style={{ margin: '10px 0 0' }}>
                リクエスト・ご感想はこちらへ:<br />
                <a href="https://mond.how/milla_tohdoh" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b98a' }}>
                  https://mond.how/milla_tohdoh
                </a>
              </p>
              <p style={{ margin: '10px 0 0' }}>
                イラスト:<br />
                <a href="https://x.com/arqxzw?s=11&t=oXNKWi99mdDDD5RaD7Jm_g" target="_blank" rel="noopener noreferrer" style={{ color: '#c9b98a' }}>
                  あられ 様
                </a>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ display: 'block', width: '100%', marginTop: 18, padding: 10, border: '1px solid #f4eee0', background: 'none', color: '#f4eee0', fontSize: 12.5, cursor: 'pointer' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}
