import Seo from '@/components/seo/Seo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Users, Globe, Code, Smartphone, Cloud, Shield, GitBranch } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Generation',
    description: 'Generate production-ready code from natural language descriptions',
    details: ['Multi-AI engine', 'Real-time generation', 'Error detection']
  },
  {
    icon: Code,
    title: 'Multi-Platform Export',
    description: 'Export to React, Vue, React Native, and more',
    details: ['Web & Mobile', 'One-click deployment', 'Clean code output']
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Build together with your team in real-time',
    details: ['Live editing', 'Version control', 'Comments & reviews']
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Create responsive apps that work perfectly on all devices',
    details: ['PWA support', 'App store ready', 'Offline capability']
  },
  {
    icon: Cloud,
    title: 'Cloud Deployment',
    description: 'Deploy with one click to your preferred platform',
    details: ['Vercel/Netlify', 'Custom domains', 'SSL included']
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security for your projects and data',
    details: ['Encryption', 'GDPR compliant', 'Regular audits']
  }
]

export default function FeaturesPage() {
  return (
    <>
      <Seo title="Features" description="Discover all features of AI Meta-Factory" />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Development
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, deploy, and scale your applications with AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-green-600 mb-4" />
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, j) => (
                      <li key={j} className="flex items-center text-sm">
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
