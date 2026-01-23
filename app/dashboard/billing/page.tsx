'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import SubscriptionManager from '@/components/billing/SubscriptionManager';
import { CreditCard, Shield, Headphones, Download } from 'lucide-react';

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription, update payment info, and billing preferences.
          </p>
        </div>

        {/* Subscription Manager */}
        <SubscriptionManager />

        {/* Support & Resources */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Support */}
          <div className="border rounded-lg p-6 h-full">
            <div className="flex items-center mb-4">
              <Headphones className="h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-lg ml-2">Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Need help with your subscription or billing?
            </p>
            <a
              href="mailto:support@ai-meta-factory.com"
              className="text-blue-600 hover:text-blue-800"
            >
              Contact Support →
            </a>
          </div>

          {/* Security */}
          <div className="border rounded-lg p-6 h-full">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-green-600" />
              <h3 className="font-semibold text-lg ml-2">Security</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Learn how we keep your account safe and secure.
            </p>
            <a
              href="/security"
              className="text-blue-600 hover:text-blue-800"
            >
              View Security Info →
            </a>
          </div>

          {/* Resources */}
          <div className="border rounded-lg p-6 h-full">
            <div className="flex items-center mb-4">
              <Download className="h-8 w-8 text-purple-600" />
              <h3 className="font-semibold text-lg ml-2">Resources</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Download guides, invoices, and helpful documents.
            </p>
            <a
              href="/resources"
              className="text-blue-600 hover:text-blue-800"
            >
              Explore Resources →
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
