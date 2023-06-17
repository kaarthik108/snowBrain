import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "../utils/pinecone-client";

const PINECONE_INDEX_NAME = "test-index";

const QA_PROMPT = ` You're an AI assistant who can guide people to make data analysis easier. You are a helpful data analyst specialized in snowflake database. Answer user queries and be interactive and chill. Also if you write any code ased on the following question give a one or two sentences about how did you arrive at that code. (do not assume anything if the column is not available, do not make up code). ALSO if you are asked to FIX the sql code, then look what was the error and try to fix that by searching the schema definition.
If you don't know the answer, just say "Hmm, I'm not sure. Please try again." Don't try to make up an answer.
ALWAYS answer in Markdown format.

{chat_history}

Question: {question}
{context}

Answer:
 `;

const index = pinecone.Index(PINECONE_INDEX_NAME);
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
  }),
  {
    pineconeIndex: index,
    textKey: "text",
    // namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
  }
);

export const Chain = async (question: string, history: []) => {
  const encoder = new TextEncoder();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const model = new ChatOpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
    openAIApiKey: process.env.OPENAI_API_KEY ?? "",
    streaming: true,
    callbacks: [
      {
        async handleLLMNewToken(token) {
          await writer.ready;
          await writer.write(encoder.encode(`${token}`));
        },
        async handleLLMEnd() {
          await writer.ready;
          await writer.close();
        },
      },
    ],
  });
  const fasterModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
  });
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    inputKey: "question",
    outputKey: "text",
    returnMessages: true,
  });
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      memory: memory,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
      questionGeneratorChainOptions: {
        llm: fasterModel,
      },
    }
  );

  chain.call({
    question: question,
    chat_history: history ?? [],
  });
  return stream.readable;
};
