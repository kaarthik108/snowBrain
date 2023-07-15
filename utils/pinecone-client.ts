import { PineconeClient } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key vars missing')
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? ''
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE ?? ''

export async function initPinecone() {
  try {
    const pinecone = new PineconeClient()

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? '',
      apiKey: process.env.PINECONE_API_KEY ?? ''
    })
    const index = pinecone.Index(PINECONE_INDEX_NAME)
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY ?? ''
      }),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE
      }
    )

    return vectorStore
  } catch (error) {
    throw new Error('Failed to initialize Pinecone Client')
  }
}
