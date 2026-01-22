import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      fontFamily: 'system-ui',
      background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '3.5rem',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #00dc82 0%, #36e4da 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🚀 AI Meta Factory
      </h1>
      
      <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
        Week 2 Complete • Built entirely on Android 📱
      </p>
      
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '500px',
        margin: '0 auto',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{ color: '#00dc82', marginBottom: '1rem' }}>
          🎉 Build Successful!
        </h3>
        <p>Next.js static export working perfectly on Android ARM</p>
        
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/builder" style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #00dc82, #36e4da)',
            color: '#1a1f2e',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            🎨 Try Builder
          </Link>
          
          <Link href="/dashboard" style={{
            padding: '1rem 2rem',
            background: 'transparent',
            border: '2px solid #00dc82',
            color: '#00dc82',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            📊 Dashboard
          </Link>
        </div>
      </div>
      
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#0a0e17',
        borderRadius: '12px',
        maxWidth: '600px',
        margin: '2rem auto',
        textAlign: 'left',
        fontFamily: 'monospace',
        fontSize: '0.9rem'
      }}>
        <div style={{ color: '#00dc82' }}>$ npm run build</div>
        <div style={{ color: '#718096' }}># Building on Android ARM...</div>
        <div style={{ color: '#00dc82' }}>✅ Generated 3 static pages</div>
        <div style={{ color: '#00dc82' }}>✅ Bundle size optimized</div>
        <div style={{ color: '#00dc82' }}>🎉 Deployed to Firebase Hosting</div>
      </div>
    </div>
  );
}
