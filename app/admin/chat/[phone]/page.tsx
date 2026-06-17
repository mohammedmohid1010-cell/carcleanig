import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Message {
  id: string
  phone_number: string
  customer_name: string | null
  role: string
  content: string
  created_at: string
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

export default async function ChatPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params
  const phoneNumber = decodeURIComponent(phone)

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: true })

  const all = (messages as Message[]) ?? []
  const customerName = all.find(m => m.customer_name)?.customer_name ?? 'Unknown'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600">
            ← Back
          </Link>
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 font-semibold">
              {customerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{customerName}</div>
            <div className="text-xs text-gray-500">+{phoneNumber}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-6 space-y-3">
        {all.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                  : 'bg-green-500 text-white rounded-tr-none'
              }`}
            >
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-gray-400' : 'text-green-100'}`}>
                {msg.role === 'assistant' ? '🤖 AI · ' : ''}{formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}

        {all.length === 0 && (
          <div className="text-center text-gray-400 py-20">No messages found</div>
        )}
      </div>
    </div>
  )
}
