import { RetrievalQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from 'langchain/prompts'
import { initPinecone } from 'utils/pinecone-client'
import { CODE_PROMPT } from 'utils/prompts'

export const runtime = 'edge'

const q_prompt = PromptTemplate.fromTemplate(CODE_PROMPT)

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const vectorStore = await initPinecone()

  const model = new ChatOpenAI({
    temperature: 0.6,
    modelName: 'gpt-4',
    maxTokens: 800,
    openAIApiKey: process.env.OPENAI_API_KEY,
    streaming: false
  })

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: q_prompt
  })

  const res = await chain.call({
    query: prompt
  })

  return new Response(JSON.stringify(res), {
    headers: {
      'content-type': 'application/json;charset=UTF-8'
    }
  })
}
