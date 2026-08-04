export const metadata = {
  title: 'うちよそ',
  description: 'うちの子と、よその子と。すれ違いから始まる、二次創作チャット。',
}
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body { max-width: 100%; overflow-x: hidden; overscroll-behavior-x: none; }
          input, select, textarea { max-width: 100%; width: 100%; }
        `}</style>
      </head>
      <body style={{ margin: 0, fontFamily: "'BIZ UDPGothic', sans-serif", background: '#f3e9d8' }}>
        {children}
      </body>
    </html>
  )
}
