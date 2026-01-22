#!/data/data/com.termux/files/usr/bin/bash

echo "💰 ADDING STRIPE TO EXISTING PROJECT"
echo "==================================="

# 1. Install only Stripe packages
echo "Installing Stripe packages..."
npm install @stripe/stripe-js @stripe/react-stripe-js stripe

# 2. Create directories without overwriting
echo "Creating directories..."
mkdir -p app/pricing
mkdir -p app/api/stripe/checkout
mkdir -p app/api/stripe/webhook
mkdir -p lib/pricing

# 3. Add pricing plans (won't affect existing files)
echo "Creating pricing plans file..."
cat > lib/pricing/plans.ts << 'EOF'
export type PlanId = 'free' | 'pro' | 'team'

export interface Plan {
  id: PlanId
  name: string
  description: string
  price: number
  features: string[]
  popular?: boolean
  stripePriceId?: string
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'For beginners and testing',
    price: 0,
    features: [
      '5 AI generations per day',
      '3 saved projects',
      'Basic components',
      'Community support',
      'Export to HTML'
    ]
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professional developers',
    price: 29,
    features: [
      'Unlimited AI generations',
      '50 saved projects',
      'Advanced components',
      'Priority support',
      'Export to React/Vue/Next.js',
      'No watermarks',
      'Private projects',
      'Code download'
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly'
  },
  
  team: {
    id: 'team',
    name: 'Team',
    description: 'For development teams',
    price: 99,
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Team collaboration',
      'Shared component libraries',
      'Advanced analytics',
      'API access'
    ],
    stripePriceId: process.env.STRIPE_PRICE_TEAM || 'price_team_monthly'
  }
}

export function getPlanById(id: PlanId): Plan {
  return PLANS[id] || PLANS.free
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `$${price}/month`
}
EOF

