'use client'

import { useChat, type Message } from 'ai/react'

import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { cn } from '@/lib/utils'
import { extractPythonCode, extractSqlCode, snow } from '@/utils/fetchHelpers'
import { _defaultpayload } from '@/utils/initialChat'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {

  const [pythonCode, setPythonCode] = useState('')
  const [sqlCode, setSqlCode] = useState('')
  const [isSnowLoading, setIsSnowLoading] = useState(false)
  const [shouldExecuteSnow, setShouldExecuteSnow] = useState(false)
  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    setMessages
  } = useChat({
    api: '/api/sql',
    initialMessages,
    id,
    body: {
      id,
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText)
      }
    },
    onFinish(response) {
      let extractedPythonCode = extractPythonCode(response.content)
      let extractedSqlCode = extractSqlCode(response.content)
      setPythonCode(extractedPythonCode)
      setSqlCode(extractedSqlCode)
      if (extractedPythonCode || extractedSqlCode) setShouldExecuteSnow(true)
    }
  })

  useEffect(() => {
    if (shouldExecuteSnow) {
      setIsSnowLoading(true)
      snow(pythonCode, sqlCode, messages).then(newContent => {
        if (typeof newContent === 'string') {
          let newMessage: Message = {
            id: messages.length ? messages[messages.length - 1].id : nanoid(),
            content: newContent,
            role: 'assistant'
          }
          let newMessages = [...messages, newMessage]
          setMessages(newMessages)
          setIsSnowLoading(false)
        }
      })
      setShouldExecuteSnow(false)
    }
  }, [shouldExecuteSnow, pythonCode, sqlCode])

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} isLoading={isSnowLoading} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <ChatList messages={_defaultpayload} isLoading={false} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />
    </>
  )
}
