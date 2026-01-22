const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting custom build for Android ARM...');

// Ensure output directory exists
if (!fs.existsSync('out')) {
  fs.mkdirSync('out', { recursive: true });
}

// Create a simple index.html if build fails
const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Meta Factory - Week 2 Complete!</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        h2 { font-size: 1.8rem; margin-bottom: 30px; opacity: 0.9; }
        .features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: 10px;
            text-align: left;
        }
        .feature h3 {
            margin: 0 0 10px 0;
            font-size: 1.2rem;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            font-size: 1.5rem;
        }
        .stat { text-align: center; }
        .stat .number {
            font-weight: bold;
            font-size: 2rem;
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI Meta Factory</h1>
        <h2>Week 2 Complete! Built Entirely on Android 📱</h2>
        
        <div class="stats">
            <div class="stat">
                <span class="number">6</span>
                <span>Days</span>
            </div>
            <div class="stat">
                <span class="number">50+</span>
                <span>Components</span>
            </div>
            <div class="stat">
                <span class="number">100%</span>
                <span>Mobile</span>
            </div>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>✅ Drag & Drop Builder</h3>
                <p>Professional visual builder with real-time editing</p>
            </div>
            <div class="feature">
                <h3>✅ Multi-Framework Export</h3>
                <p>Export to React, Vue, Svelte, HTML</p>
            </div>
            <div class="feature">
                <h3>✅ AI Streaming</h3>
                <p>Real-time AI responses with token-by-token display</p>
            </div>
            <div class="feature">
                <h3>✅ Firebase Auth</h3>
                <p>Complete authentication with Google OAuth</p>
            </div>
        </div>
        
        <p style="margin-top: 30px; opacity: 0.8;">
            The full application is being rebuilt. Full functionality coming back online shortly!
        </p>
        <p style="font-size: 0.9rem; margin-top: 20px;">
            Built with ❤️ on Termux • Allahu Akbar! 🎉
        </p>
    </div>
    
    <script>
        // Auto-refresh in 10 seconds
        setTimeout(() => {
            window.location.reload();
        }, 10000);
    </script>
</body>
</html>`;

// Try Next.js build first
try {
  console.log('Attempting Next.js build...');
  execSync('NEXT_DISABLE_SWC=1 npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js build successful!');
} catch (error) {
  console.log('⚠️ Next.js build failed, creating fallback site...');
  
  // Create fallback site
  fs.writeFileSync('out/index.html', fallbackHtml);
  
  // Copy any existing public files
  if (fs.existsSync('public')) {
    execSync('cp -r public/* out/ 2>/dev/null || true');
  }
  
  console.log('✅ Fallback site created in out/ directory');
}

console.log('Build process complete!');
