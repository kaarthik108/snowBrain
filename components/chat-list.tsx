import { type Message } from 'ai'

import { ChatMessage } from '@/components/chat-message'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { IconOpenAI } from './ui/icons'

export interface ChatList {
  messages: Message[]
  isLoading?: boolean
}

export function ChatList({ messages, isLoading }: ChatList) {
  if (!messages.length) {
    return null
  }
  return (
    <>
      <div className="relative mx-auto max-w-2xl px-4">
        {messages.map((message, index) => (
          <div key={index}>
            <ChatMessage message={message} isLoading={isLoading} />
            {index < messages.length - 1 && (
              <Separator className="my-4 md:my-8" />
            )}
          </div>
        ))}
      </div>
    </>
  )
}
