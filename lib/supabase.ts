import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Message {
  id?: string
  phone_number: string
  customer_name: string | null
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export async function getConversationHistory(phoneNumber: string, limit = 10): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching history:', error)
    return []
  }

  return data as Message[]
}

export async function saveMessage(message: Omit<Message, 'id' | 'created_at'>) {
  const { error } = await supabase.from('messages').insert(message)
  if (error) {
    console.error('Error saving message:', error)
  }
}
