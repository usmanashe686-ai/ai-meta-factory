#!/data/data/com.termux/files/usr/bin/bash

echo "🧪 Testing Stripe Integration"
echo "============================"

echo "1. Checking Stripe installation..."
if npm list stripe 2>/dev/null | grep -q "stripe@"; then
  echo "✅ Stripe installed"
else
  echo "❌ Stripe not installed"
  echo "Run: npm install stripe"
fi

echo ""
echo "2. Checking environment variables..."
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists"
  if grep -q "STRIPE" .env.local; then
    echo "✅ Stripe keys found in .env.local"
  else
    echo "⚠️  Stripe keys not found"
    echo "Add these to .env.local:"
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo "STRIPE_SECRET_KEY=sk_test_..."
    echo "STRIPE_PRICE_PRO=price_..."
    echo "STRIPE_PRICE_TEAM=price_..."
  fi
else
  echo "❌ .env.local not found"
fi

echo ""
echo "3. Checking created files..."
[ -f "lib/pricing/plans.ts" ] && echo "✅ Pricing plans" || echo "❌ Missing pricing plans"
[ -f "app/pricing/page.tsx" ] && echo "✅ Pricing page" || echo "❌ Missing pricing page"
[ -f "app/api/stripe/checkout/route.ts" ] && echo "✅ Stripe API" || echo "❌ Missing Stripe API"

echo ""
echo "4. Testing TypeScript..."
if npx tsc --noEmit 2>&1 | grep -q "error"; then
  echo "⚠️  TypeScript errors found:"
  npx tsc --noEmit 2>&1 | grep "error" | head -5
else
  echo "✅ No TypeScript errors"
fi

echo ""
echo "🚀 To test Stripe:"
echo "1. Get Stripe test keys from: https://dashboard.stripe.com/test/apikeys"
echo "2. Update .env.local with your keys"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3000/pricing"
echo "5. Click 'Upgrade to Pro'"
echo "6. Use test card: 4242 4242 4242 4242"
echo ""
echo "💳 Test card details:"
echo "   Card: 4242 4242 4242 4242"
echo "   Expiry: Any future date"
echo "   CVC: Any 3 digits"
echo "   ZIP: Any 5 digits"
