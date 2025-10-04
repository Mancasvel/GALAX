import { NextRequest, NextResponse } from 'next/server'
import { handleRevenueCatWebhook } from '@/lib/database'
import { RevenueCatWebhookEvent } from '@/lib/types'

// RevenueCat webhook verification
const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET

/**
 * Verifica la autenticidad del webhook de RevenueCat
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!REVENUECAT_WEBHOOK_SECRET) {
    console.warn('REVENUECAT_WEBHOOK_SECRET not configured')
    return false
  }

  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', REVENUECAT_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-revenuecat-signature')

    // Verificar signature en producción
    if (process.env.NODE_ENV === 'production' && signature) {
      if (!verifyWebhookSignature(body, signature)) {
        console.error('Invalid RevenueCat webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parsear el evento
    const webhookEvent: RevenueCatWebhookEvent = JSON.parse(body)
    const { event } = webhookEvent

    console.log(`Received RevenueCat webhook: ${event.type} for user ${event.app_user_id}`)

    // Procesar el evento
    await handleRevenueCatWebhook(webhookEvent)

    // Log para debugging
    console.log(`Successfully processed ${event.type} event for user ${event.app_user_id}`, {
      productId: event.product_id,
      purchasedAt: event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : null,
      expirationAt: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
      environment: event.environment
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error processing RevenueCat webhook:', error)
    
    // Log del error completo para debugging
    console.error('Webhook error details:', {
      message: error.message,
      stack: error.stack
    })

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process webhook' 
      },
      { status: 500 }
    )
  }
}

// Endpoint para verificar la configuración del webhook
export async function GET() {
  return NextResponse.json({
    message: 'RevenueCat webhook endpoint is ready',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    webhookSecretConfigured: !!REVENUECAT_WEBHOOK_SECRET
  })
} 