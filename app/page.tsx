export default function Home() {
  return (
    <div style={{minHeight: '100vh', padding: 40, fontFamily: 'system-ui', textAlign: 'center'}}>
      <h1 style={{fontSize: '3rem', color: '#10B981'}}>
        🚀 AI META FACTORY - WEEK 6 COMPLETE
      </h1>
      <p style={{fontSize: '1.5rem', color: '#6B7280'}}>
        All 6 weeks of features are now LIVE!
      </p>

      <div style={{maxWidth: 600, margin: '40px auto', padding: 30, background: '#F9FAFB', borderRadius: 12}}>
        <h3 style={{color: '#111827'}}>✅ ALL FEATURES WORKING:</h3>
        <ul style={{textAlign: 'left', listStyle: 'none', padding: 0}}>
          <li>🎯 AI-Powered Code Generation</li>
          <li>🎨 Visual Drag & Drop Builder</li>
          <li>📱 Mobile Export (React Native + APK)</li>
          <li>👥 Real-time Collaboration</li>
          <li>🛒 Template Marketplace</li>
          <li>💰 Stripe Payments</li>
          <li>📊 Analytics Dashboard</li>
          <li>🔐 Security & Compliance</li>
        </ul>

        <div style={{marginTop: 30}}>
          <a href="/builder" style={{padding: '12px 24px', background: '#10B981', color: 'white', borderRadius: 8, textDecoration: 'none', marginRight: 10}}>
            Launch Builder
          </a>
          <a href="/dashboard" style={{padding: '12px 24px', border: '2px solid #10B981', color: '#10B981', borderRadius: 8, textDecoration: 'none'}}>
            Dashboard
          </a>
        </div>
      </div>

      <p style={{marginTop: 40, color: '#9CA3AF'}}>
        Built entirely on Android Termux • Deployed via GitHub Actions • Version 6.0
      </p>
    </div>
  )
}
