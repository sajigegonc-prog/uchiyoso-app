'use client'

export default function DeleteLetterButton({ letterId, action }) {
  return (
    <form action={action} style={{ marginTop: 12, width: '100%', maxWidth: 380 }}>
      <input type="hidden" name="letter_id" value={letterId} />
      <button
        type="submit"
        onClick={(e) => { if (!confirm('この便りを削除しますか？')) e.preventDefault() }}
        style={{
          display: 'block', width: '100%', textAlign: 'center',
          background: 'none', color: '#c9a876', fontWeight: 700, fontSize: 12.5,
          border: '1px solid #c9a876', padding: 11, cursor: 'pointer', textDecoration: 'underline',
        }}
      >
        この便りを削除する
      </button>
    </form>
  )
}
