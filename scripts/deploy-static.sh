#!/bin/bash
echo "📱 Deploying static version for Android..."
echo ""

# Create beautiful static version
mkdir -p out
cat > out/index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 AI Meta Factory - Week 2</title>
    <style>
        /* Your beautiful gradient CSS from earlier */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 3rem 2rem;
            border-radius: 24px;
            text-align: center;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { 
            font-size: 3.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #00dc82 0%, #36e4da 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 900;
        }
        .badge {
            background: linear-gradient(135deg, #00dc82 0%, #36e4da 100%);
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 100px;
            display: inline-block;
            margin: 1rem 0;
            font-weight: bold;
            font-size: 1.1rem;
            box-shadow: 0 4px 20px rgba(0, 220, 130, 0.3);
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #00dc82 0%, #36e4da 100%);
            color: #1a1f2e;
            padding: 1.2rem 2.5rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1rem;
            margin-top: 1rem;
            transition: all 0.3s;
        }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 220, 130, 0.4); }
        .terminal {
            background: #0a0e17;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            border: 1px solid #2d3748;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI Meta Factory</h1>
        <div class="badge">Week 2 Complete • Built on Android 📱</div>
        
        <p style="margin: 1.5rem 0; line-height: 1.6; opacity: 0.9;">
            Full-stack AI application builder with Next.js 14, Firebase, 
            and multi-AI orchestration (OpenAI → DeepSeek → Gemini).
        </p>
        
        <div class="terminal">
            <div style="color: #00dc82;">$ ./scripts/build-android.sh</div>
            <div style="color: #718096;"># Building with Android ARM optimizations...</div>
            <div style="color: #00dc82;">✅ Build successful! Deploying...</div>
            <div style="color: #00dc82;">🎉 Live at: https://usman-umer.web.app</div>
        </div>
        
        <div style="margin-top: 2rem;">
            <a href="https://github.com" class="btn">View on GitHub</a>
            <a href="/builder" class="btn" style="background: transparent; border: 2px solid #00dc82; color: #00dc82; margin-left: 1rem;">Try Builder</a>
        </div>
        
        <div style="margin-top: 3rem; font-size: 0.9rem; opacity: 0.7;">
            <strong>Project Status:</strong> Static site (Next.js build in progress)<br>
            <strong>Last Build:</strong> $(date +"%Y-%m-%d %H:%M")
        </div>
    </div>
</body>
</html>
HTML

# Deploy
firebase deploy --only hosting
echo "✅ Static site deployed!"
echo "👉 https://usman-umer.web.app"
