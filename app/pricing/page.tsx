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
