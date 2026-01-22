import Seo from '@/components/seo/Seo'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Zap, Users, Globe, Rocket, Code, Shield, Download } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Seo />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 mb-6">
            <Rocket className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">No-Code AI App Builder</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Build Apps
            <span className="block text-green-600 mt-2">10x Faster with AI</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Transform your ideas into production-ready web and mobile applications using AI. 
            No coding required. Export to React, Vue, or mobile apps instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/builder">
              <Button size="lg" className="text-lg px-8 py-6 h-auto rounded-xl">
                <Code className="mr-2 h-5 w-5" />
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto rounded-xl">
                <Download className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
            {[
              { icon: Zap, value: '10,000+', label: 'Apps Built' },
              { icon: Users, value: '5,000+', label: 'Developers' },
              { icon: Globe, value: '50+', label: 'Countries' },
              { icon: Shield, value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white shadow-sm">
                <stat.icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI Meta-Factory?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, deploy, and scale your applications
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Generation',
                description: 'Our multi-AI pipeline creates production-ready code from simple descriptions.',
                features: ['OpenAI + DeepSeek + Gemini', 'Real-time code generation', 'Smart error detection']
              },
              {
                icon: '🚀',
                title: 'Export Anywhere',
                description: 'Generate code for any platform and deploy with one click.',
                features: ['React, Vue, Svelte', 'React Native for mobile', 'Static sites & PWAs']
              },
              {
                icon: '👥',
                title: 'Team Collaboration',
                description: 'Build together with your team in real-time.',
                features: ['Live collaboration', 'Version history', 'Shared libraries']
              },
              {
                icon: '🎨',
                title: 'Beautiful Templates',
                description: 'Start with professionally designed templates.',
                features: ['100+ UI templates', 'Customizable components', 'Design system included']
              },
              {
                icon: '🔌',
                title: 'API & Integrations',
                description: 'Connect with your favorite tools and services.',
                features: ['REST API access', 'Zapier integration', 'Webhook support']
              },
              {
                icon: '📱',
                title: 'Mobile First',
                description: 'Build responsive apps that work perfectly on all devices.',
                features: ['Mobile-optimized', 'PWA ready', 'App store deployment']
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, j) => (
                    <li key={j} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works in 3 Simple Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '1',
                title: 'Describe Your App',
                description: 'Tell our AI what you want to build in plain English.',
                details: ['"Create a login form"', '"Build a todo app"', '"Make an e-commerce dashboard"']
              },
              {
                step: '2',
                title: 'AI Generates Code',
                description: 'Our AI creates clean, production-ready code instantly.',
                details: ['React/Next.js components', 'Mobile-responsive CSS', 'Complete functionality']
              },
              {
                step: '3',
                title: 'Export & Deploy',
                description: 'Download your code or deploy with one click.',
                details: ['Export to GitHub', 'Deploy to Vercel/Netlify', 'Generate APK for mobile']
              }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-6">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, j) => (
                    <li key={j} className="text-gray-700 text-sm">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Start Building for Free
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Get 5 AI generations daily for free. No credit card required.
            Upgrade when you need more power.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { plan: 'Free', price: '$0', features: ['5 AI generations/day', '3 projects', 'Basic templates'] },
              { plan: 'Pro', price: '$29', features: ['Unlimited generations', '50 projects', 'All templates'] },
              { plan: 'Team', price: '$99', features: ['Team collaboration', '500 projects', 'Custom branding'] }
            ].map((tier, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 ${i === 1 ? 'shadow-lg border-2 border-green-500' : 'shadow-sm'}`}>
                <h3 className="text-2xl font-bold mb-2">{tier.plan}</h3>
                <div className="text-4xl font-bold mb-6">{tier.price}<span className="text-lg text-gray-500">/month</span></div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button 
                    variant={i === 1 ? "default" : "outline"} 
                    className="w-full"
                  >
                    {i === 0 ? 'Get Started' : 'Choose Plan'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Developers Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Built my startup's MVP in 2 days instead of 2 weeks. The AI-generated code was production-ready!",
                author: "Ahmed R.",
                role: "Founder, TechStart"
              },
              {
                quote: "As a solo developer, this platform has 10x my productivity. The component generation is magical.",
                author: "Sarah M.",
                role: "Full-Stack Developer"
              },
              {
                quote: "Our agency uses this for client prototypes. Cuts development time by 70% while maintaining quality.",
                author: "David L.",
                role: "Agency Director"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8">
                <div className="text-4xl text-gray-300 mb-6">"</div>
                <p className="text-gray-700 text-lg mb-6 italic">{testimonial.quote}</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Build Your Next App?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of developers building faster with AI.
            Start for free, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-10 py-6 rounded-xl">
                Get Started Free
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-10 py-6 rounded-xl">
                Watch Demo
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-green-100">
            <Check className="h-5 w-5 inline mr-2" />
            Free plan includes 5 AI generations daily • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AI Meta-Factory</h3>
              <p className="text-gray-400">
                Build web and mobile apps 10x faster with AI-powered code generation.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-white">Templates</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/community" className="hover:text-white">Community</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 AI Meta-Software Factory. Built with ❤️ by developers, for developers.</p>
            <p className="mt-2 text-sm">Allahumma barik - May Allah bless this project and its users.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
