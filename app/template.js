'use client'

export default function Template({ children }) {
  return (
    <div
      key={typeof window !== 'undefined' ? window.location.pathname : undefined}
      style={{
        animation: 'pageFadeIn .25s ease',
      }}
    >
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  )
}
