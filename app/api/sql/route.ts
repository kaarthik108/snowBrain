import { rateLimiter } from '@/lib/rate-limiter'
import { nanoid } from '@/lib/utils'
import { supabaseClient } from '@/utils/supabaseClient'
import { auth } from '@clerk/nextjs'
import { LangChainStream, Message, StreamingTextResponse } from 'ai'
import { CallbackManager } from 'langchain/callbacks'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAI } from 'langchain/llms/openai'
import { BufferMemory, ChatMessageHistory } from 'langchain/memory'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { NextResponse } from 'next/server'
import { initPinecone } from 'utils/pinecone-client'
import { CONDENSE_QUESTION_PROMPT, QA_PROMPT } from 'utils/prompts'

export const runtime = 'edge'

export async function POST(req: Request): Promise<Response> {
  if (process.env.NODE_ENV != 'development') {
    const ip = req.headers.get('x-forwarded-for')
    const { success, limit, reset, remaining } = await rateLimiter.limit(
      `snowbrain_ratelimit_${ip}`
    )

    if (!success) {
      return new Response('You have reached your request limit for the day.', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      })
    }
  }

  const { getToken, userId } = auth()
  const supabaseAccessToken = await getToken({
    template: 'supabase'
  })
  const supabase = await supabaseClient(supabaseAccessToken as string)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const json = await req.json()

    const { messages } = json
    const vectorStore = await initPinecone()
    const id = json.id ?? nanoid()
    const { stream, handlers } = LangChainStream()

    if (messages.length > 25) {
      return NextResponse.json({
        error: 'Too many messages, please use new chat..'
      })
    }

    const model = new ChatOpenAI({
      temperature: 0.1,
      modelName: 'gpt-3.5-turbo-16k',
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
      maxTokens: 1000,
      callbacks: CallbackManager.fromHandlers(handlers)
    })
    const qamodel = new OpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1,
      maxTokens: 1000
    })
    const history = new ChatMessageHistory(
      messages.map((m: Message) => {
        if (m.role === 'user') {
          return new HumanMessage(m.content)
        }
        if (m.role === 'system') {
          return new SystemMessage(m.content)
        }
        return new AIMessage(m.content)
      })
    )
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      {
        qaTemplate: QA_PROMPT,
        questionGeneratorChainOptions: {
          llm: qamodel,
          template: CONDENSE_QUESTION_PROMPT
        },
        memory: new BufferMemory({
          memoryKey: 'chat_history',
          humanPrefix:
            "You are a good assistant that answers question based on the document info you have. If you don't have any information just say I don't know.",
          inputKey: 'question',
          outputKey: 'text',
          returnMessages: true,
          chatHistory: history
        })
      }
    )
    const question = messages[messages.length - 1].content

    let completion: any
    chain
      .call({
        question: question,
        chat_history: history
      })
      .then(result => {
        completion = result
      })
      .catch(console.error)
      .finally(async () => {
        handlers.handleChainEnd()

        const title = messages[0].content.substring(0, 100)
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          title,
          userId,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: completion.text,
              role: 'assistant'
            }
          ]
        }

        await supabase
          .from('chats')
          .upsert({ id, user_id: userId, payload })
          .throwOnError()
      })

    return new StreamingTextResponse(stream)
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong, please try again..' },
      { status: 500 }
    )
  }
}
