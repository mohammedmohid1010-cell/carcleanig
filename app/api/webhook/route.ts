import { NextRequest, NextResponse } from 'next/server'
import { extractMessageData, sendWhatsAppMessage } from '@/lib/whatsapp'
import { generateReply } from '@/lib/ai'
import { getConversationHistory, saveMessage } from '@/lib/supabase'

// Meta calls this to verify your webhook URL
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Meta sends incoming messages here
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Always respond 200 immediately — Meta will retry if you don't
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ok' })
    }

    console.log('WEBHOOK BODY:', JSON.stringify(body, null, 2))

    const incoming = extractMessageData(body)
    if (!incoming) {
      console.log('extractMessageData returned null — unsupported message format')
      return NextResponse.json({ status: 'ok' })
    }

    const { from, text, customerName } = incoming
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!

    // Get conversation history for context
    const history = await getConversationHistory(from)

    // Save the customer's message
    await saveMessage({
      phone_number: from,
      customer_name: customerName,
      role: 'user',
      content: text,
    })

    // Generate AI reply
    const reply = await generateReply(history, text, customerName)

    // Save the AI reply
    await saveMessage({
      phone_number: from,
      customer_name: customerName,
      role: 'assistant',
      content: reply,
    })

    // Send reply back to customer
    await sendWhatsAppMessage(phoneNumberId, from, reply)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    // Still return 200 so Meta doesn't retry
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}
