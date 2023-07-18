import { type Message } from 'ai'

import { ChatMessage } from '@/components/chat-message'
import { Separator } from '@/components/ui/separator'
import { IconOpenAI } from './ui/icons'

export interface ChatList {
  messages: Message[]
  isSnowLoading?: boolean
}

export function ChatList({ messages, isSnowLoading }: ChatList) {
  if (!messages.length) {
    return null
  }
  return (
    <>
      <div className="relative mx-auto max-w-2xl px-4">
        {messages.map((message, index) => (
          <div key={index}>
            <ChatMessage message={message} />
            {index < messages.length - 1 && (
              <Separator className="my-4 md:my-8" />
            )}

          </div>
        ))}
        {isSnowLoading && (
          <div className="group relative mb-4 flex items-center md:-ml-12">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow">
              <IconOpenAI />
            </div>
            <div className="ml-4 flex items-center">
              <div className="h-2 w-2 animate-ping rounded-full bg-green-600" />
              <span className="ml-2 text-sm text-gray-400">thinking...</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
