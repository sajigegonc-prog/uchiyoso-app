'use client'
import { useState } from 'react'

export default function PrivacyPolicyModal() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'block', margin: '14px auto 0', background: 'none', border: 'none',
          color: '#a39a80', fontSize: 10.5, textDecoration: 'underline', cursor: 'pointer',
        }}
      >
        プライバシーポリシー
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#211d17', border: '1px solid #f4eee0', padding: 22, maxWidth: 380, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f4eee0', fontFamily: 'Georgia, serif', borderBottom: '1px solid #f4eee0', paddingBottom: 10, marginBottom: 14 }}>
              プライバシーポリシー
            </div>
            <div style={{ fontSize: 11.5, color: '#d8cdb0', lineHeight: 1.9 }}>
              <p><b>ログインについて</b><br />
              ログインにはGoogleアカウントを利用します。パスワードは当アプリでは保存・管理していません。</p>

              <p><b>取得する情報</b><br />
              Googleログインを通じて、メールアドレス・Googleアカウント名・プロフィール画像URLが取得されますが、アプリ内の表示にはユーザーご自身が設定した表示名・アイコンのみを使用し、Googleの本名やプロフィール画像は表示・利用しません。</p>

              <p><b>登録いただく情報</b><br />
              表示名、OCの設定内容(名前・寮・生年月日・紹介文等)、チャット・ふくろう便の内容など、アプリ内でご自身が入力された情報を保存します。</p>

              <p><b>情報の取り扱い</b><br />
              取得した情報は、アプリの機能提供のためにのみ利用し、第三者への提供・販売は行いません。メールマガジンや宣伝目的でのご連絡も行いません。</p>

              <p><b>セキュリティ</b><br />
              通信は暗号化(HTTPS)されています。データベース側でもアクセス制御を設定し、ご自身や友達関係にあるデータのみ閲覧できるようにしています。</p>

              <p><b>データの削除について</b><br />
              退会・データ削除をご希望の場合は、運営者までご連絡ください。</p>

              <p style={{ color: '#a39a80', fontSize: 10.5 }}>
                本アプリは個人が運営する非営利のファンメイドアプリです。予告なく内容を変更する場合があります。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ display: 'block', width: '100%', marginTop: 16, padding: 10, border: '1px solid #f4eee0', background: 'none', color: '#f4eee0', fontSize: 12.5, cursor: 'pointer' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}
