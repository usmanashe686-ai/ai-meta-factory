#!/data/data/com.termux/files/usr/bin/bash

echo "🔧 Updating .env.local with Stripe keys"
echo "======================================"

if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found"
  exit 1
fi

echo "Current .env.local contents:"
echo "---------------------------"
head -20 .env.local
echo "---------------------------"

echo ""
echo "Please add these lines to your .env.local:"
echo ""
echo "# Stripe Payment Configuration"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here"
echo "STRIPE_SECRET_KEY=sk_test_your_key_here"
echo "STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret"
echo "STRIPE_PRICE_PRO=price_your_pro_price_id"
echo "STRIPE_PRICE_TEAM=price_your_team_price_id"
echo ""
echo "To edit: nano .env.local"
echo "Then restart server: npm run dev"
