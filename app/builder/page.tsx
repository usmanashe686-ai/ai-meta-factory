export default function Builder() {
  return (
    <div style={{padding: 40, fontFamily: 'system-ui'}}>
      <h1>🎨 AI Builder - Week 6</h1>
      <p>Drag & drop interface with AI code generation</p>
      <div style={{border: '2px dashed #D1D5DB', padding: 60, marginTop: 30, borderRadius: 12, textAlign: 'center'}}>
        <p>Builder canvas loading...</p>
        <button style={{padding: '12px 24px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, marginTop: 20, fontSize: 16}}>
          Add Component
        </button>
      </div>
    </div>
  )
}
