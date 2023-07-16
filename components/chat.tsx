'use client'

import { useChat, type Message } from 'ai/react'

import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { cn } from '@/lib/utils'
import { extractPythonCode, extractSqlCode, snow } from '@/utils/fetchHelpers'
import { _defaultpayload } from '@/utils/initialChat'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from './ui/button'
import { Input } from './ui/input'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [pythonCode, setPythonCode] = useState('')
  const [sqlCode, setSqlCode] = useState('')
  const [isSnowLoading, setIsSnowLoading] = useState(false)
  const [shouldExecuteSnow, setShouldExecuteSnow] = useState(false)
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
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
      previewToken
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

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
