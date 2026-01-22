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
