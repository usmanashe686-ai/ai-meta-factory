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
