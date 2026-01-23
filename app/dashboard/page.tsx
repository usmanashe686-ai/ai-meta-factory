export default function Dashboard() {
  return (
    <div style={{padding: 40, fontFamily: 'system-ui'}}>
      <h1>📊 Dashboard - Week 6</h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 30}}>
        <div style={{background: '#F3F4F6', padding: 20, borderRadius: 8}}>
          <h3>Projects</h3>
          <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>12</p>
        </div>
        <div style={{background: '#F3F4F6', padding: 20, borderRadius: 8}}>
          <h3>AI Generations</h3>
          <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>156</p>
        </div>
        <div style={{background: '#F3F4F6', padding: 20, borderRadius: 8}}>
          <h3>Exports</h3>
          <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>8</p>
        </div>
        <div style={{background: '#F3F4F6', padding: 20, borderRadius: 8}}>
          <h3>Revenue</h3>
          <p style={{fontSize: '2rem', fontWeight: 'bold', margin: 0}}>$1,234</p>
        </div>
      </div>
    </div>
  )
}
