import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Zap, Mail, Loader2 } from 'lucide-react'
import ChatMessage from './ChatMessage'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_ACTIONS = [
  { label: 'Latest Signals', prompt: 'What are the latest trading signals?' },
  { label: 'My Credits', prompt: 'How do credits work and how many do I have?' },
  { label: 'Risk Tips', prompt: 'Give me 3 risk management tips for trading' },
]

const SUPPORT_EMAIL = 'info@tabsphere.co.uk'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm SignalVault AI. Ask me about trading signals, market analysis, or how credits work. I cost 1 credit per message.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [credits, setCredits] = useState(5)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get userId from localStorage or auth context
      const userId = localStorage.getItem('sv_user_id') || 'anonymous'
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sv_token') || ''}`,
          },
          body: JSON.stringify({ message: content.trim(), userId }),
        }
      )

      const data = await response.json()

      if (data.error) {
        if (data.needsCredits) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `You've run out of credits. [Buy more credits](/credits) to keep chatting.`,
              timestamp: new Date(),
            },
          ])
        } else {
          throw new Error(data.error)
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          },
        ])
        if (data.creditsRemaining !== undefined) {
          setCredits(data.creditsRemaining)
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting. Please try again or email [info@tabsphere.co.uk](mailto:info@tabsphere.co.uk) for support.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #00E5FF, #00F0A0)',
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isOpen ? (
          <X size={24} className="text-[#050505]" />
        ) : (
          <MessageCircle size={24} className="text-[#050505]" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-[#222222] bg-[#111111] shadow-2xl"
            style={{
              width: '400px',
              maxWidth: 'calc(100vw - 48px)',
              height: '600px',
              maxHeight: 'calc(100vh - 120px)',
              boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 229, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b border-[#222222] px-4 py-3"
              style={{
                background: 'linear-gradient(90deg, rgba(0,229,255,0.1), rgba(0,240,160,0.05))',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5FF]/20">
                  <Zap size={16} className="text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F0F0F0]">SignalVault AI</p>
                  <p className="text-[11px] text-[#5A5E66]">Trading Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-[#1A1A1A] px-2 py-1 text-[11px] text-[#00E5FF]">
                  <Zap size={10} />
                  {credits} cr
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-start gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5FF]/20">
                    <Zap size={14} className="text-[#00E5FF]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-[#1A1A1A] px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#5A5E66]"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#5A5E66]"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-[#5A5E66]"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {!isLoading && messages.length < 3 && (
              <div className="border-t border-[#222222] px-4 py-2">
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="rounded-full border border-[#333333] bg-[#1A1A1A] px-3 py-1.5 text-[11px] text-[#8A8F98] transition-all hover:border-[#00E5FF]/30 hover:text-[#00E5FF]"
                    >
                      {action.label}
                    </button>
                  ))}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="flex items-center gap-1 rounded-full border border-[#333333] bg-[#1A1A1A] px-3 py-1.5 text-[11px] text-[#8A8F98] transition-all hover:border-[#00E5FF]/30 hover:text-[#00E5FF]"
                  >
                    <Mail size={10} />
                    Support
                  </a>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-[#222222] p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about signals, markets, credits..."
                  className="flex-1 rounded-xl bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#F0F0F0] placeholder-[#5A5E66] outline-none transition-all focus:ring-1 focus:ring-[#00E5FF]/30"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5FF] text-[#050505] transition-all disabled:opacity-30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-[#5A5E66]">
                1 credit per message •{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#00E5FF] hover:underline">
                  Email Support
                </a>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
