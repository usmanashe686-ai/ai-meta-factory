'use client';

import DashboardLayout from '@/components/layout/DashboardLayout'
import SubscriptionManager from '@/components/billing/SubscriptionManager'
import { CreditCard, Shield, Headphones, Download } from 'lucide-react'

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription, update payment methods, and view billing history
          </p>
        </div>

        <SubscriptionManager />

        {/* Support & Resources */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Headphones className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="font-semibold text-lg">Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Need help with your subscription or billing?
            </p>
            <a 
              href="mailto:support@ai-meta-factory.com" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Support →
            </a>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="font-semibold text-lg">Security</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Your payment information is securely processed by Stripe.
            </p>
            <a 
              href="/security" 
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Learn More →
            </a>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Download className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="font-semibold text-lg">Documents</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Download invoices, receipts, and subscription documents.
            </p>
            <a 
              href="/documents" 
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              View Documents →
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Billing FAQs</h3>
          <div className="space-y-4">
            {[
              {
                q: 'When will I be charged?',
                a: 'You are charged at the beginning of each billing period. For monthly plans, this is every 30 days. For annual plans, this is every 365 days.'
              },
              {
                q: 'Can I change my payment method?',
                a: 'Yes, you can update your payment method at any time through the billing portal.'
              },
              {
                q: 'What happens if my payment fails?',
                a: 'We will automatically retry the payment. If it continues to fail, you will be downgraded to the free plan after 7 days.'
              },
              {
                q: 'Can I get a refund?',
                a: 'We offer a 30-day money-back guarantee for annual plans. Monthly plans can be cancelled anytime without further charges.'
              }
            ].map((faq, i) => (
              <div key={i} className="border-b pb-4 last:border-0">
                <h4 className="font-medium text-gray-900 mb-1">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
