import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser ? 'bg-[#00F0A0]/20' : 'bg-[#00E5FF]/20'
          }`}
        >
          {isUser ? (
            <span className="text-xs font-bold text-[#00F0A0]">You</span>
          ) : (
            <Zap size={14} className="text-[#00E5FF]" />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-[#00E5FF]/10 text-[#F0F0F0]'
              : 'rounded-tl-sm bg-[#1A1A1A] text-[#E0E0E0]'
          }`}
          style={
            !isUser
              ? {
                  borderLeft: '2px solid rgba(0, 229, 255, 0.3)',
                }
              : {}
          }
        >
          {/* Simple markdown-like rendering */}
          <div className="whitespace-pre-wrap">
            {message.content.split('\n').map((line, i) => {
              // Bold text **text**
              const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              // Links [text](url)
              const linkLine = boldLine.replace(
                /\[(.*?)\]\((.*?)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#00E5FF] hover:underline">$1</a>'
              )
              // Bullet points
              if (line.startsWith('- ') || line.startsWith('• ')) {
                return (
                  <div key={i} className="ml-4 flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#00E5FF]" />
                    <span dangerouslySetInnerHTML={{ __html: linkLine }} />
                  </div>
                )
              }
              return <div key={i} dangerouslySetInnerHTML={{ __html: linkLine }} />
            })}
          </div>

          {/* Timestamp */}
          <p className="mt-1 text-[10px] text-[#5A5E66]">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
