import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key vars missing')
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? ''
const PINECONE_NAME_SPACE = 'snowbrain'

export async function initPinecone() {
  const emb = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? '',
    modelName: 'text-embedding-3-small',
    dimensions: 512
  })

  try {
    const pinecone = new Pinecone()

    // await pinecone.init({
    //   environment: process.env.PINECONE_ENVIRONMENT ?? '',
    //   apiKey: process.env.PINECONE_API_KEY ?? ''
    // })
    const index = pinecone.Index(PINECONE_INDEX_NAME)
    const vectorStore = await PineconeStore.fromExistingIndex(emb, {
      pineconeIndex: index,
      textKey: 'text',
      namespace: PINECONE_NAME_SPACE
    })

    return vectorStore
  } catch (error) {
    throw new Error('Failed to initialize Pinecone Client')
  }
}
