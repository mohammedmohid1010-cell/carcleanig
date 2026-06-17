import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Message {
  phone_number: string
  customer_name: string | null
  role: string
  content: string
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default async function AdminPage() {
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })

  const all = (messages as Message[]) ?? []

  // Group by phone number
  const convMap = new Map<string, { name: string | null; lastMsg: Message; count: number; unread: number }>()
  for (const msg of all) {
    if (!convMap.has(msg.phone_number)) {
      convMap.set(msg.phone_number, { name: msg.customer_name, lastMsg: msg, count: 0, unread: 0 })
    }
    const conv = convMap.get(msg.phone_number)!
    conv.count++
    if (msg.role === 'user') conv.unread++
  }

  const conversations = Array.from(convMap.entries())
  const totalCustomers = conversations.length
  const totalMessages = all.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Car Cleaning Admin</h1>
              <p className="text-xs text-gray-500">WhatsApp AI Agent</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
              <div className="text-xs text-gray-500">Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalMessages}</div>
              <div className="text-xs text-gray-500">Messages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No conversations yet</p>
            <p className="text-sm mt-1">Messages will appear here when customers WhatsApp you</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(([phone, conv]) => (
              <Link
                key={phone}
                href={`/admin/chat/${encodeURIComponent(phone)}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-green-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold text-sm">
                      {(conv.name ?? phone).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 truncate">
                        {conv.name ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {timeAgo(conv.lastMsg.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMsg.role === 'assistant' ? '🤖 ' : ''}{conv.lastMsg.content}
                      </p>
                      <span className="ml-2 flex-shrink-0 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                        {conv.count} msgs
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">+{phone}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
