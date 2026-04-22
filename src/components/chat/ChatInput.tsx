import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-3 border-t border-zinc-800 bg-zinc-950">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? '正在分析...' : '问我任何问题...'}
        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-500 disabled:opacity-40 transition-colors"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="w-8 h-8 rounded-full bg-[#1bff1b] flex items-center justify-center disabled:opacity-30 disabled:bg-zinc-700 transition-all active:scale-95"
      >
        <Send size={14} className="text-black" />
      </button>
    </div>
  )
}
