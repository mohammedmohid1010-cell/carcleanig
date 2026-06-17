const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0'

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  message: string
): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN

  const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('WhatsApp send error:', error)
    throw new Error(`WhatsApp API error: ${response.status}`)
  }
}

export function extractMessageData(body: WhatsAppWebhookBody): IncomingMessage | null {
  try {
    const entry = body.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    if (!value?.messages?.[0]) return null

    const message = value.messages[0]
    if (message.type !== 'text') return null

    return {
      phoneNumberId: value.metadata.phone_number_id,
      from: message.from,
      text: message.text.body,
      customerName: value.contacts?.[0]?.profile?.name ?? null,
      messageId: message.id,
    }
  } catch {
    return null
  }
}

export interface IncomingMessage {
  phoneNumberId: string
  from: string
  text: string
  customerName: string | null
  messageId: string
}

export interface WhatsAppWebhookBody {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: { name: string }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text: { body: string }
        }>
      }
      field: string
    }>
  }>
}
