import { Database } from '@/lib/db_types'
import { nanoid } from '@/lib/utils'
import { supabaseClient } from '@/utils/supabaseClient'
import { auth } from '@clerk/nextjs'
import { LangChainStream, Message, StreamingTextResponse } from 'ai'
import { CallbackManager } from 'langchain/callbacks'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAI } from 'langchain/llms/openai'
import { ChatMessageHistory } from 'langchain/memory'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { initPinecone } from 'utils/pinecone-client'
import { CONDENSE_QUESTION_PROMPT, QA_PROMPT } from 'utils/prompts'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { getToken, userId } = auth()
  const supabaseAccessToken = await getToken({ template: 'supabase' })
  const supabase = await supabaseClient(supabaseAccessToken as string)
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }
  try {
    const json = await req.json()
    console.log('Request JSON:', json)

    const { messages } = json
    const vectorStore = await initPinecone()
    const id = json.id ?? nanoid()
    const { stream, handlers } = LangChainStream()

    const model = new ChatOpenAI({
      temperature: 0.5,
      modelName: 'gpt-3.5-turbo-16k',
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
      maxTokens: 1000,
      callbacks: CallbackManager.fromHandlers(handlers)
    })
    const qamodel = new OpenAI({
      modelName: 'gpt-3.5-turbo-16k',
      temperature: 0.1,
      maxTokens: 1000
    })

    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      {
        qaTemplate: QA_PROMPT,
        questionGeneratorChainOptions: {
          llm: qamodel,
          template: CONDENSE_QUESTION_PROMPT
        }
      }
    )
    const question = messages[messages.length - 1].content

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

        try {
          console.log('Payload for supabase:', payload)
          const { error } = await supabase
            .from('chats')
            .upsert({ id, user_id: userId, payload })
          if (error) {
            console.error('Error from supabase:', error.message)
            throw error
          }
        } catch (error) {
          console.error('Supabase write error:', error)
        }
      })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in POST function:', error)
    throw error
  }
}