# 4. Create pricing page
echo "Creating pricing page..."
cat > app/pricing/page.tsx << 'EOF'
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Shield, Users } from 'lucide-react'
import { PLANS, formatPrice } from '@/lib/pricing/plans'
import { useState } from 'react'

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setIsLoading(planId)
    
    try {
      if (planId === 'free') {
        window.location.href = '/dashboard'
        return
      }
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        alert('Error: ' + data.error)
      } else {
        alert('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Network error. Please check your connection.')
    } finally {
      setIsLoading(null)
    }
  }

  const getIcon = (planId: string) => {
    switch(planId) {
      case 'pro': return <Crown className="h-6 w-6 text-yellow-500" />
      case 'team': return <Users className="h-6 w-6 text-blue-500" />
      default: return <Shield className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Building with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. All plans include our core AI builder.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(PLANS).map((plan) => (
            <Card 
              key={plan.id}
              className={`relative flex flex-col h-full transition-transform hover:scale-[1.02] ${
                plan.popular ? 'border-2 border-green-500 shadow-xl' : 'border shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <CardHeader className="pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getIcon(plan.id)}
                    <CardTitle className="text-2xl font-bold ml-3">
                      {plan.name}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-lg h-12">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-gray-500 text-sm mt-1">per month, billed monthly</p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                <Button
                  className={`w-full py-6 text-base font-semibold ${
                    plan.popular ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                >
                  {isLoading === plan.id ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : plan.id === 'free' ? (
                    'Get Started Free'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription anytime. Your access continues until the end of your billing period.'
              },
              {
                question: 'Do you offer refunds?',
                answer: 'We offer a 14-day money-back guarantee for all annual plans. Monthly plans can be cancelled anytime.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards (Visa, MasterCard, American Express) via Stripe.'
              },
              {
                question: 'Can I upgrade or downgrade?',
                answer: 'Yes, you can change your plan anytime. The change takes effect immediately.'
              },
              {
                question: 'Is my data safe?',
                answer: 'Yes, we use enterprise-grade security. Your data is encrypted and never shared with third parties.'
              },
              {
                question: 'Do you offer discounts for students?',
                answer: 'Yes! Students get 50% off. Contact support with your student ID for a discount code.'
              }
            ].map((faq, index) => (
              <div key={index} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-xl mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a custom plan?
            </h3>
            <p className="text-gray-600 mb-6">
              We offer custom pricing for enterprise clients, educational institutions, and non-profits.
            </p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <a href="mailto:contact@ai-meta-factory.com?subject=Custom Plan Inquiry">
                Contact Sales
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# 5. Create Stripe checkout API (simplified)
echo "Creating Stripe checkout API..."
cat > app/api/stripe/checkout/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()
    
    // Initialize Stripe with your secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16'
    })
    
    // Map plan IDs to Stripe Price IDs
    const priceMap: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || '',
      team: process.env.STRIPE_PRICE_TEAM || ''
    }
    
    const priceId = priceMap[planId]
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${request.headers.get('origin')}/pricing?payment=cancelled`,
      metadata: {
        planId
      },
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    
    // Return user-friendly error
    let errorMessage = 'Payment processing failed'
    if (error.type === 'StripeConnectionError') {
      errorMessage = 'Cannot connect to payment server'
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid payment request'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
EOF

# 6. Create webhook handler (simplified)
echo "Creating webhook handler..."
cat > app/api/stripe/webhook/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature') || ''

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16'
    })

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Payment succeeded:', session.id)
        // Here you would update your database
        break
        
      case 'customer.subscription.updated':
        const subscription = event.data.object
        console.log('Subscription updated:', subscription.id)
        break
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        console.log('Subscription cancelled:', deletedSubscription.id)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
EOF

# 7. Add to existing .env.local WITHOUT overwriting
echo "Adding Stripe keys to your .env.local..."
if [ -f ".env.local" ]; then
  echo "" >> .env.local
  echo "# Stripe Payment Configuration" >> .env.local
  echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here" >> .env.local
  echo "STRIPE_SECRET_KEY=sk_test_your_key_here" >> .env.local
  echo "STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret" >> .env.local
  echo "STRIPE_PRICE_PRO=price_your_pro_price_id" >> .env.local
  echo "STRIPE_PRICE_TEAM=price_your_team_price_id" >> .env.local
  echo "# End Stripe Configuration" >> .env.local
  echo "✅ Added Stripe config to existing .env.local"
else
  echo "⚠️  .env.local not found, creating new..."
  cat > .env.local << 'EOF'
# Stripe Payment Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_PRO=price_your_pro_price_id
STRIPE_PRICE_TEAM=price_your_team_price_id
# End Stripe Configuration
EOF
fi

# 8. Create test script
echo "Creating test script..."
cat > test-stripe.sh << 'EOF'
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
EOF

chmod +x test-stripe.sh

# 9. Create update script for existing .env.local
echo "Creating .env update helper..."
cat > update-env-stripe.sh << 'EOF'
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
EOF

chmod +x update-env-stripe.sh

echo ""
echo "🎉 STRIPE INTEGRATION ADDED! 🎉"
echo "=============================="
echo ""
echo "✅ What was added:"
echo "   - Stripe packages installed"
echo "   - Pricing plans at /pricing"
echo "   - Stripe checkout API"
echo "   - Webhook handler"
echo "   - Stripe config added to .env.local"
echo "   - Test script created"
echo ""
echo "📝 YOUR NEXT STEPS:"
echo "1. Get Stripe test keys: https://dashboard.stripe.com/test/apikeys"
echo "2. Run: ./update-env-stripe.sh (to see what to add to .env.local)"
echo "3. Add your Stripe keys to .env.local"
echo "4. Run: ./test-stripe.sh"
echo "5. Start dev server: npm run dev"
echo "6. Visit: http://localhost:3000/pricing"
echo ""
echo "💡 IMPORTANT:"
echo "   - Your existing Firebase, Google, AI API keys remain UNTOUCHED"
echo "   - Stripe keys are ADDED to bottom of .env.local"
echo "   - Test with card: 4242 4242 4242 4242"
echo ""
echo "💰 Ready to accept payments! 💰"
